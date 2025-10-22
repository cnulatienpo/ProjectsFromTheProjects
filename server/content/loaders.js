// Returns the catalog from game things/games_catalog.json
export function getCatalog() {
  const catalogPath = path.resolve(
    process.cwd(),
    "game things",
    "games_catalog.json"
  );
  try {
    const raw = fs.readFileSync(catalogPath, "utf8");
    const json = JSON.parse(raw);
    // For compatibility with pickNext, return { items: [...] }
    if (Array.isArray(json.items)) return json;
    if (json.games && typeof json.games === "object") {
      return { items: Object.values(json.games), ...json };
    }
    return json;
  } catch (e) {
    return { items: [] };
  }
}
import fs from 'fs';
import path from 'path';

export function readTextMaybe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

export function readJsonl(p) {
  const text = readTextMaybe(p);
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line.replace(/,?$/, ''));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export function loadTweetrunk() {
  const roots = [
    path.resolve(process.cwd(), 'labeled data', 'tweetrunk_renumbered.jsonl'),
    path.resolve(process.cwd(), 'public', 'data', 'cut_games', 'tweetrunk_renumbered.jsonl'),
    path.resolve(process.cwd(), 'app', 'dist', 'data', 'cut_games', 'tweetrunk_renumbered.jsonl'),
  ];
  for (const candidate of roots) {
    const rows = readJsonl(candidate);
    if (rows.length) return rows;
  }
  return [];
}

export function loadPractice(kind = 'good') {
  const file = `practice_${kind}.jsonl`;
  const roots = [
    path.resolve(process.cwd(), 'app', 'dist', 'data', 'cut_games', file),
    path.resolve(process.cwd(), 'public', 'data', 'cut_games', file),
    path.resolve(process.cwd(), 'app', 'public', 'data', 'cut_games', file),
  ];
  for (const candidate of roots) {
    const rows = readJsonl(candidate);
    if (rows.length) return rows;
  }
  return [];
}

export async function loadPracticePool() {
  try {
    const mod = await import('./items.js');
    const getter = mod?.getAllItems || (mod?.default && mod.default.getAllItems);
    const items = typeof getter === 'function' ? getter() : [];
    if (Array.isArray(items) && items.length) {
      try {
        const mem = await import('../db/mem.js');
        if (typeof mem?.indexItems === 'function') {
          mem.indexItems(items);
        }
      } catch { }
    }
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}
