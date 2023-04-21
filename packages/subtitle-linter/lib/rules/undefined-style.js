module.exports = {
  meta: {
    descriptions: 'disallow lines with undefined styles'
  },
  create (context) {
    return ({ events, styles }) => {
      const reportedStyles = {}

      for (const part of events) {
        if (part.key !== 'Dialogue') continue
        if (!part.matchedStyle) {
          const style = part.value.Style
          if (!reportedStyles[style]) reportedStyles[style] = []
          reportedStyles[style].push(part)
        }
      }

      for (const [name, parts] of Object.entries(reportedStyles)) {
        context.report({
          line: parts[0].line,
          content: parts.slice(0, 3).map(e => e.value.Text).join('; ').replaceAll(/[\r\n]/g, ''),
          message: 'missing style:' + name + ' in ' + parts.length + ' ' + (parts.length === 1 ? 'line': 'lines')
        })
      }

      if (Object.keys(reportedStyles).length && !styles.find(e => e.value.Name === 'Default')) {
        context.report({
          message: 'missing fallback Default style'
        })
      }
    }
  }
}
