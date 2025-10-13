import type { JSX } from "react";

export default function GamesHub(): JSX.Element {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Games</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Jump into an adventure.
        </p>
      </header>
      <nav className="flex flex-col gap-3 text-lg">
        <a className="text-blue-600 underline" href="#/sigil-syntax">
          Sigil &amp; Syntax (Original)
        </a>
        <a className="text-blue-600 underline" href="#/cutgames">
          The Cut Games
        </a>
      </nav>
    </section>
  );
}
