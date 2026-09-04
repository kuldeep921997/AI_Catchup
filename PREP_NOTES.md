# Interview Prep Notes

Organized by prep-tracker phase (Week 1–14). If a note is relevant to more than
one phase, it's filed under each — duplication here is intentional, not a
mistake. Newest entries at the top of each phase section.

---

## Phase 1 — JavaScript Core: The Senior Bar (Week 1, Fundamentals)

### 2026-09-03 — useMemo vs the JavaScript event loop

**Core answer:** `useMemo` has nothing to do with the event loop. It's a synchronous
cache inside React's render phase — no queueing, no deferral.

**Frame timeline:**

| Phase | What runs | Blocks paint? |
|---|---|---|
| Render | Component function — `useState`, `useMemo`, `useCallback` | Yes |
| Commit | React mutates the DOM | Yes |
| `useLayoutEffect` | Synchronous, after mutation | Yes |
| **Paint** | Browser draws | — |
| `useEffect` | After the frame is on screen | No |

Render + commit run inside **one task**. Browser can't paint until the task ends.
~16.7ms budget for 60fps; >50ms is an official "long task" (hurts INP).

**Gotchas worth saying out loud in an interview:**
- Memoization isn't free — deps array allocation + comparison + retained memory on
  every render. Over-memoizing cheap computations can be net slower.
- It's a hint, not a guarantee — React may discard the cache. Never rely on it for
  correctness, only performance.

---

## Phase 2 — TypeScript for Large Frontends (Week 2, Fundamentals)

*(no notes yet)*

---

## Phase 3 — React Internals & the Rendering Model (Week 3, React)

### 2026-09-03 — useMemo vs the JavaScript event loop

**Where useMemo fits:** it shortens the render task by *skipping* work — that's
the whole mechanism. It does not move work off-thread and does not yield to the
event loop. It's a plain synchronous cache evaluated inline during render.

**Tools that actually touch scheduling, vs. useMemo:**

| Tool | Effect |
|---|---|
| `useMemo` | Nothing — just reduces how often work runs |
| `useTransition` / `useDeferredValue` | Genuinely schedules — React yields mid-render via `MessageChannel` (a macrotask) so the browser can paint/handle input |
| Web Worker | Moves work off the main thread entirely |
| Virtualization | Reduces the volume of work, not its frequency |

**Gotchas:**
- Over-memoizing cheap computations can be net slower (deps array cost + retained
  memory on every render).
- `useMemo` is a hint, not a guarantee — React may discard the cache. Never rely
  on it for correctness.

---

## Phase 4 — Frontend Performance Engineering (Week 4, Performance)

### 2026-09-03 — useMemo vs the JavaScript event loop (performance framing)

**Frame budget:** render + commit run inside one task; browser can't paint until
it ends. ~16.7ms for 60fps; >50ms is a "long task" and hurts INP.

**Tie-back to my Jio dashboard story (8s → 3s):** the win came from virtualization
+ code-splitting (reducing the actual volume of work) plus memoized selectors —
not from `useMemo` alone.

If asked "why not just memoize the whole render?" — the answer: memoizing a
50k-row render still renders 50k rows on first paint and on every data change.
Had to reduce the work, not cache it. `useMemo` only helps when the same inputs
recur across renders; it does nothing for first-render or always-changing-input
cost.

**Levers, ranked by what they actually do:**

| Tool | Effect |
|---|---|
| Virtualization | Reduces the volume of work |
| Code-splitting | Reduces work done upfront |
| `useMemo` / `useCallback` | Reduces how often existing work re-runs |
| `useTransition` / `useDeferredValue` | Yields control back to the browser mid-render |
| Web Worker | Moves work off the main thread |

---

## Phase 5 — Testing: Jest, RTL and Playwright (Week 5, Quality)

*(no notes yet)*

---

## Phase 6 — Browser, Network and Security (Week 6, Platform)

*(no notes yet)*

---

## Phase 7 — CSS Architecture and Accessibility (Week 7, Platform)

*(no notes yet)*

---

## Phase 8 — Machine Coding Rounds (Week 8, Interview Rounds)

*(no notes yet)*

---

## Phase 9 — Frontend System Design (Week 9, Interview Rounds)

*(no notes yet)*

---

## Phase 10 — LLD and Design Patterns for Frontend (Week 10, Interview Rounds)

*(no notes yet)*

---

## Phase 11 — HLD and Distributed Systems Recall (Week 11, Interview Rounds)

*(no notes yet)*

---

## Phase 12 — DSA Maintenance (Week 12, Interview Rounds)

*(no notes yet)*

---

## Phase 13 — Narrative, Behavioural and Negotiation (Week 13, Strategy)

*(no notes yet)*

---

## Phase 14 — Company Tracks and Offer Strategy (Week 14, Strategy)

*(no notes yet)*

---

## Unfiled

Notes that don't map cleanly to a phase above land here until they find a home.
