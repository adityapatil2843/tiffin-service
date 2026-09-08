const Joi = require('joi');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  if (schema.body) validSchema.body = schema.body;
  if (schema.query) validSchema.query = schema.query;
  if (schema.params) validSchema.params = schema.params;

  const object = {};
  if (req.body && Object.keys(req.body).length > 0) object.body = req.body;
  if (req.query && Object.keys(req.query).length > 0) object.query = req.query;
  if (req.params && Object.keys(req.params).length > 0) object.params = req.params;

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
