'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('users', 'settings').catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'settings', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
    });
  },
};
