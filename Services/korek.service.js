const portUtils = require("../utils/portIUtils");
const serverUtils = require("../utils/serverUtils");
/*


it's in ((development mode)) right now


*/
const recharges = async ({ phone, amount, type, companyID }) => {
  switch (type) {
    case "E-TopUp":
      const port = await portUtils.choosePort(companyID, amount);
      if (!port) {
        return null;
      }
      return await ETopUpRecharge({ phone, amount });
    default:
      return null;
  }
};

const ETopUpRecharge = async ({ phone, amount, port }) => {
  const queryParam = {
    host: port.host,
    port: port.port,
    portNumber: port.portNumber,
    username: port.username,
    password: port.password,
    ussd: "*602*1*" + phone + "*" + amount + "*" + port.simPassword + "*1#",
  };

  const response = await serverUtils.sendUssd(queryParam);

  const responseMessage = response.data;
  const pattern =
    /The transaction number R\d{8}\.\d{4}\.\d{6} to top-up \d+ IQD to \d+ has done successfully. Your current balance is \d+ IQD\./;

  if (pattern.test(responseMessage)) {
    return "Recharge Successful";
  } else {
    return "Recharge Failed";
  }
};

module.exports = {
  recharges,
};
