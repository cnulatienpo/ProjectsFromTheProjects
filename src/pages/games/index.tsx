import type { JSX } from "react";
import { Link } from "react-router-dom";

export default function GamesHub(): JSX.Element {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Games</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Jump into an adventure.</p>
      </header>
      <nav className="flex flex-col gap-3 text-lg">
        <Link className="text-blue-600 underline" to="/games/goodword">
          The Good Word
        </Link>
        <Link className="text-blue-600 underline" to="/play/cut-games">
          The Cut Games
        </Link>
        <Link className="text-blue-600 underline" to="/funhouse">
          The Funhouse
        </Link>
      </nav>
    </section>
  );
}
