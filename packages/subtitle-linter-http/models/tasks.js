const naturalCompare = require('string-natural-compare')
const { glob, hasMagic } = require('glob')
const fs = require('fs')

const { verifyTasks, taskResults } = require('./task-handler.js')
const events = require('./events.js')

const tasks = []
const taskLimit = 20

exports.getTasks = () => tasks
exports.addTask = async (input) => {
  let files = input.files
  if (!files && input.file) {
    const file = input.file
      // Replace Windows slashes with forward slashes
      .replace(/\\/g, '/')
      // Escape brackets
      .replace(/([\[\]])/g, '\\$1')

    files = hasMagic(file) ? await glob(file) : [input.file]
  }

  if (!files || !files.length) throw Error('file is missing')
  files.sort(naturalCompare)

  const task = {
    id: Date.now().toString(36).toUpperCase(),
    options: input.options,
    state: 'pending',
    opened: false,
    files
  }

  tasks.push(task)

  // Limit the number of tasks
  if (tasks.length < taskLimit) tasks.splice(0, tasks.length - taskLimit)

  verifyTasks(tasks)

  events.sendEvent('task', {
    type: 'task:' + task.state,
    id: task.id
  })

  return task
}

exports.getTask = async id => {
  const task = tasks.find(e => e.id === id)
  if (!task) throw createError(404, 'task not found')

  task.opened = true

  const result = taskResults.get(task)
  const content = result && await Promise.all(
    task.files.map(file => fs.promises.readFile(file, 'utf-8'))
  )

  return { ...task, result, content }
}
