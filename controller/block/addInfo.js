const httpErrors = require('http-errors')

const { Block, Payment } = require('../../models')
const { addBlocksValidation } = require('../../joiSchemas')

module.exports = async (req, res, next) => {
  let payload = req.body

  try {
    const { error } = addBlocksValidation.validate(payload)
    if (error) return next(httpErrors(400, error.message))

    const payment = await Payment.findOne({ stripeSessionId: payload.stripeSessionId })
    if (!payment) return next(httpErrors(402, 'Payment not found for this session'))
    if (payment.status === 'used') {
      return next(httpErrors(409, 'This payment session has already been used'))
    }
    if (payment.status !== 'paid') {
      return next(httpErrors(402, 'Payment has not been completed'))
    }
    if (payment.startCoord !== payload.startCoord || payment.endCoord !== payload.endCoord) {
      return next(httpErrors(400, 'Coordinates do not match the paid checkout session'))
    }

    if (req.file) {
      payload = {
        ...payload,
        image: req.file.filename
      }
    }

    await Block.create({
      ...payload,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      customerEmail: payment.customerEmail,
      amountPaidCents: payment.amountPaidCents
    })

    payment.status = 'used'
    await payment.save()

    return res.status(200).json({ message: 'Data stored' })
  } catch (err) {
    console.error(err)
    next(httpErrors(500, err.message))
  }
}
