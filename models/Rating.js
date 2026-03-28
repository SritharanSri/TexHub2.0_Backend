const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rating = sequelize.define('Rating', {
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
    tailorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latePenaltyApplied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    penaltyAmount: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
  }, {
    tableName: 'ratings',
    timestamps: true,
  });

  return Rating;
};
