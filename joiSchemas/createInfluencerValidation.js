const joi = require('joi')

module.exports = joi.object({
  name: joi.string().trim().min(1).max(80).required(),
  code: joi
    .string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]{3,30}$/)
    .optional()
    .allow('', null)
})
