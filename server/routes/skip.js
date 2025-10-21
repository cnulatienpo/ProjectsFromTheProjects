import { Router } from "express";
import { saveAttempt } from "../db/repo.js";

const router = Router();

router.post("/skip", async (req, res) => {
    try {
        const { userId, itemId, mode, reason } = req.body ?? {};
        if (!userId || !itemId || !mode) {
            return res.status(400).json({ error: "missing userId, itemId, or mode" });
        }

        await saveAttempt(
            String(userId),
            {
                userId: String(userId),
                itemId: String(itemId),
                mode,
                answer: {},
            },
            {
                itemId: String(itemId),
                mode,
                score: 0,
                rubric: [],
                details: { reason: reason || "user_skip" },
            },
            { affectMastery: false }
        );

        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: "Skip failed", message: e?.message });
    }
});

export default router;
