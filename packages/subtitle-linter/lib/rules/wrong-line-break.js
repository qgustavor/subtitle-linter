module.exports = {
  meta: {
    descriptions: 'disallow wrong line breaks'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const lineBreakOffset = part.value.Text.indexOf('\\n')
        if (lineBreakOffset !== -1) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'wrong line break',
            offset: lineBreakOffset,
            length: 2
          })
        }
      }
    }
  }
}
