import React, { useEffect, useMemo, useState } from "react";
import { loadAllPacks } from "../data/loadAllPacksSafe";
import type { Pack } from "../data/loadAllPacksSafe";
import { useProgress } from "../state/useProgress";
import { PackCard } from "../components/PackCard";

export default function Home() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "entries" | "seen">("default");
  const seen = useProgress((state) => state.seen);

  useEffect(() => {
    let active = true;

    setLoading(true);
    void loadAllPacks()
      .then((loaded) => {
        if (!active) {
          return;
        }
        setPacks(loaded);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const packsShown = useMemo(() => {
    const list = [...packs];
    return list.sort((a, b) => {
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

  const filteredPacks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return packsShown.map((pack) => ({ pack, entries: pack.entries }));
    }
    return packsShown.map((pack) => ({
      pack,
      entries: pack.entries.filter((entry) => entry.word.toLowerCase().includes(normalized)),
    }));
  }, [packsShown, query]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Word packs</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Search across your packs and jump back into practice.
        </p>
      </header>

      <div className="mt-4 mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search words…"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="default">Sort: Default</option>
          <option value="entries">Sort: Most entries</option>
          <option value="seen">Sort: Most seen</option>
        </select>
      </div>

      {loading && <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading packs…</p>}
      {!loading && !packs.length && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Add JSON packs under <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">src/labeled-data</code> to get started.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {filteredPacks.map(({ pack, entries }) => (
          <PackCard key={pack.id} id={pack.id} label={pack.label} entries={entries} allEntries={pack.entries} />
        ))}
      </div>
    </main>
  );
}
