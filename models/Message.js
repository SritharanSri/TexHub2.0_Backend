const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Message extends Model {
    static associate(models) {
      // define association here if needed, but we do it in index.js
    }
  }
  Message.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'orderId',
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'senderId',
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'receiverId',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'isRead',
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
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    underscored: false,
    timestamps: true,
  });
  return Message;
};
