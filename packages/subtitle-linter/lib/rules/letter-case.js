module.exports = {
  meta: {
    descriptions: 'enforce letter case'
  },
  create (context) {
    return ({ events }) => {
      const dialogues = events.filter(e => e.key === 'Dialogue')

      for (let i = 1; i < dialogues.length; i++) {
        const mainDialogue = dialogues[i - 1]
        const nextDialogue = dialogues.slice(i).find(e => {
          // Both dialogues must have the same style
          return mainDialogue.value.Style === e.value.Style &&
            // and must not overlap
            mainDialogue.value.End <= mainDialogue.value.Start
        })

        let text = nextDialogue
          ? [mainDialogue, nextDialogue].map(e => e.plainText).join('\n')
          : mainDialogue.plainText

        // Normalize ellipsis
        text = text.replace(/\.{3}/g, '…')
        const wrongLetterCases = text.match(/[.?!]\s+\p{Lowercase}/u)

        if (wrongLetterCases) {
          context.report({
            line: mainDialogue.line,
            content: text,
            message: 'possible wrong letter case'
          })
        }
      }
    }
  }
}
