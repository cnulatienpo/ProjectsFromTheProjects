import React from "react";
import { useProgress } from "../state/useProgress";
import { useToast } from "../state/useToast";
import { useFirstRun } from "../state/useFirstRun";

export default function Settings() {
  const resetProgress = useProgress((state) => state.resetProgress);
  const push = useToast((state) => state.push);
  const resetWelcome = useFirstRun((state) => state.resetWelcome);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Fine-tune your study data.</p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-lg font-semibold">Progress</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Reset your points and seen/used markers. This cannot be undone.
        </p>
        <button
          type="button"
          className="mt-3 rounded-md border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            resetProgress();
            push("Progress reset");
          }}
        >
          Reset progress
        </button>
        <button
          type="button"
          className="mt-3 ml-2 rounded-md border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 focus:outline-none focus:ring dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => {
            resetWelcome();
            alert("Welcome screen will show next time.");
          }}
        >
          Reset welcome
        </button>
      </section>
    </main>
  );
}
