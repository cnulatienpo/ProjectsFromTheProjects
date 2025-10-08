import { Link } from 'react-router-dom'

export default function GameIntro() {
    return (
        <div className="game-intro">
            <div className="card">
                <h1>Literary Deviousness</h1>
                <p>
                    Do you not know shit about writing or you suck at it? Me too. I made these games to learn
                    grammar, character, narrative structure, and of course — the literary devices. You write,
                    you read, you get feedback. It’s a lot like an interactive textbook on creative writing.
                    If you know how to write already you will probably get bored. Thanks for playing.
                </p>
                <Link to="/game/start" className="start-link">Start</Link>
            </div>
        </div>
    )
}
