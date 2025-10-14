import { useEffect, useState } from "react";
import { fetchBeats } from "../../lib/cutGamesClient";

export default function BeatPitfallPicker({
  beat, pitfall, onChange,
}:{ beat?:string; pitfall?:string; onChange:(v:{beat?:string; pitfall?:string})=>void }) {
  const [beatsIndex, setBeatsIndex] = useState<{beat:string; total:number}[]>([]);
  useEffect(()=>{ (async()=>{
    try {
      const raw = await fetchBeats();
      const entries = Array.isArray(raw) ? raw : Object.entries(raw?.beats ?? raw ?? {}).map(([k,v]:any)=>({beat:k, total:Number(v)||0}));
      entries.sort((a,b)=> b.total-a.total);
      setBeatsIndex(entries);
    } catch {}
  })(); }, []);

  return (
    <div className="card" data-testid="beat-pitfall-picker">
      <h2 className="mb-3">Optional filters</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2">Beat</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto p-1" style={{border:"1px solid #242428", borderRadius:"12px"}}>
            {beatsIndex.slice(0,40).map(b=>(
              <button key={b.beat}
                className={`chip ${beat===b.beat?"is-on":""}`}
                onClick={()=>onChange({ beat: beat===b.beat ? undefined : b.beat, pitfall })} title={`${b.total} items`}>
                {b.beat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm mb-2">Pitfall (bad mode)</label>
          <input className="w-full" style={{background:"#121215", border:"1px solid #242428", borderRadius:"12px", padding:".5rem .75rem"}}
            placeholder="e.g., info_dump, floaty_dialogue"
            value={pitfall||""}
            onChange={e=>onChange({ beat, pitfall: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  );
}
