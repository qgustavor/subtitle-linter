const express = require('express')
const { getDiffs, addDiff } = require('./models/diffs')
const { getDiff } = require('./models/diffs')
const { getTasks, addTask } = require('./models/tasks')
const { getTask } = require('./models/tasks')

const api = express.Router()

api.get('/', (req, res) => {
  return res.json({
    info: 'Subtitle Linter API'
  })
})

api.get('/diffs/', async (req, res) => {
  return res.json(await getDiffs())
})

api.post('/diffs/', async (req, res) => {
  return res.json(await addDiff(req.body))
})

api.get('/diffs/:diff', async (req, res) => {
  return res.json(await getDiff(req.params.diff))
})

api.get('/tasks/', async (req, res) => {
  return res.json(await getTasks())
})

api.post('/tasks/', async (req, res) => {
  return res.json(await addTask(req.body))
})

api.get('/tasks/:task', async (req, res) => {
  return res.json(await getTask(req.params.task))
})

module.exports = api
