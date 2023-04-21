module.exports = {
  meta: {
    descriptions: 'check probably missing translations'
  },
  create (context) {
    return ({ aloneSiblings }) => {
      const siblingGroups = []
      const siblingMargin = 1.5

      for (const sibling of aloneSiblings) {
        // Ignore short siblings
        if (sibling.plainText.length < 10) continue
        if (sibling.duration < 0.1) continue

        const group = siblingGroups.find(e => {
          return e.start - siblingMargin < sibling.end &&
            e.end + siblingMargin > sibling.start
        })

        if (group) {
          group.start = Math.min(group.start, sibling.start)
          group.end = Math.max(group.end, sibling.end)
          group.texts.push(sibling.plainText)
          group.languages.push(sibling.language)
        } else {
          siblingGroups.push({
            start: sibling.start,
            end: sibling.end,
            texts: [ sibling.plainText ],
            languages: [ sibling.language ]
          })
        }
      }

      for (const group of siblingGroups) {
        context.report({
          line: -1,
          content: group.texts.length <= 7
            ? group.texts.join(', ').replace(/\n/g, ' ')
            : (
              group.texts.slice(0, 3).join(', ') +
              ', [...], ' +
              group.texts.slice(-3).join(', ')
            ).replace(/\n/g, ' '),
          start: group.start,
          end: group.end,
          languages: group.languages,
          message: 'missing translation from ' + formatTime(group.start) + ' to ' + formatTime(group.end) + ' (' + group.languages.join(', ') + ')'
        })
      }
    }
  }
}

function formatTime (time) {
  return new Date(time * 1000).toISOString().slice(11, 22).replace(/^00:/, '')
}
