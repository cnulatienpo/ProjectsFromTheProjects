// Read writer_type_custom_elements.jsonl → emit game thingss/writer_types.json

import fs from 'fs'
import path from 'path'

const INPUT = process.env.WRITER_TYPES_JSONL || path.resolve('game thingss', 'writer_type_custom_elements.jsonl')
const OUTDIR = path.resolve('game thingss')
const OUT = path.join(OUTDIR, 'writer_types.json')

function readLines(p) {
    try { return fs.readFileSync(p, 'utf8').split('\n') }
    catch (e) { console.error(`❌ Cannot read ${p}: ${e.message}`); process.exit(1) }
}

function parseJSONL(lines) {
    const items = []
    const errs = []
    lines.forEach((line, i) => {
        const t = line.trim()
        if (!t) return
        try {
            const obj = JSON.parse(t)
            // normalize a few expected fields; keep everything else
            const id = String(obj.id || obj.key || obj.slug || `wt_${i}`)
            const kind = String(obj.kind || obj.type || 'element')
            const label = String(obj.label || obj.title || id)
            const html = obj.html ?? obj.template ?? null
            const rules = obj.rules ?? obj.when ?? null
            items.push({ id, kind, label, html, rules, ...obj })
        } catch (e) { errs.push({ line: i + 1, err: e.message }) }
    })
    return { items, errs }
}

function main() {
    const { items, errs } = parseJSONL(readLines(INPUT))
    if (errs.length) {
        console.warn(`⚠️ Parsed with ${errs.length} error(s). First few:`, errs.slice(0, 3))
    }
    if (!items.length) {
        console.error('❌ No items parsed.'); process.exit(1)
    }
    fs.mkdirSync(OUTDIR, { recursive: true })
    fs.writeFileSync(OUT, JSON.stringify({ version: 1, count: items.length, items }, null, 2), 'utf8')
    console.log(`✅ Wrote ${OUT} (${items.length} items)`)
}
main()
