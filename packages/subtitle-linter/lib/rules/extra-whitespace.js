module.exports = {
  meta: {
    descriptions: 'disallow extra whitespace'
  },
  create (context, config = {}) {
    const strict = config.strict || false

    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const text = part.plainText
        const haveExtraWhitespace = strict
          ? text.match(/^ | $| {2,}/)
          : text.trim().match(/\S {2}\S/)

        if (haveExtraWhitespace) {
          context.report({
            line: part.line,
            content: text,
            message: 'extra whitespace'
          })
        }
      }
    }
  }
}
