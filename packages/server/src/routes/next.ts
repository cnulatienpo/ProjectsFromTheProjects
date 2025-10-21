import { Router } from "express";
import pickNext from "../scheduler/selector";

const router = Router();

router.get("/next", async (req, res) => {
  try {
    const userId = String(req.query.userId || req.headers["x-user-id"] || "anon");
    const item = await pickNext(userId);
    res.json(item);
  } catch (e: any) {
    res.status(500).json({ error: "Next failed", message: e?.message });
  }
});

export default router;
