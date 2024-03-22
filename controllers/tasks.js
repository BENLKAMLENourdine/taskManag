const tasksRouter = require('express').Router()
const Task = require('../models/task')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const verifyToken = (request, response, next) => {
    const token = getTokenFrom(request)

    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    
    request.userId = decodedToken.id
    next()
}

tasksRouter.get('/', verifyToken, async (request, response) => {
  const tasks = await Task.find({ user: request.userId }).populate('user', { username: 1, name: 1 })
  response.json(tasks)
})

tasksRouter.get('/:id', async (request, response, next) => {
  try {
    const task = await Task.findById(request.params.id)
    if (task) {
      response.json(task)
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

tasksRouter.post('/', verifyToken, async (request, response, next) => {
  try {
    const body = request.body

    const token = getTokenFrom(request)

    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }


    const user = await User.findById(decodedToken.id)

    const task = new Task({
      title: body.title,
      description: body.description,
      user: user.id
    })

    const savedTask = await task.save()

    user.tasks = user.tasks.concat(savedTask._id)
    await user.save()
    response.status(201).json(savedTask)
  } catch (error) {
    next(error)
  }
})

tasksRouter.delete('/:id', verifyToken, async (request, response, next) => {
  try {
    await Task.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

tasksRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const task = {
    title: body.title,
    description: body.description,
    status: body.status
  }

  Task.findByIdAndUpdate(request.params.id, task, { new: true })
    .then(updatedTask => {
      response.json(updatedTask)
    })
    .catch(error => next(error))
})

module.exports = tasksRouter