import React from 'react';
import HighlightablePassage from '@/components/HighlightablePassage.jsx';
import OrderBeats from '@/components/OrderBeats.jsx';
import BeatPalette from '@/components/BeatPalette.jsx';
import FeedbackTray from '@/components/FeedbackTray.jsx';
import { fetchNext, skipItem, submitAttempt } from '@/lib/attemptApi.js';

const USER_ID = 'dev';
const DEFAULT_MODE = 'why';

function coerceMode(mode) {
  const value = typeof mode === 'string' ? mode.toLowerCase() : '';
  return ['name', 'missing', 'order', 'highlight', 'fix', 'why', 'sigil'].includes(value)
    ? value
    : DEFAULT_MODE;
}

export default function SigilRunner() {
  const [item, setItem] = React.useState(null);
  const [answer, setAnswer] = React.useState('');
  const [orderAnswer, setOrderAnswer] = React.useState([]);
  const [result, setResult] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [unlocks, setUnlocks] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    void handleNext();
  }, []);

  const promptText = item?.prompt || item?.passage || item?.text || '';
  const mode = coerceMode(item?.mode);

  async function handleNext() {
    setBusy(true);
    setError('');
    try {
      const nxt = await fetchNext(USER_ID);
      const picked = nxt?.item && nxt?.id ? { id: String(nxt.id), ...(nxt.item || {}) } : nxt;
      if (picked && picked.id) {
        const normalizedMode = coerceMode(picked.mode ?? picked.task ?? picked.type);
        const meta = picked.meta && typeof picked.meta === 'object' ? picked.meta : {};
        const introduces = [
          ...(Array.isArray(picked.introduces_beats) ? picked.introduces_beats.map((b) => String(b)) : []),
          ...(Array.isArray(meta.introduces_beats) ? meta.introduces_beats.map((b) => String(b)) : []),
        ].filter(Boolean);
        if (introduces.length) {
          setUnlocks((prev) => {
            const set = new Set(prev.map((b) => String(b)));
            introduces.forEach((b) => set.add(String(b)));
            return Array.from(set);
          });
        }
        const correctSequence = Array.isArray(picked.correctSequence)
          ? picked.correctSequence.map((v) => String(v))
          : [];
        const orderOptions = (() => {
          if (Array.isArray(picked.orderOptions) && picked.orderOptions.length) return picked.orderOptions;
          if (Array.isArray(meta.orderOptions) && meta.orderOptions.length) return meta.orderOptions;
          return correctSequence;
        })().map((v) => String(v));
        setItem({
          id: String(picked.id),
          prompt: promptFromItem(picked),
          mode: normalizedMode,
          meta,
          correctSequence,
          orderOptions,
        });
        setAnswer('');
        setOrderAnswer(orderOptions);
        setResult(null);
      } else {
        setItem(null);
        setResult(null);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load next item.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSkip() {
    if (!item?.id) return;
    setBusy(true);
    try {
      await skipItem({ userId: USER_ID, itemId: item.id, reason: 'user_skip' });
      await handleNext();
    } catch (e) {
      setError(e?.message || 'Failed to skip item.');
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (!item?.id) return;
    setBusy(true);
    setError('');
    try {
      const payload = mode === 'order'
        ? { userId: USER_ID, itemId: item.id, mode: 'order', answer: orderAnswer }
        : { userId: USER_ID, itemId: item.id, mode, answer };
      const res = await submitAttempt(payload);
      setResult(res);
    } catch (e) {
      setError(e?.message || 'Submission failed.');
    } finally {
      setBusy(false);
    }
  }

  const wordCount = React.useMemo(() => {
    const tokens = String(answer).trim().split(/\s+/).filter(Boolean);
    return tokens.length;
  }, [answer]);

  const canSubmit = mode === 'order' ? orderAnswer.length > 0 : true;

  const levelInfo = result?.level ? `Level ${result.level}` : '';

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-semibold">Sigil Runner</div>
      {levelInfo ? <div className="text-sm">{levelInfo}</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <div className="border rounded p-3">
        <div className="text-sm opacity-80 mb-2">Prompt</div>
        {mode === 'highlight'
          ? <HighlightablePassage text={promptText} spans={result?.spans || []} />
          : <pre className="whitespace-pre-wrap text-sm">{promptText || 'Loading…'}</pre>}
      </div>

      {mode === 'order' ? (
        <OrderBeats options={item?.orderOptions || []} onChange={setOrderAnswer} />
      ) : (
        <>
          <div className="text-xs opacity-60">Words: {wordCount}</div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
            className="w-full border rounded p-2"
            placeholder="Write here…"
            disabled={busy}
          />
        </>
      )}

      {Array.isArray(item?.meta?.beats) && item.meta.beats.length ? (
        <BeatPalette
          beats={item.meta.beats}
          unlocks={unlocks}
          onPick={(label, beatObj) => {
            const text = typeof label === 'string' && label.trim()
              ? label
              : (beatObj && (beatObj.label || beatObj.id || beatObj.key || beatObj.text || ''));
            if (!text) return;
            setAnswer((prev) => `${prev}${prev ? ' ' : ''}${text}`);
          }}
        />
      ) : null}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSubmit}
          disabled={busy || !item?.id || !canSubmit}
          className="px-3 py-2 border rounded"
        >
          Submit
        </button>
        <button
          onClick={handleNext}
          disabled={busy}
          className="px-3 py-2 border rounded"
        >
          Next
        </button>
        <button
          onClick={handleSkip}
          disabled={busy || !item?.id}
          className="px-3 py-2 border rounded"
        >
          I don’t feel like it
        </button>
      </div>

      <FeedbackTray result={result} onNext={handleNext} />
    </div>
  );
}

function promptFromItem(raw) {
  if (!raw || typeof raw !== 'object') return '';
  const fields = [raw.prompt, raw.passage, raw.text, raw.body];
  for (const entry of fields) {
    if (typeof entry === 'string' && entry.trim()) return entry;
  }
  return '';
}
