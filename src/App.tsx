import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Play from "./pages/Play";
import CutGames from "./pages/CutGames";
import CutGamesPlay from "./pages/CutGamesPlay";
import Deck from "./pages/Deck";

export default function App() {
    return (
        <div className="bg-brand-soft min-h-screen">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/game"
                        element={
                            <div style={{
                                padding: "2rem 0",
                                textAlign: "center"
                            }}>
                                <h1 style={{
                                    fontSize: "2.5rem",
                                    fontWeight: "bold",
                                    margin: "2rem 0"
                                }}>
                                    Literary Deviousness: Fiction Writing School For Broke Mutherfuckers.
                                </h1>
                                <Game />
                            </div>
                        }
                    />
                    <Route path="/cutgames" element={<CutGames />} />
                    <Route path="/cutgames/play" element={<CutGamesPlay />} />
                    <Route path="/dictionary" element={<Deck />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </HashRouter>
        </div>
    );
}
