type ResultsScreenProps = {
  score: number;
  notes: string[];
  summary: { completed: number; skipped: number };
  payload: { mode?: string; beat?: string; pitfall?: string; [key: string]: unknown };
  onRestart: () => void;
};

export default function ResultsScreen({
  score,
  notes,
  summary,
  payload,
  onRestart,
}: ResultsScreenProps) {
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  return (
    <div className="space-y-4" data-testid="results-screen">
      <div className="card">
        <h2 className="mb-1">Round Results</h2>
        <div className="text-sm text-neutral-400">Mode: {payload?.mode}{payload?.beat ? ` · beat: ${payload.beat}`:""}{payload?.pitfall ? ` · pitfall: ${payload.pitfall}`:""}</div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card"><div className="text-neutral-400 text-sm">Score</div><div className="text-3xl font-bold">{score}</div></div>
          <div className="card"><div className="text-neutral-400 text-sm">Grade</div><div className="text-3xl font-bold">{grade}</div></div>
          <div className="card"><div className="text-neutral-400 text-sm">Done / Skipped</div><div className="text-3xl font-bold">{summary.completed} / {summary.skipped}</div></div>
        </div>
      </div>

      {/* Professor Ray Ray letter */}
      <div className="card">
        <h2 className="mb-3">Letter from Professor Ray Ray</h2>
        <div className="space-y-2">
          <p><em>“Surprise, scholar.”</em> You did the thing. Whether you swung like a wrecking ball or stitched like a surgeon, you kept the page alive. Points if you noticed the trap beats trying to mug your attention.</p>
          <p>Here’s the clean breakdown:</p>
          <ul className="list-disc pl-6">
            {notes?.length ? notes.map((note, index) => <li key={index}>{note}</li>) : <li>No major flags this round.</li>}
          </ul>
          <p className="text-neutral-400 text-sm">Style Report appears only on this results screen. Keep cooking.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={onRestart} data-testid="btn-restart">Play another round</button>
      </div>
    </div>
  );
}
