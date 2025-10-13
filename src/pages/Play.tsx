import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadAllPacks } from '../data/loadPacks';
import type { Pack, WordEntry } from '../types';
import { WordCard } from '../components/WordCard';
import { useGameStore } from '../state/useGameStore';
import Header from '../components/Header';

export function Play() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState<WordEntry[]>([]);
  const [current, setCurrent] = useState<WordEntry | null>(null);

  const points = useGameStore((state) => state.points);
  const seen = useGameStore((state) => state.seen);
  const addPoints = useGameStore((state) => state.addPoints);
  const markSeen = useGameStore((state) => state.markSeen);

  useEffect(() => {
    loadAllPacks().then((data) => {
      const nextPack = data.find((item) => item.id === id) ?? null;
      setPack(nextPack);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!pack) {
      setAvailable([]);
      setCurrent(null);
      return;
    }
    const unseen = pack.entries.filter((entry) => !seen[entry.word]);
    setAvailable(unseen);
    if (unseen.length > 0) {
      const random = unseen[Math.floor(Math.random() * unseen.length)];
      setCurrent(random);
    } else {
      setCurrent(null);
    }
  }, [pack, seen]);

  const total = pack?.entries.length ?? 0;
  const seenCount = useMemo(() => {
    if (!pack) return 0;
    return pack.entries.filter((entry) => seen[entry.word]).length;
  }, [pack, seen]);

  const progressPercent = total ? Math.min(100, (seenCount / total) * 100) : 0;

  const dealAnother = useCallback(() => {
    setCurrent((prev) => {
      if (!available.length) {
        return null;
      }
      const others = prev ? available.filter((entry) => entry.word !== prev.word) : available;
      const pool = others.length > 0 ? others : available;
      return pool[Math.floor(Math.random() * pool.length)] ?? null;
    });
  }, [available]);

  const handleSuccess = useCallback(
    (score: number) => {
      if (!current) return;
      addPoints(score);
      markSeen(current.word);
      setCurrent(null);
    },
    [addPoints, markSeen, current]
  );

  const handleSkip = useCallback(() => {
    if (!current) return;
    dealAnother();
  }, [current, dealAnother]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (!current) return;
      if (event.key === '1') {
        event.preventDefault();
        handleSuccess(10);
      } else if (event.key === '2') {
        event.preventDefault();
        handleSuccess(5);
      } else if (event.key === '3') {
        event.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleSkip, handleSuccess, current]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Header />
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Literary Deviousness: Fiction Writing School For Broke Mutherfuckers.
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/foundation"
          className="block bg-white border-2 border-black rounded-lg shadow hover:bg-neutral-100 transition p-6 text-center"
        >
          <div className="font-bold text-lg mb-2">Sygil & Symbol</div>
          <div className="text-sm mb-4">Fiction writing basics.</div>
          <span className="inline-block px-4 py-2 bg-black text-white rounded">Go to Game</span>
        </Link>
        <Link
          to="/play/pack-01"
          className="block bg-white border-2 border-black rounded-lg shadow hover:bg-neutral-100 transition p-6 text-center"
        >
          <div className="font-bold text-lg mb-2">The Good Word</div>
          <div className="text-sm mb-4">Learn more words.</div>
          <span className="inline-block px-4 py-2 bg-black text-white rounded">Go to Game</span>
        </Link>
        <Link
          to="/cutgames"
          className="block bg-white border-2 border-black rounded-lg shadow hover:bg-neutral-100 transition p-6 text-center"
        >
          <div className="font-bold text-lg mb-2">The Cut Games</div>
          <div className="text-sm mb-4">Editing, but fun.</div>
          <span className="inline-block px-4 py-2 bg-black text-white rounded">Go to Game</span>
        </Link>
      </div>

      <main aria-labelledby="play-heading" className="space-y-6">
        <header className="space-y-2">
          <h1 id="play-heading" className="text-3xl font-semibold text-brand">
            {pack ? `Play: ${pack.label}` : 'Play'}
          </h1>
          <p className="text-brand/70">
            Points: <span className="font-semibold text-brand">{points}</span>
          </p>
          <div className="h-2 w-full rounded-full bg-brand/10" role="progressbar" aria-valuenow={seenCount} aria-valuemin={0} aria-valuemax={total}>
            <div
              className="h-full rounded-full bg-brand-accent transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-brand/60">
            Progress: {seenCount}/{total}
          </p>
        </header>

        {loading && <p className="text-brand/70">Loading play mode…</p>}
        {!loading && !pack && <p className="text-brand/70">We couldn\'t find that pack.</p>}

        {!loading && pack && available.length === 0 && (
          <section className="rounded-xl border border-brand/10 bg-white p-6 text-center shadow-sm">
            <p className="text-xl font-semibold text-brand">Pack cleared! 🎉</p>
            <p className="mt-2 text-brand/70">You\'ve seen every word in this pack.</p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/"
                className="rounded-full bg-brand-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-accent/90"
              >
                Back to Home
              </Link>
            </div>
          </section>
        )}

        {pack && current && available.length > 0 && (
          <section className="space-y-4" aria-live="polite">
            <WordCard entry={current} />
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleSuccess(10)}
                className="rounded-full bg-brand-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent/90 focus:outline-none focus-visible:ring"
                aria-label="I used it in a sentence (adds 10 points)"
              >
                1. I used it in a sentence (+10)
              </button>
              <button
                type="button"
                onClick={() => handleSuccess(5)}
                className="rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 focus:outline-none focus-visible:ring"
                aria-label="I learned it (adds 5 points)"
              >
                2. I learned it (+5)
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-full border border-brand/20 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/5 focus:outline-none focus-visible:ring"
                aria-label="Skip this word"
              >
                3. Skip
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Play;

