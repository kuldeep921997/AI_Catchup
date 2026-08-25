import { useMemo, useRef, useState } from "react";
import curriculum from "../data/curriculum";

function fmtHours(minutes) {
  if (!minutes) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function Dashboard({ stats, setView, setActiveModule, exportData, importData, resetAll }) {
  const fileInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);

  const tagBreakdown = useMemo(() => {
    const map = {};
    curriculum.forEach((m) => {
      if (!map[m.tag]) map[m.tag] = { total: 0, done: 0 };
      map[m.tag].total += stats.perModule[m.id].total;
      map[m.tag].done += stats.perModule[m.id].done;
    });
    return Object.entries(map).map(([tag, v]) => ({
      tag,
      pct: v.total ? Math.round((v.done / v.total) * 100) : 0,
    }));
  }, [stats]);

  const nextModule = curriculum.find((m) => stats.perModule[m.id].pct < 100);
  const totalHours = curriculum.reduce((a, m) => a + m.hours, 0);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genai-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importData(ev.target.result);
      setImportMsg(
        ok
          ? { ok: true, text: "Progress imported." }
          : { ok: false, text: "That file isn't a progress export from this app." }
      );
    };
    reader.onerror = () => setImportMsg({ ok: false, text: "Could not read that file." });
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="font-mono text-xs text-accent2 tracking-widest mb-2">GENAI CATCH-UP · 16-WEEK ROADMAP</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Welcome back. Here's the state of the model.
        </h1>
        <p className="text-muted mt-2 max-w-2xl leading-relaxed">
          {curriculum.length} modules and {stats.lessonsTotal} in-depth lessons — from attention math to Nvidia
          inference pipelines. Read the lessons, then check off the concepts you can explain, the formulas you can
          derive, and the questions you can answer without notes.
        </p>
      </header>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="Overall progress" value={`${stats.overallPct}%`} accent="text-accent" />
        <StatCard
          label="Lessons read"
          value={`${stats.lessonsDone} / ${stats.lessonsTotal}`}
          accent="text-accent2"
        />
        <StatCard
          label="Modules mastered"
          value={`${stats.modulesCompleted} / ${curriculum.length}`}
          accent="text-success"
        />
        <StatCard label="Items completed" value={`${stats.doneItems} / ${stats.totalItems}`} accent="text-amber" />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] text-muted tracking-wide mb-1">READING PROGRESS</p>
          <p className="text-sm text-text/90">
            <span className="font-display text-lg font-semibold text-text">{fmtHours(stats.readMinutes)}</span>
            <span className="text-muted"> of {fmtHours(stats.totalMinutes)} read</span>
            <span className="text-muted"> · {fmtHours(stats.totalMinutes - stats.readMinutes)} remaining</span>
          </p>
        </div>
        <div className="flex-1 min-w-[180px] h-2 rounded-full bg-surface2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent2 to-accent transition-all"
            style={{ width: `${stats.totalMinutes ? (stats.readMinutes / stats.totalMinutes) * 100 : 0}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-muted">{totalHours}h planned study time</span>
      </div>

      {/* Continue where you left off */}
      {nextModule && (
        <button
          onClick={() => {
            setActiveModule(nextModule.id);
            setView("module");
          }}
          className="w-full text-left mb-8 rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-muted mb-1">CONTINUE · WEEK {nextModule.week}</p>
              <p className="font-display text-lg font-semibold">{nextModule.title}</p>
              <p className="text-sm text-muted mt-1 max-w-xl">{nextModule.why}</p>
              <p className="font-mono text-[10px] text-accent2 mt-2">
                {stats.perModule[nextModule.id].lessonsDone}/{stats.perModule[nextModule.id].lessonsTotal} lessons
                read
              </p>
            </div>
            <div className="font-mono text-accent text-2xl group-hover:translate-x-1 transition-transform shrink-0">
              →
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface2 mt-4 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${stats.perModule[nextModule.id].pct}%` }}
            />
          </div>
        </button>
      )}

      {/* Tag breakdown */}
      <div className="rounded-xl border border-border bg-surface p-5 mb-8">
        <p className="font-mono text-[10px] text-muted mb-4 tracking-wider">PROGRESS BY TRACK</p>
        <div className="space-y-3">
          {tagBreakdown.map((t) => (
            <div key={t.tag} className="flex items-center gap-4">
              <span className="text-sm w-40 shrink-0 text-text/90">{t.tag}</span>
              <div className="flex-1 h-2 rounded-full bg-surface2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full transition-all"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
              <span className="font-mono text-xs text-muted w-10 text-right">{t.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data controls */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="font-mono text-[10px] text-muted mb-3 tracking-wider">YOUR DATA</p>
        <p className="text-sm text-muted mb-4">
          Progress is saved locally in your browser only. Export a backup before clearing browser data, or to move
          to another machine.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-surface3 border border-border text-sm hover:border-accent/50 transition-colors"
          >
            Export progress (.json)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-surface3 border border-border text-sm hover:border-accent/50 transition-colors"
          >
            Import progress
          </button>
          <input
            type="file"
            accept="application/json,.json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => {
              if (resetAll()) setImportMsg({ ok: true, text: "Progress reset." });
            }}
            className="px-4 py-2 rounded-lg bg-surface3 border border-border text-sm text-red-400 hover:border-red-400/50 transition-colors"
          >
            Reset all progress
          </button>
        </div>
        {importMsg && (
          <p className={`text-xs mt-3 ${importMsg.ok ? "text-success" : "text-red-400"}`} role="status">
            {importMsg.text}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="font-mono text-[10px] text-muted mb-2 tracking-wide">{label.toUpperCase()}</p>
      <p className={`font-display text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
