import { useEffect, useState } from 'react';
import './SigilSyntaxGame.css';

type Item = { id: string; title: string; level?: number; type?: string };

export default function SigilSyntaxGame() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch('/sigil/catalog', { headers: { Accept: 'application/json' }});
        const json = await r.json();
        if (!alive) return;
        setItems(Array.isArray(json?.items) ? json.items : []);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="sigil-root surface" style={{ padding: 16 }}>
      <h1>Sigil &amp; Syntax</h1>

      {loading && <div className="surface" style={{ padding: 12 }}>Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="surface" style={{ padding: 12 }}>
          <strong>No lessons found.</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Looking in <code>labeled data/tweetrunk_renumbered.jsonl</code> via <code>/sigil/catalog</code>
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
