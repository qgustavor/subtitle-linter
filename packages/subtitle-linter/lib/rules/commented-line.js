module.exports = {
  meta: {
    descriptions: 'disallow commented lines'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.type === 'comment') {
          context.report({
            line: part.line,
            content: part.value,
            message: 'commented line'
          })
        } else if (part.key === 'Comment') {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'commented line'
          })
        }
      }
    }
  }
}
