import m from '../vendor/mithril.js'
import { markAsRead } from '../notifications.js'

export default function (vnode) {
  const id = vnode.attrs.id
  let diffs
  let openedDiffs = {}
  let loading = false
  let error = null

  async function load () {
    let diffData
    loading = true
    try {
      diffData = await m.request({ url: '/api/diffs/' + id })
    } catch (e) {
      error = e
    }
    loading = false

    if (!diffData) {
      m.redraw()
      return
    }

    let { original, updated, derived } = diffData
    let sources = [original, updated, derived]

    sources = sources.map(script => {
      const parsed = assParser(script)
      const events = parsed.find(e => e.section === 'Events')

      return events.body
        .filter(e => e.key === 'Dialogue')
        .map(event => ({
          text: event.value.Text
            .replace(/\{[^\}]+\}/g, '').replace(/ *\\N */g, ' ')
            .normalize('NFC'),
          start: parseTimestamp(event.value.Start),
          end: parseTimestamp(event.value.End)
        }))
    })

    diffs = sources[0].map(evtA => {
      const evtBArr = sources[1].filter(evtB => isSameEvent(evtA, evtB))
      if (evtBArr.length !== 1) return null

      const evtB = evtBArr[0]
      if (evtA.text === evtB.text) return null

      return [evtA, evtB]
    }).filter(e => e)
      .sort((a, b) => a.start - b.start)
      .map(([evtA, evtB]) => ({
        original: evtA,
        updated: evtB,
        derived: sources[2].find(evtC => isSameEvent(evtA, evtC))
      }))

    markAsRead('diff', id)
    m.redraw()
  }

  return {
    oninit: load,
    view: () => m('.diff-view',
      m('.columns.col-gapless',
        m('h2.column.col-6', 'Diff ', id)
      ),
      loading && m('.diff-loader', 'Loading diff...'),
      error && m('.diff-error', 'Got error while loading diff'),

      diffs && diffs.length === 0 && m('.toast', 'No differences found.'),

      diffs && diffs.map((diff, index) => formatDiff(diff, index, openedDiffs))
    )
  }
}

function parseTimestamp (timestamp) {
  return Math.round(timestamp.split(':').reduce((sum, e) => sum * 60 + parseFloat(e), 0) * 1000)
}

function formatTimestamp (time) {
  return new Date(time).toISOString().substr(11, 10)
}

function formatDiff (diff, index, openedDiffs) {
  const { original, updated, derived } = diff

  const differences = Diff.diffWordsWithSpace(original.text, updated.text)
  const isOpened = openedDiffs[index]

  return m('pre.code', {
    key: 'diff_' + index,
    onclick: () => {
      openedDiffs[index] = !openedDiffs[index]
    }
  }, m('code',
    m('span.text-primary',
      formatTimestamp(original.start), ' - ',
      formatTimestamp(original.end), '\n',
    ),
    isOpened && m('span.text-error', '- ', original.text, '\n'),
    isOpened && m('span.text-success', '- ', updated.text, '\n'),
    differences.map(part => {
      return m(part.removed ? 'span.bg-error' :
        part.added ? 'span.bg-success' : 'span', part.value)
    }), '\n',
    derived && m('span.text-primary', derived.text),
  ))
}

const threshold = 50 // milliseconds
function isSameEvent (evtA, evtB) {
  return Math.abs(evtA.start - evtB.start) < threshold &&
    Math.abs(evtA.end - evtB.end) < threshold
}
