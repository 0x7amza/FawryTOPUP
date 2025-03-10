const db = require("../Models");
const portUtils = require("../utils/portIUtils");
const serverUtils = require("../utils/serverUtils");
const zainSmsResponses = new Map();

const recharges = async ({ phone, amount, type, companyID, PIN }) => {
  console.log(type);

  switch (port.type.toLowerCase()) {
    case "topup":
      return await ETopUpRecharge({ phone, amount, port });
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
  if (!sendSms.resp) {
    return {
      success: false,
      result: "Recharge Failed",
      data: {
        phone,
        amount,
      },
    };
  }
  const newPhone = phone.replace(/^./, "964");
  const result = await new Promise((resolve, reject) => {
    zainSmsResponses.set(port.portNumber.toString() + port.id.toString(), {
      resolve,
      reject,
      phone: newPhone,
      amount,
    });
    setTimeout(
      () => async () => {
        zainSmsResponses.delete(newPhone);
        const CheckBalance = await updateBalance(port);
        if (CheckBalance !== "update balance Failed") {
          if (CheckBalance < port.balance) {
            resolve("Recharge Successful");
          } else {
            reject("Recharge Failed");
          }
        }
        reject("Recharge Failed");
      },
      60000
    );
  });

  return result;
};
const webhook = async ({ content, portNumber, portID }) => {
  const cleanMessage = content
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  // 1. نمط النجاح (شحن الرصيد)
  const successPattern =
    /The number (\d{13}) has been successfully recharged with ([\d,]+\.\d{3}) IQD on ([\d\/ :APM]+)\. Your current balance is ([\d,]+\.\d{3}) IQD\. Transaction number ([A-Z0-9]+)/i;
  const successMatch = cleanMessage.match(successPattern);

  // 2. نمط الرصيد (المُحدّث ليتقبل صيغًا مختلفة)
  const balancePattern =
    /available balance is (\d{1,3}(?:,\d{3})*(?:\.\d{1,3})?) IQD/i;
  const balanceMatch = cleanMessage.match(balancePattern);

  const zainMap = zainSmsResponses.get(
    portNumber.toString() + portID.toString()
  );

  if (successMatch && zainMap?.phone === successMatch[1]) {
    const [phone, amount, date, currentBalance, transaction] = successMatch;
    const numericBalance = parseFloat(currentBalance.replace(/,/g, "")) || 0;

    await db.Ports.update(
      { balance: numericBalance },
      { where: { portNumber } }
    );

    zainMap.resolve({
      success: true,
      data: {
        phone,
        amount: parseFloat(amount.replace(/,/g, "")),
        balance: numericBalance,
        transaction,
        portID,
      },
    });
    await portUtils.endProcess({ portID });
  } else if (balanceMatch) {
    const balanceValue = balanceMatch[1].replace(/,/g, "").replace(/\.0+$/, "");
    const numericBalance = parseFloat(balanceValue) || 0;

    await db.Ports.update(
      { balance: numericBalance },
      { where: { portNumber } }
    );

    if (zainMap?.updateBalance) {
      zainMap.resolve({ success: true, balance: numericBalance });
    }
  } else {
    // حالة الفشل
    zainMap?.resolve({ success: false, error: "Unknown response format" });
    await portUtils.endProcess({ portID });
  }
};

const updateBalance = async (port) => {
  try {
    const sendSms = await serverUtils.sendSms({
      phone: port.phoneNumber,
      portNumber: port.portNumber,
      sms: "gb",
      to: "2026",
      port: port.Server.port,
      host: port.Server.host,
      username: port.Server.username,
      password: port.Server.password,
    });

    return new Promise((resolve, reject) => {
      zainSmsResponses.set(port.portNumber + port.id.toString(), {
        resolve,
        reject,
        updateBalance: true,
      });

      setTimeout(() => {
        zainSmsResponses.delete(port.portNumber + port.id.toString());
        reject("Update balance timed out");
      }, 60000);
    });
  } catch (error) {
    throw new Error("Failed to update balance");
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
    portNumber: port.portNumber,
    ServerPort: port.Server.port,
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
  const responseMessage = sendTheGift.resp;
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

module.exports = { recharges, webhook, updateBalance };
