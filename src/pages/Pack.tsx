import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProgressBar } from "../components/ProgressBar";
import { WordCard } from "../components/WordCard";
import { loadAllPacks } from "../data/loadAllPacksSafe";
import type { Pack as PackType } from "../data/loadAllPacksSafe";
import { useProgress } from "../state/useProgress";

export default function PackPage() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<PackType | null>(null);
  const [loading, setLoading] = useState(true);
  const seen = useProgress((state) => state.seen);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void loadAllPacks()
      .then((packs) => {
        if (!active) {
          return;
        }
        setPack(packs.find((item) => item.id === id) ?? null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const seenCount = useMemo(() => {
    if (!pack) {
      return 0;
    }
    return pack.entries.reduce((count, entry) => count + (seen[entry.word] ? 1 : 0), 0);
  }, [pack, seen]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading pack…</p>
      </main>
    );
  }

  if (!pack) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 text-center space-y-3">
        <p className="text-lg font-semibold">We couldn\'t find that pack.</p>
        <Link className="text-sm underline" to="/">
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{pack.label}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {pack.entries.length} words · {seenCount} seen
        </p>
        <ProgressBar value={seenCount} max={pack.entries.length} />
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/practice/${pack.id}`}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Practice pack
          </Link>
          <Link
            to={`/play/${pack.id}/see`}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            See &amp; Use
          </Link>
          <Link
            to={`/play/${pack.id}/mcq`}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Spot the Nuance
          </Link>
          <Link
            to={`/play/${pack.id}/slot`}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            One-Arm Lexicon
          </Link>
        </div>
      </header>

      <section className="grid gap-4" aria-label="Pack entries">
        {pack.entries.map((entry) => (
          <WordCard key={entry.word} e={entry} />
        ))}
      </section>
    </main>
  );
}
