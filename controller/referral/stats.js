const httpErrors = require('http-errors')
const { Referral } = require('../../models')
const { normalizeReferralCode } = require('../../utils/normalizeReferralCode')
const {
  blocksToPixels,
  commissionFromPixels,
  commissionFromRevenueCents,
  REFERRAL_COMMISSION_RATE
} = require('../../utils/referralCommission')

function buildReferralMetrics({ code, name, conversions, totalBlocksSold, totalRevenueCents }) {
  const pixelsSold = blocksToPixels(totalBlocksSold)
  const commissionPixels = commissionFromPixels(pixelsSold)
  const commissionCents = commissionFromRevenueCents(totalRevenueCents)

  return {
    code,
    name: name || '',
    conversions: conversions || 0,
    totalBlocksSold: totalBlocksSold || 0,
    pixelsSold,
    commissionPixels,
    totalRevenueCents: totalRevenueCents || 0,
    commissionCents,
    commissionRate: REFERRAL_COMMISSION_RATE
  }
}

module.exports = async (req, res, next) => {
  try {
    const code = normalizeReferralCode(req.params.code)
    if (!code) return next(httpErrors(400, 'Invalid referral code'))

    const referral = await Referral.findOne({ code })

    return res.status(200).json(
      buildReferralMetrics({
        code,
        conversions: referral?.conversions || 0,
        totalBlocksSold: referral?.totalBlocksSold || 0,
        totalRevenueCents: referral?.totalRevenueCents || 0
      })
    )
  } catch (err) {
    console.error(err)
    next(httpErrors(500, err.message))
  }
}

module.exports.buildReferralMetrics = buildReferralMetrics
