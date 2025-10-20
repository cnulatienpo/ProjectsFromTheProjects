import './beat-writing-box.css';
import BeatRail from './BeatRail';
import React, { useState } from 'react';

export default function BeatWritingBox({ lesson }) {
    const [pendingInsert, setPendingInsert] = useState(null);

    return (
        <div className="beat-writing-wrap">
            <BeatRail
                emoticonMap={lesson?.emoticonMap}
                colorMap={lesson?.emoticonColor}
                onInsert={setPendingInsert}
            />
            <div className="beat-writing-box">
                <div style={{ fontSize: 11, color: '#666' }}>lesson: {lesson?.id || lesson?.number || 'unknown'}</div>
                {pendingInsert && (
                    <div style={{ fontSize: 10, color: '#090', marginTop: 4 }}>
                        Pending insert: {pendingInsert.type} ({pendingInsert.color})
                    </div>
                )}
            </div>
        </div>
    )
}
