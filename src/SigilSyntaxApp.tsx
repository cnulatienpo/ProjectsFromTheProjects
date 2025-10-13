import React from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import SigilSyntaxRoot from "./pages/SigilSyntaxRoot";
import CutGames from "./pages/CutGames";
import CutGamesPlay from "./pages/CutGamesPlay";
import Foundation from "./pages/Foundation";
import Dictionary from "./pages/Dictionary";

export default function SigilSyntaxApp() {
    return (
        <div className="bg-brand-soft min-h-screen">
            <HashRouter>
                {/* simple top nav so everything is discoverable */}
                <nav style={{ padding: 12, borderBottom: "2px solid #000" }}>
                    <Link to="/">Home</Link> {" | "}
                    <Link to="/cutgames">Cut Game</Link> {" | "}
                    <Link to="/foundation">Foundation</Link> {" | "}
                    <Link to="/dictionary">Dictionary</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* Cut Game */}
                    <Route path="/cutgames" element={<CutGames />} />
                    <Route path="/cutgames/play" element={<CutGamesPlay />} />

                    {/* Foundation + Dictionary */}
                    <Route path="/foundation" element={<Foundation />} />
                    <Route path="/dictionary" element={<Dictionary />} />

                    {/* Generic container if you want nested stuff later */}
                    <Route path="/game" element={<SigilSyntaxRoot />} />

                    {/* Fallback */}
                    <Route path="*" element={<Home />} />
                </Routes>
            </HashRouter>
        </div>
    );
}
