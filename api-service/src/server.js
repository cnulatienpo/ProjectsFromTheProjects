import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 8787;
const ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(helmet());
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

// ---- Routes your frontend has referenced before ----
app.get("/status", (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
});

app.get("/health", (_req, res) => {
    res.json({ name: "Literary Deviousness API", env: process.env.NODE_ENV || "dev" });
});

app.get("/catalog", (_req, res) => {
    // TODO: return lesson/game catalog; placeholder
    res.json({ items: [] });
});

app.get("/bundle", (_req, res) => {
    // TODO: return content bundle by id/query; placeholder
    res.json({ bundle: null });
});

// Minimal sign endpoints (stubbed)
app.post("/sign", (req, res) => {
    const { payload } = req.body || {};
    // In production, sign with SIGN_SECRET (JWT or HMAC). Here: echo.
    res.json({ signed: Boolean(payload), payload });
});

app.get("/sign-get", (req, res) => {
    const payload = req.query.payload || null;
    res.json({ signed: Boolean(payload), payload });
});

// Fallback
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

app.listen(PORT, () => {
    console.log(`LD API listening on http://localhost:${PORT}`);
});
