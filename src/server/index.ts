import path from "node:path";
import { createRequire } from "node:module";

import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

function loadExpress() {
    const localRequire = createRequire(import.meta.url);
    try {
        return localRequire("express");
    } catch {
        const fallback = createRequire(path.resolve("server", "package.json"));
        return fallback("express");
    }
}

const expressModule = loadExpress();
const express = (expressModule && typeof expressModule === "object" && "default" in expressModule)
    ? expressModule.default
    : expressModule;

const app = express();

app.use(cookieParser());
app.use((req, res, next) => {
    const cookies = req.cookies ?? {};
    let pid = typeof cookies.pftpid === "string" ? cookies.pftpid.trim() : "";
    if (!pid) {
        pid = uuidv4();
        res.cookie("pftpid", pid, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
        });
        req.cookies.pftpid = pid;
    }

    if (pid) {
        req.cookies.pftpid = pid;
    }

    const overrideHeader = typeof req.header === "function"
        ? req.header("X-Player-Id")
        : typeof req.get === "function"
            ? req.get("X-Player-Id")
            : undefined;

    const playerId = typeof overrideHeader === "string" && overrideHeader.trim()
        ? overrideHeader.trim()
        : pid;

    req.playerId = playerId;
    next();
});

app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), "public")));

const cutGamesRouter = require("./routes/cutGames").default as import("express").Router;

app.use(cutGamesRouter);

export default app;

export function startServer(port: number) {
    return new Promise<import("http").Server>((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
}
