import React, { useState } from "react";
import "../styles/brutalist.css";
import "../styles/theme/theme.css";

const sampleWords = [
    { word: "Sagacious", meaning: "wise; having keen perception" },
    { word: "Ebullient", meaning: "overflowing with enthusiasm" },
    { word: "Peregrinate", meaning: "to travel or wander around" },
];

export default function GoodWord() {
    const [current, setCurrent] = useState(0);

    function nextWord() {
        setCurrent((c) => (c + 1) % sampleWords.length);
    }

    return (
        <div className="brutalist-root" style={{ padding: "2rem", maxWidth: 600, margin: "2rem auto" }}>
            <h1 className="font-extrabold text-3xl text-center mb-8">
                The Good Word: Dictionary Game
            </h1>
            <div className="bg-neutral-900 text-white rounded-xl shadow-lg p-8 mb-6 text-xl font-semibold text-center">
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{sampleWords[current].word}</div>
                <div style={{ fontSize: "1.1rem", marginTop: "1rem" }}>{sampleWords[current].meaning}</div>
            </div>
            <button
                className="bg-neutral-800 text-white px-6 py-2 rounded hover:bg-neutral-700 transition"
                onClick={nextWord}
            >
                Next Word
            </button>
        </div>
    );
}
