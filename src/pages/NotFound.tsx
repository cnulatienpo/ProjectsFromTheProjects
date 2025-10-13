import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl p-4 text-center">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">That page is lost at sea.</p>
      <Link className="mt-3 inline-block text-sm underline" to="/">
        Back home
      </Link>
    </main>
  );
}
