require('dotenv').config({})
const mongoose = require('mongoose')

const uri = process.env.MONGO_DB_URI

const configs = {
  strictQuery: true
}

const connect = async () => {
  try {
    await mongoose.connect(uri)
    for (const [key, value] of Object.entries(configs)) mongoose.set(key, value)

    console.log('Connected to DB Successfully.')
  } catch (err) {
    console.log(err)
    console.error(err.message)
  }
}

connect()
module.exports = mongoose
