import { Router } from "express";
import type { AttemptPayload, AttemptResult } from "../types";
import gradeAttempt from "../graders";
import { saveAttempt, updateMastery, latestReport } from "../db/repo";
import { maybeBuildStyleReport } from "../styleReport";
import { fetchItemById } from "../db/itemsRepo";

const router = Router();

// POST /api/attempt
router.post("/attempt", async (req, res) => {
  try {
    const payload = req.body as AttemptPayload;
    if (!payload?.userId || !payload?.itemId || !payload?.mode) {
      return res.status(400).json({ error: "Missing userId, itemId, or mode" });
    }

    const item = fetchItemById(payload.itemId);
    // Debug: ensure gold fields are arrays when expected
    console.log('[ATTEMPT DEBUG] item gold:', item?.gold);
    console.log('[ATTEMPT DEBUG] item meta:', item?.meta);
    (payload as any).gold = item?.gold || {};
    (payload as any).options = item?.options || [];
    (payload as any).goldBeats = (item?.meta as any)?.beat_tags || item?.gold?.order || [];
    (payload as any).goldMissing = (item?.gold as any)?.missingBeat;

    const result: AttemptResult = await gradeAttempt(payload);

    const { leveledUp, level, badges } = await updateMastery(payload.userId, payload, result);
    result.leveledUp = leveledUp;
    if (level != null) result.level = level;
    if (badges?.length) result.badges = badges;

    await saveAttempt(payload.userId, payload, result);

    if (leveledUp) {
      await maybeBuildStyleReport(payload.userId, true);
    }

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: "Attempt failed", message: e?.message });
  }
});

// GET /api/reports/latest
router.get("/reports/latest", async (req, res) => {
  try {
    const userId = String(req.query.userId || req.headers["x-user-id"] || "anon");
    const rpt = await latestReport(userId);
    res.json(rpt ?? {});
  } catch (e: any) {
    res.status(500).json({ error: "Report lookup failed", message: e?.message });
  }
});

export default router;
