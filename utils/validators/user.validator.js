const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email().max(255),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().max(500).allow('', null),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = { updateProfileSchema, changePasswordSchema };
