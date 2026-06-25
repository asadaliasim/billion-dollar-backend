const referralRoutes = require('express').Router()
const { stats, adminDashboard, createInfluencer } = require('../controller/referral')

referralRoutes.get('/admin/:secret/dashboard', adminDashboard)
referralRoutes.post('/admin/:secret/influencers', createInfluencer)
referralRoutes.get('/stats/:code', stats)

module.exports = referralRoutes
