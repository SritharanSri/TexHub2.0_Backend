const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quotation = sequelize.define('Quotation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'orders', key: 'id' },
      field: 'orderId',
    },
    tailorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'tailorId',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'deliveryDate',
    },
    deliveryMethod: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'deliveryMethod',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending',
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
    tableName: 'quotations',
    timestamps: true,
    underscored: false,
    indexes: [
      { unique: true, fields: ['orderId', 'tailorId'] },
    ],
  });

  return Quotation;
};
