// Curated Q&A notes, filed under one or more prep phases.
//
// These are distinct from the personal "Notes" textarea in ModuleView: that
// textarea is free-form scratch space owned entirely by the user and lives in
// localStorage. This file is authored content — answers worked out during
// prep conversations — checked into the repo so it survives a localStorage
// reset and can be tagged to every phase it's relevant to.
//
// Schema:
//   id       stable string, used as the React key
//   date     ISO date string, "YYYY-MM-DD"
//   title    short heading shown in the tab
//   phases   array of module ids (e.g. "p01") this note should appear under.
//            A note relevant to multiple phases is listed in all of them —
//            do not pick just one; duplication here is intentional.
//   blocks   content in the same block schema as lessons (see ./blocks.js),
//            so it renders through the existing <Block> renderer.

const qaNotes = [
  {
    id: "q-2026-09-03-usememo-event-loop",
    date: "2026-09-03",
    title: "useMemo vs the JavaScript event loop",
    phases: ["p01", "p03", "p04"],
    blocks: [
      {
        t: "note",
        tone: "insight",
        title: "The one-line answer",
        text: "`useMemo` has nothing to do with the event loop. It's a synchronous cache inside React's render phase — no queueing, no deferral.",
      },
      { t: "h", text: "Frame timeline" },
      {
        t: "table",
        head: ["Phase", "What runs", "Blocks paint?"],
        rows: [
          ["Render", "Component function — `useState`, `useMemo`, `useCallback`", "Yes"],
          ["Commit", "React mutates the DOM", "Yes"],
          ["`useLayoutEffect`", "Synchronous, after mutation", "Yes"],
          ["**Paint**", "Browser draws", "—"],
          ["`useEffect`", "After the frame is on screen", "No"],
        ],
      },
      {
        t: "p",
        text: "Render and commit run inside **one task**. The browser can't paint until that task ends. Budget is ~16.7ms for 60fps; anything over 50ms is an official \"long task\" and hurts INP.",
      },
      { t: "h", text: "Where useMemo actually fits" },
      {
        t: "p",
        text: "It shortens the render task by *skipping* work — that's the whole mechanism. It does not move work off-thread and does not yield to the event loop.",
      },
      {
        t: "table",
        head: ["Tool", "Effect"],
        rows: [
          ["`useMemo`", "Nothing on the event loop — just reduces how often work runs"],
          ["`useTransition` / `useDeferredValue`", "Genuinely schedules — React yields mid-render via `MessageChannel` (a macrotask) so the browser can paint/handle input"],
          ["Web Worker", "Moves work off the main thread entirely"],
          ["Virtualization", "Reduces the volume of work, not its frequency"],
        ],
      },
      {
        t: "note",
        tone: "warn",
        title: "Two gotchas worth saying out loud",
        text: "Memoization isn't free — deps-array allocation, comparison, and retained memory on every render. Over-memoizing cheap computations can be net slower. And it's a hint, not a guarantee: React may discard the cache, so never rely on it for correctness, only performance.",
      },
      {
        t: "note",
        tone: "interview",
        title: "Tie back to the Jio dashboard story (8s → 3s)",
        text: "The win came from virtualization + code-splitting (reducing the actual volume of work) plus memoized selectors — not from useMemo alone. If asked \"why not just memoize the whole render,\" the answer: memoizing a 50k-row render still renders 50k rows on first paint and on every data change. Had to reduce the work, not cache it.",
      },
    ],
  },
  {
    id: "q-2026-09-03-event-emitter",
    date: "2026-09-03",
    title: "Build EventEmitter: on / off / once / emit",
    phases: ["p08", "p10"],
    blocks: [
      {
        t: "note",
        tone: "interview",
        title: "Why this question gets asked",
        text: "It tests three things in one prompt: closures/private state, array mutation during iteration, and API contract precision (return values, `this` binding, chaining). It's also literally the Observer pattern, so it double-counts for the LLD round.",
      },
      { t: "h", text: "What it is, before any code" },
      {
        t: "p",
        text: "The problem: if A calls B directly, A has to import B and know its exact function name — tightly coupled, and adding a third listener means editing A again. An EventEmitter flips this: A announces \"thing X happened\" without knowing who's listening. Anyone interested separately says \"tell me when X happens.\" This is the **Observer pattern**, also called **pub-sub**.",
      },
      {
        t: "list",
        items: [
          "**Subscribe** — \"call this function whenever event X happens\" (`on`, `addEventListener`).",
          "**Unsubscribe** — \"stop calling that function\" (`off`, `removeEventListener`) — needed so components can clean up on unmount without leaking memory.",
          "**Publish** — \"X just happened, here's the data, tell everyone listening\" (`emit`, `dispatchEvent`).",
        ],
      },
      {
        t: "table",
        head: ["Where it shows up", "What it looks like"],
        rows: [
          ["Node.js core", "Built-in `EventEmitter` class — streams, HTTP requests, file watchers all use `.on('data'|'end'|'error', ...)`"],
          ["The browser", "`addEventListener`/`removeEventListener`/`dispatchEvent` is on/off/emit under a different name"],
          ["Redux", "`store.subscribe(cb)` registers a listener; `dispatch(action)` notifies every subscriber after the reducer runs"],
          ["socket.io / WebSocket wrappers", "`.on('message', ...)` fans real-time server data out to whichever UI pieces care"],
          ["Kafka / RabbitMQ", "Same pattern at distributed-systems scale — producers emit, consumers subscribe, no direct calls between services"],
        ],
      },
      {
        t: "note",
        tone: "analogy",
        title: "Tie-back: the Jio Kafka → browser pipeline",
        text: "Once a message arrives over the WebSocket, several unrelated UI pieces likely need to react to it — a toast, a badge counter, a row highlight. Rather than the connection handler importing and calling each one directly, it emits one event once; each widget subscribes independently to what it cares about. That's the real architectural decision this toy problem is standing in for.",
      },
      { t: "h", text: "Reference implementation" },
      {
        t: "code",
        lang: "javascript",
        caption: "EventEmitter — on/off/once/emit",
        code: `class EventEmitter {
  #events = new Map(); // event name -> array of listener fns

  on(ev, fn) {
    if (typeof fn !== "function") throw new TypeError("listener must be a function");
    const list = this.#events.get(ev);
    if (list) list.push(fn);
    else this.#events.set(ev, [fn]);
    return this; // chainable: emitter.on('a', f).on('b', g)
  }

  off(ev, fn) {
    const list = this.#events.get(ev);
    if (!list) return this;
    // match the listener itself, or the original fn wrapped by once()
    const idx = list.findIndex((l) => l === fn || l.__original === fn);
    if (idx !== -1) list.splice(idx, 1);
    if (list.length === 0) this.#events.delete(ev);
    return this;
  }

  once(ev, fn) {
    const wrapper = (...args) => {
      this.off(ev, wrapper);
      fn.apply(this, args);
    };
    wrapper.__original = fn; // lets off(ev, fn) remove it before it ever fires
    return this.on(ev, wrapper);
  }

  emit(ev, ...args) {
    const list = this.#events.get(ev);
    if (!list || list.length === 0) return false;
    // Snapshot before iterating -- a listener can call on()/off() mid-emit,
    // and mutating the live array during iteration skips or double-fires entries.
    for (const fn of list.slice()) fn.apply(this, args);
    return true;
  }
}`,
      },
      { t: "h", text: "Why each decision, not something else" },
      {
        t: "list",
        items: [
          "**Array, not `Set`, for the listener list.** A `Set` silently dedupes `on('x', f); on('x', f)` into one call. Real `EventEmitter` fires `f` twice — reproduce that, don't hide it.",
          "**Snapshot before iterating in `emit`.** The gotcha that separates a working answer from a correct one. If listener A calls `off(ev, B)` before B has run, mutating the live array mid-loop skips or reruns entries. Copy once per `emit`, iterate the copy.",
          "**`once` needs a back-reference.** If the caller registers `once('x', f)` then calls `off('x', f)` before `x` ever fires, `off` must find the wrapper using only `f`. Tagging the wrapper with `.__original = f` makes that lookup possible.",
          "**`emit` returns a boolean, not a count.** Matches Node's real contract exactly: `true` if the event had listeners, `false` otherwise. Don't invent a different return shape unless asked.",
          "**`on`/`off` return `this`.** Chainable, matching Node's fluent style: `emitter.on('a', f).on('b', g)`.",
        ],
      },
      {
        t: "note",
        tone: "warn",
        title: "What happens if a listener throws?",
        text: "As written, the exception propagates and kills the rest of that emit's loop — same as Node's default (no special-cased 'error' event here). Say this out loud rather than silently swallowing errors; silent swallowing is only correct if the interviewer explicitly asks for listener isolation.",
      },
      { t: "h", text: "Follow-ups worth having an answer for" },
      {
        t: "table",
        head: ["Follow-up", "Answer shape"],
        rows: [
          ["Async listeners?", "`emitAsync` doing `Promise.all(list.slice().map(fn => fn(...args)))`, resolves once every listener's promise settles"],
          ["Listener leak detection?", "Track a `maxListeners` count per event, warn past a threshold — mirrors Node's `MaxListenersExceededWarning`"],
          ["Wildcard / namespaced events?", "Store an extra `'*'` bucket checked on every `emit`, or split event names on a delimiter and walk parent namespaces"],
        ],
      },
      {
        t: "note",
        tone: "analogy",
        title: "Where this shows up in real frontend work",
        text: "Redux's `subscribe`/notify internals, React's `useSyncExternalStore`, and any WebSocket wrapper exposing `.on('message', ...)` are the same on/off/emit shape under a different name.",
      },
    ],
  },
  {
    id: "q-2026-09-03-long-tasks-inp",
    date: "2026-09-03",
    title: "Long tasks, the 50ms threshold, and INP",
    phases: ["p01", "p04", "p06"],
    blocks: [
      { t: "h", text: "What makes a \"task\" a task" },
      {
        t: "p",
        text: "A task (macrotask) is a discrete unit of work the main thread runs start-to-finish before doing anything else — a script execution, a click handler firing, a `setTimeout` callback. The event loop pulls one task, runs it fully, drains any microtasks it spawned, then checks whether to render a frame before picking up the next task. The main thread is single-threaded and cooperative, not preemptive: it cannot interrupt a running task, no matter how urgent the next thing waiting is.",
      },
      { t: "h", text: "Why 50ms specifically" },
      {
        t: "p",
        text: "The Long Tasks API flags any task running **50ms or more** as long. The number comes from the same perception research behind Google's RAIL model: ~100ms is roughly where a response to input stops feeling instantaneous. Total interaction latency is input delay + processing + presentation — leaving headroom for the rest of that chain means no single task can be allowed to eat the whole 100ms budget by itself. It's an engineering cutoff, not a perceptual cliff: the point past which one task can single-handedly blow the responsiveness budget.",
      },
      { t: "h", text: "How it connects to INP" },
      {
        t: "p",
        text: "INP (Interaction to Next Paint, the Core Web Vital that replaced FID in March 2024) measures input-to-painted-result latency across essentially every interaction on a page, reporting roughly the worst one. Good is ≤200ms, poor is >500ms. It has three phases, and long tasks inflate all of them.",
      },
      {
        t: "table",
        head: ["INP phase", "What it measures", "How a long task hurts it"],
        rows: [
          ["Input delay", "Time from tap/click until the browser is free to start the handler", "If a long task is already running when input arrives, the input queues behind it — worst case, waits nearly the full 50ms"],
          ["Processing time", "How long the event handler itself takes", "A heavy synchronous handler (big state update, big re-render, JSON parsing) *is* the long task"],
          ["Presentation delay", "Time from handler finishing to the frame actually painting", "Other queued tasks compete for the main thread before style/layout/paint can run"],
        ],
      },
      {
        t: "note",
        tone: "insight",
        title: "The causal chain, in one line",
        text: "Task exceeds 50ms → classified long → blocks whichever INP phase it overlaps → INP creeps past 200ms → Core Web Vitals score degrades → the interaction feels laggy, which is the entire point of the metric.",
      },
      {
        t: "note",
        tone: "warn",
        title: "Nuance: microtask chains count too",
        text: "A long synchronous run of `.then()` callbacks resolving each other counts toward the same 50ms as ordinary code — the microtask queue drains fully before the browser checks whether to render or move to the next task, so it's still \"inside\" the task from the event loop's perspective.",
      },
      { t: "h", text: "The fix toolbox (same territory as useMemo/useTransition)" },
      {
        t: "list",
        items: [
          "**Chunk and yield** — `scheduler.yield()`, the `MessageChannel` trick, or `requestIdleCallback` let the browser sneak in an input check or paint between chunks, so no single chunk crosses 50ms even if the total work is large.",
          "**`useTransition` / `startTransition`** — React 18 builds this exact mechanism in: it chunks a big re-render and yields between pieces via `MessageChannel`, a real macrotask boundary.",
          "**Web Workers** — remove the work from the main thread entirely; it structurally can't become a long task on the thread that owns input and paint.",
          "**Code-splitting** — reduces the size of the startup task; parsing/executing a big bundle during hydration is a classic long task that makes a page feel unresponsive to the very first tap.",
        ],
      },
      {
        t: "note",
        tone: "interview",
        title: "How you'd actually diagnose it",
        text: "Chrome DevTools' Performance panel flags long tasks in red on the main thread track. The `web-vitals` library's INP attribution build points to the specific interaction and DOM element responsible for the worst INP on a real page load — start there, not by guessing.",
      },
    ],
  },
];

export default qaNotes;
