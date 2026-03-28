const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSetting = sequelize.define('UserSetting', {
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
      onDelete: 'CASCADE',
    },
    // Notifications
    newOrder: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    bidUpdate: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    orderStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    messages: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    marketing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Privacy & Security
    profilePublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    twoFactor: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    activityLog: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Preferences
    darkMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    compactView: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    autoAccept: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'user_settings',
    timestamps: true,
  });

  return UserSetting;
};
