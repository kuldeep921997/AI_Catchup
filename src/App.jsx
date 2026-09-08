import { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ModuleView from "./components/ModuleView";
import Timetable from "./components/Timetable";
import TrackChooser from "./components/TrackChooser";
import AuthGate from "./components/AuthGate";
import useProgress, { migrateLegacyProgressForUser } from "./hooks/useProgress";
import useAuth from "./hooks/useAuth";
import { TRACKS } from "./data/tracks";

const TRACK_KEY = "active-track-v1";

function loadTrack() {
  try {
    const saved = localStorage.getItem(TRACK_KEY);
    if (saved && TRACKS[saved]) return saved;
  } catch {
    /* storage unavailable — fall through to the chooser */
  }
  return null; // null => show the chooser
}

export default function App() {
  const { user, register, login, logout } = useAuth();

  // One-time inheritance of progress saved before multi-user support existed
  // (see migrateLegacyProgressForUser) — runs once per browser, the moment
  // someone is actually signed in.
  useEffect(() => {
    if (user) migrateLegacyProgressForUser(user);
  }, [user]);

  if (!user) return <AuthGate onLogin={login} onRegister={register} />;

  // Keying on the account email forces a full remount of everything below on
  // login/logout, so no state from a previous session can leak into the next
  // one on the same browser.
  return <AccountShell key={user} userEmail={user} onLogout={logout} />;
}

function AccountShell({ userEmail, onLogout }) {
  const [trackId, setTrackId] = useState(loadTrack);

  const pickTrack = useCallback((id) => {
    setTrackId(id);
    try {
      localStorage.setItem(TRACK_KEY, id);
    } catch {
      /* non-fatal: the choice just won't persist */
    }
  }, []);

  const clearTrack = useCallback(() => {
    setTrackId(null);
    try {
      localStorage.removeItem(TRACK_KEY);
    } catch {
      /* non-fatal */
    }
  }, []);

  if (!trackId) return <TrackChooser onPick={pickTrack} userEmail={userEmail} onLogout={onLogout} />;

  // Remounting on track change is deliberate: useProgress reads localStorage in
  // a lazy initialiser, so a fresh mount is what loads the new track's state.
  return (
    <TrackShell
      key={trackId}
      track={TRACKS[trackId]}
      userEmail={userEmail}
      onSwitch={pickTrack}
      onHome={clearTrack}
      onLogout={onLogout}
    />
  );
}

function TrackShell({ track, userEmail, onSwitch, onHome, onLogout }) {
  const [view, setView] = useState("dashboard"); // dashboard | timetable | module
  const [activeModule, setActiveModule] = useState(track.modules[0].id);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, toggle, setChecked, setNote, resetAll, exportData, importData, stats } = useProgress(
    track,
    userEmail
  );

  return (
    <div className="flex min-h-screen bg-bg text-text font-body">
      <Sidebar
        track={track}
        userEmail={userEmail}
        onSwitch={onSwitch}
        onHome={onHome}
        onLogout={onLogout}
        view={view}
        setView={setView}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        stats={stats}
        startDate={state.startDate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 px-6 md:px-10 py-8 md:py-10 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden mb-6 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-muted"
        >
          <span className="font-mono text-xs">☰</span> Menu
        </button>

        {view === "dashboard" && (
          <Dashboard
            track={track}
            stats={stats}
            setView={setView}
            setActiveModule={setActiveModule}
            exportData={exportData}
            importData={importData}
            resetAll={resetAll}
          />
        )}

        {view === "timetable" && (
          <Timetable
            track={track}
            stats={stats}
            startDate={state.startDate}
            setView={setView}
            setActiveModule={setActiveModule}
          />
        )}

        {view === "module" && (
          <ModuleView
            key={activeModule}
            track={track}
            moduleId={activeModule}
            state={state}
            toggle={toggle}
            setChecked={setChecked}
            setNote={setNote}
            stats={stats}
            setActiveModule={setActiveModule}
          />
        )}
      </main>
    </div>
  );
}
