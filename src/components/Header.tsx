import { Link, NavLink } from 'react-router-dom';
import { useGameStore } from '../state/useGameStore';

export function Header() {
  const points = useGameStore((state) => state.points);

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex flex-col">
          <span className="font-display text-xl font-semibold text-brand">The Good Word</span>
          <span className="text-sm text-brand/70">Words, but exact.</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-3 py-1 transition-colors ${
                isActive ? 'bg-brand-accent text-white' : 'text-brand hover:bg-brand/5'
              }`
            }
          >
            Home
          </NavLink>
          <span className="rounded-full bg-brand/90 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
            {points} pts
          </span>
        </nav>
      </div>
    </header>
  );
}

export default Header;
