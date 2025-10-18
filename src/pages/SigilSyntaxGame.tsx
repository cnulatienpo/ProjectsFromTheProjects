import { useEffect, useState } from 'react';
import './SigilSyntaxGame.css';

type Item = { id: string; title: string; level?: number; type?: string };

export default function SigilSyntaxGame() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch('/sigil/catalog', { headers: { Accept: 'application/json' }});
        const j = await r.json();
        if (!live) return;
        setItems(Array.isArray(j?.items) ? j.items : []);
      } catch {
        if (!live) return;
        setItems([]);
      } finally {
        live && setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  return (
    <div className="sigil-root surface" style={{ padding: 16 }}>
      <h1>Sigil &amp; Syntax</h1>
      {loading && <div className="surface" style={{ padding: 12 }}>Loading…</div>}
      {!loading && items.length === 0 && (
        <div className="surface" style={{ padding: 12 }}>
          <strong>No lessons found.</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Reading JSONL + CSV from <code>labeled data/</code> via <code>/sigil/catalog</code>
          </div>
        </div>
      )}
      {items.length > 0 && (
        <div className="grid">
          {items.map((it, i) => (
            <article key={it.id || `item-${i}`} className="card" style={{ padding: 12 }}>
              <h3 style={{ margin: 0 }}>{it.title || 'Untitled'}</h3>
              <div className="muted" style={{ fontSize: 12 }}>
                {(it.type ?? 'lesson')} • L{it.level ?? 1}
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
