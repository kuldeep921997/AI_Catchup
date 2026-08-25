// Date helpers for the 16-week schedule.
//
// `new Date("2026-08-22")` parses as UTC midnight, so comparing it against a
// local-midnight "today" is off by a day for anyone west of UTC. These helpers
// build local dates explicitly so week boundaries land where the user expects.

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

export function weekRange(startISO, weekIndex) {
  const start = parseLocalDate(startISO);
  return {
    start: addDays(start, weekIndex * 7),
    end: addDays(start, weekIndex * 7 + 6),
  };
}

// Zero-based index of the week the user is currently in, or -1 if the start
// date is in the future or the 16 weeks have elapsed.
export function currentWeekIndex(startISO, totalWeeks) {
  const start = parseLocalDate(startISO);
  const today = startOfToday();
  const days = Math.floor((today - start) / 86400000);
  if (days < 0) return -1;
  const week = Math.floor(days / 7);
  return week < totalWeeks ? week : -1;
}

export function formatDay(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
