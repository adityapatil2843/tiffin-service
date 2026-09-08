const Joi = require('joi');

const login = {
  body: Joi.object().keys({
    userId: Joi.string().trim(), // AP0001
    email: Joi.string().email().trim(), // owners/superadmins
    password: Joi.string().required(),
  }).xor('userId', 'email'), // Must have one of these
};

module.exports = {
  login,
};
