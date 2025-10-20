import type { AttemptPayload, AttemptResult } from "../types";

export default async function nameBeat(payload: AttemptPayload): Promise<AttemptResult> {
  return {
    itemId: payload.itemId,
    mode: payload.mode,
    score: 0,
    rubric: [],
    details: { message: "nameBeat grader not implemented" },
  };
}
