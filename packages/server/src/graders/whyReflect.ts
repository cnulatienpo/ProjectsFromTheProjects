import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";

const CANON = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, "").trim();
const TAGS = ["accuracy", "clarity", "voice", "consistency", "professionalism"];

export default async function whyReflect(p: AttemptPayload): Promise<AttemptResult> {
  const rawGold = (p as any).gold?.rationaleTags ?? [];
  const goldArr = Array.isArray(rawGold) ? rawGold : String(rawGold).split(/[,;\|]+/).map(s => s.trim()).filter(Boolean);
  const gold = goldArr.map(CANON);
  const text = p.answer.rationale || "";
  const hits = new Set<string>();
  for (const t of TAGS) {
    if (new RegExp(`\\b${t}\\b`, "i").test(text)) hits.add(t);
  }
  let hitCount = 0;
  for (const g of gold) {
    if (hits.has(g)) hitCount += 1;
  }
  const score = gold.length ? hitCount / gold.length : hits.size ? 0.5 : 0;
  const rubric = score >= 0.67 ? ["Professionalism", "Clarity"] : ["Professionalism"];
  return {
    itemId: p.itemId,
    mode: p.mode,
    score,
    rubric,
    details: { expected: gold, found: Array.from(hits) },
    next:
      score < 1
        ? "Name the reason using rubric words: Accuracy, Clarity, Voice, Consistency, Professionalism."
        : undefined,
  };
}
