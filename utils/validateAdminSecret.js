function isValidAdminSecret(secret) {
  const configured = process.env.REFERRAL_ADMIN_SECRET
  if (!configured) return false
  return secret === configured
}

module.exports = { isValidAdminSecret }
