const { Block, Payment } = require('../models')
const { toBounds, rectsOverlap } = require('./parseCoords')

async function hasOverlap(startCoord, endCoord, excludeSessionId = null) {
  const candidate = toBounds(startCoord, endCoord)
  if (!candidate) return true

  const blocks = await Block.find().select('startCoord endCoord')
  for (const block of blocks) {
    const existing = toBounds(block.startCoord, block.endCoord)
    if (rectsOverlap(candidate, existing)) return true
  }

  const pendingPayments = await Payment.find({
    status: { $in: ['pending', 'paid'] },
    ...(excludeSessionId ? { stripeSessionId: { $ne: excludeSessionId } } : {})
  }).select('startCoord endCoord status expiresAt')

  const now = new Date()
  for (const payment of pendingPayments) {
    if (payment.status === 'pending' && payment.expiresAt && payment.expiresAt < now) {
      continue
    }
    const reserved = toBounds(payment.startCoord, payment.endCoord)
    if (rectsOverlap(candidate, reserved)) return true
  }

  return false
}

module.exports = { hasOverlap }
