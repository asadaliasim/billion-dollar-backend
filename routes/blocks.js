const authRoutes = require('express').Router()
const { addInfo, allBlocks } = require('../controller/block')
const useUploadFile = require('../middleware/useUploadFile')

authRoutes.get('/', allBlocks).post('/add', useUploadFile, addInfo)

module.exports = authRoutes
