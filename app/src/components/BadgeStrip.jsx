export default function BadgeStrip({ badges = [] }) {
    if (!badges.length) return null
    return (
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {badges.map(b => (
                <span key={b.id} className="tag">
                    🏅 {b.title}
                </span>
            ))}
        </div>
    )
}
