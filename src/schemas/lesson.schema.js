const joi = require('joi');

const lessonSchema = joi.object({
  title: joi.string().min(3).max(100).required(),
  content: joi.string().min(10).max(5000).required(),
  videoId: joi.string().uri().optional(),
  courseId: joi.number().integer().positive().required(),
  sequence: joi.number().integer().positive().required(),
});

module.exports = lessonSchema;
