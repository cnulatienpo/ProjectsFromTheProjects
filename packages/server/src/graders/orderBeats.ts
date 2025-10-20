import type { AttemptPayload, AttemptResult } from "../types";

export default async function orderBeats(payload: AttemptPayload): Promise<AttemptResult> {
  return {
    itemId: payload.itemId,
    mode: payload.mode,
    score: 0,
    rubric: [],
    details: { message: "orderBeats grader not implemented" },
  };
}
