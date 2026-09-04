// Two tracks share one engine.
//
// Everything that differs between the GenAI curriculum and the interview-prep
// sprint lives here as data, so the components stay generic. Adding a third
// track later means adding an entry to TRACKS and nothing else.
//
// storageKey is load-bearing: the learning track MUST keep the original
// "ai-catchup-progress-v1" key or existing progress is orphaned.

import learnModules from "./curriculum";
import prepModules from "./prep";
import prepQaNotes from "./qaNotes";

export const TRACKS = {
  learn: {
    id: "learn",
    label: "Learning",
    short: "LEARN",
    mono: "/genai_roadmap",
    kicker: "GENAI CATCH-UP · 16-WEEK ROADMAP",
    title: "GenAI Engineering",
    tagline: "Build the mental model, from attention math to inference pipelines.",
    blurb:
      "Sixteen modules of book-style reading that take you from linear algebra to serving quantised models on Nvidia hardware. Depth over breadth — the goal is to understand mechanism, not to collect vocabulary.",
    storageKey: "ai-catchup-progress-v1",
    exportPrefix: "genai-progress",
    modules: learnModules,
    accentClass: "text-accent",
    unit: "WEEK",
    unitLong: "week",
    unitDays: 7,
    navLabel: "Learning Path",
    scheduleTitle: "16-week timetable",
    scheduleBlurb:
      "One module per week at roughly {avg} hrs/week (~1–1.5 hrs on weekdays). Dates auto-shift from the day you started — fall behind and it'll flag as overdue, not judge you.",
    tabs: { theory: "Recall", math: "Math", practice: "Practice" },
    hints: {
      theory: "After reading, check off each concept you could explain out loud, without notes.",
      practice:
        "A mix of theoretical and mathematical questions. Work them out on paper — check one off once you can answer it without notes.",
    },
    practiceKinds: { math: "MATH / NUMERICAL", theory: "THEORY" },
    notePlaceholder:
      "Write your own explanation of attention, worked-out derivations, links you found useful, questions to ask a mentor...",
    qaNotes: [],
  },

  prep: {
    id: "prep",
    label: "Interview Prep",
    short: "PREP",
    mono: "/senior_frontend",
    kicker: "SENIOR FRONTEND · 28-DAY SPRINT",
    title: "Senior Frontend Interview Prep",
    tagline: "Everything between where you are and a 35 LPA offer.",
    blurb:
      "Fourteen modules covering the rounds that actually decide senior frontend offers: machine coding, frontend system design, React internals, performance, testing, and the narrative work most candidates skip entirely.",
    storageKey: "fe-prep-progress-v1",
    exportPrefix: "prep-progress",
    modules: prepModules,
    accentClass: "text-amber",
    unit: "PHASE",
    unitLong: "phase",
    unitDays: 2,
    navLabel: "Prep Path",
    scheduleTitle: "28-day sprint plan",
    scheduleBlurb:
      "Two days per module at roughly {avg} hrs each — 4–5 hrs on weekdays, 8–10 at weekends. Dates shift from the day you started. Start applying around day 8; first screens take 2–3 weeks to convert, so the calendar works in your favour.",
    tabs: { theory: "Recall", math: "Patterns", practice: "Drills" },
    hints: {
      theory:
        "Check one off only when you can explain it out loud, unprompted, with no notes. Recognition is not recall, and interviews test recall.",
      practice:
        "Timed drills. Set a visible timer, no AI assistance, no copy-paste from old work. Check one off once you've completed it inside the time box.",
    },
    practiceKinds: { math: "TIMED BUILD", theory: "EXPLAIN OUT LOUD" },
    notePlaceholder:
      "Mock interview feedback, questions you froze on, your own explanation of tricky topics, company-specific notes, numbers to quote...",
    qaNotes: prepQaNotes,
  },
};

export const TRACK_LIST = [TRACKS.learn, TRACKS.prep];

export const DEFAULT_TRACK = "prep";
