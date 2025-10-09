# Report Evolve

- Author in `app/src/ai/reportEvolve.ts`.
- Run `npm run emit:report-evolve` to sync.
- Server loads `server/generated/reportEvolve.js` automatically if present (falls back to built-in if missing).

## Usage

- On results screen, backend calls the evolver with user history and latest judge result.
- Only include the style report on the results screen; do not show it during the attempt.

import Health from "@/components/Health";

export const metadata = { title: "Health — Literary Deviousness" };

export default function HealthPage() {
  return <Health />;
}

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { exportState, importState } from "@/lib/storage";

export default function Health() {
  const [version, setVersion] = useState<any>(null);
  const [flags, setFlags] = useState<any>(null);

  useEffect(() => {
    api("/api/version").then(setVersion).catch(() => {});
    api("/api/flags").then((r) => setFlags(r.flags)).catch(() => {});
  }, []);

  async function setFlag(next: any) {
    const r = await api("/api/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setFlags(r.flags);
  }

  return (
    <main className="max-w-xl mx-auto p-6 mt-10 bg-white rounded shadow" aria-label="Health dashboard">
      <h1 className="text-2xl font-bold mb-4">Health</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Version</h2>
        <pre className="bg-gray-100 rounded p-3 text-sm">{version ? JSON.stringify(version, null, 2) : "Loading..."}</pre>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">Feature Flags</h2>
        <pre className="bg-gray-100 rounded p-3 text-sm" aria-label="Flags">
          {flags ? JSON.stringify(flags, null, 2) : "Loading..."}
        </pre>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className="bg-red-600 text-white px-3 py-1 rounded"
            aria-label="Disable Game"
            onClick={() => setFlag({ gameEnabled: false })}
          >
            Disable Game
          </button>
          <button
            type="button"
            className="bg-green-600 text-white px-3 py-1 rounded"
            aria-label="Enable Game"
            onClick={() => setFlag({ gameEnabled: true })}
          >
            Enable Game
          </button>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Export / Import State</h2>
        <button
          type="button"
          className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
          aria-label="Export State"
          onClick={() => {
            const blob = exportState();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "state.json";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Export State
        </button>
        <input
          type="file"
          accept="application/json"
          aria-label="Import State"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            if (importState(text)) alert("Imported!");
            else alert("Import failed.");
          }}
        />
      </section>
      <p><a href="/health">Health</a></p>
    </main>
  );
}

export class UnauthorizedError extends Error {}
const API_BASE = process.env.NEXT_PUBLIC_PROD_API || process.env.VITE_PROD_API || "";
function joinUrl(a: string, b: string) {
  if (!a) return b;
  return a.endsWith("/")
    ? b.startsWith("/")
      ? a + b.slice(1)
      : a + b
    : b.startsWith("/")
    ? a + b
    : a + "/" + b;
}
export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("/") ? (API_BASE ? joinUrl(API_BASE, path) : path) : path;
  const res = await fetch(url, init);
  if (res.status === 401) throw new UnauthorizedError("401 Unauthorized");
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.headers.get("content-type")?.includes("application/json") ? res.json() : (await res.text()) as any;
}

export function exportState(): Blob {
  const snapshot: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      snapshot[k] = localStorage.getItem(k)!;
    }
  } catch {}
  const payload = { localStorageSnapshot: snapshot, exportedAt: new Date().toISOString() };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

export function importState(text: string): boolean {
  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== "object" || !obj.localStorageSnapshot) return false;
    const snap = obj.localStorageSnapshot as Record<string, string>;
    Object.keys(snap).forEach((k) => {
      try {
        localStorage.setItem(k, String(snap[k]));
      } catch {}
    });
    return true;
  } catch {
    return false;
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { RagQuery, RagResult } from "@/lib/rag-types";
import { retrieveRelevant } from "@/lib/rag-store.local";
// @ts-ignore
import { llamaGenerate } from "@/lib/llama";

const MODEL = process.env.LLAMA_MODEL || "llama3.1:8b";
const SERVER = process.env.LLAMA_SERVER || "";

function buildPrompt(q: RagQuery, contexts: {title:string,text:string}[]) {
  const cx = contexts.map((c,i)=>`[C${i+1}] ${c.title}\n${c.text}`).join("\n\n");
  return `You are Professor Ray Ray evaluating a fiction scene.
Use the contexts to assess VOICE, STRUCTURE, DEVICES, and CLARITY.
Return a tight JSON with fields: overall(0..1), dimensions[], flags[], tips[], evidence[], citations[].

CONTEXTS:
${cx}

SUBMISSION (level=${q.level ?? "?"}, writerType=${q.writerType ?? "?"}):
${q.text}

JSON ONLY. Keep tips actionable and specific. Evidence should quote short spans from the submission with start/end indices.`;
}

async function offlineMock(q: RagQuery): Promise<RagResult> {
  // Retrieve mock docs
  const docs = retrieveRelevant(q.text, 3);
  // extremely rough heuristics
  const len = q.text.trim().length;
  const hasMetaphor = /\blike a\b|\bas if\b| as .* as /i.test(q.text);
  const hasReversal = /\bbut\b|\bhowever\b|\byet\b/i.test(q.text);
  const pastey = q.text.includes("\n") && !/\bI\b|\bmy\b|\bwe\b/.test(q.text);
  const dims = [
    { name:"Voice", score: hasMetaphor ? 0.7 : 0.5, rationale: hasMetaphor ? "Metaphoric texture present." : "Voice serviceable; add sensory rhythm." },
    { name:"Structure", score: hasReversal ? 0.7 : 0.45, rationale: hasReversal ? "Momentum shift detected." : "Add a reversal to raise stakes." },
    { name:"Devices", score: (hasMetaphor?0.65:0.4), rationale: hasMetaphor ? "Metaphor noted; layer motif." : "Layer one clear device (metaphor/foreshadowing)." },
    { name:"Clarity", score: len>120 ? 0.6 : 0.4, rationale: len>120 ? "Enough context to parse action." : "Add grounding details." },
  ];
  const flags = pastey ? ["possible paste/gloss"] : [];
  const tips = [
    "Anchor the scene in a concrete image in the first 2 sentences.",
    "Add one deliberate reversal near the midpoint.",
    "Choose a single device (metaphor or motif) and echo it twice."
  ].slice(0, q.maxSuggestions || 5);
  const citations = docs.map((d,i)=>({ id:d.id, title:d.title, snippet:d.text.slice(0,140)+"…", score: 0.6 - i*0.1 }));
  const evidence = hasMetaphor ? [{ quote: (q.text.match(/.{0,25}(?:like a|as if|as .* as).{0,25}/i)?.[0]||"").slice(0,80), note:"metaphor cue", start:0, end:0 }] : [];
  return {
    overall: dims.reduce((a,b)=>a+b.score,0)/dims.length,
    dimensions: dims,
    flags,
    tips,
    citations,
    evidence,
    model: "offline-mock",
    debug: { retrievedCount: docs.length, usedOfflineMock: true }
  };
}

export async function POST(req: NextRequest) {
  const q = (await req.json()) as RagQuery;
  const contexts = retrieveRelevant(q.text, 3);
  const prompt = buildPrompt(q, contexts);

  // If server configured and llama client available, try it
  if (SERVER) {
    try {
      const content = await llamaGenerate({ server: SERVER, model: MODEL, prompt, temperature: 0.2, max_tokens: 600 });
      // attempt to parse JSON; if it fails, fallback to mock
      const parsed = JSON.parse(content);
      const result = {
        ...parsed,
        model: MODEL,
        debug: { retrievedCount: contexts.length, usedOfflineMock: false }
      };
      return NextResponse.json(result);
    } catch (e) {
      // fall through to mock
    }
  }
  const mock = await offlineMock(q);
  return NextResponse.json(mock);
}

import { test, expect } from "@playwright/test";
test("health dashboard toggles flags", async ({ page }) => {
  await page.goto("/health");
  await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Feature Flags" })).toBeVisible();

  // Disable Game
  page.once("dialog", dialog => dialog.accept("Maintenance"));
  await page.getByRole("button", { name: "Disable Game" }).click();
  await expect(page.locator("pre")).toContainText('"gameEnabled": false');

  // Enable Game
  await page.getByRole("button", { name: "Enable Game" }).click();
  await expect(page.locator("pre")).toContainText('"gameEnabled": true');
});

import { test, expect } from '@playwright/test';

test('home has Play the Game link (non-destructive)', async ({ page }) => {
  await page.goto('/');
  const link = page.getByTestId('link-game');
  const has = await link.count();
  if (has === 0) test.skip('No [data-testid="link-game"] on the homepage');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/game');
});

import { test, expect } from '@playwright/test';

test('health page renders if present (non-destructive)', async ({ page }) => {
  const resp = await page.goto('/health');
  if (!resp || resp.status() === 404) test.skip('/health route not present');
  // If present, look for a heading that includes "Health" or "Feature Flags"
  const h = page.getByRole('heading', { name: /health|feature flags/i });
  await expect(h).toBeVisible();
});

export type LevelMeta = {
  id: number;           // 1-based
  code: string;         // e.g., "L1"
  title: string;        // e.g., "Foundations"
  perk: string | null;  // e.g., "unlock_order_mode"
  xp_threshold: number; // XP to reach this level
};

export type BadgeMeta = {
  id: string;          // e.g., "detective_bronze"
  title: string;       // display name
  group: string | null;// e.g., "Detective"
  desc: string;        // short description
  xp_bonus: number;    // XP reward
  token_reward: string | null; // optional token string
};

export type LevelsMetaResponse = { levels: LevelMeta[] };
export type BadgesMetaResponse = { badges: BadgeMeta[] };

const PERK_LABELS: Record<string, string> = {
  unlock_order_mode: "Order Mode — sequence the beats of a scene",
};

export function getPerkCopy(code: string): string | undefined {
  const key = (code || "").trim();
  return key ? PERK_LABELS[key] : undefined;
}

import type { NextApiRequest, NextApiResponse } from "next";
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const badges = [
    {
      id: "detective_bronze",
      title: "Literary Detective — Bronze",
      group: "Detective",
      desc: "Spotted key clues and maintained rising tension.",
      xp_bonus: 25,
      token_reward: null,
    },
    {
      id: "voice_scout",
      title: "Voice Scout",
      group: "Style",
      desc: "Consistent choices in diction, rhythm, and POV.",
      xp_bonus: 20,
      token_reward: null,
    },
  ];
  res.status(200).json({ badges });
}

import React, { useState, useRef, useEffect } from "react";

// Hardcoded correct order
const CORRECT = [
  "Opening image establishes mood",
  "Inciting incident disrupts routine",
  "Protagonist stakes become clear",
  "Reversal complicates the goal",
  "Climax forces a decisive choice",
  "Resolution restores a new normal",
];

// Helper: shuffle array
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Helper: move item up/down
function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const a = [...arr];
  const [item] = a.splice(from, 1);
  a.splice(to, 0, item);
  return a;
}

export default function OrderModeGame() {
  const [items, setItems] = useState<string[]>(() => shuffle(CORRECT));
  const [submitted, setSubmitted] = useState(false);
  const [correctness, setCorrectness] = useState<boolean[] | null>(null);
  const [message, setMessage] = useState<string>("Game loaded. Arrange the beats.");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Announce message changes
  const liveRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = message;
  }, [message]);

  // Keyboard reordering
  function handleKey(e: React.KeyboardEvent, idx: number) {
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const to = e.key === "ArrowUp" ? idx - 1 : idx + 1;
      if (to >= 0 && to < items.length) {
        setItems((prev) => {
          const next = moveItem(prev, idx, to);
          setMessage(
            `Moved "${prev[idx]}" ${e.key === "ArrowUp" ? "up" : "down"}.`
          );
          setTimeout(() => {
            itemRefs.current[to]?.focus();
          }, 0);
          return next;
        });
      }
    }
  }

  // Drag and drop handlers
  function handleDragStart(idx: number) {
    setDragIdx(idx);
    setMessage(`Picked up "${items[idx]}".`);
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
  }
  function handleDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) return;
    setItems((prev) => {
      const next = moveItem(prev, dragIdx, idx);
      setMessage(
        `Moved "${prev[dragIdx]}" to position ${idx + 1}.`
      );
      setTimeout(() => {
        itemRefs.current[idx]?.focus();
      }, 0);
      return next;
    });
    setDragIdx(null);
  }
  function handleDragEnd() {
    setDragIdx(null);
  }

  // Up/Down button handlers
  function handleMove(idx: number, dir: "up" | "down") {
    const to = dir === "up" ? idx - 1 : idx + 1;
    if (to < 0 || to >= items.length) return;
    setItems((prev) => {
      const next = moveItem(prev, idx, to);
      setMessage(`Moved "${prev[idx]}" ${dir}.`);
      setTimeout(() => {
        itemRefs.current[to]?.focus();
      }, 0);
      return next;
    });
  }

  // Submit order
  function handleSubmit() {
    const corr = items.map((item, i) => item === CORRECT[i]);
    setCorrectness(corr);
    setSubmitted(true);
    const score = corr.filter(Boolean).length;
    setMessage(`Submitted. Score: ${score} / 6 correct.`);
  }

  // Try again
  function handleRetry() {
    setItems(shuffle(CORRECT));
    setSubmitted(false);
    setCorrectness(null);
    setMessage("Try again! Arrange the beats.");
  }

  // Shuffle
  function handleShuffle() {
    setItems(shuffle(items));
    setMessage("Shuffled the beats.");
  }

  // Results tip
  const tip =
    "Sequencing tension is key: each beat should raise stakes, complicate goals, and drive the protagonist toward a decisive choice. Review your order to ensure the story builds momentum and resolves with clarity.";

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <header>
        <a href="/play" className="text-blue-700 underline mb-4 block">
          ← Back to Play hub
        </a>
        <h1 className="text-2xl font-bold mb-2">Order mode</h1>
        <h2 className="text-lg font-semibold mb-1">Sequence the beats</h2>
        <p className="mb-4">
          Arrange the scene beats in the correct story order. Use drag-and-drop or keyboard controls. Submit to check your sequence!
        </p>
      </header>

      <section>
        <div
          aria-live="polite"
          ref={liveRef}
          className="sr-only"
        />
        <ol
          aria-label="Arrange the beats in the correct story order"
          className="list-decimal pl-6 mb-4"
        >
          {items.map((item, idx) => (
            <li
              key={item}
              role="listitem"
              tabIndex={0}
              ref={(el) => (itemRefs.current[idx] = el)}
              className={`flex items-center justify-between mb-2 p-2 rounded border transition
                ${dragIdx === idx ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                ${submitted && correctness ? (correctness[idx] ? "bg-green-50" : "bg-red-50") : ""}
              `}
              draggable={!submitted}
              aria-grabbed={dragIdx === idx}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              onKeyDown={(e) => handleKey(e, idx)}
            >
              <span className="flex-1">{item}</span>
              <div className="flex gap-1 ml-2">
                <button
                  type="button"
                  aria-label={`Move up: ${item}`}
                  disabled={submitted || idx === 0}
                  className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
                  onClick={() => handleMove(idx, "up")}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move down: ${item}`}
                  disabled={submitted || idx === items.length - 1}
                  className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
                  onClick={() => handleMove(idx, "down")}
                >
                  ↓
                </button>
                {submitted && correctness && (
                  <span
                    aria-label={correctness[idx] ? "Correct" : "Incorrect"}
                    className={`ml-2 text-lg ${correctness[idx] ? "text-green-600" : "text-red-600"}`}
                  >
                    {correctness[idx] ? "✅" : "❌"}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>

        {!submitted && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              className="bg-yellow-500 text-white px-3 py-1 rounded"
              aria-label="Shuffle beats"
              onClick={handleShuffle}
            >
              Shuffle
            </button>
            <button
              type="button"
              className="bg-blue-600 text-white px-3 py-1 rounded"
              aria-label="Submit order"
              onClick={handleSubmit}
            >
              Submit Order
            </button>
          </div>
        )}

        {submitted && correctness && (
          <div className="mt-4 p-4 rounded bg-gray-50 border">
            <div className="text-lg font-bold mb-2">
              Results: {correctness.filter(Boolean).length} / 6 correct
            </div>
            <p className="mb-2">{tip}</p>
            {correctness.filter(Boolean).length === 6 && (
              <div className="mt-2 p-2 rounded bg-green-100 text-green-800 font-semibold">
                🎉 Perfect! You’ve mastered sequencing tension. Stronger use of Order Mode unlocked for your scenes!
              </div>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer underline">Show correct order</summary>
              <ol className="list-decimal pl-6 mt-2">
                {CORRECT.map((beat, i) => (
                  <li key={i}>{beat}</li>
                ))}
              </ol>
            </details>
            <button
              type="button"
              className="bg-purple-600 text-white px-3 py-1 rounded mt-4"
              aria-label="Try again"
              onClick={handleRetry}
            >
              Try Again
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

import type { RagQuery, RagResult } from "./rag-types";

export async function evaluateWithRag(input: RagQuery, signal?: AbortSignal): Promise<RagResult> {
  const res = await fetch("/api/rag/check", {
    method: "POST",
    headers: { "content-type":"application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (!res.ok) throw new Error(`RAG check failed: ${res.status}`);
  return await res.json();
}

# Literary Deviousness — RAG Check

POST /api/rag/check with { text, level?, writerType? } returns a RagResult.

If LLAMA_SERVER is set, the endpoint proxies to your LLaMA server with a JSON prompt.
Else, it uses a local mock retriever for offline development.

Example (browser console):

fetch('/api/rag/check',{
  method:'POST',
  headers:{'content-type':'application/json'},
  body:JSON.stringify({text:'Neon rain hit the glass like a drummer',level:1,writerType:'blueprint'})
}).then(r=>r.json()).then(console.log);
