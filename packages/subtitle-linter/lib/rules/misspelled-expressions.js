const fs = require('fs')
const path = require('path')
const RegexParser = require('regex-parser')

const nonWord = String.raw`[^\p{Alpha}\p{M}\p{Nd}\p{Join_C}]`
const list = fs.readFileSync(path.resolve(__dirname, 'lists/misspelled-expressions.txt'), 'utf-8')
  .split('\n').map(e => e.replace(/#.*/, '').trim()).filter(e => e)
  .map(expression => ({
    expression,
    regexp: expression.startsWith('/')
      ? RegexParser(expression)
      : new RegExp(`(^|${nonWord})${expression.toLowerCase()}(${nonWord}|$)`, 'u')
  }))

module.exports = {
  meta: {
    descriptions: 'disallow misspelled expressions'
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
            message: 'misspelled expression: ' + JSON.stringify(match.expression)
          })
        }
      }
    }
  }
}
