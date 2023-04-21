const SseChannel = require('sse-channel')
const channel = new SseChannel({
  jsonEncode: true
})

let id = 1
channel.sendEvent = (event, data) => {
  channel.send({
    id: id++,
    event,
    data
  })
}

module.exports = channel
