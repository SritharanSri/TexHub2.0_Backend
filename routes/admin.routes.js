const router = require('express').Router();
const admin = require('../controllers/admin.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  verifyTailorSchema, verifyPaymentSchema,
  resolveComplaintSchema, bankDetailSchema,
} = require('../utils/validators/admin.validator');

router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard', admin.getDashboard);

// Users
router.get('/users', admin.listUsers);
router.get('/users/:id', admin.getUserById);
router.put('/users/:id/suspend', admin.toggleSuspend);

// Tailor approvals
router.get('/tailors/pending', admin.getPendingTailors);
router.put('/tailors/:id/verify', validate(verifyTailorSchema), admin.verifyTailor);

// Orders
router.get('/orders', admin.listOrders);
router.get('/orders/:id', admin.getOrderDetail);

// Payments
router.get('/payments', admin.listPayments);
router.put('/payments/:id/verify', validate(verifyPaymentSchema), admin.verifyPayment);

// Escrows
router.get('/escrows', admin.listEscrows);
router.put('/escrows/:id/release', admin.releaseEscrow);
router.put('/escrows/:id/refund', admin.refundEscrow);

// Complaints
router.get('/complaints', admin.listComplaints);
router.put('/complaints/:id/resolve', validate(resolveComplaintSchema), admin.resolveComplaint);

// Bank details
router.get('/bank-details', admin.getBankDetails);
router.post('/bank-details', validate(bankDetailSchema), admin.createBankDetail);
router.put('/bank-details/:id', validate(bankDetailSchema), admin.updateBankDetail);
router.delete('/bank-details/:id', admin.deleteBankDetail);

module.exports = router;
