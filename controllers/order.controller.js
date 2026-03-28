const { Op } = require('sequelize');
const { Order, OrderImage, User, Quotation, TailorProfile, Rating } = require('../models');
const { ORDER_STATUS_TRANSITIONS } = require('../config/constants');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { createNotification, notifyMany } = require('../utils/notify');

// Helper: compute deadline from deliveryOption + customDate + createdAt
function computeDeadline(order) {
  if (order.deliveryOption === 'custom' && order.customDate) return order.customDate;
  const daysMap = { express: 5, standard: 10 };
  const days = daysMap[order.deliveryOption] || 10;
  const base = order.createdAt ? new Date(order.createdAt) : new Date();
  return new Date(base.getTime() + days * 86400000).toISOString().split('T')[0];
}

// Attach deadline to order JSON
function withDeadline(order) {
  const json = order.toJSON ? order.toJSON() : { ...order };
  json.deadline = computeDeadline(json);
  return json;
}

// Generate order number: TEX-000001
const generateOrderNumber = async () => {
  const last = await Order.findOne({ order: [['createdAt', 'DESC']] });
  if (!last) return 'TEX-000001';
  const num = parseInt(last.orderNumber.replace('TEX-', ''), 10) + 1;
  return `TEX-${String(num).padStart(6, '0')}`;
};

// POST /api/v1/orders
exports.create = catchAsync(async (req, res) => {
  const { deliveryOption, customDate, notes } = req.body;
  const orderNumber = await generateOrderNumber();

  let parsedItems = [];
  try {
    if (typeof req.body.items === 'string') {
      parsedItems = JSON.parse(req.body.items);
    } else if (Array.isArray(req.body.items)) {
      parsedItems = req.body.items;
    } else if (req.body.category) {
      parsedItems = [{
        category: req.body.category,
        clothType: req.body.clothType,
        size: req.body.size,
        measurements: typeof req.body.measurements === 'string' ? JSON.parse(req.body.measurements) : req.body.measurements,
        material: req.body.material,
        designImageUrl: req.body.designImageUrl
      }];
    }
  } catch (e) {
    parsedItems = [];
  }

  const filesArray = req.files || [];
  parsedItems = parsedItems.map((item, index) => {
    const designFile = filesArray.find(f => f.fieldname === `designImage_${index}` || f.fieldname === 'designImage');
    if (designFile) {
      item.designImage = `uploads/designs/${designFile.filename}`;
    } else if (item.designImageUrl) {
      item.designImage = item.designImageUrl;
    }
    return item;
  });

  let category = null, clothType = null;
  if (parsedItems.length === 1) {
    category = parsedItems[0].category;
    clothType = parsedItems[0].clothType;
  } else if (parsedItems.length > 1) {
    category = 'Multi-Item';
    clothType = `${parsedItems.length} Garments`;
  }

  const order = await Order.create({
    customerId: req.user.id,
    orderNumber,
    items: parsedItems,
    category, clothType,
    deliveryOption, customDate, notes,
  });

  // Save reference images
  const refFiles = filesArray.filter(f => f.fieldname === 'referenceImages');
  if (refFiles.length) {
    const images = refFiles.map((f) => ({
      orderId: order.id,
      imageType: 'reference',
      filePath: `uploads/references/${f.filename}`,
    }));
    await OrderImage.bulkCreate(images);
  }

  const created = await Order.findByPk(order.id, {
    include: [{ model: OrderImage, as: 'images' }],
  });

  // Notify all approved tailors about the new order
  const approvedTailors = await TailorProfile.findAll({
    where: { verificationStatus: 'approved' },
    attributes: ['userId'],
  });
  const tailorIds = approvedTailors.map(t => t.userId);
  if (tailorIds.length) {
    notifyMany(tailorIds, {
      type: 'new_order',
      title: 'New Order Available',
      message: `A new ${clothType || category || 'custom'} order (${orderNumber}) is open for bidding.`,
      data: { orderId: order.id, orderNumber },
    });
  }

  res.status(201).json({ success: true, message: 'Order placed.', data: created });
});

// GET /api/v1/orders/my
exports.getMyOrders = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { status } = req.query;

  // Support both customer and tailor roles
  const where = {};
  if (req.user.role === 'tailor') {
    where.tailorId = req.user.id;
  } else {
    where.customerId = req.user.id;
  }
  if (status) {
    if (status.includes(',')) {
      where.status = { [Op.in]: status.split(',') };
    } else {
      where.status = status;
    }
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name', 'avatar'] },
      { model: User, as: 'tailor', attributes: ['id', 'name', 'avatar'] },
      { model: OrderImage, as: 'images' },
      { model: Rating, as: 'rating' },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// GET /api/v1/orders/open (for tailors to browse)
exports.getOpenOrders = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);

  // Check tailor is approved
  const profile = await TailorProfile.findOne({ where: { userId: req.user.id } });
  if (!profile || profile.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Your tailor profile must be approved to view orders.');
  }

  const { rows, count } = await Order.findAndCountAll({
    where: { status: { [Op.in]: ['pending_quotation', 'quotation_received'] } },
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name'] },
      { model: OrderImage, as: 'images' },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  const data = rows.map(withDeadline);
  res.json({ success: true, ...paginatedResponse(data, count, { page, limit }) });
});

// GET /api/v1/orders/:id
exports.getById = catchAsync(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
      { model: User, as: 'tailor', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
      { model: OrderImage, as: 'images' },
      { model: Rating, as: 'rating' },
      { model: Quotation, as: 'quotations', include: [
        { model: User, as: 'tailor', attributes: ['id', 'name', 'avatar'] },
      ]},
    ],
  });

  if (!order) throw new ApiError(404, 'Order not found.');

  const isOwner = order.customerId === req.user.id;
  const isAssignedTailor = order.tailorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  // Any approved tailor can view open orders (needed for bidding/browsing)
  let isApprovedTailor = false;
  if (req.user.role === 'tailor') {
    const profile = await TailorProfile.findOne({ where: { userId: req.user.id } });
    isApprovedTailor = profile && profile.verificationStatus === 'approved';
  }

  if (!isOwner && !isAssignedTailor && !isAdmin && !isApprovedTailor) {
    throw new ApiError(403, 'Access denied.');
  }

  res.json({ success: true, data: withDeadline(order) });
});

// PUT /api/v1/orders/:id  — tailor updates measurements / notes
exports.updateOrder = catchAsync(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.tailorId !== req.user.id) throw new ApiError(403, 'Not your order.');

  const { measurements, notes } = req.body;
  const updates = {};
  if (measurements !== undefined) updates.measurements = measurements;
  if (notes !== undefined) updates.notes = notes;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'Nothing to update.');
  }

  await order.update(updates);
  res.json({ success: true, message: 'Order details updated.', data: order });
});

// PUT /api/v1/orders/:id/progress
exports.updateProgress = catchAsync(async (req, res) => {
  const { progress } = req.body;
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.tailorId !== req.user.id) throw new ApiError(403, 'Not your order.');
  if (order.status !== 'in_work') throw new ApiError(400, 'Can only update progress when order is in work.');

  const updates = { progress };

  // Auto-complete: when progress reaches 100%, transition to delivered
  if (progress === 100) {
    updates.status = 'delivered';

    createNotification({
      userId: order.customerId,
      type: 'order_status',
      title: 'Order Delivered',
      message: 'Your order has been completed and delivered!',
      data: { orderId: order.id, status: 'delivered' },
    });
  }

  await order.update(updates);
  res.json({ success: true, message: progress === 100 ? 'Order completed and delivered.' : 'Progress updated.', data: order });
});

// PUT /api/v1/orders/:id/status
exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.tailorId !== req.user.id) throw new ApiError(403, 'Not your order.');

  const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Cannot transition from '${order.status}' to '${status}'.`);
  }

  const updates = { status };
  if (status === 'delivered') updates.progress = 100;
  if (status === 'in_work' && order.progress === 0) updates.progress = 5;

  await order.update(updates);

  // Notify customer about status change
  const statusLabels = { in_work: 'In Progress', dispatched: 'Dispatched', delivered: 'Delivered' };
  createNotification({
    userId: order.customerId,
    type: 'order_status',
    title: 'Order Status Updated',
    message: `Your order has been updated to "${statusLabels[status] || status}".`,
    data: { orderId: order.id, status },
  });

  res.json({ success: true, message: `Order status updated to '${status}'.`, data: order });
});

// PUT /api/v1/orders/:id/cancel
exports.cancel = catchAsync(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customerId !== req.user.id) throw new ApiError(403, 'Not your order.');

  const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes('cancelled')) {
    throw new ApiError(400, 'This order cannot be cancelled at its current stage.');
  }

  await order.update({ status: 'cancelled' });
  res.json({ success: true, message: 'Order cancelled.', data: order });
});
