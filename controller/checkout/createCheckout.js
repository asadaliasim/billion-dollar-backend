const httpErrors = require('http-errors')
const { Payment } = require('../../models')
const { createCheckoutValidation } = require('../../joiSchemas')
const { getStripe } = require('../../utils/stripeClient')
const { blockCountFromCoords } = require('../../utils/parseCoords')
const { hasOverlap } = require('../../utils/overlapCheck')
const { resolveFrontendUrl } = require('../../utils/resolveFrontendUrl')

const CHECKOUT_TTL_MINUTES = 30

module.exports = async (req, res, next) => {
  try {
    const { error, value } = createCheckoutValidation.validate(req.body)
    if (error) return next(httpErrors(400, error.message))

    const { startCoord, endCoord } = value
    const computedBlockCount = blockCountFromCoords(startCoord, endCoord)

    if (computedBlockCount < 1) {
      return next(httpErrors(400, 'Invalid coordinates'))
    }

    if (computedBlockCount !== value.blockCount) {
      return next(httpErrors(400, 'Block count does not match selected area'))
    }

    const overlap = await hasOverlap(startCoord, endCoord)
    if (overlap) {
      return next(httpErrors(409, 'Selected area overlaps with an existing or reserved block'))
    }

    const pricePerBlockCents = parseInt(process.env.STRIPE_PRICE_PER_BLOCK_CENTS || '1000', 10)
    const amountCents = value.blockCount * pricePerBlockCents
    const frontendUrl = resolveFrontendUrl(value.frontendOrigin)
    const expiresAt = new Date(Date.now() + CHECKOUT_TTL_MINUTES * 60 * 1000)

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pricePerBlockCents,
            product_data: {
              name: 'Global Fan Wall - Pixel Block',
              description: `${value.blockCount} block(s) · ${startCoord} to ${endCoord}`
            }
          },
          quantity: value.blockCount
        }
      ],
      metadata: {
        startCoord,
        endCoord,
        blockCount: String(value.blockCount)
      },
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?payment=cancel`,
      expires_at: Math.floor(expiresAt.getTime() / 1000)
    })

    await Payment.create({
      stripeSessionId: session.id,
      status: 'pending',
      blockCount: value.blockCount,
      amountCents,
      startCoord,
      endCoord,
      expiresAt
    })

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      amountCents,
      blockCount: value.blockCount
    })
  } catch (err) {
    console.error(err)
    next(httpErrors(500, err.message))
  }
}
