import { useEffect, useState, type JSX } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSaveById, loadSaves, type FunhouseSaveEntry } from "@/utils/funhouseStorage";
import { formatTimeAgo } from "@/utils/timeAgo";

export default function FunhouseReplay(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [save, setSave] = useState<FunhouseSaveEntry | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const search = new URLSearchParams(location.search);
    const timestampParam = Number(search.get("at"));
    const saves = loadSaves();

    let match: FunhouseSaveEntry | undefined;

    if (!Number.isNaN(timestampParam)) {
      match = saves.find((entry) => entry.id === id && entry.timestamp === timestampParam);
    }

    if (!match) {
      match = getSaveById(id);
    }

    setSave(match ?? null);
  }, [id, location.search]);

  const handlePlayAgain = () => {
    if (!save) {
      return;
    }

    navigate(`/funhouse/${save.id}`, { state: { replayText: save.text } });
  };

  if (!save) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 text-center">
        <h1 className="text-3xl font-bold">Replay missing.</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          We couldn&apos;t find that saved entry. It may have been cleared from storage or never existed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/funhouse/past"
            className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-[4px_4px_0_rgba(0,0,0,0.75)] transition hover:-translate-y-0.5 hover:rotate-1 hover:bg-yellow-200 hover:text-black"
          >
            Explore Past Mischief
          </Link>
          <Link
            to="/funhouse"
            className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-[4px_4px_0_rgba(0,0,0,0.75)] transition hover:-translate-y-0.5 hover:-rotate-1 hover:bg-purple-200 hover:text-black"
          >
            Start a new game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-400">Replay Mode</p>
        <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-50">
          {save.title}
          <span className="ml-2 text-base font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-300">
            {save.variant}
          </span>
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Saved {formatTimeAgo(save.timestamp)}
        </p>
      </header>

      <Textarea
        value={save.text}
        readOnly
        className="min-h-[260px] w-full border-2 border-black bg-neutral-50 font-mono text-sm leading-relaxed shadow-[6px_6px_0_rgba(0,0,0,0.75)] dark:border-neutral-700 dark:bg-neutral-900"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/funhouse/past"
          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-[4px_4px_0_rgba(0,0,0,0.75)] transition hover:-translate-y-0.5 hover:-rotate-1 hover:bg-neutral-900 hover:text-white"
        >
          ← Back to Past Mischief
        </Link>
        <Button
          onClick={handlePlayAgain}
          className="bg-black text-white border-2 border-white px-6 py-2 text-base font-semibold uppercase tracking-[0.4em] shadow-[4px_4px_0_rgba(255,255,255,0.4)] transition hover:-translate-y-0.5 hover:bg-white hover:text-black"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
}
