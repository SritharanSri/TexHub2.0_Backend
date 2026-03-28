const { Rating, Order, User, TailorProfile } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginatedResponse } = require('../utils/pagination');

// POST /api/v1/orders/:orderId/ratings
exports.create = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { stars, review } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customerId !== req.user.id) throw new ApiError(403, 'Not your order.');
  if (order.status !== 'delivered' && order.status !== 'dispatched') {
    throw new ApiError(400, 'Can only rate after dispatch or delivery.');
  }
  if (!order.tailorId) throw new ApiError(400, 'No tailor assigned to this order.');

  let rating = await Rating.findOne({ where: { orderId } });
  let isUpdate = !!rating;
  if (isUpdate) {
    // Update existing rating
    await rating.update({ stars, review });
  } else {
    // Check late penalty for new rating
    let latePenaltyApplied = false;
    let penaltyAmount = 0;
    if (order.quotationDeliveryDate) {
      const deliveryDate = new Date(order.updatedAt);
      const promisedDate = new Date(order.quotationDeliveryDate);
      if (deliveryDate > promisedDate) {
        latePenaltyApplied = true;
        penaltyAmount = 0.25;
      }
    }

    rating = await Rating.create({
      orderId, customerId: req.user.id, tailorId: order.tailorId,
      stars, review, latePenaltyApplied, penaltyAmount,
    });

    // Automatically mark as delivered if it was dispatched
    if (order.status === 'dispatched') {
      await order.update({ status: 'delivered', progress: 100 });
    }
  }

  // Notify the tailor
  const { Notification } = require('../models');
  await Notification.create({
    userId: order.tailorId,
    type: 'rating_received',
    title: isUpdate ? 'Rating Updated' : 'New Rating Received',
    message: `Customer ${req.user.name} has ${isUpdate ? 'updated their rating' : 'rated you'} ${stars} stars for Order #${order.orderNumber || order.id}.`,
    data: { orderId: order.id, ratingId: rating.id }
  });

  // Recalculate tailor avg rating
  const allRatings = await Rating.findAll({ where: { tailorId: order.tailorId } });
  const totalStars = allRatings.reduce((sum, r) => sum + r.stars, 0);
  const totalPenalty = allRatings.reduce((sum, r) => sum + parseFloat(r.penaltyAmount || 0), 0);
  const avgRating = Math.max(0, (totalStars - totalPenalty) / allRatings.length);

  await TailorProfile.update(
    { avgRating: avgRating.toFixed(2), totalRatings: allRatings.length },
    { where: { userId: order.tailorId } }
  );

  res.status(201).json({ success: true, message: 'Rating submitted.', data: rating });
});

// GET /api/v1/tailors/:tailorId/ratings
exports.getByTailor = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);

  const { rows, count } = await Rating.findAndCountAll({
    where: { tailorId: req.params.tailorId },
    include: [
      { model: User, as: 'reviewer', attributes: ['id', 'name', 'avatar'] },
      { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'clothType'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});
