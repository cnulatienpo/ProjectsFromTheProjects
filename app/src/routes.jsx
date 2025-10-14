import React from "react";
import Home from "./pages/Home.jsx";
import { GameRunner } from "@sigil";
import NotesPanel from "./pages/NotesPanel.jsx";
import ResultsScreen from "./pages/ResultsScreen.jsx";
import Health from "./pages/Health.jsx";
import CutGame from "./pages/CutGame.jsx";
import GoodWord from "./pages/GoodWord.jsx";
import SigilSyntax from "./pages/SigilSyntax.jsx";

export default [
    { path: "/", element: <Home /> },
    { path: "/game", element: <GameRunner /> },
    { path: "/notes", element: <NotesPanel /> },
    { path: "/results", element: <ResultsScreen /> },
    { path: "/health", element: <Health /> },
    { path: "/cut/:id", element: <CutGame /> },
    { path: "/goodword/:id", element: <GoodWord /> },
    { path: "/sigil", element: <SigilSyntax /> },
    { path: "/sigil/:id", element: <SigilSyntax /> }
];
