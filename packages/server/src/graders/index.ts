import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";

import nameBeat from "./nameBeat";
import missingBeat from "./missingBeat";
import orderBeats from "./orderBeats";
import highlightSignal from "./highlightSignal";
import fixChoice from "./fixChoice";
import whyReflect from "./whyReflect";
import rewriteGrader from "./rewriteGrader";

export default async function gradeAttempt(p: AttemptPayload): Promise<AttemptResult> {
  try {
    switch (p.mode) {
      case "name": return await nameBeat(p);
      case "missing": return await missingBeat(p);
      case "order": return await orderBeats(p);
      case "highlight": return await highlightSignal(p);
      case "fix": return await fixChoice(p);
      case "why": return await whyReflect(p);
      case "rewrite":
        return rewriteGrader
          ? await rewriteGrader(p)
          : { itemId: p.itemId, mode: p.mode, score: 0, rubric: [], details: { message: "rewrite grader not implemented" } };
      default:
        return {
          itemId: p.itemId,
          mode: p.mode,
          score: 0,
          rubric: [],
          details: { message: `unknown mode ${p.mode}` },
        };
    }
  } catch (err: any) {
    console.error('[GRADER][ERROR] mode=', p.mode, 'error=', err && (err.stack || err.message || err));
    return {
      itemId: p.itemId,
      mode: p.mode,
      score: 0,
      rubric: [],
      details: { message: `Grader error: ${String(err?.message || err)}` },
    };
  }
}
