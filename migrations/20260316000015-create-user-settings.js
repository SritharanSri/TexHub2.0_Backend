'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      newOrder:      { type: Sequelize.BOOLEAN, defaultValue: true },
      bidUpdate:     { type: Sequelize.BOOLEAN, defaultValue: true },
      orderStatus:   { type: Sequelize.BOOLEAN, defaultValue: true },
      messages:      { type: Sequelize.BOOLEAN, defaultValue: true },
      marketing:     { type: Sequelize.BOOLEAN, defaultValue: false },
      profilePublic: { type: Sequelize.BOOLEAN, defaultValue: true },
      twoFactor:     { type: Sequelize.BOOLEAN, defaultValue: true },
      activityLog:   { type: Sequelize.BOOLEAN, defaultValue: true },
      darkMode:      { type: Sequelize.BOOLEAN, defaultValue: false },
      compactView:   { type: Sequelize.BOOLEAN, defaultValue: false },
      autoAccept:    { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt:     { type: Sequelize.DATE, allowNull: false },
      updatedAt:     { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_settings');
  },
};
