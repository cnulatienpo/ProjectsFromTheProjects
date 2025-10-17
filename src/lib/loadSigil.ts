// src/lib/loadSigil.ts
// Attempts, in order:
// 1) fetch(`${apiBase}/sigil/catalog`)
// 2) dynamic import of likely local sources (ts/json) without breaking the build if missing
// 3) returns a normalized array of items: { id, title, level?, type? }

export type SigilItem = { id: string; title: string; level?: number; type?: string };

function pick<T=any>(o:any, keys:string[]): T | undefined {
  if (!o) return undefined as any;
  for (const k of keys) if (k in o) return o[k];
  return undefined as any;
}

function coerceItems(input:any): SigilItem[] {
  const root = Array.isArray(input) ? input
    : pick<any[]>(input, ['items','data','catalog','lessons','entries']) ?? [];
  if (!Array.isArray(root)) return [];
  return root.filter(Boolean).map((it:any, i:number): SigilItem => {
    const id    = String(pick(it, ['id','slug','key','uid','code','name','title']) ?? `item-${i}`);
    const title = String(pick(it, ['title','name','label','heading','text']) ?? 'Untitled');
    const lvl   = Number(pick(it, ['level','lvl','tier']));
    const typ   = pick<string>(it, ['type','kind','category']) ?? undefined;
    return { id, title, level: Number.isFinite(lvl) ? lvl : undefined, type: typ };
  });
}

// Try dynamic import safely (Vite will tree-shake if missing)
async function tryImport(path:string) {
  try { return await import(/* @vite-ignore */ path); }
  catch { return undefined; }
}

export async function loadSigilCatalog(apiBase:string): Promise<{items:SigilItem[], source:string, raw:any}> {
  // 1) API
  if (apiBase !== undefined) {
    try {
      const res = await fetch(`${apiBase}/sigil/catalog`, { headers: { Accept: 'application/json' }});
      if (res.ok) {
        const json = await res.json();
        const items = coerceItems(json);
        if (items.length) return { items, source: 'api:/sigil/catalog', raw: json };
      }
    } catch {}
  }

  // 2) Local candidates (common names you’ve used)
  const candidates = [
    '/src/data/sigilCatalog.json',
    '/src/games/sigilSyntaxItems.ts',
    '/src/games/sigilSyntaxItems.tsx',
    '/src/games/sigil/index.ts',
    '/src/data/sigilSyntaxItems.json',
    '/src/game thingss/sigil/catalog.json',      // your phrasing suggests this path
    '/src/game thingss/sigil/index.ts',          // fallback
  ];
  for (const p of candidates) {
    const mod = await tryImport(p);
    const raw = mod?.default ?? mod?.items ?? mod;
    const items = coerceItems(raw);
    if (items.length) return { items, source: `local:${p}`, raw };
  }

  return { items: [], source: 'none', raw: null };
}
