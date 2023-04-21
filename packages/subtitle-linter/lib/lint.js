const libjass = require('libjass')

async function lint (data, context, siblings, ruleHandlers) {
  const { parsed, infoSection, styleSection, eventSection, extraneousSections, validAss } = await parseAss(data)
  if (!validAss) {
    context.report({
      message: 'Data could not be parsed as an ASS subtitle.'
    })
    return
  }

  // Handle siblings
  const validSiblings = []
  const aloneSiblings = new Set()
  for (const { data, lang } of siblings) {
    const parsed = await parseAss(data)
    if (!parsed.validAss) continue
    const events = parsed.eventSection.body.filter(e => e.key === 'Dialogue')
    for (const evt of events) {
      normalizeEvent(evt)
      evt.language = lang
      aloneSiblings.add(evt)
      validSiblings.push(evt)
    }
  }

  // Parse tags using libjass
  const siblingMargin = 0.5
  const strictSiblingOverlap = 0.25
  for (const evt of eventSection.body) {
    if (evt.key !== 'Dialogue') continue
    normalizeEvent(evt)
    evt.matchedStyle = styleSection.body.find(e => e.value.Name === evt.value.Style)
    evt.cps = evt.plainText.length / evt.duration
    evt.siblings = validSiblings.filter(e =>
      e.start - siblingMargin < evt.end &&
      e.end + siblingMargin > evt.start
    )
    evt.strictSiblings = validSiblings.filter(e =>
      Math.min(e.end, evt.end) - Math.max(e.start, evt.start) > strictSiblingOverlap
    )
    for (const sibling of evt.siblings) {
      aloneSiblings.delete(sibling)
    }
  }

  // Sort events by start timestamp
  eventSection.body.sort((a, b) => {
    if (a.key === 'Dialogue' && b.key !== 'Dialogue') return -1
    if (a.key !== 'Dialogue' && b.key === 'Dialogue') return 1
    if (a.key !== 'Dialogue' && b.key !== 'Dialogue') return 0

    return a.value.Start.localeCompare(b.value.Start)
  })

  await Promise.all(ruleHandlers.map(handler => handler({
    infos: infoSection.body,
    styles: styleSection.body,
    events: eventSection.body,
    extraneous: extraneousSections,
    aloneSiblings: Array.from(aloneSiblings),
    parsed
  })))
}

async function parseAss (data) {
  // Remove BOM
  data = data.replace(/^\uFEFF/, '')

  const {default: parse} = await import('@qgustavor/ass-parser')
  const parsed = parse(data, { comments: true })
  const infoSection = parsed.find(e => e.section === 'Script Info')
  const styleSection = parsed.find(e => e.section.includes('Styles'))
  const eventSection = parsed.find(e => e.section === 'Events')
  const extraneousSections = parsed.filter(e =>
    e !== infoSection && e !== eventSection && e !== styleSection
  )
  const validAss = parsed.length !== 0 && eventSection

  return { parsed, infoSection, styleSection, eventSection, extraneousSections, validAss }
}

function normalizeEvent (evt) {
  evt.parsedText = libjass.parser.parse(evt.value.Text, 'dialogueParts')
  evt.plainText = evt.parsedText.map(part => {
    if (part instanceof libjass.parts.Text) return part.value
    if (part instanceof libjass.parts.NewLine) return '\n'
    return ''
  }).join('')
  evt.start = parseTime(evt.value.Start)
  evt.end = parseTime(evt.value.End)
  evt.duration = evt.end - evt.start
}

function parseTime (e) {
  return e.split(':').reduce((sum, e) => sum * 60 + Number(e), 0)
}

module.exports = lint
