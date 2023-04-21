import m from '../vendor/mithril.js'

export default function () {
  let loadingState = 'idle'
  let original = ''
  let updated = ''
  let derived = ''

  async function createDiff (evt) {
    evt.preventDefault()
    loadingState = 'loading'
    original = original.replace(/^"|"$/g, '')
    updated = updated.replace(/^"|"$/g, '')
    derived = derived.replace(/^"|"$/g, '')

    const body = { original, updated, derived }

    try {
      const newDiff = await m.request({ url: '/api/diffs/', method: 'POST', body })
      m.route.set('/diffs/:id', { id: newDiff.id })
    } catch (error) {
      loadingState = 'error'
    }
  }

  return {
    view: () => m('.new-diff-view', { onsubmit: createDiff },
      m('h2', 'New diff'),

      m('form.form-horizontal',
        m('.form-group',
          m('.col-3.col-sm-12', m('label.form-label', 'Original subtitle path')),
          m('.col-9.col-sm-12', m('input.form-input[type="text"]', {
            oninput: e => {original = e.target.value},
            value: original
          })
        )),
        m('.form-group',
          m('.col-3.col-sm-12', m('label.form-label', 'Updated subtitle path')),
          m('.col-9.col-sm-12', m('input.form-input[type="text"]', {
            oninput: e => {updated = e.target.value},
            value: updated
          })
        )),
        m('.form-group',
          m('.col-3.col-sm-12', m('label.form-label', 'Derived subtitle path')),
          m('.col-9.col-sm-12', m('input.form-input[type="text"]', {
            oninput: e => {derived = e.target.value},
            value: derived
          })
        )),

        m('button.btn.btn-primary' + (
          loadingState === 'loading' ? '.loading[disabled]'
            : loadingState === 'error' ? '.btn-error'
            : ''
        ), 'Create diff')
      )
    )
  }
}
