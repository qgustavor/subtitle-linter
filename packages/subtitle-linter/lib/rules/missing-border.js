const libjass = require('libjass')

module.exports = {
  meta: {
    descriptions: 'disallow missing border'
  },
  create (context) {
    return ({ events }) => {
      const reportedStyles = new Set()

      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const isDrawing = part.parsedText.find(e => {
          return (e instanceof libjass.parts.DrawingMode) && e.value !== 0
        })
        if (isDrawing) continue

        const haveZeroBorderTag = part.parsedText.find(e => {
          return (e instanceof libjass.parts.Border) && e.value === 0
        })

        if (haveZeroBorderTag) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'missing border'
          })
          return
        }

        const haveZeroBorderStyle = part.matchedStyle &&
          !Number(part.matchedStyle.value.Outline) &&
          // Also consider the shadow
          !Number(part.matchedStyle.value.Shadow)
        if (haveZeroBorderStyle) {
          if (!reportedStyles.has(part.matchedStyle)) {
            reportedStyles.add(part.matchedStyle)
            context.report({
              line: part.line,
              content: part.value.Text,
              message: 'missing border in style'
            })
          }
        }
      }
    }
  }
}
