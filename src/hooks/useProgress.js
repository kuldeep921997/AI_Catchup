import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import curriculum from "../data/curriculum";

const STORAGE_KEY = "ai-catchup-progress-v1";
const SAVE_DEBOUNCE_MS = 400;

// Buckets are plain maps of `${moduleId}-${key}` -> true.
const BUCKETS = ["lessons", "theory", "math", "practice"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyState() {
  return {
    lessons: {}, // `${moduleId}-${lessonId}`: true
    theory: {}, // `${moduleId}-${idx}`: true
    math: {},
    practice: {},
    notes: {}, // moduleId: string
    startDate: todayISO(),
  };
}

// Accepts anything (a parsed import file, an old-format saved state) and
// returns a valid state object. Unknown keys are dropped, missing keys are
// filled with defaults, and wrong-typed values never reach the reducers.
// This is what stops a malformed import from crashing the stats loop.
export function normalizeState(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;

  for (const bucket of BUCKETS) {
    const src = raw[bucket];
    if (src && typeof src === "object" && !Array.isArray(src)) {
      for (const [key, value] of Object.entries(src)) {
        if (value === true) base[bucket][key] = true;
      }
    }
  }

  if (raw.notes && typeof raw.notes === "object" && !Array.isArray(raw.notes)) {
    for (const [key, value] of Object.entries(raw.notes)) {
      if (typeof value === "string") base.notes[key] = value;
    }
  }

  if (typeof raw.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.startDate)) {
    base.startDate = raw.startDate;
  }

  return base;
}

// Returns true only if the payload looks like a progress export, so an
// unrelated JSON file is rejected rather than silently wiping progress.
function looksLikeProgress(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  return BUCKETS.some((b) => raw[b] && typeof raw[b] === "object") || typeof raw.startDate === "string";
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeState(JSON.parse(stored));
  } catch (e) {
    console.warn("Could not load saved progress", e);
  }
  return emptyState();
}

export default function useProgress() {
  const [state, setState] = useState(loadState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist on a debounce. The notes textarea writes on every keystroke, and
  // without this every character re-serialises the whole progress object.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("Could not save progress", e);
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state]);

  // Flush immediately if the tab is closed or hidden mid-debounce.
  useEffect(() => {
    const flush = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
      } catch {
        /* storage full or unavailable — nothing useful to do here */
      }
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  const toggle = useCallback((bucket, key) => {
    setState((prev) => {
      const next = { ...prev[bucket] };
      if (next[key]) delete next[key];
      else next[key] = true;
      return { ...prev, [bucket]: next };
    });
  }, []);

  const setChecked = useCallback((bucket, key, checked) => {
    setState((prev) => {
      if (!!prev[bucket][key] === checked) return prev;
      const next = { ...prev[bucket] };
      if (checked) next[key] = true;
      else delete next[key];
      return { ...prev, [bucket]: next };
    });
  }, []);

  const setNote = useCallback((moduleId, text) => {
    setState((prev) => ({ ...prev, notes: { ...prev.notes, [moduleId]: text } }));
  }, []);

  const resetAll = useCallback(() => {
    if (window.confirm("Reset all progress? This cannot be undone.")) {
      setState(emptyState());
      return true;
    }
    return false;
  }, []);

  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importData = useCallback((json) => {
    try {
      const parsed = JSON.parse(json);
      if (!looksLikeProgress(parsed)) return false;
      setState(normalizeState(parsed));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Derived stats per module + overall. Reading (lessons) is tracked
  // separately from the checklists so the dashboard can show both.
  const stats = useMemo(() => {
    const perModule = {};
    let totalItems = 0;
    let doneItems = 0;
    let totalMinutes = 0;
    let readMinutes = 0;

    curriculum.forEach((m) => {
      const lessons = m.lessons ?? [];
      const counts = {
        lessons: lessons.length,
        theory: m.theory.length,
        math: m.math.length,
        practice: m.practice.length,
      };
      const total = counts.lessons + counts.theory + counts.math + counts.practice;

      let lessonsDone = 0;
      let moduleMinutes = 0;
      let moduleReadMinutes = 0;
      lessons.forEach((lesson) => {
        moduleMinutes += lesson.minutes ?? 0;
        if (state.lessons[`${m.id}-${lesson.id}`]) {
          lessonsDone++;
          moduleReadMinutes += lesson.minutes ?? 0;
        }
      });

      let done = lessonsDone;
      for (let i = 0; i < counts.theory; i++) if (state.theory[`${m.id}-${i}`]) done++;
      for (let i = 0; i < counts.math; i++) if (state.math[`${m.id}-${i}`]) done++;
      for (let i = 0; i < counts.practice; i++) if (state.practice[`${m.id}-${i}`]) done++;

      perModule[m.id] = {
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0,
        lessonsDone,
        lessonsTotal: counts.lessons,
        readMinutes: moduleReadMinutes,
        totalMinutes: moduleMinutes,
      };

      totalItems += total;
      doneItems += done;
      totalMinutes += moduleMinutes;
      readMinutes += moduleReadMinutes;
    });

    return {
      perModule,
      totalItems,
      doneItems,
      overallPct: totalItems ? Math.round((doneItems / totalItems) * 100) : 0,
      modulesCompleted: curriculum.filter((m) => perModule[m.id].pct === 100).length,
      totalMinutes,
      readMinutes,
      lessonsTotal: curriculum.reduce((a, m) => a + (m.lessons?.length ?? 0), 0),
      lessonsDone: curriculum.reduce((a, m) => a + perModule[m.id].lessonsDone, 0),
    };
  }, [state]);

  return { state, toggle, setChecked, setNote, resetAll, exportData, importData, stats };
}
