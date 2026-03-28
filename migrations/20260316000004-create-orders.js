'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      customerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      tailorId: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      orderNumber: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      category: { type: Sequelize.STRING(100), allowNull: false },
      clothType: { type: Sequelize.STRING(100), allowNull: false },
      size: { type: Sequelize.STRING(10), allowNull: true },
      measurements: { type: Sequelize.JSONB, allowNull: true },
      material: { type: Sequelize.STRING(255), allowNull: true },
      deliveryOption: { type: Sequelize.ENUM('standard', 'express', 'custom'), defaultValue: 'standard' },
      customDate: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      designImage: { type: Sequelize.STRING(500), allowNull: true },
      status: {
        type: Sequelize.ENUM(
          'pending_quotation', 'quotation_received', 'payment_pending',
          'confirmed', 'in_work', 'dispatched', 'delivered', 'cancelled'
        ),
        defaultValue: 'pending_quotation',
      },
      progress: { type: Sequelize.INTEGER, defaultValue: 0 },
      quotationAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      quotationDeliveryDate: { type: Sequelize.DATEONLY, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
