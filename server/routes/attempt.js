import { Router, json } from "express";

const router = Router();

// GET ping so we can verify the route is mounted
router.get("/api/attempt", (_req, res) => {
  res.json({ ok: true, ping: "attempt-route-alive" });
});

/**
 * POST /api/attempt
 * body: { userId, itemId, mode, answer }
 * Returns a normalized result so the UI can render feedback.
 */
router.post("/api/attempt", json(), async (req, res) => {
  const { userId, itemId, mode, answer } = req.body || {};
  if (!userId || !itemId || !mode) {
    return res.status(400).json({ error: "missing userId, itemId, or mode" });
  }

  const hasAnswer =
    answer != null &&
    (typeof answer === "string" ? answer.trim().length > 0 : true);

  const score = hasAnswer ? 0.8 : 0.0;
  const rubric = [
    { key: "Accuracy", ok: hasAnswer },
    { key: "Clarity", ok: hasAnswer },
    { key: "Voice", ok: true },
    { key: "Consistency", ok: true },
    { key: "Professionalism", ok: true },
  ];

  const spans = [];
  const correctSequence = [];
  const details = {
    message: hasAnswer
      ? "Stub grader: received your answer and awarded provisional credit."
      : "Stub grader: no answer detected.",
    mode,
    echo: typeof answer === "string" ? answer.slice(0, 240) : answer,
  };

  const nextHints = hasAnswer
    ? ["Try adding a Reveal 👁️ before the Payoff 🎉."]
    : ["Answer anything to proceed; this is a stub grader."];

  return res.json({
    ok: true,
    itemId,
    mode,
    score,
    rubric,
    spans,
    correctSequence,
    fixSuggestion: hasAnswer ? "Tighten the sentence. Cut a hedge word." : null,
    nextHints,
    details,
    gradedAt: new Date().toISOString(),
  });
});

export default router;
