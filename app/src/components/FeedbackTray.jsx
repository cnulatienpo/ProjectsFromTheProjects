import React from 'react';

/**
 * FeedbackTray
 * - Prints grading feedback into a read-only textarea
 * - Provides Next + “I don’t feel like it” (skip) buttons
 * - (Optional) Submit button passthrough if you still need it elsewhere
 */
export default function FeedbackTray({
  feedback = null,
  result = null,
  submitting = false,
  canSubmit = false,
  onSubmit = null,
  onNext = null,
  onSkip = null,
  error = '',
  disabled = false, // extra guard you can toggle from parent
}) {
  // Normalize lines to print
  const lines = [];

  if (result?.score != null) lines.push(`Score: ${Math.round(result.score * 100)}%`);
  if (Array.isArray(result?.rubric) && result.rubric.length) {
    lines.push(`Analysis: ${result.rubric.join(', ')}`);
  }
  if (result?.details?.message) lines.push(result.details.message);
  if (result?.fixSuggestion) lines.push(`Suggestion: ${result.fixSuggestion}`);
  if (Array.isArray(result?.nextHints) && result.nextHints.length) {
    lines.push(`Next: ${result.nextHints[0]}`);
  }

  // If you still pass a plain string/array via `feedback`, append it
  if (typeof feedback === 'string' && feedback.trim()) lines.push(feedback.trim());
  if (Array.isArray(feedback) && feedback.length) lines.push(...feedback);

  const body = lines.join('\n');

  return (
    <aside className="feedback-tray" style={{ display: 'grid', gap: 12 }}>
      <label style={{ fontWeight: 600 }}>ray ray says</label>

      <textarea
        readOnly
        value={body}
        placeholder=""
        style={{ minHeight: 140, width: '100%' }}
        data-testid="feedback-output"
      />

      {error ? (
        <div
          style={{
            border: '1px solid #b91c1c',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '8px 10px',
            borderRadius: 6,
            fontSize: 13,
          }}
          data-testid="feedback-error"
        >
          {String(error)}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8 }}>
        {/* Optional submit passthrough (kept for compatibility) */}
        {onSubmit ? (
          <button
            type="button"
            className="pfp-btn"
            data-testid="btn-submit"
            onClick={onSubmit}
            disabled={submitting || !canSubmit || disabled}
          >
            {submitting ? 'Grading…' : 'Submit'}
          </button>
        ) : null}

        <button
          type="button"
          className="pfp-btn btn-primary"
          data-testid="btn-next"
          onClick={onNext}
          disabled={submitting || disabled}
        >
          Next
        </button>

        <button
          type="button"
          className="pfp-btn"
          data-testid="btn-skip"
          onClick={onSkip}
          disabled={submitting || disabled}
        >
          I don’t feel like it
        </button>
      </div>
    </aside>
  );
}

