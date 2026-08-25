import { useState, useMemo, useEffect } from "react";
import curriculum from "../data/curriculum";
import { LessonIndex, LessonView } from "./LessonReader";
import { RESOURCE_KIND_LABEL } from "../data/blocks";

export default function ModuleView({ moduleId, state, toggle, setChecked, setNote, stats, setActiveModule }) {
  const idx = curriculum.findIndex((m) => m.id === moduleId);
  const m = curriculum[idx];

  const [tab, setTab] = useState("read");
  const [openLesson, setOpenLesson] = useState(null);
  const [levelFilter, setLevelFilter] = useState("all");
  const [localNote, setLocalNote] = useState(state.notes[moduleId] || "");

  // Reset per-module view state when the module changes. Without this, the
  // notes textarea keeps the previous module's text and the reader stays open
  // on a lesson that belongs to a different module.
  useEffect(() => {
    setTab("read");
    setOpenLesson(null);
    setLevelFilter("all");
    setLocalNote(state.notes[moduleId] || "");
    // state.notes is intentionally not a dependency: this syncs on module
    // change only, so typing does not fight the controlled textarea.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const prev = curriculum[idx - 1];
  const next = curriculum[idx + 1];
  const modStats = stats.perModule[m.id] ?? { pct: 0, readMinutes: 0, totalMinutes: 0 };
  const pct = modStats.pct;

  const counts = useMemo(
    () => ({
      lessons: (m.lessons ?? []).filter((l) => state.lessons[`${m.id}-${l.id}`]).length,
      theory: m.theory.filter((_, i) => state.theory[`${m.id}-${i}`]).length,
      math: m.math.filter((_, i) => state.math[`${m.id}-${i}`]).length,
      practice: m.practice.filter((_, i) => state.practice[`${m.id}-${i}`]).length,
    }),
    [state, m]
  );

  const isLessonRead = (lessonId) => !!state.lessons[`${m.id}-${lessonId}`];
  const setLessonRead = (lessonId, read) => setChecked("lessons", `${m.id}-${lessonId}`, read);

  const goto = (targetId) => {
    setActiveModule(targetId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lessonCount = (m.lessons ?? []).length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted mb-3">
          <span className="px-2 py-0.5 rounded bg-surface2 border border-border">WEEK {m.week}</span>
          <span className="px-2 py-0.5 rounded bg-surface2 border border-border">{m.hours}H PLANNED</span>
          <span className="px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">{m.tag}</span>
          {modStats.totalMinutes > 0 && (
            <span className="px-2 py-0.5 rounded bg-surface2 border border-border">
              {modStats.totalMinutes}M READING
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{m.title}</h1>
        <p className="text-muted mt-3 leading-relaxed">{m.why}</p>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-2 rounded-full bg-surface2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? "bg-success" : "bg-accent"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted shrink-0">{pct}% complete</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        <Tab
          label="Read"
          count={lessonCount ? `${counts.lessons}/${lessonCount}` : null}
          active={tab === "read"}
          onClick={() => setTab("read")}
        />
        <Tab
          label="Recall"
          count={`${counts.theory}/${m.theory.length}`}
          active={tab === "theory"}
          onClick={() => setTab("theory")}
        />
        <Tab
          label="Math"
          count={`${counts.math}/${m.math.length}`}
          active={tab === "math"}
          onClick={() => setTab("math")}
        />
        <Tab
          label="Practice"
          count={`${counts.practice}/${m.practice.length}`}
          active={tab === "practice"}
          onClick={() => setTab("practice")}
        />
        <Tab label="Notes" active={tab === "notes"} onClick={() => setTab("notes")} />
        <Tab label="Resources" active={tab === "resources"} onClick={() => setTab("resources")} />
      </div>

      {/* Read — the book */}
      {tab === "read" &&
        (openLesson ? (
          <LessonView
            module={m}
            lessonId={openLesson}
            isRead={isLessonRead}
            setRead={setLessonRead}
            onClose={() => setOpenLesson(null)}
            onNavigate={setOpenLesson}
          />
        ) : (
          <LessonIndex
            module={m}
            isRead={isLessonRead}
            onOpen={setOpenLesson}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
          />
        ))}

      {/* Recall */}
      {tab === "theory" && (
        <>
          <p className="text-xs text-muted mb-4">
            After reading, check off each concept you could explain out loud, without notes.
          </p>
          <div className="space-y-2.5">
            {m.theory.map((text, i) => {
              const checked = !!state.theory[`${m.id}-${i}`];
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                    checked ? "border-success/40 bg-success/5" : "border-border bg-surface"
                  }`}
                >
                  <Checkbox checked={checked} onClick={() => toggle("theory", `${m.id}-${i}`)} />
                  <p className={`text-sm leading-relaxed ${checked ? "text-text/70" : "text-text/95"}`}>{text}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Math */}
      {tab === "math" && (
        <div className="space-y-4">
          {m.math.map((item, i) => {
            const checked = !!state.math[`${m.id}-${i}`];
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 transition-colors ${
                  checked ? "border-success/40 bg-success/5" : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox checked={checked} onClick={() => toggle("math", `${m.id}-${i}`)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-2">{item.title}</p>
                    <pre className="font-mono text-[13px] bg-surface2 border border-border rounded-lg px-3 py-2.5 text-accent2 overflow-x-auto whitespace-pre-wrap break-words">
                      {item.formula}
                    </pre>
                    <p className="text-sm text-muted mt-2 leading-relaxed">{item.note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Practice */}
      {tab === "practice" && (
        <div className="space-y-3">
          <p className="text-xs text-muted mb-1">
            A mix of theoretical and mathematical questions. Work them out on paper — check one off once you can
            answer it without notes.
          </p>
          {m.practice.map((item, i) => {
            const checked = !!state.practice[`${m.id}-${i}`];
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                  checked ? "border-success/40 bg-success/5" : "border-border bg-surface"
                }`}
              >
                <Checkbox checked={checked} onClick={() => toggle("practice", `${m.id}-${i}`)} />
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block font-mono text-[9px] px-1.5 py-0.5 rounded mr-2 align-middle mb-1 ${
                      item.type === "math" ? "bg-amber/15 text-amber" : "bg-accent2/15 text-accent2"
                    }`}
                  >
                    {item.type === "math" ? "MATH / NUMERICAL" : "THEORY"}
                  </span>
                  <p className={`text-sm leading-relaxed ${checked ? "text-text/70" : "text-text/95"}`}>{item.q}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div>
          <p className="text-xs text-muted mb-2">Personal notes for this module — saved locally as you type.</p>
          <textarea
            value={localNote}
            onChange={(e) => {
              setLocalNote(e.target.value);
              setNote(m.id, e.target.value);
            }}
            placeholder="Write your own explanation of attention, worked-out derivations, links you found useful, questions to ask a mentor..."
            className="w-full h-64 rounded-xl border border-border bg-surface p-4 text-sm text-text placeholder:text-muted/60 resize-y font-mono leading-relaxed"
          />
        </div>
      )}

      {/* Resources */}
      {tab === "resources" && (
        <ul className="space-y-2">
          {m.resources.map((r, i) => {
            const label = typeof r === "string" ? r : r.label;
            const url = typeof r === "string" ? null : r.url;
            const kind = typeof r === "string" ? null : r.kind;
            const body = (
              <>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface2 border border-border text-muted shrink-0 mt-0.5">
                  {RESOURCE_KIND_LABEL[kind] ?? "LINK"}
                </span>
                <span className="min-w-0 flex-1">{label}</span>
                {url && <span className="font-mono text-accent2 text-xs shrink-0 mt-0.5">↗</span>}
              </>
            );
            return (
              <li key={i}>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text/90 flex items-start gap-2.5 hover:border-accent/50 transition-colors"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text/90 flex items-start gap-2.5">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Prev/Next module */}
      <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-border">
        <button
          disabled={!prev}
          onClick={() => prev && goto(prev.id)}
          className="text-left text-sm text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors max-w-[45%]"
        >
          ← {prev ? prev.title : "Start of roadmap"}
        </button>
        <button
          disabled={!next}
          onClick={() => next && goto(next.id)}
          className="text-right text-sm text-accent hover:text-accent2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors max-w-[45%]"
        >
          {next ? next.title : "End of roadmap"} →
        </button>
      </div>
    </div>
  );
}

function Tab({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 shrink-0 ${
        active ? "border-accent text-text" : "border-transparent text-muted hover:text-text/80"
      }`}
    >
      {label}
      {count && <span className="font-mono text-[10px] text-muted">{count}</span>}
    </button>
  );
}

function Checkbox({ checked, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
        checked ? "bg-success border-success text-bg" : "border-border bg-surface2 hover:border-accent"
      }`}
      aria-pressed={checked}
      aria-label={checked ? "Mark as not done" : "Mark as done"}
    >
      {checked && <span className="text-[11px] leading-none">✓</span>}
    </button>
  );
}
