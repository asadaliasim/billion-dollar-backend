const apis = require('express').Router()

apis.use('/blocks', require('./blocks'))

module.exports = apis
