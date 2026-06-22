const checkoutRoutes = require('express').Router()
const { createCheckout, checkoutStatus } = require('../controller/checkout')

checkoutRoutes.post('/create', createCheckout)
checkoutRoutes.get('/status/:sessionId', checkoutStatus)

module.exports = checkoutRoutes
