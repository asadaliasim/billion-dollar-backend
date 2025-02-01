const httpErrors = require('http-errors')

const { Block } = require('../../models')
const { addBlocksValidation } = require('../../joiSchemas')

module.exports = async (req, res, next) => {
  let payload = req.body

  try {
    const { error } = addBlocksValidation.validate(payload)
    if (error) return next(httpErrors(400, error.message))

    if (req.file) {
      payload = {
        ...payload,
        image: req.file.filename
      }
    }

    await Block.create(payload)

    return res.status(200).json({ message: `Data stored` })
  } catch (err) {
    console.log(err)
    next(httpErrors(500, err.message))
  }
}
