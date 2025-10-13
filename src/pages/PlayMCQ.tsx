import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadAllPacksSafe } from "../data/loadAllPacksSafe";
import { useGameDeck } from "../hooks/useGameDeck";
import { useProgress } from "../state/useProgress";
import type { WordEntry } from "../data/validateAndNormalize";
import { ProgressBar } from "../components/ProgressBar";
import { useToast } from "../state/useToast";

function shuffle<T>(input: T[]): T[] {
  return input
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function PlayMCQ() {
  const { id } = useParams();
  const [entries, setEntries] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const addPoints = useProgress((s) => s.addPoints);
  const markSeen = useProgress((s) => s.markSeen);
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

  const { current, next, total, left } = useGameDeck(entries);
  const [picked, setPicked] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = shuffle(entries.filter((entry) => entry.word !== current.word)).slice(0, 3);
    return shuffle([current.literal, ...distractors.map((entry) => entry.literal)]).slice(0, 4);
  }, [current, entries]);

  useEffect(() => {
    setPicked(null);
    setWasCorrect(null);
  }, [current?.word]);

  const choose = useCallback(
    (index: number) => {
      if (picked !== null || !current) return;
      setPicked(index);
      const ok = options[index] === current.literal;
      setWasCorrect(ok);
      if (ok) {
        addPoints(5);
        markSeen(current.word);
        push("★ +5 — learned it");
      } else {
        push("Keep going!");
      }
    },
    [picked, current, options, addPoints, markSeen, push]
  );

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (!current) return;
      if (ev.key >= "1" && ev.key <= "4") {
        const index = Number(ev.key) - 1;
        if (index < options.length) {
          choose(index);
        }
      } else if ((ev.key === "n" || ev.key === "N") && picked !== null) {
        next();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, options, picked, next, choose]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading multiple choice…</p>
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

  const handleNext = useCallback(() => {
    if (picked === null) return;
    next();
  }, [picked, next]);

  const seenCount = useMemo(() => entries.filter((entry) => seen[entry.word]).length, [entries, seen]);
  const progressValue = entries.length - left;

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Spot the Nuance</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Which literal matches this story?
        </p>
        <ProgressBar value={progressValue} max={total} />
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {seenCount} of {total} words seen.
        </p>
      </header>

      <h2 className="text-3xl font-semibold">{current.word}</h2>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        <span className="font-medium">Story:</span> from <i>{current.from.language}</i>, root “{current.from.root}” meaning “{current.from.gloss}”
      </p>
      <div className="space-y-2" role="group" aria-label="Choose the literal meaning">
        {options.map((opt, index) => {
          const isPicked = picked === index;
          const isCorrectChoice = wasCorrect && isPicked;
          const isWrongChoice = wasCorrect === false && isPicked;
          return (
            <button
              key={index}
              onClick={() => choose(index)}
              className={`w-full text-left rounded-md border px-3 py-2 text-sm transition ${
                isCorrectChoice
                  ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-500/20"
                  : ""
              } ${
                isWrongChoice
                  ? "border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-500/20"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
              aria-pressed={isPicked}
              data-key-hint={index + 1}
            >
              {index + 1}. “{opt}”
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="flex items-center justify-between">
          <p className="text-sm">
            {wasCorrect ? "Correct: +5" : <>Answer: “{current.literal}”</>}
          </p>
          <button
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={handleNext}
            aria-label="Next (N)"
          >
            Next (N)
          </button>
        </div>
      )}
      <p className="text-xs text-neutral-500" aria-live="polite">
        {picked === null ? "Press 1-4 to answer" : "Press N for the next card"}
      </p>
      <p className="text-xs text-neutral-500">Cards in pack: {total}</p>
    </main>
  );
}
