import m from './vendor/mithril.js'
import events from './events.js'

const metaEl = document.querySelector('link[rel="icon"]')

let notificationCount = 0
let notificationType = 'default'
let notificationTitle = 'Subtitle Linter'

function notify (count = 1) {
  notificationCount += count
  setCount()
  playNotificationSound()
}

function setType (type) {
  notificationType = type
}

function setTitle (title) {
  notificationTitle = title
}

function setCount (count) {
  if (count != null) notificationCount = count

  const notificationStr = Math.min(5, notificationCount).toString().padStart(2, 0)
  metaEl.href = `img/${notificationType}-favicon-${notificationStr}.png`
  document.title = (notificationCount > 0 ? `(${notificationCount}) ` : '') + notificationTitle
}

let audioCtx
function playNotificationSound () {
  audioCtx = audioCtx || new window.AudioContext()
  const oscillatorNode = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillatorNode.type = 'square'
  oscillatorNode.frequency.setValueAtTime(200, audioCtx.currentTime)
  oscillatorNode.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.5)

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)

  oscillatorNode.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillatorNode.start()
  oscillatorNode.stop(audioCtx.currentTime + 0.5);
}

// Unread count handling
const unreadIds = {
  task: new Set(),
  diff: new Set()
}

export function markAsRead (kind, id) {
  unreadIds[kind].delete(id)
  updateUnreadCounts()
}

export function updateUnReadIds (kind, newIds) {
  unreadIds[kind] = new Set(newIds)
  updateUnreadCounts()
}

Object.keys(unreadIds).forEach(kind => {
  // Fetch initial data
  m.request({ url: `/api/${kind}s/` }).then(data => {
    updateUnReadIds(kind, data.filter(e => !e.opened).map(e => e.id))
  })

  // Handle events
  events.addEventListener(kind, evt => {
    const { id, type } = JSON.parse(evt.data)
    if (!id) return

    if (type === 'task:finished') playNotificationSound()

    unreadIds[kind].add(id)
    updateUnreadCounts()
    m.redraw()
  })
})

function updateUnreadCounts () {
  const sum = Object.values(unreadIds).reduce((sum, set) => sum + set.size, 0)
  notificationCount = sum
  setCount()
}

export { notify, setCount, setType, setTitle, unreadIds }
