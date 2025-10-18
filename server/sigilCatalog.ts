// server/sigilCatalog.ts
import type { Express, Request, Response } from 'express';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as readline from 'node:readline';

const FILE = resolve(process.cwd(), 'labeled data', 'tweetrunk_renumbered.jsonl');

type Item = { id: string; title: string; level?: number; type?: string };

function normalize(row: any, i: number): Item | null {
  if (!row) return null;
  // try common title-ish keys for tweetwunk
  const title =
    row.title ?? row.heading ?? row.prompt ?? row.text ?? row.tweet ?? row.tweet_text ?? row.content ?? row.label;
  if (!title) return null;
  const id =
    row.id ?? row.slug ?? row.key ?? row.uid ?? row.code ??
    (typeof title === 'string' ? title.slice(0, 64) : `item-${i}`);
  const level = Number.isFinite(Number(row.level)) ? Number(row.level) : undefined;
  const type = typeof row.type === 'string' ? row.type : 'lesson';
  return { id: String(id), title: String(title), level, type };
}

async function readJSONL(path: string): Promise<Item[]> {
  const items: Item[] = [];
  if (!existsSync(path)) return items;

  // If file is small, fast path
  const statOk = (() => {
    try { return readFileSync(path, { encoding: 'utf8', flag: 'r' }).length < 2_000_000; } catch { return false; }
  })();

  if (statOk) {
    const raw = readFileSync(path, 'utf8');
    const lines = raw.split(/\r?\n/);
    lines.forEach((ln, i) => {
      const s = ln.trim();
      if (!s || s.startsWith('//')) return;
      try {
        const obj = JSON.parse(s.replace(/,?$/, ''));
        const it = normalize(obj, i);
        if (it) items.push(it);
      } catch {}
    });
    return items;
  }

  // Stream for big files
  const rl = readline.createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  let i = 0;
  for await (const ln of rl) {
    const s = ln.trim();
    if (!s || s.startsWith('//')) { i++; continue; }
    try {
      const obj = JSON.parse(s.replace(/,?$/, ''));
      const it = normalize(obj, i);
      if (it) items.push(it);
    } catch {}
    i++;
  }
  return items;
}

export function installSigilCatalogRoute(app: Express) {
  app.get('/sigil/catalog', async (_req: Request, res: Response) => {
    try {
      const items = await readJSONL(FILE);
      if (!items.length) {
        console.warn('[Sigil] No items parsed from', FILE);
        return res.status(200).json({
          items: [{ id: 'fallback-001', title: 'Sigil Welcome', level: 1, type: 'lesson' }]
        });
      }
      // stable & dedup
      const seen = new Set<string>();
      const dedup = items.filter(it => (seen.has(it.id) ? false : (seen.add(it.id), true)))
                         .sort((a, b) => a.id.localeCompare(b.id));
      res.status(200).json({ items: dedup });
    } catch (e) {
      console.error('[Sigil] catalog error', e);
      res.status(200).json({ items: [] });
    }
  });
}
