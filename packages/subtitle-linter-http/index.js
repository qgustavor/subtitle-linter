const express = require('express')
const path = require('path')

const app = express()
const port = process.env.HTTP_PORT ?? 3000
const events = require('./models/events.js')
const apiRouter = require('./api_routes.js')

app.use(express.json())
app.use(express.static('public'))

app.get('/api/events', (req, res) => {
  events.addClient(req, res)
})

app.use('/api', apiRouter)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, () => {
  console.log(`Linter GUI listening on port ${port}`)
})
