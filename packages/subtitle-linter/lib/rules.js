const path = require('path')
const fs = require('fs')

class Rules {
  constructor () {
    this.rules = Object.create(null)
    this.load()
  }

  load (cwd = path.resolve(__dirname, 'rules')) {
    const files = fs.readdirSync(cwd)
    for (const file of files) {
      if (!file.endsWith('.js')) continue
      this.rules[file.slice(0, -3)] = require(path.resolve(cwd, file))
    }
  }

  get (name) {
    return this.rules[name]
  }
}

module.exports = Rules
