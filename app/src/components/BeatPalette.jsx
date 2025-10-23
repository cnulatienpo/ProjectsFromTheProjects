import { BEATS } from '@/shared/beatPalette.js'

export default function BeatPalette({
  beats = [],
  unlocks = [],
  onPick = null,
  onInsert = null,
  compact = false,
  vertical = false
}) {
  const btnStyle = {
    padding: compact ? '4px 8px' : '6px 10px',
    border:'1px solid #222',
    background:'#fff',
    fontSize: compact ? 11 : 12,
    cursor:'pointer',
    lineHeight: 1.1
  }
  const wrapStyle = vertical
    ? { display:'flex', flexDirection:'column', gap:6 }
    : { display:'flex', gap:8, flexWrap:'wrap' }
  const palette = Array.isArray(beats) && beats.length ? beats : BEATS
  const unlockSet = Array.isArray(unlocks) && unlocks.length
    ? new Set(unlocks.map(value => String(value).toLowerCase()))
    : null

  function handlePick(beat) {
    const payload = typeof beat === 'string'
      ? beat
      : (beat.text || beat.label || beat.id || beat.key || '')
    if (onPick) onPick(payload, beat)
    if (onInsert && payload) onInsert(payload)
  }

  return (
    <div style={{ ...wrapStyle, border:'1px dashed #888', padding:8, background:'#fafafa' }}>
      {palette.map((beat) => {
        const key = String(beat?.id ?? beat?.key ?? beat)
        const enabled = !unlockSet || unlockSet.has(key.toLowerCase())
        return (
          <button
            key={key}
            onClick={() => enabled && handlePick(beat)}
            title={typeof beat === 'string' ? beat : (beat.text || beat.label || key)}
            style={{
              ...btnStyle,
              opacity: enabled ? 1 : 0.4,
              cursor: enabled ? btnStyle.cursor : 'not-allowed'
            }}
            disabled={!enabled}
          >
            {typeof beat === 'string' ? beat : (beat.label || beat.text || key)}
          </button>
        )
      })}
    </div>
  )
}
