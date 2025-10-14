export default function Home() {
    return (
        <div className="site">
            {/* SVG banner with distressed text + skyline */}
            <header className="banner">
                <svg viewBox="0 0 1200 420" className="banner-svg" aria-hidden="true">
                    <defs>
                        {/* “distressed” effect */}
                        <filter id="grunge" x="-20%" y="-20%" width="140%" height="140%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
                            <feColorMatrix type="saturate" values="0" />
                            <feComposite operator="in" in2="SourceGraphic" />
                            <feBlend in="SourceGraphic" mode="multiply" />
                        </filter>
                    </defs>

                    {/* Title */}
                    <g filter="url(#grunge)">
                        <text x="50%" y="42%" textAnchor="middle" className="title-text">
                            Projects From The Projects
                        </text>
                    </g>

                    {/* Simple skyline silhouette */}
                    <g className="skyline" filter="url(#grunge)">
                        <rect x="60" y="300" width="70" height="80" />
                        <rect x="150" y="250" width="90" height="130" />
                        <rect x="260" y="280" width="50" height="100" />
                        <rect x="330" y="230" width="85" height="150" />
                        <rect x="430" y="270" width="65" height="110" />
                        <rect x="520" y="210" width="40" height="170" />
                        <rect x="580" y="190" width="60" height="190" />
                        <rect x="660" y="260" width="75" height="120" />
                        <rect x="755" y="240" width="95" height="140" />
                        <rect x="870" y="280" width="60" height="100" />
                        <rect x="950" y="255" width="70" height="125" />
                        <rect x="1040" y="300" width="55" height="80" />
                    </g>
                </svg>
            </header>

            <main className="wrap">
                <h2 className="project-line">
                    <span className="black-strong">Project #1</span>&nbsp; Sigil_&_Syntax
                </h2>
                <p className="tagline black-strong">
                    Fiction Writing School for Broke Mutherfuckers.
                </p>

                <a className="tile" href="/game">
                    ▶︎ Play the game
                </a>
            </main>
        </div>
    )
}
