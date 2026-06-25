const mongoose = require('mongoose')

const Schema = mongoose.Schema

const referralSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, trim: true, default: '' },
    conversions: { type: Number, default: 0 },
    totalRevenueCents: { type: Number, default: 0 },
    totalBlocksSold: { type: Number, default: 0 }
  },
  { timestamps: true }
)

const Referral = mongoose.model('referrals', referralSchema)

module.exports = Referral
