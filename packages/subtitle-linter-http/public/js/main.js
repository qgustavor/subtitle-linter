import m from './vendor/mithril.js'
import Layout from './components/Layout.js'
import Tasks from './components/Tasks.js'
import Task from './components/Task.js'
import NewTask from './components/NewTask.js'
import Diffs from './components/Diffs.js'
import NewDiff from './components/NewDiff.js'
import Diff from './components/Diff.js'

const root = document.getElementById('app')
const generateRoute = Component => ({view: vnode => m(Layout, m(Component, vnode.attrs))})

m.route(document.body, '/tasks/', {
  '/tasks/': generateRoute(Tasks),
  '/tasks/_new': generateRoute(NewTask),
  '/tasks/:id': generateRoute(Task),
  '/diffs/': generateRoute(Diffs),
  '/diffs/_new': generateRoute(NewDiff),
  '/diffs/:id': generateRoute(Diff)
})
