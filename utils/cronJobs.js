const cron = require("node-cron");
const db = require("../Models");
const { Op } = require("sequelize");

cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];

  try {
    await db.Ports.update(
      { dailyRechargeCount: 0 },
      {
        where: {
          updatedAt: { [Op.lt]: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }
    );
    console.log("Daily recharge count reset successfully.");
  } catch (error) {
    console.error("Error resetting daily recharge count:", error);
  }
});
