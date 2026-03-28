const router = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const quotation = require('../controllers/quotation.controller');
const rating = require('../controllers/rating.controller');
const { AdminBankDetail } = require('../models');
const catchAsync = require('../utils/catchAsync');

// Auth
router.use('/auth', require('./auth.routes'));

// Users
router.use('/users', require('./user.routes'));

// Tailors
router.use('/tailors', require('./tailor.routes'));

// Tailor ratings (public)
router.get('/tailors/:tailorId/ratings', rating.getByTailor);

// Public bank details (for customers to see deposit info)
router.get('/bank-details/public', authenticate, catchAsync(async (req, res) => {
  const details = await AdminBankDetail.findAll({
    attributes: ['id', 'bankName', 'accountName', 'accountNumber', 'branch', 'swiftCode'],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: details });
}));

// Orders
router.use('/orders', require('./order.routes'));

// Quotations (nested under orders)
router.use('/orders/:orderId/quotations', require('./quotation.routes'));

// Accept quotation (separate path)
router.put('/quotations/:id/accept', authenticate, authorize('customer'), quotation.accept);

// Payments (nested under orders)
router.use('/orders/:orderId/payments', require('./payment.routes'));

// Escrow (nested under orders)
router.use('/orders/:orderId/escrow', require('./escrow.routes'));

// Ratings (nested under orders)
router.use('/orders/:orderId/ratings', require('./rating.routes'));

// Complaints
router.use('/complaints', require('./complaint.routes'));

// Notifications
router.use('/notifications', require('./notification.routes'));

// Admin
router.use('/admin', require('./admin.routes'));

// Messages
router.use('/messages', require('./messageRoutes'));

module.exports = router;
