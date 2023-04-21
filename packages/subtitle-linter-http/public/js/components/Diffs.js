import m from '../vendor/mithril.js'
import { updateUnReadIds } from '../notifications.js'

export default function () {
  let diffs

  async function load () {
    diffs = await m.request({ url: '/api/diffs/' })
    diffs.reverse()
    updateUnReadIds('diff', diffs.filter(e => !e.opened).map(e => e.id))
    m.redraw()
  }

  return {
    oninit: load,
    view: () => m('.diffs-list-view',
      m('h2', 'Diffs', m('small')),
      m(m.route.Link, {selector: 'a.btn.btn-primary[href="/diffs/_new"]'}, 'New diff'),
      m('.divider'),

      !diffs && m('.diffs-loader', 'Loading diffs...'),
      
      diffs && diffs.length === 0 && m('.toast',
        m('strong', 'No diffs created yet.'), m('br'),
        'Use the diff tool to apply diffs from source translations into derivated translations.'
      ),

      diffs && diffs.map(diff => m('.card' + (
        diff.opened ? '' : '.bg-secondary'
      ), { key: diff.id },
        m('.card-header',
          m('a.card-title.h5', {
            href: '/diffs/' + diff.id,
            oncreate: m.route.link
          },
            'Diff ', diff.id
          ),
          m('.card-subtitle',
            m('pre.code', m('code',
              diff.original, '\n',
              diff.updated, '\n',
              diff.derived, '\n'
            ))
          )
        )
      ))
    )
  }
}
