import { Router } from 'express';

const router = Router();

router.get('/latest', (req, res) => {
  const headerUserId = req.headers['x-user-id'];
  let userId = 'dev';

  if (typeof headerUserId === 'string' && headerUserId.trim()) {
    userId = headerUserId.trim();
  } else if (Array.isArray(headerUserId) && headerUserId.length) {
    const candidate = headerUserId.find(value => typeof value === 'string' && value.trim());
    if (candidate) {
      userId = candidate.trim();
    }
  }

  const report = {
    ok: true,
    userId,
    level: 7,
    badges: ['Beat Detective', 'Comma Wrangler'],
    memo: {
      title: 'Professor Ray Ray memo – your current vibe',
      body: "You lean into visible cause→effect beats and keep the world doing work. Cadence favors short clauses, then a longer gather. You're light on setup→payoff; try planting for later returns. You avoid label-y emotions (nice). Watch for hedges (just, kind of). Nearest neighbors: Baldwin × Chandler. Mortal enemies: PurpleProse, TEDTalk.",
    },
    generatedAt: new Date().toISOString(),
  };

  res.json(report);
});

export default router;
