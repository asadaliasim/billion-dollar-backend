const util = require('util')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { getDestFolderPath } = require('../utils')

const MAX_FILE_SIZE = 30 * 1024 * 1024

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get the imageType from the query parameters
    // const imageType = req.query.imageType
    //temp used static as we have only blocks

    const destPath = '/var/www/billion-dollar-backend/public/blocks'
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })
    console.log(`Saving file to: ${destPath}`)
    cb(null, destPath)
  },
  filename: (req, file, cb) => {
    const FILE_NAME = `${Date.now()}${path.extname(file.originalname)}`
    cb(null, FILE_NAME)
  }
})

//** Utility function to check file type.
function checkFileType(file, next) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  // Check mime
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) return next(null, true)

  return next({ code: 400, message: 'Please upload a file!' })
}

const uploadFile = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).single('file')

module.exports = util.promisify(uploadFile)
