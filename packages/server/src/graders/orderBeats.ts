import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";

function kendallTau(expected: string[], got: string[]) {
  const pos = new Map<string, number>();
  expected.forEach((k, i) => pos.set(k, i));
  let discordant = 0;
  let total = 0;
  for (let i = 0; i < got.length; i += 1) {
    for (let j = i + 1; j < got.length; j += 1) {
      const a = got[i];
      const b = got[j];
      const posA = pos.get(a);
      const posB = pos.get(b);
      if (posA == null || posB == null) continue;
      total += 1;
      if (posA > posB) discordant += 1;
    }
  }
  if (total === 0) return 0;
  return 1 - discordant / total;
}

export default async function orderBeats(p: AttemptPayload): Promise<AttemptResult> {
  const gold = ((p as any).gold?.order || []) as string[];
  const got = (p.answer.order || []).map(s => s.toLowerCase());
  const score = gold.length && got.length ? Math.max(0, kendallTau(gold, got)) : 0;
  const rubric = score >= 0.8 ? ["Accuracy", "Clarity", "Consistency"] : ["Accuracy", "Clarity"];
  return {
    itemId: p.itemId,
    mode: p.mode,
    score,
    rubric,
    correctOrder: gold,
    details: { provided: got },
    next: score < 0.8 ? "Check if Setup precedes Payoff and Decision follows Obstacle." : undefined,
  };
}
