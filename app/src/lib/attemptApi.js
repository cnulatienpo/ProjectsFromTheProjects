export async function getNext(userId = 'dev') {
  const res = await fetch('/api/next', {
    headers: {
      'x-user-id': userId,
    },
  });
  if (!res.ok) {
    throw new Error(`next_failed:${res.status}`);
  }
  return res.json();
}

export async function postAttempt({ userId = 'dev', itemId, mode, answer }) {
  const res = await fetch('/api/attempt', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ userId, itemId, mode, answer }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `attempt_failed:${res.status}`);
  }
  return res.json();
}

export async function getLatestReport(userId = 'dev') {
  const res = await fetch('/api/reports/latest', {
    headers: {
      'x-user-id': userId,
    },
  });
  if (!res.ok) {
    throw new Error(`reports_failed:${res.status}`);
  }
  return res.json();
}

export async function skipItem({ userId = 'dev', itemId, mode }) {
  const res = await fetch('/api/skip', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ userId, itemId, mode, reason: 'user_skip' }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `skip_failed:${res.status}`);
  }
  return res.json();
}
