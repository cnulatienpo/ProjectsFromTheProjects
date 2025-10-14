import { useRef, useState, type ChangeEvent } from "react";
import { useProgress } from "../state/useProgress";
import { useToast } from "../state/useToast";
import { useFirstRun } from "../state/useFirstRun";
import { serializeProgress, ProgressExportSchema, readJSONFile, downloadJSON } from "../utils/progressIO";

export default function Settings() {
  const { points, seen, used, resetProgress } = useProgress();
  const set = useProgress.setState;
  const push = useToast((state) => state.push);
  const resetWelcome = useFirstRun((state) => state.resetWelcome);

  const seenCount = Object.keys(seen).length;
  const usedCount = Object.keys(used).length;

  function onExport() {
    const data = serializeProgress({ points, seen, used });
    const date = new Date().toISOString().slice(0, 10);
    downloadJSON(`the-good-word-progress-${date}.json`, data);
    push("⬇️ Exported progress");
  }

  const fileRef = useRef<HTMLInputElement>(null);
  const [replaceAll, setReplaceAll] = useState(false);

  async function onImportFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      if (f.size > 1_000_000) throw new Error("File too large.");
      const raw = await readJSONFile(f);
      const parsed = ProgressExportSchema.parse(raw);

      if (replaceAll) {
        const nextSeen: Record<string, true> = Object.fromEntries(parsed.seenKeys.map((k) => [k, true]));
        const nextUsed: Record<string, true> = Object.fromEntries(parsed.usedKeys.map((k) => [k, true]));
        set({ points: parsed.points, seen: nextSeen, used: nextUsed });
        push("✅ Imported (replaced)");
      } else {
        const curr = useProgress.getState();
        const mergedSeen: Record<string, true> = { ...curr.seen };
        const mergedUsed: Record<string, true> = { ...curr.used };
        for (const k of parsed.seenKeys) mergedSeen[k] = true;
        for (const k of parsed.usedKeys) {
          mergedUsed[k] = true;
          mergedSeen[k] = true;
        }
        const nextPoints = Math.max(curr.points, parsed.points);
        set({ points: nextPoints, seen: mergedSeen, used: mergedUsed });
        push("✅ Imported (merged)");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Import failed. Make sure it’s a valid progress export.";
      push("❌ Import failed");
      alert(message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function triggerFile() {
    fileRef.current?.click();
  }

  function confirmReset() {
    const ok = window.confirm("Reset points and history? This cannot be undone.");
    if (ok) {
      resetProgress();
      push("🧹 Progress reset");
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="rounded-2xl border p-4 shadow-sm space-y-1">
        <p className="text-sm text-neutral-700">Points: {points}</p>
        <p className="text-sm text-neutral-700">Seen: {seenCount}</p>
        <p className="text-sm text-neutral-700">Used: {usedCount}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            className="rounded-md border px-4 py-2 underline focus:outline-none focus:ring"
            onClick={confirmReset}
          >
            Reset progress
          </button>
          <button
            className="rounded-md border px-4 py-2 underline focus:outline-none focus:ring"
            onClick={() => {
              resetWelcome();
              alert("Welcome screen will show next time.");
            }}
          >
            Reset welcome
          </button>
        </div>
      </section>

      <section className="rounded-2xl border p-4 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Backup</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border px-4 py-2 underline focus:outline-none focus:ring"
            onClick={onExport}
          >
            Export progress (.json)
          </button>
          <button
            className="rounded-md border px-4 py-2 underline focus:outline-none focus:ring"
            onClick={triggerFile}
          >
            Import progress (.json)
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-black"
            checked={replaceAll}
            onChange={(e) => setReplaceAll(e.target.checked)}
          />
          Replace instead of merge
        </label>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
        <p className="text-xs text-neutral-500">
          Export includes points, seen, and used words. Import will {replaceAll ? <b>replace</b> : <b>merge</b>} your current
          progress. Max file size 1MB.
        </p>
      </section>
    </main>
  );
}
