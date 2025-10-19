import React, { useState } from "react";
import BeatSpawner, { LessonMeta } from "@/components/BeatSpawner";
import BeatEditor, { BeatInsert } from "@/components/BeatEditor";

const demoLesson: LessonMeta = {
  id: "lesson-01",
  beats: ["reveal", "dialogue", "shift"],
  emoticonColor: {
    reveal: "#ffd166",
    dialogue: "#90caf9",
    shift: "#f48fb1",
  },
};

export default function BeatSandbox() {
  const [pendingInsert, setPendingInsert] = useState<BeatInsert | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <h2>Beat Spawner — Minimal Demo</h2>
      <BeatSpawner
        lesson={demoLesson}
        onInsert={(payload) => setPendingInsert(payload)}
      />
      <BeatEditor pendingInsert={pendingInsert} onConsumeInsert={() => setPendingInsert(null)} />
      <p style={{ opacity: 0.7, marginTop: 18 }}>
        <small>Open another lesson that lists new beats to unlock more buttons.</small>
      </p>
    </div>
  );
}

