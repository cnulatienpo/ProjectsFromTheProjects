import express, { Router } from "express";
import { saveAttempt } from "../db/repo.js";

const router = Router();

/**
 * POST /api/skip
 * body: { userId, itemId, mode, reason? }
 * Logs a skip; does NOT change mastery. Returns { ok: true }.
 */
router.post("/skip", express.json(), async (req, res) => {
    const { userId, itemId, mode, reason } = req.body || {};
    if (!userId || !itemId) {
        return res.status(400).json({ error: "missing userId or itemId" });
    }

    const skipReason = reason || "user_skip";
    const userKey = String(userId);
    const itemKey = String(itemId);
    const modeValue = mode ?? null;

    global.__skips = global.__skips || new Map();
    global.__skips.set(userKey, { itemId: itemKey, mode: modeValue, reason: skipReason, ts: Date.now() });

    console.log("[SKIP]", { userId: userKey, itemId: itemKey, mode: modeValue, reason: skipReason });

    try {
        await saveAttempt(
            userKey,
            {
                userId: userKey,
                itemId: itemKey,
                mode: modeValue,
                answer: {},
            },
            {
                itemId: itemKey,
                mode: modeValue,
                score: 0,
                rubric: [],
                details: { reason: skipReason },
            },
            { affectMastery: false }
        );
    } catch (err) {
        console.warn("[SKIP] failed to record attempt", err);
        return res.status(500).json({ error: "skip_record_failed", message: err?.message });
    }

    return res.json({ ok: true });
});

export default router;
