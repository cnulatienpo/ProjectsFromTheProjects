const express = require("express");
const router = express.Router();

/**
 * POST /api/attempt
 * body: { userId, itemId, mode, answer }
 * Returns a normalized result so the UI can render feedback.
 */
router.post("/api/attempt", express.json(), async (req, res) => {
  const { userId, itemId, mode, answer } = req.body || {};
  if (!userId || !itemId || !mode) {
    return res.status(400).json({ error: "missing userId, itemId, or mode" });
  }

  // TODO: swap this stub for real graders later.
  // For now: naive scoring (has some answer → pass-ish), echo details.
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

  // keep spans/sequence shape so Highlight/Order UIs don’t break
  const spans = [];            // e.g., [{ start: 10, end: 22, tag: "signal" }]
  const correctSequence = [];  // e.g., ["setup","reveal","payoff"]

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
    score,              // 0..1
    rubric,             // [{key, ok}]
    spans,              // []
    correctSequence,    // []
    fixSuggestion: hasAnswer ? "Tighten the sentence. Cut a hedge word." : null,
    nextHints,          // string[]
    details,
    gradedAt: new Date().toISOString(),
  });
});

module.exports = router;
