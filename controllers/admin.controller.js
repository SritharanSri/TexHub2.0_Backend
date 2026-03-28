const { Op } = require('sequelize');
const {
  sequelize, User, TailorProfile, Order, Payment, Escrow,
  Complaint, ComplaintEvidence, AdminBankDetail, Quotation, Rating,
} = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { createNotification } = require('../utils/notify');

// GET /api/v1/admin/dashboard
exports.getDashboard = catchAsync(async (req, res) => {
  const [totalUsers, totalTailors, totalCustomers, pendingApprovals,
    totalOrders, openComplaints, heldEscrows] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'tailor' } }),
    User.count({ where: { role: 'customer' } }),
    TailorProfile.count({ where: { verificationStatus: 'pending' } }),
    Order.count(),
    Complaint.count({ where: { status: 'open' } }),
    Escrow.findAll({ where: { status: 'released' }, attributes: ['platformFee'] }),
  ]);

  const revenue = heldEscrows.reduce((sum, e) => sum + parseFloat(e.platformFee || 0), 0);

  const ordersToday = await Order.count({
    where: { createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } },
  });

  res.json({
    success: true,
    data: {
      totalUsers, totalTailors, totalCustomers, pendingApprovals,
      totalOrders, ordersToday, revenue, openComplaints,
    },
  });
});

// GET /api/v1/admin/users
exports.listUsers = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { role, search } = req.query;

  const where = { role: { [Op.ne]: 'admin' } };
  if (role) where.role = role;
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    include: [{ model: TailorProfile, as: 'tailorProfile' }],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// GET /api/v1/admin/users/:id
exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: TailorProfile, as: 'tailorProfile' }],
  });
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, data: user });
});

// PUT /api/v1/admin/users/:id/suspend
exports.toggleSuspend = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot suspend admin.');

  await user.update({ isSuspended: !user.isSuspended });
  res.json({
    success: true,
    message: user.isSuspended ? 'User suspended.' : 'User activated.',
    data: { id: user.id, isSuspended: user.isSuspended },
  });
});

// GET /api/v1/admin/tailors/pending
exports.getPendingTailors = catchAsync(async (req, res) => {
  const where = {};
  const status = req.query.status;
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    where.verificationStatus = status;
  }
  const profiles = await TailorProfile.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
    order: [['createdAt', 'ASC']],
  });
  res.json({ success: true, data: profiles });
});

// PUT /api/v1/admin/tailors/:id/verify
exports.verifyTailor = catchAsync(async (req, res) => {
  const { status, verificationNote } = req.body;
  const profile = await TailorProfile.findByPk(req.params.id);
  if (!profile) throw new ApiError(404, 'Tailor profile not found.');

  await profile.update({ verificationStatus: status, verificationNote });

  // Notify tailor about approval/rejection
  createNotification({
    userId: profile.userId,
    type: 'tailor_verification',
    title: status === 'approved' ? 'Profile Approved!' : 'Profile Rejected',
    message: status === 'approved'
      ? 'Your tailor profile has been approved. You can now accept orders.'
      : `Your tailor profile was rejected. ${verificationNote || ''}`.trim(),
    data: { status },
  });

  res.json({ success: true, message: `Tailor ${status}.`, data: profile });
});

// GET /api/v1/admin/orders
exports.listOrders = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { status } = req.query;

  const where = {};
  if (status) where.status = status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name'] },
      { model: User, as: 'tailor', attributes: ['id', 'name'] },
      { model: Payment, as: 'payment', attributes: ['id', 'amount', 'status'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// GET /api/v1/admin/orders/:id
exports.getOrderDetail = catchAsync(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'customer', attributes: { exclude: ['password'] } },
      { model: User, as: 'tailor', attributes: { exclude: ['password'] } },
      { model: Quotation, as: 'quotations', include: [{ model: User, as: 'tailor', attributes: ['id', 'name'] }] },
      { model: Payment, as: 'payment' },
      { model: Escrow, as: 'escrow' },
      { model: Rating, as: 'rating' },
    ],
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  res.json({ success: true, data: order });
});

// GET /api/v1/admin/payments
exports.listPayments = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { status } = req.query;

  const where = {};
  if (status) where.status = status;

  const { rows, count } = await Payment.findAndCountAll({
    where,
    include: [
      { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'clothType'] },
      { model: User, as: 'payer', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// PUT /api/v1/admin/payments/:id/verify
exports.verifyPayment = catchAsync(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const payment = await Payment.findByPk(req.params.id, {
    include: [{ model: Order, as: 'order' }],
  });
  if (!payment) throw new ApiError(404, 'Payment not found.');
  if (payment.status !== 'pending_verification') {
    throw new ApiError(400, 'Payment already processed.');
  }

  if (status === 'approved') {
    const commission = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || 10) / 100;
    const totalAmount = parseFloat(payment.amount);
    const platformFee = +(totalAmount * commission).toFixed(2);
    const tailorAmount = +(totalAmount - platformFee).toFixed(2);

    await sequelize.transaction(async (t) => {
      await payment.update({
        status: 'approved', verifiedBy: req.user.id, verifiedAt: new Date(),
      }, { transaction: t });

      await Escrow.create({
        orderId: payment.orderId, paymentId: payment.id,
        totalAmount, platformFee, tailorAmount,
      }, { transaction: t });

      await Order.update(
        { status: 'confirmed' },
        { where: { id: payment.orderId }, transaction: t }
      );
    });

    // Notify customer & tailor that payment approved
    createNotification({
      userId: payment.order.customerId,
      type: 'payment_verified',
      title: 'Payment Approved',
      message: 'Your payment has been verified and your order is now confirmed.',
      data: { orderId: payment.orderId },
    });
    if (payment.order.tailorId) {
      createNotification({
        userId: payment.order.tailorId,
        type: 'order_confirmed',
        title: 'New Order Confirmed',
        message: `Order #${payment.order.orderNumber} has been confirmed. You can begin work.`,
        data: { orderId: payment.orderId },
      });
    }
  } else {
    await payment.update({
      status: 'rejected', rejectionReason,
      verifiedBy: req.user.id, verifiedAt: new Date(),
    });

    // Notify customer that payment was rejected
    createNotification({
      userId: payment.order.customerId,
      type: 'payment_rejected',
      title: 'Payment Rejected',
      message: `Your payment was rejected. ${rejectionReason || 'Please resubmit.'}`.trim(),
      data: { orderId: payment.orderId },
    });
  }

  res.json({ success: true, message: `Payment ${status}.` });
});

// GET /api/v1/admin/escrows
exports.listEscrows = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);

  const { rows, count } = await Escrow.findAndCountAll({
    include: [
      { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'status'], include: [
        { model: User, as: 'tailor', attributes: ['id', 'name'] },
      ]},
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// PUT /api/v1/admin/escrows/:id/release
exports.releaseEscrow = catchAsync(async (req, res) => {
  const escrow = await Escrow.findByPk(req.params.id, {
    include: [{ model: Order, as: 'order' }],
  });
  if (!escrow) throw new ApiError(404, 'Escrow not found.');
  if (escrow.status !== 'held') throw new ApiError(400, 'Escrow already processed.');
  if (escrow.order.status !== 'delivered') {
    throw new ApiError(400, 'Order must be delivered before releasing escrow.');
  }

  await escrow.update({ status: 'released', releasedAt: new Date() });
  res.json({ success: true, message: 'Escrow released to tailor.' });
});

// PUT /api/v1/admin/escrows/:id/refund
exports.refundEscrow = catchAsync(async (req, res) => {
  const escrow = await Escrow.findByPk(req.params.id);
  if (!escrow) throw new ApiError(404, 'Escrow not found.');
  if (escrow.status !== 'held') throw new ApiError(400, 'Escrow already processed.');

  await escrow.update({ status: 'refunded', refundedAt: new Date() });
  res.json({ success: true, message: 'Escrow refunded to customer.' });
});

// GET /api/v1/admin/complaints
exports.listComplaints = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { status } = req.query;

  const where = {};
  if (status) where.status = status;

  const { rows, count } = await Complaint.findAndCountAll({
    where,
    include: [
      { model: User, as: 'complainant', attributes: ['id', 'name', 'role'] },
      { model: User, as: 'accused', attributes: ['id', 'name', 'role'] },
      { model: Order, as: 'order', attributes: ['id', 'orderNumber'] },
      { model: ComplaintEvidence, as: 'evidences' },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// PUT /api/v1/admin/complaints/:id/resolve
exports.resolveComplaint = catchAsync(async (req, res) => {
  const { status, resolution } = req.body;
  const complaint = await Complaint.findByPk(req.params.id);
  if (!complaint) throw new ApiError(404, 'Complaint not found.');
  if (complaint.status !== 'open') throw new ApiError(400, 'Complaint already processed.');

  await complaint.update({
    status, resolution, resolvedBy: req.user.id, resolvedAt: new Date(),
  });

  res.json({ success: true, message: `Complaint ${status}.`, data: complaint });
});

// GET /api/v1/admin/bank-details
exports.getBankDetails = catchAsync(async (req, res) => {
  const details = await AdminBankDetail.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: details });
});

// POST /api/v1/admin/bank-details
exports.createBankDetail = catchAsync(async (req, res) => {
  const detail = await AdminBankDetail.create(req.body);
  res.status(201).json({ success: true, data: detail });
});

// PUT /api/v1/admin/bank-details/:id
exports.updateBankDetail = catchAsync(async (req, res) => {
  const detail = await AdminBankDetail.findByPk(req.params.id);
  if (!detail) throw new ApiError(404, 'Bank detail not found.');
  await detail.update(req.body);
  res.json({ success: true, data: detail });
});

// DELETE /api/v1/admin/bank-details/:id
exports.deleteBankDetail = catchAsync(async (req, res) => {
  const detail = await AdminBankDetail.findByPk(req.params.id);
  if (!detail) throw new ApiError(404, 'Bank detail not found.');
  await detail.destroy();
  res.json({ success: true, message: 'Bank detail deleted.' });
});
