"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //check if table is empty
    const companies = await queryInterface.sequelize.query(
      `SELECT * FROM Companies`
    );

    if (companies[0].length > 0) {
      return;
    }
    await queryInterface.bulkInsert(
      "Companies",
      [
        {
          id: 1,
          name: "اسياسيل",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "زين",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "كورك",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // حذف البيانات عند التراجع
    await queryInterface.bulkDelete("Companies", null, {});
  },
};
