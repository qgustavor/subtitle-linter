const libjass = require('libjass')

module.exports = {
  meta: {
    descriptions: 'disallow too short lines'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const haveDrawing = part.parsedText.find(e => {
          return (e instanceof libjass.parts.DrawingMode) && e.value !== 0
        })
        if (haveDrawing) continue

        const minimalDuration = !part.value.Text.includes('\\pos') && !Number(part.value.MarginV)
          ? 0.3
          : 0.2
        const isTooShort = part.duration < minimalDuration

        if (isTooShort) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'duration (' + part.duration.toFixed(2) + ') is less than minimal (' + minimalDuration + ')'
          })
        }
      }
    }
  }
}
