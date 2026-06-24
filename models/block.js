const mongoose = require('mongoose')

const Schema = mongoose.Schema

const blockSchema = new Schema(
  {
    walletAddress: { type: String },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    customerEmail: { type: String },
    amountPaidCents: { type: Number },
    startCoord: { type: String },
    endCoord: { type: String },
    image: { type: String },
    addUrl: { type: String },
    addDescription: { type: String },
    country: { type: String },
    customText: { type: String },
    textUrl: { type: String },
    backgroundColor: { type: String },
    textColor: { type: String }
  },
  { timestamps: true }
)

const Block = mongoose.model('blocks', blockSchema)

module.exports = Block
