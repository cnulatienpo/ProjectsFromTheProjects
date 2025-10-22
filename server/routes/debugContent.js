import { Router } from "express";
import { pickNext } from "../scheduler/next.js";
import { getAllItems } from "../content/items.js";
import { mem, getMastery } from "../db/mem.js";

const router = Router();

router.get("/api/debug/content", async (req, res) => {
  try {
    const userIdRaw = req.query.userId;
    const userId = typeof userIdRaw === "string" && userIdRaw.trim() ? userIdRaw.trim() : "dev";

    let items = [];
    try {
      items = getAllItems();
    } catch {
      items = [];
    }

    const byMode = items.reduce((acc, item) => {
      const mode = item?.mode || "unknown";
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});

    const sample = items.length
      ? {
          id: items[0]?.id ?? null,
          mode: items[0]?.mode ?? null,
          meta: items[0]?.meta ?? {},
        }
      : null;

    let nextItem = null;
    try {
      const candidate = pickNext({ userId });
      if (candidate) {
        nextItem = { id: candidate.id, mode: candidate.mode };
      }
    } catch {
      nextItem = null;
    }

    const mastery = getMastery(userId);

    res.json({
      totalItems: items.length,
      modes: byMode,
      sample,
      nextItem,
      attempts: mem.attempts.length,
      skips: mem.skips.length,
      mastery: Object.keys(mastery).length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router;
