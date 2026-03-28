'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      orderId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      customerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      method: { type: Sequelize.ENUM('bank_deposit', 'card'), allowNull: false },
      slipImage: { type: Sequelize.STRING(500), allowNull: true },
      bankName: { type: Sequelize.STRING(100), allowNull: true },
      depositorName: { type: Sequelize.STRING(100), allowNull: true },
      depositDate: { type: Sequelize.DATEONLY, allowNull: true },
      referenceNumber: { type: Sequelize.STRING(100), allowNull: true },
      cardLast4: { type: Sequelize.STRING(4), allowNull: true },
      status: { type: Sequelize.ENUM('pending_verification', 'approved', 'rejected'), defaultValue: 'pending_verification' },
      rejectionReason: { type: Sequelize.TEXT, allowNull: true },
      verifiedBy: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      verifiedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
