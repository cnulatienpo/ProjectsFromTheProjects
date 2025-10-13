import { useEffect, useState } from "react";
import "../styles/cutgames.css";
import ModePicker from "../components/cutgames/ModePicker";
import BeatPitfallPicker from "../components/cutgames/BeatPitfallPicker";
import RoundEngine from "../components/cutgames/RoundEngine";
import ResultsScreen from "../components/cutgames/ResultsScreen";

type ModeName = "Name"|"Missing"|"Fix"|"Order"|"Highlight"|"Why";

export default function CutGamesPlay() {
  const [mode, setMode] = useState<ModeName>("Name");
  const [beat, setBeat] = useState<string|undefined>();
  const [pitfall, setPitfall] = useState<string|undefined>();
  const [roundKey, setRoundKey] = useState(0);
  const [phase, setPhase] = useState<"select"|"play"|"results">("select");
  const [results, setResults] = useState<{score:number; notes:string[]; id:string; summary:any; payload:any} | null>(null);

  useEffect(()=> {
    const onKey = (e:KeyboardEvent)=>{ if (e.key.toLowerCase()==="r" && phase==="select") startRound(); };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, [phase]);

  function startRound(){
    setPhase("play"); setResults(null); setRoundKey(k=>k+1);
  }
  function onDone(r:any){ setResults(r); setPhase("results"); }

  return (
    <div className="cut-shell" data-testid="cut-games-root">
      <div className="cut-container space-y-4">
        <header style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <h1 className="text-2xl font-bold">Cut Games</h1>
          <div className="text-sm" style={{opacity:.65}}>Projects From The Projects</div>
        </header>

        {phase==="select" && (
          <>
            <ModePicker value={mode} onChange={(m)=>setMode(m as ModeName)} />
            <BeatPitfallPicker beat={beat} pitfall={pitfall} onChange={(v)=>{ setBeat(v.beat); setPitfall(v.pitfall); }} />
            <div style={{display:"flex", gap:"8px"}}>
              <button className="btn btn-primary" onClick={startRound} data-testid="btn-start">Start Round</button>
              <button className="btn btn-ghost" onClick={()=>{ setBeat(undefined); setPitfall(undefined); }}>Clear</button>
            </div>
            <div className="text-xs" style={{opacity:.65}}>Pro-tip: press <span className="kbd">R</span> to start.</div>
          </>
        )}

        {phase==="play" && (
          <RoundEngine key={roundKey} modeName={mode} beat={beat} pitfall={pitfall} onDone={onDone} />
        )}

        {phase==="results" && results && (
          <ResultsScreen score={results.score} notes={results.notes} summary={results.summary} payload={results.payload} onRestart={()=>setPhase("select")} />
        )}
      </div>
    </div>
  );
}
