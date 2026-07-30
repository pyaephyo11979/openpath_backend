const joi = require('joi');

const courseSchema = joi.object({
  title: joi.string().min(3).max(100).required(),
  description: joi.string().min(10).max(1000).required(),
  imageUrl: joi.string().uri().optional(),
  price: joi.number().min(0).required(),
  published: joi.boolean().default(false),
});

module.exports = courseSchema;
