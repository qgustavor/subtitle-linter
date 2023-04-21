const libjass = require('libjass')
// TODO: make the whitelist an option
const whitelist = [
  'Adobe Arabic',
  'Andale Mono',
  'Arial',
  'Arial Black',
  'Arial Unicode MS',
  'Comic Sans MS',
  'Courier New',
  'DejaVu LGC Sans Mono',
  'DejaVu Sans',
  'DejaVu Sans Condensed',
  'DejaVu Sans Light',
  'DejaVu Sans Mono',
  'Georgia',
  'Impact',
  'Rubik',
  'Rubik Black',
  'Rubik Light',
  'Rubik Medium',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Webdings'
].map(e => e.toLowerCase())

module.exports = {
  meta: {
    descriptions: 'disallow styles with non-whitelisted fonts'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue
        if (part.matchedStyle?.value?.Fontname && !whitelist.includes(part.matchedStyle.value.Fontname.toLowerCase())) {
          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'non-whitelisted font in style: ' + part.matchedStyle.value.Fontname
          })
        }
        for (const tag of part.parsedText) {
          if (!(tag instanceof libjass.parts.FontName)) continue
          if (tag.value && !whitelist.includes(tag.value.toLowerCase())) {
            context.report({
              line: part.line,
              content: part.value.Text,
              message: 'non-whitelisted font in tag: ' + tag.value
            })
          }
        }
      }
    }
  }
}
