// ESM module. Produces a lightweight Professor Ray Ray memo so /api/attempt can mount.

// shape helpers (defensive defaults)
const safeStr = (v, d = "") => (typeof v === "string" && v.trim() ? v.trim() : d);
const pct = (n) => Number.isFinite(n) ? Math.round(n * 100) + "%" : "—";

/**
 * Build a short, human memo about the player's style.
 * @param {Object} opts
 * @param {string} opts.userId
 * @param {Array<Object>} opts.recentAttempts - array of { mode, score, details?, rubric? }
 * @param {number} [opts.level=1]
 * @param {string[]} [opts.badges=[]]
 * @returns {{ title:string, body:string, level:number, badges:string[] }}
 */
export async function buildMemo({ userId = "unknown", recentAttempts = [], level = 1, badges = [] } = {}) {
  const total = recentAttempts.length;
  const avg = total ? (recentAttempts.reduce((a, b) => a + (Number(b?.score) || 0), 0) / total) : 0;
  const topModes = (() => {
    const counts = new Map();
    for (const a of recentAttempts) counts.set(a.mode, (counts.get(a.mode) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m).filter(Boolean);
  })();

  const hits = new Map();  // rubric key -> #ok
  const seen = new Map();  // rubric key -> total
  for (const a of recentAttempts) {
    for (const r of Array.isArray(a?.rubric) ? a.rubric : []) {
      seen.set(r.key, (seen.get(r.key) || 0) + 1);
      if (r.ok) hits.set(r.key, (hits.get(r.key) || 0) + 1);
    }
  }
  const rubricLine = [...seen.keys()]
    .map(k => `${k}: ${hits.get(k) || 0}/${seen.get(k)} ok`)
    .join(" · ") || "No rubric yet";

  const vibe = [
    avg >= 0.85 ? "clean and decisive" :
    avg >= 0.7  ? "confident with room to sharpen edges" :
    avg >= 0.5  ? "finding the lane—keep pressing reps" :
                   "experimental—great time to tighten fundamentals"
  ];

  const title = `Professor Ray Ray: Style Readout for @${safeStr(userId, "player")}`;
  const lines = [
    `Level ${level}  ·  Avg score: ${pct(avg)}  ·  Recent items: ${total || 0}`,
    topModes.length ? `You’ve been jamming on: ${topModes.join(", ")}` : `We need more attempts to read your groove.`,
    `Rubric pulse → ${rubricLine}`,
    ``,
    `Judgment: Your current voice reads ${vibe[0]}. Keep stacking small, visible choices; let beats carry the scene.`,
    badges.length ? `Badges this level: ${badges.join(", ")}` : `Badges unlock as you hit streaks and clean rounds.`,
  ];

  return { title, body: lines.join("\n"), level, badges };
}

export default buildMemo;
