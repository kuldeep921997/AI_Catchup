import { useMemo } from "react";
import { TRACK_LIST } from "../data/tracks";
import { peekTrackStats } from "../hooks/useProgress";

// Landing screen. Shown on first visit and reachable any time from the sidebar,
// so the two tracks stay visibly separate rather than blending into one list.
export default function TrackChooser({ onPick, userEmail, onLogout }) {
  const cards = useMemo(
    () =>
      TRACK_LIST.map((t) => ({
        track: t,
        stats: peekTrackStats(t, userEmail),
        lessons: t.modules.reduce((a, m) => a + (m.lessons?.length ?? 0), 0),
        minutes: t.modules.reduce(
          (a, m) => a + (m.lessons ?? []).reduce((b, l) => b + (l.minutes ?? 0), 0),
          0
        ),
      })),
    [userEmail]
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-6xl">
        {userEmail && onLogout && (
          <div className="flex items-center justify-end gap-3 mb-4">
            <span className="font-mono text-[10px] text-muted truncate max-w-[220px]">{userEmail}</span>
            <button
              onClick={onLogout}
              className="font-mono text-[10px] px-2.5 py-1 rounded-md border border-border text-muted hover:text-text hover:border-accent/50 transition-colors"
            >
              LOG OUT
            </button>
          </div>
        )}
        <header className="mb-10 text-center">
          <p className="font-mono text-xs text-accent2 tracking-widest mb-3">{TRACK_LIST.length} TRACKS · ONE ENGINE</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">What are you working on?</h1>
          <p className="text-muted mt-3 max-w-xl mx-auto leading-relaxed">
            Progress is tracked separately for each track, so you can switch between them without losing your place.
            You can change track at any time from the sidebar.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(({ track, stats, lessons, minutes }) => (
            <button
              key={track.id}
              onClick={() => onPick(track.id)}
              className="text-left rounded-2xl border border-border bg-surface p-6 hover:border-accent/60 hover:bg-surface2/50 transition-all group flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="font-mono text-[10px] px-2 py-1 rounded bg-surface2 border border-border text-muted">
                  {track.short}
                </span>
                <span className="font-mono text-accent text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>

              <h2 className="font-display text-2xl font-semibold tracking-tight">{track.title}</h2>
              <p className={`text-sm mt-1.5 ${track.accentClass}`}>{track.tagline}</p>
              <p className="text-sm text-muted mt-3 leading-relaxed flex-1">{track.blurb}</p>

              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
                <Metric label="Modules" value={track.modules.length} />
                <Metric label="Lessons" value={lessons} />
                <Metric label="Reading" value={`${Math.round(minutes / 60)}h`} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-muted tracking-wide">
                    {stats.done > 0 ? "IN PROGRESS" : "NOT STARTED"}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {stats.done} / {stats.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.pct === 100 ? "bg-success" : "bg-gradient-to-r from-accent2 to-accent"
                    }`}
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center font-mono text-[10px] text-muted/70 mt-10">
          Everything is stored locally in this browser. Export a backup from either dashboard.
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="font-display text-lg font-semibold">{value}</p>
      <p className="font-mono text-[9px] text-muted tracking-wide uppercase mt-0.5">{label}</p>
    </div>
  );
}
