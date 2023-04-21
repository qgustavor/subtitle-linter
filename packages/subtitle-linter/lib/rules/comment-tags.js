const libjass = require('libjass')

module.exports = {
  meta: {
    descriptions: 'disallow comment tags'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const haveCommentTag = part.parsedText.find(e => {
          return e instanceof libjass.parts.Comment
        })

        if (haveCommentTag) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'comment tag'
          })
        }
      }
    }
  }
}
