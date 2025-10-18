import { useEffect, useMemo, useState } from "react";
import { loadAllPacksSafe, type Pack } from "@/data/loadAllPacksSafe";
import { PackCard } from "@/components/PackCard";
import { Loader } from "@/components/Loader";
import { EmptyState } from "@/components/EmptyState";
import { NoResults } from "@/components/NoResults";
import { useProgress } from "@/state/useProgress";

export default function GoodWord() {
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "entries" | "seen">("default");
  const seen = useProgress((state) => state.seen);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const result = await loadAllPacksSafe?.();
        if (!alive) return;
        setPacks(result?.packs ?? []);
      } catch (e) {
        if (!alive) return;
        if (import.meta.env.DEV) {
          console.warn('[GoodWord] health check skipped in dev:', e);
          setPacks([]);
        } else {
          setError(String(e));
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <EmptyState
          title="Couldn’t load packs"
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

  if (packs === null) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <Loader />
      </main>
    );
  }

  if (!packs.length) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <EmptyState
          title="No packs found"
          note="Add JSON packs to /src/labeled-data and reload."
          emoji="📄"
        />
      </main>
    );
  }

  const packsShown = useMemo(() => {
    return [...packs].sort((a, b) => {
      if (sort === "entries") {
        return b.entries.length - a.entries.length;
      }
      if (sort === "seen") {
        const seenA = a.entries.reduce((count, entry) => count + (seen[entry.word] ? 1 : 0), 0);
        const seenB = b.entries.reduce((count, entry) => count + (seen[entry.word] ? 1 : 0), 0);
        return seenB - seenA;
      }
      return a.id.localeCompare(b.id);
    });
  }, [packs, sort, seen]);

  const normalized = query.trim().toLowerCase();
  const filtered = packsShown.map((pack) => {
    const entries = normalized
      ? pack.entries.filter((entry) => entry.word.toLowerCase().includes(normalized))
      : pack.entries;
    return { pack, entries };
  });

  const anyResults = filtered.some(({ entries }) => entries.length > 0);

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="mb-3 text-2xl font-semibold">Packs</h1>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search words…"
          className="w-full rounded-md border px-3 py-2 sm:max-w-sm"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
          className="rounded-md border px-3 py-2"
        >
          <option value="default">Sort: Default</option>
          <option value="entries">Sort: Most entries</option>
          <option value="seen">Sort: Most seen</option>
        </select>
      </div>

      {!anyResults ? (
        <NoResults query={query} reset={() => setQuery("")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered
            .filter(({ entries }) => entries.length > 0 || !query)
            .map(({ pack, entries }) => (
              <PackCard
                key={pack.id}
                id={pack.id}
                label={pack.label}
                entries={entries}
                allEntries={pack.entries}
              />
            ))}
        </div>
      )}
    </main>
  );
}
