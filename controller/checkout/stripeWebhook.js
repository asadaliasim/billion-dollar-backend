const httpErrors = require('http-errors')
const { Payment } = require('../../models')
const { getStripe } = require('../../utils/stripeClient')
const { creditReferralForPayment } = require('../../utils/creditReferral')

module.exports = async (req, res, next) => {
  const stripe = getStripe()
  const sig = req.headers['stripe-signature']

  if (!sig) return next(httpErrors(400, 'Missing Stripe signature'))
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return next(httpErrors(500, 'STRIPE_WEBHOOK_SECRET is not configured'))
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return next(httpErrors(400, `Webhook Error: ${err.message}`))
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const payment = await Payment.findOne({ stripeSessionId: session.id })

      if (payment) {
        payment.status = 'paid'
        payment.stripePaymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id
        payment.customerEmail = session.customer_details?.email || payment.customerEmail
        await payment.save()
        await creditReferralForPayment(payment)
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      await Payment.updateOne(
        { stripeSessionId: session.id, status: 'pending' },
        { status: 'expired' }
      )
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error(err)
    next(httpErrors(500, err.message))
  }
}
