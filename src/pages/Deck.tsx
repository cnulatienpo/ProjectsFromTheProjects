import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadAllPacks } from '../data/loadPacks';
import type { Pack } from '../types';
import { WordCard } from '../components/WordCard';

export function Deck() {
  const { id } = useParams<{ id: string }>();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPacks().then((data) => {
      setPacks(data);
      setLoading(false);
    });
  }, []);

  const pack = useMemo(() => packs.find((item) => item.id === id), [packs, id]);

  return (
    <main aria-labelledby="deck-heading" className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="deck-heading" className="text-3xl font-semibold text-brand">
            {pack ? pack.label : 'Deck'}
          </h1>
          <p className="text-brand/70">
            {pack ? `${pack.entries.length} cards ready to explore.` : 'Loading pack entries…'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            className="rounded-full border border-brand/20 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/5"
          >
            Back home
          </Link>
          {pack && (
            <Link
              to={`/play/${pack.id}`}
              className="rounded-full bg-brand-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-accent/90"
            >
              Play pack
            </Link>
          )}
        </div>
      </header>

      {loading && <p className="text-brand/70">Loading pack…</p>}
      {!loading && !pack && <p className="text-brand/70">We couldn\'t find that pack.</p>}

      {pack && (
        <section aria-label="Word cards" className="grid gap-4">
          {pack.entries.map((entry) => (
            <WordCard key={entry.word} entry={entry} />
          ))}
        </section>
      )}
    </main>
  );
}

export default Deck;
