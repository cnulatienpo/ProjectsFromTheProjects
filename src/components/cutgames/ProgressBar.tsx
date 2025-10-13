export default function ProgressBar({ total, index }:{ total:number; index:number }) {
  const pct = total ? Math.min(100, Math.round(((index+1)/total)*100)) : 0;
  return (
    <div className="progress-track" aria-label="round progress" data-testid="round-progress">
      <div className="progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
