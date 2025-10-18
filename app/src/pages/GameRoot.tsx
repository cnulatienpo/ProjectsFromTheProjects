import SigilSyntaxHeader from '@sigil/Header'

export default function GameRoot() {
    return (
        <div>
            <SigilSyntaxHeader />
            <div style={{ padding: 8, fontSize: 14 }}>Loaded: Sigil_&_Syntax ✅</div>
            {/* ...rest of your game UI... */}
        </div>
    )
}

// (Use the api() helper or relative paths for backend calls)
