import fs from 'fs'
import path from 'path'

const DEFAULT_BUNDLE = path.resolve('game things','build','sigil-syntax','bundle_sigil_syntax.json')

export function listSigilIds() {
  const p = process.env.SIGIL_BUNDLE || DEFAULT_BUNDLE
  try {
    const j = JSON.parse(fs.readFileSync(p,'utf8'))
    const items = Array.isArray(j?.items) ? j.items : []
    return items.map(x => x.id).filter(Boolean)
  } catch {
    return []
  }
}
