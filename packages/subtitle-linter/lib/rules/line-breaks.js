module.exports = {
  meta: {
    descriptions: 'disallow line breaks in short lines'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const hasLineBreak = part.plainText.length < 25 &&
          part.plainText.includes('\n') &&
          !part.plainText.match(/^(—|-)/m) &&
          !part.plainText.match(/[?!:.;] *\n/) &&
          !part.plainText.match(/\n.*\n/) &&
          !part.value.Text.includes('\\pos')
          !part.value.Text.includes('\\fad')
          !part.value.Style.match(/sign/i)

        if (hasLineBreak) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'line break in short line'
          })
        }
      }
    }
  }
}
