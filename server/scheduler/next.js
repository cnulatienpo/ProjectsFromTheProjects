// server/scheduler/next.js — guarantee a real id for /api/next
// Merges loaders (tweetrunk/practice/core), normalizes items, and returns the first valid one.

const __content = await import("../content/loaders.js");

// resolve catalog getters (support named/default)
const getCatalog =
  __content.getCatalog ??
  __content.loadCatalog ??
  (__content.default &&
    (typeof __content.default === "function"
      ? __content.default
      : __content.default.getCatalog));

const loadTweetrunk = __content.loadTweetrunk;
const loadPractice  = __content.loadPractice;

const ALLOWED = new Set(["name","missing","order","highlight","fix","why","sigil"]);

function coerceMode(m) {
  const s = (m ?? "").toString().toLowerCase();
  return ALLOWED.has(s) ? s : "why";
}

function firstString(...xs) {
  for (const v of xs) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function normalizeItem(raw, idx, source = "core") {
  // Try common id fields, else synthesize a stable id from source+index
  const id =
    firstString(raw?.id, raw?.uid, raw?.key, raw?._id, raw?.slug) ??
    `${source}-${idx + 1}`;
  // Map various content shapes to prompt text
  const prompt = firstString(
    raw?.prompt,
    raw?.text,
    raw?.passage,
    raw?.sentence,
    raw?.body,
    raw?.instruction,
    raw?.meta?.title
  ) ?? "Write one line explaining cause → effect.";
  // Find a mode-like field; default to why
  const mode = coerceMode(raw?.mode ?? raw?.task ?? raw?.type);

  const meta = {
    source,
    level: Number(raw?.level ?? 1),
    freshness: Number(raw?.freshness ?? 0),
    introduces_beats: !!(raw?.introduces_beats || raw?.meta?.introduces_beats),
    ...(raw?.meta && typeof raw.meta === "object" ? raw.meta : {})
  };

  return { id: String(id), mode, prompt, meta };
}

async function loadAllNormalized() {
  const out = [];

  // Core catalog: may be [] or {items:[]}
  try {
    if (typeof getCatalog === "function") {
      const got = await getCatalog();
      const arr = Array.isArray(got) ? got : (Array.isArray(got?.items) ? got.items : []);
      for (let i = 0; i < arr.length; i++) out.push(normalizeItem(arr[i], out.length, "core"));
    }
  } catch {}

  // Tweetrunk
  try {
    const tt = typeof loadTweetrunk === "function" ? await loadTweetrunk() : [];
    if (Array.isArray(tt)) {
      for (let i = 0; i < tt.length; i++) out.push(normalizeItem(tt[i], out.length, "tweetrunk"));
    }
  } catch {}

  // Practice (good/bad pools etc.)
  try {
    const pp = typeof loadPractice === "function" ? await loadPractice() : [];
    if (Array.isArray(pp)) {
      for (let i = 0; i < pp.length; i++) out.push(normalizeItem(pp[i], out.length, "practice"));
    }
  } catch {}

  // Fallback sample if still empty
  if (out.length === 0) {
    out.push(
      normalizeItem(
        {
          id: "why-boot-001",
          mode: "why",
          prompt: "Why does short→long sentence rhythm hit harder? One line.",
          meta: { freshness: 3, level: 1, introduces_beats: false }
        },
        0,
        "fallback"
      )
    );
  }
  return out;
}

/**
 * pickNext(userId) -> { id, item, userId }
 * Deterministic: pick the first valid item.
 */
export async function pickNext(userId = "anon") {
  const catalog = await loadAllNormalized();
  const first = catalog.find(x => x && x.id) || null;
  if (!first) {
    return { id: null, item: null, userId };
  }
  return { id: first.id, item: first, userId };
}

// Keep default export for legacy imports
export default pickNext;
