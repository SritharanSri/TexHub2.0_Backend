const { Escrow, Order, Payment } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// GET /api/v1/orders/:orderId/escrow
exports.getByOrder = catchAsync(async (req, res) => {
  const escrow = await Escrow.findOne({
    where: { orderId: req.params.orderId },
    include: [
      { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'status'] },
      { model: Payment, as: 'payment', attributes: ['id', 'amount', 'method', 'status'] },
    ],
  });
  if (!escrow) throw new ApiError(404, 'No escrow found for this order.');
  res.json({ success: true, data: escrow });
});
