module.exports = {
  meta: {
    descriptions: 'disallow escaped braces'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const haveEscapedBrace = part.value.Text.includes('\\{')
        if (haveEscapedBrace) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'escaped brace'
          })
        }
      }
    }
  }
}
