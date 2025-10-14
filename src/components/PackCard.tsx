import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import type { WordEntry } from "@/utils/validateAndNormalize";
import { useProgress } from "../state/useProgress";
import { ProgressBar } from "./ProgressBar";

type PackCardProps = {
  id: string;
  label: string;
  entries: WordEntry[];
  allEntries: WordEntry[];
};

export function PackCard({ id, label, entries, allEntries }: PackCardProps) {
  const seen = useProgress((state) => state.seen);
  const matches = entries.length;
  const seenCount = useMemo(() => entries.filter((entry) => seen[entry.word]).length, [entries, seen]);
  const totalSeen = useMemo(() => allEntries.filter((entry) => seen[entry.word]).length, [allEntries, seen]);

  const isSigilSyntax = label.trim() === "Sigil & Syntax";

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {isSigilSyntax ? (
              <a
                href="#/sigil-syntax"
                data-game="original"
                onClick={() => console.info("[sigil&syntax] click → #/sigil-syntax")}
              >
                {label}
              </a>
            ) : (
              label
            )}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {matches} {matches === 1 ? "word" : "words"}
            {matches !== allEntries.length && ` · ${allEntries.length} total`}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">{seenCount} seen in this view</p>
        </div>
        <ProgressBar value={totalSeen} max={Math.max(allEntries.length, 1)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/pack/${id}`}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          View pack
        </Link>
        <Link
          to={`/practice/${id}`}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          Practice
        </Link>
        <Link
          to={`/play/${id}/see`}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          See &amp; Use
        </Link>
        <Link
          to={`/play/${id}/mcq`}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Spot the Nuance
        </Link>
        <Link
          to={`/play/${id}/slot`}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          One-Arm Lexicon
        </Link>
      </div>
    </article>
  );
}

export default PackCard;
