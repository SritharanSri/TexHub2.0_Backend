const { Notification } = require('../models');

/**
 * Create a notification for a user.
 * @param {Object} opts
 * @param {string} opts.userId   - recipient user ID
 * @param {string} opts.type     - e.g. 'order_placed', 'bid_received', 'payment_verified'
 * @param {string} opts.title    - short title
 * @param {string} opts.message  - descriptive message
 * @param {Object} [opts.data]   - optional JSON payload (orderId, etc.)
 */
async function createNotification({ userId, type, title, message, data = {} }) {
  try {
    await Notification.create({ userId, type, title, message, data });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

/**
 * Notify multiple users at once.
 */
async function notifyMany(userIds, { type, title, message, data = {} }) {
  try {
    const records = userIds.map(userId => ({ userId, type, title, message, data }));
    await Notification.bulkCreate(records);
  } catch (err) {
    console.error('Failed to bulk-create notifications:', err.message);
  }
}

module.exports = { createNotification, notifyMany };
