// server/routes/reports.js
import express from 'express';

const router = express.Router();

// Ping to prove router is alive (optional but handy)
router.get('/reports/ping', (_req, res) => {
  res.json({ ok: true, ping: 'reports-route-alive' });
});

// GET /api/reports/latest -> stub Professor Ray Ray memo
router.get('/reports/latest', (req, res) => {
  const userId = (req.headers['x-user-id'] || req.query.userId || 'dev') + '';
  const memo = {
    title: `Professor Ray Ray memo for ${userId}`,
    body: [
      "VOICE: you favor concrete nouns and sturdy verbs. Keep it.",
      "CHOICE: you escalate with Red beats (Action/Decision), sprinkle Blue (Reveal/Realization).",
      "PACE: quick starts, then longer clauses to weight the fallouts.",
      "INFLUENCES: Hemingway-tendencies; watch for BeigeProse drift when tired.",
      "NEXT: Try one scene with a Green lead (Nonverbal + Interaction) and an Orange assist (Atmosphere)."
    ].join('\n'),
    level: 2,
    badges: ['Beat Detective', 'Clause Wrangler'],
    influences: { like: ['Hemingway', 'Baldwin'], avoid: ['BeigeProse'] },
    generatedAt: new Date().toISOString()
  };
  res.json({ ok: true, memo });
});

export default router;
