const Joi = require('joi');

const generateBill = {
  body: Joi.object().keys({
    userId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid user ID');
      return value;
    }).required(),
    month: Joi.number().min(1).max(12).required(),
    year: Joi.number().min(2020).required(),
  }),
};

const recordPayment = {
  params: Joi.object().keys({
    billId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid bill ID');
      return value;
    }).required(),
  }),
  body: Joi.object().keys({
    amount: Joi.number().positive().required(),
    paymentMode: Joi.string().valid('cash', 'upi', 'bank_transfer', 'other').default('cash'),
    reference: Joi.string().allow(''),
    notes: Joi.string().allow(''),
  }),
};

module.exports = {
  generateBill,
  recordPayment,
};
