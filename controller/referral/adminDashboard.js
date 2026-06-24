const httpErrors = require('http-errors')
const { Payment, Referral } = require('../../models')
const { buildReferralMetrics } = require('./stats')
const { REFERRAL_COMMISSION_RATE } = require('../../utils/referralCommission')
const { isValidAdminSecret } = require('../../utils/validateAdminSecret')

async function getPaymentStatsByCode() {
  const grouped = await Payment.aggregate([
    {
      $match: {
        referralCredited: true,
        referralCode: { $exists: true, $nin: [null, ''] }
      }
    },
    {
      $group: {
        _id: '$referralCode',
        conversions: { $sum: 1 },
        totalBlocksSold: { $sum: '$blockCount' },
        totalRevenueCents: { $sum: '$amountCents' }
      }
    }
  ])

  return Object.fromEntries(
    grouped.map((row) => [
      row._id,
      {
        conversions: row.conversions,
        totalBlocksSold: row.totalBlocksSold,
        totalRevenueCents: row.totalRevenueCents
      }
    ])
  )
}

module.exports = async (req, res, next) => {
  try {
    const { secret } = req.params
    if (!secret || !isValidAdminSecret(secret)) {
      return next(httpErrors(404, 'Not found'))
    }

    const [registered, statsByCode] = await Promise.all([
      Referral.find({}).sort({ name: 1, code: 1 }).lean(),
      getPaymentStatsByCode()
    ])

    const allCodes = new Set([
      ...registered.map((row) => row.code),
      ...Object.keys(statsByCode)
    ])

    const influencers = [...allCodes]
      .map((code) => {
        const registeredRow = registered.find((row) => row.code === code)
        const paymentStats = statsByCode[code]

        return buildReferralMetrics({
          code,
          name: registeredRow?.name || '',
          conversions: paymentStats?.conversions || 0,
          totalBlocksSold: paymentStats?.totalBlocksSold || 0,
          totalRevenueCents: paymentStats?.totalRevenueCents || 0
        })
      })
      .sort(
        (a, b) =>
          b.totalRevenueCents - a.totalRevenueCents ||
          a.name.localeCompare(b.name) ||
          a.code.localeCompare(b.code)
      )

    const totals = influencers.reduce(
      (acc, row) => {
        acc.conversions += row.conversions
        acc.totalBlocksSold += row.totalBlocksSold
        acc.pixelsSold += row.pixelsSold
        acc.commissionPixels += row.commissionPixels
        acc.totalRevenueCents += row.totalRevenueCents
        acc.commissionCents += row.commissionCents
        return acc
      },
      {
        conversions: 0,
        totalBlocksSold: 0,
        pixelsSold: 0,
        commissionPixels: 0,
        totalRevenueCents: 0,
        commissionCents: 0
      }
    )

    return res.status(200).json({
      commissionRate: REFERRAL_COMMISSION_RATE,
      influencerCount: influencers.length,
      totals,
      influencers
    })
  } catch (err) {
    console.error(err)
    next(httpErrors(500, err.message))
  }
}
