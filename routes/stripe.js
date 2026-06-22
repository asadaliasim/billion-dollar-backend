const stripeRoutes = require('express').Router()
const { stripeWebhook } = require('../controller/checkout')

stripeRoutes.post('/webhook', stripeWebhook)

module.exports = stripeRoutes
