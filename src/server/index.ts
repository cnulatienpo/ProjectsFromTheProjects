import path from "node:path";
import { createRequire } from "node:module";

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
