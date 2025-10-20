import React, { useEffect, useState } from "react";
import BeatEditor from "@/components/BeatEditor";
import BeatRail from "@/components/BeatRail";
import type { LessonMeta } from "@/components/BeatSpawner";
import { useBeatUnlocks } from "@/state/useBeatUnlocks";
import { beatsForLesson } from "@/logic/beatUnlockSchedule";

import "./beat-writing-box.css";

export default function BeatWritingBox({ lesson }: { lesson: LessonMeta }) {
  const [pendingInsert, setPendingInsert] = useState<null | { type: string; color: string; sourceLesson?: string }>(null);
  const { unlockBeats } = useBeatUnlocks();

  useEffect(() => {
    console.log('[BWB] mount', lesson?.id, lesson);
    const maybeNumber = (lesson as any)?.number;
    const n = typeof maybeNumber === 'number'
      ? maybeNumber
      : parseInt(String(lesson.id).match(/\d+/)?.[0] || '0', 10);

    // 1) cumulative scheduled unlocks
    const scheduled = beatsForLesson(n);

    // 2) any beats declared on the lesson object
    const declared = Array.isArray(lesson.beats) ? lesson.beats : [];

    const toUnlock = Array.from(new Set([...scheduled, ...declared].map((b) => String(b))));

    if (toUnlock.length) {
      console.log('[BWB] unlocking with', toUnlock, lesson.emoticonColor);
      unlockBeats(lesson.id, toUnlock, lesson.emoticonColor);
    }
    // only run on lesson id changes
  }, [lesson?.id]);

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
