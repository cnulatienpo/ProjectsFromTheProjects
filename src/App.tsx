import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { CutGames, CutGamesPlay, Deck, GameRoot, Home, Play } from "./pages";

export default function App() {
    return (
        <div className="bg-brand-soft min-h-screen">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<GameRoot />}>
                        <Route index element={<Home />} />
                        <Route path="play" element={<Play />} />
                        <Route path="cutgames" element={<CutGames />} />
                        <Route path="cutgames/play" element={<CutGamesPlay />} />
                        <Route path="deck" element={<Deck />} />
                    </Route>
                </Routes>
            </HashRouter>
        </div>
    );
}
