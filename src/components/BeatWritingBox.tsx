import React, { useState } from "react";
import BeatEditor from "@/components/BeatEditor";
import BeatRail from "@/components/BeatRail";
import type { LessonMeta } from "@/components/BeatSpawner";

import "./beat-writing-box.css";

export default function BeatWritingBox({ lesson }: { lesson: LessonMeta }) {
  const [pendingInsert, setPendingInsert] = useState<null | { type: string; color: string; sourceLesson?: string }>(null);

  return (
    <div className="beat-writing-wrap">
      {/* The side rail attaches to the outside, top-left */}
      <BeatRail
        lessonId={lesson.id}
        emoticonColor={lesson.emoticonColor}
        emoticonMap={lesson.emoticonMap}
        onInsert={(payload) => setPendingInsert(payload)}
      />
      {/* The editor occupies the main area */}
      <div className="beat-writing-box">
        <BeatEditor
          pendingInsert={pendingInsert}
          onConsumeInsert={() => setPendingInsert(null)}
        />
      </div>
    </div>
  );
}
