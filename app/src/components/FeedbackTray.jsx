export default function FeedbackTray({
  item: _item = null,
  answer: _answer = '',
  setAnswer: _setAnswer = null,
  result = null,
  onSubmit = null,
  onNext = null,
  onSkip = null,
  isLoading = false,
  error = '',
}) {
  const lines = [];
  if (result) {
    if (result.score != null) {
      lines.push(`Score: ${Math.round(result.score * 100)}%`);
    }
    if (Array.isArray(result.rubric) && result.rubric.length) {
      lines.push(`Rubric: ${result.rubric.join(', ')}`);
    }
    if (result.details?.message) {
      lines.push(`Message: ${result.details.message}`);
    }
    if (result.fixSuggestion) {
      lines.push(`Suggestion: ${result.fixSuggestion}`);
    }
    if (Array.isArray(result.nextHints) && result.nextHints.length) {
      for (const hint of result.nextHints) {
        lines.push(`Hint: ${hint}`);
      }
    }
    if (result.leveledUp && result.level) {
      lines.push(`Level Up! Level ${result.level}`);
    }
    if (result.memo?.title) {
      lines.push(`${result.memo.title}`);
    }
    if (result.memo?.body) {
      lines.push(result.memo.body);
    }
  }

  const value = lines.join('\n\n');

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
            disabled={isLoading}
          >
            {isLoading ? 'Submitting…' : 'Submit & Grade'}
          </button>
        ) : null}
        {onNext ? (
          <button
            type="button"
            data-testid="btn-next"
            className="pfp-btn"
            onClick={onNext}
            disabled={isLoading}
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
            disabled={isLoading}
          >
            I don't feel like it
          </button>
        ) : null}
      </div>
    </div>
  );
}
