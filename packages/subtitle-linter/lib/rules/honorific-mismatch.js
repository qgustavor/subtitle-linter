module.exports = {
  meta: {
    descriptions: 'disallow honorific mismatches'
  },
  create (context) {
    return ({ events }) => {
      let haveHonorifics = false
      for (const part of events) {
        if (part.key !== 'Dialogue') continue
        const honorifics = getHonorificList(part)
        if (Object.keys(honorifics).length) {
          haveHonorifics = true
          break
        }
      }

      if (!haveHonorifics) return

      for (const part of events) {
        if (part.key !== 'Dialogue') continue

        const honorifics = getHonorificList(part)
        const names = Object.keys(honorifics)
        if (!names.length) continue

        const siblingHonorifics = part.strictSiblings.reduce((obj, part) => {
          const honorifics = getHonorificList(part)
          const names = Object.keys(honorifics)
          for (const key of names) {
            if (!obj[key]) obj[key] = new Set()
            for (const honorific of honorifics[key]) {
              obj[key].add(honorific)
            }
          }
          return obj
        }, Object.create(null))
        const siblingNames = Object.keys(siblingHonorifics)
        if (!siblingNames.length) continue

        for (const name of names) {
          const honorificSet = honorifics[name]
          const siblingHonorificSet = siblingHonorifics[name]
          if (!siblingHonorificSet) continue

          // Check if merging those two sets result in a larger set or not
          const allFound = new Set([...honorificSet, ...siblingHonorificSet])
          if (allFound.size === honorificSet.size) continue

          context.report({
            line: part.line,
            content: part.value.Text,
            message: `honorific mismatch for "${name}"; found: ${
              Array.from(honorificSet).sort().map(e => JSON.stringify(e)).join(', ')
            }; expected: ${
              Array.from(siblingHonorificSet).sort().map(e => JSON.stringify(e)).join(', ')
            }`
          })
        }
      }
    }
  }
}

const honorificRegex = /(?<name>[A-Za-z']+)-(?<honorific>([ao]?nee|o?nii)?(san|sama|chan)|o?jou|ky?un|senpai|sensei)/gi
function getHonorificList (part) {
  return Array.from(part.value.Text.matchAll(honorificRegex)).reduce((obj, match) => {
    const { name, honorific } = match.groups
    const key = name.toLowerCase()
    if (!obj[key]) obj[key] = new Set()
    obj[key].add(honorific.toLowerCase())
    return obj
  }, Object.create(null))
}
