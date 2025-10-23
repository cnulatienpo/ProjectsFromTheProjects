import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NotesPanel from '@/components/NotesPanel.jsx';
import FeedbackTray from '@/components/FeedbackTray.jsx';
import BeatRail from '@/components/BeatRail.jsx';
import BeatTextEditor from '@/components/BeatTextEditor.jsx';
import { beatsForLesson } from '@/logic/beatUnlockSchedule';
import { useBeatUnlocks } from '@/state/useBeatUnlocks';
import { getLesson } from '@/services/sigilLesson';
import { fetchNext, skipItem, submitAttempt } from '@/lib/attemptApi';

const USER_ID = 'dev';
const MODE = 'why';

const defaultBeatEmoticon = {
  action: '🔨',
  decision: '✅',
  desire: '❤️',
  conflict: '⚔️',
  obstacle: '🧱',
  climax: '⛰️',
  resolution: '🌅',
  reveal: '👁️',
  realization: '💡',
  exposition: '📜',
  foreshadow: '🌒',
  setup: '🎯',
  payoff: '🎉',
  emotion: '😭',
  suppression: '🤐',
  vulnerability: '🫀',
  power: '👑',
  shift: '🔄',
  intimacy: '🤝',
  alienation: '🪫',
  dialogue: '💬',
  nonverbal: '👀',
  interaction: '↔️',
  agreement: '✍️',
  disagreement: '❌',
  test: '🧪',
  reversal: '🔁',
  atmosphere: '🌫️',
  discovery: '🗺️',
  loss: '🕳️',
  arrival: '🚪',
  departure: '🛫',
  transition: '⏭️',
};

function toPlainText(input = '') {
  return String(input)
    .replace(/<br\s*\/?>(?=\s)/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function SigilRunner() {
  const { id } = useParams();
  const nav = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [pendingInsert, setPendingInsert] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load lesson when id changes. When no id is provided, grab one from /api/next.
  useEffect(() => {
    let ignore = false;

    async function loadFromRoute() {
      if (!id) {
        setLoading(true);
        try {
          const nextItem = await fetchNext(USER_ID);
          if (ignore) return;
          if (nextItem?.id) {
            setCurrentItem({ ...nextItem, mode: nextItem.mode || MODE });
            setFeedback(null);
            setSubmitError('');
            setText('');
            setEditorKey((k) => k + 1);
            nav(`/sigil/${encodeURIComponent(nextItem.id)}`, { replace: true });
          } else {
            setError('No lesson available.');
            setLoading(false);
          }
        } catch (e) {
          if (!ignore) {
            setError(e?.message || 'Failed to load next lesson.');
            setLoading(false);
          }
        }
        return;
      }

      setLoading(true);
      setError('');
      setLesson(null);
      try {
        const data = await getLesson(String(id));
        if (ignore) return;
        if (!data) {
          setError('Lesson unavailable.');
          setLesson(null);
        } else {
          setLesson(data);
          setFeedback(null);
          setSubmitError('');
          setText('');
          setEditorKey((k) => k + 1);
          setPendingInsert(null);
        }
      } catch (e) {
        if (!ignore) {
          setError(e?.message ? String(e.message) : String(e));
          setLesson(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadFromRoute();
    return () => {
      ignore = true;
    };
  }, [id, nav]);

  // Ensure currentItem reflects the lesson id when loaded directly.
  useEffect(() => {
    if (!lesson?.id) return;
    setCurrentItem((prev) => {
      if (prev && prev.id === lesson.id) {
        return prev.mode ? prev : { ...prev, mode: prev.mode || MODE };
      }
      return { id: lesson.id, mode: MODE };
    });
  }, [lesson?.id]);

  const { unlockBeats } = useBeatUnlocks();
  useEffect(() => {
    if (!lesson?.id) return;
    const lessonNumber = (() => {
      try {
        const match = String(lesson.id).match(/(\d+)/);
        return match ? parseInt(match[1], 10) : NaN;
      } catch {
        return NaN;
      }
    })();
    if (!Number.isNaN(lessonNumber)) {
      const toUnlock = beatsForLesson(lessonNumber);
      unlockBeats(lesson.id || `lesson-${lessonNumber}`, toUnlock, lesson?.emoticonColor);
    }
  }, [lesson?.id, lesson?.emoticonColor, unlockBeats]);

  const plainText = useMemo(() => toPlainText(text), [text]);
  const wordCount = useMemo(() => {
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(Boolean).length;
  }, [plainText]);
  const canSubmit = true;

  const handleBeatInsert = (beatData) => {
    setPendingInsert(beatData);
  };

  const handleConsumePendingInsert = () => {
    setPendingInsert(null);
  };

  async function handleSubmit() {
    if (submitting) return;
    const itemId = currentItem?.id || lesson?.id || id;
    if (!itemId) {
      setSubmitError('Missing lesson id.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const sigils = (plainText.match(/\[([^\]]+)\]/g) || []).map((s) => s.slice(1, -1).toLowerCase());
      const answer = { text: plainText, sigils, rationale: null };
      const result = await submitAttempt({
        userId: USER_ID,
        itemId: String(itemId),
        mode: currentItem?.mode || MODE,
        answer,
      });
      setFeedback(result);
    } catch (e) {
      setSubmitError(e?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function loadNextItem(replace = false) {
    setSubmitError('');
    setFeedback(null);
    setError('');
    setLesson(null);
    setText('');
    setEditorKey((k) => k + 1);
    setPendingInsert(null);
    setLoading(true);
    try {
      const nextItem = await fetchNext(USER_ID);
      const normalized = nextItem ? { ...nextItem, mode: nextItem.mode || MODE } : null;
      setCurrentItem(normalized);
      const nextId = normalized?.id ? String(normalized.id) : null;
      if (!nextId) {
        setError('No additional lessons available.');
        setLoading(false);
        return;
      }

      const currentRouteId = id ? String(id) : null;
      if (currentRouteId && nextId === currentRouteId) {
        try {
          const data = await getLesson(nextId);
          if (!data) {
            setError('Lesson unavailable.');
            setLesson(null);
          } else {
            setLesson(data);
            setFeedback(null);
            setSubmitError('');
          }
        } catch (err) {
          setError(err?.message || 'Failed to load lesson.');
        } finally {
          setLoading(false);
        }
      } else {
        nav(`/sigil/${encodeURIComponent(nextId)}`, { replace });
      }
    } catch (e) {
      setError(e?.message || 'Failed to load the next lesson.');
      setLoading(false);
    }
  }

  async function handleNext() {
    await loadNextItem(false);
  }

  async function handleSkip() {
    const itemId = currentItem?.id || lesson?.id || id;
    if (!itemId) {
      setError('Unable to skip without a lesson id.');
      return;
    }
    try {
      await skipItem({ userId: USER_ID, itemId: String(itemId) });
    } catch (e) {
      setSubmitError(e?.message || 'Failed to record skip.');
    }
    await loadNextItem(false);
  }

  const rayLines = useMemo(() => {
    if (!feedback) return [];
    const parts = [
      feedback?.score != null ? `Score: ${Math.round(feedback.score * 100)}%` : null,
      feedback?.rubric?.length
        ? `Rubric: ${feedback.rubric
            .map((r) => (typeof r === 'string' ? r : `${r.key}${r.ok ? '✓' : '✗'}`))
            .join(', ')}`
        : null,
      feedback?.details?.message ? `Note: ${feedback.details.message}` : null,
      feedback?.fixSuggestion ? `Suggestion: ${feedback.fixSuggestion}` : null,
      ...(Array.isArray(feedback?.nextHints) ? feedback.nextHints.map((hint) => `Next: ${hint}`) : []),
    ];
    return parts.filter(Boolean);
  }, [feedback]);

  const rawContent = lesson?.content_html || lesson?.prompt_html || '';
  const contentHTML = useMemo(() => stripAutoTitle(rawContent), [rawContent]);
  const promptHTML = useMemo(() => {
    if (!lesson) return '';
    if (lesson.prompt_hint) return lesson.prompt_hint;
    if (lesson.content_html && lesson.prompt_html) return lesson.prompt_html;
    return '';
  }, [lesson]);

  if (error) {
    return (
      <main className="sigil-root surface" style={{ padding: 24 }}>
        <b>Error:</b> {error} <p><Link to="/sigil">Back to catalog</Link></p>
      </main>
    );
  }

  if (loading && !lesson) {
    return (
      <main className="sigil-root surface" style={{ padding: 24 }}>
        Loading lesson…
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="sigil-root surface" style={{ padding: 24 }}>
        No lesson available.
      </main>
    );
  }

  const lessonId = currentItem?.id || lesson?.id || id;

  return (
    <main className="pfp-shell">
      <div className="sigil-stage">
        <section className="sigil-box sigil-content">
          <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
        </section>

        <section className="sigil-box sigil-prompt">
          <div dangerouslySetInnerHTML={{ __html: promptHTML }} />
        </section>

        <div className="sigil-row" style={{ position: 'relative' }}>
          <BeatRail
            emoticonMap={lesson?.emoticonMap || defaultBeatEmoticon}
            colorMap={lesson?.emoticonColor}
            onInsert={handleBeatInsert}
          />
          <section className="sigil-editor">
            <BeatTextEditor
              key={editorKey}
              value={text}
              onChange={setText}
              placeholder="Write your response here…"
              pendingInsert={pendingInsert}
              onConsumeInsert={handleConsumePendingInsert}
            />
            <div className="sigil-meta" style={{ padding: '8px 12px', borderTop: '1px solid #000' }}>
              {wordCount} words
            </div>
          </section>

          <aside className="sigil-notes">
            <NotesPanel
              gameKey="sigil"
              lessonId={lessonId}
              rayRayTitle="Ray Ray Says"
              rayRayLines={rayLines}
            />
          </aside>
        </div>

        <section className="sigil-tray">
          <div className="sigil-tray-title">ray ray says:</div>
          <FeedbackTray
            feedback={feedback}
            submitting={submitting}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            onNext={handleNext}
            onSkip={handleSkip}
            error={submitError}
            nextEnabled={Boolean(feedback)}
          />
        </section>
      </div>
    </main>
  );
}

function stripAutoTitle(html) {
  if (!html) return '';
  const hTag = html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/is, '');
  const strongFirst = hTag.replace(/^\s*<p>\s*<strong>[^<]+<\/strong>\s*<\/p>\s*/is, '');
  return strongFirst;
}
