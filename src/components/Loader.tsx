export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-10" role="status" aria-live="polite">
      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      <span className="text-sm text-neutral-700">{label}</span>
    </div>
  );
}
