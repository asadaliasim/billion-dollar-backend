const Stripe = require('stripe')

let stripe = null

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripe
}

module.exports = { getStripe }
