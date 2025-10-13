import { validateAndNormalizePack } from './validateAndNormalize';
import type { WordEntry } from './wordTypes';

export type { WordEntry } from './wordTypes';

export type Pack = {
  id: string;
  label: string;
  file: string;
  entries: WordEntry[];
  meta: { dropped: number; dupes: number };
};

function slugFromFile(filePath: string): string {
  const name = filePath.split('/').pop() || filePath;
  const m = name.match(/pack-(\d+)[^-]*/i);
  return m ? `pack-${m[1]}` : name.replace(/\.json$/i, '');
}

function labelFromFile(filePath: string): string {
  const name = filePath.split('/').pop()?.replace(/\.json$/i, '') || filePath;
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function loadAllPacksSafe(): Promise<{ packs: Pack[]; report: string[]; total: number }> {
  const modules = import.meta.glob('/src/labeled-data/*.json', { eager: true });
  const packs: Pack[] = [];
  const report: string[] = [];
  let grandTotal = 0;

  for (const [file, mod] of Object.entries(modules)) {
    const raw = (mod as { default?: unknown }).default ?? mod;
    const fileName = file.split('/').pop() || file;
    const { entries, issues } = validateAndNormalizePack(fileName, raw);

    const seen = new Set<string>();
    const deduped: WordEntry[] = [];
    let dupes = 0;
    for (const entry of entries) {
      const key = entry.word.toLocaleLowerCase();
      if (seen.has(key)) {
        dupes += 1;
        continue;
      }
      seen.add(key);
      deduped.push(entry);
    }

    deduped.sort((a, b) => a.word.localeCompare(b.word, undefined, { sensitivity: 'base' }));

    packs.push({
      id: slugFromFile(file),
      label: labelFromFile(file),
      file,
      entries: deduped,
      meta: { dropped: issues.length, dupes },
    });

    grandTotal += deduped.length;

    const first = deduped[0]?.word ?? '—';
    const last = deduped[deduped.length - 1]?.word ?? '—';
    report.push(
      `${file.split('/').pop()}: count=${deduped.length}, dropped=${issues.length}, dupes=${dupes}, first="${first}", last="${last}"`
    );
    if (issues.length) {
      for (const msg of issues) {
        report.push(`  • ${msg}`);
      }
    }
  }

  packs.sort((a, b) => {
    const na = parseInt(a.id.replace(/\D/g, '') || '0', 10);
    const nb = parseInt(b.id.replace(/\D/g, '') || '0', 10);
    return na - nb || a.id.localeCompare(b.id);
  });

  return { packs, report, total: grandTotal };
}

export async function loadAllPacks(): Promise<Pack[]> {
  const { packs } = await loadAllPacksSafe();
  return packs;
}

export function reportPackHealth(packs: Pack[], report: string[]): void {
  const rows = packs.map((p) => ({
    id: p.id,
    label: p.label,
    entries: p.entries.length,
    dropped: p.meta.dropped,
    dupes: p.meta.dupes,
    first: p.entries[0]?.word ?? '—',
    last: p.entries[p.entries.length - 1]?.word ?? '—',
  }));
  console.table(rows);
  for (const line of report) console.log(line);
  const total = rows.reduce((n, r) => n + r.entries, 0);
  console.log('TOTAL ENTRIES:', total);
}

export function assertMinimum(total: number, min: number): void {
  if (total < min) {
    const msg = [
      `Not enough entries: have ${total}, need at least ${min}.`,
      '• Make sure your JSON packs are in /src/labeled-data and end with ".json".',
      '• Only arrays or { entries: [...] } are accepted.',
      '• Use "npm i zod" and our validator to drop bad rows safely.',
    ].join('\n');
    throw new Error(msg);
  }
}
