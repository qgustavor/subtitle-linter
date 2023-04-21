import m from '../vendor/mithril.js'
import events from '../events.js'
import { updateUnReadIds } from '../notifications.js'

export default function () {
  let tasks

  async function load () {
    tasks = await m.request({ url: '/api/tasks/' })
    tasks.reverse()
    updateUnReadIds('task', tasks.filter(e => !e.opened).map(e => e.id))
    m.redraw()
  }

  events.addEventListener('task', load)
  function stopEvents () {
    events.removeEventListener('task', load)
  }

  return {
    oninit: load,
    onremove: stopEvents,
    view: () => m('.task-list-view',
      m('h2', 'Tasks'),
      m(m.route.Link, {selector: 'a.btn.btn-primary[href="/tasks/_new"]'}, 'New task'),
      m('.divider'),

      !tasks && m('.task-loader', 'Loading tasks...'),

      tasks && tasks.length === 0 && m('.toast',
        m('strong', 'No tasks created yet.'), m('br'),
        'Create tasks to list one or more files.'
      ),

      tasks && tasks.map(task => m('.card' + (
        task.opened ? '' : '.bg-secondary'
      ), { key: task.id },
        m('.card-header',
          m(m.route.Link, {
            href: '/tasks/' + task.id,
            selector: 'a.card-title.h5.columns.col-gapless'
          },
            m('.column.col-6', 'Task ', task.id),
            m('.column.col-6.text-right',
              m('span.p-2.mx-2.d-inline-block.text-capitalize' + (
                task.state === 'failed' ? '.bg-error'
                  : task.state === 'finished' ? '.bg-success'
                  : '.bg-primary'
              ), task.state),
              m('span.bg-gray.p-2.mx-2.d-inline-block',
                task.files.length, task.files !== 1 ? ' files' : ' file'
              )
            )
          ),
          m('.card-subtitle',
            m('pre.code', m('code',
              task.files.slice(
                0, task.files.length > 4 ? 3 : 4
              ).map(e => limitTextSize(e, 150)).join('\n'),
              task.files.length > 4 && m('span.text-gray', '\n+ ', task.files.length - 3,' more files')
            ))
          )
        )
      ))
    )
  }
}

function limitTextSize (text = '', size) {
  return text.length > size ? '…' + text.substr(-size) : text
}
