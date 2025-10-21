export default function FeedbackTray({
  feedback = null,
  result = null,
  submitting = false,
  canSubmit = false,
  onSubmit = null,
  onNext = null,
  onSkip = null,
  error = '',
}) {
  const payload = feedback ?? result ?? null;
  const value = [
    payload?.score != null ? `Score: ${Math.round(payload.score * 100)}%` : '',
    Array.isArray(payload?.rubric) && payload.rubric.length
      ? `Rubric: ${payload.rubric
          .map((r) =>
            typeof r === 'string' ? r : `${r.key}${r.ok ? '✓' : '✗'}`,
          )
          .join(', ')}`
      : '',
    payload?.details?.message ? `Note: ${payload.details.message}` : '',
    payload?.fixSuggestion ? `Suggestion: ${payload.fixSuggestion}` : '',
    Array.isArray(payload?.nextHints) && payload.nextHints.length
      ? `Next: ${payload.nextHints.join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="sigil-feedback-tray">
      <textarea
        className="feedback-box"
        readOnly
        rows={8}
        value={value}
        placeholder="Submit to see feedback."
      />

      {error ? (
        <div className="feedback-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sigil-actions" style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {onSubmit ? (
          <button
            type="button"
            data-testid="btn-submit"
            className="pfp-btn"
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        ) : null}
        {onNext ? (
          <button
            type="button"
            data-testid="btn-next"
            className="pfp-btn"
            onClick={onNext}
            disabled={submitting}
          >
            Next
          </button>
        ) : null}
        {onSkip ? (
          <button
            type="button"
            data-testid="btn-skip"
            className="pfp-btn"
            onClick={onSkip}
            disabled={submitting}
          >
            I don't feel like it
          </button>
        ) : null}
      </div>
    </div>
  );
}
