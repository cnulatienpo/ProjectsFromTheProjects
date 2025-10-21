import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, ping: 'attempt-route-alive' });
});

router.post('/', express.json(), (req, res) => {
  const { userId, itemId, mode, answer } = req.body || {};
  const payload = {
    ok: true,
    itemId,
    mode,
    score: 0.8,
    rubric: [
      { key: 'Accuracy', ok: true },
      { key: 'Clarity', ok: true },
      { key: 'Voice', ok: true },
      { key: 'Consistency', ok: true },
      { key: 'Professionalism', ok: true },
    ],
    spans: [],
    correctSequence: [],
    fixSuggestion: 'Tighten the sentence. Cut a hedge word.',
    nextHints: ['Try adding a Reveal 👁️ before the Payoff 🎉.'],
    details: {
      message: 'Stub grader: received your answer and awarded provisional credit.',
      mode,
      echo: String(answer ?? '')
    },
    gradedAt: new Date().toISOString(),
  };
  res.json(payload);
});

export default router;
