const PIXELS_PER_BLOCK = parseInt(process.env.PIXELS_PER_BLOCK || '100', 10)
const REFERRAL_COMMISSION_RATE = parseFloat(process.env.REFERRAL_COMMISSION_RATE || '0.2')

function blocksToPixels(blockCount) {
  return (blockCount || 0) * PIXELS_PER_BLOCK
}

function commissionFromPixels(pixelsSold) {
  return Math.round(pixelsSold * REFERRAL_COMMISSION_RATE)
}

function commissionFromRevenueCents(revenueCents) {
  return Math.round((revenueCents || 0) * REFERRAL_COMMISSION_RATE)
}

module.exports = {
  PIXELS_PER_BLOCK,
  REFERRAL_COMMISSION_RATE,
  blocksToPixels,
  commissionFromPixels,
  commissionFromRevenueCents
}
