import React from 'react';

export default function FeedbackTray({ result, feedback, onNext }) {
  const payload = result ?? feedback ?? null;
  const score = Number.isFinite(payload?.score) ? Math.round(payload.score * 100) : null;
  const rubric = Array.isArray(payload?.rubric) ? payload.rubric : [];
  const nextHints = Array.isArray(payload?.nextHints) ? payload.nextHints : [];
  const lines = [];
  if (score !== null) lines.push(`Score: ${score}%`);
  if (rubric.length) lines.push(`Rubric:\n- ${rubric.join('\n- ')}`);
  if (nextHints.length) lines.push(`Next:\n- ${nextHints.join('\n- ')}`);
  if (payload?.details?.distance != null) {
    const distance = Number(payload.details.distance);
    if (Number.isFinite(distance)) {
      lines.push(`Distance: ${distance.toFixed(2)}`);
    }
  }
  if (payload?.details?.expAwarded != null) {
    const exp = Number(payload.details.expAwarded);
    if (Number.isFinite(exp)) {
      lines.push(`EXP: +${exp}`);
    }
  }
  if (payload?.leveledUp) {
    lines.push('Level up!');
  }
  if (Array.isArray(payload?.badges) && payload.badges.length) {
    lines.push(`Badges: ${payload.badges.join(', ')}`);
  }
  const text = lines.join('\n\n');
  return (
    <div className="feedback-tray space-y-2">
      <textarea
        value={text}
        readOnly
        rows={Math.max(6, Math.min(16, (text.match(/\n/g)?.length || 2) + 2))}
        className="w-full border rounded p-2 font-mono text-sm"
        aria-label="Feedback"
      />
      <div>
        {onNext ? (
          <button onClick={onNext} className="px-3 py-2 border rounded">Next</button>
        ) : null}
      </div>
    </div>
  );
}
