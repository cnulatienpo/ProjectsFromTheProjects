import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFirstRun } from "../state/useFirstRun";
import { loadAllPacksSafe, type Pack } from "../data/loadAllPacksSafe";
import { Loader } from "../components/Loader";

export default function Welcome() {
  const navigate = useNavigate();
  const markSeen = useFirstRun((s) => s.markSeen);
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadAllPacksSafe()
      .then(({ packs: loaded }) => setPacks(loaded))
      .catch((e) => setError(String(e)));
  }, []);

  function pickAutoPack(available: Pack[]): Pack | null {
    if (!available.length) return null;
    return [...available].sort((a, b) => b.entries.length - a.entries.length)[0];
  }

  async function start() {
    if (!packs || !packs.length) return;
    setStarting(true);
    const selected = pickAutoPack(packs);
    if (!selected) {
      setStarting(false);
      return;
    }
    markSeen();
    navigate(`/practice/${selected.id}`);
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="mt-2 text-sm text-red-700">Couldn’t load packs: {error}</p>
        <Link className="text-sm underline" to="/">
          Try Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-6 py-8">
      <h1 className="text-3xl font-semibold">The Good Word</h1>
      <p className="text-neutral-700 dark:text-neutral-300">Words, but exact.</p>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-2 text-lg font-semibold">How it works</h2>
        <ol className="ml-5 list-decimal space-y-1 text-sm text-neutral-800 dark:text-neutral-200">
          <li>
            See a card: <b>WORD</b>, its origin story, and the literal meaning.
          </li>
          <li>
            Choose: <b>I used it</b> (+10), <b>I learned it</b> (+5), or <b>Skip</b> (0).
          </li>
          <li>Clear packs. Keep what matters. No fluff.</li>
        </ol>
      </section>

      <div className="text-sm text-neutral-600 dark:text-neutral-300">
        {packs === null ? <Loader label="Scanning packs…" /> : `${packs.length} pack(s) detected`}
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm underline transition hover:bg-neutral-100 focus:outline-none focus:ring disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={start}
          disabled={!packs || !packs.length || starting}
          aria-label="Start practicing now"
        >
          {starting ? "Starting…" : "Start"}
        </button>
        <Link
          to="/"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm underline transition hover:bg-neutral-100 focus:outline-none focus:ring dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={() => useFirstRun.getState().markSeen()}
        >
          Skip for now
        </Link>
      </div>

      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        Tip: You can reset this welcome screen in <Link className="underline" to="/settings">
          Settings
        </Link>
        .
      </p>
    </main>
  );
}
