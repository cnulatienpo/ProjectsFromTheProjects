// server/foundations.loader.js
// Optional/legacy foundations loader — safe no-op so imports won't crash.
export function loadFoundations() {
  console.warn('[opt] foundations loader called — returning empty data (tweetrunk is source of truth).')
  return { lessons: [], skillMap: {} }
}
