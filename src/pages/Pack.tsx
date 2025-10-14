import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProgressBar } from "../components/ProgressBar";
import { WordCard } from "../components/WordCard";
import { loadAllPacksSafe, type Pack as PackType } from "../data/loadAllPacksSafe";
import { useProgress } from "../state/useProgress";
import { Loader } from "../components/Loader";
import { EmptyState } from "../components/EmptyState";

export default function PackPage() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<PackType | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const seen = useProgress((state) => state.seen);

  useEffect(() => {
    let active = true;
    setPack(undefined);
    setError(null);

    loadAllPacksSafe()
      .then(({ packs }) => {
        if (!active) return;
        setPack(packs.find((item) => item.id === id) ?? null);
      })
      .catch((e) => {
        if (!active) return;
        setError(String(e));
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

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <EmptyState
          title="Couldn’t load pack"
          note={error}
          emoji="⚠️"
          action={
            <button
              type="button"
              onClick={() => location.reload()}
              className="rounded-md border px-3 py-2 underline"
            >
              Reload
            </button>
          }
        />
      </main>
    );
  }

  if (pack === undefined) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <Loader label="Loading pack…" />
      </main>
    );
  }

  if (!pack) {
    return (
      <main className="mx-auto max-w-5xl space-y-3 p-4 text-center">
        <p className="text-lg font-semibold">We couldn’t find that pack.</p>
        <Link className="text-sm underline" to="/">
          Back home
        </Link>
      </main>
    );
  }

  if (!pack.entries.length) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <EmptyState title="This pack is empty" note="Try another pack from Home." emoji="📦" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{pack.label}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{pack.entries.length} words · {seenCount} seen</p>
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
