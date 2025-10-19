import React from 'react'

export default function BeatPalette({ beats = [], vertical = false, compact = false, onInsert = () => { } }) {
    // simple default beats if none provided
    const defaultBeats = [
        'A sharp knock at the door.',
        'He hesitated, then reached.',
        'Something small snapped in the dark.'
    ]
    const items = beats.length ? beats : defaultBeats

    const containerStyle = {
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        gap: compact ? 6 : 12,
        alignItems: vertical ? 'stretch' : 'flex-start',
        maxHeight: vertical ? '60vh' : 'auto',
        overflowY: vertical ? 'auto' : 'visible'
    }

    const chipStyle = {
        padding: compact ? '6px 8px' : '10px 12px',
        border: '1px solid #ccc',
        borderRadius: 6,
        background: '#fafafa',
        cursor: 'pointer',
        fontSize: compact ? 12 : 14,
        lineHeight: 1.2
    }

    return (
        <div style={containerStyle}>
            {items.map((b, i) => (
                <div key={i} style={chipStyle} onClick={() => onInsert(b)} title="Insert beat">
                    {b}
                </div>
            ))}
        </div>
    )
}
