export function NoResults({ query, reset }: { query: string; reset?: () => void }) {
  return (
    <div className="rounded-2xl border p-4 text-center">
      <p className="text-sm">
        <b>No results</b> for “{query}”.
      </p>
      {reset && (
        <button
          className="mt-2 rounded-md border px-3 py-1 underline focus:outline-none focus:ring"
          onClick={reset}
          aria-label="Clear search"
        >
          Clear search
        </button>
      )}
    </div>
  );
}
