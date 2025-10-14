import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { WordCard } from "../components/WordCard";
import { ProgressBar } from "../components/ProgressBar";
import { loadAllPacksSafe } from "../data/loadAllPacksSafe";
import type { WordEntry } from "@/utils/validateAndNormalize";
import { useGameDeck } from "../hooks/useGameDeck";
import { useProgress } from "../state/useProgress";
import { useToast } from "../state/useToast";
import { Loader } from "../components/Loader";
import { PackCleared } from "../components/PackCleared";
import { EmptyState } from "../components/EmptyState";

export default function Practice() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<WordEntry[] | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const addPoints = useProgress((state) => state.addPoints);
  const markSeen = useProgress((state) => state.markSeen);
  const markUsed = useProgress((state) => state.markUsed);
  const seen = useProgress((state) => state.seen);
  const push = useToast((state) => state.push);

  useEffect(() => {
    let active = true;
    setEntries(null);
    setLabel(null);
    setError(null);
    setMissing(false);

    loadAllPacksSafe()
      .then(({ packs }) => {
        if (!active) return;
        const pack = packs.find((p) => p.id === id);
        if (!pack) {
          setMissing(true);
          setEntries([]);
          return;
        }
        setEntries(pack.entries);
        setLabel(pack.label);
      })
      .catch((e) => {
        if (!active) return;
        setError(String(e));
      });

    return () => {
      active = false;
    };
  }, [id]);

  const deck = useGameDeck(entries ?? []);
  const current = deck.current;

  const seenCount = useMemo(() => {
    if (!entries) {
      return 0;
    }
    return entries.filter((entry) => seen[entry.word]).length;
  }, [entries, seen]);

  const progressValue = entries ? entries.length - deck.left : 0;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!current) {
        return;
      }
      if (event.key === "1") {
        event.preventDefault();
        markUsed(current.word);
        addPoints(10);
        push("★ +10 — used it");
        deck.next();
      }
      if (event.key === "2") {
        event.preventDefault();
        markSeen(current.word);
        addPoints(5);
        push("★ +5 — learned it");
        deck.next();
      }
      if (event.key === "3") {
        event.preventDefault();
        push("→ skipped");
        deck.next();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, addPoints, markSeen, markUsed, deck, push]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <EmptyState
          title="Couldn’t load practice"
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

  if (entries === null) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <Loader label="Loading practice…" />
      </main>
    );
  }

  if (missing) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-4 text-center">
        <p className="text-lg font-semibold">We couldn’t find that pack.</p>
        <Link className="text-sm underline" to="/">
          Back home
        </Link>
      </main>
    );
  }

  if (!entries.length) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <PackCleared packId={id!} />
      </main>
    );
  }

  if (deck.left === 0 || !current) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <PackCleared packId={id!} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{label ?? "Practice"}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {seenCount} of {entries.length} words seen in this pack.
        </p>
        <ProgressBar value={progressValue} max={entries.length} />
      </header>

      <WordCard e={current} />

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            markUsed(current.word);
            addPoints(10);
            push("★ +10 — used it");
            deck.next();
          }}
        >
          I used it (1)
        </button>
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            markSeen(current.word);
            addPoints(5);
            push("★ +5 — learned it");
            deck.next();
          }}
        >
          I learned it (2)
        </button>
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            push("→ skipped");
            deck.next();
          }}
        >
          Skip (3)
        </button>
      </div>
    </main>
  );
}
