import ReconnectingEventSource from './vendor/reconnecting-eventsource.js'
const eventHandler = new ReconnectingEventSource('/api/events')
export default eventHandler
