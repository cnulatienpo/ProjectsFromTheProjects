import { Router } from "express";

const router = Router();

router.get("/api/version", (_req, res) => {
  res.json({
    sha: process.env.GIT_SHA || "dev",
    builtAt: process.env.BUILT_AT || new Date().toISOString(),
  });
});

export default router;
