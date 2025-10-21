import { getAllItems } from "../content/items.js";
import { getLastAttempt } from "../db/repo.js";

export default async function pickNext(userId) {
    const pool = getAllItems();
    if (!pool.length) {
        throw new Error("No items available");
    }
    let candidates = pool;

    const lastSkip = (global.__skips && global.__skips.get(userId)) || null;
    if (lastSkip?.itemId) {
        const filtered = pool.filter((item) => item.id !== lastSkip.itemId);
        if (filtered.length) {
            candidates = filtered;
        }
    }

    if (candidates === pool) {
        const last = await getLastAttempt(userId);
        const lastDetails = last?.result?.details;
        const lastReason = typeof lastDetails?.reason === "string" ? lastDetails.reason : undefined;
        if (lastReason === "user_skip" && last?.itemId) {
            const filtered = pool.filter((item) => item.id !== last.itemId);
            if (filtered.length) {
                candidates = filtered;
            }
        }
    }

    if (!candidates.length) {
        candidates = pool;
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}
