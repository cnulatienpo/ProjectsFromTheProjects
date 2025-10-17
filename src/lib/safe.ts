// src/lib/safe.ts
export type Any = any;

export function asArray(x: Any): Any[] {
  if (Array.isArray(x)) return x;
  if (x && Array.isArray(x.items)) return x.items;
  return [];
}

export function safeItems(x: Any): Any[] {
  return asArray(x).filter(Boolean);
}

export function getId(x: Any, i: number): string {
  const v = x?.id ?? x?.key ?? x?.slug ?? x?.name ?? x?.title;
  return String(v ?? `item-${i}`);
}

export function getTitle(x: Any): string {
  const v = x?.title ?? x?.name ?? x?.label ?? x?.heading;
  return String(v ?? 'Untitled');
}

export function getType(x: Any): string {
  return String(x?.type ?? 'lesson');
}

export function getLevel(x: Any): number {
  const n = Number(x?.level);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
