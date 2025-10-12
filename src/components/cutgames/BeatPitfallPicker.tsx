import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { CatalogBeat, fetchBeats } from "../../lib/cutGamesClient";

type BeatRow = { beat: string; total: number };

type Props = {
  beat?: string;
  pitfall?: string;
  pitfallDisabled?: boolean;
  introductionCount?: number;
  initialBeats?: CatalogBeat[];
  onChange: (next: { beat?: string; pitfall?: string }) => void;
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const formatKey = (value: string) =>
  value
    .split(/[_-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const normalizeBeats = (rows?: CatalogBeat[] | BeatRow[] | null): BeatRow[] => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({ beat: row.beat, total: row.total ?? 0 }))
    .filter((row) => Boolean(row.beat))
    .sort((a, b) => b.total - a.total);
};

export default function BeatPitfallPicker({
  beat,
  pitfall,
  pitfallDisabled = false,
  introductionCount,
  initialBeats,
  onChange,
}: Props) {
  const [beatsIndex, setBeatsIndex] = useState<BeatRow[]>(() => normalizeBeats(initialBeats));

  useEffect(() => {
    if (!initialBeats || initialBeats.length === 0) return;
    setBeatsIndex(normalizeBeats(initialBeats));
  }, [initialBeats]);

  useEffect(() => {
    if (initialBeats && initialBeats.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const beatsResponse = await fetchBeats();
        if (cancelled) return;
        setBeatsIndex(normalizeBeats(beatsResponse));
      } catch (error) {
        if (!cancelled) setBeatsIndex([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialBeats]);

  const topBeats = useMemo(() => beatsIndex.slice(0, 40), [beatsIndex]);

  return (
    <div className="card space-y-4" data-testid="cutgames-beat-pitfall-picker">
      <h2 className="text-neutral-100">Optional filters</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-200">Beat</label>
          <div
            className="flex max-h-40 flex-wrap gap-2 overflow-auto rounded-xl border border-neutral-800 p-1"
            data-testid="cutgames-beat-choices"
          >
            <button
              type="button"
              className={clsx("chip transition", !beat && "is-on")}
              onClick={() => onChange({ beat: undefined, pitfall })}
              data-testid="cutgames-beat-any"
            >
              Any beat
            </button>
            {topBeats.map((entry) => {
              const isActive = beat === entry.beat;
              return (
                <button
                  key={entry.beat}
                  type="button"
                  className={clsx("chip transition", isActive && "is-on")}
                  onClick={() =>
                    onChange({ beat: isActive ? undefined : entry.beat, pitfall })
                  }
                  data-testid={`cutgames-beat-${slugify(entry.beat)}`}
                  title={`${entry.total} scenes`}
                >
                  {formatKey(entry.beat)}
                </button>
              );
            })}
          </div>
          {beat && (
            <p className="text-xs text-neutral-400" data-testid="cutgames-intro-count">
              {introductionCount && introductionCount > 0
                ? `${introductionCount} introductions available for this beat`
                : "No introductions recorded for this beat yet"}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-200" htmlFor="cutgames-pitfall-input">
            Pitfall (bad mode)
          </label>
          <input
            id="cutgames-pitfall-input"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none disabled:cursor-not-allowed disabled:text-neutral-500"
            placeholder="e.g., info_dump, floaty_dialogue"
            value={pitfall ?? ""}
            onChange={(event) =>
              onChange({ beat, pitfall: event.target.value ? event.target.value.toLowerCase().replace(/\s+/g, "_") : undefined })
            }
            disabled={pitfallDisabled}
            data-testid="cutgames-pitfall-input"
          />
          {pitfallDisabled && (
            <p className="text-xs text-neutral-500">Pitfalls apply to bad-mode drills only.</p>
          )}
        </div>
      </div>
    </div>
  );
}
