const Joi = require('joi');

const createRatingSchema = Joi.object({
  stars: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().max(1000).allow('', null),
});

module.exports = { createRatingSchema };
