import React from "react";

/**
 * We scan for likely entry components (generic names like app.tsx/App.tsx/page.tsx)
 * and choose the best candidate by scoring:
 *  1) File path contains "sigil" or "syntax"
 *  2) File content includes "Sigil" or "Syntax"
 *  3) File imports from "labled data" or "game thingss"
 *  4) Fallback: first matching "app.tsx" nearest to games/
 *
 * We do NOT move/rename anything. We just import the chosen module and render its default export.
 */

// Raw contents for scoring
const rawCandidates = import.meta.glob(
  "/src/**/*{app,App,page,Page}.{tsx,jsx,ts,js}",
  { as: "raw", eager: true }
) as Record<string, string>;

// Modules to render
const modCandidates = import.meta.glob(
  "/src/**/*{app,App,page,Page}.{tsx,jsx,ts,js}",
  { eager: true }
) as Record<string, any>;

type Scored = { path: string; score: number };

function scorePath(path: string, raw: string): number {
  let s = 0;
  const p = path.toLowerCase();
  if (p.includes("sigil")) s += 6;
  if (p.includes("syntax")) s += 6;
  if (/sigil|syntax/i.test(raw)) s += 5;
  if (/from\s+["'][./\s]*labled data/i.test(raw)) s += 4;
  if (/from\s+["'][./\s]*game thingss/i.test(raw)) s += 4;
  // Prefer under games/
  if (p.includes("/games/")) s += 3;
  // Prefer app.tsx over page.tsx
  if (p.match(/\/app\.(t|j)sx?$/i)) s += 2;
  return s;
}

function pickCandidate(): string | null {
  const scored: Scored[] = Object.entries(rawCandidates).map(([path, raw]) => ({
    path,
    score: scorePath(path, raw || "")
  }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  if (!top || top.score <= 0) {
    // fallback: any app.tsx near games
    const fall = Object.keys(rawCandidates).find(p =>
      /\/games\/.*\/app\.(t|j)sx?$/i.test(p)
    ) || Object.keys(rawCandidates).find(p =>
      /\/app\.(t|j)sx?$/i.test(p)
    );
    return fall || null;
  }
  return top.path;
}

export function getSigilSyntaxComponent(): React.ComponentType | null {
  const chosen = pickCandidate();
  if (!chosen) {
    console.error("[Sigil&Syntax] No candidate entry component found.");
    return null;
  }
  const mod = modCandidates[chosen];
  const C = (mod?.default ?? mod) as React.ComponentType | undefined;
  if (!C) {
    console.error("[Sigil&Syntax] Candidate has no default export:", chosen);
    return null;
  }
  console.groupCollapsed("[Sigil&Syntax] Using entry:", chosen);
  console.log("Scanned", Object.keys(modCandidates).length, "candidates.");
  console.groupEnd();
  return C;
}
