const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    minLength: 5,
    required: true
  },
  description: {
    type: String,
    minLength: 5,
    required: true
  },
  status: {
    type: String,
    enum: ['not started', 'pending', 'completed'],
    default: 'not started'
  },
  user: {
    type: String,
    ref: 'User'
  }
})

taskSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Task', taskSchema)
