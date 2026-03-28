const { Complaint, ComplaintEvidence, User, Order } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { createNotification, notifyMany } = require('../utils/notify');

// POST /api/v1/complaints
exports.create = catchAsync(async (req, res) => {
  const { orderId, againstUserId, subject, message } = req.body;

  const complaint = await Complaint.create({
    orderId, fromUserId: req.user.id, againstUserId, subject, message,
  });

  // Save evidence files
  if (req.files && req.files.length > 0) {
    const evidences = req.files.map((f) => ({
      complaintId: complaint.id,
      filePath: `uploads/evidence/${f.filename}`,
    }));
    await ComplaintEvidence.bulkCreate(evidences);
  }

  const created = await Complaint.findByPk(complaint.id, {
    include: [{ model: ComplaintEvidence, as: 'evidences' }],
  });

  // Notify admins about new complaint
  const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
  notifyMany(admins.map(a => a.id), {
    type: 'new_complaint',
    title: 'New Complaint Filed',
    message: `A new complaint regarding "${subject}" has been submitted.`,
    data: { complaintId: complaint.id, orderId },
  });

  res.status(201).json({ success: true, message: 'Complaint submitted.', data: created });
});

// GET /api/v1/complaints/my
exports.getMine = catchAsync(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);

  const { rows, count } = await Complaint.findAndCountAll({
    where: { fromUserId: req.user.id },
    include: [
      { model: User, as: 'accused', attributes: ['id', 'name'] },
      { model: Order, as: 'order', attributes: ['id', 'orderNumber'] },
      { model: ComplaintEvidence, as: 'evidences' },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  res.json({ success: true, ...paginatedResponse(rows, count, { page, limit }) });
});

// GET /api/v1/complaints/:id
exports.getById = catchAsync(async (req, res) => {
  const complaint = await Complaint.findByPk(req.params.id, {
    include: [
      { model: User, as: 'complainant', attributes: ['id', 'name', 'role'] },
      { model: User, as: 'accused', attributes: ['id', 'name', 'role'] },
      { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'status'] },
      { model: ComplaintEvidence, as: 'evidences' },
    ],
  });

  if (!complaint) throw new ApiError(404, 'Complaint not found.');

  const isOwner = complaint.fromUserId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Access denied.');

  res.json({ success: true, data: complaint });
});
