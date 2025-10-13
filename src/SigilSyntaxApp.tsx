import React from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import {
    CutGames,
    CutGamesPlay,
    Dictionary,
    Foundation,
    Home,
    Play,
    PlayMCQ,
    PlaySee,
    PlaySlot,
    SigilSyntaxRoot,
} from "./pages";

export default function SigilSyntaxApp() {
    return (
        <div className="bg-brand-soft min-h-screen">
            <HashRouter>
                {/* simple top nav so everything is discoverable */}
                <nav style={{ padding: 12, borderBottom: "2px solid #000" }}>
                    <Link to="/">Home</Link> {" | "}
                    <Link to="/cutgames">Cut Game</Link> {" | "}
                    <Link to="/foundation">Foundation</Link> {" | "}
                    <Link to="/dictionary">Dictionary</Link> {" | "}
                    <Link to="/play">Play</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* Cut Game */}
                    <Route path="/cutgames" element={<CutGames />} />
                    <Route path="/cutgames/play" element={<CutGamesPlay />} />

                    {/* Foundation + Dictionary */}
                    <Route path="/foundation" element={<Foundation />} />
                    <Route path="/dictionary" element={<Dictionary />} />

                    {/* Word games */}
                    <Route path="/play" element={<Play />} />
                    <Route path="/play/:id" element={<PlaySee />} />
                    <Route path="/play/:id/see" element={<PlaySee />} />
                    <Route path="/play/:id/mcq" element={<PlayMCQ />} />
                    <Route path="/play/:id/slot" element={<PlaySlot />} />

                    {/* Generic container if you want nested stuff later */}
                    <Route path="/game" element={<SigilSyntaxRoot />} />

                    {/* Fallback */}
                    <Route path="*" element={<Home />} />
                </Routes>
            </HashRouter>
        </div>
    );
}
