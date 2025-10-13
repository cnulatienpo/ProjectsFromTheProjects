import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { WordCard } from "../components/WordCard";
import { useGameDeck } from "../hooks/useGameDeck";
import { useProgress } from "../state/useProgress";
import { loadAllPacksSafe } from "../data/loadAllPacksSafe";
import type { WordEntry } from "../data/validateAndNormalize";
import { ProgressBar } from "../components/ProgressBar";
import { useToast } from "../state/useToast";

export default function PlaySee() {
  const { id } = useParams();
  const [entries, setEntries] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const addPoints = useProgress((s) => s.addPoints);
  const markSeen = useProgress((s) => s.markSeen);
  const markUsed = useProgress((s) => s.markUsed);
  const seen = useProgress((s) => s.seen);
  const push = useToast((s) => s.push);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadAllPacksSafe()
      .then(({ packs }) => {
        if (cancelled) return;
        const pack = packs.find((p) => p.id === id);
        setEntries(pack?.entries ?? []);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const { current, next, left, total } = useGameDeck(entries);
  const seenCount = useMemo(() => entries.filter((entry) => seen[entry.word]).length, [entries, seen]);
  const progressValue = entries.length - left;

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (!current) return;
      if (ev.key === "1") {
        markUsed(current.word);
        addPoints(10);
        push("★ +10 — used it");
        next();
      } else if (ev.key === "2") {
        markSeen(current.word);
        addPoints(5);
        push("★ +5 — learned it");
        next();
      } else if (ev.key === "3") {
        push("→ skipped");
        next();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, addPoints, markSeen, markUsed, next]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading See &amp; Use…</p>
      </main>
    );
  }

  if (!entries.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 text-center space-y-3">
        <p className="text-lg font-semibold">Pack not found.</p>
        <Link to="/" className="text-sm underline">
          Back to Home
        </Link>
      </main>
    );
  }

  if (!current) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 text-center space-y-3">
        <p className="text-lg font-semibold">Pack cleared! 🎉</p>
        <Link to="/" className="text-sm underline">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">See &amp; Use</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {seenCount} of {total} words seen.
        </p>
        <ProgressBar value={progressValue} max={total} />
      </header>
      <WordCard e={current} />
      <div className="flex flex-wrap justify-center gap-2">
        <button
          aria-label="I used it in a sentence (1)"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            markUsed(current.word);
            addPoints(10);
            push("★ +10 — used it");
            next();
          }}
        >
          I used it (1)
        </button>
        <button
          aria-label="I learned it (2)"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            markSeen(current.word);
            addPoints(5);
            push("★ +5 — learned it");
            next();
          }}
        >
          I learned it (2)
        </button>
        <button
          aria-label="Skip (3)"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            push("→ skipped");
            next();
          }}
        >
          Skip (3)
        </button>
      </div>
      <p className="text-xs text-neutral-500" aria-live="polite">
        Use keys 1, 2, or 3 for quick scoring.
      </p>
    </main>
  );
}
