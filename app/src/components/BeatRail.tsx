import React from 'react';
import './beat-rail.css';
import { useBeatUnlocks } from '../state/useBeatUnlocks';

type RailProps = {
    emoticonMap?: Record<string, string>;
    colorMap?: Record<string, string>;
    onInsert?: (payload: { type: string; color: string }) => void;
};

function pickColor(type: string, colorMap?: Record<string, string>): string {
    if (colorMap && colorMap[type]) return colorMap[type];
    // simple stable fallback based on type
    let h = 0; for (let i = 0; i < type.length; i++) h = (h * 31 + type.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `hsl(${hue} 70% 70%)`;
}

export default function BeatRail({ emoticonMap, colorMap, onInsert }: RailProps) {
    const { getUnlockedBeats } = useBeatUnlocks();
    const beats = getUnlockedBeats?.() || []; // [{id:string, label?:string}] or [string]

    if (!beats.length) return null;

    const twoCols = beats.length > 12; // switch to two columns when many
    return (
        <aside className={`beat-rail ${twoCols ? 'two' : 'one'}`} aria-label="Beat rail">
            <div className="rail-grid" role="list">
                {beats.map((b: any) => {
                    const type = typeof b === 'string' ? b : (b.id || b.type || '');
                    if (!type) return null;
                    const emoji = (emoticonMap && emoticonMap[type]) || '•';
                    const color = pickColor(type, colorMap);
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
