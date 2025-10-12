import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GameRoot from "./pages/GameRoot"; // adjust path if needed

export default function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<GameRoot />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </HashRouter>
    );
}

export function Home() {
    return (
        <div style={{ padding: 32 }}>
            <h1>Welcome to Literary Deviousness</h1>
            <a href="#/game" style={{ fontSize: 20, color: "#06c" }}>Play the Game</a>
        </div>
    );
}
