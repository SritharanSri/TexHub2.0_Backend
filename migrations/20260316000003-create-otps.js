'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otps', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      code: { type: Sequelize.STRING(6), allowNull: false },
      purpose: { type: Sequelize.ENUM('email_verify', 'login_2fa', 'password_reset'), allowNull: false },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      isUsed: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('otps');
  },
};
