const db = require("../Models");
const portUtils = require("../utils/portIUtils");
const serverUtils = require("../utils/serverUtils");

const recharges = async ({ phone, amount, port }) => {
  switch (port.type.toLowerCase()) {
    case "gb":
      return await GBRecharge({ phone, amount, port });
    case "topup":
      return await ETopUpRecharge({ phone, amount, port });
    default:
      return null;
  }
};

const GBRecharge = async ({ phone, amount, port }) => {
  const queryParam = {
    host: port.Server.host,
    ServerPort: port.Server.port,
    portNumber: port.portNumber,
    username: port.Server.username,
    password: port.Server.password,
    ussd: "*123*" + amount + "*" + phone + "*1#",
  };

  const response = await serverUtils.sendUssd(queryParam);
  if (!response.resp) {
    await portUtils.endProcess({ portID: port.id });
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

  const responseMessage = response.resp
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  const pattern =
    /(\d+) IQD has been transferred from your account to (\d+) on (\d{2}\/\d{2}\/\d{4})\.?(\d+) IQD has been deducted from your account as a transaction fee\./;

  const match = responseMessage.match(pattern);

  if (match) {
    const [fullMessage, transactionFee] = match;
    await portUtils.endProcess({ portID: port.id });
    return {
      result: fullMessage,
      success: true,
      data: {
        phone,
        amount,
        balance: port.balance - amount - transactionFee,
        transactionNumber: "GB-" + Math.floor(100000 + Math.random() * 900000), //random number
        portID: port.id,
      },
    };
  } else {
    await portUtils.endProcess({ portID: port.id });
    return {
      success: false,
      result: response.resp,
      data: {
        phone,
        amount,
        portID: port.id,
      },
    };
  }
};

const ETopUpRecharge = async ({ phone, amount, port }) => {
  const queryParam = {
    host: port.host,
    port: port.port,
    portNumber: port.portNumber,
    username: port.username,
    password: port.password,
    ussd:
      "*322*134*" +
      port.simPassword +
      "*1*" +
      amount +
      "*" +
      phone +
      "*" +
      phone +
      "#",
  };
  const response = await serverUtils.sendUssd(queryParam);

  if (!response.resp) {
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
  const responseMessage = response.resp
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  const pattern =
    /Recharging subscriber (\d+) with Topup IQD, qty (\d+\.\d+) IQD\. Remaining balance (\d+\.\d+) IQD\. TR id: (\d+)\./;

  const match = responseMessage.match(pattern);
  if (match) {
    const [fullMessage, remainingBalance, transactionId] = match;
    return {
      result: fullMessage,
      success: true,
      data: {
        phone,
        amount,
        balance: remainingBalance.replace(".000", ""),
        transactionNumber: transactionId,
        portID: port.id,
      },
    };
  } else {
    return {
      success: false,
      result: response.resp,
      data: {
        phone,
        amount,
        portID: port.id,
      },
    };
  }
};

const updateBalance = async (port) => {
  let ussd = "*322*125*" + port.simPassword + "*2#";
  if (port.type === "GB") {
    ussd = "*133#";
  }
  const response = await serverUtils.sendUssd({
    host: port.Server.host,
    port: port.Server.port,
    portNumber: port.portNumber,
    username: port.Server.username,
    password: port.Server.password,
    ussd: ussd,
  });

  response.resp = response.resp.replace(".000", "");
  const match = response.resp.match(/([\d,]+)\sIQD/);
  const numberWithoutCommas = match ? match[1].replace(/,/g, "") : null;

  const balance = numberWithoutCommas ? parseInt(numberWithoutCommas) : null;
  if (balance) {
    port.balance = balance;
    await port.save();
    return balance;
  } else {
    return "update balance Failed";
  }
};

module.exports = {
  recharges,
  updateBalance,
};
