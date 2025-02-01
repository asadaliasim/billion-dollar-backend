const mongoose = require('mongoose')

const Schema = mongoose.Schema

const blockSchema = new Schema(
  {
    walletAddress: { type: String },
    startCoord: { type: String },
    endCoord: { type: String },
    image: { type: String },
    addUrl: { type: String },
    addDescription: { type: String },
    customText: { type: String },
    textUrl: { type: String },
    backgroundColor: { type: String },
    textColor: { type: String }
  },
  { timestamps: true }
)

const Block = mongoose.model('blocks', blockSchema)

module.exports = Block
