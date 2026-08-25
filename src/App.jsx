import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ModuleView from "./components/ModuleView";
import Timetable from "./components/Timetable";
import useProgress from "./hooks/useProgress";
import curriculum from "./data/curriculum";

export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | timetable | module
  const [activeModule, setActiveModule] = useState(curriculum[0].id);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, toggle, setChecked, setNote, resetAll, exportData, importData, stats } = useProgress();

  return (
    <div className="flex min-h-screen bg-bg text-text font-body">
      <Sidebar
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
            stats={stats}
            setView={setView}
            setActiveModule={setActiveModule}
            exportData={exportData}
            importData={importData}
            resetAll={resetAll}
          />
        )}

        {view === "timetable" && (
          <Timetable stats={stats} startDate={state.startDate} setView={setView} setActiveModule={setActiveModule} />
        )}

        {view === "module" && (
          <ModuleView
            key={activeModule}
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
