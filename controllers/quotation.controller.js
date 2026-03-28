const { sequelize, Quotation, Order, User, TailorProfile } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { createNotification } = require('../utils/notify');

// POST /api/v1/orders/:orderId/quotations
exports.create = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { amount, deliveryDate, deliveryMethod, message } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (!['pending_quotation', 'quotation_received'].includes(order.status)) {
    throw new ApiError(400, 'Order is not accepting quotations.');
  }

  // Compute order deadline and validate tailor's delivery date is not after it
  const deadline = (() => {
    if (order.deliveryOption === 'custom' && order.customDate) return order.customDate;
    const daysMap = { express: 5, standard: 10 };
    const days = daysMap[order.deliveryOption] || 10;
    const base = order.createdAt ? new Date(order.createdAt) : new Date();
    return new Date(base.getTime() + days * 86400000).toISOString().split('T')[0];
  })();

  if (deliveryDate > deadline) {
    throw new ApiError(400, `Delivery date cannot be after the customer's deadline (${deadline}).`);
  }

  // Check tailor is approved
  const profile = await TailorProfile.findOne({ where: { userId: req.user.id } });
  if (!profile || profile.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Your profile must be approved to submit quotations.');
  }

  // Check not already quoted
  const existing = await Quotation.findOne({
    where: { orderId, tailorId: req.user.id },
  });
  if (existing) throw new ApiError(409, 'You already submitted a quotation for this order.');

  const quotation = await Quotation.create({
    orderId, tailorId: req.user.id,
    amount, deliveryDate, deliveryMethod, message,
  });

  // Update order status if first quotation
  if (order.status === 'pending_quotation') {
    await order.update({ status: 'quotation_received' });
  }

  // Notify customer about new quotation
  createNotification({
    userId: order.customerId,
    type: 'new_quotation',
    title: 'New Quotation Received',
    message: `A tailor has submitted a quotation of Rs.${Number(amount).toLocaleString()} for your order.`,
    data: { orderId, quotationId: quotation.id },
  });

  res.status(201).json({ success: true, message: 'Quotation submitted.', data: quotation });
});

// GET /api/v1/orders/:orderId/quotations
exports.getForOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const quotations = await Quotation.findAll({
    where: { orderId },
    include: [{
      model: User, as: 'tailor',
      attributes: ['id', 'name', 'avatar'],
      include: [{ model: TailorProfile, as: 'tailorProfile', attributes: ['avgRating', 'totalRatings', 'specialization', 'experience'] }],
    }],
    order: [['createdAt', 'ASC']],
  });

  res.json({ success: true, data: quotations });
});

// PUT /api/v1/quotations/:id/accept
exports.accept = catchAsync(async (req, res) => {
  const quotation = await Quotation.findByPk(req.params.id, {
    include: [{ model: Order, as: 'order' }],
  });

  if (!quotation) throw new ApiError(404, 'Quotation not found.');
  if (quotation.order.customerId !== req.user.id) {
    throw new ApiError(403, 'Not your order.');
  }
  if (quotation.status !== 'pending') {
    throw new ApiError(400, 'Quotation already processed.');
  }

  await sequelize.transaction(async (t) => {
    // Accept this quotation
    await quotation.update({ status: 'accepted' }, { transaction: t });

    // Reject all other quotations for this order
    await Quotation.update(
      { status: 'rejected' },
      { where: { orderId: quotation.orderId, id: { [require('sequelize').Op.ne]: quotation.id } }, transaction: t }
    );

    // Update order
    await Order.update({
      tailorId: quotation.tailorId,
      quotationAmount: quotation.amount,
      quotationDeliveryDate: quotation.deliveryDate,
      status: 'payment_pending',
    }, { where: { id: quotation.orderId }, transaction: t });
  });

  const updatedOrder = await Order.findByPk(quotation.orderId, {
    include: [
      { model: User, as: 'tailor', attributes: ['id', 'name'] },
      { model: Quotation, as: 'quotations' },
    ],
  });

  // Notify winning tailor
  createNotification({
    userId: quotation.tailorId,
    type: 'quotation_accepted',
    title: 'Quotation Accepted!',
    message: `Your quotation for order #${updatedOrder.orderNumber} has been accepted.`,
    data: { orderId: quotation.orderId },
  });

  res.json({ success: true, message: 'Quotation accepted.', data: updatedOrder });
});
