const Joi = require('joi');

const createQuotationSchema = Joi.object({
  amount: Joi.number().positive().required(),
  deliveryDate: Joi.date().required(),
  deliveryMethod: Joi.string().max(100).allow('', null),
  message: Joi.string().max(1000).allow('', null),
});

module.exports = { createQuotationSchema };
