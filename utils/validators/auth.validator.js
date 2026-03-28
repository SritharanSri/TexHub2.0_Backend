const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).allow('', null),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('customer', 'tailor').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const otpSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  code: Joi.string().length(6).required(),
  purpose: Joi.string().valid('email_verify', 'login_2fa', 'password_reset').required(),
});

const resendOtpSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  purpose: Joi.string().valid('email_verify', 'login_2fa', 'password_reset').required(),
});

const googleAuthSchema = Joi.object({
  idToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  otpSchema,
  resendOtpSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
