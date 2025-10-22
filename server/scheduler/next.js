// server/scheduler/next.js — normalize inputs for grader-legal modes
const __content = await import("../content/loaders.js");
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
  if (!m) return "why";
  const s = String(m).toLowerCase();
  return ALLOWED.has(s) ? s : "why";
}

function firstString(...candidates) {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function normalizeItem(raw, idx, source="core") {
  const id =
    firstString(raw?.id, raw?.uid, raw?.key) ??
    `item-${source}-${idx + 1}`;
  const mode = coerceMode(raw?.mode ?? raw?.task ?? raw?.type);
  const prompt = firstString(
    raw?.prompt,
    raw?.text,
    raw?.sentence,
    raw?.body,
    raw?.instruction
  ) ?? "Write one line explaining cause → effect.";
  const meta = {
    source,
    level: Number(raw?.level ?? 1),
    freshness: Number(raw?.freshness ?? 0),
    introduces_beats: !!raw?.introduces_beats,
    ...(raw?.meta ?? {})
  };
  return { id: String(id), mode, prompt, meta };
}

async function loadAll() {
  let core = [];
  try {
    const got = await getCatalog();
    const arr = Array.isArray(got) ? got : Array.isArray(got?.items) ? got.items : [];
    core = arr.map((r, i) => normalizeItem(r, i, "core"));
  } catch {}

  let tweets = [];
  try {
    const tt = typeof loadTweetrunk === "function" ? await loadTweetrunk() : [];
    tweets = (Array.isArray(tt) ? tt : []).map((r, i) => normalizeItem(r, i, "tweetrunk"));
  } catch {}

  let practice = [];
  try {
    const pp = typeof loadPractice === "function" ? await loadPractice() : [];
    practice = (Array.isArray(pp) ? pp : []).map((r, i) => normalizeItem(r, i, "practice"));
  } catch {}

  return [...tweets, ...practice, ...core];
}

/**
 * pickNext(userId) -> { id, item, userId }
 * Minimal deterministic picker (first available).
 */
export async function pickNext(userId = "anon") {
  const catalog = await loadAll();
  if (!Array.isArray(catalog) || catalog.length === 0) {
    return {
      id: "sample-why-1",
      item: normalizeItem({ id: "sample-why-1", mode: "why", prompt: "Why does short→long rhythm hit harder?" }, 0, "fallback"),
      userId
    };
  }
  const first = catalog.find(x => x && x.id) || catalog[0];
  return { id: first.id, item: first, userId };
}

export default pickNext;
