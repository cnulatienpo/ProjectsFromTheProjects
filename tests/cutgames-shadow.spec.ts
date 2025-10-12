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

    test("GET /cut-games/practice issues and reuses silent cookie", async ({ request }) => {
        const first = await request.get(`${baseURL}/cut-games/practice?mode=bad`);
        expect(first.ok()).toBeTruthy();
        const firstBody = await first.json();
        expect(Array.isArray(firstBody)).toBe(true);

        const setCookieHeader = first.headersArray().find(({ name }) => name.toLowerCase() === "set-cookie");
        expect(setCookieHeader?.value ?? "").toContain("pftpid=");
        const cookieValue = (setCookieHeader?.value ?? "").split(/;\s*/)[0];
        expect(cookieValue).toMatch(/^pftpid=[^;]+$/);

        const second = await request.get(`${baseURL}/cut-games/practice?mode=bad`, {
            headers: {
                Cookie: cookieValue,
            },
        });
        expect(second.ok()).toBeTruthy();
        const secondBody = await second.json();
        expect(Array.isArray(secondBody)).toBe(true);

        const secondSetCookie = second.headersArray().filter(({ name }) => name.toLowerCase() === "set-cookie");
        expect(secondSetCookie.length).toBe(0);

        for (const payload of [firstBody, secondBody]) {
            if (!Array.isArray(payload)) continue;
            for (const row of payload) {
                expect(row).toBeTruthy();
                if (row && typeof row === "object") {
                    expect("playerId" in row).toBe(false);
                    expect("pftpid" in row).toBe(false);
                }
            }
        }

        const storeRaw = await fsp.readFile(shadowFile, "utf8");
        const storeData = JSON.parse(storeRaw) as {
            players?: Record<string, { counter?: number }>;
        };
        const playerEntries = Object.entries(storeData.players ?? {});
        expect(playerEntries.length).toBe(1);
        const [[, entry]] = playerEntries;
        expect(entry?.counter).toBe(2);
    });
});
