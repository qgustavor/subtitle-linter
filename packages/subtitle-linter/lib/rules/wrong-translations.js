const unicodeBoundary = String.raw`(?:(?<=\p{L}\p{M}*)(?!\p{L}\p{M}*)|(?<!\p{L}\p{M}*)(?=\p{L}\p{M}*))`
const wrongTranslations = [
  // English false cognates
  ['livraria', 'library'],
  ['livrarias', 'libraries'],
  ['colar', 'collar'],
  ['colares', 'collars'],
  ['faculdade', 'faculty'],
  ['notícia', 'notice'],
  ['apontamentos', 'appointments'],
  ['apontamento', 'appointment'],
  ['assistir', 'assist'],
  ['batom', 'baton'],
  ['batons', 'batons'],
  ['colégio', 'college'],
  ['colégios', 'colleges'],
  ['ensino médio', 'middle school'],
  ['jornal', 'journal'],
  ['jornais', 'journals'],
  ['lanche', 'lunch'],
  ['lanches', 'lunches'],
  ['novela', 'novel'],
  ['frigideira', 'fridge'],
  ['balcão', 'balcony'],
  ['atualmente', 'actually'],
  ['legenda', 'legend'],
  ['compasso', 'compass'],
  ['recorde', 'record'],
  // English false cognates but with Spanish hints
  ['livraria', 'biblioteca', 'es'],
  ['faculdade', 'sala de profesores', 'es'],
  ['notícia', 'aviso', 'es'],
  ['notícias', 'avisos', 'es'],
  ['apontamentos', 'citas', 'es'],
  ['apontamento', 'cita', 'es'],
  ['assistir', 'ayudar', 'es'],
  ['batom', 'batuta', 'es'],
  ['batons', 'batutas', 'es'],
  ['colégio', 'universidad', 'es'],
  ['colégios', 'universidades', 'es'],
  ['ensino médio', 'intermedia', 'es'],
  ['jornal', 'diario', 'es'],
  ['jornais', 'diarios', 'es'],
  ['lanche', 'almuerzo', 'es'],
  ['novela', 'romance', 'es'],
  ['gravador', 'flauta', 'es'],
  ['gravadores', 'flautas', 'es'],
  ['você', 'ustedes', 'es'],
  ['vocês', 'usted', 'es'],
  ['você', 'vosotros', 'es'],
  ['vocês', 'vos', 'es']
].map(([wrongTl, correctTl, language]) => ([
  new RegExp(unicodeBoundary + wrongTl + unicodeBoundary, 'ui'),
  new RegExp(unicodeBoundary + correctTl + unicodeBoundary, 'ui'),
  language
]))

module.exports = {
  meta: {
    descriptions: 'disallow wrong translations'
  },
  create (context) {
    return ({ events }) => {
      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        for (const [wrongTl, correctTl, language = 'en'] of wrongTranslations) {
          const match = wrongTl.exec(part.plainText)
          if (!match) continue

          const originalTl = part.strictSiblings.find(e =>
            e.language &&
            e.language.startsWith(language) &&
            correctTl.test(e.plainText)
          )
          if (!originalTl) continue

          context.report({
            line: part.line,
            content: part.value.Text,
            message: 'wrong translation, original: ' + originalTl.plainText,
            offset: match.index,
            length: match[0].length
          })
        }
      }
    }
  }
}
