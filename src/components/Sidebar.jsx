import { TRACK_LIST } from "../data/tracks";
import { currentUnitIndex } from "../utils/schedule";

export default function Sidebar({
  track,
  userEmail,
  onSwitch,
  onHome,
  onLogout,
  view,
  setView,
  activeModule,
  setActiveModule,
  stats,
  startDate,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const handleNav = (fn) => (...args) => {
    fn(...args);
    setMobileOpen(false);
  };

  const modules = track.modules;
  const thisUnit = currentUnitIndex(startDate, modules.length, track.unitDays);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`
          ${collapsed ? "md:w-[68px]" : "md:w-[280px]"} w-[280px] shrink-0 h-screen
          fixed md:sticky top-0 z-40 border-r border-border bg-surface/95 md:bg-surface/70 backdrop-blur-sm flex flex-col transition-all duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="px-4 py-5 flex items-center justify-between border-b border-border">
          {!collapsed && (
            <button onClick={handleNav(onHome)} className="text-left group" title="Back to track selection">
              <p className="font-display font-semibold text-[15px] tracking-tight leading-none group-hover:text-accent transition-colors">
                {track.short}_MODE
              </p>
              <p className="font-mono text-[10px] text-muted mt-1">{track.mono}</p>
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-7 h-7 rounded-md border border-border items-center justify-center text-muted hover:text-text hover:border-accent transition-colors"
              aria-label="Toggle sidebar"
            >
              <span className="font-mono text-xs">{collapsed ? "»" : "«"}</span>
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted hover:text-text hover:border-accent transition-colors"
              aria-label="Close menu"
            >
              <span className="font-mono text-xs">✕</span>
            </button>
          </div>
        </div>

        {/* Track switcher — a segmented control, so it always reads as two
            distinct sections rather than one merged curriculum. */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="flex gap-1 p-1 rounded-lg bg-surface2 border border-border">
              {TRACK_LIST.map((t) => (
                <button
                  key={t.id}
                  onClick={handleNav(() => onSwitch(t.id))}
                  className={`flex-1 px-2 py-1.5 rounded-md font-mono text-[10px] tracking-wide transition-colors ${
                    t.id === track.id
                      ? "bg-surface3 text-text ring-1 ring-accent/40"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {t.short}
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="px-3 pt-3 flex flex-col gap-1">
          <NavButton
            label="Dashboard"
            mono="00"
            collapsed={collapsed}
            active={view === "dashboard"}
            onClick={handleNav(() => setView("dashboard"))}
          />
          <NavButton
            label="Timetable"
            mono="TT"
            collapsed={collapsed}
            active={view === "timetable"}
            onClick={handleNav(() => setView("timetable"))}
          />
        </nav>

        <div className="mt-5 px-3 flex items-center justify-between">
          {!collapsed && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{track.navLabel}</p>
          )}
        </div>

        {/* Signature element: connected node rail representing the roadmap */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
          <div className="relative">
            {modules.map((m, idx) => {
              const pct = stats.perModule[m.id]?.pct ?? 0;
              const isDone = pct === 100;
              const isActive = view === "module" && activeModule === m.id;
              const isLast = idx === modules.length - 1;
              const isThisUnit = idx === thisUnit;

              return (
                <div key={m.id} className="relative flex gap-3">
                  {/* Node + connecting line */}
                  <div className="flex flex-col items-center">
                    <div
                      title={isThisUnit ? `Scheduled for this ${track.unitLong}` : undefined}
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 border transition-all
                        ${isDone ? "bg-success/20 border-success text-success" : ""}
                        ${!isDone && pct > 0 ? "bg-accent/20 border-accent text-accent" : ""}
                        ${pct === 0 ? "bg-surface2 border-border text-muted" : ""}
                        ${isActive ? "shadow-glow" : ""}
                        ${isThisUnit && !isDone ? "pulse" : ""}
                      `}
                    >
                      {isDone ? "✓" : idx + 1}
                    </div>
                    {!isLast && (
                      <div className={`w-px flex-1 min-h-[28px] ${isDone ? "bg-success/50" : "bg-border"}`} />
                    )}
                  </div>

                  {/* Label */}
                  {!collapsed && (
                    <button
                      onClick={handleNav(() => {
                        setActiveModule(m.id);
                        setView("module");
                      })}
                      className="text-left flex-1 pb-6 group"
                    >
                      <div
                        className={`rounded-lg px-2.5 py-2 -ml-2.5 transition-colors ${
                          isActive ? "bg-surface3 ring-1 ring-accent/40" : "group-hover:bg-surface2"
                        }`}
                      >
                        <p className="font-mono text-[9px] text-muted mb-0.5">
                          {track.unit} {m.week} · {m.hours}H
                          {stats.perModule[m.id]?.lessonsTotal > 0 && (
                            <> · {stats.perModule[m.id].lessonsDone}/{stats.perModule[m.id].lessonsTotal} READ</>
                          )}
                        </p>
                        <p
                          className={`text-[12.5px] leading-snug font-medium ${
                            isActive ? "text-text" : "text-text/85"
                          }`}
                        >
                          {m.title}
                        </p>
                        <div className="w-full h-[3px] rounded-full bg-surface2 mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isDone ? "bg-success" : "bg-accent"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Account footer */}
        <div className="px-3 py-3 border-t border-border">
          {collapsed ? (
            <button
              onClick={handleNav(onLogout)}
              title={userEmail ? `Log out (${userEmail})` : "Log out"}
              className="w-full flex items-center justify-center h-8 rounded-md border border-border text-muted hover:text-text hover:border-accent transition-colors"
            >
              <span className="font-mono text-[10px]">⎋</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-muted truncate" title={userEmail}>
                {userEmail}
              </span>
              <button
                onClick={handleNav(onLogout)}
                className="shrink-0 font-mono text-[10px] px-2 py-1 rounded-md border border-border text-muted hover:text-text hover:border-accent/50 transition-colors"
              >
                LOG OUT
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function NavButton({ label, mono, collapsed, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors ${
        active ? "bg-surface3 text-text ring-1 ring-accent/40" : "text-muted hover:text-text hover:bg-surface2"
      }`}
    >
      <span className="font-mono text-[10px] w-5 text-center opacity-70">{mono}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}
