import { Router } from "express";
import pickNext from "../scheduler/selector";
import { getAllItems } from "../content/items";

const router = Router();

router.get("/debug/content", async (req, res) => {
  try {
    const userIdRaw = req.query.userId;
    const userId = typeof userIdRaw === "string" && userIdRaw.trim() ? userIdRaw.trim() : "dev";

    let items: ReturnType<typeof getAllItems> = [];
    try {
      items = getAllItems();
    } catch {
      items = [];
    }

    const byMode = items.reduce<Record<string, number>>((acc, item) => {
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

    let nextItem: { id: string; mode?: string } | null = null;
    try {
      const candidate = await pickNext(userId);
      if (candidate) {
        nextItem = { id: candidate.id, mode: candidate.mode };
      }
    } catch {
      nextItem = null;
    }

    res.json({
      total: items.length,
      byMode,
      sample,
      nextItem,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router;
