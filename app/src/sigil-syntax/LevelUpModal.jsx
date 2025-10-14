export default function LevelUpModal({ show, from, to, onClose }) {
    if (!show) return null
    return (
        <div className="modal-overlay">
            <div className="modal card">
                <h2>Level Up!</h2>
                <p>You went from Level {from} → <strong>{to}</strong></p>
                <button className="btn" onClick={onClose}>Nice</button>
            </div>
        </div>
    )
}
