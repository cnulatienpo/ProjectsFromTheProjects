import type { AttemptPayload, AttemptResult } from "../types";

export async function saveAttempt(userId: string, payload: AttemptPayload, result: AttemptResult) {
  // TODO: write to attempts table (payload + result + timestamps)
}

export async function updateMastery(userId: string, payload: AttemptPayload, result: AttemptResult) {
  // TODO: increment skill exp based on item/skills; return new level/badges if changed
  return { leveledUp: false, level: undefined, badges: [] as string[] };
}

export async function latestReport(userId: string) {
  // TODO: pull last style report memo row
  return null as null | { createdAt: string; title: string; body: string };
}
