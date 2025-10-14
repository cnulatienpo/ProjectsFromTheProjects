import React from "react";
import Home from "./pages/Home.jsx";
import Game from "./pages/Game.jsx";
import NotesPanel from "./pages/NotesPanel.jsx";
import ResultsScreen from "./pages/ResultsScreen.jsx";
import Health from "./pages/Health.jsx";
import CutGame from "./pages/CutGame.jsx";
import GoodWord from "./pages/GoodWord.jsx";

export default [
    { path: "/", element: <Home /> },
    { path: "/game", element: <Game /> },
    { path: "/notes", element: <NotesPanel /> },
    { path: "/results", element: <ResultsScreen /> },
    { path: "/health", element: <Health /> },
    { path: "/cut/:id", element: <CutGame /> },
    { path: "/goodword/:id", element: <GoodWord /> }
];
