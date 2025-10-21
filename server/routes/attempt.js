import { Router } from "express";
import gradeAttempt from "../graders/index.js";
import { saveAttempt, updateMastery, latestReport } from "../db/repo.js";
import { fetchItemById } from "../db/itemsRepo.js";

const router = Router();

// POST /api/attempt
router.post("/attempt", async (req, res) => {
    try {
        const payload = req.body;
        if (!payload?.userId || !payload?.itemId || !payload?.mode) {
            return res.status(400).json({ error: "Missing userId, itemId, or mode" });
        }

        const item = fetchItemById(payload.itemId);
        payload.gold = item?.gold || {};
        payload.options = item?.options || [];
        payload.goldBeats = item?.meta?.beat_tags || item?.gold?.order || [];
        payload.goldMissing = item?.gold?.missingBeat;

        const result = await gradeAttempt(payload);

        const { leveledUp, level, badges } = await updateMastery(payload.userId, payload, result);
        result.leveledUp = leveledUp;
        if (level != null) result.level = level;
        if (badges?.length) result.badges = badges;

        await saveAttempt(payload.userId, payload, result);

        if (leveledUp) {
            // TODO: await maybeBuildStyleReport(payload.userId, true);
        }

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Attempt failed", message: e?.message });
    }
});

// GET /api/reports/latest
router.get("/reports/latest", async (req, res) => {
    try {
        const userId = String(req.query.userId || req.headers["x-user-id"] || "anon");
        const rpt = await latestReport(userId);
        res.json(rpt ?? {});
    } catch (e) {
        res.status(500).json({ error: "Report lookup failed", message: e?.message });
    }
});

export default router;
