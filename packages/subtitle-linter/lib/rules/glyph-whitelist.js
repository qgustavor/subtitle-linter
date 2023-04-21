// Glyph whitelist from Arial and Trebuchet MS
// TODO: make the whitelist an option
const whitelist = Array.from(`
    0020007e00a100ac00ae017f018f018f0192019201a001a101af01b001cd01dc01fa01ff
    0259025902c602c702c902c902d802dd030003010303030303090309032303230384038a
    038c038c038e03a103a303ce0401040c040e044f0451045c045e045f0490049304960497
    049a049d04a204a304ae04b304b804bb04e804e905b005b905bb05c305d005ea05f005f4
    060c060c061b061b061f061f0621063a064006520660066b066d066d06710671067e067e
    068606860698069806a406a406a906a906af06af06cc06cc06d506d506f406f61e801e85
    1ea01ef9200c200f201320152017201e2020202220262026202a202e2030203020322033
    2039203a203c203c203e203e20442044206a206f207f207f20a320a420a720a720aa20ac
    2105210521132113211621162122212221262126212e212e21532154215b215e21902195
    21a821a82202220222062206220f220f22112212221a221a221e221f22292229222b222b
    2248224822602261226422652302230223102310232023212500250025022502250c250c
    251025102514251425182518251c251c25242524252c252c25342534253c253c2550256c
    258025802584258425882588258c258c2590259325a025a125aa25ac25b225b225ba25ba
    25bc25bc25c425c425ca25cb25cf25cf25d825d925e625e6263a263c2640264026422642
    266026602663266326652666266a266be801e805e818e818e83ae83af001f002f004f031
    fb20fb20fb2afb36fb38fb3cfb3efb3efb40fb41fb43fb44fb46fb4ffb57fb59fb7bfb7d
    fb8bfb8bfb8ffb91fb93fb95fbfdfbfffc5efc62fd3efd3ffdf2fdf2fe80fe80fe82fe82
    fe84fe84fe86fe86fe88fe88fe8afe8cfe8efe8efe90fe92fe94fe94fe96fe98fe9afe9c
    fe9efea0fea2fea4fea6fea8feaafeaafeacfeacfeaefeaefeb0feb0feb2feb4feb6feb8
    febafebcfebefec0fec2fec4fec6fec8fecafeccfecefed0fed2fed4fed6fed8fedafedc
    fedefee0fee2fee4fee6fee8feeafeecfeeefeeefef0fef0fef2fef2fef5fefcfffcfffc
 `.replace(/\s/g, '').matchAll(/(....)(....)/g)
).map(([all, start, end]) => {
  const s = parseInt(start, 16)
  const e = parseInt(end, 16)
  const glyphs = []
  for (let i = s; i <= e; i++) glyphs.push(i)
  return glyphs
}).flat().map(e => String.fromCodePoint(e)).concat('\n', ' ', '\u{200b}')

module.exports = {
  meta: {
    descriptions: 'disallow non-whitelisted glyphs'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue
        const glyphs = new Set(part.plainText.split(''))
        for (const glyph of glyphs) {
          if (!whitelist.includes(glyph)) {
            context.report({
              line: part.line,
              content: part.value.Text,
              message: 'non-whitelisted glyph: ' + glyph + ' (\\u{' + glyph.codePointAt(0).toString(16).padStart(4, 0) + '})'
            })
          }
        }
      }
    }
  }
}
