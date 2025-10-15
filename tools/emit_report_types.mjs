// Input (default): app/src/ai/sigil-syntax/reportTypes.ts
// Output: game things/sigil-syntax/reportTypes.json

import fs from 'fs'
import path from 'path'

const INPUT =
  process.env.REPORT_TYPES_TS || path.resolve('app/src/ai/sigil-syntax/reportTypes.ts')
const OUTDIR = path.resolve('game things', 'sigil-syntax')
const OUT = path.join(OUTDIR, 'reportTypes.json')

function read(p) {
    try { return fs.readFileSync(p, 'utf8') } catch (e) {
        console.error(`❌ Cannot read ${p}: ${e.message}`); process.exit(1)
    }
}

function sanitize(ts) {
    return ts
        // drop imports/types
        .replace(/^\s*import[\s\S]*?;?\s*$/gm, '')
        .replace(/^\s*export\s+type[\s\S]*?;?\s*$/gm, '')
        // strip "as const" and trivial type annotations
        .replace(/\sas const\b/g, '')
        .replace(/: \w+(\[\])?/g, '')
        // remove export wrappers
        .replace(/^\s*export\s+default\s+/m, '')
        .replace(/^\s*export\s+const\s+\w+\s*=\s*/m, '')
        .trim()
}

function toJSON(text) {
    let t = text.trim()
    // support either top-level array or object with { reportTypes:[...] }
    if (!t.startsWith('[') && !t.startsWith('{')) {
        const a = t.indexOf('{'), b = t.lastIndexOf('}')
        if (a !== -1 && b !== -1 && b > a) t = t.slice(a, b + 1)
    }
    // if it looks like an object, try to extract .reportTypes
    if (t.startsWith('{')) {
        const m = t.match(/reportTypes\s*:\s*(\[[\s\S]*\])/)
        if (m) t = m[1]
    }
    try { return JSON.parse(t) } catch (e) {
        console.error('❌ Failed to parse report types JSON from sanitized TS.')
        console.error(t.slice(0, 400))
        console.error(e.message)
        process.exit(1)
    }
}

function validate(arr) {
    if (!Array.isArray(arr)) { console.error('❌ reportTypes must be an array.'); process.exit(1) }
    // soft-check common fields: { id, name, sections[], includesStyle:boolean }
    return arr
}

function main() {
    const src = read(INPUT)
    const jsonish = sanitize(src)
    const data = validate(toJSON(jsonish))
    fs.mkdirSync(OUTDIR, { recursive: true })
    fs.writeFileSync(OUT, JSON.stringify({ version: 1, reportTypes: data }, null, 2), 'utf8')
    console.log(`✅ Wrote ${OUT} (${data.length} types)`)
}
main()
