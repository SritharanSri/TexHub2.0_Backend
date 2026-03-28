const Joi = require('joi');

const bankDepositSchema = Joi.object({
  amount: Joi.number().positive().required(),
  bankName: Joi.string().max(100).allow('', null),
  depositorName: Joi.string().max(100).allow('', null),
  depositDate: Joi.date().allow(null),
  referenceNumber: Joi.string().max(100).allow('', null),
});

const cardPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  cardLast4: Joi.string().length(4).required(),
});

module.exports = { bankDepositSchema, cardPaymentSchema };
