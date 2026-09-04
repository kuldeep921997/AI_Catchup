const p08 = {
  id: "p08",
  week: 8,
  hours: 12,
  title: "Machine Coding Rounds",
  tag: "Interview Rounds",
  why: "This is the round that decides senior frontend offers in India. Sixty to ninety minutes, a blank editor, an interviewer watching, and a component that has to actually work by the end. You have shipped harder things than any of these problems at Jio, but you have never explicitly trained for the format — and the format is what is being marked. Treat this as a discipline to drill, not a topic to revise.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "The scoring rubric: what the interviewer is actually marking",
      summary:
        "Most candidates optimise for the wrong thing. The sheet rewards working code, sane decomposition, correct state placement, voiced edge cases and cleanup — in that order — and it punishes silence.",
      blocks: [
        {
          t: "p",
          text: "Machine coding rounds feel subjective from the candidate's chair. They are not. Interviewers at Flipkart, Swiggy, Razorpay and the retail GCCs work from a rubric with four to six named criteria, and they tick boxes while you type. Once you know the boxes, the round stops being a test of cleverness and becomes a test of process — which is trainable in a month.",
        },
        { t: "h", text: "The sheet, roughly as it is written" },
        {
          t: "table",
          head: ["Criterion", "Rough weight", "What loses the mark"],
          rows: [
            [
              "**It works**",
              "35%",
              "An elegant half-finished architecture. A broken build at minute 85. Nothing rendered until minute 60.",
            ],
            [
              "**Decomposition**",
              "20%",
              "One 400-line component, or the opposite — nine files for a star rating. No clear owner for each piece of behaviour.",
            ],
            [
              "**State placement**",
              "15%",
              "Prop drilling five levels. Redux for a dropdown's open flag. Derived data stored in state and then going stale.",
            ],
            [
              "**Edge cases**",
              "15%",
              "Never mentioning empty, loading, error, rapid clicks or out-of-order responses. Coding them is optional; *voicing* them is not.",
            ],
            [
              "**Cleanup and correctness**",
              "10%",
              "Listeners left attached, timers never cleared, requests never aborted. Seniors get marked down hard here; juniors get forgiven.",
            ],
            [
              "**Communication**",
              "5% on paper, decisive in practice",
              "Long silences. The interviewer cannot distinguish thinking from being stuck, so silence gets read as stuck.",
            ],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The single reframing that matters",
          text: "You are not being asked to write the best version of this component. You are being asked to demonstrate, inside ninety minutes, that you are someone worth handing a feature to. A rough-but-working autocomplete with three edge cases voiced out loud beats a beautifully abstracted one that does not render.",
        },
        { t: "h", text: "Working code before elegant code" },
        {
          t: "p",
          text: "The most common senior failure mode is premature abstraction. You have seven years of instinct telling you to extract a hook, generalise the data layer and define the prop contract before writing behaviour. That instinct is correct on a codebase that will live five years and wrong in a ninety-minute round. Build the vertical slice first, then refactor in front of them — the refactor itself scores points under communication.",
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Two openings. The second one gets the offer.",
          code: `// WRONG opening: 25 minutes of architecture, zero pixels.
// - types/index.ts
// - hooks/useAsyncResource.ts        (generic, cached, retried)
// - context/AutocompleteContext.tsx
// - components/Combobox/index.tsx    (still empty at minute 25)

// RIGHT opening: one file, ugly, on screen in 6 minutes.
function Autocomplete() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!q) { setItems([]); return; }
    fetch("/api/search?q=" + encodeURIComponent(q))
      .then((r) => r.json())
      .then(setItems);
  }, [q]);

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <ul>{items.map((i) => <li key={i.id}>{i.label}</li>)}</ul>
    </div>
  );
}

// Then, out loud: "That works but it fires on every keystroke and
// races. I'll add debounce and an AbortController next, then pull
// it into a useSearch hook." You just narrated your own rubric.`,
        },
        { t: "h", text: "Decomposition: split on behaviour, not on size" },
        {
          t: "list",
          items: [
            "A component should own **one** piece of behaviour. `SearchInput` owns typing. `ResultList` owns rendering and selection highlight. `useSearch` owns fetching, cancelling and caching.",
            "Split when a piece needs its **own state**, its **own render frequency**, or is **reused**. Do not split just because a file got long.",
            "Keep the container/presentational line honest: the container knows about the network, the leaf takes props and renders. This makes your components trivially testable, and you can say so.",
            "Name things for the domain, not the pattern. `CommentThread`, not `RecursiveListWrapper`. Interviewers read names as evidence of modelling ability.",
          ],
        },
        { t: "h", text: "State placement: the three questions" },
        {
          t: "list",
          ordered: true,
          items: [
            "**Can it be derived?** Then do not store it. `filteredRows` from `rows` and `query` is a computation, not state. Storing it is how you get two sources of truth and a stale-UI bug the interviewer will find.",
            "**Who is the lowest common ancestor of everyone who needs it?** Put it there. Not higher — hoisting state to the top re-renders the world. Not lower — then you need lifting mid-round.",
            "**Is it server data or UI data?** Server data wants a cache keyed by request (a `useFetch`, or React Query in production). UI data — open flags, hover index, form drafts — stays local. Reaching for a global store for a dropdown's open state is an instant mark against you.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The prop-drilling trap is a trap in both directions",
          text: "Passing a prop through two components is fine and you should say \"two levels is fine, I'm not adding context for this\". Passing it through five is a smell — reach for composition (pass the rendered node down) before reaching for context, and reach for context before reaching for Redux. Introducing Redux in a ninety-minute round is almost always the wrong call, and volunteering *why* it is wrong scores better than using it.",
        },
        { t: "h", text: "Edge cases: say them even when you do not code them" },
        {
          t: "list",
          items: [
            "**Empty** — no results, no comments yet, empty cart. What renders? A blank white box is a bug.",
            "**Loading** — first load versus refetch. A spinner that replaces existing content on every keystroke is worse than stale content plus a subtle indicator.",
            "**Error** — request failed. Is it retryable? Do you keep the last good data?",
            "**Race conditions** — two requests in flight, the slower one lands last. This is the single most-watched bug in machine coding rounds.",
            "**Rapid clicks** — double submit, spam-clicking a like button, dragging while a drag is already in progress. Guard with a disabled state or an idempotency key.",
            "**Boundaries** — first and last item in keyboard navigation, page 1 and the final page, deleting the only remaining row.",
            "**Long content** — a 200-character label, a 50,000-row list, a comment nested 30 deep. Say what breaks and what you would do.",
          ],
        },
        {
          t: "p",
          text: "The delivery matters. Do not stop coding to list edge cases; narrate them as you pass them. \"I'm not handling the empty state yet — I'll come back at minute 60 and render a `No results for X` row here.\" That sentence buys you the mark and costs you four seconds.",
        },
        { t: "h", text: "Cleanup: the criterion that separates senior from mid" },
        {
          t: "code",
          lang: "jsx",
          caption: "Every effect that starts something must stop it",
          code: `useEffect(() => {
  const controller = new AbortController();
  const timer = setTimeout(run, 300);
  const onKey = (e) => { if (e.key === "Escape") close(); };
  const es = new EventSource("/api/stream");

  window.addEventListener("keydown", onKey);
  es.onmessage = (e) => setEvents((prev) => [...prev, JSON.parse(e.data)]);

  async function run() {
    const res = await fetch(url, { signal: controller.signal });
    if (!controller.signal.aborted) setData(await res.json());
  }

  return () => {
    controller.abort();                              // in-flight request
    clearTimeout(timer);                             // pending timer
    window.removeEventListener("keydown", onKey);    // listener
    es.close();                                      // long-lived connection
  };
}, [url]);`,
        },
        {
          t: "note",
          tone: "interview",
          title: "You already have the story for this",
          text: "The Jio real-time layer consumes Kafka-published stock-on-hand events over SSE across the Store and Cluster portals. Every mounted view holds an `EventSource`; without `es.close()` in cleanup, an operator who navigates between five store views leaves five open streams and the browser starts dropping connections. When the cleanup question comes up, say that — a leak you have actually paid for is worth ten textbook answers.",
        },
        { t: "h", text: "One sentence of accessibility, every single time" },
        {
          t: "p",
          text: "You do not need a full ARIA implementation. You need one credible sentence per component, and one keyboard path that works. \"The listbox needs `role=\"listbox\"` with `aria-activedescendant` on the input so screen readers announce the highlighted option, and Escape has to close it without clearing the query.\" That is the whole mark. Retail GCCs — Walmart, Target, Lowe's — weight this noticeably higher than product startups do, because they have legal accessibility obligations.",
        },
        { t: "h", text: "Narration: silence reads as uncertainty" },
        {
          t: "list",
          items: [
            "State the plan before you type it: \"I'll lift `activeIndex` into the parent so both the input and the list can read it.\"",
            "Name the trade-off when you take a shortcut: \"Using array index as key here because the list is append-only; if it were reorderable I'd need a stable id.\"",
            "When you are stuck, say the shape of the stuckness: \"I need the container height and I'm deciding between a ref plus ResizeObserver and just hardcoding 400px for now — I'll hardcode and note it.\"",
            "Never debug silently for more than about thirty seconds. Read the error out loud; interviewers frequently give you the answer for free.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Working beats elegant. Get pixels on screen in the first ten minutes.",
            "Decompose on behaviour; derive rather than store; keep UI state local.",
            "Voice every edge case you skip. The voicing is worth nearly as much as the code.",
            "Cleanup is where seniors get marked down. Abort, clear, remove, close.",
            "One accessibility sentence, one working keyboard path, continuous narration.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 18,
      title: "A repeatable ninety-minute method",
      summary:
        "The same five phases every time, with a clock. Improvisation is what makes candidates run out of time; a fixed budget is what makes the round feel survivable.",
      blocks: [
        {
          t: "p",
          text: "The candidates who finish are not faster typists. They are the ones running a routine they have run twenty times before, so no decision costs them thinking time. Internalise one budget and apply it to every problem, from a star rating to a kanban board. The phases stay the same; only the middle stretches.",
        },
        { t: "h", text: "The budget" },
        {
          t: "steps",
          items: [
            {
              title: "0-5 min — Clarify and state assumptions out loud",
              text: "Ask three to five questions, then *close* the requirements yourself. \"So: search box, results from an API, keyboard navigable, no framework beyond React. I'll assume the API returns at most 50 results and there's no pagination, and I'll stub the endpoint. Shout if any of that is wrong.\" Write the agreed scope as a comment at the top of the file — it becomes your checklist and your defence at minute 88.",
            },
            {
              title: "5-15 min — Sketch the component tree and the state shape",
              text: "Type it as comments, not on a whiteboard, so it stays visible. Name every component, name every piece of state and say where it lives and why. This is the phase candidates skip, and skipping it is why they are still lifting state at minute 70.",
            },
            {
              title: "15-55 min — Build the happy path",
              text: "One vertical slice, top to bottom, ugly is fine. Hardcode the data first, then wire the fetch. Do not style beyond what you need to see structure. Do not write tests unless asked. If you are not rendering something real by minute 25, cut scope out loud and keep moving.",
            },
            {
              title: "55-75 min — Edge cases and polish",
              text: "Now spend the marks you earned. In priority order: cancellation and races, loading and empty and error states, keyboard and focus behaviour, cleanup in every effect, then a minimal visual pass. Announce each one as you add it.",
            },
            {
              title: "75-90 min — Refactor out loud, then state what is left",
              text: "Extract the one hook that obviously wants extracting. Delete dead code. Then deliver a closing summary: what works, what you deliberately did not do, and what you would do with another day. Never let the round end on a silent editor.",
            },
          ],
        },
        {
          t: "table",
          head: ["If the round is...", "Clarify", "Design", "Build", "Edges", "Close"],
          rows: [
            ["45 min", "3 min", "5 min", "25 min", "8 min", "4 min"],
            ["60 min", "4 min", "8 min", "32 min", "11 min", "5 min"],
            ["90 min", "5 min", "10 min", "40 min", "20 min", "15 min"],
            ["Take-home, 3 hrs", "written README", "20 min", "90 min", "45 min", "tests + README"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The clock is a scoring instrument, not a constraint",
          text: "Announcing the budget at the start — \"I'll spend about ten minutes on structure, then build, and keep the last fifteen for edge cases and a refactor\" — does two things. It tells the interviewer you have done this before, and it gives them permission to redirect you early instead of watching you sink. Both are worth marks.",
        },
        { t: "h", text: "The clarifying questions that are always worth asking" },
        {
          t: "list",
          items: [
            "**Scope**: \"Which of these is in scope for the next hour, and which should I just describe?\"",
            "**Data**: \"Is there an endpoint I should hit, or shall I stub it? What does one item look like?\"",
            "**Scale**: \"Ten results or ten thousand?\" This single question decides whether you need virtualisation, and asking it signals you think about scale.",
            "**Libraries**: \"React only, or can I use a library for drag-and-drop?\" Most interviewers say no libraries for the core mechanic — but ask, do not assume.",
            "**Persistence**: \"Should state survive a reload?\" Cheap to answer, and `localStorage` is a two-line win if they say yes.",
            "**Accessibility and mobile**: \"Do you want keyboard support and touch, or is mouse-only acceptable for now?\" Asking is the mark; implementing is a bonus.",
            "**Definition of done**: \"If I only get one thing finished, which one do you most want to see?\" Ruthlessly useful. It hands you the interviewer's own priority list.",
          ],
        },
        { t: "h", text: "The first thing you type, every time" },
        {
          t: "code",
          lang: "jsx",
          caption: "Scope comment plus tree plus state shape — this is the 5-15 minute phase, typed",
          code: `/*
SCOPE (agreed)
  - search input, debounced 300ms
  - results from GET /api/search?q=  (max 50, no pagination)
  - arrow keys + Enter + Escape
  - cancel stale requests, cache by query
OUT OF SCOPE (said out loud)
  - multi-select, grouping, mobile touch, i18n

TREE
  <Autocomplete>              owns: query, activeIndex, isOpen
    <ComboboxInput>           props: value, onChange, onKeyDown
    <ResultList>              props: items, activeIndex, onPick
      <ResultRow>             props: item, isActive, onPick
  useSearch(query)            owns: items, status, error, cache, abort

STATE
  query        string      Autocomplete   controlled input
  activeIndex  number      Autocomplete   -1 = nothing highlighted
  isOpen       boolean     Autocomplete   derived-ish, but focus/blur needs it
  items        Item[]      useSearch      server data, keyed cache
  status       idle|loading|error|success
  NOT STATE: filteredItems (derive), resultCount (derive)
*/`,
        },
        {
          t: "p",
          text: "Notice the `NOT STATE` line. It costs one second to type and it pre-empts the most common follow-up question in the whole round. The interviewer sees you distinguishing state from derivation before you have written a single hook.",
        },
        { t: "h", text: "Build order inside the happy path" },
        {
          t: "list",
          ordered: true,
          items: [
            "Render hardcoded data. Prove the tree and the keys work before adding async.",
            "Make it interactive with local state. Typing changes something visible.",
            "Swap hardcoded data for the real (or stubbed) request. Only now do you meet async.",
            "Add the one behaviour the problem is *actually about* — debounce for autocomplete, recursion for comments, windowing for a virtual list, pointer handlers for drag.",
            "Stop. Look at the clock. If you are past minute 55, freeze features and move to edge cases.",
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The stub you should be able to type in sixty seconds, without thinking",
          code: `// Almost every problem needs fake data with realistic latency and a
// realistic failure rate. Typing this from memory in the first minutes
// buys you the whole round's demo surface and costs nothing.
const DB = Array.from({ length: 120 }, (_, i) => ({
  id: "id-" + i,
  label: "Item " + i,
  category: ["fruit", "veg", "dairy"][i % 3],
}));

function api(query, { signal } = {}) {
  return new Promise((resolve, reject) => {
    // Random latency is what surfaces the race condition on screen.
    const ms = 150 + Math.random() * 900;
    const timer = setTimeout(() => {
      if (Math.random() < 0.1) return reject(new Error("Network error"));
      const q = query.toLowerCase();
      resolve(DB.filter((r) => r.label.toLowerCase().includes(q)).slice(0, 20));
    }, ms);

    // Honour the signal, or your own abort code has nothing to abort.
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}`,
        },
        {
          t: "p",
          text: "The 10% failure rate and the variable latency are deliberate. They make your loading, error and race handling *visible* to the interviewer rather than theoretical — and an interviewer who watches a stale response get correctly discarded on screen does not need to ask whether you understood the problem.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Two ways candidates lose the round on the clock",
          text: "First: styling. Twenty minutes of CSS on a component whose logic is incomplete is the most expensive mistake available, and nobody is marking your border radius. Second: a rabbit hole — usually a drag-and-drop coordinate calculation or a date-maths bug. Set yourself a hard three-minute limit on any single bug, then hardcode past it, say \"I'm stubbing this to keep moving, the real fix is X\", and continue. A stubbed sub-problem with a named fix costs you almost nothing; a dead round costs you everything.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Practise against the clock you will actually get",
          text: "You lead four engineers and do about thirty reviews a sprint, so you are fluent at reading and judging code. That is a different muscle from producing code cold with someone watching. Run four full timed mocks before your first real onsite: laptop, no ChatGPT, no Stack Overflow beyond MDN, timer on screen, screen recorded. Watch fifteen minutes of the recording afterwards and count your silences longer than twenty seconds. That count, not the finished component, is the metric to improve first.",
        },
        { t: "h", text: "The closing script" },
        {
          t: "p",
          text: "Have this memorised, because minute 88 is when your working memory is worst. \"Working: typing, debounced fetch with cancellation, keyboard nav, empty and error states, cleanup on unmount. Deliberately skipped: caching across queries, mobile touch, virtualisation — the list is capped at fifty so windowing would be premature. With another day: extract `useSearch` into a shared hook, add tests for the race condition with fake timers, and add `aria-activedescendant` wiring for screen readers.\" Three sentences, and the interviewer writes down every one of them.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Same five phases, every problem, announced up front.",
            "Type the scope, tree and state shape as comments — including what is *not* state.",
            "Hardcode, then interact, then async, then the one hard mechanic.",
            "Three-minute limit per bug, then stub and narrate past it.",
            "Never end on silence. Close with works / skipped / would-do-next.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 24,
      title: "The reusable primitives",
      summary:
        "Roughly eight patterns cover almost every machine coding problem asked. Write each one until you can produce it from memory in under five minutes and the round becomes assembly, not invention.",
      blocks: [
        {
          t: "p",
          text: "The problem bank looks large and is not. Autocomplete, command palette, dropdown, tags input and search filter are one primitive with different chrome. Comments, file explorer, org chart and nested menus are one primitive. Kanban, sortable list and image reorder are one primitive. Learn the primitive, not the problem — then in the round you spend your thinking on the specifics instead of rediscovering roving tabindex under pressure.",
        },
        { t: "h", text: "Controlled versus uncontrolled, decided deliberately" },
        {
          t: "table",
          head: ["", "Controlled", "Uncontrolled"],
          rows: [
            ["Source of truth", "React state", "The DOM node"],
            ["Read the value via", "`value` in state", "`ref.current.value` or the submit event"],
            ["Re-renders per keystroke", "One", "Zero"],
            [
              "Use when",
              "You need to validate, format, filter or drive other UI as the user types",
              "Big forms where only submit matters; you are wrapping a third-party or native widget",
            ],
            [
              "In an interview",
              "Default. Autocomplete, filters, live validation all need it.",
              "Reach for it when asked about a 60-field form's performance — that is the expected answer.",
            ],
          ],
        },
        {
          t: "p",
          text: "The senior version of this answer is the *hybrid* component: accept an optional `value` and `onChange`, fall back to internal state when they are absent, and expose a `defaultValue`. That is exactly how every good design-system input works, and you can point at your 50-component library at Jio as the place you learned to do it.",
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Primitive 1 — useAsync: fetch with abort, status and stale-response guarding",
          code: `function useAsync(fetcher, deps) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setState((s) => ({ ...s, status: "loading" }));

    fetcher(controller.signal)
      .then((data) => {
        if (cancelled) return;                       // guard 1: stale render
        setState({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") return;  // expected
        setState({ status: "error", data: null, error });
      });

    return () => {
      cancelled = true;                              // guard 2: no setState after unmount
      controller.abort();                            // guard 3: kill the socket
    };
  }, deps);

  return state;
}

// Usage. Note the signal is threaded all the way to fetch.
const { status, data, error } = useAsync(
  (signal) => fetch("/api/stores/" + storeId, { signal }).then((r) => r.json()),
  [storeId]
);`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Why both the flag and the controller",
          text: "`controller.abort()` stops the network work and makes the promise reject with `AbortError`. The `cancelled` flag covers the window where the response already arrived and the `.then` is queued as a microtask — abort cannot un-queue that. Belt and braces, two lines, and explaining the difference between them is a genuinely senior answer to \"why do you need the boolean if you already abort?\"",
        },
        { t: "h", text: "Keyboard navigation with a roving index" },
        {
          t: "p",
          text: "The mechanism: exactly one item in the collection has `tabIndex=0`, every other has `tabIndex=-1`, and arrow keys move which one. That way Tab enters and leaves the whole widget in one press instead of tabbing through fifty options — which is what a native `<select>` does, and what a screen reader user expects. For a combobox the variant is `aria-activedescendant`: focus stays on the input, and you point at the highlighted option by id.",
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Primitive 2 — roving index with wrap, Home/End and scroll-into-view",
          code: `function useRovingIndex(count, { loop = true } = {}) {
  const [active, setActive] = useState(0);
  const itemRefs = useRef([]);

  const move = useCallback((delta) => {
    setActive((i) => {
      const next = i + delta;
      if (loop) return (next + count) % count;
      return Math.max(0, Math.min(count - 1, next));
    });
  }, [count, loop]);

  const onKeyDown = useCallback((e) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); move(1); break;
      case "ArrowUp":   e.preventDefault(); move(-1); break;
      case "Home":      e.preventDefault(); setActive(0); break;
      case "End":       e.preventDefault(); setActive(count - 1); break;
      default: return;
    }
  }, [move, count]);

  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return { active, setActive, onKeyDown, itemRefs };
}`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The two keyboard bugs interviewers look for",
          text: "First, missing `preventDefault()` on ArrowUp/ArrowDown — the page scrolls underneath your highlight and the widget feels broken. Second, `scrollIntoView()` without `block: \"nearest\"`, which yanks the whole page around on every arrow press. Both are one-liners and both are immediately visible on screen, so they are cheap marks either way.",
        },
        { t: "h", text: "Click-outside, and the detail that breaks it" },
        {
          t: "code",
          lang: "jsx",
          caption: "Primitive 3 — click-outside plus Escape, in one hook",
          code: `function useDismiss(ref, onDismiss, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    // pointerdown, NOT click: a click fires after mouseup, so a drag that
    // starts inside and ends outside would wrongly dismiss.
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) onDismiss();
    };
    const onKeyDown = (e) => { if (e.key === "Escape") onDismiss(); };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, onDismiss, enabled]);
}`,
        },
        {
          t: "list",
          items: [
            "**The portal problem**: if your dropdown renders through `createPortal`, `ref.current.contains(e.target)` is false for clicks inside it, because the DOM tree and the React tree disagree. Fix by keeping refs to both the trigger and the panel, or by checking `e.target.closest(\"[data-dropdown]\")`.",
            "**The open-toggle problem**: clicking the trigger while open fires both the outside handler and the toggle, so the panel closes and instantly reopens. Exclude the trigger element from the outside check.",
            "**Focus trap**: for a modal, query all focusable descendants, remember `document.activeElement` before opening, cycle Tab and Shift+Tab at the ends, and restore focus on close. The restore is the part everyone forgets and the part that matters most to a keyboard user.",
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Primitive 4 — recursive rendering, the whole answer to a family of problems",
          code: `// One component that calls itself. Comments, file trees, org charts,
// nested menus and JSON viewers are all this shape.
function Node({ node, depth = 0, onToggle }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children?.length > 0;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? open : undefined}>
      <div style={{ paddingLeft: depth * 16 }}>
        {hasChildren && (
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle">
            {open ? "-" : "+"}
          </button>
        )}
        {node.label}
      </div>

      {open && hasChildren && (
        <ul role="group">
          {node.children.map((child) => (
            <Node key={child.id} node={child} depth={depth + 1} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

// The interview follow-up is always the same: "what if it is 5,000 nodes
// deep or wide?" Answer: flatten to a visible-rows array and virtualise,
// because recursion gives you no way to window. Then depth is a number
// on each row instead of a call-stack depth.`,
        },
        { t: "h", text: "Drag and drop with pointer events, no library" },
        {
          t: "list",
          ordered: true,
          items: [
            "`onPointerDown` on the handle: record the pointer id, the item id and the starting coordinates, then call `setPointerCapture(e.pointerId)` so you keep receiving events even when the pointer leaves the element.",
            "`onPointerMove`: compute the delta, apply a `transform: translate(...)` to the dragged node — transform only, never `top`/`left`, so you stay on the compositor and off the layout path.",
            "Work out the drop target from geometry: cache each target's `getBoundingClientRect()` on drag start (never inside the move handler — that forces layout every frame) and find which rect contains the pointer.",
            "`onPointerUp`: commit the reorder to state, clear the transform, release capture. Add `touch-action: none` in CSS or mobile scrolling will fight your drag.",
            "Accessibility escape hatch to voice: keyboard reordering with Space to lift and arrows to move, plus an `aria-live` region announcing \"Moved item to position 3 of 8\". Saying this out loud is usually enough; implementing it is a bonus.",
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Primitive 5 — useEventListener, plus the ref trick that makes it correct",
          code: `function useEventListener(target, type, handler, options) {
  const saved = useRef(handler);

  // Keep the latest handler in a ref so the listener is attached once
  // but always calls fresh closures. Without this you either re-attach
  // on every render or capture stale state.
  useEffect(() => { saved.current = handler; }, [handler]);

  useEffect(() => {
    const node = target?.current ?? target ?? window;
    if (!node?.addEventListener) return;
    const listener = (e) => saved.current(e);
    node.addEventListener(type, listener, options);
    return () => node.removeEventListener(type, listener, options);
  }, [target, type, JSON.stringify(options)]);
}

// Composes into everything: useDismiss, useHotkey, useWindowSize,
// useOnlineStatus, useScrollPosition. Build it once, mention it once,
// reuse it for the rest of the round.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "This is the library you already built",
          text: "Your shared component library at Jio — 50-plus components on a standardised Redux data layer, roughly 30% less duplicated UI code — is exactly this argument at production scale. When you extract `useAsync` or `useDismiss` mid-round, say the sentence: \"this is the pattern I standardised across the Store, Cluster and Self-Checkout portals; the duplication we removed was mostly fetch-plus-loading-plus-error repeated per screen.\" It converts a hook extraction into evidence of architectural judgement.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Eight primitives cover the bank: controlled inputs, `useAsync` with abort, roving index, dismiss/click-outside, portal plus focus trap, recursion, pointer-event drag, `useEventListener`.",
            "Drill each to under five minutes from memory. Typing speed on known patterns is what buys thinking time for the unknown parts.",
            "`pointerdown` not `click`; `preventDefault` on arrows; `block: \"nearest\"` on scroll; transform not top/left; restore focus on close.",
            "Recursion is elegant and un-windowable. Flatten when scale is the question.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 24,
      title: "Two worked solutions, end to end",
      summary:
        "A debounced autocomplete with cancellation, caching and full combobox keyboard support; then a virtualised list built from scratch with the windowing maths. These two cover most of what the bank asks.",
      blocks: [
        {
          t: "p",
          text: "Reading a solution is not the same as producing one, but reading a *complete* solution once teaches you the order to produce it in. Both walkthroughs below are written in the order you would actually type them, with the narration you would say at each point.",
        },
        { t: "h", text: "Problem 1 — Autocomplete, 45 minutes" },
        {
          t: "list",
          items: [
            "Debounce input by roughly 300ms so you are not firing a request per keystroke.",
            "Cancel the in-flight request when a newer query arrives, and discard any response that is no longer current.",
            "Cache results by query so backspacing is instant and re-typing costs nothing.",
            "Full keyboard: Down/Up to move, Enter to select, Escape to close without clearing, Tab to leave.",
            "ARIA combobox wiring so the highlighted option is announced.",
            "Empty, loading and error states, and cleanup on unmount.",
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Step 1 — the search hook: debounce, abort, cache, request sequencing",
          code: `function useSearch(query, { delay = 300 } = {}) {
  const [state, setState] = useState({ status: "idle", items: [], error: null });
  const cache = useRef(new Map());        // query -> items
  const seq = useRef(0);                  // monotonic request id

  useEffect(() => {
    const q = query.trim();

    if (!q) { setState({ status: "idle", items: [], error: null }); return; }

    if (cache.current.has(q)) {           // cache hit: no request, no debounce
      setState({ status: "success", items: cache.current.get(q), error: null });
      return;
    }

    const controller = new AbortController();
    const id = ++seq.current;             // claim a sequence number

    setState((s) => ({ ...s, status: "loading" }));

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(q), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed: " + res.status);
        const items = await res.json();

        if (id !== seq.current) return;   // a newer request has started; drop this
        cache.current.set(q, items);
        setState({ status: "success", items, error: null });
      } catch (error) {
        if (error.name === "AbortError" || id !== seq.current) return;
        setState({ status: "error", items: [], error });
      }
    }, delay);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, delay]);

  return state;
}`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Say the out-of-order bug before they ask",
          text: "Type \"rea\" then \"react\". Without protection, if the response for \"rea\" lands after the one for \"react\", you render results for a query the user has already moved past. Abort covers most of it, but not the window where the response has arrived and the `.then` is already a queued microtask — abort cannot un-queue that. Hence the sequence number: two independent fixes, and naming both is one of the highest-value sentences available in this round. Interviewers watch specifically for it.",
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Step 2 — the combobox: roving highlight via aria-activedescendant",
          code: `function Autocomplete({ onSelect }) {
  const [query, setQuery] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { status, items, error } = useSearch(query);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  useDismiss(rootRef, () => setOpen(false), isOpen);

  // Reset the highlight whenever the result set changes identity.
  useEffect(() => { setActive(items.length ? 0 : -1); }, [items]);

  useEffect(() => {
    if (active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onKeyDown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) { setOpen(true); return; }
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + delta + items.length) % items.length);
      return;
    }
    if (e.key === "Enter" && isOpen && active >= 0) {
      e.preventDefault();
      commit(items[active]);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);          // close, do NOT clear the query
      return;
    }
  }

  function commit(item) {
    setQuery(item.label);
    setOpen(false);
    setActive(-1);
    onSelect?.(item);
  }

  const listboxId = "ac-listbox";
  const activeId = active >= 0 ? "ac-opt-" + items[active]?.id : undefined;

  return (
    <div ref={rootRef} className="ac">
      <input
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {isOpen && (
        <ul id={listboxId} role="listbox" ref={listRef}>
          {status === "loading" && <li aria-live="polite">Searching...</li>}
          {status === "error" && <li role="alert">{error.message}</li>}
          {status === "success" && items.length === 0 && (
            <li>No results for &quot;{query}&quot;</li>
          )}
          {items.map((item, i) => (
            <li
              key={item.id}
              id={"ac-opt-" + item.id}
              role="option"
              aria-selected={i === active}
              className={i === active ? "is-active" : ""}
              // pointerdown, not click: click fires after the input blurs
              onPointerDown={(e) => { e.preventDefault(); commit(item); }}
              onMouseEnter={() => setActive(i)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
        },
        {
          t: "table",
          head: ["Key", "Expected behaviour", "The bug if you get it wrong"],
          rows: [
            ["ArrowDown", "Open if closed, else move highlight down and wrap", "Page scrolls; highlight sticks at the last item"],
            ["ArrowUp", "Move up and wrap to the last item", "Highlight escapes to -1 and Enter selects nothing"],
            ["Enter", "Commit the highlighted option; do not submit the form", "Form submits and the page reloads mid-demo"],
            ["Escape", "Close the panel, keep the typed query, keep focus", "Query gets cleared and the user has to retype"],
            ["Tab", "Leave the widget entirely, panel closes", "Tab walks through fifty options one by one"],
            ["Home / End", "Jump to first / last option", "Minor, but free marks if you add it"],
            ["Mouse click on option", "Commit via `pointerdown`", "`click` fires after blur closes the list, so nothing is selected"],
          ],
        },
        {
          t: "p",
          text: "That last row is the bug that bites everyone. The input blurs on mouse-down, your blur handler closes the panel, the option unmounts, and the `click` event never lands. Handling selection on `pointerdown` with `preventDefault()` fixes it in one line — and explaining *why* demonstrates you understand event ordering, which is the actual thing being tested.",
        },
        { t: "hr" },
        { t: "h", text: "Problem 2 — Virtualised list from scratch, 45 minutes" },
        {
          t: "p",
          text: "The question behind the question is: do you understand that the DOM, not React, is the bottleneck at scale? Fifty thousand rows is roughly fifty thousand nodes times however many elements per row — hundreds of megabytes of layout and paint work. Windowing renders only what fits in the viewport plus a small overscan buffer, and fakes the scrollbar with a single spacer of the full height.",
        },
        {
          t: "math",
          formula:
            "start = floor(scrollTop / rowH) · visible = ceil(viewportH / rowH) · end = min(total, start + visible + overscan) · offsetY = start * rowH · totalH = total * rowH",
          note: "Five lines of arithmetic are the whole algorithm. `overscan` (3-5 rows) renders slightly beyond the viewport so fast scrolling does not flash blank space. `totalH` on an absolutely-positioned spacer is what gives you a real scrollbar; `offsetY` as a transform on the rendered window is what puts the visible rows in the right place.",
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Fixed-height windowing — memorise this, it is 30 lines",
          code: `function VirtualList({ items, rowHeight = 36, height = 480, overscan = 4, renderRow }) {
  const [scrollTop, setScrollTop] = useState(0);

  const total = items.length;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visible = Math.ceil(height / rowHeight);
  const end = Math.min(total, start + visible + overscan * 2);

  const window = items.slice(start, end);
  const offsetY = start * rowHeight;

  return (
    <div
      style={{ height, overflowY: "auto", position: "relative" }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      role="grid"
      aria-rowcount={total}
    >
      {/* spacer: gives the scrollbar the right length */}
      <div style={{ height: total * rowHeight }} />

      {/* window: translated into position, so no layout thrash */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          transform: "translateY(" + offsetY + "px)",
        }}
      >
        {window.map((item, i) => (
          <div key={item.id} style={{ height: rowHeight }} role="row"
               aria-rowindex={start + i + 1}>
            {renderRow(item, start + i)}
          </div>
        ))}
      </div>
    </div>
  );
}`,
        },
        {
          t: "list",
          items: [
            "**Why `transform` and not `top`** — transform is composited, `top` triggers layout on every scroll event. On a 50,000-row grid that difference is visible.",
            "**Why not throttle `onScroll`** — React batches state updates and scroll already fires at roughly frame rate. Throttling adds latency and makes the list lag behind the scrollbar. If profiling says the row render is the cost, memoise the row instead.",
            "**Variable row heights** — keep a measured-height array plus a prefix-sum array, then binary search the prefix sums for `start`. Measure with `ResizeObserver` on rendered rows and patch estimates as you go. Say this; only implement it if asked.",
            "**Accessibility** — a windowed list breaks screen-reader row counting unless you set `aria-rowcount` on the container and `aria-rowindex` on each row. Almost nobody mentions this, which is exactly why it is worth mentioning.",
            "**Sticky headers and horizontal scroll** — the follow-up if the problem is a data grid. Freeze the header row outside the scroll container, and share `scrollLeft` between header and body.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "This is your strongest resume-to-code bridge",
          text: "You took time-to-interactive from 8s to 3s on Jio dashboards rendering 50,000-plus rows, using exactly this — list virtualisation, memoised selectors and route-level code-splitting. When the virtualisation question comes up, write the maths and then say the numbers: how many nodes you removed from the tree, what the main-thread time was before and after, and why memoised selectors mattered as much as windowing (windowing cuts DOM work; selectors cut the re-render that recomputes the window). Very few candidates can attach production numbers to this algorithm. You can.",
        },
        { t: "h", text: "The third shape: nested comments" },
        {
          t: "code",
          lang: "jsx",
          caption: "Recursive tree with add, delete and collapse over a normalised store",
          code: `// Store the tree NORMALISED, not nested. Nested arrays force you to
// deep-clone on every edit; a flat map makes add and delete O(1).
//   byId:      { c1: { id, text, parentId, childIds: [] } }
//   rootIds:   ["c1", "c4"]

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const { id, parentId, text } = action;
      const byId = { ...state.byId, [id]: { id, parentId, text, childIds: [] } };
      if (parentId) {
        byId[parentId] = {
          ...byId[parentId],
          childIds: [...byId[parentId].childIds, id],
        };
        return { ...state, byId };
      }
      return { ...state, byId, rootIds: [...state.rootIds, id] };
    }
    case "delete": {
      // Collect the whole subtree iteratively — a 5,000-deep thread
      // would blow the call stack with recursion.
      const doomed = new Set();
      const stack = [action.id];
      while (stack.length) {
        const id = stack.pop();
        doomed.add(id);
        stack.push(...(state.byId[id]?.childIds ?? []));
      }
      const byId = {};
      for (const [id, node] of Object.entries(state.byId)) {
        if (doomed.has(id)) continue;
        byId[id] = { ...node, childIds: node.childIds.filter((c) => !doomed.has(c)) };
      }
      return { byId, rootIds: state.rootIds.filter((id) => !doomed.has(id)) };
    }
    default:
      return state;
  }
}`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Normalisation is the answer to three different questions",
          text: "\"How do you delete a deeply nested comment?\", \"how do you avoid re-rendering the whole thread on one edit?\" and \"how would you cache this from the server?\" all resolve to the same move: store entities flat by id, store structure as id arrays, and derive the tree at render. It is also the exact shape of the Redux data layer you standardised at Jio, and the shape a normalised client cache uses — so the same sentence pays off in the system design round in week 9.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Autocomplete = debounce + abort + sequence number + cache + roving `aria-activedescendant`. Volunteer the out-of-order bug.",
            "Select on `pointerdown`, not `click`, whenever a blur can close the thing you are clicking.",
            "Virtualisation is five lines of arithmetic plus a spacer and a transform. Know it cold.",
            "Normalise trees. Iterate, do not recurse, when deleting subtrees.",
            "Every one of these has a Jio story attached. Attach it out loud.",
          ],
        },
      ],
    },
  ],

  theory: [
    "State the six rubric criteria a machine coding interviewer marks, in weight order, and what loses the mark on each.",
    "Explain why a rough working component beats an elegant unfinished one, and how you would narrate the shortcut you took.",
    "Give the three questions that decide where a piece of state lives, and apply them to an autocomplete's activeIndex.",
    "Explain when prop drilling is fine and when it is not, and why composition should be tried before context and context before Redux.",
    "List the seven edge-case families (empty, loading, error, race, rapid clicks, boundaries, long content) and give a concrete instance of each for a data table.",
    "Explain the out-of-order response bug and give two independent fixes, then explain why abort alone is insufficient.",
    "Explain why a cleanup function needs to abort requests, clear timers, remove listeners and close EventSource connections, using your Jio SSE views as the example.",
    "Explain the difference between controlled and uncontrolled inputs, and describe the hybrid component API a design system needs.",
    "Explain the roving tabindex mechanism and why it exists, then contrast it with aria-activedescendant for a combobox.",
    "Explain why click-outside handlers should listen on pointerdown rather than click, and what breaks when a dropdown is portalled.",
    "Derive the windowing maths for a fixed-height virtual list and explain the role of overscan and the spacer element.",
    "Explain how you would extend a virtual list to variable row heights, including the prefix-sum and binary-search approach.",
    "Explain why recursion is the wrong structure for a 5,000-node tree and what you would replace it with.",
    "Explain why a comment tree should be stored normalised rather than nested, and what that buys you on delete and on re-render.",
    "Explain the ninety-minute budget out loud as if opening a round, including the closing summary you would give.",
    "Explain what you do when a single bug has consumed three minutes, and why stubbing past it costs less than solving it.",
    "Give one credible accessibility sentence for each of: modal, tabs, combobox, data grid, drag-to-reorder.",
  ],

  math: [
    {
      title: "The ninety-minute budget",
      formula: "0-5 clarify · 5-15 tree + state · 15-55 happy path · 55-75 edges · 75-90 refactor + close",
      note: "Announce it at minute zero. Scale proportionally for 45 and 60 minute rounds. The last fifteen minutes are the highest-scoring per minute in the whole round — never let features eat them.",
    },
    {
      title: "State placement decision rule",
      formula: "derivable? -> compute · shared? -> lowest common ancestor · server data? -> cache · else -> local",
      note: "Run it out loud for every piece of state. The most common error is storing derived data (filteredRows, totalCount) which then goes stale. The second most common is hoisting UI state into a global store.",
    },
    {
      title: "useAsync with abort and stale guard",
      formula: "useAsync(fetcher: (signal) => Promise<T>, deps) -> { status, data, error }",
      note: "Three guards: cancelled flag for queued microtasks, AbortController for the socket, AbortError swallowed as expected control flow. Thread the signal all the way into fetch or the abort does nothing.",
    },
    {
      title: "Debounced search with request sequencing",
      formula: "seq = ++counter; if (seq !== counter) drop response; cache: Map<query, items>",
      note: "Debounce reduces requests, abort cancels them, the sequence number catches the response that already arrived. Cache by trimmed query so backspacing is instant. All four are separate mechanisms — name them separately.",
    },
    {
      title: "Roving index",
      formula: "next = loop ? (i + d + n) % n : clamp(i + d, 0, n - 1); exactly one item has tabIndex 0",
      note: "preventDefault on ArrowUp/ArrowDown or the page scrolls. scrollIntoView({ block: 'nearest' }) or the page jumps. Home/End are two extra lines and free marks.",
    },
    {
      title: "Fixed-height virtualisation",
      formula: "start = floor(scrollTop / rowH) - overscan · end = min(n, start + ceil(viewportH / rowH) + 2*overscan) · offsetY = start * rowH",
      note: "Spacer div of height n*rowH gives a real scrollbar; the window is absolutely positioned and moved with translateY. Transform, never top. Overscan 3-5 rows stops blank flashes on fast scroll.",
    },
    {
      title: "Variable-height virtualisation",
      formula: "prefix[i] = prefix[i-1] + h[i]; start = binarySearch(prefix, scrollTop); measure with ResizeObserver",
      note: "Start from an estimated height per row, patch the prefix sums as real heights are measured, and preserve scroll position when an estimate corrects. Describe this rather than build it unless explicitly asked.",
    },
    {
      title: "Dismiss on outside interaction",
      formula: "document.pointerdown -> if (!panel.contains(target) && !trigger.contains(target)) close(); Escape -> close()",
      note: "pointerdown not click, so a drag ending outside does not dismiss. Exclude the trigger or the panel closes and instantly reopens. Portalled panels need an explicit second ref or a data-attribute check.",
    },
    {
      title: "Focus trap",
      formula: "save activeElement -> focus first focusable -> cycle Tab/Shift+Tab at the ends -> restore on close",
      note: "Query focusables with a selector covering a, button, input, select, textarea, [tabindex]:not([tabindex='-1']). Add aria-modal and set inert or aria-hidden on the background. Restoring focus is the step everyone skips.",
    },
    {
      title: "Pointer-event drag and drop",
      formula: "pointerdown: setPointerCapture + cache rects · pointermove: translate by delta · pointerup: commit + release",
      note: "Cache getBoundingClientRect on drag start, never in the move handler — reading it mid-drag forces layout every frame. touch-action: none in CSS or mobile scroll fights the drag.",
    },
    {
      title: "Normalised tree store",
      formula: "byId: Record<id, { id, parentId, childIds }> · rootIds: id[] · derive nesting at render",
      note: "O(1) add and delete, no deep cloning, and only the touched branch re-renders. Delete a subtree with an explicit stack, not recursion, so a deep thread cannot blow the call stack.",
    },
    {
      title: "Concurrency-limited task queue",
      formula: "N workers pull from a shared cursor over an array of thunks; progress = done / total",
      note: "Powers the upload-queue and progress-bar problems. Must take thunks, not promises — a promise has already started, so you cannot limit it after the fact. Add per-item cancel and a retry with backoff.",
    },
  ],

  practice: [
    { type: "math", q: "Autocomplete, 45 min. Debounced input, results from a stubbed API, arrow-key navigation, Enter to select, Escape to close without clearing. Tests: debounce, cancellation, keyboard, ARIA combobox wiring." },
    { type: "math", q: "Typeahead with explicit out-of-order handling, 25 min. Make the stub return random latency between 100ms and 2s, then prove with logs that a stale response can never render. Tests: request sequencing versus abort, and whether you understand microtask timing." },
    { type: "math", q: "Nested comments, 45 min. Recursive rendering, reply to any node, delete a subtree, collapse/expand, depth-based indentation. Tests: recursion, normalised state design, immutable subtree deletion." },
    { type: "math", q: "Infinite scroll feed, 40 min. IntersectionObserver sentinel, page cursor, loading and end-of-list states, no duplicate fetches when the sentinel re-intersects. Tests: observer lifecycle, cleanup, guarding concurrent page loads." },
    { type: "math", q: "Data table, 60 min. Multi-column sort, per-column text filter, pagination, and draggable column resize. Tests: derived state discipline, memoised selectors, controlled inputs, pointer-event geometry." },
    { type: "math", q: "Kanban board, 60 min. Three columns, drag cards within and across columns, drop indicator, persist to localStorage. Tests: pointer-event drag from scratch, cross-container reorder maths, state normalisation." },
    { type: "math", q: "Virtualised list from scratch, 45 min. 100,000 fixed-height rows, no library, real scrollbar, overscan buffer. Then extend to variable heights out loud. Tests: the windowing maths, transform versus top, aria-rowcount." },
    { type: "math", q: "Toast notification queue, 30 min. Imperative API, max three visible at once with the rest queued, per-toast auto-dismiss timer that pauses on hover, manual dismiss, exit animation. Tests: portals, timer cleanup, queue state, aria-live." },
    { type: "math", q: "Undo/redo with the command pattern, 40 min. Wrap a small editor or todo list so every mutation is a command with do and undo, then add a redo stack that clears on new action. Tests: modelling actions as data, stack invariants, keyboard shortcuts." },
    { type: "math", q: "File explorer tree, 40 min. Lazy-load children on expand, show a per-node loading state, keyboard navigation with arrows for expand/collapse/move, and multi-select with Shift. Tests: recursion plus async, tree keyboard semantics, role=tree ARIA." },
    { type: "math", q: "Multi-step form wizard, 45 min. Four steps, per-step validation blocking Next, back preserves entered data, progress indicator, review step, and a single submit. Tests: form state shape, validation placement, focus management between steps." },
    { type: "math", q: "Date picker, 50 min. Month grid built from scratch with no date library, previous/next month, disabled dates, keyboard grid navigation, range selection. Tests: date arithmetic without helpers, grid roving index, off-by-one discipline." },
    { type: "math", q: "Image carousel, 35 min. Prev/next, dot indicators, autoplay that pauses on hover and on focus, infinite loop, swipe on touch, and lazy loading of off-screen images. Tests: interval cleanup, transform animation, pointer gestures." },
    { type: "math", q: "Modal with focus trap, 25 min. Portal, backdrop click and Escape to close, Tab cycling inside, focus restored to the trigger on close, background scroll locked. Tests: portals, the focusable-element query, focus restoration." },
    { type: "math", q: "Accessible tabs and accordion, 30 min. Tabs with roving tabindex, arrow keys, automatic versus manual activation; accordion with single and multi-expand modes. Tests: ARIA relationships and whether your keyboard model is real or copied." },
    { type: "math", q: "Drag-to-reorder list, 35 min. Pointer events only, live gap animation as items shift, and a keyboard path (Space to lift, arrows to move, Space to drop) with an aria-live announcement. Tests: reorder maths plus the accessibility escape hatch." },
    { type: "math", q: "Upload queue with progress, 40 min. Ten files, at most three uploading at once, per-file progress bar, cancel one, retry a failure with backoff, and an overall progress figure. Tests: the concurrency pool, per-item AbortController, aggregate derived state." },
    { type: "math", q: "Three 15-minute warm-ups in one sitting: star rating with half-stars and keyboard input, stopwatch with lap and reset using timestamps not tick-counting, and a poll widget with optimistic vote and percentage bars. Tests: raw speed on small components." },
    { type: "math", q: "Grid games, three sittings: tic-tac-toe or Connect Four in 35 min (win and draw detection, move history with time travel), a chess board in 60 min that highlights legal moves for the selected piece (no check logic needed), and Snake in 45 min with keyboard control, growth and collision. Tests: board modelling, grid coordinate maths, requestAnimationFrame game loop and cleanup of that loop on unmount." },
    { type: "theory", q: "Record a full 60-minute mock of the data table problem. Watch fifteen minutes back and count silences longer than twenty seconds, plus every edge case you noticed but did not voice. Then, separately, write only the opening five minutes for three other problems — clarifying questions, stated assumptions, scope comment — and check whether the scope you set was achievable in the time remaining." },
  ],

  resources: [
    { label: "GreatFrontEnd — the closest thing to a graded machine coding syllabus, with reference solutions written to interview standard. Work the user-interface question list, not the quiz section.", url: "https://www.greatfrontend.com/questions/user-interface", kind: "course" },
    { label: "BFE.dev — timed React and DOM build challenges. Use it for speed drills on the primitives once you know the patterns.", url: "https://bigfrontend.dev/", kind: "repo" },
    { label: "Frontend Interview Handbook — the UI-question section covers exactly the bank in this module, with a rubric-style breakdown per problem.", url: "https://www.frontendinterviewhandbook.com/", kind: "docs" },
    { label: "WAI-ARIA Authoring Practices — the patterns page. Combobox, listbox, tabs, tree, dialog and grid keyboard specs. Read the combobox and dialog pages before your first onsite; they are the two most-asked components.", url: "https://www.w3.org/WAI/ARIA/apg/patterns/", kind: "docs" },
    { label: "Radix UI primitives source — production-quality unstyled implementations of dropdown, dialog, tabs and combobox. Read how they handle focus, portals and dismissal; this is what a great answer looks like with the time constraint removed.", url: "https://github.com/radix-ui/primitives", kind: "repo" },
    { label: "TanStack Virtual source — a compact, readable virtualiser covering fixed heights, dynamic measurement and scroll-to-index. Read `observeElementRect` and the range calculator, then re-derive the maths yourself.", url: "https://github.com/TanStack/virtual", kind: "repo" },
    { label: "react-hook-form docs — the clearest real-world argument for uncontrolled inputs at form scale. Read it for the answer to \"how would you make a 60-field form fast?\"", url: "https://react-hook-form.com/docs", kind: "docs" },
    { label: "MDN — Pointer events. The API you should be using for every drag question instead of the legacy HTML5 drag-and-drop, and the reference for setPointerCapture and touch-action.", url: "https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events", kind: "docs" },
    { label: "MDN — IntersectionObserver. The correct primitive for infinite scroll, lazy images and impression tracking. Note the rootMargin trick for prefetching a page early.", url: "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API", kind: "docs" },
    { label: "React docs — You Might Not Need an Effect. The best single page on state placement and derivation, which is 15% of the rubric.", url: "https://react.dev/learn/you-might-not-need-an-effect", kind: "docs" },
    { label: "React docs — Synchronising with Effects, specifically the race-condition section. It is the canonical framing of the bug you should be volunteering in every async round.", url: "https://react.dev/learn/synchronizing-with-effects", kind: "docs" },
    { label: "Testing Library guiding principles — worth twenty minutes because it tells you which queries to reach for when an interviewer asks you to add a test at minute 80, and why getByRole is the answer.", url: "https://testing-library.com/docs/guiding-principles/", kind: "docs" },
  ],
};

export default p08;
