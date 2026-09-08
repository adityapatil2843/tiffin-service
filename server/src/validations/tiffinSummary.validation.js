const Joi = require('joi');

const dateRange = {
  query: Joi.object().keys({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().required(),
  }),
};

const userHistory = {
  params: Joi.object().keys({
    userId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid user ID');
      return value;
    }).required(),
  }),
  query: Joi.object().keys({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().required(),
  }),
};

module.exports = {
  dateRange,
  userHistory,
};
