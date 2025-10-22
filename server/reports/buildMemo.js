import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "server", "db", "data");
const ATTEMPTS_PATH = path.join(DATA_DIR, "attempts.jsonl");

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  return lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function fromMem(userId, limit=40) {
  try {
    const mem = require("../db/mem.js"); // commonjs-safe path if present
    const rows = Array.isArray(mem?.attempts?.rows) ? mem.attempts.rows : [];
    return (userId ? rows.filter(r => r.userId === userId) : rows).slice(-limit);
  } catch {
    return null;
  }
}

function tidy(n) { return Number.isFinite(n) ? n : 0; }

export async function buildMemo(userId="dev", limit=40) {
  // attempts: prefer in-memory snapshot if available, else JSONL
  const memRows = fromMem(userId, limit);
  const rows = memRows ?? (userId
    ? readJsonl(ATTEMPTS_PATH).filter(r => r.userId === userId).slice(-limit)
    : readJsonl(ATTEMPTS_PATH).slice(-limit));

  const n = rows.length;
  if (!n) {
    return {
      title: "Professor Ray Ray: No pages yet",
      body: "I can’t judge what you didn’t submit. Give me something with edges and I’ll bring the receipts.",
      badges: []
    };
  }

  // simple aggregates
  const scores = rows.map(r => tidy(r?.score));
  const avgScore = scores.reduce((a,b)=>a+b,0) / n;
  const wc = rows.map(r => tidy(r?.details?.wordCount));
  const avgWords = wc.reduce((a,b)=>a+b,0) / (wc.length || 1);

  // collect “hits” / skills / tags for flavor
  const hitBag = new Map();
  const taste = new Map();
  for (const r of rows) {
    const hits = Array.isArray(r?.details?.hits) ? r.details.hits : [];
    for (const h of hits) hitBag.set(h, (hitBag.get(h)||0)+1);
    const skills = Array.isArray(r?.details?.skillIds) ? r.details.skillIds : [];
    for (const s of skills) taste.set(s, (taste.get(s)||0)+1);
  }
  const topHits = [...hitBag.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k);
  const topSkills = [...taste.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k);

  // light “influences” guess from skills/tags
  const influences = [];
  const skillStr = topSkills.join(" ").toLowerCase();
  if (skillStr.includes("dialogue")) influences.push("Didion (clean control)");
  if (skillStr.includes("conflict")) influences.push("Chandler (pressure & tilt)");
  if (skillStr.includes("reveal") || skillStr.includes("payoff")) influences.push("Morrison (earned turn)");
  if (!influences.length) influences.push("Baldwin (clarity + heat)");

  const verdict =
    avgScore >= 0.8 ? "You’re landing beats with intention." :
    avgScore >= 0.6 ? "You have a feel — shape the turns cleaner." :
    "You’ve got sparks. Aim them.";

  const body =
`Professor Ray Ray on your pages (last ${n} tries)

Overall: ${verdict}
Average score: ${(avgScore*100).toFixed(0)}%
Typical length: ~${Math.round(avgWords)} words

Most consistent signals: ${topHits.join(", ") || "—"}
Skill lean: ${topSkills.join(", ") || "—"}
Influences I clock: ${influences.join("; ")}

Next drills:
• Tighten the line right before the turn (cut a hedge, punch the verb).
• Name the beat you’re aiming at, then let *action* (not labels) carry it.
• If you reveal, follow it with a consequence we can see/hear.`.trim();

  const badges = [];
  if (avgScore >= 0.7) badges.push("Beat Finder");
  if (topHits.includes("clarity")) badges.push("Clean Glass");
  if (topHits.includes("voice")) badges.push("Voice Prints");

  return { title: "Professor Ray Ray — Style Report", body, badges };
}

export default buildMemo;
