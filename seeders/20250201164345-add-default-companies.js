"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // حذف جميع البيانات القديمة
    await queryInterface.bulkDelete("companies", null, {});

    // إدخال البيانات الجديدة
    await queryInterface.bulkInsert(
      "companies",
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
    await queryInterface.bulkDelete("companies", null, {});
  },
};
