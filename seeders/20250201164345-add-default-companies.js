"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
