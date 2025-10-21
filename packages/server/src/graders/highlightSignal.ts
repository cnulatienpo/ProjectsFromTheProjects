import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";

type Span = { start: number; end: number; label?: string };

function iou(a: Span, b: Span) {
  const inter = Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
  const union = Math.max(a.end, a.start) - Math.min(b.start, a.start) + Math.max(0, b.end - b.start);
  return union ? inter / union : 0;
}

export default async function highlightSignal(p: AttemptPayload): Promise<AttemptResult> {
  const gold = ((p as any).gold?.spans || []) as Span[];
  const user = (p.answer.spans || []) as Span[];
  let best = 0;
  for (const g of gold) {
    for (const u of user) {
      best = Math.max(best, iou(g, u));
    }
  }
  const score = Number(best.toFixed(2));
  const rubric = score >= 0.66 ? ["Accuracy", "Clarity"] : ["Accuracy"];
  return {
    itemId: p.itemId,
    mode: p.mode,
    score,
    rubric,
    spans: gold,
    details: { userSpans: user, bestOverlap: score },
    next: score < 0.66 ? "Tighten the selection to only the signal words." : undefined,
  };
}
