// server/scheduler/next.js — safe baseline scheduler
// Uses getCatalog() and returns a deterministic first item.
// Exports BOTH named and default to match existing imports.
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

/**
 * pickNext(userId) -> { id, item }
 * Minimal version: pick the first valid item from the catalog.
 */
export async function pickNext(userId = "anon") {
  const catalog = await getCatalog();
  if (!Array.isArray(catalog) || catalog.length === 0) {
    return { id: null, item: null, userId };
  }
  const first = catalog.find(x => x && x.id) || catalog[0];
  const id = String(first.id ?? "unknown-0");
  return { id, item: first, userId };
}

// Keep default for legacy imports
export default pickNext;
