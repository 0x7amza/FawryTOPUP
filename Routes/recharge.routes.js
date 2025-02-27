const express = require("express");
const router = express.Router();
const db = require("../Models");
const rechargeService = require("../Services/recharge.service");

router.post("/", async (req, res) => {
  const { RequestId, PhoneNumber, Amount, CompanyId, Type, PIN, serial } =
    req.body;

  if (
    !RequestId ||
    !PhoneNumber ||
    !Amount ||
    !CompanyId ||
    !Type ||
    (Type === "gift" && !PIN && !serial)
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const checkID = await db.Recharge.findOne({
    where: { RequestId },
  });
  if (checkID) {
    return res.status(200).json({ recharge: checkID });
  }

  await db.Recharge.create({
    RequestId,
    phoneNumber: PhoneNumber,
    amount: Amount,
    companyID: CompanyId,
    type: Type,
    status: "pending",
    PIN: PIN || null,
    portID: null,
    serial: serial || null,
  });
  const response = await rechargeService.recharge({
    PhoneNumber,
    Amount,
    CompanyId: CompanyId,
    Type,
    PIN,
  });

  if (response.success) {
    if (Type != "gift") {
      await db.Recharge.update(
        {
          response: response.result,
          status: "success",
          serial: response.data.transactionNumber,
          portID: response.data.portID,
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
          status: "success",
        },
        { where: { RequestId } }
      );
    }
  } else {
    if (response.data) {
      await db.Recharge.update(
        {
          response: response.result,
          status: "failed",
          portID: response.data.portID,
        },
        { where: { RequestId } }
      );
    } else {
      await db.Recharge.update(
        {
          response: response.result,
          status: "failed",
          portID: null,
        },
        { where: { RequestId } }
      );
    }
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
});

module.exports = router;
