function normalizeReferralCode(raw) {
  if (!raw) return null

  const normalized = String(raw).trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (normalized.length < 3 || normalized.length > 30) return null

  return normalized
}

module.exports = { normalizeReferralCode }
