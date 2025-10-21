import { Router } from "express";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.type("text/plain").send("ok");
});

export default router;
