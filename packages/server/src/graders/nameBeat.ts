import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";
import { BEATS } from "@shared/beatPalette";
import { BEAT_SYNONYMS } from "./aliases";

const CANON = new Set(BEATS.map(b => b.key));

function canon(s?: string) {
  return s?.toLowerCase().replace(/[_-]/g, " ").trim();
}

function expand(userKeys: string[]): Set<string> {
  const out = new Set<string>();
  for (const k of userKeys) {
    const ck = canon(k);
    if (!ck) continue;
    out.add(ck);
    const syns = BEAT_SYNONYMS[ck] || [];
    for (const s of syns) {
      const cs = canon(s);
      if (cs) out.add(cs);
    }
  }
  return out;
}

export default async function nameBeat(p: AttemptPayload): Promise<AttemptResult> {
  const gold = (p as any).goldBeats || [];
  const expected = new Set(
    (gold as string[])
      .map(canon)
      .filter((key): key is string => Boolean(key) && CANON.has(key as any)),
  );

  const user = expand(p.answer.sigils || []);
  let hit = 0;
  for (const e of expected) {
    if (user.has(e)) hit += 1;
  }
  const score = expected.size ? hit / expected.size : 0;
  const rubric = score >= 0.67 ? ["Accuracy", "Clarity"] : ["Accuracy"];
  return {
    itemId: p.itemId,
    mode: p.mode,
    score,
    rubric,
    details: { expected: Array.from(expected), provided: Array.from(user) },
    next: score < 1 ? "Try pairing Red (move) with Blue (clarify)." : undefined,
  };
}
