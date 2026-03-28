const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TailorProfile = sequelize.define('TailorProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
    },
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shopName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    shopAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shopPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    nicNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    nicFront: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    nicBack: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    verificationNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avgRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
    totalRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'tailor_profiles',
    timestamps: true,
  });

  return TailorProfile;
};
