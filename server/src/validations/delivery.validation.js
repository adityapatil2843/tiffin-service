const Joi = require('joi');

const updateStatus = {
  params: Joi.object().keys({
    deliveryId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid delivery ID');
      return value;
    }).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('out_for_delivery', 'delivered', 'missed').required(),
    notes: Joi.string().allow(''),
  }),
};

const confirmDelivery = {
  params: Joi.object().keys({
    deliveryId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid delivery ID');
      return value;
    }).required(),
  }),
};

module.exports = {
  updateStatus,
  confirmDelivery,
};
