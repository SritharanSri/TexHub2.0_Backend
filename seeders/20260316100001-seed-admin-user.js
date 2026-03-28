'use strict';
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('123456', 12);
    await queryInterface.bulkInsert('users', [{
      id: randomUUID(),
      name: 'Admin User',
      email: 'ssrikalai2255@gmail.com',
      phone: '+91 99999 00000',
      password: hashedPassword,
      role: 'admin',
      isSuspended: false,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'ssrikalai2255@gmail.com' });
  },
};
