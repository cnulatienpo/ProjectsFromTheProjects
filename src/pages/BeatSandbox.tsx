import React from "react";
import BeatSpawner, { LessonMeta } from "@/components/BeatSpawner";
import BeatWritingBox from "@/components/BeatWritingBox";

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
  return (
    <div style={{ padding: 24 }}>
      <h2>Beat Rail — Minimal Demo</h2>
      {/* Keep the existing spawner mounted (no UI), just to perform unlock on lesson open */}
      <BeatSpawner
        lesson={demoLesson}
        onInsert={() => {}}
      />
      <BeatWritingBox lesson={demoLesson} />
      <p style={{ opacity: 0.7, marginTop: 18 }}>
        <small>Open another lesson that lists new beats to unlock more buttons.</small>
      </p>
    </div>
  );
}

