// server/sigilCatalog.ts
import type { Express } from 'express';
import { createReadStream, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as readline from 'node:readline';

const LABELED = resolve(process.cwd(), 'labeled data');
const JSONL = resolve(process.cwd(), 'labeled data', 'tweetrunk_renumbered.jsonl');

// Choose title/id keys generously so your rows get picked up
const TITLE_KEYS = [
  'title','heading','name','label','prompt','text','tweet','tweet_text','full_text',
  'content','body','message','excerpt','line','sentence'
];
const ID_KEYS = ['id','slug','key','uid','code','hash','guid'];

type Item = { id: string; title: string; level?: number; type?: string };

// ---------- utilities ----------
function firstString(obj: any, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}
function normalize(row: any, i: number): Item | null {
  if (!row) return null;
  if (typeof row === 'string') return row.trim() ? { id: `item-${i}`, title: row.trim() } : null;
  const title = firstString(row, TITLE_KEYS);
  if (!title) return null;
  const id = firstString(row, ID_KEYS) ?? title.slice(0, 64) || `item-${i}`;
  const levelRaw = Number(row.level);
  const level = Number.isFinite(levelRaw) ? levelRaw : undefined;
  const type = typeof row.type === 'string' ? row.type : 'lesson';
  return { id: String(id), title: String(title), level, type };
}

// Tiny CSV parser (handles quoted commas & double-quotes)
function parseCSV(text: string): any[] {
  if (!text) return [];
  const rows: string[] = [];
  let cur = '', inQ = false;
  for (let i=0;i<text.length;i++){
    const ch = text[i], nx = text[i+1];
    if (ch === '"' && inQ && nx === '"'){ cur += '"'; i++; continue; }
    if (ch === '"'){ inQ = !inQ; continue; }
    if (ch === '\n' || ch === '\r'){
      if (!inQ){ rows.push(cur); cur=''; if (ch==='\r' && nx==='\n') i++; continue; }
    }
    cur += ch;
  }
  if (cur) rows.push(cur);
  if (rows.length === 0) return [];
  const header = rows[0].split(',').map(h=>h.trim());
  const out: any[] = [];
  for (let r=1; r<rows.length; r++){
    const cols = splitCSVLine(rows[r]);
    const obj: any = {};
    for (let c=0;c<header.length;c++){ obj[header[c]] = (cols[c] ?? '').trim(); }
    out.push(obj);
  }
  return out;

  function splitCSVLine(line: string): string[] {
    const arr: string[] = [];
    let buf = '', q = false;
    for (let i=0;i<line.length;i++){
      const ch = line[i], nx = line[i+1];
      if (ch === '"' && q && nx === '"'){ buf += '"'; i++; continue; }
      if (ch === '"'){ q = !q; continue; }
      if (ch === ',' && !q){ arr.push(buf); buf=''; continue; }
      buf += ch;
    }
    arr.push(buf);
    return arr;
  }
}

function parseLineJSON(s: string): any | null {
  if (!s) return null;
  const trim = s.replace(/^\uFEFF/, '').trim();    // strip BOM
  if (!trim || trim.startsWith('//')) return null; // comments/blank
  try { return JSON.parse(trim.replace(/,?$/, '')); }
  catch { return null; }
}

// ---------- readers ----------
async function readJSONL(path: string): Promise<{items: Item[], stats: any}> {
  const stats = { exists: existsSync(path), lines: 0, parsed: 0, accepted: 0, dropped_no_title: 0, dropped_bad_json: 0 };
  const items: Item[] = [];
  if (!stats.exists) return { items, stats };

  // If file is actually a JSON array, accept it
  const raw = readFileSync(path, 'utf8');
  if (raw.trim().startsWith('[')) {
    const arr = JSON.parse(raw);
    stats.parsed = arr.length;
    for (let i=0;i<arr.length;i++){
      const it = normalize(arr[i], i);
      if (it) { items.push(it); stats.accepted++; } else { stats.dropped_no_title++; }
    }
    return { items, stats };
  }

  const rl = readline.createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  let i = 0;
  for await (const ln of rl) {
    stats.lines++;
    const obj = parseLineJSON(ln);
    if (!obj){ stats.dropped_bad_json++; i++; continue; }
    stats.parsed++;
    const it = normalize(obj, i);
    if (it){ items.push(it); stats.accepted++; } else { stats.dropped_no_title++; }
    i++;
  }
  return { items, stats };
}

function readAllCSV(dir: string): {items: Item[], stats: any} {
  const stats = { files: 0, rows: 0, accepted: 0 };
  const items: Item[] = [];
  let list: string[] = [];
  try {
    list = readdirSync(dir).filter(n => n.toLowerCase().endsWith('.csv'));
  } catch {}
  for (const name of list) {
    stats.files++;
    const text = readFileSync(join(dir, name), 'utf8');
    const rows = parseCSV(text);
    stats.rows += rows.length;
    rows.forEach((row, i) => {
      const it = normalize(row, i);
      if (it){ items.push(it); stats.accepted++; }
    });
  }
  return { items, stats };
}

// ---------- route ----------
export function installSigilCatalogRoute(app: Express) {
  app.get('/sigil/catalog', async (_req, res) => {
    try {
      const { items: jsonlItems, stats: s1 } = await readJSONL(JSONL);
      const { items: csvItems,   stats: s2 } = readAllCSV(LABELED);

      let items = [...jsonlItems, ...csvItems];

      // dedupe + sort
      const seen = new Set<string>();
      items = items.filter(it => (seen.has(it.id) ? false : (seen.add(it.id), true)))
                   .sort((a,b)=>a.id.localeCompare(b.id));

      console.log('[Sigil] JSONL stats:', s1, 'CSV stats:', s2, 'total:', items.length);
      if (!items.length) {
        return res.status(200).json({ items: [] });
      }
      res.status(200).json({ items });
    } catch (e) {
      console.error('[Sigil] catalog error', e);
      res.status(200).json({ items: [] });
    }
  });
}
