const Joi = require('joi');

const tailorProfileSchema = Joi.object({
  specialization: Joi.string().max(255).allow('', null),
  experience: Joi.number().integer().min(0).allow(null),
  bio: Joi.string().max(1000).allow('', null),
  shopName: Joi.string().max(255).allow('', null),
  shopAddress: Joi.string().max(500).allow('', null),
  shopPhone: Joi.string().max(20).allow('', null),
  nicNumber: Joi.string().max(20).allow('', null),
});

module.exports = { tailorProfileSchema };
