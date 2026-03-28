const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Escrow = sequelize.define('Escrow', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'orders', key: 'id' },
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'payments', key: 'id' },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tailorAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('held', 'released', 'refunded'),
      defaultValue: 'held',
    },
    releasedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'escrows',
    timestamps: true,
  });

  return Escrow;
};
