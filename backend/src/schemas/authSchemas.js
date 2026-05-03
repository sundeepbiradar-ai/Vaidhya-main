const Joi = require('joi');

const emailSchema = Joi.object({
  email: Joi.string().email().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { emailSchema, loginSchema };
