const Joi = require('joi');

const createRequest = {
  body: Joi.object().keys({
    type: Joi.string().valid('cancellation', 'extra').required(),
    date: Joi.date().iso().required(),
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner').required(),
    reason: Joi.string().allow(''),
    
    // Only for extra tiffins
    deliveryAddress: Joi.string().when('type', {
      is: 'extra',
      then: Joi.string().allow(''),
    }),
  }),
};

const reviewRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid request ID');
      return value;
    }).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('approved', 'rejected').required(),
    reviewNote: Joi.string().allow(''),
  }),
};

module.exports = {
  createRequest,
  reviewRequest,
};
