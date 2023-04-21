const Throttle = require('promise-parallel-throttle')
const { getSiblings } = require('./siblings.js')
const lintData = require('./lint.js')
const Rules = require('./rules.js')
const events = require('events')
const fs = require('fs')

function lintMain (files, opt) {
  const emitter = new events.EventEmitter()
  const options = Object.assign({
    parallelization: 3,
    rules: []
  }, opt)

  // Load and create rules from options
  const rules = new Rules()

  const filePromises = files.map(file => async () => {
    const ruleHandlers = []
    const context = {
      report (error) {
        error.file = file
        emitter.emit('result', error)
      }
    }

    for (let ruleOption of options.rules) {
      if (typeof ruleOption === 'string') {
        ruleOption = [ruleOption]
      }

      const ruleName = ruleOption[0]
      const ruleOptions = ruleOption[1] || {}
      const rule = rules.get(ruleName)
      const context = {
        report (error) {
          error.file = file
          error.rule = ruleName
          emitter.emit('result', error)
        }
      }

      ruleHandlers.push(rule.create(context, ruleOptions))
    }

    const data = await fs.promises.readFile(file, 'utf-8')
    const siblings = await getSiblings(file)

    await lintData(data, context, siblings, ruleHandlers)
  })

  const finished = Throttle.all(filePromises, {
    maxInProgress: options.parallelization
  })

  emitter.finished = finished
  finished.then(() => {
    emitter.emit('finished')
  })

  return emitter
}

module.exports = lintMain
