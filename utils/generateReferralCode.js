const crypto = require('crypto')
const { Referral } = require('../models')
const { normalizeReferralCode } = require('./normalizeReferralCode')

function slugFromName(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
}

function randomCode(prefix = 'inf') {
  return `${prefix}-${crypto.randomBytes(4).toString('hex')}`.slice(0, 30)
}

async function isCodeTaken(code) {
  const existing = await Referral.findOne({ code }).select('_id').lean()
  return Boolean(existing)
}

async function generateUniqueReferralCode(name) {
  let base = slugFromName(name)
  if (!base || base.length < 3) {
    base = randomCode('inf')
  }

  if (!(await isCodeTaken(base))) {
    return base
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = crypto.randomBytes(2).toString('hex')
    const candidate = `${base}-${suffix}`.slice(0, 30)
    if (normalizeReferralCode(candidate) && !(await isCodeTaken(candidate))) {
      return candidate
    }
  }

  let fallback = randomCode('inf')
  while (await isCodeTaken(fallback)) {
    fallback = randomCode('inf')
  }

  return fallback
}

module.exports = { generateUniqueReferralCode, slugFromName }
