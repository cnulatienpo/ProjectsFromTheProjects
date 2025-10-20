import type { AttemptPayload, AttemptResult } from "../types";

export default async function fixChoice(payload: AttemptPayload): Promise<AttemptResult> {
  return {
    itemId: payload.itemId,
    mode: payload.mode,
    score: 0,
    rubric: [],
    details: { message: "fixChoice grader not implemented" },
  };
}
