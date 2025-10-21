export interface AttemptAnswer {
  userId: string;
  itemId: string;
  mode: string;
  answer: unknown;
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = text ? `${res.status} ${text}` : `${res.status}`;
    throw new Error(`Request failed: ${message}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchNext<T = unknown>(userId: string): Promise<T> {
  const res = await fetch(`/api/next?userId=${encodeURIComponent(userId)}`);
  return readJson<T>(res);
}

export async function skipItem(userId: string, itemId: string, mode: string): Promise<void> {
  const res = await fetch(`/api/skip`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId, itemId, mode, reason: 'user_skip' }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = text ? `${res.status} ${text}` : `${res.status}`;
    throw new Error(`Request failed: ${message}`);
  }
}

export async function submitAttempt<T = unknown>(params: AttemptAnswer): Promise<T> {
  const res = await fetch(`/api/attempt`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  return readJson<T>(res);
}
