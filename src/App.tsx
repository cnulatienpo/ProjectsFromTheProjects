import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GameRoot from "./pages/GameRoot";

export default function App() {
    return (
        <div className="bg-brand-soft min-h-screen">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game" element={<GameRoot />} />
                    <Route path="/play" element={<div style={{ padding: 24 }}>Play Page</div>} />
                    <Route path="/cutgames" element={<div style={{ padding: 24 }}>Cut Games Page</div>} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </HashRouter>
        </div>
    );
}
