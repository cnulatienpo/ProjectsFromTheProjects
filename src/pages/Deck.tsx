import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadAllPacks } from '../data/loadAllPacksSafe';
import type { Pack } from '../types';
import { WordCard } from '../components/WordCard';

const sampleWords = [
  {
    word: 'Sagacious',
    from: { language: 'Latin', root: 'sagax', gloss: 'wise' },
    literal: 'having keen perception',
  },
  {
    word: 'Ebullient',
    from: { language: 'Latin', root: 'ebullire', gloss: 'to bubble out' },
    literal: 'overflowing with enthusiasm',
  },
  {
    word: 'Peregrinate',
    from: { language: 'Latin', root: 'peregrinari', gloss: 'to travel abroad' },
    literal: 'to travel or wander around',
  },
];

export function Deck() {
  const { id } = useParams<{ id: string }>();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    loadAllPacks().then((data) => {
      setPacks(data);
      setLoading(false);
    });
  }, []);

  const pack = useMemo(() => packs.find((item) => item.id === id), [packs, id]);

  function nextWord() {
    setCurrent((c) => (c + 1) % sampleWords.length);
  }

  const entry = sampleWords[current];

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
            <WordCard key={entry.word} e={entry} />
          ))}
        </section>
      )}

      <div className="mt-8 max-w-md rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
          The Good Word: Dictionary Game
        </h2>
        <div className="mb-4 text-center text-4xl font-extrabold text-gray-900">
          {entry.word}
        </div>
        <div className="mb-4 text-center text-base text-gray-700">
          <span className="font-semibold">Story:</span> from {entry.from.language}, root "
          <span className="font-mono">{entry.from.root}</span>" meaning "
          <span className="italic">{entry.from.gloss}</span>"
        </div>
        <div className="mb-6 text-center text-base text-gray-700">
          <span className="font-semibold">Literal:</span> "
          <span className="font-mono">{entry.literal}</span>"
        </div>
        <button
          onClick={nextWord}
          className="block w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800"
        >
          Next Word
        </button>
      </div>
    </main>
  );
}

export default Deck;
