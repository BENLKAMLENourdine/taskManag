const config = require('./utils/config')
const express = require('express')

const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const tasksRouter = require('./controllers/tasks')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const mongoose = require('mongoose')
const app = express()

mongoose.set('strictQuery',false)
logger.info('connecting to MONGODB')
mongoose.connect(config.MONGO_URL, {
    useNewURLParser: true,
  }, 6000000).
  then(() => logger.info('connected to MONGODB'))
  .catch(error => logger.error('error connecting to MONGODB', error.message))



app.use(express.json())
app.use(middleware.requestLogger)

// tasks APIs
app.use('/api/tasks', tasksRouter)

// users APIs
app.use('/api/users', usersRouter)

// login APIs
app.use('/api/login', loginRouter)

app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)


module.exports = app