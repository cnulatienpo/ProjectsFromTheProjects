import { useCallback, useEffect, useMemo, useState } from "react";
import { PracticeItem, RoundItemAnswer, fetchPractice, sendTelemetrySkip, submitRound } from "../../lib/cutGamesClient";
import SceneCard from "./SceneCard";
import ProgressBar from "./ProgressBar";

type Props = {
  modeName: "Name"|"Missing"|"Fix"|"Order"|"Highlight"|"Why";
  beat?: string; pitfall?: string;
  onDone: (r:{ score:number; notes:string[]; id:string; summary:any; payload:any })=>void;
};

const ITEMS_PER_ROUND = 5;

export default function RoundEngine({ modeName, beat, pitfall, onDone }:Props) {
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<RoundItemAnswer[]>([]);
  const [startedAt] = useState<string>(new Date().toISOString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const modeKind: "good"|"bad" = useMemo(()=> (pitfall ? "bad" : (["Fix"].includes(modeName) ? "bad" : "good")), [modeName, pitfall]);

  useEffect(()=>{ (async()=>{
    try {
      setLoading(true);
      const items = await fetchPractice({ mode: modeKind, beat, pitfall });
      setQueue(items.slice(0, ITEMS_PER_ROUND));
      setIdx(0); setAnswers([]); setAnswer(""); setError(undefined);
    } catch (e:any) { setError(e?.message || "Failed to load practice"); }
    finally { setLoading(false); }
  })(); }, [modeKind, beat, pitfall]);

  const current = queue[idx];
  const next = useCallback(()=>{ setAnswer(""); setIdx(i=>Math.min(i+1, queue.length)); }, [queue.length]);

  const onSkip = useCallback(async ()=>{
    if (!current) return;
    try { await sendTelemetrySkip(modeKind, { beat, pitfall }); } catch {}
    setAnswers(a=>[...a,{ itemId: current.id, mode: modeName, beat, pitfall, skipped:true }]);
    next();
  }, [current, next, modeName, modeKind, beat, pitfall]);

  const onComplete = useCallback(()=>{
    if (!current) return;
    setAnswers(a=>[...a,{ itemId: current.id, mode: modeName, beat, pitfall, skipped:false, answer:(answer||"").trim() }]);
    next();
  }, [current, modeName, beat, pitfall, answer, next]);

  useEffect(()=>{
    const onKey = (e:KeyboardEvent)=>{
      const k = e.key.toLowerCase();
      if (k==="s") onSkip();
      if (k==="c") onComplete();
      if (k==="n") next();
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, [onSkip, onComplete, next]);

  const finished = idx >= queue.length && queue.length>0;

  useEffect(()=>{ (async()=>{
    if (!finished) return;
    const payload = { mode: modeName, beat, pitfall, items: answers, startedAt, finishedAt: new Date().toISOString() };
    const res = await submitRound(payload);
    onDone({
      score: res.score,
      notes: res.rubric?.notes || [],
      id: res.id,
      summary: { completed: answers.filter(a=>!a.skipped).length, skipped: answers.filter(a=>a.skipped).length },
      payload,
    });
  })(); }, [finished]); // eslint-disable-line

  if (loading) return <div className="card">loading practice…</div>;
  if (error) return <div className="card" style={{color:"#ffb3b3"}}>{error}</div>;
  if (!queue.length) return <div className="card">no practice available</div>;
  if (finished) return <div className="card">scoring…</div>;

  return (
    <div className="space-y-4" data-testid="round-engine">
      <div className="card" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <span className="chip is-on">{modeName}</span>
          {beat && <span className="chip">beat: {beat}</span>}
          {pitfall && <span className="chip">pitfall: {pitfall}</span>}
        </div>
        <div className="text-xs" style={{opacity:.65, display:"flex", gap:"12px"}}>
          <span><span className="kbd">S</span> Skip</span>
          <span><span className="kbd">C</span> Complete</span>
          <span><span className="kbd">N</span> Next</span>
        </div>
      </div>

      <ProgressBar total={queue.length} index={idx} />
      {current && <SceneCard item={current} />}

      <div className="card">
        <label className="block text-sm mb-2">Your move</label>
        <textarea
          value={answer} onChange={e=>setAnswer(e.target.value)}
          placeholder={
            modeName==="Name" ? "Name the beat(s) present…" :
            modeName==="Missing" ? "What’s missing and why does it matter…" :
            modeName==="Fix" ? "Rewrite or prescribe a fix…" :
            modeName==="Order" ? "Describe correct order / sequence…" :
            modeName==="Highlight" ? "Quote/mark the beat text and label it…" :
            "Explain the purpose / effect of the beat…"
          }
          style={{width:"100%", minHeight:"10rem", background:"#121215", border:"1px solid #242428", borderRadius:"12px", padding:".5rem .75rem"}}
        />
        <div style={{display:"flex", gap:"8px", marginTop:"10px"}}>
          <button className="btn btn-ghost" onClick={onSkip} data-testid="btn-skip">Skip</button>
          <button className="btn btn-primary" onClick={onComplete} data-testid="btn-complete">Complete</button>
        </div>
      </div>
    </div>
  );
}
