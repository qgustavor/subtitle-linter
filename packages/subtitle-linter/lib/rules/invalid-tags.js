const libjass = require('libjass')

module.exports = {
  meta: {
    descriptions: 'disallow invalid tags'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const invalidTag = part.parsedText.find(e => {
          return (e instanceof libjass.parts.Comment) &&
            e.value.includes('\\') &&
            e.value.match(/\\[A-Za-z]/) &&
            !e.value.match(/\\N(?![A-Za-z])/) &&
            !e.value.match(/\\fade\([^)]+\)/)
        })

        if (invalidTag) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'invalid tag: ' + invalidTag.value
          })
        }
      }
    }
  }
}
