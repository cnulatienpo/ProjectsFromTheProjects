import { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";

import { loadSaves, type FunhouseSaveEntry } from "@/utils/funhouseStorage";
import { formatTimeAgo } from "@/utils/timeAgo";

function truncate(text: string, maxLength = 100): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export default function FunhousePast(): JSX.Element {
  const [saves, setSaves] = useState<FunhouseSaveEntry[]>([]);

  useEffect(() => {
    setSaves(
      loadSaves()
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
    );
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-400">
            Archive Access
          </p>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
            🗄️ Past Mischief
          </h1>
          <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Your saved Funhouse disasters live here. Flip through them like a cursed museum and replay any
            challenge when inspiration strikes again.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/funhouse"
            className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide shadow-[4px_4px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 hover:-rotate-1 hover:bg-yellow-200 hover:text-black"
          >
            ← Back to Funhouse
          </Link>
          <Link to="/funhouse" className="hidden" aria-hidden>
            Funhouse
          </Link>
        </div>
      </header>

      {saves.length === 0 ? (
        <section className="rounded-3xl border-4 border-dashed border-neutral-400 bg-white/80 p-10 text-center shadow-[8px_8px_0_rgba(0,0,0,0.15)] dark:border-neutral-600 dark:bg-neutral-900/70">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">No chaos preserved yet.</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Play a Funhouse prompt, write your most spectacular mess, and smash the save button to build your exhibit.
          </p>
          <Link
            to="/funhouse"
            className="mt-6 inline-flex items-center justify-center rounded-full border-2 border-black bg-black px-5 py-2 text-sm font-semibold uppercase tracking-widest text-white shadow-[4px_4px_0_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5 hover:bg-white hover:text-black"
          >
            Start a new disaster
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2">
          {saves.map((save) => (
            <Link
              key={`${save.id}-${save.timestamp}`}
              to={`/funhouse/replay/${save.id}?at=${save.timestamp}`}
              className="group flex h-full flex-col gap-3 rounded-3xl border-4 border-black bg-neutral-50 p-6 shadow-[8px_8px_0_rgba(0,0,0,0.75)] transition hover:-translate-y-1 hover:rotate-1 hover:bg-gradient-to-br hover:from-neutral-100 hover:via-white hover:to-purple-200"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-neutral-900 group-hover:text-black">
                  {save.title} – <span className="text-purple-700 group-hover:text-purple-900">{save.variant}</span>
                </h3>
                <p className="text-sm text-neutral-600 group-hover:text-neutral-700">
                  {truncate(save.text, 100)}
                </p>
              </div>
              <p className="mt-auto text-xs uppercase tracking-[0.3em] text-neutral-500 group-hover:text-neutral-700">
                {formatTimeAgo(save.timestamp)}
              </p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
