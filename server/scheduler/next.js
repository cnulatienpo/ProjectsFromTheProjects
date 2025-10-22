const __content = await import("../content/loaders.js");
const getCatalog =
  __content.getCatalog ??
  __content.loadCatalog ??
  (__content.default &&
    (typeof __content.default === "function"
      ? __content.default
      : __content.default.getCatalog));
const loadTweetrunk = __content.loadTweetrunk;
const loadPractice = __content.loadPractice;

export async function pickNext(userId = "anon") {
  let catalog = [];
  try {
    if (typeof getCatalog === "function") {
      catalog = await getCatalog();
    }
    const fromTweets = typeof loadTweetrunk === "function" ? await loadTweetrunk() : [];
    const fromPractice = typeof loadPractice === "function" ? await loadPractice() : [];
    if (fromTweets.length || fromPractice.length) {
      catalog = [...fromTweets, ...fromPractice, ...catalog];
    }
  } catch {}

  if (!Array.isArray(catalog) || catalog.length === 0) {
    return { id: null, item: null, userId };
  }

  const first = catalog.find((x) => x && x.id) || catalog[0];
  const id = String(first?.id ?? "unknown-0");
  return { id, item: first, userId };
}

export async function pickNextItem(userId = "anon", pool = []) {
  if (Array.isArray(pool) && pool.length) {
    const candidate = pool.find((x) => x && x.id) || pool[0];
    if (candidate) {
      return candidate;
    }
  }
  const result = await pickNext(userId);
  return result.item;
}

pickNext.pickNextItem = pickNextItem;

export default pickNext;
