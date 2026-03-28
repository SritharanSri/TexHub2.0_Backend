const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderImage = sequelize.define('OrderImage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'orders', key: 'id' },
    },
    imageType: {
      type: DataTypes.ENUM('reference', 'design'),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  }, {
    tableName: 'order_images',
    timestamps: true,
    updatedAt: false,
  });

  return OrderImage;
};
