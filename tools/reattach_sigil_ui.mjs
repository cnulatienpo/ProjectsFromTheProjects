// tools/reattach_sigil_ui.mjs
// Scans for an existing Sigil UI page/component and wires /sigil routes in app/src/App.*
// Also drops a minimal wrapper page if only a ClassicSigilUI component is found.

import fs from 'fs'
import path from 'path'

const APP = 'app'
const SRC = path.join(APP, 'src')
const PAGES = path.join(SRC, 'pages')
const STYLES = path.join(SRC, 'styles')
const APP_FILES = [
  path.join(SRC, 'App.jsx'),
  path.join(SRC, 'App.tsx'),
]

function exists(p) {
  return fs.existsSync(p)
}

function read(p) {
  return fs.readFileSync(p, 'utf8')
}

function write(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, s, 'utf8')
}

function findCandidates() {
  const cand = []
  const patterns = [
    /SigilRunner\.(jsx|tsx)$/,
    /SigilSyntaxGame\.(jsx|tsx)$/,
    /SigilSyntax\.(jsx|tsx)$/,
  ]
  const compPatterns = [
    /ClassicSigilUI\.(jsx|tsx)$/,
    /components\/sigil\/.*\.(jsx|tsx)$/,
  ]

  function walk(dir) {
    if (!exists(dir)) return
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name)
      const st = fs.statSync(p)
      if (st.isDirectory()) walk(p)
      else if (/\.(jsx|tsx)$/.test(name)) cand.push(p)
    }
  }

  walk(SRC)
  const pageHits = cand.filter((f) => patterns.some((rx) => rx.test(f)))
  const compHits = cand.filter((f) => compPatterns.some((rx) => rx.test(f)))
  return { pageHits, compHits }
}

function pickPage({ pageHits, compHits }) {
  if (pageHits.length) return { type: 'page', file: pageHits[0] }
  if (compHits.length) return { type: 'component', file: compHits[0] }
  return null
}

function ensureStylesImport() {
  const candidates = ['main.jsx', 'main.tsx'].map((f) => path.join(SRC, f))
  const mainFile = candidates.find(exists)
  if (!mainFile) return

  let txt = read(mainFile)
  const hasLayout = /['"]\.\/styles\/layout\.css['"]/.test(txt)
  const hasSigil = /['"]\.\/styles\/sigil\.css['"]/.test(txt)
  const layoutPath = path.join(STYLES, 'layout.css')
  const sigilPath = path.join(STYLES, 'sigil.css')

  const imports = []
  if (exists(layoutPath) && !hasLayout) imports.push("import './styles/layout.css'\n")
  if (exists(sigilPath) && !hasSigil) imports.push("import './styles/sigil.css'\n")

  if (imports.length) {
    txt = imports.join('') + txt
    write(mainFile, txt)
  }
}

function createWrapper(componentPath) {
  const rel = path.relative(PAGES, componentPath).replaceAll(path.sep, '/')
  const importPathRaw = rel.startsWith('.') || rel.startsWith('..') ? rel : `./${rel}`
  const importPath = importPathRaw.replace(/\.(jsx|tsx)$/, '')
  const wrapper = `import UI from '${importPath}'\n\nexport default function SigilRunner() {\n  return <UI />\n}\n`

  const out = path.join(PAGES, 'SigilRunner.jsx')
  write(out, wrapper)
  return out
}

function ensureRouterImport(txt) {
  const routerImportRegex = /import\s*{([^}]*)}\s*from\s*['"]react-router-dom['"]/m
  if (routerImportRegex.test(txt)) {
    const match = routerImportRegex.exec(txt)
    const existing = match[1]
    const names = existing
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const dep of ['BrowserRouter', 'Routes', 'Route']) {
      if (!names.includes(dep)) names.push(dep)
    }
    const replacement = `import { ${Array.from(new Set(names)).join(', ')} } from 'react-router-dom'`
    return txt.replace(routerImportRegex, replacement)
  }

  return `import { BrowserRouter, Routes, Route } from 'react-router-dom'\n${txt}`
}

function ensureBrowserRouter(txt) {
  const hasBrowserRouter = /<BrowserRouter/.test(txt)
  if (hasBrowserRouter) {
    if (!/<BrowserRouter[^>]*basename=/.test(txt)) {
      return txt.replace(
        /<BrowserRouter([^>]*)>/,
        (_m, attrs) => `<BrowserRouter${attrs} basename="/projects-from-the-projects">`
      )
    }
    return txt
  }

  if (!/<Routes[^>]*>/.test(txt)) return txt

  let updated = txt.replace(
    /(\s*)<Routes([^>]*)>/,
    (_m, indent, rest) =>
      `${indent}<BrowserRouter basename="/projects-from-the-projects">\n${indent}  <Routes${rest}>`
  )
  updated = updated.replace(
    /(\s*)<\/Routes>/,
    (_m, indent) => `${indent}  </Routes>\n${indent}</BrowserRouter>`
  )
  return updated
}

function ensureSigilRoutes(txt) {
  if (/<Route\s+path=['"]\/sigil['"]/.test(txt)) return txt

  const match = txt.match(/(\s*)<Routes[^>]*>/)
  if (!match) return txt

  const indent = `${match[1]}  `
  const injection =
    `${match[0]}\n${indent}<Route path="/sigil" element={<SigilRunner />} />\n${indent}<Route path="/sigil/:id" element={<SigilRunner />} />`
  return txt.replace(match[0], injection)
}

function ensureSigilImport(txt, pageFile, appFile) {
  if (/import\s+SigilRunner\s+from\s+['"][^'"]+['"]/.test(txt)) return txt

  const usesAlias = (() => {
    if (/from\s+['"]@\/pages\//.test(txt)) return true
    const configCandidates = ['vite.config.js', 'vite.config.ts'].map((f) => path.join(APP, f))
    return configCandidates.some((cfg) => exists(cfg) && /['"]@\/pages\//.test(read(cfg)))
  })()

  const isUnderPages = pageFile.startsWith(PAGES + path.sep) || pageFile === PAGES
  let importPath
  if (usesAlias && isUnderPages) {
    const relToPages = pageFile.slice(PAGES.length + 1).replaceAll(path.sep, '/')
    importPath = `@/pages/${relToPages}`
  } else {
    const relFromApp = path.relative(path.dirname(appFile), pageFile).replaceAll(path.sep, '/')
    importPath = relFromApp.startsWith('.') ? relFromApp : `./${relFromApp}`
  }

  importPath = importPath.replace(/\.(jsx|tsx)$/, '')

  const importLine = `import SigilRunner from '${importPath}'\n`
  const useClientMatch = txt.match(/^(?:['"]use client['"];?\s*)/)
  if (useClientMatch) {
    const [prefix] = useClientMatch
    const rest = txt.slice(prefix.length)
    return `${prefix}\n${importLine}${rest}`
  }

  return `${importLine}${txt}`
}

function addRoute(pageFile) {
  const appFile = APP_FILES.find(exists)
  if (!appFile) {
    console.error('❌ Could not find app/src/App.jsx or App.tsx')
    process.exit(1)
  }

  let txt = read(appFile)
  txt = ensureRouterImport(txt)
  txt = ensureBrowserRouter(txt)
  txt = ensureSigilRoutes(txt)
  txt = ensureSigilImport(txt, pageFile, appFile)

  write(appFile, txt)
}

(function main() {
  if (!exists(SRC)) {
    console.error('❌ Missing app/src — are you in the right repo?')
    process.exit(1)
  }

  const { pageHits, compHits } = findCandidates()
  const pick = pickPage({ pageHits, compHits })
  console.log('🔎 page candidates:', pageHits)
  console.log('🔎 component candidates:', compHits)

  if (!pick) {
    console.error('❌ No Sigil UI files found. Try: rg -n "(SigilRunner|ClassicSigil|SigilSyntax)" app/src src')
    process.exit(2)
  }

  let pageFile = pick.file
  if (pick.type === 'component') {
    console.log('ℹ️ Found component UI, creating wrapper page…')
    pageFile = createWrapper(pick.file)
  }

  ensureStylesImport()
  addRoute(pageFile)

  console.log('✅ Reattached /sigil routes to:', pageFile)
  console.log('→ Now run: npm run dev --prefix app  and open  /projects-from-the-projects/sigil')
})()

