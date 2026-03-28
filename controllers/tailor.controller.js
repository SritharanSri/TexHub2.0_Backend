const { User, TailorProfile, Rating, Order, Escrow } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// GET /api/v1/tailors/me/profile
exports.getMyProfile = catchAsync(async (req, res) => {
  const profile = await TailorProfile.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
  });
  if (!profile) throw new ApiError(404, 'Tailor profile not found.');

  const userId = req.user.id;

  const [completedOrders, activeOrders, totalEarnings, pendingPayout] = await Promise.all([
    Order.count({ where: { tailorId: userId, status: 'delivered' } }),
    Order.count({ where: { tailorId: userId, status: { [Op.in]: ['in_work', 'confirmed'] } } }),
    Escrow.sum('tailorAmount', {
      include: [{ model: Order, as: 'order', attributes: [], where: { tailorId: userId } }],
      where: { status: 'released' },
    }),
    Escrow.sum('tailorAmount', {
      include: [{ model: Order, as: 'order', attributes: [], where: { tailorId: userId } }],
      where: { status: 'held' },
    }),
  ]);

  res.json({
    success: true,
    data: {
      ...profile.toJSON(),
      completedOrders: completedOrders || 0,
      activeOrders: activeOrders || 0,
      totalEarnings: parseFloat(totalEarnings) || 0,
      pendingPayout: parseFloat(pendingPayout) || 0,
    },
  });
});

// PUT /api/v1/tailors/me/profile
exports.updateProfile = catchAsync(async (req, res) => {
  const { specialization, experience, bio, shopName, shopAddress, shopPhone, nicNumber } = req.body;
  const profile = await TailorProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) throw new ApiError(404, 'Tailor profile not found.');

  await profile.update({ specialization, experience, bio, shopName, shopAddress, shopPhone, nicNumber });
  res.json({ success: true, message: 'Profile updated.', data: profile });
});

// POST /api/v1/tailors/me/nic
exports.uploadNic = catchAsync(async (req, res) => {
  const profile = await TailorProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) throw new ApiError(404, 'Tailor profile not found.');

  const updates = {};
  if (req.files?.nicFront?.[0]) {
    updates.nicFront = `uploads/nic/${req.files.nicFront[0].filename}`;
  }
  if (req.files?.nicBack?.[0]) {
    updates.nicBack = `uploads/nic/${req.files.nicBack[0].filename}`;
  }

  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No files uploaded.');

  updates.verificationStatus = 'pending';
  await profile.update(updates);

  res.json({ success: true, message: 'NIC documents uploaded. Verification pending.', data: profile });
});

// GET /api/v1/tailors/:tailorId/public
exports.getPublicProfile = catchAsync(async (req, res) => {
  const profile = await TailorProfile.findOne({
    where: { userId: req.params.tailorId },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'createdAt'] }],
  });
  if (!profile) throw new ApiError(404, 'Tailor not found.');
  res.json({ success: true, data: profile });
});

// GET /api/v1/tailors/:tailorId/stats
exports.getStats = catchAsync(async (req, res) => {
  const profile = await TailorProfile.findOne({
    where: { userId: req.params.tailorId },
    attributes: ['avgRating', 'totalRatings', 'specialization', 'experience'],
  });
  if (!profile) throw new ApiError(404, 'Tailor not found.');

  const recentReviews = await Rating.findAll({
    where: { tailorId: req.params.tailorId },
    include: [{ model: User, as: 'reviewer', attributes: ['name', 'avatar'] }],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  res.json({ success: true, data: { ...profile.toJSON(), recentReviews } });
});
