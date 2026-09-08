const Joi = require('joi');

const updateStatus = {
  params: Joi.object().keys({
    logId: Joi.string()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid order ID');
        return value;
      })
      .required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid(
        'pending', 'taken', 'accepted', 'delivered', 
        'cancelled', 'skipped', 'paused', 'on_hold', 
        'rejected', 'missed', 'refunded'
      )
      .required(),
    notes: Joi.string().allow(''),
  }),
};

const bulkUpdateStatus = {
  body: Joi.object().keys({
    logIds: Joi.array()
      .items(
        Joi.string().custom((value, helpers) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid order ID in array');
          return value;
        })
      )
      .min(1)
      .required(),
    status: Joi.string()
      .valid(
        'pending', 'taken', 'accepted', 'delivered', 
        'cancelled', 'skipped', 'paused', 'on_hold', 
        'rejected', 'missed', 'refunded'
      )
      .required(),
  }),
};

module.exports = {
  updateStatus,
  bulkUpdateStatus,
};
