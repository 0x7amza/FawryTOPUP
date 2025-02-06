const db = require("../Models");
const { Op } = require("sequelize");

const queue = [];

const checkPort = async (companyID, amount, type) => {
  let port = await db.Ports.findOne({
    where: {
      status: "active",
      companyID,
      type,
      dailyRechargeCount: {
        [Op.lt]: db.Sequelize.col("maxDailyRechargeAmount"),
      },
      balance: {
        [Op.gt]: amount,
      },
      [Op.and]: db.Sequelize.literal(
        `maxDailyRechargeAmount - dailyRechargeCount > ${amount}`
      ),
    },
    order: [
      ["processingCount", "ASC"],
      ["balance", "ASC"],
    ],
    include: {
      model: db.Server,
      where: {
        status: "active",
      },
    },
  });

  return port;
};

const choosePort = async (companyID, amount, type) => {
  const port = await checkPort(companyID, amount, type);

  if (port) {
    if (port.processingCount === 0) {
      port.processingCount = 1;
      await port.save();
      return port;
    } else {
      return new Promise((resolve) => {
        queue.push({ resolve, amount, companyID, type });
      });
    }
  } else {
    return null;
  }
};

const checkQueue = async (_companyID, _type) => {
  if (queue.length > 0) {
    const { resolve, amount, companyID, type } = queue.shift();
    if (companyID === _companyID && type === _type) {
      const port = await choosePort(companyID, amount, type);
      if (port) {
        if (port.processingCount === 0) {
          port.processingCount = 1;
          await port.save();
          resolve(port);
        } else {
          queue.push({ resolve, amount, companyID, type });
          checkQueue(companyID);
        }
      } else {
        checkQueue(companyID);
        resolve(null);
      }
    } else {
      queue.push({ resolve, amount, companyID, type });
      checkQueue(_companyID);
    }
  }
};

const endProcess = async ({ portID }) => {
  try {
    await db.Ports.update(
      {
        processingCount: db.Sequelize.literal("processingCount - 1"),
      },
      {
        where: {
          id: portID,
        },
      }
    );

    const port = await db.Ports.findOne({ where: { id: portID } });
    const companyID = port.companyID;
    const type = port.type;
    checkQueue(companyID, type);
  } catch (error) {
    console.error("Error in endProcess:", error);
  }
};

module.exports = {
  choosePort,
  endProcess,
};
