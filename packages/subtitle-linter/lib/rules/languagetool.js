// const fetch = require('node-fetch')

module.exports = {
  meta: {
    descriptions: 'disallow LanguageTool errors'
  },
  create (context, options = {}) {
    const ignoredRules = options.ignoredRules || []
    const ignoredTypos = (options.ignoredTypos || []).map(e => e.toLowerCase())
    const language = options.language || 'auto'
    const disabledRules = ignoredRules.filter(e => !e.includes('*'))

    return async ({ events }) => {
      const lines = events.map(part => {
        if (part.key !== 'Dialogue') return null
        return {
          text: part.plainText.replace(/ *\n+ */g, ' '),
          line: part.line
        }
      }).filter(e => e)

      for (const line of lines) {
        line.text = line.text.replace(/\r/g, '')

          // Apply smartypants Transformations to avoid meaningless warnings
          // https://github.com/markedjs/marked/blob/a9696e28989c0bea2077885bab1844525e18a031/src/Lexer.js#L9
          .replace(/---/g, '\u2014')
          .replace(/--/g, '\u2013')
          .replace(/(^|[-\u2014/([{"\s])'/g, '$1\u2018')
          .replace(/'/g, '\u2019')
          .replace(/(^|[-\u2014/([{\u2018\s])"/g, '$1\u201c')
          .replace(/"/g, '\u201d')
          .replace(/\.{3}/g, '\u2026')

          // Join related dialogue lines
          .replace(/([^.!?\n]) *\n\n:/g, '$1:')
          .replace(/([^.!?\n] *)\n\n([a-z])/g, '$1 $2')
      }

      const uniqueTexts = new Set(lines.map(e => e.text))
      const typos = new Set()

      for (const text of uniqueTexts) {
        // DO NOT USE THE PUBLIC SERVER WITHOUT PREMIUM API ACCESS!
        const serverUrl = process.env.LT_SERVER_URL ?? 'http://127.0.0.1:8081/'
        const apiUsername = process.env.LT_API_USERNAME
        const apiKey = process.env.LT_API_KEY
        const body = new URLSearchParams({
          disabledRules,
          language,
          text
        })
        if (apiUsername) body.set('username', apiUsername)
        if (apiKey) body.set('apiKey', apiKey)

        let response, result
        for (let tries = 0; tries < 10; tries++) {
          try {
            response = await fetch(serverUrl + 'v2/check', {
              method: 'POST',
              headers:{
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body
            })
            result = await response.json()
            break
          } catch (error) {
            console.warn('Error when connecting to LT server:')
            console.warn(error)
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * (Math.pow(2, tries) + Math.random())))
        }

        // Break when LT server connection fails for a long time
        if (!response) break

        // Warn when LT server errors out, but continue linting
        if (!response.ok) {
          console.warn('Got a NO OK response from LT server:')
          console.warn(result)
          continue
        }

        // Handle Japanese inside non-Japanese text
        const japaneseLine = isJapanese(text)
        if (japaneseLine && !language.startsWith('ja')) {
          const haveTypos = result.matches.find(e => e.rule.id === 'HUNSPELL_RULE')
          if (haveTypos) {
            console.log('[DEBUG] Ignoring Japanese line:', text)
            continue
          }
        }

        for (const match of result.matches) {
          if (ignoredRules.find(rule =>
            rule.includes('*')
              ? match.rule.id.includes(rule.replace('*', ''))
              : rule === match.rule.id
          )) continue

          const originalText = text.substr(match.offset, match.length)
          if (match.rule.id === 'HUNSPELL_RULE') {
            if (!ignoredTypos.includes(originalText.toLowerCase())) {
              typos.add(originalText)
            }
            continue
          }

          const matchingLines = lines.filter(e => e.text === text).map(e => e.line)
          context.report({
            content: text,
            ruleId: match.rule.id,
            issueType: match.rule.issueType,
            ruleUrl: match.rule?.urls?.[0],
            replacements: match.replacements,
            message: match.message + (
              matchingLines.length > 1
                ? ` (repeats ${matchingLines.length} times)`
                : ''
            ),
            offset: match.offset,
            length: match.length,
            originalText,
            lines: matchingLines
          })
        }
      }

      if (typos.size > 0) {
        context.report({
          ruleId: 'HUNSPELL_RULE_MERGED',
          message: 'LanguageTool typos',
          typos: Array.from(typos)
        })
      }
    }
  },
  destroy () {
    lt.stop()
  }
}

function isJapanese (text) {
  // Always check small lines
  if (text.length < 20) return false

  // https://stackoverflow.com/a/44586972
  if (text.match(/[À-ž]/i)) return false

  // Modified from https://codegolf.stackexchange.com/q/122316
  const matchedRomaji = text.toLowerCase().match(/(^|\b)((a|i|u|e|o|tsu|chi|cha|cho|chu|shi|sha|sho|shu|b{1,2}a|b{1,2}u|b{1,2}e|b{1,2}o|b{1,2}i|g{1,2}a|g{1,2}u|g{1,2}e|g{1,2}o|g{1,2}i|h{1,2}a|h{1,2}u|h{1,2}e|h{1,2}o|h{1,2}i|k{1,2}a|k{1,2}u|k{1,2}e|k{1,2}o|k{1,2}i|m{1,2}a|m{1,2}u|m{1,2}e|m{1,2}o|m{1,2}i|n{1,2}a|n{1,2}u|n{1,2}e|n{1,2}o|n{1,2}i|p{1,2}a|p{1,2}u|p{1,2}e|p{1,2}o|p{1,2}i|r{1,2}a|r{1,2}u|r{1,2}e|r{1,2}o|r{1,2}i|s{1,2}a|s{1,2}u|s{1,2}e|s{1,2}o|z{1,2}a|z{1,2}u|z{1,2}e|z{1,2}o|d{1,2}a|d{1,2}e|d{1,2}o|t{1,2}a|t{1,2}e|t{1,2}o|w{1,2}a|w{1,2}o|y{1,2}a|y{1,2}u|y{1,2}o|f{1,2}u|v{1,2}u|j{1,2}i)n?)+(\b|$)/g)
  if (!matchedRomaji) return false

  const nonAlphanumberic = text.replace(/\w/g, '')
  return text.length === matchedRomaji.length + nonAlphanumberic.length
}
