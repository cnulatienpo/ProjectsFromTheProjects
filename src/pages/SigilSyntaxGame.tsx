import React, { useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { loadSigilPackSafe } from "@/games/sigilSyntaxData";
import "@/styles/brutalist.css";
import "@/styles/theme/theme.css";

function Menu() {
  const nav = useNavigate();
  return (
    <main className="p-6 font-mono text-sm border-t-4 border-black" data-testid="sigil-menu">
      <h1>Sigil &amp; Syntax</h1>
      <p className="mb-3">Grammar drills &amp; literary devices.</p>
      <button className="border-2 border-black px-3 py-1" onClick={() => nav("play")}>
        Play
      </button>
    </main>
  );
}

function Play() {
  const pack = useMemo(() => loadSigilPackSafe(), []);
  const [index, setIndex] = useState(0);

  if (!pack) {
    return (
      <main className="p-6 font-mono text-sm border-t-4 border-black">
        <h2>Data not available</h2>
        <p>
          Put items in <code>src/data/sigilSyntaxItems.json</code> or export <code>items</code> from{" "}
          <code>src/games/sigilSyntaxItems.ts</code>.
        </p>
        <Link className="underline" to="..">
          Back
        </Link>
      </main>
    );
  }

  const items = pack.items;
  const cur = items[index] ?? null;

  return (
    <main className="p-6 font-mono text-sm border-t-4 border-black" data-testid="sigil-play">
      <h2 className="mb-2">Round {index + 1}</h2>
      {cur ? (
        <>
          <div className="mb-3">
            <div className="font-bold">Term:</div>
            <div>{cur.term ?? cur.prompt ?? "—"}</div>
          </div>
          <div className="mb-3">
            <div className="font-bold">Definition / Target:</div>
            <div>{cur.definition ?? cur.target ?? "—"}</div>
          </div>
          <div className="flex gap-2">
            <button
              className="border-2 border-black px-3 py-1"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Prev
            </button>
            <button
              className="border-2 border-black px-3 py-1"
              onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            >
              Next
            </button>
            <Link className="underline ml-4" to="..">
              Menu
            </Link>
          </div>
        </>
      ) : (
        <>
          <p>No item at index {index}.</p>
          <Link className="underline" to="..">
            Menu
          </Link>
        </>
      )}
    </main>
  );
}

/** Router-less shell (nested under /games/sigil-syntax/*) */
export default function SigilSyntaxGame() {
  return (
    <Routes>
      <Route path="" element={<Menu />} />
      <Route path="play" element={<Play />} />
    </Routes>
  );
}
