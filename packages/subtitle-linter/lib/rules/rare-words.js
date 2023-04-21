const fs = require('fs')
const path = require('path')

const nonWord = String.raw`[^\p{Alpha}\p{M}\p{Nd}\p{Join_C}]`
const list = fs.readFileSync(path.resolve(__dirname, 'lists/rare-words.txt'), 'utf-8')
  .split('\n').map(e => e.replace(/#.*/, '').trim().toLowerCase()).filter(e => e)
  .map(word => ({ word, regexp: new RegExp(`(^|${nonWord})${word}(${nonWord}|$)`, 'u') }))

module.exports = {
  meta: {
    descriptions: 'disallow rare words'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const text = part.plainText.replace(/ *\n */g, ' ')
        const lowerText = text.toLowerCase()
        const match = list.find(e => e.regexp.test(lowerText))

        if (match) {
          context.report({
            line: part.line,
            content: text,
            message: 'rare word: ' + JSON.stringify(match.word)
          })
        }
      }
    }
  }
}
