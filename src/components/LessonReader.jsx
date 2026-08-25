import { useEffect, useMemo, useRef } from "react";
import Block from "./Blocks";
import { LEVEL_LABEL, LEVELS } from "../data/blocks";

const LEVEL_STYLES = {
  beginner: "bg-success/15 text-success border-success/30",
  core: "bg-accent/15 text-accent border-accent/30",
  advanced: "bg-amber/15 text-amber border-amber/30",
};

function LevelPill({ level }) {
  return (
    <span
      className={`font-mono text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${
        LEVEL_STYLES[level] ?? LEVEL_STYLES.core
      }`}
    >
      {(LEVEL_LABEL[level] ?? level).toUpperCase()}
    </span>
  );
}

function fmtMinutes(total) {
  if (!total) return "0 min";
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/* ---------------------------------------------------------------- index --- */

export function LessonIndex({ module: m, isRead, onOpen, levelFilter, setLevelFilter }) {
  const lessons = m.lessons ?? [];

  const visible = useMemo(
    () => (levelFilter === "all" ? lessons : lessons.filter((l) => l.level === levelFilter)),
    [lessons, levelFilter]
  );

  const readCount = lessons.filter((l) => isRead(l.id)).length;
  const totalMinutes = lessons.reduce((a, l) => a + (l.minutes ?? 0), 0);
  const remaining = lessons.filter((l) => !isRead(l.id)).reduce((a, l) => a + (l.minutes ?? 0), 0);
  const firstUnread = lessons.find((l) => !isRead(l.id));

  const availableLevels = LEVELS.filter((lv) => lessons.some((l) => l.level === lv));

  if (!lessons.length) {
    return <p className="text-sm text-muted">No reading content for this module yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-xs text-muted">
          {lessons.length} lessons · {fmtMinutes(totalMinutes)} of reading ·{" "}
          <span className="text-text/80">
            {readCount}/{lessons.length} read
          </span>
          {remaining > 0 && <> · {fmtMinutes(remaining)} left</>}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLevelFilter("all")}
            className={`font-mono text-[10px] px-2 py-1 rounded border transition-colors ${
              levelFilter === "all"
                ? "bg-surface3 border-accent/40 text-text"
                : "border-border text-muted hover:text-text"
            }`}
          >
            ALL
          </button>
          {availableLevels.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevelFilter(lv)}
              className={`font-mono text-[10px] px-2 py-1 rounded border transition-colors ${
                levelFilter === lv
                  ? "bg-surface3 border-accent/40 text-text"
                  : "border-border text-muted hover:text-text"
              }`}
            >
              {(LEVEL_LABEL[lv] ?? lv).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {firstUnread && levelFilter === "all" && (
        <button
          onClick={() => onOpen(firstUnread.id)}
          className="w-full text-left mb-5 rounded-xl border border-accent/30 bg-accent/[0.06] p-4 hover:border-accent/60 transition-colors group"
        >
          <p className="font-mono text-[10px] text-accent mb-1">
            {readCount === 0 ? "START READING" : "CONTINUE READING"}
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-[14.5px] text-text">{firstUnread.title}</p>
            <span className="font-mono text-accent text-lg group-hover:translate-x-1 transition-transform shrink-0">
              →
            </span>
          </div>
        </button>
      )}

      <ol className="space-y-2.5">
        {visible.map((lesson) => {
          const read = isRead(lesson.id);
          const n = lessons.indexOf(lesson) + 1;
          return (
            <li key={lesson.id}>
              <button
                onClick={() => onOpen(lesson.id)}
                className={`w-full text-left rounded-xl border p-4 transition-colors group ${
                  read
                    ? "border-success/30 bg-success/[0.04] hover:border-success/50"
                    : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full border font-mono text-[10px] flex items-center justify-center mt-0.5 ${
                      read ? "bg-success/20 border-success text-success" : "bg-surface2 border-border text-muted"
                    }`}
                  >
                    {read ? "✓" : n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`font-medium text-[14.5px] leading-snug ${read ? "text-text/70" : "text-text"}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <LevelPill level={lesson.level} />
                        <span className="font-mono text-[10px] text-muted">{lesson.minutes}m</span>
                      </div>
                    </div>
                    {lesson.summary && (
                      <p className="text-[13px] text-muted mt-1.5 leading-relaxed">{lesson.summary}</p>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {!visible.length && (
        <p className="text-sm text-muted py-6 text-center">No {LEVEL_LABEL[levelFilter]} lessons in this module.</p>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- reader --- */

export function LessonView({ module: m, lessonId, isRead, setRead, onClose, onNavigate }) {
  const lessons = m.lessons ?? [];
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[idx];
  const topRef = useRef(null);

  // Scroll back to the top whenever the lesson changes, so prev/next does not
  // drop you into the middle of the new lesson.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lessonId]);

  if (!lesson) return null;

  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const read = isRead(lesson.id);

  return (
    <article ref={topRef}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <button onClick={onClose} className="text-xs text-muted hover:text-text transition-colors">
          ← All lessons
        </button>
        <span className="font-mono text-[10px] text-muted">
          {idx + 1} / {lessons.length}
        </span>
      </div>

      <header className="mb-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <LevelPill level={lesson.level} />
          <span className="font-mono text-[10px] text-muted">{lesson.minutes} MIN READ</span>
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight leading-tight">{lesson.title}</h2>
        {lesson.summary && <p className="text-muted mt-2.5 leading-relaxed text-[14.5px]">{lesson.summary}</p>}
      </header>

      <div className="reading">
        {lesson.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <button
          onClick={() => setRead(lesson.id, !read)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            read
              ? "border-success/40 bg-success/10 text-success hover:bg-success/15"
              : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
          }`}
        >
          <span className="font-mono text-xs">{read ? "✓" : "○"}</span>
          {read ? "Marked as read" : "Mark as read"}
        </button>

        <div className="flex items-center justify-between gap-3 mt-5">
          <button
            disabled={!prev}
            onClick={() => prev && onNavigate(prev.id)}
            className="text-left text-xs text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors max-w-[45%]"
          >
            ← {prev ? prev.title : "First lesson"}
          </button>
          <button
            disabled={!next}
            onClick={() => {
              if (!next) return;
              if (!read) setRead(lesson.id, true);
              onNavigate(next.id);
            }}
            className="text-right text-xs text-accent hover:text-accent2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors max-w-[45%]"
          >
            {next ? `${next.title} →` : "Last lesson"}
          </button>
        </div>
        {next && (
          <p className="text-[10px] text-muted font-mono mt-2 text-right">
            NEXT ALSO MARKS THIS LESSON READ
          </p>
        )}
      </div>
    </article>
  );
}
