const Joi = require('joi');

const createComplaintSchema = Joi.object({
  orderId: Joi.string().uuid().allow(null),
  againstUserId: Joi.string().uuid().required(),
  subject: Joi.string().max(255).required(),
  message: Joi.string().max(2000).required(),
});

module.exports = { createComplaintSchema };
