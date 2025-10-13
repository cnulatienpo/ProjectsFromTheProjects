import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadAllPacks } from "../data/loadAllPacksSafe";
import type { Pack } from "../types";
import { useProgress } from "../state/useProgress";
import { ProgressBar } from "../components/ProgressBar";

export default function PracticeHub() {
  const [loadedPacks, setLoadedPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const seen = useProgress((state) => state.seen);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void loadAllPacks()
      .then((loaded) => {
        if (cancelled) {
          return;
        }

        setLoadedPacks(loaded);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summaries = useMemo(() => {
    return loadedPacks.map((pack) => {
      const seenCount = pack.entries.filter((entry) => seen[entry.word]).length;
      return { pack, seenCount };
    });
  }, [loadedPacks, seen]);

  const totalSeen = useMemo(() => summaries.reduce((sum, item) => sum + item.seenCount, 0), [summaries]);
  const totalWords = useMemo(() => summaries.reduce((sum, item) => sum + item.pack.entries.length, 0), [summaries]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Practice modes</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Pick a pack and jump into See &amp; Use, Spot the Nuance, or One-Arm Lexicon.
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          You have seen {totalSeen} of {totalWords} words across all packs.
        </p>
      </header>

      {loading && <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading packs…</p>}
      {!loading && summaries.length === 0 && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Add JSON packs under <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">src/labeled-data</code> to get started.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {summaries.map(({ pack, seenCount }) => (
          <article
            key={pack.id}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{pack.label}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {pack.entries.length} words · {seenCount} seen
                </p>
              </div>
              <div className="min-w-[160px]">
                <ProgressBar value={seenCount} max={pack.entries.length} />
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Link
                to={`/practice/${pack.id}`}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-center"
              >
                Practice loop
              </Link>
              <Link
                to={`/play/${pack.id}/mcq`}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 text-center"
              >
                Spot the Nuance
              </Link>
              <Link
                to={`/play/${pack.id}/slot`}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 text-center"
              >
                One-Arm Lexicon
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

