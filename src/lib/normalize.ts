// src/lib/normalize.ts
export type CatalogItem = {
  id: string;
  title: string;
  level?: number;
  type?: string; // 'lesson' | 'drill' | etc.
};

// Accepts anything and returns a safe array of CatalogItem with defaults.
export function toCatalogItems(input: any): CatalogItem[] {
  const arr = Array.isArray(input) ? input : input?.items ?? [];
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(Boolean)
    .map((it: any, idx: number): CatalogItem => ({
      id: String(it?.id ?? `item-${idx}`),
      title: String(it?.title ?? "Untitled"),
      level: typeof it?.level === "number" ? it.level : undefined,
      type: typeof it?.type === "string" ? it.type : undefined,
    }));
}
