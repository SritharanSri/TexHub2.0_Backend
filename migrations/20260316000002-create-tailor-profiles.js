'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tailor_profiles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      specialization: { type: Sequelize.STRING(255), allowNull: true },
      experience: { type: Sequelize.INTEGER, allowNull: true },
      bio: { type: Sequelize.TEXT, allowNull: true },
      shopName: { type: Sequelize.STRING(255), allowNull: true },
      shopAddress: { type: Sequelize.TEXT, allowNull: true },
      shopPhone: { type: Sequelize.STRING(20), allowNull: true },
      nicNumber: { type: Sequelize.STRING(20), allowNull: true },
      nicFront: { type: Sequelize.STRING(500), allowNull: true },
      nicBack: { type: Sequelize.STRING(500), allowNull: true },
      verificationStatus: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      verificationNote: { type: Sequelize.TEXT, allowNull: true },
      avgRating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0.00 },
      totalRatings: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tailor_profiles');
  },
};
