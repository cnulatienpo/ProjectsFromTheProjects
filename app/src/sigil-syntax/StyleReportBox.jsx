const surfaceStyle = {
    marginTop: 12,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(14,24,44,0.85)',
    color: '#f7f9ff',
    boxShadow: '0 8px 18px rgba(0,0,0,0.2)'
}

const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    background: 'rgba(80,140,255,0.18)',
    color: '#bcd5ff',
    border: '1px solid rgba(120,170,255,0.4)'
}

export default function StyleReportBox({ report }) {
    if (!report) return null

    const score = typeof report.score === 'number' ? report.score : Number(report.score)
    const pct = Number.isFinite(score) ? Math.round(Math.max(0, Math.min(1, score)) * 100) : null
    const words = Number.isFinite(Number(report.words)) ? Number(report.words) : null
    const sentences = Number.isFinite(Number(report.sentences)) ? Number(report.sentences) : null
    const adverbs = Number.isFinite(Number(report.adverbs)) ? Number(report.adverbs) : null
    const passive = Number.isFinite(Number(report.passiveHints)) ? Number(report.passiveHints) : null
    const longSentences = Number.isFinite(Number(report.longSentences)) ? Number(report.longSentences) : null

    const notes = Array.isArray(report.notes)
        ? report.notes.filter(Boolean)
        : report.notes
            ? [String(report.notes)].filter(Boolean)
            : []

    const tags = Array.isArray(report.tags)
        ? report.tags.filter(Boolean).map(String)
        : []

    return (
        <aside style={surfaceStyle} aria-label="Sigil_&_Syntax style report">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.75 }}>Sigil_&_Syntax</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>Style Report</div>
                </div>
                {pct !== null && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>Style Score</div>
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{pct}<span style={{ fontSize: 16 }}>%</span></div>
                    </div>
                )}
            </div>

            <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, margin: '16px 0 0', padding: 0 }}>
                {words !== null && (
                    <div>
                        <dt style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Words</dt>
                        <dd style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{words}</dd>
                    </div>
                )}
                {sentences !== null && (
                    <div>
                        <dt style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Sentences</dt>
                        <dd style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{sentences}</dd>
                    </div>
                )}
                {adverbs !== null && (
                    <div>
                        <dt style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>-ly Adverbs</dt>
                        <dd style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{adverbs}</dd>
                    </div>
                )}
                {passive !== null && (
                    <div>
                        <dt style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Passive Hints</dt>
                        <dd style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{passive}</dd>
                    </div>
                )}
                {longSentences !== null && (
                    <div>
                        <dt style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Long Sentences</dt>
                        <dd style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{longSentences}</dd>
                    </div>
                )}
            </dl>

            <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Highlights</div>
                {notes.length ? (
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.5 }}>
                        {notes.map((line, idx) => (
                            <li key={idx}>{line}</li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ margin: 0, opacity: 0.8 }}>No specific notes—clean pass!</p>
                )}
            </div>

            {tags.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map(tag => (
                        <span key={tag} style={tagStyle}>#{tag}</span>
                    ))}
                </div>
            )}
        </aside>
    )
}
