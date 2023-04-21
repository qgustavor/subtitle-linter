import m from '../vendor/mithril.js'
import { unreadIds } from '../notifications.js'

let isStealth = false
const specialRoutes = [
  ['task', '/tasks/', 'Tasks'],
  ['diff', '/diffs/', 'Diffs'],
]

export default {
  view: (vnode) => m('.app',
    m('header.navbar',
      m('section.navbar-section',
        m('span.navbar-brand.mr-2', 'Subtitle Linter'),
        specialRoutes.map(([kind, href, name]) => m(m.route.Link, {
          'data-badge': unreadIds[kind].size,
          selector: 'a.btn.btn-link' + (
            unreadIds[kind].size ? '.badge' : ''
          ),
          key: kind,
          href
        }, name))
      )
    ),
    m('.header-divisor'),
    m('section', vnode.children)
  )
}
