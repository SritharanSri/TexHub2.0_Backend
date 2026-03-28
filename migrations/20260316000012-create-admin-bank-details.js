'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_bank_details', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      bankName: { type: Sequelize.STRING(100), allowNull: false },
      accountName: { type: Sequelize.STRING(100), allowNull: false },
      accountNumber: { type: Sequelize.STRING(50), allowNull: false },
      branchName: { type: Sequelize.STRING(100), allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('admin_bank_details');
  },
};
