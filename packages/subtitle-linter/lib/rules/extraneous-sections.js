module.exports = {
  meta: {
    descriptions: 'disallow extraneous sections'
  },
  create (context) {
    return ({ extraneous }) => {
      if (!extraneous.length) return

      context.report({
        line: -1,
        message: 'extraneous section in subtitle'
      })
    }
  }
}
