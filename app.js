require('dotenv').config()
const path = require('path')
const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')

const app = express()

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

// ** import and init db
require('./configs/mongodbConfig')

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) : ['*']

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin || // allow Postman, server-to-server requests
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(logger('dev'))
app.use(
  express.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer
    }
  })
)
app.use(express.urlencoded({ extended: false }))
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use('/api', require('./routes/index'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500).json({ error: err.message })
})

module.exports = app
