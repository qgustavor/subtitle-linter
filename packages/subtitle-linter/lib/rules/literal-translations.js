const fs = require('fs')
const path = require('path')

const nonWord = String.raw`[^\p{Alpha}\p{M}\p{Nd}\p{Join_C}]`
const list = fs.readFileSync(path.resolve(__dirname, 'lists/literal-translations.txt'), 'utf-8')
  .split('\n').map(e => e.replace(/#.*/, '').trim().toLowerCase()).filter(e => e)
  .map(e => new RegExp(`(^|${nonWord})${e}(${nonWord}|$)`, 'u'))

module.exports = {
  meta: {
    descriptions: 'disallow literal translations'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const text = part.plainText.replace(/ *\n */g, ' ')
        const lowerText = text.toLowerCase()
        const match = list.find(e => e.test(lowerText))

        if (match) {
          context.report({
            line: part.line,
            content: text,
            message: 'literal translation: ' + JSON.stringify(match)
          })
        }
      }
    }
  }
}
