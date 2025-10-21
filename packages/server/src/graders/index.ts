import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";

import nameBeat from "./nameBeat";
import missingBeat from "./missingBeat";
import orderBeats from "./orderBeats";
import highlightSignal from "./highlightSignal";
import fixChoice from "./fixChoice";
import whyReflect from "./whyReflect";
import rewriteGrader from "./rewriteGrader";

export default async function gradeAttempt(p: AttemptPayload): Promise<AttemptResult> {
  switch (p.mode) {
    case "name":      return nameBeat(p);
    case "missing":   return missingBeat(p);
    case "order":     return orderBeats(p);
    case "highlight": return highlightSignal(p);
    case "fix":       return fixChoice(p);
    case "why":       return whyReflect(p);
    case "rewrite":
      return rewriteGrader
        ? rewriteGrader(p)
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
}
