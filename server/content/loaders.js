import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ITEMS_DIR = path.join(__dirname, "items");
const TWEETRUNK_DIR = path.join(__dirname, "tweetrunk");
const PRACTICE_DIR = path.join(__dirname, "practice");

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (entry == null ? "" : String(entry)))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

const __ALLOWED_MODES = new Set(["name", "missing", "order", "highlight", "fix", "why", "sigil"]);
function __coerceMode(m) {
  const s = (m ?? "").toString().toLowerCase();
  return __ALLOWED_MODES.has(s) ? s : "why";
}
function __firstString(...xs) {
  for (const v of xs) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export function validateAndNormalizeItem(raw, idx = 0, source = "core") {
  if (!raw || typeof raw !== "object") {
    console.warn("[schema] non-object item @", source, idx);
    return null;
  }
  const id = __firstString(raw.id, raw.uid, raw.key, raw._id, raw.slug) ?? `${source}-${idx + 1}`;
  const text = __firstString(
    raw.prompt,
    raw.passage,
    raw.text,
    raw.body,
    raw.sentence,
    raw.instruction,
    raw?.meta?.title,
  );
  if (!text) {
    console.warn("[schema] missing text/prompt @", id, source);
    return null;
  }
  const rawModeValue = raw.mode ?? raw.task ?? raw.type;
  const mode = __coerceMode(rawModeValue);
  if (rawModeValue != null) {
    const rawModeString = String(rawModeValue).trim().toLowerCase();
    if (rawModeString && !__ALLOWED_MODES.has(rawModeString)) {
      console.warn("[schema] invalid mode @", id, source, rawModeValue);
      return null;
    }
  }
  const metaBase = raw && typeof raw.meta === "object" && raw.meta !== null ? { ...raw.meta } : {};
  const meta = { source, ...metaBase };
  const ibSources = [raw.introduces_beats, raw.introducesBeats, meta.introduces_beats, meta.introducesBeats];
  const introduces_beats = dedupe(
    ibSources
      .flatMap((value) => toStringArray(value))
      .map((beat) => beat.trim())
      .filter(Boolean),
  );
  meta.introduces_beats = introduces_beats;
  delete meta.introducesBeats;

  const base = { ...raw };
  base.id = String(id);
  base.mode = mode;
  base.prompt = text;
  if (!base.text) base.text = text;
  if (!base.passage) base.passage = text;
  base.meta = meta;
  base.introduces_beats = introduces_beats;
  if (Array.isArray(base.correctSequence)) {
    base.correctSequence = base.correctSequence.map((entry) => String(entry));
  }
  return base;
}

async function loadDir(dir, source = "core") {
  let items = [];
  try {
    const files = await readdir(dir, { withFileTypes: true });
    const jsonFiles = files
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(dir, entry.name));
    for (const filePath of jsonFiles) {
      try {
        const txt = await readFile(filePath, "utf8");
        const data = JSON.parse(txt);
        if (Array.isArray(data)) {
          const start = items.length;
          data.forEach((raw, idx) => {
            const normalized = validateAndNormalizeItem(raw, start + idx, source);
            if (normalized) items.push(normalized);
          });
        } else {
          const normalized = validateAndNormalizeItem(data, items.length, source);
          if (normalized) items.push(normalized);
        }
      } catch {
        // Ignore malformed files; keep server alive.
      }
    }
  } catch {
    // Directory may not exist; fall through to fallback items.
  }
  return items.filter(Boolean);
}

export async function loadTweetrunk() {
  return loadDir(TWEETRUNK_DIR, "tweetrunk");
}

export async function loadPractice() {
  return loadDir(PRACTICE_DIR, "practice");
}

export async function getCatalog() {
  const [core, tweets, practice] = await Promise.all([
    loadDir(ITEMS_DIR),
    loadTweetrunk(),
    loadPractice(),
  ]);

  let items = [...tweets, ...practice, ...core].filter(Boolean);
  if (items.length === 0) {
    const fallback = validateAndNormalizeItem(
      {
        id: "sample-why-1",
        mode: "why",
        prompt: "In one line, explain why short→long sentence rhythm increases impact.",
        meta: { freshness: 1, level: 1, introduces_beats: [] },
      },
      0,
      "core",
    );
    items = fallback ? [fallback] : [];
  }
  return items;
}

export async function loadPracticePool() {
  return getCatalog();
}

export async function loadIntroducesBeats() {
  const catalog = await getCatalog();
  const map = {};
  for (const item of catalog) {
    const beats = Array.isArray(item?.introduces_beats)
      ? item.introduces_beats.filter((beat) => typeof beat === "string" && beat.trim())
      : [];
    if (beats.length) {
      map[item.id] = beats.map((beat) => beat.trim());
    }
  }
  return map;
}

export default getCatalog;
