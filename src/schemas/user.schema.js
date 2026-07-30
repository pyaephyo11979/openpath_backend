const joi = require('joi');

const userSchema = joi.object({
  name: joi.string().min(3).max(30).required(),
  email: joi
    .string()
    .email()
    .pattern(new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'))
    .required(),
  password: joi
    .string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .required(),
  role: joi.string().valid('user', 'admin').default('user'),
});

module.exports = userSchema;
