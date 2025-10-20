import './beat-writing-box.css';
import BeatRail from './BeatRail';
import React, { useState } from 'react';

// Import the default emoticon mapping
const defaultBeatEmoticon = {
    action: "🔨",
    decision: "✅",
    desire: "❤️",
    conflict: "⚔️",
    obstacle: "🧱",
    climax: "⛰️",
    resolution: "🌅",
    reveal: "👁️",
    realization: "💡",
    exposition: "📜",
    foreshadow: "🌒",
    setup: "🎯",
    payoff: "🎉",
    emotion: "😭",
    suppression: "🤐",
    vulnerability: "🫀",
    power: "👑",
    shift: "🔄",
    intimacy: "🤝",
    alienation: "🪫",
    dialogue: "💬",
    nonverbal: "👀",
    interaction: "↔️",
    agreement: "✍️",
    disagreement: "❌",
    test: "🧪",
    reversal: "🔁",
    atmosphere: "🌫️",
    discovery: "🗺️",
    loss: "🕳️",
    arrival: "🚪",
    departure: "🛫",
    transition: "⏭️"
};

export default function BeatWritingBox({ lesson }) {
    const [pendingInsert, setPendingInsert] = useState(null);

    const handleBeatInsert = (beatData) => {
        console.log('Beat insert clicked:', beatData);
        setPendingInsert(beatData);
        // TODO: Insert colored box into text editor
    };

    return (
        <div className="beat-writing-wrap">
            <BeatRail
                emoticonMap={lesson?.emoticonMap || defaultBeatEmoticon}
                colorMap={lesson?.emoticonColor}
                onInsert={handleBeatInsert}
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
