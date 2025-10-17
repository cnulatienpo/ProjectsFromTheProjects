// src/lib/loadSigil.ts
export type SigilItem = { id: string; title: string; level?: number; type?: string };

const normalize = (input: any): SigilItem[] => {
  const arr = Array.isArray(input) ? input : (input?.items ?? []);
  if (!Array.isArray(arr)) return [];
  return arr.filter(Boolean).map((it: any, i: number) => ({
    id: String(it?.id ?? it?.slug ?? it?.key ?? `item-${i}`),
    title: String(it?.title ?? it?.name ?? it?.label ?? 'Untitled'),
    level: Number.isFinite(Number(it?.level)) ? Number(it.level) : undefined,
    type: typeof it?.type === 'string' ? it.type : undefined,
  }));
};

export async function loadSigilCatalog(apiBase: string) {
  // 1) API first
  try {
    const r = await fetch(`${apiBase}/sigil/catalog`, { headers: { Accept: 'application/json' }});
    if (r.ok) {
      const json = await r.json();
      const items = normalize(json);
      if (items.length) return { items, source: 'api:/sigil/catalog' };
    }
  } catch {}

  // 2) public/ fallback (fetchable file)
  try {
    const base = import.meta.env.BASE_URL || '/';
    const r = await fetch(`${base}sigilCatalog.json`, { headers: { Accept: 'application/json' }});
    if (r.ok) {
      const json = await r.json();
      const items = normalize(json);
      if (items.length) return { items, source: 'public:/sigilCatalog.json' };
    }
  } catch {}

  // 3) src/ fallbacks (import, not fetch)
  const candidates = import.meta.glob([
    '/src/data/**/*sigil*.*',
    '/src/games/**/*sigil*.*',
    '/src/**/*sigilCatalog*.*'
  ], { eager: true });

  for (const [path, mod] of Object.entries(candidates)) {
    const raw = (mod as any)?.default ?? (mod as any)?.items ?? mod;
    const items = normalize(raw);
    if (items.length) return { items, source: `src-import:${path}` };
  }

  // last resort
  return { items: [], source: 'none' };
}
