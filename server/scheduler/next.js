// Robust ESM import that tolerates different export shapes from content/loaders.js
const __content = await import("../content/loaders.js");
const getCatalog =
  __content.getCatalog ??
  __content.loadCatalog ??
  (__content.default &&
    (typeof __content.default === "function"
      ? __content.default
      : __content.default.getCatalog));
if (typeof getCatalog !== "function") {
  throw new Error("Expected getCatalog() from ../content/loaders.js (named, loadCatalog, or default).");
}
import { attempts, skips } from "../db/mem.js";

// very simple weights: skip recent item, prefer ones not skipped, and basic freshness by last attempt ts
export function pickNext(userId = "dev") {
  const cat = getCatalog();                      // { items: [...], byMode: {...} } from loaders.js
  const items = Array.isArray(cat?.items) ? cat.items : [];
  if (!items.length) return null;

  // last N attempts for user
  const userAttempts = attempts.rows.filter(a => a.userId === userId);
  const lastByItem = new Map();
  for (const a of userAttempts) lastByItem.set(String(a.itemId), a.ts || 0);

  // skip set for user
  const skipped = new Set(skips.rows.filter(s => s.userId === userId).map(s => String(s.itemId)));

  // score items: lower is better
  const scored = items.map((it, idx) => {
    const id = String(it.id ?? it.new_id ?? it.original_id ?? idx);
    const lastTs = lastByItem.get(id) || 0;
    const freshness = lastTs ? (Date.now() - lastTs) / 60000 : 999999; // minutes since last seen
    const penalty = skipped.has(id) ? 1e9 : 0; // hard avoid immediately
    // Simple heuristic: prefer long-unseen
    const score = penalty + (lastTs ? 1000000 - freshness : 0); // unseen rise to top (smaller is better)
    return { it: { id, mode: it.mode || it.type || "why", ...it }, score };
  });

  scored.sort((a,b) => a.score - b.score);
  const pick = scored.find(s => !skipped.has(String(s.it.id))) || scored[0];
  return pick?.it || null;
}

export default { pickNext };
