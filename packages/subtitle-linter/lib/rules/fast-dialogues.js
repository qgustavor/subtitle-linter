const libjass = require('libjass')

module.exports = {
  meta: {
    descriptions: 'disallow fast lines'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const haveDrawing = part.parsedText.find(e => {
          return (e instanceof libjass.parts.DrawingMode) && e.value !== 0
        })
        if (haveDrawing) continue

        const isHighCps = part.cps > 50 &&
          part.cps !== Infinity &&
          !part.value?.Style?.match(/sign_/) &&
          !part.value.Text.includes('\\pos') &&
          !Number(part.value.MarginV)

        if (isHighCps) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'cps is ' + Math.round(part.cps)
          })
        }
      }
    }
  }
}
