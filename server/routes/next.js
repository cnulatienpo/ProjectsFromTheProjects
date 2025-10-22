import express from "express";
import { pickNext } from "../scheduler/next.js";

const router = express.Router();

// sanity ping
router.get("/next/ping", (_req, res) => res.json({ ok: true, ping: "next-route-alive" }));

// GET /api/next -> next item for the user
router.get("/next", (req, res) => {
  const userId = String(req.header("x-user-id") || req.query.userId || "dev");
  try {
    const item = pickNext(userId);
    if (!item) return res.status(404).json({ error: "no_items" });
    // normalize a tiny shape
    const payload = {
      id: String(item.id),
      mode: String(item.mode || "why"),
      passage: item.passage,
      gold: item.gold || {},
      meta: item.meta || {}
    };
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: "scheduler_failed", message: e?.message || String(e) });
  }
});

export default router;
