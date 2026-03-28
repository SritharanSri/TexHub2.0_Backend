'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escrows', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      orderId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      paymentId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'payments', key: 'id' }, onDelete: 'CASCADE' },
      totalAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      platformFee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tailorAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.ENUM('held', 'released', 'refunded'), defaultValue: 'held' },
      releasedAt: { type: Sequelize.DATE, allowNull: true },
      refundedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('escrows');
  },
};
