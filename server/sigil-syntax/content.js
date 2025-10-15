import fs from 'fs'
import path from 'path'

function firstExisting(...paths) {
  for (const p of paths) { if (fs.existsSync(p)) return p }
  return paths[0]
}

const NEW_BUNDLE = path.resolve('game things', 'build', 'sigil-syntax', 'bundle_sigil_syntax.json')
const OLD_BUNDLE = path.resolve('game thingss', 'build', 'sigil-syntax', 'bundle_sigil_syntax.json')
const BUNDLE = firstExisting(NEW_BUNDLE, OLD_BUNDLE)

function safeRead(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) }
  catch (e) { return { __error: String(e), items: [], first: null } }
}

export function loadSigil() { return safeRead(BUNDLE) }
export function listSigilIds() { return (loadSigil().items || []).map(x => x.id) }
export function getSigilItem(id) { return (loadSigil().items || []).find(x => x.id === id) || null }
export function firstSigilId() { return loadSigil().first || null }

export function getSigilDebug() {
  return {
    bundlePathTried: BUNDLE,
    exists: fs.existsSync(BUNDLE),
    newPath: NEW_BUNDLE,
    oldPath: OLD_BUNDLE,
    counts: {
      items: (loadSigil().items || []).length
    },
    error: loadSigil().__error || null
  }
}

