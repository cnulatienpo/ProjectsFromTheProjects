import express from "express";
import { buildMemo } from "../reports/buildMemo.js";

const router = express.Router();

router.get("/api/reports/ping", (_req, res) => {
  res.json({ ok: true, ping: "reports-alive" });
});

router.get("/api/reports/latest", async (req, res) => {
  try {
    const userId = String(req.query.userId || req.headers["x-user-id"] || "dev");
    const memo = await buildMemo(userId, 40);
    res.json({ ok: true, userId, memo });
  } catch (e) {
    res.status(500).json({ ok: false, error: "memo_failed", message: e?.message || String(e) });
  }
});

export default router;
