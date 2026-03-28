const bcrypt = require('bcryptjs');
const { User, TailorProfile, Otp, UserSetting } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');
const generateOtp = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');

// POST /api/v1/auth/signup
exports.signup = catchAsync(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered.');

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name, email, phone, password: hashedPassword, role,
  });

  if (role === 'tailor') {
    await TailorProfile.create({ userId: user.id });
  }

  const { code, expiresAt } = generateOtp();
  await Otp.create({ userId: user.id, code, purpose: 'email_verify', expiresAt });

  try {
    await sendEmail({
      to: email,
      subject: 'TexHub - Verify your email',
      html: `<h2>Welcome to TexHub!</h2><p>Your OTP is: <strong>${code}</strong></p><p>Valid for 10 minutes.</p>`,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }

  res.status(201).json({
    success: true,
    message: 'Account created. OTP sent to your email.',
    userId: user.id,
  });
});

// POST /api/v1/auth/login
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid email or password.');
  if (!user.password) throw new ApiError(401, 'Please login with Google.');
  if (user.isSuspended) throw new ApiError(403, 'Account suspended. Contact admin.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password.');

  if (!user.isEmailVerified) {
    const { code, expiresAt } = generateOtp();
    await Otp.create({ userId: user.id, code, purpose: 'email_verify', expiresAt });
    try {
      await sendEmail({
        to: email,
        subject: 'TexHub - Verify your email',
        html: `<p>Your OTP is: <strong>${code}</strong></p>`,
      });
    } catch (err) {
      console.error('Email send failed:', err.message);
    }
    return res.json({
      success: true,
      message: 'Email not verified. OTP sent.',
      userId: user.id,
      requiresVerification: true,
    });
  }

  // Send 2FA OTP (only if twoFactor setting is enabled)
  const userSettings = await UserSetting.findOne({ where: { userId: user.id } });
  const twoFactorEnabled = userSettings ? userSettings.twoFactor !== false : true;
  if (!twoFactorEnabled) {
    // Skip OTP, return token directly
    const fullUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: TailorProfile, as: 'tailorProfile' }],
    });
    const token = generateToken({ id: user.id, role: user.role });
    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: fullUser,
    });
  }

  const { code, expiresAt } = generateOtp();
  await Otp.create({ userId: user.id, code, purpose: 'login_2fa', expiresAt });

  try {
    await sendEmail({
      to: email,
      subject: 'TexHub - Login OTP',
      html: `<p>Your login OTP is: <strong>${code}</strong></p><p>Valid for 10 minutes.</p>`,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }

  res.json({
    success: true,
    message: '2FA OTP sent to your email.',
    userId: user.id,
    requiresOtp: true,
  });
});

// POST /api/v1/auth/verify-otp
exports.verifyOtp = catchAsync(async (req, res) => {
  const { userId, code, purpose } = req.body;

  const otp = await Otp.findOne({
    where: { userId, purpose, isUsed: false },
    order: [['createdAt', 'DESC']],
  });

  if (!otp) throw new ApiError(400, 'No OTP found. Request a new one.');
  if (new Date() > otp.expiresAt) throw new ApiError(400, 'OTP expired. Request a new one.');
  if (otp.code !== code) throw new ApiError(400, 'Invalid OTP.');

  await otp.update({ isUsed: true });

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [{ model: TailorProfile, as: 'tailorProfile' }],
  });

  if (purpose === 'email_verify') {
    await user.update({ isEmailVerified: true });
  }

  const token = generateToken({ id: user.id, role: user.role });

  res.json({
    success: true,
    message: 'Verification successful.',
    token,
    user,
  });
});

// POST /api/v1/auth/resend-otp
exports.resendOtp = catchAsync(async (req, res) => {
  const { userId, purpose } = req.body;

  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found.');

  const { code, expiresAt } = generateOtp();
  await Otp.create({ userId, code, purpose, expiresAt });

  try {
    await sendEmail({
      to: user.email,
      subject: 'TexHub - Your OTP Code',
      html: `<p>Your OTP is: <strong>${code}</strong></p><p>Valid for 10 minutes.</p>`,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }

  res.json({ success: true, message: 'OTP resent.' });
});

// POST /api/v1/auth/google
exports.googleAuth = catchAsync(async (req, res) => {
  const { idToken } = req.body;

  // In production, verify idToken with Google's API
  // For now, decode the payload (simplified)
  const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ where: { googleId } });

  if (!user) {
    user = await User.findOne({ where: { email } });
    if (user) {
      await user.update({ googleId });
    } else {
      user = await User.create({
        name, email, googleId, role: 'customer',
        avatar: picture, isEmailVerified: true,
      });
    }
  }

  if (user.isSuspended) throw new ApiError(403, 'Account suspended.');

  const token = generateToken({ id: user.id, role: user.role });
  const userData = await User.findByPk(user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: TailorProfile, as: 'tailorProfile' }],
  });

  res.json({ success: true, token, user: userData });
});

// POST /api/v1/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, 'No account with this email.');

  const { code, expiresAt } = generateOtp();
  await Otp.create({ userId: user.id, code, purpose: 'password_reset', expiresAt });

  try {
    await sendEmail({
      to: email,
      subject: 'TexHub - Reset your password',
      html: `<p>Your password reset OTP is: <strong>${code}</strong></p><p>Valid for 10 minutes.</p>`,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }

  res.json({ success: true, message: 'Password reset OTP sent.', userId: user.id });
});

// POST /api/v1/auth/reset-password
exports.resetPassword = catchAsync(async (req, res) => {
  const { userId, code, newPassword } = req.body;

  const otp = await Otp.findOne({
    where: { userId, purpose: 'password_reset', isUsed: false },
    order: [['createdAt', 'DESC']],
  });

  if (!otp) throw new ApiError(400, 'No OTP found.');
  if (new Date() > otp.expiresAt) throw new ApiError(400, 'OTP expired.');
  if (otp.code !== code) throw new ApiError(400, 'Invalid OTP.');

  await otp.update({ isUsed: true });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await User.update({ password: hashedPassword }, { where: { id: userId } });

  res.json({ success: true, message: 'Password reset successful.' });
});
