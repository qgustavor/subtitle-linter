module.exports = {
  meta: {
    descriptions: 'enforce quote styles'
  },
  create (context, options = {}) {
    const { relaxed } = options

    // Normal regex matches quotes ending with comma and quotes starting with lower case
    // and ending with ".", "!" or "?".
    // Relaxed regex also matches quotes starting with upper case.
    const quoteRegex = relaxed
      ? /(?<!^|: )"[^"]+[.!?]"$|"[^"]+[.!?]" (?![^"]+[.!?])|"[^"]+,"/u
      : /(?<!^|: )"\p{Lowercase}[^"]+[.!?]"$|"\p{Lowercase}[^"]+[.!?]" (?![^"]+[.!?])|"[^"]+,"/u

    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const text = part.plainText
        const badQuoteStyle = text.replaceAll(/“|"/g, '"').match(quoteRegex)

        if (badQuoteStyle) {
          context.report({
            line: part.line,
            content: text,
            message: 'possible bad quote style'
          })
        }
      }
    }
  }
}
