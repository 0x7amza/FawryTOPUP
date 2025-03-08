const db = require("../Models");
const rechargeService = require("../Services/recharge.service");

const getAll = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  const recharges = await db.Recharge.findAll({
    limit,
    offset,
  });

  res.send(recharges);
};

const get = async (req, res) => {
  const recharge = await db.Recharge.findOne({
    RequestId: req.params.RequestId,
  });
  res.send(recharge);
};

const recharge = async (req, res) => {
  const { RequestId, PhoneNumber, Amount, portID } = req.body;
  if (!RequestId || !PhoneNumber || !Amount || !portID) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const checkID = await db.Recharge.findOne({
    where: { RequestId },
  });
  if (checkID) {
    return res.status(200).json({ recharge: checkID });
  }
  const port = await db.Ports.findByPk(portID, {
    include: [{ model: db.Company }, { model: db.Server }],
  });
  if (!port) {
    return res.status(400).json({ error: "Invalid portID" });
  }

  await db.Recharge.create({
    RequestId,
    phoneNumber: PhoneNumber,
    amount: Amount,
    companyID: port.companyID,
    type: port.type,
    status: "pending",
    PIN: null,
    portID,
    serial: null,
  });
  const response = await rechargeService.recharge({
    PhoneNumber,
    Amount,
    port,
  });

  if (response.success) {
    await db.Recharge.update(
      {
        response: response.result,
        status: "success",
        serial: response.data.transactionNumber
          ? response.data.transactionNumber
          : null,
      },
      { where: { RequestId } }
    );
    await db.Ports.update(
      {
        balance: response.data.currentBalance
          .replaceAll(",", "")
          .replace(".000", ""),
      },
      { where: { id: response.data.portID } }
    );
  } else {
    await db.Recharge.update(
      {
        response: response.result,
        status: "failed",
      },
      { where: { RequestId } }
    );
  }

  const recharge = await db.Recharge.findOne({
    where: { RequestId },
  });
  var statuscode = 200;
  if (recharge.status === "failed") {
    statuscode = 500;
  } else if (recharge.status === "pending") {
    statuscode = 202;
  }
  res.status(statuscode).json(recharge);
};

module.exports = {
  getAll,
  get,
  recharge,
};
