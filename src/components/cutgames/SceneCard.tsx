import { PracticeItem } from "../../lib/cutGamesClient";
export default function SceneCard({ item }:{ item:PracticeItem }) {
  return (
    <div className="card" data-testid="scene-card">
      <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px"}}>
        {item.beat && <span className="chip">{item.beat}</span>}
        {item.pitfall && <span className="chip">{item.pitfall}</span>}
        <span style={{marginLeft:"auto", opacity:.6, fontSize:12}}>#{item.id}</span>
      </div>
      <div className="scene">{item.scene}</div>
    </div>
  );
}
