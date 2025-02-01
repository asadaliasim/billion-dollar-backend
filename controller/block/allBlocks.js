// ** Package Imports
const httpErrors = require('http-errors')
const { Block } = require('../../models')

module.exports = async (req, res, next) => {
  try {
    const info = await Block.find().select('-_id -createdAt -updatedAt -__v')
    return res.status(200).json(info)
  } catch (err) {
    next(httpErrors(500, err.message))
  }
}
