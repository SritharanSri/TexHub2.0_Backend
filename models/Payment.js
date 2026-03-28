const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
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
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM('bank_deposit', 'card'),
      allowNull: false,
    },
    slipImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    depositorName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    depositDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cardLast4: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending_verification', 'approved', 'rejected'),
      defaultValue: 'pending_verification',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
  });

  return Payment;
};
