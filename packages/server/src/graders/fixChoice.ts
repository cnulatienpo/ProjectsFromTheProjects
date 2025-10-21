import type { AttemptPayload, AttemptResult } from "@shared/gameTypes";

function lintLine(s: string) {
  const issues: string[] = [];
  if (/\b(very|really|just|kind of|sort of)\b/i.test(s)) issues.push("hedge");
  if (/\b(is|are|was|were|be|been|being)\b\s+\b(adverb|very|really)\b/i.test(s)) issues.push("weak verb + adverb");
  if (/[?!]{2,}/.test(s)) issues.push("punctuation shout");
  return issues;
}

export default async function fixChoice(p: AttemptPayload): Promise<AttemptResult> {
  const choiceId = p.answer.choiceId;
  const gold = (p as any).gold?.choiceId;
  const ok = Boolean(choiceId && gold && choiceId === gold);
  const score = ok ? 1 : 0;
  const rubric = ok ? ["Accuracy", "Clarity", "Professionalism", "Voice"] : ["Accuracy", "Clarity"];
  const chosenText = ((p as any).options || []).find((o: any) => o.id === choiceId)?.text || "";
  const issues = chosenText ? lintLine(chosenText) : [];
  return {
    itemId: p.itemId,
    mode: p.mode,
    score,
    rubric,
    fixSuggestion: ok ? undefined : "Pick the version with fewer hedges and no comma splice.",
    details: { choiceId, expected: gold, issues },
    next: ok ? undefined : "Scan for needless words; prefer precise verbs over adverbs.",
  };
}
