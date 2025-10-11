import type { Pack, WordEntry } from '../types';

interface PackModule {
  default: WordEntry[];
}

const packModules = import.meta.glob<PackModule>('../labeled-data/*.json', {
  eager: true
});

let cache: Pack[] | null = null;

function toPackId(filename: string): string {
  const base = filename.replace(/\.json$/i, '');
  const withoutPrefix = base.replace(/^the-good-word-/, '');
  const parts = withoutPrefix.split('-').filter(Boolean);
  if (parts[0] === 'pack' && parts[1]) {
    return `pack-${parts[1]}`;
  }
  if (parts.length === 0) {
    return base;
  }
  return parts[0];
}

function toLabel(filename: string): string {
  const base = filename.replace(/\.json$/i, '');
  const words = base.split('-').filter(Boolean);
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getFileName(path: string): string {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

export async function loadAllPacks(): Promise<Pack[]> {
  if (cache) {
    return cache;
  }

  const packs: Pack[] = Object.entries(packModules).map(([path, mod]) => {
    const fileName = getFileName(path);
    return {
      id: toPackId(fileName),
      label: toLabel(fileName),
      entries: Array.isArray(mod.default) ? mod.default : []
    } satisfies Pack;
  });

  cache = packs.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return cache;
}
