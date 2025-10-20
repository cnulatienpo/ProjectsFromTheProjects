import React from 'react';
import './beat-rail.css';
import { useBeatUnlocks } from '../state/useBeatUnlocks';

function pickColor(type, colorMap) {
    if (colorMap && colorMap[type]) return colorMap[type];
    // simple stable fallback based on type
    let h = 0; for (let i = 0; i < type.length; i++) h = (h * 31 + type.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `hsl(${hue} 70% 70%)`;
}

export default function BeatRail({ emoticonMap, colorMap, onInsert }) {
    const { getUnlocked } = useBeatUnlocks();
    const lesson = { id: 'lesson-71' }; // Default lesson for testing
    const unlocked = getUnlocked(lesson.id);
    const beats = unlocked?.beats || [];

    // If no beats are unlocked, show some default ones for testing
    const defaultBeats = beats.length > 0 ? beats : ['action', 'dialogue', 'description', 'emotion'];

    if (!defaultBeats.length) return null; const twoCols = defaultBeats.length > 12; // switch to two columns when many
    return (
        <aside className={`beat-rail ${twoCols ? 'two' : 'one'}`} aria-label="Beat rail">
            <div className="rail-grid" role="list">
                {defaultBeats.map((b) => {
                    const type = typeof b === 'string' ? b : (b.id || b.type || '');
                    if (!type) return null;
                    const emoji = (emoticonMap && emoticonMap[type]) || '•';
                    // Use colors from unlocked data first, then colorMap, then pickColor fallback
                    const color = unlocked?.colors?.[type] || pickColor(type, colorMap);
                    return (
                        <button
                            key={type}
                            className="rail-btn"
                            style={{ background: color }}
                            title={type}
                            role="listitem"
                            onClick={(e) => {
                                e.preventDefault();
                                onInsert?.({ type, color });
                            }}
                        >
                            <span className="emoji">{emoji}</span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
