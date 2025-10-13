import path from "node:path";
import { createRequire } from "node:module";

import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import cutGamesRouter from "./routes/cutGames";

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

type PlayerRequest = Request & {
    playerId?: string;
    cookies: Record<string, string>;
    header?(name: string): string | undefined;
    get?(name: string): string | undefined;
};

const app = express();

app.use(cookieParser());
app.use((req: PlayerRequest, res: Response, next: NextFunction) => {
    const cookieJar = req.cookies ?? {};
    req.cookies = cookieJar;
    let pid = typeof cookieJar.pftpid === "string" ? cookieJar.pftpid.trim() : "";
    if (!pid) {
        pid = uuidv4();
        res.cookie("pftpid", pid, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
        });
        cookieJar.pftpid = pid;
    }

    if (pid) {
        cookieJar.pftpid = pid;
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
app.use(cutGamesRouter);

export default app;

export function startServer(port: number) {
    return new Promise<import("http").Server>((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
}
