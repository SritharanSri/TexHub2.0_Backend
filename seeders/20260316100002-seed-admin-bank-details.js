'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('admin_bank_details', [{
      id: randomUUID(),
      bankName: 'State Bank of India',
      accountName: 'TexHub Pvt Ltd',
      accountNumber: '1234567890123456',
      branchName: 'Chennai Main Branch',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('admin_bank_details', null);
  },
};
