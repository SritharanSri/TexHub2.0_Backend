'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ratings', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      orderId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      customerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      tailorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      stars: { type: Sequelize.INTEGER, allowNull: false },
      review: { type: Sequelize.TEXT, allowNull: true },
      latePenaltyApplied: { type: Sequelize.BOOLEAN, defaultValue: false },
      penaltyAmount: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0.00 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ratings');
  },
};
