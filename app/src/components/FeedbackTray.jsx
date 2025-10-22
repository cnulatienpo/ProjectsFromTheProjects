export default function FeedbackTray({
  item: _item = null,
  answer = '',
  setAnswer: _setAnswer = null,
  result = null,
  onSubmit = null,
  onNext = null,
  onSkip = null,
  isLoading = false,
  error = '',
}) {
  const summaryLines = [];
  if (result) {
    if (result.score != null) {
      const percent = Number.isFinite(result.score) ? Math.round(result.score * 100) : result.score;
      summaryLines.push(`score: ${percent}%`);
    }
    if (Array.isArray(result.rubric) && result.rubric.length) {
      summaryLines.push(`rubric: ${result.rubric.join(' | ')}`);
    }
    if (result.details?.message) {
      summaryLines.push(`note: ${result.details.message}`);
    }
    if (result.fixSuggestion) {
      summaryLines.push(`fix: ${result.fixSuggestion}`);
    }
    if (Array.isArray(result.nextHints) && result.nextHints.length) {
      result.nextHints.forEach((hint, index) => {
        summaryLines.push(`hint ${index + 1}: ${hint}`);
      });
    }
    if (result.details?.expAward != null) {
      summaryLines.push(`exp earned: ${result.details.expAward}`);
    }
  }

  const value = summaryLines.join('\n');

  const hasAnswer = (() => {
    if (answer == null) return false;
    if (typeof answer === 'string') return Boolean(answer.trim());
    if (typeof answer === 'object') return Object.keys(answer).length > 0;
    if (Array.isArray(answer)) return answer.length > 0;
    return Boolean(answer);
  })();

  const showLevelUp = Boolean(result?.memo);
  const badges = Array.isArray(result?.badges) ? result.badges.filter(Boolean) : [];

  return (
    <div className="sigil-feedback-tray">
      <textarea
        className="feedback-box"
        readOnly
        rows={10}
        value={value}
        placeholder="Submit to see feedback."
      />

      {showLevelUp ? (
        <div className="level-up-panel" style={{ marginTop: 12, padding: 12, border: '1px solid #000', background: '#ffe9cf' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Level Up! Level {result.level ?? '—'}</div>
          {badges.length ? (
            <div style={{ marginBottom: 8 }}>
              {badges.map((badge) => (
                <span
                  key={badge}
                  style={{
                    display: 'inline-block',
                    border: '1px solid #000',
                    padding: '2px 6px',
                    marginRight: 6,
                    marginBottom: 6,
                    background: '#fff',
                    fontSize: 12,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
          <div style={{ fontWeight: 600 }}>{result.memo?.title}</div>
          {result.memo?.body ? (
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{result.memo.body}</pre>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="feedback-error" role="alert" style={{ marginTop: 8 }}>
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
            disabled={isLoading || !hasAnswer}
          >
            {isLoading ? 'Submitting…' : 'Submit & Grade'}
          </button>
        ) : null}
        {onNext && result ? (
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
