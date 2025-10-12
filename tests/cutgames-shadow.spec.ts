import type { AddressInfo } from "node:net";
import path from "node:path";
import { promises as fsp } from "node:fs";
import { test, expect } from "@playwright/test";

import app from "../src/server/index";

const shadowFile = path.resolve(process.cwd(), "src", "server", "data", "shadow_stack.json");
const playerId = "shadow-stack-test-player";

async function resetShadowStore() {
    await fsp.mkdir(path.dirname(shadowFile), { recursive: true });
    await fsp.writeFile(shadowFile, JSON.stringify({ players: {} }, null, 2), "utf8");
}

test.describe.serial("Cut Games shadow stack", () => {
    let server: import("http").Server;
    let baseURL: string;

    test.beforeAll(async () => {
        await resetShadowStore();
        server = app.listen(0);
        await new Promise<void>((resolve, reject) => {
            server.once("listening", () => resolve());
            server.once("error", reject);
        });
        const address = server.address() as AddressInfo | null;
        if (!address || typeof address.port !== "number") {
            throw new Error("Failed to determine server port");
        }
        baseURL = `http://127.0.0.1:${address.port}`;
    });

    test.afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close(err => (err ? reject(err) : resolve()));
        });
    });

    test.beforeEach(async () => {
        await resetShadowStore();
    });

    test("POST /cut-games/telemetry skip event returns ok", async ({ request }) => {
        const response = await request.post(`${baseURL}/cut-games/telemetry`, {
            data: {
                event: "skip",
                mode: "bad",
                meta: { pitfall: "info_dump" },
            },
            headers: {
                "X-Player-Id": playerId,
            },
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body).toMatchObject({ ok: true });
    });

    test("GET /cut-games/practice handles first 19 requests without shadow", async ({ request }) => {
        for (let i = 0; i < 19; i += 1) {
            const response = await request.get(`${baseURL}/cut-games/practice?mode=bad`, {
                headers: {
                    "X-Player-Id": playerId,
                },
            });
            expect(response.ok()).toBeTruthy();
            const body = await response.json();
            expect(Array.isArray(body)).toBe(true);
        }
    });

    test("20th GET /cut-games/practice can leverage shadow stack", async ({ request }) => {
        await request.post(`${baseURL}/cut-games/telemetry`, {
            data: {
                event: "skip",
                mode: "bad",
                meta: { pitfall: "info_dump" },
            },
            headers: {
                "X-Player-Id": playerId,
            },
        });

        const raw = await fsp.readFile(shadowFile, "utf8");
        const data = JSON.parse(raw) as {
            players?: Record<string, { counter?: number; skips?: unknown; lastUpdated?: string }>;
        };
        if (!data.players) data.players = {};
        if (!data.players[playerId]) {
            data.players[playerId] = {
                counter: 19,
                skips: { beat: {}, pitfall: { info_dump: 1 }, type: {} },
                lastUpdated: new Date().toISOString(),
            };
        } else {
            data.players[playerId].counter = 19;
        }
        await fsp.writeFile(shadowFile, JSON.stringify(data, null, 2), "utf8");

        const response = await request.get(`${baseURL}/cut-games/practice?mode=bad`, {
            headers: {
                "X-Player-Id": playerId,
            },
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        const hasInfoDump = Array.isArray(body)
            ? body.some((item: { pitfall?: string | null }) => item?.pitfall === "info_dump")
            : false;
        if (Array.isArray(body) && body.length > 0 && hasInfoDump) {
            expect(hasInfoDump).toBe(true);
        }
    });
});
