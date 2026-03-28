const { sequelize, Payment, Order, User, Escrow } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { createNotification, notifyMany } = require('../utils/notify');

// POST /api/v1/orders/:orderId/payments/bank-deposit
exports.createBankDeposit = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { amount, bankName, depositorName, depositDate, referenceNumber } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customerId !== req.user.id) throw new ApiError(403, 'Not your order.');
  if (order.status !== 'payment_pending') throw new ApiError(400, 'Payment not expected for this order.');

  const existingPayment = await Payment.findOne({ where: { orderId } });
  if (existingPayment) throw new ApiError(409, 'Payment already submitted for this order.');

  let slipImage = null;
  if (req.file) {
    slipImage = `uploads/slips/${req.file.filename}`;
  }

  const payment = await Payment.create({
    orderId, customerId: req.user.id,
    amount, method: 'bank_deposit',
    slipImage, bankName, depositorName, depositDate, referenceNumber,
  });

  // Notify admins about payment pending verification
  const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
  notifyMany(admins.map(a => a.id), {
    type: 'payment_submitted',
    title: 'Payment Verification Needed',
    message: `A bank deposit of Rs.${Number(amount).toLocaleString()} has been submitted for verification.`,
    data: { paymentId: payment.id, orderId },
  });

  res.status(201).json({ success: true, message: 'Bank deposit slip submitted. Awaiting verification.', data: payment });
});

// POST /api/v1/orders/:orderId/payments/card
exports.createCard = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { amount, cardLast4 } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customerId !== req.user.id) throw new ApiError(403, 'Not your order.');
  if (order.status !== 'payment_pending') throw new ApiError(400, 'Payment not expected for this order.');

  const existingPayment = await Payment.findOne({ where: { orderId } });
  if (existingPayment) throw new ApiError(409, 'Payment already submitted for this order.');

  const payment = await Payment.create({
    orderId, customerId: req.user.id,
    amount, method: 'card', cardLast4,
    status: 'approved', // Auto-approved for card
  });

  // Create Escrow record for card payment
  const commission = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || 10) / 100;
  const totalAmount = parseFloat(amount);
  const platformFee = +(totalAmount * commission).toFixed(2);
  const tailorAmount = +(totalAmount - platformFee).toFixed(2);

  await sequelize.transaction(async (t) => {
    // Record in Escrow
    await Escrow.create({
      orderId: payment.orderId, paymentId: payment.id,
      totalAmount, platformFee, tailorAmount,
      status: 'held', // Set to held initially
    }, { transaction: t });

    // Automatically confirm the order
    await order.update({ status: 'confirmed' }, { transaction: t });
  });

  // Notify customer
  createNotification({
    userId: order.customerId,
    type: 'payment_verified',
    title: 'Payment Successful',
    message: `Your card payment for order #${order.orderNumber} has been verified and your order is now confirmed.`,
    data: { orderId: order.id, paymentId: payment.id },
  });

  // Notify tailor
  if (order.tailorId) {
    createNotification({
      userId: order.tailorId,
      type: 'order_confirmed',
      title: 'Order Confirmed',
      message: `Order #${order.orderNumber} has been confirmed. You can begin work.`,
      data: { orderId: order.id },
    });
  }

  res.status(201).json({ success: true, message: 'Card payment successful. Your order is now confirmed.', data: payment });
});

// GET /api/v1/orders/:orderId/payments
exports.getByOrder = catchAsync(async (req, res) => {
  const payment = await Payment.findOne({
    where: { orderId: req.params.orderId },
  });
  if (!payment) throw new ApiError(404, 'No payment found for this order.');
  res.json({ success: true, data: payment });
});
