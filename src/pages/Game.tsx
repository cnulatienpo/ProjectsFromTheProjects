import React from "react";
import { Link } from "react-router-dom";

export default function Game() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Choose Your Game
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link
                    to="/game"
                    className="block bg-white border-2 border-black rounded-lg shadow hover:bg-neutral-100 transition p-6 text-center"
                >
                    <div className="font-bold text-lg mb-2">Sygil & Symbol</div>
                    <div className="text-sm mb-4">Fiction writing basics.</div>
                    <span className="inline-block px-4 py-2 bg-black text-white rounded">Go to Game</span>
                </Link>
                <Link
                    to="/play/pack-01"
                    className="block bg-white border-2 border-black rounded-lg shadow hover:bg-neutral-100 transition p-6 text-center"
                >
                    <div className="font-bold text-lg mb-2">The Good Word</div>
                    <div className="text-sm mb-4">Learn more words.</div>
                    <span className="inline-block px-4 py-2 bg-black text-white rounded">Go to Game</span>
                </Link>
                <Link
                    to="/play/cut-games"
                    className="block bg-white border-2 border-black rounded-lg shadow hover:bg-neutral-100 transition p-6 text-center"
                >
                    <div className="font-bold text-lg mb-2">The Cut Games</div>
                    <div className="text-sm mb-4">Editing, but fun.</div>
                    <span className="inline-block px-4 py-2 bg-black text-white rounded">Go to Game</span>
                </Link>
            </div>
        </div>
    );
}
