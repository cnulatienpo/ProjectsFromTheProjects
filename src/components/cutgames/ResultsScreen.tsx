export default function ResultsScreen({
  score, notes, summary, payload, onRestart
}:{ score:number; notes:string[]; summary:{completed:number; skipped:number}; payload:any; onRestart:()=>void }) {
  const grade = score>=90?"A":score>=80?"B":score>=70?"C":score>=60?"D":"F";
  return (
    <div className="space-y-4" data-testid="results-screen">
      <div className="card">
        <h2 className="mb-1">Round Results</h2>
        <div className="text-sm" style={{opacity:.65}}>
          Mode: {payload?.mode}{payload?.beat?` · beat: ${payload.beat}`:""}{payload?.pitfall?` · pitfall: ${payload.pitfall}`:""}
        </div>
        <div className="grid" style={{gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginTop:"12px"}}>
          <div className="card"><div style={{opacity:.65, fontSize:12}}>Score</div><div style={{fontSize:"1.75rem", fontWeight:800}}>{score}</div></div>
          <div className="card"><div style={{opacity:.65, fontSize:12}}>Grade</div><div style={{fontSize:"1.75rem", fontWeight:800}}>{grade}</div></div>
          <div className="card"><div style={{opacity:.65, fontSize:12}}>Done / Skipped</div><div style={{fontSize:"1.75rem", fontWeight:800}}>{summary.completed} / {summary.skipped}</div></div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3">Letter from Professor Ray Ray</h2>
        <div className="space-y-2">
          <p><em>“Surprise, scholar.”</em> You kept the page alive. Nice. The traps tried to mug you; you kept walking.</p>
          <p>Here’s the clean breakdown:</p>
          <ul className="list-disc" style={{paddingLeft:"1.25rem"}}>
            {notes?.length ? notes.map((n,i)=><li key={i}>{n}</li>) : <li>No major flags this round.</li>}
          </ul>
          <p style={{opacity:.65, fontSize:12}}>The Style Report only appears here, on the results screen.</p>
        </div>
      </div>

      <div style={{display:"flex", gap:"8px"}}>
        <button className="btn btn-primary" onClick={onRestart} data-testid="btn-restart">Play another round</button>
      </div>
    </div>
  );
}
