const { Payment, Referral } = require('../models')

async function creditReferralForPayment(payment) {
  if (!payment?.referralCode) {
    return payment
  }

  const reserved = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      referralCode: { $exists: true, $nin: [null, ''] },
      referralCredited: { $ne: true }
    },
    { $set: { referralCredited: true } },
    { new: false }
  )

  if (!reserved) {
    return Payment.findById(payment._id)
  }

  await Referral.findOneAndUpdate(
    { code: reserved.referralCode },
    {
      $inc: {
        conversions: 1,
        totalRevenueCents: reserved.amountCents || 0,
        totalBlocksSold: reserved.blockCount || 0
      },
      $setOnInsert: { code: reserved.referralCode }
    },
    { upsert: true }
  )

  return Payment.findById(payment._id)
}

module.exports = { creditReferralForPayment }
