import type { Pack, WordEntry } from '../types';

function derivePackId(filename: string): string {
  const match = filename.match(/pack-(\d+)/i);
  return match ? `pack-${match[1]}` : filename.replace(/\.json$/, '');
}

function deriveLabel(filename: string): string {
  return filename
    .replace(/\.json$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function loadAllPacks(): Promise<Pack[]> {
  const modules = import.meta.glob('../game thingss/*.json');
  const packs: Pack[] = [];
  for (const path in modules) {
    const mod: any = await modules[path]();
    const entries: WordEntry[] = mod.default || mod;
    const id = derivePackId(path.split('/').pop() || '');
    const label = deriveLabel(path.split('/').pop() || '');
    packs.push({ id, label, entries });
  }
  packs.sort((a, b) => a.id.localeCompare(b.id));
  return packs;
}
