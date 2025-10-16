import fs from 'fs'
import path from 'path'

const R = (...s) => path.resolve(...s)
const E = (p) => ({ path: p, exists: fs.existsSync(p) })

export function collectDiagnostics() {
  const indexHtml = E(R('app','index.html'))
  const mainJsx   = E(R('app','src','main.jsx'))
  const appJsx    = E(R('app','src','App.jsx'))
  const sigilPage = E(R('app','src','pages','SigilSyntax.jsx'))
  const apiBase   = E(R('app','src','lib','apiBase.js')) || E(R('app','src','lib','apiBase.jsx'))

  const viteCfg   = E(R('app','vite.config.js'))
  let viteNotes = []
  try {
    const txt = fs.readFileSync(R('app','vite.config.js'),'utf8')
    if (!/base:/.test(txt)) viteNotes.push('vite.base missing (GitHub Pages needs /<repo>/)')
    if (!/proxy:/.test(txt) && !/VITE_DEV_API/.test(fs.readFileSync(R('app','.env.local'),'utf8')||'')) {
      viteNotes.push('no dev proxy and no VITE_DEV_API — dev calls may 404')
    }
  } catch {}
  const bundle = R('game things','build','sigil-syntax','bundle_sigil_syntax.json')
  const bundleOld = R('game thingss','build','sigil-syntax','bundle_sigil_syntax.json')
  let bundleInfo = { exists: fs.existsSync(bundle) || fs.existsSync(bundleOld), items: 0 }
  try {
    const p = fs.existsSync(bundle) ? bundle : bundleOld
    if (p) {
      const j = JSON.parse(fs.readFileSync(p,'utf8'))
      bundleInfo.items = Array.isArray(j?.items) ? j.items.length : 0
    }
  } catch {}

  return {
    frontend: { indexHtml, mainJsx, appJsx, sigilPage, apiBase, viteCfg, viteNotes },
    content: { bundle: E(bundle), bundleOld: E(bundleOld), bundleInfo },
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      VITE_DEV_API: process.env.VITE_DEV_API || null,
      VITE_PROD_API: process.env.VITE_PROD_API || null
    }
  }
}
