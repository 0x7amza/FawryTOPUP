const Asiacell = require("../Services/asiacell.service");
const Zain = require("../Services/zain.service");
const korek = require("../Services/korek.service");
const db = require("../Models");

/**
 * Recharge the phone number with the given amount.
 * @param {string} phone The phone number to recharge.
 * @param {number} amount The amount to recharge.
 * @param {number} companyID The ID of the company (1 for Asiacell, 2 for Zain and 3 for Korek).
 * @returns {Promise<object>} The response object.
 */
const recharge = async ({ PhoneNumber, Amount, port }) => {
  const Company = port.Company;

  switch (Company.name) {
    case "اسياسيل":
      return await Asiacell.recharges({
        phone: PhoneNumber,
        amount: Amount,
        port,
      });
    case "زين":
      return await Zain.recharges({
        phone: PhoneNumber,
        amount: Amount,
        port,
      });
    case "كورك":
      return await korek.recharges({
        phone: PhoneNumber,
        amount: Amount,
        port,
      });
    default:
      return null;
  }
};

module.exports = {
  recharge,
};
