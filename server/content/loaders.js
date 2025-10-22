import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ITEMS_DIR = path.join(__dirname, "items");
const TWEETRUNK_DIR = path.join(__dirname, "tweetrunk");
const PRACTICE_DIR = path.join(__dirname, "practice");

function normalizeItem(raw, idx) {
  const id = String(raw?.id ?? `item-${idx + 1}`);
  const mode = String(raw?.mode ?? "why");
  const prompt = String(raw?.prompt ?? "Write one sentence about cause → effect.");
  const meta = (() => {
    const metaFromField = raw && typeof raw.meta === "object" && raw.meta !== null ? { ...raw.meta } : {};
    if (raw && typeof raw === "object") {
      const extra = { ...raw };
      delete extra.id;
      delete extra.mode;
      delete extra.prompt;
      delete extra.meta;
      return { ...extra, ...metaFromField };
    }
    return metaFromField;
  })();
  return { id, mode, prompt, meta };
}

async function loadDir(dir) {
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
          data.forEach((raw, idx) => items.push(normalizeItem(raw, start + idx)));
        } else {
          items.push(normalizeItem(data, items.length));
        }
      } catch {
        // Ignore malformed files; keep server alive.
      }
    }
  } catch {
    // Directory may not exist; fall through to fallback items.
  }
  return items;
}

export async function loadTweetrunk() {
  return loadDir(TWEETRUNK_DIR);
}

export async function loadPractice() {
  return loadDir(PRACTICE_DIR);
}

export async function getCatalog() {
  const [core, tweets, practice] = await Promise.all([
    loadDir(ITEMS_DIR),
    loadTweetrunk(),
    loadPractice(),
  ]);

  let items = [...tweets, ...practice, ...core];
  if (items.length === 0) {
    items = [
      normalizeItem(
        {
          id: "sample-why-1",
          mode: "why",
          prompt: "In one line, explain why short→long sentence rhythm increases impact.",
          meta: { freshness: 1, level: 1, introduces_beats: false },
        },
        0,
      ),
    ];
  }
  return items;
}

export async function loadPracticePool() {
  return getCatalog();
}

export default getCatalog;
