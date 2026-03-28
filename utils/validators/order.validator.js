const Joi = require('joi');

const createOrderSchema = Joi.object({
  category: Joi.string().max(100).required(),
  clothType: Joi.string().max(100).required(),
  size: Joi.string().max(10).allow('', null),
  measurements: Joi.object().allow(null),
  material: Joi.string().max(255).allow('', null),
  deliveryOption: Joi.string().valid('standard', 'express', 'custom').default('standard'),
  customDate: Joi.date().allow(null),
  notes: Joi.string().max(1000).allow('', null),
});

const progressSchema = Joi.object({
  progress: Joi.number().integer().min(0).max(100).required(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'in_work', 'dispatched', 'delivered').required(),
});

module.exports = { createOrderSchema, progressSchema, statusSchema };
