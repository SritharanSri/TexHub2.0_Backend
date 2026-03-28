const Joi = require('joi');

const verifyTailorSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  verificationNote: Joi.string().max(500).allow('', null),
});

const verifyPaymentSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  rejectionReason: Joi.string().max(500).when('status', {
    is: 'rejected',
    then: Joi.required(),
    otherwise: Joi.allow('', null),
  }),
});

const resolveComplaintSchema = Joi.object({
  status: Joi.string().valid('resolved', 'escalated').required(),
  resolution: Joi.string().max(1000).required(),
});

const bankDetailSchema = Joi.object({
  bankName: Joi.string().max(100).required(),
  accountName: Joi.string().max(100).required(),
  accountNumber: Joi.string().max(50).required(),
  branchName: Joi.string().max(100).allow('', null),
  isActive: Joi.boolean().default(true),
});

module.exports = { verifyTailorSchema, verifyPaymentSchema, resolveComplaintSchema, bankDetailSchema };
