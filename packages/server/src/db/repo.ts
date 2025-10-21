import type { AttemptPayload, AttemptResult } from "../types";

export async function saveAttempt(userId: string, payload: AttemptPayload, result: AttemptResult) {
  // TODO: insert into attempt
}

export async function updateMastery(userId: string, payload: AttemptPayload, result: AttemptResult) {
  // TODO: update mastery rows; return level-up info
  return { leveledUp: false, level: undefined, badges: [] as string[] };
}

export async function latestReport(userId: string) {
  // TODO: select last report for user
  return null as null | { createdAt: string; title: string; body: string };
}
