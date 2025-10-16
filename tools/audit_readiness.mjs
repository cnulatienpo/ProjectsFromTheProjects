import fs from 'fs'
import path from 'path'

const out = []
const add = (ok, name, detail = '') => out.push({ ok, name, detail })

const R = (...s) => path.resolve(...s)
const exists = (p) => fs.existsSync(p)

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}

// 1) Frontend entry points
add(exists(R('app', 'index.html')), 'app/index.html exists',
  exists(R('app', 'index.html')) ? '' : 'Vite needs index.html with <div id="root">')
add(exists(R('app', 'src', 'main.jsx')), 'app/src/main.jsx exists')
add(exists(R('app', 'src', 'App.jsx')), 'app/src/App.jsx exists')
add(exists(R('app', 'src', 'pages', 'SigilSyntax.jsx')), 'SigilSyntax page present', 'Needed for /sigil route')

// 2) apiBase helper
add(exists(R('app', 'src', 'lib', 'apiBase.js')) || exists(R('app', 'src', 'lib', 'apiBase.jsx')),
  'apiBase helper present', 'Required so dev/prod hit the right backend')

// 3) Vite config sanity
const vitecfg = exists(R('app', 'vite.config.js')) ? fs.readFileSync(R('app', 'vite.config.js'), 'utf8') : ''
add(!!vitecfg, 'vite.config.js present')
add(/base:\s*process\.env\.GHPAGES_BASE|base:\s*`\/.+\/'`/.test(vitecfg) || !vitecfg,
  'vite base set for Pages', 'BASE should be /<repo>/ for GitHub Pages')
add(/server:\s*{[\s\S]*proxy:/.test(vitecfg) || /VITE_DEV_API/.test(vitecfg),
  'dev uses proxy or VITE_DEV_API', 'Either Vite proxy keys or VITE_DEV_API required in dev')

// 4) Dev env override
add(exists(R('app', '.env.local')) || process.env.VITE_DEV_API,
  'VITE_DEV_API set for dev (Option A)', 'Create app/.env.local with VITE_DEV_API=https://<codespace-3001>.app.github.dev')

// 5) Backend endpoints
add(exists(R('server', 'index.js')), 'server/index.js exists')
const serverSrc = exists(R('server', 'index.js')) ? fs.readFileSync(R('server', 'index.js'), 'utf8') : ''
add(/app\.get\(['"]\/health['"]/.test(serverSrc), 'GET /health route wired')
add(/app\.get\(['"]\/sigil\/catalog['"]/.test(serverSrc), 'GET /sigil/catalog route wired')
add(/app\.get\(['"]\/sigil\/game\/:id['"]/.test(serverSrc), 'GET /sigil/game/:id route wired')

// 6) Content bundle present
const bundle = R('game things', 'build', 'sigil-syntax', 'bundle_sigil_syntax.json')
add(exists(bundle) || exists(R('game thingss', 'build', 'sigil-syntax', 'bundle_sigil_syntax.json')),
  'Sigil bundle exists', 'Run npm run emit:sigil:labeled to generate')
let items = 0
try {
  const b = JSON.parse(fs.readFileSync(exists(bundle) ? bundle : R('game thingss', 'build', 'sigil-syntax', 'bundle_sigil_syntax.json'), 'utf8'))
  items = Array.isArray(b?.items) ? b.items.length : 0
} catch { }
add(items > 0, `Sigil bundle has items (${items})`, 'Builder found no lessons; check labeled data/tweetrunk_renumbered')

// --- Live backend checks (dev) ---------------------------------------------
const envLocalPath = R('app', '.env.local')
let devApi = process.env.VITE_DEV_API || ''
try {
  if (!devApi && exists(envLocalPath)) {
    const envTxt = fs.readFileSync(envLocalPath, 'utf8')
    const m = envTxt.match(/^\s*VITE_DEV_API\s*=\s*(.+)\s*$/m)
    if (m) devApi = m[1].trim()
  }
} catch { }

if (devApi) {
  const base = devApi.replace(/\/+$/, '')
  add(true, `Dev API configured: ${base}`)
  const tryFetch = async (pathSeg) => {
    try {
      const r = await fetch(base + pathSeg, { headers: { accept: 'application/json' } })
      const ct = r.headers.get('content-type') || ''
      if (!r.ok) return { ok: false, status: r.status, ct }
      if (!ct.includes('application/json')) return { ok: false, status: r.status, ct }
      const j = await r.json()
      return { ok: true, status: r.status, ct, j }
    } catch (e) {
      return { ok: false, err: String(e) }
    }
  }

  // run the two key endpoints
  const ping = await tryFetch('/__ping')
  add(!!ping.ok, 'Backend /__ping reachable', ping.ok ? '' : JSON.stringify(ping))

  const cat = await tryFetch('/sigil/catalog')
  add(!!cat.ok, 'Backend /sigil/catalog reachable', cat.ok ? '' : JSON.stringify(cat))

  if (cat.ok) {
    const games = Array.isArray(cat.j?.games) ? cat.j.games : []
    add(games.length > 0, `Catalog has lessons (${games.length})`, games.length ? '' : 'Bundle empty? Run emit:sigil:labeled')
  }
} else {
  add(false, 'Dev API configured', 'Set app/.env.local with VITE_DEV_API=https://<codespace-3001>.app.github.dev')
}

const result = {
  summary: {
    ok: out.every(x => x.ok),
    passed: out.filter(x => x.ok).length,
    total: out.length
  },
  checks: out
}
const okCount = result.summary.passed, total = result.summary.total
console.log(`\n=== AUDIT: ${okCount}/${total} checks passed ===\n`)
for (const c of out) {
  const mark = c.ok ? '✅' : '❌'
  console.log(`${mark} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`)
}
console.log('\nTip: run the backend (node server/index.js), set VITE_DEV_API in app/.env.local, then npm run dev --prefix app\n')
process.exit(result.summary.ok ? 0 : 1)
