const apis = require('express').Router()

apis.use('/blocks', require('./blocks'))
apis.use('/checkout', require('./checkout'))
apis.use('/stripe', require('./stripe'))

module.exports = apis
