import React, { useState } from 'react';

export default function SimpleApiTest() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testDirect = async () => {
        setLoading(true);
        setError(null);
        try {
            // Test the direct Codespaces URL
            const response = await fetch('https://animated-carnival-v4g77qwxgvv3p5p5-3002.app.github.dev/api/next?userId=test');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const testProxy = async () => {
        setLoading(true);
        setError(null);
        try {
            // Test through Vite proxy
            const response = await fetch('/api/next?userId=test');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">🧪 API Connection Test</h1>

            <div className="space-y-4">
                <button
                    onClick={testDirect}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Test Direct API
                </button>

                <button
                    onClick={testProxy}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                    Test Proxied API
                </button>
            </div>

            {loading && <p className="mt-4">Loading...</p>}

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    <strong>Success!</strong>
                    <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            <div className="mt-8 text-sm text-gray-600">
                <p><strong>Direct URL:</strong> https://animated-carnival-v4g77qwxgvv3p5p5-3002.app.github.dev/api/next</p>
                <p><strong>Proxy URL:</strong> /api/next</p>
            </div>
        </div>
    );
}
