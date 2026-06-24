const joi = require('joi')

module.exports = joi.object({
  walletAddress: joi.string().optional(),
  stripeSessionId: joi.string().required(),
  startCoord: joi.string().required(),
  endCoord: joi.string().required(),
  addUrl: joi.string().optional(),
  addDescription: joi.string().optional(),
  country: joi.string().trim().min(1).required(),
  customText: joi.string().optional(),
  textUrl: joi.string().optional(),
  backgroundColor: joi.string().optional(),
  textColor: joi.string().optional()
})
