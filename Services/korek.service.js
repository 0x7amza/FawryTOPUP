const portUtils = require("../utils/portIUtils");
const serverUtils = require("../utils/serverUtils");
const korekSmsResponses = new Map();

// نمط رسالة النجاح (مثال: "The transaction number R12345678.1234.567890 to top-up 5000 IQD to 9647501234567 has done successfully. Your current balance is 10000 IQD.")
const korekSuccessPattern =
  /The transaction number R\d{8}\.\d{4}\.\d{6} to top-up (\d+) IQD to (\d+) has done successfully\. Your current balance is (\d+) IQD/i;

// نمط رسالة الرصيد (مثال: "Your Balance is KT:eTopUP:1000 IQD")
const korekBalancePattern = /KT:eTopUP:([\d,]+(?:\.\d+)?)\sIQD/i;

// دالة الشحن الإلكتروني
const recharges = async ({ phone, amount, port }) => {
  try {
    switch (port.type.toLowerCase()) {
      case "topup":
        return await ETopUpRecharge({ phone, amount, port });
      default:
        return { success: false, message: "Invalid recharge type" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const ETopUpRecharge = async ({ phone, amount, port }) => {
  try {
    const ussdCode = `*602*1*${phone}*${amount}*${port.simPassword}*1#`;
    const response = await serverUtils.sendUssd({
      host: port.Server.host,
      port: port.Server.port,
      portNumber: port.portNumber,
      username: port.Server.username,
      password: port.Server.password,
      ussd: ussdCode,
    });

    if (!response.resp) {
      return {
        success: false,
        result: "Recharge Failed",
        data: {
          phone,
          amount,
        },
      };
    }

    return new Promise((resolve, reject) => {
      korekSmsResponses.set(port.id.toString(), { resolve, reject });

      setTimeout(() => {
        korekSmsResponses.delete(port.id.toString());
        reject("Recharge timed out");
      }, 60000);
    });
  } catch (error) {
    return {
      success: false,
      result: "Recharge Failed - error message : " + error.message,
      data: {
        phone,
        amount,
      },
    };
  }
};

// دالة تحديث الرصيد (via USSD)
const checkBalance = async (port) => {
  try {
    await serverUtils.sendUssd({
      host: port.Server.host,
      port: port.Server.port,
      portNumber: port.portNumber,
      username: port.Server.username,
      password: port.Server.password,
      ussd: "*602*2*25252#",
    });

    await serverUtils.sendUssd({
      host: port.Server.host,
      port: port.Server.port,
      portNumber: port.portNumber,
      username: port.Server.username,
      password: port.Server.password,
      ussd: "1",
    });

    // انتظار نتيجة الرصيد
    return await new Promise((resolve, reject) => {
      korekSmsResponses.set(port.id.toString(), {
        resolve,
        reject,
        isBalanceCheck: true,
      });
      setTimeout(() => {
        korekSmsResponses.delete(port.id.toString());
        reject({ success: false, message: "Balance check timed out" });
      }, 60000);
    });
  } catch (error) {
    throw new Error("Balance check failed");
  }
};

const webhook = async ({ content, portID }) => {
  const cleanMessage = content.normalize("NFKC").trim();
  const responseHandler = korekSmsResponses.get(portID.toString());

  if (!responseHandler) return;

  const successMatch = cleanMessage.match(korekSuccessPattern);
  if (successMatch) {
    const [_, amount, phone, balance] = successMatch;
    responseHandler.resolve({
      success: true,
      data: {
        amount: parseInt(amount),
        phone,
        balance: parseInt(balance),
      },
    });
    korekSmsResponses.delete(portID.toString());
    return;
  }

  const balanceMatch = cleanMessage.match(korekBalancePattern);
  if (balanceMatch) {
    const rawBalance = balanceMatch[1].replace(/,/g, "");
    const numericBalance = parseFloat(rawBalance) || 0;
    responseHandler.resolve({
      success: true,
      data: { balance: numericBalance },
    });
    korekSmsResponses.delete(portID.toString());
    return;
  }

  responseHandler.reject({
    success: false,
    message: "Failed to parse response",
  });
  korekSmsResponses.delete(portID.toString());
};

module.exports = {
  recharges,
  webhook,
  checkBalance,
};
