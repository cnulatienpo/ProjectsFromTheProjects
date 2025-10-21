// app/src/components/FeedbackTray.jsx
export default function FeedbackTray({
    text = "",
    minWords = 30,
    memo = [],
    onSubmit,
    onRetry,
    onNext,
    onSkip,
    submitting = false,
    error = null,
    showingFeedback = false,
    result = null,
    notes = "",
    onChangeNotes = null,
    children = null
}) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length || 0
    const canSubmit = words >= (minWords || 30)

    // Build auto feedback from result if available
    const auto = result ? [
        result?.score != null ? `Score: ${(result.score * 100).toFixed(0)}%` : "",
        result?.rubric?.length ? `Rubric: ${result.rubric.join(", ")}` : "",
        result?.details?.message ?? "",
        result?.fixSuggestion ? `Suggestion: ${result.fixSuggestion}` : "",
        result?.next ? `Next hint: ${result.next}` : "",
    ]
        .filter(Boolean)
        .join("\n") : ""

    return (
        <div data-debug="FeedbackTray-EDITED-v2" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '0', fontSize: '10px', color: 'red', background: 'yellow', padding: '2px' }}>
                EDITED-v2
            </div>
            {/* optional memo lines already rendered above as "ray ray says:"; keep this light */}
            {Array.isArray(memo) && memo.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {memo.map((m, i) => <li key={i}>{String(m)}</li>)}
                </ul>
            )}

            {error && (
                <div className="feedback-error" style={{ color: '#b54708', marginTop: 8 }}>{String(error)}</div>
            )}

            {/* Show feedback details after submission */}
            {showingFeedback && (
                <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 6, background: '#f9f9f9' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Submission Results:</div>
                    {/* Word count intentionally hidden to avoid duplicated UI responsibility. */}
                </div>
            )}

            {/* Enhanced feedback textarea for game mode results */}
            {result && (
                <div style={{ marginTop: 16 }}>
                    <label className="text-sm font-medium">Detailed Feedback</label>
                    <textarea
                        className="w-full min-h-[200px] rounded-xl border p-2 mt-2"
                        value={notes}
                        onChange={(e) => onChangeNotes?.(e.target.value)}
                        placeholder=""
                    />
                    {children}
                </div>
            )}

            <div className="pfp-actions" style={{ marginTop: 12 }}>
                {/* Show Submit button only if not showing feedback */}
                {!showingFeedback && onSubmit && (
                    <button
                        type="button"
                        className="pfp-btn"
                        disabled={!canSubmit || submitting}
                        onClick={(e) => {
                            e.preventDefault();
                            console.log('Submit button clicked');
                            onSubmit?.(e);
                        }}
                    >
                        {submitting ? 'Submitting…' : 'Submit'}
                    </button>
                )}

                {/* Try Again button */}
                <button
                    type="button"
                    className="pfp-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        onRetry?.(e);
                    }}
                    disabled={submitting}
                >
                    {showingFeedback ? 'Revise' : 'Try again'}
                </button>

                {/* Next button - show after feedback or if explicitly provided */}
                {(showingFeedback || onNext) && (
                    <button
                        type="button"
                        className="pfp-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            onNext?.(e);
                        }}
                        disabled={submitting}
                    >
                        Next Lesson
                    </button>
                )}

                {/* Skip button */}
                <button
                    type="button"
                    className="pfp-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        onSkip?.(e);
                    }}
                    disabled={submitting}
                >
                    {showingFeedback ? 'Skip to Next' : 'I don\'t feel like it'}
                </button>
            </div>
        </div>
    )
}
