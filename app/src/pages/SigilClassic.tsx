import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/apiBase';
import { CatalogItem, toCatalogItems } from '@/lib/normalize';
import './SigilClassic.css';

type Lesson = {
  id: string;
  title: string;
  intro: string;
  prompt: string;
  minWords: number;
};

type CatalogResponse = {
  items?: CatalogItem[] | { [key: string]: unknown }[];
  first?: string;
};

type LessonResponse = {
  id?: string;
  title?: string;
  intro?: string;
  prompt?: string;
  text?: string;
  min_words?: number;
  minWords?: number;
  feedback?: unknown;
  feedback_lines?: unknown;
};

function splitIntroPrompt(text: string) {
  const t = (text ?? '').toString();
  const m = t.search(/(?:^|\n)\s*Before we start:/i);
  if (m >= 0) return { intro: t.slice(0, m).trim(), prompt: t.slice(m).trim() };
  const parts = t.split(/\n\s*\n/);
  if (parts.length >= 2) return { intro: parts.slice(0, -1).join('\n\n').trim(), prompt: parts.at(-1)!.trim() };
  return { intro: t.trim(), prompt: '' };
}

function normalizeFeedback(payload: unknown): string[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload
      .map((entry) => {
        if (!entry) return '';
        if (typeof entry === 'string') return entry.trim();
        return String(entry);
      })
      .filter((line) => line.trim().length > 0);
  }
  if (typeof payload === 'string') {
    return payload
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (typeof payload === 'object') {
    const maybeLines = (payload as Record<string, unknown>).lines;
    if (Array.isArray(maybeLines)) return normalizeFeedback(maybeLines);
  }
  return [];
}

function renderParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block, idx) => (
      <p key={idx}>{block.trim()}</p>
    ));
}

export default function SigilClassic(): JSX.Element {
  const params = useParams();
  const navigate = useNavigate();
  const routeId = params.id ? decodeURIComponent(params.id) : null;

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [firstId, setFirstId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string[]>([]);
  const [trayOpen, setTrayOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    setCatalogLoading(true);
    setError('');
    (async () => {
      try {
        const cat = await api.getJSON<CatalogResponse>('/sigil/catalog');
        if (!alive) return;
        const items = toCatalogItems(cat);
        setCatalog(items);
        const first = cat?.first ? String(cat.first) : items[0]?.id ?? null;
        setFirstId(first);
      } catch (e: any) {
        if (!alive) return;
        setCatalog([]);
        setFirstId(null);
        setError(e?.message ? String(e.message) : String(e));
      } finally {
        if (alive) setCatalogLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (routeId) {
      setCurrentId(routeId);
      return;
    }
    if (firstId) {
      setCurrentId(firstId);
    }
  }, [routeId, firstId]);

  useEffect(() => {
    if (!currentId) {
      setLesson(null);
      return;
    }
    let alive = true;
    setLessonLoading(true);
    setError('');
    (async () => {
      try {
        const payload = await api.getJSON<LessonResponse>(`/sigil/lesson/${encodeURIComponent(currentId)}`);
        if (!alive) return;
        const canonicalId = payload?.id ? String(payload.id) : currentId;
        const { intro, prompt } =
          payload && Object.prototype.hasOwnProperty.call(payload, 'intro')
            ? {
                intro: String(payload.intro ?? ''),
                prompt: String(payload.prompt ?? ''),
              }
            : splitIntroPrompt(String(payload?.text ?? ''));
        const minWords =
          typeof payload?.min_words === 'number'
            ? payload.min_words
            : typeof payload?.minWords === 'number'
            ? payload.minWords
            : 150;
        setLesson({
          id: canonicalId,
          title: String(payload?.title ?? 'Sigil & Syntax Lesson'),
          intro,
          prompt,
          minWords,
        });
        setFeedback(normalizeFeedback(payload?.feedback ?? payload?.feedback_lines));
        if (canonicalId !== currentId) {
          setCurrentId(canonicalId);
        }
        if (routeId && routeId !== canonicalId) {
          navigate(`/sigil/${encodeURIComponent(canonicalId)}`, { replace: true });
        }
      } catch (e: any) {
        if (!alive) return;
        setLesson(null);
        setFeedback([]);
        setError(e?.message ? String(e.message) : String(e));
      } finally {
        if (alive) setLessonLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentId, routeId, navigate]);

  useEffect(() => {
    if (!lesson) return;
    const draftKey = `sigil:draft:${lesson.id}`;
    const notesKey = `sigil:notes:${lesson.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    const savedNotes = localStorage.getItem(notesKey);
    setDraft(savedDraft ?? '');
    setNotes(savedNotes ?? '');
  }, [lesson?.id]);

  useEffect(() => {
    if (!lesson) return;
    const draftKey = `sigil:draft:${lesson.id}`;
    const id = window.setTimeout(() => {
      localStorage.setItem(draftKey, draft);
    }, 200);
    return () => window.clearTimeout(id);
  }, [draft, lesson?.id]);

  useEffect(() => {
    if (!lesson) return;
    const notesKey = `sigil:notes:${lesson.id}`;
    const id = window.setTimeout(() => {
      localStorage.setItem(notesKey, notes);
    }, 200);
    return () => window.clearTimeout(id);
  }, [notes, lesson?.id]);

  const loading = catalogLoading || lessonLoading;
  const wordCount = useMemo(() => {
    const trimmed = draft.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [draft]);
  const minWords = lesson?.minWords ?? 150;
  const progressLabel = wordCount >= minWords ? '✓ Word count met' : `Need ${Math.max(minWords - wordCount, 0)} more words`;

  const goToLesson = (id?: string | null) => {
    if (!id) return;
    if (!routeId) {
      setCurrentId(id);
      return;
    }
    navigate(`/sigil/${encodeURIComponent(id)}`);
  };

  const handleNext = () => {
    if (!lesson) return;
    if (!catalog.length) return;
    const idx = catalog.findIndex((it) => it.id === lesson.id);
    const next = catalog[idx >= 0 ? (idx + 1) % catalog.length : 0];
    if (next) goToLesson(next.id);
  };

  const handlePrev = () => {
    if (!lesson) return;
    if (!catalog.length) return;
    const idx = catalog.findIndex((it) => it.id === lesson.id);
    const prev = catalog[idx >= 0 ? (idx - 1 + catalog.length) % catalog.length : catalog.length - 1];
    if (prev) goToLesson(prev.id);
  };

  const handleSubmit = () => {
    if (!lesson) return;
    if (!draft.trim()) {
      setFeedback(['Draft is empty — add words before submitting.']);
      setTrayOpen(true);
      return;
    }
    if (!feedback.length) {
      setFeedback([
        'Submission received! Feedback pipeline is not wired yet, but your draft is saved locally.',
        'Try revising once more after you review your notes.',
      ]);
    }
    setTrayOpen(true);
  };

  const handleReset = () => {
    setDraft('');
    setFeedback([]);
  };

  const introContent = lesson?.intro
    ? renderParagraphs(lesson.intro)
    : loading
    ? [<p key="loading">Loading intro…</p>]
    : [<p key="empty" className="sigil-feedback-empty">Intro will appear here.</p>];

  const promptContent = lesson?.prompt
    ? renderParagraphs(lesson.prompt)
    : loading
    ? [<p key="loading">Loading prompt…</p>]
    : [<p key="empty" className="sigil-feedback-empty">Prompt will appear here.</p>];

  return (
    <main className="sigil-classic" aria-live="polite">
      <header className="sigil-header">
        <h1 className="sigil-head-title">Sigil &amp; Syntax</h1>
        <div className="sigil-head-meta">
          {lesson ? lesson.title : loading ? 'Loading lesson…' : 'Lesson unavailable'}
        </div>
      </header>

      {error && (
        <div className="surface sigil-box" role="alert" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
          <div className="sigil-box-title">Error</div>
          <p>{error}</p>
        </div>
      )}

      <div className="sigil-layout">
        <div className="sigil-column">
          <section className="surface sigil-box" aria-label="Lesson intro">
            <div className="sigil-box-title">Intro</div>
            <h2>{lesson ? lesson.title : 'Sigil lesson'}</h2>
            {introContent}
          </section>

          <section className="surface sigil-box" aria-label="Prompt">
            <div className="sigil-box-title">Prompt</div>
            {promptContent}
          </section>

          <section className="surface sigil-box" aria-label="Your draft">
            <div className="sigil-box-title">Your draft</div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={lesson ? 'Write your draft here…' : 'No lesson loaded.'}
              aria-label="Your draft"
              disabled={!lesson}
            />
            <div className="sigil-stats">
              <span>Word count: {wordCount}</span>
              <span>{progressLabel}</span>
            </div>
            <div className="sigil-actions">
              <button className="sigil-btn primary" onClick={handleSubmit} disabled={!lesson || loading}>
                Submit
              </button>
              <button className="sigil-btn" onClick={handlePrev} disabled={!lesson || !catalog.length}>
                Previous
              </button>
              <button className="sigil-btn" onClick={handleNext} disabled={!lesson || !catalog.length}>
                Next
              </button>
              <button className="sigil-btn" onClick={handleReset} disabled={!lesson}>
                Try again
              </button>
            </div>
          </section>
        </div>

        <aside className={`sigil-tray ${trayOpen ? 'open' : 'closed'}`} aria-label="Notes and feedback">
          <button
            className="sigil-btn sigil-tray-toggle"
            type="button"
            onClick={() => setTrayOpen((open) => !open)}
          >
            {trayOpen ? 'Hide Tray' : 'Show Tray'}
          </button>

          <div className="sigil-tray-body">
            <section className="surface sigil-tray-section" aria-label="Notes">
              <h3>Notes</h3>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Keep your notes here…"
              />
            </section>

            <section className="surface sigil-tray-section" aria-label="Feedback">
              <h3>Feedback</h3>
              {feedback.length ? (
                <ul className="sigil-feedback-list">
                  {feedback.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="sigil-feedback-empty">Submit to see feedback.</p>
              )}
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
