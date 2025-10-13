import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadAllPacksSafe } from "../data/loadAllPacksSafe";
import { useGameDeck } from "../hooks/useGameDeck";
import { useProgress } from "../state/useProgress";
import type { WordEntry } from "../data/validateAndNormalize";
import { ProgressBar } from "../components/ProgressBar";
import { useToast } from "../state/useToast";

export default function PlaySlot() {
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
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setPhase(0);
    timers.current.forEach((handle) => window.clearTimeout(handle));
    timers.current = [];
  }, [current?.word]);

  const spin = useCallback(() => {
    if (!current) return;
    timers.current.forEach((handle) => window.clearTimeout(handle));
    timers.current = [];
    setPhase(0);
    timers.current.push(window.setTimeout(() => setPhase(1), 150));
    timers.current.push(window.setTimeout(() => setPhase(2), 450));
    timers.current.push(window.setTimeout(() => setPhase(3), 750));
  }, [current]);

  useEffect(() => {
    return () => {
      timers.current.forEach((handle) => window.clearTimeout(handle));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (!current) return;
      if (ev.code === "Space") {
        ev.preventDefault();
        spin();
      }
      if (phase !== 3) return;
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
  }, [current, phase, spin, markSeen, markUsed, addPoints, next, push]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading slot lexicon…</p>
      </main>
    );
  }

  if (!entries.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 text-center space-y-3">
        <p className="text-lg font-semibold">Pack not found.</p>
        <Link className="text-sm underline" to="/">
          Back home
        </Link>
      </main>
    );
  }

  if (!current) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 text-center space-y-3">
        <p className="text-lg font-semibold">Pack cleared! 🎉</p>
        <Link className="text-sm underline" to="/">
          Back home
        </Link>
      </main>
    );
  }

  const seenCount = useMemo(() => entries.filter((entry) => seen[entry.word]).length, [entries, seen]);
  const progressValue = entries.length - left;

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">One-Arm Lexicon</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Spin through a single word and soak in the rhythm.</p>
        <ProgressBar value={progressValue} max={total} />
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {seenCount} of {total} words seen.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 p-6 shadow-sm dark:border-neutral-800">
        <div
          className={`text-3xl font-semibold transition-transform duration-200 ${
            phase >= 1 ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          {current.word}
        </div>
        <div
          className={`mt-2 text-sm transition-all duration-200 ${phase >= 2 ? "opacity-100" : "opacity-0"}`}
        >
          <span className="font-medium">Story:</span> from <i>{current.from.language}</i>, root “{current.from.root}” meaning “
          {current.from.gloss}”
        </div>
        <div
          className={`mt-2 text-sm transition-opacity duration-200 ${phase >= 3 ? "opacity-100" : "opacity-0"}`}
        >
          <span className="font-medium">Literal:</span> “{current.literal}”
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={spin}
            aria-label="Spin (Space)"
          >
            Spin (Space)
          </button>
          {phase === 3 && (
            <>
              <button
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                onClick={() => {
                  push("→ skipped");
                  next();
                }}
              >
                Skip (3)
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-neutral-500" aria-live="polite">
        {phase < 3 ? "Press Space or click Spin" : "Use keys 1-3 to score the card"}
      </p>
    </main>
  );
}
