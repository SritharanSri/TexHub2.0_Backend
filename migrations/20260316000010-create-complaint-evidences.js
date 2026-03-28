'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('complaint_evidences', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      complaintId: { type: Sequelize.UUID, allowNull: false, references: { model: 'complaints', key: 'id' }, onDelete: 'CASCADE' },
      filePath: { type: Sequelize.STRING(500), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('complaint_evidences');
  },
};
