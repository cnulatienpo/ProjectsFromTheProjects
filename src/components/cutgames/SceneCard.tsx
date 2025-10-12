// src/components/cutgames/SceneCard.tsx
import { PracticeItem } from "../../lib/cutGamesClient";

export default function SceneCard({ item }: { item: PracticeItem }) {
  return (
    <div className="card" data-testid="scene-card">
      <div className="flex items-center gap-2 mb-3">
        {item.beat && <span className="chip">{item.beat}</span>}
        {item.pitfall && <span className="chip">{item.pitfall}</span>}
        <span className="text-xs text-neutral-500 ml-auto">#{item.id}</span>
      </div>
      <div className="scene">{item.scene}</div>
    </div>
  );
}
