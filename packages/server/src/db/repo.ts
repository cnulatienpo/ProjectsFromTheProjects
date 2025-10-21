import type { AttemptMode, AttemptPayload, AttemptResult } from "../types";

type AttemptRecord = {
  userId: string;
  itemId: string;
  mode: AttemptMode;
  payload: AttemptPayload;
  result: AttemptResult;
  affectMastery: boolean;
  createdAt: Date;
};

const attempts = new Map<string, AttemptRecord[]>();

type SaveOptions = {
  affectMastery?: boolean;
};

export async function saveAttempt(
  userId: string,
  payload: AttemptPayload,
  result: AttemptResult,
  options: SaveOptions = {}
) {
  const record: AttemptRecord = {
    userId,
    itemId: payload.itemId,
    mode: payload.mode,
    payload,
    result,
    affectMastery: options.affectMastery !== false,
    createdAt: new Date(),
  };
  const list = attempts.get(userId);
  if (list) {
    list.push(record);
  } else {
    attempts.set(userId, [record]);
  }
}

export async function getLastAttempt(userId: string) {
  const list = attempts.get(userId);
  if (!list?.length) return null;
  return list[list.length - 1];
}

export async function updateMastery(userId: string, payload: AttemptPayload, result: AttemptResult) {
  // TODO: update mastery rows; return level-up info
  return { leveledUp: false, level: undefined, badges: [] as string[] };
}

export async function latestReport(userId: string) {
  // TODO: select last report for user
  return null as null | { createdAt: string; title: string; body: string };
}
