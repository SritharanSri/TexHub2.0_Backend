const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ComplaintEvidence = sequelize.define('ComplaintEvidence', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    complaintId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'complaints', key: 'id' },
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  }, {
    tableName: 'complaint_evidences',
    timestamps: true,
    updatedAt: false,
  });

  return ComplaintEvidence;
};
