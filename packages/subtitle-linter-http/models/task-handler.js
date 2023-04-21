const linter = require('subtitle-linter')
const events = require('./events.js')

const taskResults = new WeakMap()
exports.taskResults = taskResults

let isActive = false
function verifyTasks (tasks) {
  if (isActive) return
  const pendingTask = tasks.find(e => e.state === 'pending')
  if (pendingTask) processTask(pendingTask).then(() => verifyTasks(tasks))
}
exports.verifyTasks = verifyTasks

async function processTask (task) {
  isActive = true

  const result = {errors: []}
  taskResults.set(task, result)

  let error
  try {
    const lintingProcess = linter(task.files, task.options)
    lintingProcess.on('result', error => {
      result.errors.push(error)
    })
    await lintingProcess.finished
  } catch (e) {
    error = e
    console.log(e)
  }

  taskResults.set(task, error ? { lintError: error } : result)
  task.state = result ? 'finished' : 'failed'
  task.opened = false

  events.sendEvent('task', {
    type: 'task:' + task.state,
    id: task.id
  })

  isActive = false
}
