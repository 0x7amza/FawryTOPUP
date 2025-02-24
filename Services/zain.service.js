const db = require("../Models");
const portUtils = require("../utils/portIUtils");
const serverUtils = require("../utils/serverUtils");
const zainSmsResponses = new Map();

const recharges = async ({ phone, amount, type, companyID, PIN }) => {
  console.log(type);

  switch (type) {
    case "TopUp":
      var port = await portUtils.choosePort(companyID, amount, type);
      if (!port) {
        return "Recharge Failed";
      }
      return await ETopUpRecharge({ phone, amount, port });
    case "gift":
      return await GiftRecharge({ phone, PIN, companyID });
    default:
      return "Recharge Failed";
  }
};

const ETopUpRecharge = async ({ phone, amount, port }) => {
  const sendSms = await serverUtils.sendSms({
    phone,
    amount,
    portNumber: port.portNumber,
    sms: `${phone} ${amount}`,
    to: "2026",
    port: port.Server.port,
    host: port.Server.host,
    username: port.Server.username,
    password: port.Server.password,
  });
  const newPhone = phone.replace(/^./, "964");
  const result = await new Promise((resolve, reject) => {
    zainSmsResponses.set(port.portNumber.toString() + port.id.toString(), {
      resolve,
      reject,
      phone: newPhone,
      amount,
    });
    setTimeout(() => {
      zainSmsResponses.delete(newPhone);
      reject("Recharge Failed");
    }, 60000);
  });

  return result;
};

const webhook = async ({ content, portNumber, portID }) => {
  const cleanMessage = content
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
  const pattern =
    /The number (\d{13}) has been successfully recharged with ([\d,]+\.\d{3}) IQD on (\d{2}\/\d{2}\/\d{2} \d{2}:\d{2} [APM]{2}) Your current balance is ([\d,]+\.\d{3}) IQD.Transaction number ([A-Z0-9]+)/;
  const match = cleanMessage.match(pattern);
  const zainMap = zainSmsResponses.get(
    portNumber.toString() + portID.toString()
  );
  console.log(portNumber.toString() + portID.toString());
  console.log(match);
  console.log(cleanMessage);

  if (match) {
    const phoneNumber = match[1];
    const rechargeAmount = match[2];
    const currentBalance = match[4];
    const transactionNumber = match[5];

    if (zainMap.phone === phoneNumber) {
      zainMap.resolve({
        result: content,
        success: true,
        data: {
          phone: zainMap.phone,
          amount: zainMap.amount,
          currentBalance: currentBalance,
          transactionNumber: transactionNumber,
          portID,
        },
      });
      await portUtils.endProcess({ portID });
      return "Recharge Successful";
    }
    return "Recharge Successful";
  } else {
    const balancePattern = /your available balance is ([\d,]+\.\d{3}) IQD/;
    const match = cleanMessage.match(balancePattern);
    if (match) {
      const availableBalance = match[1].replaceAll(",", "").replace(".000", "");
      await db.Ports.update(
        { availableBalance: availableBalance },
        { where: { portNumber: portNumber } }
      );
      return "";
    } else {
      zainMap.resolve({
        result: content,
        success: false,
        data: {
          amount: zainMap.amount,
          phone: zainMap.phone,
          portID,
        },
      });
      await portUtils.endProcess({ portID: portID });
      return "Recharge Failed";
    }
  }
};

const GiftRecharge = async ({ PIN, phone, companyID }) => {
  let port = await db.Ports.findOne({
    where: {
      status: "active",
      companyID,
    },
    order: [["processingCount", "ASC"]],
    include: {
      model: db.Server,
      where: {
        status: "active",
      },
    },
  });

  const sendTheGift = await serverUtils.sendUssd({
    port: port.Server.port,
    host: port.Server.host,
    username: port.Server.username,
    password: port.Server.password,
    ussd: "*101#" + PIN + "#" + phone + "#",
  });
  if (!sendTheGift.resp) {
    return {
      success: false,
      result: "Recharge Failed",
      data: {
        phone,
        amount,
        portID: port.id,
      },
    };
  }
  const responseMessage = response.resp;
  if (responseMessage.includes("تمت عملية التعبئة")) {
    return {
      result: responseMessage,
      success: true,
    };
  } else {
    return {
      result: responseMessage,
      success: false,
    };
  }
};

module.exports = { recharges, webhook };
