import { useState, useEffect, useCallback, useMemo, useRef } from "react";

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

function loadState(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return normalizeState(JSON.parse(stored));
  } catch (e) {
    console.warn("Could not load saved progress", e);
  }
  return emptyState();
}

// One instance per track. The track's modules drive the stats totals and its
// storageKey isolates its progress, so switching tracks never mixes the two.
// App remounts this subtree on track change (via `key`), which is what makes
// the lazy useState initialiser pick up the new key.
export default function useProgress(track) {
  const { storageKey, modules } = track;

  const [state, setState] = useState(() => loadState(storageKey));
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist on a debounce. The notes textarea writes on every keystroke, and
  // without this every character re-serialises the whole progress object.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.warn("Could not save progress", e);
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, storageKey]);

  // Flush immediately if the tab is closed or hidden mid-debounce — and also on
  // unmount, which is what happens when the user switches track or returns to
  // the chooser. Without the unmount flush, up to SAVE_DEBOUNCE_MS of progress
  // is silently dropped: the debounce cleanup cancels the pending write and
  // neither beforeunload nor visibilitychange fires on a React unmount.
  useEffect(() => {
    const flush = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(stateRef.current));
      } catch {
        /* storage full or unavailable — nothing useful to do here */
      }
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flush);
      flush();
    };
  }, [storageKey]);

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
    if (window.confirm("Reset all progress for this track? This cannot be undone.")) {
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

    modules.forEach((m) => {
      const lessons = m.lessons ?? [];
      const counts = {
        lessons: lessons.length,
        theory: (m.theory ?? []).length,
        math: (m.math ?? []).length,
        practice: (m.practice ?? []).length,
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
      modulesCompleted: modules.filter((m) => perModule[m.id].pct === 100).length,
      totalMinutes,
      readMinutes,
      lessonsTotal: modules.reduce((a, m) => a + (m.lessons?.length ?? 0), 0),
      lessonsDone: modules.reduce((a, m) => a + perModule[m.id].lessonsDone, 0),
    };
  }, [state, modules]);

  return { state, toggle, setChecked, setNote, resetAll, exportData, importData, stats };
}

// Read a track's headline numbers without mounting its provider. Used by the
// track chooser so both cards can show progress at once.
export function peekTrackStats(track) {
  const state = loadState(track.storageKey);
  let total = 0;
  let done = 0;
  track.modules.forEach((m) => {
    const lessons = m.lessons ?? [];
    total += lessons.length + (m.theory ?? []).length + (m.math ?? []).length + (m.practice ?? []).length;
    lessons.forEach((l) => {
      if (state.lessons[`${m.id}-${l.id}`]) done++;
    });
    for (let i = 0; i < (m.theory ?? []).length; i++) if (state.theory[`${m.id}-${i}`]) done++;
    for (let i = 0; i < (m.math ?? []).length; i++) if (state.math[`${m.id}-${i}`]) done++;
    for (let i = 0; i < (m.practice ?? []).length; i++) if (state.practice[`${m.id}-${i}`]) done++;
  });
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}
