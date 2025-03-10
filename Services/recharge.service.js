const Asiacell = require("./asiacell.service");
const Zain = require("./zain.service");
const Korek = require("./korek.service");

const recharge = async ({ PhoneNumber, Amount, port }) => {
  try {
    switch (port.Company.name) {
      case "اسياسيل":
        return Asiacell.recharges({ phone: PhoneNumber, amount: Amount, port });
      case "زين":
        return Zain.recharges({ phone: PhoneNumber, amount: Amount, port });
      case "كورك":
        return Korek.recharges({ phone: PhoneNumber, amount: Amount, port });
      default:
        return { success: false, message: "Invalid company" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = { recharge };
