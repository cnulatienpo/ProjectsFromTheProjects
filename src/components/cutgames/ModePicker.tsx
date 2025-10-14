import { useEffect, useState } from "react";
import { fetchCatalog } from "../../lib/cutGamesClient";

type Mode = { name:string; desc?:string };

export default function ModePicker({ value, onChange }:{ value?:string; onChange:(m:string)=>void }) {
  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const cat = await fetchCatalog();
      const ms = (cat?.modes ?? []).map((m:any)=>({ name:m.name, desc:m.desc }));
      setModes(ms.length ? ms : [
        { name:"Name", desc:"Identify beats by name" },
        { name:"Missing", desc:"Find what’s missing" },
        { name:"Fix", desc:"Repair weak writing" },
        { name:"Order", desc:"Arrange sequence" },
        { name:"Highlight", desc:"Mark beats in context" },
        { name:"Why", desc:"Explain purpose" },
      ]);
    } finally { setLoading(false); }
  })(); }, []);

  const selected = value || modes[0]?.name;
  return (
    <div className="card" data-testid="mode-picker">
      <h2 className="mb-3">Choose a mode</h2>
      {loading ? <div className="pulse">loading modes…</div> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {modes.map(m=>(
            <button key={m.name}
              className={`btn btn-ghost justify-start ${selected===m.name?"border-white":""}`}
              onClick={()=>onChange(m.name)} title={m.desc||""}>
              <span className="font-semibold mr-2">{m.name}</span>
              <span style={{opacity:.65}}>{m.desc}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 text-xs" style={{opacity:.65}}>
        <span className="kbd">R</span> start round
      </div>
    </div>
  );
}
