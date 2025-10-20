import { Router } from "express";
import type { AttemptPayload, AttemptResult } from "../types";
import gradeAttempt from "../graders";
import { saveAttempt, updateMastery, latestReport } from "../db/repo";
import { maybeBuildStyleReport } from "../styleReport";
import pickNext from "../scheduler/selector";

const router = Router();

// POST /api/attempt
router.post("/attempt", async (req, res) => {
  try {
    const payload = req.body as AttemptPayload;
    if (!payload?.userId || !payload?.itemId || !payload?.mode) {
      return res.status(400).json({ error: "Missing userId, itemId, or mode" });
    }

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

// GET /api/next
router.get("/next", async (req, res) => {
  try {
    const userId = String(req.query.userId || req.headers["x-user-id"] || "anon");
    const item = await pickNext(userId);
    res.json(item);
  } catch (e: any) {
    res.status(500).json({ error: "Next failed", message: e?.message });
  }
});

// GET /api/reports/latest
router.get("/reports/latest", async (req, res) => {
  try {
    const userId = String(req.query.userId || req.headers["x-user-id"] || "anon");
    const rpt = await latestReport(userId);
    res.json(rpt || {});
  } catch (e: any) {
    res.status(500).json({ error: "Report lookup failed", message: e?.message });
  }
});

export default router;
