const joi = require('joi')

module.exports = joi.object({
  blockCount: joi.number().integer().min(1).required(),
  startCoord: joi.string().required(),
  endCoord: joi.string().required(),
  frontendOrigin: joi.string().uri({ scheme: ['http', 'https'] }).optional()
})
