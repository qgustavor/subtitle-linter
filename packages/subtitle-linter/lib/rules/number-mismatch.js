module.exports = {
  meta: {
    descriptions: 'disallow number mismatches'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const numbers = getNumberList(part)
        if (!numbers.length) continue
        const siblingNumbers = Array.from(new Set(part.strictSiblings.map(getNumberList).flat()))
        if (!siblingNumbers.length) continue

        const mismatches = numbers.filter(e => {
          return !siblingNumbers.includes(e)
        })

        if (mismatches.length !== 0) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: `number mismatch: found ${
              mismatches.sort((a, b) => a - b).join(', ')
            }, expected ${
              siblingNumbers.sort((a, b) => a - b).join(', ')
            }`
          })
        }
      }
    }
  }
}

function getNumberList (part) {
  return (part.plainText.match(/\d+([,.]\d+)*/g) || []).map(e => {
    const commaIndex = e.lastIndexOf(',')
    // 0000.00
    if (commaIndex === -1) return Number(e)
    const dotIndex = e.lastIndexOf('.')
    // 0000,00
    if (dotIndex === -1) return Number(e.replace(',', '.'))
    // 0,0000.0
    if (dotIndex > commaIndex) return Number(e.replace(/,/g, ''))
    // 0.0000,0
    return Number(e.replace(/\./g, '').replace(',', '.'))
  })
}
