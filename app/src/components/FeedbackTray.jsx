export default function FeedbackTray({
  feedback = null,
  result = null,
  submitting = false,
  canSubmit = true,
  onSubmit = null,
  onNext = null,
  onSkip = null,
  error = '',
  nextEnabled = false,
}) {
  const payload = feedback ?? result ?? null;
  const lines = [];

  if (payload?.score != null) {
    lines.push(`Score: ${Math.round(payload.score * 100)}%`);
  }

  const rubricEntries = Array.isArray(payload?.rubric) ? payload.rubric : [];
  if (rubricEntries.length) {
    lines.push('Rubric:');
    for (const entry of rubricEntries) {
      if (!entry) continue;
      if (typeof entry === 'string') {
        lines.push(`- ${entry}`);
      } else {
        const label = [entry.key, entry.ok != null ? (entry.ok ? '✓' : '✗') : null]
          .filter(Boolean)
          .join(' ');
        lines.push(`- ${label || JSON.stringify(entry)}`);
      }
    }
  }

  const hintSources = [];
  if (Array.isArray(payload?.nextHints)) hintSources.push(...payload.nextHints);
  if (Array.isArray(payload?.next)) hintSources.push(...payload.next);
  if (typeof payload?.next === 'string') hintSources.push(payload.next);
  if (typeof payload?.nextHint === 'string') hintSources.push(payload.nextHint);
  if (typeof payload?.fixSuggestion === 'string') hintSources.push(payload.fixSuggestion);
  const hints = hintSources
    .map((hint) => (hint == null ? '' : String(hint).trim()))
    .filter(Boolean);
  if (hints.length) {
    lines.push('Next:');
    for (const hint of hints) {
      lines.push(`- ${hint}`);
    }
  }

  const value = lines.join('\n');

  return (
    <div className="sigil-feedback-tray">
      <textarea
        className="feedback-box"
        readOnly
        rows={8}
        value={value}
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
            disabled={submitting || !nextEnabled}
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
