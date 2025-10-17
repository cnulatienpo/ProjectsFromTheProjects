import React, { useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import sigilSyntaxItems from "@/sigilSyntaxItems"; // or "@/sigilSyntaxItems.json"
import { loadSigilPackSafe } from "@/games/sigilSyntaxData";
import { safeItems, getId, getTitle, getType, getLevel } from "@/lib/safe";
import "@/styles/brutalist.css";
import "@/styles/theme/theme.css";
import "./SigilSyntaxGame.css";

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
  const catalogItems = useMemo(() => safeItems(sigilSyntaxItems), []);

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

  const packItems = safeItems(pack.items);
  const hasItems = packItems.length > 0;
  const safeItemIndex = hasItems
    ? Math.min(Math.max(index, 0), packItems.length - 1)
    : 0;
  const cur = hasItems ? packItems[safeItemIndex] ?? null : null;
  const hasCatalogItems = catalogItems.length > 0;
  const safeCatalogIndex = hasCatalogItems
    ? Math.min(Math.max(index, 0), catalogItems.length - 1)
    : 0;
  const catalogEntry = hasCatalogItems ? catalogItems[safeCatalogIndex] : null;
  const catalogTitle = getTitle(catalogEntry);
  const catalogType = getType(catalogEntry);
  const catalogLevel = getLevel(catalogEntry);
  const catalogDescription =
    typeof catalogEntry?.description === "string"
      ? catalogEntry.description
      : "—";
  const catalogId = getId(catalogEntry, safeCatalogIndex);

  function nextItem() {
    setIndex((i) => {
      if (catalogItems.length <= 0) {
        return 0;
      }
      return (i + 1) % catalogItems.length;
    });
  }

  return (
    <main className="p-6 font-mono text-sm border-t-4 border-black" data-testid="sigil-play">
      <h2 className="mb-2">Round {safeItemIndex + 1}</h2>
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
              onClick={() =>
                setIndex((i) => {
                  if (!hasItems) {
                    return 0;
                  }
                  return Math.min(packItems.length - 1, i + 1);
                })
              }
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
      {hasCatalogItems ? (
        <>
          <div
            key={catalogId}
            className="bg-neutral-900 text-white rounded-xl shadow-lg p-8 mb-6 text-xl font-semibold text-center"
          >
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{catalogTitle}</div>
            <div style={{ fontSize: "1.1rem", marginTop: "1rem" }}>{catalogDescription}</div>
            <div style={{ fontSize: "0.95rem", marginTop: "1rem", opacity: 0.85 }}>
              {catalogType} • L{catalogLevel}
            </div>
          </div>
          <button
            className="bg-neutral-800 text-white px-6 py-2 rounded hover:bg-neutral-700 transition"
            onClick={nextItem}
          >
            Next
          </button>
        </>
      ) : (
        <div className="surface" style={{ padding: "1rem", margin: "1rem 0" }}>
          <strong>No lessons yet.</strong>
          <div className="muted" style={{ fontSize: ".9rem" }}>
            Add items to <code>src/sigilSyntaxItems.ts</code> and reload.
          </div>
        </div>
      )}
    </main>
  );
}

/** Router-less shell (nested under /games/sigil-syntax/*) */
export default function SigilSyntaxGame() {
  return (
    <div className="sigil-root surface">
      <Routes>
        <Route path="" element={<Menu />} />
        <Route path="play" element={<Play />} />
      </Routes>
    </div>
  );
}
