import React, { useState, useEffect } from 'react';
import { useAttempt } from '../hooks/useAttempt.js';
import BeatPalette from '../components/BeatPalette.jsx';
import EditorWithBeatSpawner from '../components/EditorWithBeatSpawner.jsx';
import FeedbackTray from '../components/FeedbackTray.jsx';
import HighlightablePassage from '../components/HighlightablePassage.jsx';
import LevelUpScreen from '../components/LevelUpScreen.jsx';

export default function GameDemo() {
    const { current, loadNext, submit, result, isLoading } = useAttempt("name", "demo-user");
    const [userText, setUserText] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState("");

    useEffect(() => {
        const loadWithDebug = async () => {
            try {
                setDebugInfo("Loading next item...");
                const item = await loadNext();
                setDebugInfo(`Loaded item: ${item?.id || 'undefined'}`);
            } catch (err) {
                setError(`Failed to load: ${err.message}`);
                setDebugInfo(`Error: ${err.message}`);
            }
        };
        loadWithDebug();
    }, []);

    const testAPI = async () => {
        try {
            setDebugInfo("Testing API...");
            const response = await fetch('/api/next?userId=test');
            const data = await response.json();
            setDebugInfo(`API Test: ${JSON.stringify(data).slice(0, 100)}`);
        } catch (err) {
            setError(`API test failed: ${err.message}`);
        }
    };

    useEffect(() => {
        loadNext();
    }, []);

    const handleSubmit = async () => {
        if (!current) return;

        // Extract beats from user text (simple regex for [BEAT] patterns)
        const beatMatches = userText.match(/\[([^\]]+)\]/g) || [];
        const sigils = beatMatches.map(match => match.slice(1, -1).toLowerCase());

        await submit(current.id, {
            sigils,
            text: userText,
            rationale: "Testing the new system"
        });
    };

    const handleNext = () => {
        setUserText("");
        setNotes("");
        loadNext();
    };

    if (!current) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">🎮 New Game System Demo</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                <p>Loading practice item...</p>
                <div className="text-sm text-gray-600 mb-4">Debug: {debugInfo}</div>
                <button onClick={loadNext} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded mr-2">
                    Load Next Item
                </button>
                <button onClick={testAPI} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
                    Test API Direct
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🎮 New Game System Demo</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Practice Item */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Practice Item: {current.id}</h2>
                        <p className="text-sm text-gray-600 mb-2">Mode: {current.mode}</p>

                        {current.passage && (
                            <div className="mb-4">
                                <h3 className="font-medium mb-2">Passage:</h3>
                                <HighlightablePassage
                                    text={current.passage}
                                    spans={result?.spans}
                                />
                            </div>
                        )}

                        {current.options && (
                            <div className="mb-4">
                                <h3 className="font-medium mb-2">Options:</h3>
                                {current.options.map(opt => (
                                    <div key={opt.id} className="p-2 border rounded mb-2">
                                        <strong>{opt.id}:</strong> {opt.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Beat Palette */}
                    <div>
                        <h3 className="font-medium mb-2">🎨 Beat Palette (Click to insert):</h3>
                        <BeatPalette onPick={(beat) => {
                            const token = `[${beat.toUpperCase()}]`;
                            setUserText(userText + token);
                        }} />
                    </div>
                </div>

                {/* Right Side: User Input & Results */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium mb-2">✍️ Your Response:</h3>
                        <EditorWithBeatSpawner
                            value={userText}
                            onChange={setUserText}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !userText.trim()}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                        {isLoading ? "Grading..." : "Submit & Grade"}
                    </button>

                    {/* Results */}
                    {result && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-2">📊 Grading Results:</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <strong>Score:</strong> {Math.round(result.score * 100)}%
                                    </div>
                                    <div>
                                        <strong>Mode:</strong> {result.mode}
                                    </div>
                                    <div className="col-span-2">
                                        <strong>Rubric:</strong> {result.rubric.join(", ")}
                                    </div>
                                    {result.next && (
                                        <div className="col-span-2">
                                            <strong>Hint:</strong> {result.next}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Level Up Screen */}
                            {result.leveledUp && (
                                <LevelUpScreen
                                    level={result.level || 1}
                                    badges={result.badges}
                                />
                            )}

                            {/* Enhanced Feedback */}
                            <FeedbackTray
                                result={result}
                                notes={notes}
                                onChangeNotes={setNotes}
                                onNext={handleNext}
                                onRetry={() => {
                                    setUserText("");
                                    setNotes("");
                                }}
                            />
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 bg-gray-600 text-white rounded"
                        >
                            Next Item
                        </button>
                        <button
                            onClick={() => {
                                setUserText("");
                                setNotes("");
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Debug Info */}
            <details className="mt-8 p-4 bg-gray-100 rounded">
                <summary className="cursor-pointer font-medium">🔍 Debug Info (click to expand)</summary>
                <pre className="mt-2 text-xs overflow-auto">
                    <strong>Current Item:</strong> {JSON.stringify(current, null, 2)}
                    {result && (
                        <>
                            <br /><br /><strong>Latest Result:</strong> {JSON.stringify(result, null, 2)}
                        </>
                    )}
                </pre>
            </details>
        </div>
    );
}
