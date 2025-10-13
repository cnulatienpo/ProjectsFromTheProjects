import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../state/useTheme";
import PointsChip from "./PointsChip";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-full px-3 py-1 text-sm font-medium transition",
    isActive
      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
      : "text-neutral-700 hover:bg-neutral-200/70 dark:text-neutral-200 dark:hover:bg-neutral-800",
  ].join(" ");
}

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex flex-col">
          <span className="text-lg font-semibold">The Good Word</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Words, but exact.</span>
        </Link>
        <nav className="flex items-center gap-3">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/practice" className={navClass}>
            Practice
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            Settings
          </NavLink>
          <button
            type="button"
            className="text-sm underline-offset-4 transition hover:underline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Toggle theme (now ${theme})`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <PointsChip />
        </nav>
      </div>
    </header>
  );
}

export default Header;
