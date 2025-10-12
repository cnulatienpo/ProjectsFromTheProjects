import { Link } from 'react-router-dom';
import type { Pack } from '../types';

interface PackListProps {
  packs: Pack[];
}

export function PackList({ packs }: PackListProps) {
  if (!packs.length) {
    return <p className="text-brand/70">No packs found yet. Add some JSON files to get started.</p>;
  }

  return (
    <div className="space-y-6">
      {packs.map((pack) => (
        <div
          key={pack.id}
          className="flex flex-col gap-3 rounded-xl border border-brand/10 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-brand">{pack.label}</h2>
            <p className="text-sm text-brand/70">{pack.entries.length} words</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/pack/${pack.id}`}
              className="rounded-full border border-brand/20 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/5"
            >
              View deck
            </Link>
            <Link
              to={`/play/${pack.id}`}
              className="rounded-full bg-brand-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-accent/90"
            >
              Play
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PackList;
