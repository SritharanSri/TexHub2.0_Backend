const bcrypt = require('bcryptjs');
const { User, TailorProfile, UserSetting } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// GET /api/v1/users/me
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: TailorProfile, as: 'tailorProfile' }],
  });
  res.json({ success: true, data: user });
});

// PUT /api/v1/users/me
exports.updateProfile = catchAsync(async (req, res) => {
  const { name, email, phone, address } = req.body;
  await User.update(
    { name, email, phone, address },
    { where: { id: req.user.id } }
  );
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });
  res.json({ success: true, message: 'Profile updated.', data: user });
});

// PUT /api/v1/users/me/avatar
exports.uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const avatarPath = `uploads/avatars/${req.file.filename}`;
  await User.update({ avatar: avatarPath }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Avatar updated.', avatar: avatarPath });
});

// GET /api/v1/users/me/settings
exports.getSettings = catchAsync(async (req, res) => {
  let record = await UserSetting.findOne({ where: { userId: req.user.id } });
  if (!record) {
    record = await UserSetting.create({ userId: req.user.id });
  }
  const { id, userId, createdAt, updatedAt, ...data } = record.toJSON();
  res.json({ success: true, data });
});

// PUT /api/v1/users/me/settings
exports.updateSettings = catchAsync(async (req, res) => {
  const allowed = [
    'newOrder','bidUpdate','orderStatus','messages','marketing',
    'profilePublic','twoFactor','activityLog',
    'darkMode','compactView','autoAccept',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  let record = await UserSetting.findOne({ where: { userId: req.user.id } });
  if (record) {
    await record.update(updates);
  } else {
    record = await UserSetting.create({ userId: req.user.id, ...updates });
  }
  const { id, userId, createdAt, updatedAt, ...data } = record.toJSON();
  res.json({ success: true, message: 'Settings saved.', data });
});

// PUT /api/v1/users/me/password
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user.password) throw new ApiError(400, 'Account uses Google login. Cannot change password.');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect.');

  const hashed = await bcrypt.hash(newPassword, 12);
  await user.update({ password: hashed });

  res.json({ success: true, message: 'Password changed successfully.' });
});
