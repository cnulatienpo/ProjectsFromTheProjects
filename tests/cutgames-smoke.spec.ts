import type { AddressInfo } from "node:net";
import { test, expect } from "@playwright/test";
import app from "../src/server/index";

let server: import("http").Server;
let baseURL: string;

test.beforeAll(async () => {
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

test("GET /cut-games/catalog returns summary", async ({ request }) => {
    const response = await request.get(`${baseURL}/cut-games/catalog`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty("tweetrunkCount");
    expect(body).toHaveProperty("goodCount");
    expect(body).toHaveProperty("beatsIndex");
});

test("GET /cut-games/practice?mode=good returns items", async ({ request }) => {
    const response = await request.get(`${baseURL}/cut-games/practice?mode=good`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
});

test("GET /cut-games/practice?mode=bad&pitfall=info_dump returns array", async ({ request }) => {
    const response = await request.get(`${baseURL}/cut-games/practice?mode=bad&pitfall=info_dump`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(0);
});
