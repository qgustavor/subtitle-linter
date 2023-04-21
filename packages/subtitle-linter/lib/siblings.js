const path = require('path')
const fs = require('fs')

const folderCache = new Map()
async function getSiblings (file) {
  const name = path.basename(file)
  const folder = path.dirname(file)
  const cachedFolderFiles = folderCache.get(folder)
  const folderFiles = cachedFolderFiles || await fs.promises.readdir(folder)
  if (!cachedFolderFiles) folderCache.set(folder, folderFiles)
  const langRegex = /[^A-Za-z]([a-z]{2}[A-Z]{2})\./
  const fileClean = name.replace(langRegex, '.')
  const siblingNames = folderFiles.filter(e => {
    return e !== name && e.replace(langRegex, '.') === fileClean
  })
  const siblings = []
  for (const name of siblingNames) {
    const lang = name.match(langRegex)?.[1]
    if (lang === 'arME' || lang === 'ruRU') continue
    const siblingPath = path.resolve(folder, name)
    const data = await fs.promises.readFile(siblingPath, 'utf-8')
    siblings.push({ data, lang })
  }
  return siblings
}

exports.getSiblings = getSiblings
