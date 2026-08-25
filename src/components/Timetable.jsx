import { useMemo } from "react";
import curriculum from "../data/curriculum";
import { formatDay, startOfToday, weekRange } from "../utils/schedule";

export default function Timetable({ stats, startDate, setView, setActiveModule }) {
  const rows = useMemo(() => {
    const today = startOfToday();
    return curriculum.map((m, i) => {
      const { start, end } = weekRange(startDate, i);
      const pct = stats.perModule[m.id]?.pct ?? 0;
      let status = "Upcoming";
      if (pct === 100) status = "Done";
      else if (start <= today && today <= end) status = "This week";
      else if (end < today) status = "Overdue";
      return { m, weekStart: start, weekEnd: end, pct, status };
    });
  }, [stats, startDate]);

  const totalHours = curriculum.reduce((a, m) => a + m.hours, 0);
  const overdue = rows.filter((r) => r.status === "Overdue").length;

  return (
    <div className="max-w-5xl">
      <header className="mb-6">
        <p className="font-mono text-xs text-accent2 tracking-widest mb-2">SCHEDULE</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">16-week timetable</h1>
        <p className="text-muted mt-2 max-w-2xl leading-relaxed">
          One module per week at roughly {Math.round(totalHours / curriculum.length)} hrs/week (~1–1.5 hrs on
          weekdays). Dates auto-shift from the day you started — fall behind and it'll flag as overdue, not judge
          you.
          {overdue > 0 && (
            <>
              {" "}
              <span className="text-amber">
                {overdue} {overdue === 1 ? "module is" : "modules are"} behind schedule.
              </span>
            </>
          )}
        </p>
      </header>

      <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
        <div className="grid grid-cols-[70px_1fr_150px_110px_90px] gap-3 px-4 py-2.5 bg-surface2 font-mono text-[10px] text-muted tracking-wider min-w-[680px]">
          <span>WEEK</span>
          <span>MODULE</span>
          <span>DATES</span>
          <span>STATUS</span>
          <span className="text-right">PROGRESS</span>
        </div>
        <div className="divide-y divide-border min-w-[680px]">
          {rows.map(({ m, weekStart, weekEnd, pct, status }) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveModule(m.id);
                setView("module");
              }}
              className="w-full grid grid-cols-[70px_1fr_150px_110px_90px] gap-3 px-4 py-3.5 items-center bg-surface hover:bg-surface2/60 transition-colors text-left"
            >
              <span className="font-mono text-xs text-muted">{String(m.week).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text/95 truncate">{m.title}</p>
                <p className="text-[11px] text-muted mt-0.5">
                  {m.tag} · {m.hours}h · {(m.lessons ?? []).length} lessons
                </p>
              </div>
              <span className="font-mono text-[11px] text-muted">
                {formatDay(weekStart)} – {formatDay(weekEnd)}
              </span>
              <StatusPill status={status} />
              <div className="flex items-center gap-2 justify-end">
                <div className="w-14 h-1.5 rounded-full bg-surface2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct === 100 ? "bg-success" : "bg-accent"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted w-8 text-right">{pct}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Done: "bg-success/15 text-success border-success/30",
    "This week": "bg-accent/15 text-accent border-accent/30",
    Upcoming: "bg-surface2 text-muted border-border",
    Overdue: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span className={`font-mono text-[10px] px-2 py-1 rounded-full border w-fit ${styles[status]}`}>{status}</span>
  );
}
