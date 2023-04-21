const fs = require('fs')
const path = require('path')
const levenshtein = require('fast-levenshtein')

const wordRegex = /([\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Connector_Punctuation}\p{Join_Control}]+)/gu
const wordlist = Object.entries(
  fs.readFileSync(path.resolve(__dirname, 'lists/fixed-expressions.txt'), 'utf-8')
    .split('\n').map(e => e.replace(/#.*/, '').trim().toLowerCase()).filter(e => e)
    .reduce((state, token) => {
      const [expression, ...exceptions] = token.split('|').map(e => e.trim())
      const words = expression.split(' ').length
      const list = state[words] || (state[words] = [])
      list.push({ expression, exceptions })
      return state
    }, {})
)

module.exports = {
  meta: {
    descriptions: 'check fixed expressions'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const text = part.plainText.replace(/ *\n */g, ' ')
        const sentences = text.toLowerCase().split(/[.!?]/g)

        for (const sentence of sentences) {
          const tokens = sentence.match(wordRegex)
          if (!tokens) continue

          for (const [wordsStr, list] of wordlist) {
            const words = Number(wordsStr)
            const max = tokens.length - words

            for (let i = 0; i < max; i++) {
              const selectedTokens = tokens.slice(i, i + words).join(' ')

              for (const { expression, exceptions } of list) {
                if (exceptions.includes(selectedTokens)) continue

                const distance = levenshtein.get(expression, selectedTokens)
                if (distance === 1) {
                  context.report({
                    line: part.line,
                    content: text,
                    message: 'mispelled expression: ' + JSON.stringify(expression) +
                      ' => ' + JSON.stringify(selectedTokens)
                  })
                }
              }
            }
          }
        }
      }
    }
  }
}
