import type { AttemptPayload, AttemptResult } from "../types";

export default async function missingBeat(payload: AttemptPayload): Promise<AttemptResult> {
  return {
    itemId: payload.itemId,
    mode: payload.mode,
    score: 0,
    rubric: [],
    details: { message: "missingBeat grader not implemented" },
  };
}
