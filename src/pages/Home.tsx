import { useEffect, useState } from 'react';
import { loadAllPacks } from '../data/loadPacks';
import { PackList } from '../components/PackList';
import type { Pack } from '../types';
import { useGameStore } from '../state/useGameStore';

export function Home() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const points = useGameStore((state) => state.points);

  useEffect(() => {
    loadAllPacks().then((data) => {
      setPacks(data);
      setLoading(false);
    });
  }, []);

  const totalWords = packs.reduce((sum, pack) => sum + pack.entries.length, 0);

  return (
    <main aria-labelledby="home-heading">
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 id="home-heading" className="text-3xl font-semibold text-brand">
            Welcome back!
          </h1>
          <p className="text-brand/70">
            Choose a pack to browse the deck or jump straight into practice. Points persist, so keep your streak going.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-brand/10 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-brand/70">Total words</p>
            <p className="text-2xl font-semibold text-brand">{totalWords}</p>
          </div>
          <div>
            <p className="text-sm text-brand/70">Current points</p>
            <p className="text-2xl font-semibold text-brand">{points}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-brand/70">Loading packs…</p>
        ) : (
          <PackList packs={packs} />
        )}
      </section>
    </main>
  );
}

export default Home;
