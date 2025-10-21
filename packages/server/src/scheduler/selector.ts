import { getAllItems } from "../content/items";
import { getLastAttempt } from "../db/repo";

export default async function pickNext(userId: string) {
  const pool = getAllItems();
  if (!pool.length) {
    throw new Error("No items available");
  }
  const last = await getLastAttempt(userId);
  const lastDetails = last?.result?.details as { reason?: unknown } | undefined;
  const lastReason = typeof lastDetails?.reason === "string" ? lastDetails.reason : undefined;
  const filtered = lastReason === "user_skip"
    ? pool.filter((item) => item.id !== last?.itemId)
    : pool;
  const candidates = filtered.length ? filtered : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
