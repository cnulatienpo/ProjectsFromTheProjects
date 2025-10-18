// src/lib/loadSigil.ts
export type SigilItem = { id: string; title: string; level?: number; type?: string };

function normalize(row: any, i: number): SigilItem | null {
  if (!row) return null;
  const id =
    row.id ??
    row.slug ??
    row.key ??
    row.uid ??
    row.code ??
    (typeof row.title === 'string' ? row.title : undefined) ??
    `item-${i}`;
  const title =
    row.title ??
    row.heading ??
    row.name ??
    row.text ??
    row.prompt ??
    row.label ??
    (typeof row === 'string' ? row : null);
  if (!title) return null;
  const level = Number.isFinite(Number(row.level)) ? Number(row.level) : undefined;
  const type = typeof row.type === 'string' ? row.type : 'lesson';
  return { id: String(id), title: String(title), level, type };
}

function parseJSONL(raw: string): any[] {
  // Accepts JSONL: one JSON object per line. Ignores blanks and comment lines starting with //
  const out: any[] = [];
  if (!raw || typeof raw !== 'string') return out;
  const lines = raw.split(/\r?\n/);
  for (const ln of lines) {
    const s = ln.trim();
    if (!s || s.startsWith('//') || s === '[' || s === ']' || s === ',') continue;
    try {
      // Some JSONL generators trail commas; strip trailing commas safely
      const clean = s.replace(/,?$/, '');
      const obj = JSON.parse(clean);
      out.push(obj);
    } catch {
      // ignore malformed rows in dev
    }
  }
  return out;
}

// Glob import: grab all JSONL files as raw text, and also accept any JSON arrays in same folder.
const jsonlMods = import.meta.glob('/src/tweetwunk_renumbered/**/*.jsonl', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const jsonMods = import.meta.glob('/src/tweetwunk_renumbered/**/*.{json}', { eager: true });

export async function loadSigilCatalog() {
  const items: SigilItem[] = [];

  // Consume JSONL files
  for (const [, mod] of Object.entries(jsonlMods)) {
    const raw = (mod as unknown as string) ?? '';
    const rows = parseJSONL(raw);
    rows.forEach((row, i) => {
      const it = normalize(row, i);
      if (it) items.push(it);
    });
  }

  // Also allow JSON files in the same folder (array or {items|entries})
  for (const [, mod] of Object.entries(jsonMods)) {
    const v = (mod as any)?.default ?? mod;
    const arr = Array.isArray(v)
      ? v
      : Array.isArray(v?.items)
      ? v.items
      : Array.isArray(v?.entries)
      ? v.entries
      : [];
    arr.forEach((row: any, i: number) => {
      const it = normalize(row, i);
      if (it) items.push(it);
    });
  }

  // Deterministic order + dedupe by id
  items.sort((a, b) => a.id.localeCompare(b.id));
  const seen = new Set<string>();
  const dedup = items.filter((it) => (seen.has(it.id) ? false : (seen.add(it.id), true)));

  return { items: dedup, source: 'src:tweetwunk_renumbered' };
}
