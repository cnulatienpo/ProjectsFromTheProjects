import nameBeat from "./nameBeat.js";
import missingBeat from "./missingBeat.js";
import orderBeats from "./orderBeats.js";
import highlightSignal from "./highlightSignal.js";
import fixChoice from "./fixChoice.js";
import whyReflect from "./whyReflect.js";
import rewriteGrader from "./rewriteGrader.js";

export default async function gradeAttempt(p) {
    switch (p.mode) {
        case "name": return nameBeat(p);
        case "missing": return missingBeat(p);
        case "order": return orderBeats(p);
        case "highlight": return highlightSignal(p);
        case "fix": return fixChoice(p);
        case "why": return whyReflect(p);
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
