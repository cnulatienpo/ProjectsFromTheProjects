import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";

export default async function missingBeat(p: AttemptPayload): Promise<AttemptResult> {
  const goldMissing = (p as any).goldMissing || (p as any).gold?.missingBeat;
  const expected = typeof goldMissing === "string" ? goldMissing : undefined;
  const providedRaw = (p.answer.sigils || [])[0];
  const provided = typeof providedRaw === "string" ? providedRaw : undefined;
  const ok = Boolean(
    provided &&
    expected &&
    provided.toLowerCase() === expected.toLowerCase(),
  );
  const score = ok ? 1 : 0;
  const rubric = ok ? ["Accuracy", "Clarity"] : ["Accuracy"];
  return {
    itemId: p.itemId,
    mode: p.mode,
    score,
    rubric,
    details: { expected, provided },
    next: ok || !expected ? undefined : `Try adding ${expected} where the energy stalls.`,
  };
}
