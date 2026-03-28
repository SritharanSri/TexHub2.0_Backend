'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      password: { type: Sequelize.STRING(255), allowNull: true },
      role: { type: Sequelize.ENUM('customer', 'tailor', 'admin'), allowNull: false },
      avatar: { type: Sequelize.STRING(500), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      googleId: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      isSuspended: { type: Sequelize.BOOLEAN, defaultValue: false },
      isEmailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
