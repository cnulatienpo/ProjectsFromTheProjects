import { SigilSyntaxHeader } from '@sigil'

export default function GameRoot() {
    return (
        <div>
            <SigilSyntaxHeader />
            <div style={{ padding: 8, fontSize: 14 }}>Loaded: Sigil_&_Syntax ✅</div>
            {/* ...rest of your game UI... */}
        </div>
    )
}

fetch('https://your-api-host/api/game')
// or use your api-shim for static mode
