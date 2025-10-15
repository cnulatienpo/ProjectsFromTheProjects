// Convert a TS phrases file to JSON for the backend.
// Input (default): app/src/ai/sigil-syntax/reportPhrases.ts
// Output: game things/sigil-syntax/reportPhrases.json

import fs from 'fs'
import path from 'path'

const INPUT =
  process.env.PHRASES_TS || path.resolve('app/src/ai/sigil-syntax/reportPhrases.ts')
const OUT_DIR = path.resolve('game things', 'sigil-syntax')
const OUT_FILE = path.join(OUT_DIR, 'reportPhrases.json')

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
    // try to extract object literal if file wraps it
    if (!t.startsWith('{')) {
        const a = t.indexOf('{'), b = t.lastIndexOf('}')
        if (a !== -1 && b !== -1 && b > a) t = t.slice(a, b + 1)
    }
    try { return JSON.parse(t) } catch (e) {
        console.error('❌ Failed to parse phrases JSON from sanitized TS.')
        console.error(t.slice(0, 400))
        console.error(e.message)
        process.exit(1)
    }
}

function validate(obj) {
    // expected shape (flexible, but typically):
    // {
    //   closers: { low:string[], mid:string[], high:string[] },
    //   tags: { [tag:string]: string[] },
    //   praise: string[],
    //   generic: string[]
    // }
    if (!obj || typeof obj !== 'object') {
        console.error('❌ Phrases must be an object map.'); process.exit(1)
    }
    return obj
}

function main() {
    const src = read(INPUT)
    const jsonish = sanitize(src)
    const obj = validate(toJSON(jsonish))
    fs.mkdirSync(OUT_DIR, { recursive: true })
    fs.writeFileSync(OUT_FILE, JSON.stringify(obj, null, 2), 'utf8')
    console.log(`✅ Wrote ${OUT_FILE}`)
}
main()
