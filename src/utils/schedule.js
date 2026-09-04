// Date helpers for track schedules.
//
// The Learning track runs one module per week; the Prep track runs a much
// tighter cadence (a 28-day sprint across 14 modules = 2 days each). Everything
// here therefore works in "units" of N days rather than hard-coded weeks, with
// `days` defaulting to 7 so existing week-based callers are unaffected.
//
// `new Date("2026-08-22")` parses as UTC midnight, so comparing it against a
// local-midnight "today" is off by a day for anyone west of UTC. These helpers
// build local dates explicitly so unit boundaries land where the user expects.

export function parseLocalDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return startOfToday();
  return new Date(y, m - 1, d);
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Inclusive [start, end] range for the unit at `unitIndex`.
export function unitRange(startISO, unitIndex, days = 7) {
  const start = parseLocalDate(startISO);
  return {
    start: addDays(start, unitIndex * days),
    end: addDays(start, unitIndex * days + (days - 1)),
  };
}

// Zero-based index of the unit the user is currently in, or -1 if the start
// date is in the future or the whole schedule has elapsed.
export function currentUnitIndex(startISO, totalUnits, days = 7) {
  const start = parseLocalDate(startISO);
  const today = startOfToday();
  const elapsed = Math.floor((today - start) / 86400000);
  if (elapsed < 0) return -1;
  const unit = Math.floor(elapsed / days);
  return unit < totalUnits ? unit : -1;
}

export function formatDay(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ---- Backwards-compatible week aliases -------------------------------------
// Kept so any future week-specific call site reads naturally.
export const weekRange = (startISO, weekIndex) => unitRange(startISO, weekIndex, 7);
export const currentWeekIndex = (startISO, totalWeeks) => currentUnitIndex(startISO, totalWeeks, 7);
