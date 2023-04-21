const util = require('util')
const fs = require('fs')

const events = require('./events.js')

const diffs = []
const diffLimit = 20

exports.getDiffs = () => diffs
exports.addDiff = async (input) => {
  const { original, updated, derived } = input
  if (!original || !updated || !derived) throw Error('missing one or more inputs')

  const diff = {
    id: Date.now().toString(36).toUpperCase(),
    opened: false,
    original,
    updated,
    derived
  }

  diffs.push(diff)

  // Limit the number of diffs
  if (diffs.length < diffLimit) diffs.splice(0, diffs.length - diffLimit)

  events.sendEvent('diff', {
    type: 'diff:new',
    id: diff.id
  })

  return diff
}

exports.getDiff = async id => {
  const diff = diffs.find(e => e.id === id)
  if (!diff) throw createError(404, 'diff not found')

  diff.opened = true

  let { original, updated, derived } = diff
  ;[ original, updated, derived ] = await Promise.all(
    [original, updated, derived].map(path => fs.promises.readFile(path, 'utf-8'))
  )

  return { original, updated, derived }
}
