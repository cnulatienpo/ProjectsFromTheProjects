// Input:  app/src/ai/reportEvolve.ts
// Output: server/generated/reportEvolve.js  (ESM)

import fs from 'fs'
import path from 'path'

const INPUT = process.env.REPORT_EVOLVE_TS || path.resolve('app/src/ai/reportEvolve.ts')
const OUTDIR = path.resolve('server/generated')
const OUT = path.join(OUTDIR, 'reportEvolve.js')

function read(p) { try { return fs.readFileSync(p, 'utf8') } catch (e) { console.error(`❌ ${e.message}`); process.exit(1) } }

// extremely small “TS ➜ JS” sanitizer (handles typical cases)
function stripTS(src) {
    return src
        // remove imports of types and type-only exports
        .replace(/^\s*import\s+type[\s\S]*?;?\s*$/gm, '')
        .replace(/^\s*export\s+type[\s\S]*?;?\s*$/gm, '')
        // kill interface/type declarations
        .replace(/^\s*(export\s+)?interface\s+\w+[\s\S]*?\}\s*$/gm, '')
        .replace(/^\s*(export\s+)?type\s+\w+\s*=\s*[\s\S]*?;\s*$/gm, '')
        // strip simple param/var type annotations like ": Foo", ": Foo[]" (best-effort)
        .replace(/: ?[A-Za-z_]\w*(\[\])?/g, '')
        // strip generic type params in function heads like <T>(...  -> (...
        .replace(/function\s+(\w+)\s*<[^>]+>\s*\(/g, 'function $1(')
        .replace(/(\)\s*:\s*[A-Za-z_]\w*(\[\])?)/g, ')')
        // "as const" / "as something"
        .replace(/\s+as\s+[A-Za-z_][\w.]*/g, '')
        // export forms stay as ESM
        .replace(/^\s*export\s+default\s+/m, 'export default ')
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

function main() {
    const src = read(INPUT)
    const js = stripTS(src).trim()
    if (!/export\s+function\s+evolveReport\s*\(/.test(js) && !/export\s+default\s+/.test(js)) {
        console.warn('⚠️  Could not find an exported evolveReport(). Ensure your TS exports it.')
    }
    ensureDir(OUTDIR)
    fs.writeFileSync(OUT, js, 'utf8')
    console.log(`✅ Wrote ${OUT}`)
}
main()
