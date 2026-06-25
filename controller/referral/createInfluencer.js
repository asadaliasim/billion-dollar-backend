const httpErrors = require('http-errors')
const { Referral } = require('../../models')
const { createInfluencerValidation } = require('../../joiSchemas')
const { normalizeReferralCode } = require('../../utils/normalizeReferralCode')
const { generateUniqueReferralCode } = require('../../utils/generateReferralCode')
const { isValidAdminSecret } = require('../../utils/validateAdminSecret')
const { buildReferralMetrics } = require('./stats')

module.exports = async (req, res, next) => {
  try {
    const { secret } = req.params
    if (!secret || !isValidAdminSecret(secret)) {
      return next(httpErrors(404, 'Not found'))
    }

    const { error, value } = createInfluencerValidation.validate(req.body)
    if (error) return next(httpErrors(400, error.message))

    const name = value.name.trim()
    let code = normalizeReferralCode(value.code)

    if (code) {
      const existing = await Referral.findOne({ code })
      if (existing) {
        existing.name = name
        await existing.save()

        return res.status(200).json({
          message: 'Influencer updated',
          influencer: buildReferralMetrics({
            code: existing.code,
            name: existing.name,
            conversions: existing.conversions,
            totalBlocksSold: existing.totalBlocksSold,
            totalRevenueCents: existing.totalRevenueCents
          })
        })
      }
    } else {
      code = await generateUniqueReferralCode(name)
    }

    const influencer = await Referral.create({ code, name })

    return res.status(201).json({
      message: 'Influencer added',
      influencer: buildReferralMetrics({
        code: influencer.code,
        name: influencer.name,
        conversions: 0,
        totalBlocksSold: 0,
        totalRevenueCents: 0
      })
    })
  } catch (err) {
    console.error(err)
    next(httpErrors(500, err.message))
  }
}
