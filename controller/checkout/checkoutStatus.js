const httpErrors = require('http-errors')
const { Payment } = require('../../models')
const { getStripe } = require('../../utils/stripeClient')
const { creditReferralForPayment } = require('../../utils/creditReferral')

module.exports = async (req, res, next) => {
  try {
    const { sessionId } = req.params
    if (!sessionId) return next(httpErrors(400, 'Session ID is required'))

    let payment = await Payment.findOne({ stripeSessionId: sessionId })
    if (!payment) return next(httpErrors(404, 'Checkout session not found'))

    if (payment.status === 'pending') {
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.status === 'complete' && session.payment_status === 'paid') {
        payment.status = 'paid'
        payment.stripePaymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id
        payment.customerEmail = session.customer_details?.email || payment.customerEmail
        await payment.save()
        await creditReferralForPayment(payment)
      } else if (session.status === 'expired') {
        payment.status = 'expired'
        await payment.save()
      }
    }

    if (
      payment.status === 'pending' &&
      payment.expiresAt &&
      payment.expiresAt < new Date()
    ) {
      payment.status = 'expired'
      await payment.save()
    }

    payment = await Payment.findOne({ stripeSessionId: sessionId })

    if (
      payment.status === 'paid' &&
      payment.referralCode &&
      !payment.referralCredited
    ) {
      payment = await creditReferralForPayment(payment)
    }

    return res.status(200).json({
      status: payment.status,
      sessionId: payment.stripeSessionId,
      blockCount: payment.blockCount,
      amountCents: payment.amountCents,
      startCoord: payment.startCoord,
      endCoord: payment.endCoord
    })
  } catch (err) {
    console.error(err)
    next(httpErrors(500, err.message))
  }
}
