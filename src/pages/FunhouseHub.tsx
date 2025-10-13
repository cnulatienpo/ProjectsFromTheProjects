import type { JSX } from "react";
import { Link } from "react-router-dom";

import { funhouseCatalog } from "@/games/fun_house_writing/funhouse_catalog";

export default function FunhouseHub(): JSX.Element {
  const routes = funhouseCatalog.map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">🎪 Welcome to the Funhouse</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Pick a remix to see the prompt and launch its custom interface.
        </p>
      </header>
      <ul className="space-y-4">
        {routes.map((route) => (
          <li
            key={route.id}
            className="rounded border border-neutral-200 p-4 shadow-sm transition hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-500"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{route.title}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {route.description}
                </p>
              </div>
              <Link
                to={`/funhouse/${route.id}`}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Play variant
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
