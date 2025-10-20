import './beat-rail.css';
import { BEATS } from '@/shared/beatPalette.js'

export default function BeatPalette({ onInsert, compact = false, vertical = false }) {
  const btnStyle = {
    padding: compact ? '4px 8px' : '6px 10px',
    border: '1px solid #222',
    background: '#fff',
    fontSize: compact ? 11 : 12,
    cursor: 'pointer',
    lineHeight: 1.1
  }
  const wrapStyle = vertical
    ? { display: 'flex', flexDirection: 'column', gap: 6 }
    : { display: 'flex', gap: 8, flexWrap: 'wrap' }
  return (
    <div style={{ ...wrapStyle, border: '1px dashed #888', padding: 8, background: '#fafafa' }}>
      {BEATS.map(b => (
        <button key={b.key} onClick={() => onInsert(b.text)} title={b.text} style={btnStyle}>
          {b.label}
        </button>
      ))}
    </div>
  )
}
