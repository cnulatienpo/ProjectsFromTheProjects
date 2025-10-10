export default function GameRoot() {
    return (
        <div>
            <div style={{ padding: 8, fontSize: 14 }}>Loaded: Literary Deviousness ✅</div>
            {/* ...rest of your game UI... */}
        </div>
    )
}

fetch('https://your-api-host/api/game')
// or use your api-shim for static mode
