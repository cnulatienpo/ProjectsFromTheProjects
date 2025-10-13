// src/games/asset.ts
export function asset(gameId: string, rel: string) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/,"");
  const clean = rel.replace(/^\.\?\/*/,"");
  return `${base}/games/${gameId}/${clean}`;
}
export function publicUrl(rel: string) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/,"");
  const clean = rel.replace(/^\.\?\/*/,"");
  return `${base}/${clean}`;
}
