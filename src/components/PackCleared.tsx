import { Link } from "react-router-dom";

export function PackCleared({ packId }: { packId: string }) {
  return (
    <section className="rounded-2xl border p-6 text-center shadow-sm">
      <div className="mb-2 text-3xl" aria-hidden="true">
        🎉
      </div>
      <h2 className="text-lg font-semibold">Pack cleared!</h2>
      <p className="mt-1 text-sm text-neutral-600">You’ve seen all cards in this pack.</p>
      <div className="mt-3 flex justify-center gap-2">
        <Link
          to={`/pack/${packId}`}
          className="rounded-md border px-3 py-2 underline focus:outline-none focus:ring"
        >
          Back to Pack
        </Link>
        <Link to="/" className="rounded-md border px-3 py-2 underline focus:outline-none focus:ring">
          Home
        </Link>
      </div>
    </section>
  );
}
