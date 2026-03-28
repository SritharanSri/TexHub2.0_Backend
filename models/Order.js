const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'customerId',
    },
    tailorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'tailorId',
    },
    orderNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'orderNumber',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    clothType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'clothType',
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    measurements: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    material: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    deliveryOption: {
      type: DataTypes.ENUM('standard', 'express', 'custom'),
      defaultValue: 'standard',
      field: 'deliveryOption',
    },
    customDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'customDate',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    designImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'designImage',
    },
    status: {
      type: DataTypes.ENUM(
        'pending_quotation', 'quotation_received', 'payment_pending',
        'confirmed', 'in_work', 'dispatched', 'delivered', 'cancelled'
      ),
      defaultValue: 'pending_quotation',
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    quotationAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'quotationAmount',
    },
    quotationDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'quotationDeliveryDate',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt'
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: false,
  });

  return Order;
};
