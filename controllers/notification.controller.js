const { Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /notifications
exports.getAll = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const where = { userId: req.user.id };
  if (req.query.unread === 'true') where.isRead = false;

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// GET /notifications/unread-count
exports.unreadCount = catchAsync(async (req, res) => {
  const count = await Notification.count({
    where: { userId: req.user.id, isRead: false },
  });
  res.json({ success: true, data: { count } });
});

// PUT /notifications/:id/read
exports.markRead = catchAsync(async (req, res) => {
  const notif = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  notif.isRead = true;
  await notif.save();
  res.json({ success: true, data: notif });
});

// PUT /notifications/read-all
exports.markAllRead = catchAsync(async (req, res) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
});
