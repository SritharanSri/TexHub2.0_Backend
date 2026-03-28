const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminBankDetail = sequelize.define('AdminBankDetail', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    accountName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    branchName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'admin_bank_details',
    timestamps: true,
  });

  return AdminBankDetail;
};
