import m from '../vendor/mithril.js'
import events from '../events.js'
import { markAsRead } from '../notifications.js'
import naturalCompare from '../natural-compare.js'

let lastOpenedUrl
let openedWindow

export default function (vnode) {
  const id = vnode.attrs.id
  const selectedTypos = {}
  const streamUrls = {}
  let whitelistedTypos = {}
  let task
  let loading = false
  let error = null
  let commonPrefixSize
  let prefixStart
  let openedCard

  async function load () {
    loading = true
    try {
      task = await m.request({ url: '/api/tasks/' + id })
    } catch (e) {
      error = e
    }
    loading = false

    if (task) {
      events.addEventListener('task', load)
      markAsRead('task', id)

      // Handle file name prefixes
      commonPrefixSize = task.files.reduce((prefix, entry) => {
        if (!prefix) return entry
        for (let i = 0; i < prefix.length; i++) {
          if (prefix[i] !== entry[i]) return prefix.substr(0, i)
        }
        return prefix
      }).length
      prefixStart = Math.max(0, commonPrefixSize - 20)

      for (const file of task.files) {
        let url
        const crunchyrollNew = file.match(/G[0123456789DEGJKMNPQRUVWXYZ]{8}/)
        if (crunchyrollNew) url = 'https://www.crunchyroll.com/watch/' + crunchyrollNew[0]

        const crunchyrollOld = file.match(/-\d+\.|\[\d+\]\./)
        if (crunchyrollOld) url = 'https://www.crunchyroll.com/pt-br/naruto/-' + crunchyrollOld[0].replace(/\D/g, '')

        if (url) streamUrls[file] = url
      }

      if (task.result) {
        // Highlight HUNSPELL_RULE_MERGED errors that are unique between files
        const errorCount = Object.create(null)
        for (const error of task.result.errors) {
          if (error.ruleId !== 'HUNSPELL_RULE_MERGED') continue
          error.typos.sort()
          for (const typo of error.typos) {
            if (!errorCount[typo]) errorCount[typo] = new Set()
            errorCount[typo].add(error.file)
          }
        }
        const typoCountArr = Object.entries(errorCount)
          .map(e => [e[0], e[1].size])
          .sort((a, b) => b[1] - a[1])
        if (typoCountArr.length) {
          task.typoCounts = Object.fromEntries(typoCountArr)
          task.globalTyposArr = typoCountArr.filter(e => {
            return e[1] > 2
          })
          whitelistedTypos = task.globalTyposArr.reduce((sum, [word]) => {
            sum[word] = true
            return sum
          }, {})
        }

        // TODO: group "missing-translations" results
        task.mappedFiles = task.files
          .slice()
          .sort(naturalCompare)
          .map(file => [
            file, task.result.errors.filter(e => e.file === file)
          ])
          .filter(e => e[1].length > 0)
      }
    }

    m.redraw()
  }

  function stopEvents () {
    events.removeEventListener('task', load)
  }

  function openUrl (url, hash) {
    const fullUrl = url + hash
    if (!openedWindow || openedWindow.closed) {
      openedWindow = window.open('about:blank')
      openedWindow.location = fullUrl
      lastOpenedUrl = url
    } else if (lastOpenedUrl !== url) {
      openedWindow.location = fullUrl
      lastOpenedUrl = url
    } else {
      openedWindow.postMessage('update-hash:' + hash, '*')
    }
  }

  return {
    oninit: load,
    onremove: stopEvents,
    view: () => m('.task-view',
      m('.columns.col-gapless',
        m('h2.column.col-6', 'Task ', id),
        task && m('.column.col-6.text-right',
          m('span.p-2.mx-2.d-inline-block.text-capitalize' + (
            task.state === 'failed' ? '.bg-error'
              : task.state === 'finished' ? '.bg-success'
              : '.bg-primary'
          ), task.state)
        )
      ),
      loading && m('.task-loader', 'Loading task...'),
      error && m('.task-error', 'Got error while loading task'),

      task && task.result && (result => [
        result.lintError && JSON.stringify(result.lintError),

        result.errors && result.errors.length === 0 && m('.toast',
          task.state === 'finished'
            ? 'No errors found!'
            : 'No errors found yet.'
        ),

        task.typoCounts && m('.card.my-1',
          m('.card-header',
            m('.card-title.h5', 'Global typos'),
          ),
          m('.card-body',
            m('div', task.globalTyposArr.reduce((list, [word, count], index) => {
              const isWhitelisted = whitelistedTypos[word]
              const joiner = index === task.globalTyposArr.length - 2 ? ' and '
                : index === task.globalTyposArr.length - 1 ? '.'
                : ', '
              const wordEl = m('a[href=#]' + (
                isWhitelisted ? '.text-dark' : ''
              ), {
                style: {
                  fontSize: (Math.log10(count) / 2 + 0.7).toFixed(2) + 'em'
                },
                onclick: e => {
                  e.preventDefault()
                  whitelistedTypos[word] = !isWhitelisted
                }
              }, word)

              return list.concat(wordEl, joiner)
            }, []))
          )
        ),

        task.mappedFiles && task.mappedFiles
          .map(([file, errors]) => [
            m('.h4.file-title',
              m('span', {
                onclick (evt) {
                  evt.preventDefault()
                  window.open(URL.createObjectURL(new Blob([
                    file, '\n\n',
                    task.content[task.files.indexOf(file)]
                  ], {
                    type: 'text/plain; charset=utf-8'
                  })), 'win_' + Date.now())
                }
              },
                m('span.text-gray',
                  prefixStart && '... ',
                  file.substr(prefixStart, commonPrefixSize - prefixStart)
                ),
                file.substr(commonPrefixSize)
              ),
              streamUrls[file] && m('a', {
                target: '_blank',
                rel: 'noreferrer noopener',
                href: streamUrls[file],
                onclick: e => {
                  e.preventDefault()
                  openUrl(streamUrls[file])
                }
              }, 'STREAMING')
            ),
            errors.map((error, index) => m('.card.my-1' + (
              openedCard === error ? '.bg-secondary' : ''
            ), {
              key: file + '_' + index,
              onclick: () => { openedCard = error }
            },
              openedCard === error &&
                error.lines &&
                error.lines.some(line => line !== -1) &&
                m('.card-image',
                  error.lines.map(line =>
                    m('pre.code', {
                      key: 'line_' + line
                    }, m('code',
                      task.content[task.files.indexOf(error.file)]
                        .split('\n').slice(line - 2, line + 3)
                        .map((line, index) => m(index === 2 ? '.bg-primary' : 'div', {
                          onmouseup: evt => {
                            if (evt.button !== 1) return
                            const timestamps = line.match(/\d:\d\d:\d\d\.\d\d/g) || []
                            if (!timestamps.length) return
                            openUrl(streamUrls[file], '#t=' + timestamps[0])
                          }
                        }, line))
                    ))
                  )
                ),
              m('.card-header',
                error.content && m('.card-title.h5', error.length ? [
                  error.content.substr(0, error.offset),
                  m('span.text-primary', error.content.substr(error.offset, error.length)),
                  error.content.substr(error.offset + error.length),
                ] : error.content),
              ),
              m('.card-body',
                m('span.chip', error.rule),
                error.ruleId && m('a.chip', {
                  href: error.ruleUrl ?? `https://community.languagetool.org/rule/show/${escape(error.ruleId)}?lang=pt&subId=1`,
                  target: '_blank'
                }, error.ruleId),
                error.rule === 'missing-translations'
                  ? m('.text-primary', {
                    onmouseup: evt => {
                      if (evt.button !== 1) return
                      const timestamps = error.message.match(/((\d:)?\d\d:)?\d\d\.\d\d/g) || []
                      if (!timestamps.length) return
                      openUrl(streamUrls[file], '#t=' + timestamps[0])
                    }
                  }, error.message)
                  : m('div', error.message),
                error.ruleId === 'HUNSPELL_RULE_MERGED' &&
                  m('div', error.typos.filter(word => {
                    return !whitelistedTypos[word]
                  }).reduce((list, word, index, arr) => {
                    const joiner = index === arr.length - 2 ? ' and '
                      : index === arr.length - 1 ? '.'
                      : ', '
                    const isGlobalTypo = task.typoCounts && task.typoCounts[word] > 2
                    const wordEl = m('a[href=#]' + (isGlobalTypo ? '' : '.text-error.text-bold'), {
                      onclick: e => {
                        e.preventDefault()
                        selectedTypos[file] = word
                      }
                    }, word)
                    return list.concat(wordEl, joiner)
                  }, []))
              ),
              error.ruleId === 'HUNSPELL_RULE_MERGED' && selectedTypos[file] && (function () {
                const lines = task.content[task.files.indexOf(error.file)].split('\n')
                const nonWord = String.raw`[^\p{Alphabetic}\p{M}\p{Nd}]`
                const wordRegex = XRegExp(`(^|${nonWord}|\\\\N)${selectedTypos[file]}(${nonWord}|$)`, 'u')

                const normalizedLines = lines
                  .map((line, index) => [line, index, line.replace(/\{[^}]+\}/g, '')])

                let matchingLines = normalizedLines.filter(e => wordRegex.test(e[2]))
                if (normalizedLines.length === 0) {
                  matchingLines = normalizedLines.filter(e => e[2].includes(selectedTypos[file]))
                }

                return m('.card-image',
                  m('pre.code', m('code',
                    matchingLines.map(([line, index]) => m('div', {
                        onmouseup: evt => {
                          if (evt.button !== 1) return
                          const timestamps = line.match(/\d:\d\d:\d\d\.\d\d/g) || []
                          if (!timestamps.length) return
                          openUrl(streamUrls[file], '#t=' + timestamps[0])
                        }
                      },
                      m('span.text-gray.mx-2', index.toString().padStart(5, ' ')), line)
                    )
                  ))
                )
              }())
            ))
          ])
      ])(task.result)
    )
  }
}
