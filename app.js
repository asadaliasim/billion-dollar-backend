require('dotenv').config()
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

app.use(express.static(__dirname))

// ** import and init db
require('./configs/mongodbConfig')

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(logger('dev'))
app.use(
  express.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer)
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname))

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
