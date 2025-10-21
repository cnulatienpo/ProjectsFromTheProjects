import type { AttemptResult } from "../types";

export function toUIMessage(r: AttemptResult) {
  const lines: string[] = [];
  if (typeof r.score === "number") lines.push(`Score: ${Math.round(r.score * 100)}%`);
  if (r.rubric?.length) lines.push(`Rubric: ${r.rubric.join(", ")}`);
  if (r.details && (r.details as any).message) lines.push(String((r.details as any).message));
  return lines.join("\n");
}
