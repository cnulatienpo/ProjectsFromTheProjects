import React from "react";

export default function LogicNavButtons({
    canNext,
    onNext,
    onRetry,
    onQueue,
    onSkip,
    isLoading,
}) {
    return (
        <div className="flex gap-2">
            <button type="button" className="rounded px-3 py-2 border" onClick={onRetry}>
                Retry
            </button>
            <button type="button" className="rounded px-3 py-2 border" onClick={onQueue}>
                Queue Drill
            </button>
            <button type="button" className="rounded px-3 py-2 border" onClick={onSkip}>
                I don't feel like it
            </button>
            <button
                type="button"
                className="rounded px-3 py-2 bg-black text-white disabled:opacity-40"
                disabled={!canNext || !!isLoading}
                onClick={onNext}
            >
                Next
            </button>
        </div>
    );
}
