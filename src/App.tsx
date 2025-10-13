import React from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import GameRoot from "./pages/GameRoot";
import CutGames from "./pages/CutGames";
import CutGamesPlay from "./pages/CutGamesPlay";
import Dictionary from "./pages/Dictionary";

export default function App() {
    return (
        <div className="bg-brand-soft min-h-screen">
            <HashRouter>
                {/* simple top nav so everything is discoverable */}
                <nav style={{ padding: 12, borderBottom: "2px solid #000" }}>
                    <Link to="/">Home</Link> {" | "}
                    <Link to="/cutgames">Cut Game</Link> {" | "}
                    <Link to="/game">Game</Link> {" | "}
                    <Link to="/dictionary">Dictionary</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* Cut Game */}
                    <Route path="/cutgames" element={<CutGames />} />
                    <Route path="/cutgames/play" element={<CutGamesPlay />} />

                    {/* Game (original) */}
                    <Route path="/game" element={<GameRoot />} />

                    {/* Dictionary */}
                    <Route path="/dictionary" element={<Dictionary />} />

                    {/* Fallback */}
                    <Route path="*" element={<Home />} />
                </Routes>
            </HashRouter>
        </div>
    );
}
