const Joi = require('joi');

const createOwner = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().required().min(6),
    
    // Service Details
    serviceName: Joi.string().required(),
    servicePrefix: Joi.string().required().max(4).uppercase(),
    address: Joi.string().allow(''),
    city: Joi.string().allow(''),
  }),
};

const updateOwner = {
  params: Joi.object().keys({
    ownerId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"ownerId" must be a valid mongo id');
      }
      return value;
    }).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    status: Joi.string().valid('active', 'inactive', 'suspended'),
  }).min(1),
};

module.exports = {
  createOwner,
  updateOwner,
};
