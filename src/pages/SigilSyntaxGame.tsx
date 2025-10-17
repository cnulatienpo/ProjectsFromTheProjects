import React, { useEffect, useState } from "react";
import DebugPanel from "@/diagnostics/DebugPanel";
import { loadSigilCatalog, SigilItem } from "@/lib/loadSigil";
import { apiBase } from "@/lib/apiBase";
import "@/styles/brutalist.css";
import "@/styles/theme/theme.css";
import "./SigilSyntaxGame.css";

export default function SigilSyntaxGame() {
  const [items, setItems] = useState<SigilItem[]>([]);
  const [source, setSource] = useState<string>("loading");
  const [sample, setSample] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const debugEnabled =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await loadSigilCatalog(apiBase ?? "");
      if (!alive) return;
      setItems(res.items);
      setSource(res.source);
      setSample(res.items[0] ?? null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="sigil-root surface" style={{ padding: "16px" }}>
      <h1>Sigil &amp; Syntax</h1>
      <DebugPanel source={source} count={items.length} sample={sample} apiBase={apiBase ?? ""} />

      {debugEnabled && (
        <div className="surface" style={{ padding: 8, margin: "8px 0" }}>
          <small>
            Sigil data source: <code>{source}</code>
          </small>
        </div>
      )}

      {loading ? (
        <div className="surface" style={{ padding: "12px" }}>Loading…</div>
      ) : items.length === 0 ? (
        <div className="surface" style={{ padding: "12px" }}>
          <div className="muted">No lessons yet.</div>
          <div className="muted" style={{ marginTop: 4 }}>
            Source tried: <code>{source}</code>
          </div>
        </div>
      ) : (
        <div className="grid">
          {items.map((it, i) => (
            <article key={it?.id ?? `item-${i}`} className="card" style={{ padding: "12px" }}>
              <h3 style={{ margin: 0 }}>{it?.title ?? "Untitled"}</h3>
              <div className="muted" style={{ fontSize: 12 }}>
                {(it?.type ?? "lesson")} • L{it?.level ?? 1}
              </div>
              <footer style={{ marginTop: 8 }}>
                <button className="btn btn-primary">Play</button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
