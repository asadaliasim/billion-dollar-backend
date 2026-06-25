const mongoose = require('mongoose')

const Schema = mongoose.Schema

const paymentSchema = new Schema(
  {
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'expired', 'used'],
      default: 'pending'
    },
    blockCount: { type: Number, required: true },
    amountCents: { type: Number, required: true },
    startCoord: { type: String, required: true },
    endCoord: { type: String, required: true },
    customerEmail: { type: String },
    expiresAt: { type: Date },
    referralCode: { type: String, lowercase: true },
    referralCredited: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const Payment = mongoose.model('payments', paymentSchema)

module.exports = Payment
