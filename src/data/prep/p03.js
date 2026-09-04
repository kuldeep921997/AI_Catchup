const p03 = {
  id: "p03",
  week: 3,
  hours: 10,
  title: "React Internals & the Rendering Model",
  tag: "React",
  why: "React is your headline skill, so the bar in the interview is \"how does it work\", not \"how do I use it\". Seven years in, nobody will ask you to explain `useState`; they will ask why a context update re-rendered a subtree that did not consume it, or what React does differently when your `setState` fires inside a promise instead of a click handler. Every performance story on your resume — 8s to 3s, 50,000 rows — is a story about the rendering model, and you need to be able to tell it in the model's own vocabulary.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "Reconciliation, keys, and Fiber",
      summary:
        "The two heuristics that make diffing linear, exactly what breaks with index keys, and why React threw away the call stack and rebuilt rendering as a resumable linked-list walk.",
      blocks: [
        {
          t: "p",
          text: "Comparing two arbitrary trees is O(n³). React ships an O(n) approximation by making two assumptions that are wrong in general and almost always right in practice. Knowing those two assumptions — and therefore knowing precisely when React's diffing will do the wrong thing — is the difference between guessing at a re-render bug and diagnosing it.",
        },
        { t: "h", text: "The two heuristics" },
        {
          t: "list",
          items: [
            "**Different element types produce different trees.** If a node's type changes — `div` to `span`, `Chart` to `Table` — React does not attempt to diff. It unmounts the whole old subtree, destroys its state, runs cleanup on its effects, and mounts the new one from scratch.",
            "**Keys tell React which children are the same thing across renders.** Within a list, a stable key lets React match a child by identity rather than by position, so it can move a node instead of rebuilding it.",
            "Everything else follows: same type means the fiber is reused and only changed props are applied to the host node; children are matched by key first and position second.",
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "The remount that surprises people — same output, different type path",
          code: `// Every render creates a NEW component type, because the function
// identity changes. React sees a different type and remounts the subtree
// on every single parent render: state lost, effects re-run, inputs
// cleared, scroll position reset.
function Dashboard({ dense }) {
  function Panel() {            // <- new function object each render
    return <StockGrid />;
  }
  return <Panel />;
}

// Same class of bug, less obvious: switching wrapper element by condition.
return dense
  ? <div className="dense"><StockGrid /></div>
  : <section className="airy"><StockGrid /></section>;
// div -> section is a type change at that position, so StockGrid unmounts
// and remounts, throwing away its internal state.

// Fix: keep the type stable and vary props instead.
const Tag = "div";
return <Tag className={dense ? "dense" : "airy"}><StockGrid /></Tag>;`,
        },
        { t: "h", text: "Keys: what they actually do" },
        {
          t: "code",
          lang: "jsx",
          caption: "The index-key bug, traced through the reconciler",
          code: `// rows = [A, B, C]. The user deletes A.
{rows.map((row, i) => <Row key={i} row={row} />)}

// Before: keys 0,1,2 holding A,B,C.  After: keys 0,1 holding B,C.
// React reconciles by key and concludes:
//   key 0 - same type, props changed (row A -> row B)  => REUSE fiber, update props
//   key 1 - same type, props changed (row B -> row C)  => REUSE fiber, update props
//   key 2 - no longer present                          => UNMOUNT
//
// So two fibers are reused with new data. Anything held INSIDE those
// fibers stays put and now belongs to the wrong row:
//   - a half-typed quantity in an uncontrolled input
//   - which checkbox is ticked
//   - an open dropdown, a focused cell, a pending optimistic update
//   - a CSS transition mid-flight
// On an inventory grid this is not cosmetic: an adjustment gets typed
// against the wrong SKU.

// Correct: key by identity.
{rows.map((row) => <Row key={row.id} row={row} />)}
// Now React matches A->unmounted, B and C moved up. State travels with
// the row it describes.`,
        },
        {
          t: "table",
          head: ["Key choice", "Reorder / insert / delete", "Verdict"],
          rows: [
            ["`key={row.id}`", "Correct — fibers move with their data", "Always, when a stable id exists"],
            ["`key={index}`", "Silently wrong — state and DOM stay bound to a position", "Only for a genuinely static, append-only list"],
            ["`key={JSON.stringify(row)}`", "Remounts on every field change", "Never — you have made every edit a remount"],
            ["`key={Math.random()}`", "Remounts every child on every render", "Never. This is the classic \"why is my input losing focus\" cause"],
            ["No key on a dynamic list", "Falls back to index, plus a dev warning", "Treat the warning as a bug, not noise"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Keys are scoped to siblings, and they are not props",
          text: "A key only has to be unique among its immediate siblings, not globally — people over-engineer this. More importantly, `key` never reaches your component: `props.key` is `undefined`. And the useful inversion: because a changed key forces a remount, you can *deliberately* key a component on an entity id (`<EditForm key={storeId} />`) to reset all its internal state when the selected store changes. That is the idiomatic React answer to \"reset the form when the id changes\", and it is much better than a `useEffect` that clears fields.",
        },
        { t: "h", text: "Fiber: why the call stack had to go" },
        {
          t: "p",
          text: "Pre-16 React reconciled recursively. A render was one synchronous function call that walked the entire tree, and the browser could not interrupt it, because you cannot pause a JavaScript call stack. A 50,000-row tree meant one long task, one blocked main thread, and dropped frames — the exact symptom your dashboard work fixed. Fiber replaces the implicit stack with an explicit, heap-allocated linked list, which *can* be paused and resumed because it is just data.",
        },
        {
          t: "list",
          items: [
            "A **fiber** is a plain object per element holding: `type`, `stateNode` (the DOM node or instance), `child`, `sibling`, `return` (parent), `pendingProps`, `memoizedProps`, `memoizedState` (the hook list), `flags` (effect tags) and `lanes`.",
            "`child` / `sibling` / `return` are how the walk proceeds — down to the first child, across siblings, then back up through `return`. No recursion, so no stack to preserve.",
            "**Double buffering**: React keeps a `current` tree and builds a `workInProgress` tree alongside it. If work is thrown away, `current` is untouched — this is what makes interruption safe.",
            "**Two phases.** *Render* (begin/complete work) is interruptible, restartable and must be side-effect free. *Commit* (mutation, layout effects, then passive effects) is a single synchronous, uninterruptible block.",
            "This is why the render phase must be pure. In development, StrictMode double-invokes components, reducers and initialisers precisely to surface impurity — it is a diagnostic, not a bug.",
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The work loop, stripped to its essentials",
          code: `// Synchronous root: run until the tree is finished, no yielding.
function workLoopSync() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

// Concurrent root: check the clock between units and hand the thread back.
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
  // Not finished? Schedule a continuation and let the browser paint,
  // handle input, run animations. Resume from exactly this fiber later.
}

function performUnitOfWork(fiber) {
  const next = beginWork(fiber);          // render this node, create children
  if (next !== null) return next;         // go down

  let node = fiber;
  while (node !== null) {
    completeWork(node);                   // build the effect list on the way up
    if (node.sibling !== null) return node.sibling;   // go across
    node = node.return;                                // go up
  }
  return null;
}

// shouldYield() is a time-slice check (roughly a 5ms budget per slice),
// NOT requestIdleCallback. React scheduled it with MessageChannel to get
// a macrotask boundary without waiting for an idle period.`,
        },
        { t: "h", text: "Lanes: priority as a bitmask" },
        {
          t: "note",
          tone: "insight",
          title: "The one-paragraph answer on lanes",
          text: "Updates are tagged with a **lane** — a single bit in a 31-bit bitmask. Discrete input (a click, a keypress) gets a sync lane; a `startTransition` update gets a transition lane; an offscreen or `useDeferredValue` update gets a lower one. Because lanes are bits, React can express a *set* of pending priorities in one integer and answer \"is there anything more urgent than what I am working on\" with a bitwise operation. If higher-priority work arrives mid-render, React abandons the in-progress tree, handles the urgent update, and starts the low-priority render again. That is what \"interruptible rendering\" means concretely: not pausing a function, but discarding and rebuilding cheap, side-effect-free work. It also explains why a component can render two or three times for one logical update, and why render-phase side effects are unsafe rather than merely unfashionable.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Diffing is O(n) because of two assumptions: different type means rebuild, and keys establish identity among siblings.",
            "Index keys bind state to a position instead of to data. Reorder or delete and the state ends up on the wrong row.",
            "Changing a key on purpose is the correct way to reset a subtree's state.",
            "Fiber is the tree as heap data rather than as a call stack — that is the whole reason interruption is possible.",
            "Render is interruptible and must be pure; commit is synchronous and atomic. Every concurrency rule descends from that split.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 22,
      title: "Hooks internals, batching, and effect timing",
      summary:
        "The hook linked list — the actual reason for the rules of hooks — plus what automatic batching changed in React 18, where `useLayoutEffect` sits relative to paint, and an honest cost model for `useMemo`.",
      blocks: [
        {
          t: "p",
          text: "\"Don't call hooks in conditionals\" is a rule people repeat without knowing why. The reason is a single implementation detail: hooks are stored as a **linked list on the fiber**, and they are identified by *call order*, not by name. Once you can say that, the rules stop being arbitrary and every hooks question becomes mechanical.",
        },
        { t: "h", text: "The hook linked list" },
        {
          t: "code",
          lang: "javascript",
          caption: "A 20-line model of what React actually does",
          code: `let currentFiber = null;      // the component being rendered
let workInProgressHook = null; // cursor into its hook list

function mountHook(initialState) {
  const hook = { memoizedState: initialState, queue: [], next: null };
  if (workInProgressHook === null) {
    currentFiber.memoizedState = hook;      // first hook: head of the list
  } else {
    workInProgressHook.next = hook;         // subsequent: append
  }
  workInProgressHook = hook;
  return hook;
}

function updateHook() {
  // On re-render React WALKS the existing list in the same order.
  const hook = workInProgressHook === null
    ? currentFiber.memoizedState            // first hook
    : workInProgressHook.next;              // next in order
  workInProgressHook = hook;
  return hook;
}

// Nothing here records a NAME. Position 0 is position 0. If a conditional
// skips a hook, every later hook shifts up one slot and starts reading
// another hook's state - which is why React throws
// "Rendered fewer hooks than expected" instead of trying to cope.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Three consequences worth stating out loud",
          text: "First, the rules of hooks are not style guidance — they are the precondition for a positional data structure to work. Second, this is why `useState` returns a tuple you destructure rather than a named binding: names never existed. Third, it is why two instances of the same component never share state — the hook list lives on the *fiber*, and each element position gets its own fiber. If an interviewer asks \"why can't hooks be conditional\", the two-sentence answer is: hooks are a linked list keyed by call index, so a skipped call misaligns every subsequent read.",
        },
        { t: "h", text: "Automatic batching: what actually changed in 18" },
        {
          t: "code",
          lang: "jsx",
          caption: "The behaviour difference in one file",
          code: `function Panel() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // In BOTH 17 and 18: one render. React event handlers were always
  // batched, because React controls the call.
  function onClick() {
    setCount((c) => c + 1);
    setFlag((f) => !f);
  }

  // React 17: TWO renders. Outside React's synthetic event system,
  // unstable_batchedUpdates was never applied, so each setState
  // scheduled its own synchronous re-render.
  // React 18 with createRoot: ONE render. Batching is now based on
  // priority lanes rather than on where the call came from.
  async function onSave() {
    await fetch("/api/stores/S117/adjust", { method: "POST" });
    setCount(0);
    setFlag(false);
  }

  // Same story for setTimeout and native listeners: 2 renders in 17,
  // 1 in 18. The migration hazard is code that RELIED on the DOM being
  // updated between two setState calls - that read is now stale.
  // Escape hatch, for when you genuinely need a synchronous flush
  // (measuring the DOM, third-party imperative widgets, some tests):
  //   flushSync(() => setCount(0));
  // Use it deliberately - it opts that update out of batching entirely.
  return null;
}`,
        },
        {
          t: "p",
          text: "Two details that come up as follow-ups. Batching only happens on a root created by `createRoot` — a legacy `ReactDOM.render` root keeps 17's behaviour, which is why some 18 upgrades \"didn't change anything\". And the reason to prefer the updater form `setCount(c => c + 1)` over `setCount(count + 1)` is that batched updates are applied against the *queued* state, not the value captured in your closure; two `setCount(count + 1)` calls in one handler increment by one, not two.",
        },
        { t: "h", text: "`useEffect` versus `useLayoutEffect`" },
        {
          t: "table",
          head: ["Step", "When", "What runs", "Blocks paint?"],
          rows: [
            ["Render phase", "Interruptible", "Your component function, `useMemo`, reducers", "No — nothing is committed yet"],
            ["Commit: mutation", "Sync", "DOM inserted, updated, removed; refs detached", "Yes"],
            ["Commit: layout", "Sync, after mutation", "`useLayoutEffect` cleanup then setup; refs attached; `useImperativeHandle`", "**Yes** — the browser has not painted"],
            ["Paint", "Browser", "Pixels on screen", "—"],
            ["Passive effects", "After paint, async", "`useEffect` cleanup then setup", "No"],
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "The one case where `useLayoutEffect` is not premature",
          code: `// Wrong: measure, then set state in a passive effect. The user sees one
// painted frame with the tooltip at 0,0 before it jumps into place.
useEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setOffset(-height - 8);
}, [open]);

// Right: measure and set state BEFORE the browser paints. React flushes
// the resulting re-render synchronously within the same commit, so no
// intermediate frame is ever visible.
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setOffset(-height - 8);
}, [open]);

// The rule: useLayoutEffect only when you must READ layout and then
// MUTATE it in the same frame - tooltips, popovers, autosizing
// textareas, scroll restoration, measuring a virtualised viewport.
// Everything else (fetching, subscriptions, logging, timers) is useEffect.
//
// Two costs: it blocks paint, so heavy work here is directly visible as
// jank; and it does not run during server rendering, which produces the
// familiar SSR warning. Guard with a mounted check or move the work.`,
        },
        { t: "h", text: "When `useMemo` and `useCallback` actually pay" },
        {
          t: "list",
          items: [
            "Both cost something on **every** render: an extra closure allocated, a dependency array allocated, and an O(deps) `Object.is` comparison. That cost is small but it is never zero, and it is paid whether or not the memo hits.",
            "`useMemo` pays for itself when the computation is genuinely expensive — sorting, filtering or aggregating thousands of rows, building an index, parsing. It does not pay for `a + b` or a small object.",
            "The second, more important reason to memoise is **referential stability**: keeping a prop identity stable so a `React.memo` child, an effect dependency, or a context value does not invalidate.",
            "`useCallback` is almost pointless unless the function is passed to a memoised child, used in a dependency array, or attached as a subscription — otherwise you have added a hook to avoid an allocation that costs nothing.",
            "A `React.memo` wrapper is **defeated** by any inline object, array, function or JSX child prop. One `style={{}}` and the memo compares unequal every render, so you pay for the comparison and get nothing.",
            "React Compiler (React 19+) memoises automatically at build time. The senior position is not \"so this is obsolete\" — it is \"this is why understanding what it memoises matters, and why the compiler needs your components to be pure\".",
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Memoisation defeated, memoisation earned",
          code: `const Row = React.memo(function Row({ row, onAdjust, style }) { /* ... */ });

// Defeated: three new references every parent render, so memo never hits.
<Row row={row} onAdjust={(d) => adjust(row.id, d)} style={{ height: 32 }} />

// Earned: stable identities, so Row re-renders only when 'row' changes.
const STYLE = { height: 32 };                        // module scope
const onAdjust = useCallback((id, d) => adjustRef.current(id, d), []);
<Row row={row} onAdjust={onAdjust} style={STYLE} />

// The pattern that actually moved the needle on a 50k-row grid: derive
// once, memoised on the inputs, instead of recomputing per row per render.
const visible = useMemo(() => {
  const filtered = rows.filter((r) => r.brand === brand && r.stockValue > 0);
  filtered.sort((a, b) => b.stockValue - a.stockValue);
  return filtered;
}, [rows, brand]);

// A custom hook that returns a STABLE object - otherwise every consumer
// re-renders on every call, and the hook silently undoes your memo work.
function useStockSelection(rows) {
  const [ids, setIds] = useState(() => new Set());
  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;                      // new Set: state change is detected
    });
  }, []);
  return useMemo(() => ({ ids, toggle }), [ids, toggle]);
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "This lesson is the technical spine of your 8s-to-3s story, and the way to tell it is as a sequence of measurements, not a list of hooks. \"I profiled first: the commit phase was fine, the render phase was the cost, and it was dominated by re-sorting 50,000 rows on every keystroke and by rendering every row when only 40 were visible. Virtualisation cut the node count; memoised selectors cut the recomputation; route-level code-splitting cut the initial bundle. `useMemo` was the smallest of the three wins.\" That ordering — measure, reduce work, then memoise — is what distinguishes a senior answer from \"I added `useMemo` and `React.memo` everywhere\", which is the answer they hear all day.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Hooks are a linked list on the fiber, identified by call order. Every rule of hooks follows from that one sentence.",
            "React 18 batches by priority lane, so promises, timers and native handlers are now batched too; `flushSync` is the deliberate opt-out.",
            "Use the updater form of `setState` — batched updates apply to queued state, not to your captured closure.",
            "`useLayoutEffect` runs after mutation and before paint. Use it only to read-then-write layout.",
            "Memoisation has a real cost and is defeated by inline props. Reduce work first; stabilise references second; memoise computation third.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 20,
      title: "Controlling re-renders: context, refs, boundaries, composition",
      summary:
        "Why context re-renders consumers it arguably should not, how to split it or select from it, what refs are for, what error boundaries genuinely cannot catch, and the composition patterns that remove the need for most of it.",
      blocks: [
        {
          t: "p",
          text: "Most \"React is slow\" reports are re-render reports, and most re-render reports come down to one of three causes: an unstable value in a context, a parent re-rendering a large subtree it did not need to, or state living higher in the tree than the thing that uses it. The mechanism in each case is the same and worth being precise about — a component re-renders when its state changes, when its parent re-renders, or when a context it consumes gets a new value. Props changing is not, by itself, a cause.",
        },
        { t: "h", text: "Why context re-renders everything below it" },
        {
          t: "code",
          lang: "jsx",
          caption: "The two independent context problems",
          code: `// Problem 1: a new value object on every render. Every consumer
// re-renders on every provider render, even if nothing they read changed.
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  // New object identity each render => all consumers invalidated.
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

// Problem 2 (the one people miss): context is all-or-nothing. A consumer
// that only reads 'theme' still re-renders when 'user' changes, because
// the subscription is to the WHOLE value. useMemo on the value fixes
// identity churn; it does not fix over-subscription.

// Fix A: memoise the value, and split by change frequency.
const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

// Fix B: separate the stable API from the volatile state. Setters never
// change, so components that only dispatch stop re-rendering entirely.
<StoreStateContext.Provider value={state}>
  <StoreApiContext.Provider value={api}>   {/* useMemo(..., []) */}
    {children}
  </StoreApiContext.Provider>
</StoreStateContext.Provider>

// And the free one people forget: <Provider>{children}</Provider> where
// children is passed in from above does NOT re-render those children on
// a provider state change, because their elements are the same objects.
// Composition is a performance tool.`,
        },
        { t: "h", text: "Selecting from a store without a library" },
        {
          t: "code",
          lang: "jsx",
          caption: "`useSyncExternalStore` — the primitive Zustand and Redux are built on",
          code: `// A tiny external store. State lives outside React, so a change notifies
// only the components whose SELECTED slice actually changed.
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    getState: () => state,
    setState: (patch) => {
      state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
      listeners.forEach((l) => l());
    },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  };
}

const store = createStore({ rows: [], brand: "Trends", selected: new Set() });

function useStore(selector) {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),      // must be cheap and referentially
    () => selector(store.getState()),      // stable, or you get a tearing warning
  );
}

// This component re-renders when 'brand' changes and at no other time -
// not when rows arrive, not when selection changes.
function BrandBadge() {
  const brand = useStore((s) => s.brand);
  return <span>{brand}</span>;
}

// The selector must return a stable reference for object slices, or the
// equality check fails every time. Either select primitives, or pass a
// custom equality function (useSyncExternalStoreWithSelector / shallow).`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The decision rule for context",
          text: "Context is a **dependency-injection** mechanism that happens to trigger re-renders — it is not a state manager. Use it for values that are read widely and change rarely: theme, locale, auth identity, feature flags, a stable API object. The moment a value changes at interaction frequency and is read in many places, you want an external store with selectors (`useSyncExternalStore`, Zustand, Redux) so subscription is per-slice rather than per-provider. Saying \"context has no selector, so a subscription is to the whole value\" is the sentence that shows you understand the limitation rather than just having read a blog post about it.",
        },
        { t: "h", text: "Refs, `forwardRef`, and `useImperativeHandle`" },
        {
          t: "code",
          lang: "jsx",
          caption: "A ref is a mutable box whose mutation is invisible to React",
          code: `// A ref is { current: value }. Writing to it does NOT schedule a render -
// that is the entire point, and also the entire hazard.
const renderCount = useRef(0);
renderCount.current++;               // fine: instrumentation, not UI

const latest = useRef(props.onChange);
useLayoutEffect(() => { latest.current = props.onChange; });
// The "latest ref" pattern: read a fresh callback from inside a stable
// subscription without re-subscribing on every change of that callback.

// Never read a ref during render to decide output - the render becomes
// impure and concurrent React may render twice and disagree with itself.

// forwardRef lets a consumer reach a DOM node inside your component.
const Input = forwardRef(function Input({ label, ...rest }, ref) {
  return <label>{label}<input ref={ref} {...rest} /></label>;
});

// useImperativeHandle narrows what you expose. Expose intent, not nodes -
// otherwise a consumer can call .remove() on your internals.
const StockGrid = forwardRef(function StockGrid(props, ref) {
  const viewportRef = useRef(null);
  useImperativeHandle(ref, () => ({
    scrollToRow(index) { viewportRef.current.scrollTop = index * 32; },
    focusCell(rowId, column) { /* ... */ },
  }), []);
  return <div ref={viewportRef}>{/* ... */}</div>;
});

// In React 19, 'ref' is a normal prop on function components, so
// forwardRef is no longer needed for the common case.`,
        },
        { t: "h", text: "Error boundaries, and what they do not catch" },
        {
          t: "table",
          head: ["Failure", "Caught by an error boundary?", "What to do instead"],
          rows: [
            ["Throw during render, in a lifecycle, or in a constructor", "**Yes** — this is the whole feature", "`getDerivedStateFromError` for the fallback, `componentDidCatch` for logging"],
            ["Throw inside an event handler", "No — it is not in React's render call stack", "`try/catch` in the handler, or set error state and rethrow during render"],
            ["Rejected promise / `async` failure", "No", "Catch it and put the error in state, or let a data library (`TanStack Query`, `use()`) surface it"],
            ["`setTimeout` / `requestAnimationFrame` callback", "No", "`try/catch` inside the callback; report to your error service"],
            ["Error thrown in a server-side render", "No — boundaries are client-side", "`try/catch` around `renderToPipeableStream`, plus framework-level handling"],
            ["Error in the error boundary's own fallback", "No — it propagates upward", "Keep fallbacks trivially simple; layer a root boundary above"],
            ["Event handler errors in React 19", "Reported to `onUncaughtException` on the root", "Still not a boundary — but at least it is observable"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "One boundary at the root is not a strategy",
          text: "A single top-level boundary converts any component crash into a blank page, which for an operations dashboard is the worst possible failure mode — a stock widget throwing on a malformed SSE payload should not take down the whole store view. Place boundaries at the seams that match how the product degrades: per route, per independent panel, per third-party widget. Give each a `resetKeys` or a retry action so the user is not stuck, and log with component-stack context. \"We placed boundaries per panel so one failing widget degrades instead of blanking the dashboard\" is a resilience answer, and it maps directly onto a real screen you own.",
        },
        { t: "h", text: "Composition: the patterns that remove the need for the rest" },
        {
          t: "code",
          lang: "jsx",
          caption: "Compound components, render props, HOCs — and when each is right",
          code: `// 1. COMPOUND COMPONENTS: related parts share implicit state via a
// private context. The consumer controls layout; you control behaviour.
// This is what Radix, Reach and most modern design systems use.
function Select({ value, onChange, children }) {
  const api = useMemo(() => ({ value, onChange }), [value, onChange]);
  return <SelectCtx.Provider value={api}>{children}</SelectCtx.Provider>;
}
Select.Trigger = function Trigger({ children }) { /* useContext(SelectCtx) */ };
Select.Options = function Options({ children }) { /* ... */ };
Select.Option  = function Option({ value, children }) { /* ... */ };

<Select value={brand} onChange={setBrand}>
  <Select.Trigger>{brand}</Select.Trigger>
  <Select.Options>
    {brands.map((b) => <Select.Option key={b} value={b}>{b}</Select.Option>)}
  </Select.Options>
</Select>;

// 2. RENDER PROPS: invert control over rendering while keeping the logic.
// Still the right tool when the consumer needs per-item control that
// props cannot express - virtualised rows, tables, drag layers.
<VirtualList items={rows} rowHeight={32}>
  {(row, style) => <StoreRow style={style} row={row} />}
</VirtualList>;

// 3. HOCs: mostly superseded by hooks, but still correct when you need to
// wrap the ELEMENT rather than share logic - boundaries, providers,
// instrumentation, code-splitting shells.
const Guarded = withErrorBoundary(withSuspense(StockGrid, <GridSkeleton />));

// Decision rule: share LOGIC -> custom hook. Share STRUCTURE and implicit
// state -> compound components. Hand back control of rendering -> render
// prop. Wrap the element itself -> HOC.`,
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "A component re-renders because its own state changed, its parent re-rendered, or a context it consumes has a new value.",
            "Context has no selector: consumers subscribe to the whole value. Memoise the value, split by change frequency, or move to an external store.",
            "`useSyncExternalStore` is the official subscription primitive and the basis of every modern store library.",
            "Refs are mutable boxes outside the render cycle. Never read one during render to decide output.",
            "`useImperativeHandle` should expose intent (`scrollToRow`), never raw nodes.",
            "Error boundaries catch render-phase throws only — not handlers, promises, timers or SSR. Place them per panel, not just at the root.",
            "Custom hook for logic, compound components for structure, render prop for control, HOC for wrapping the element.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 18,
      title: "Concurrent React, Server Components, and choosing a state tool",
      summary:
        "`useTransition` and `useDeferredValue` as priority tools rather than debounce substitutes, the Server Components mental model, React 19's `use()` / Actions / `useOptimistic`, and an honest comparison of RTK, RTK Query, Zustand, Jotai and TanStack Query.",
      blocks: [
        {
          t: "p",
          text: "Everything in this lesson is downstream of one idea from lesson 1: because render work is pure, restartable and lane-tagged, React can decide that some of your UI matters more than the rest right now. Concurrent features are the API for expressing that. They are not performance magic — they do not make the work faster. They change *which* work blocks the user.",
        },
        { t: "h", text: "`useTransition` and `useDeferredValue`" },
        {
          t: "code",
          lang: "jsx",
          caption: "Same problem, two entry points: the setter, or the value",
          code: `// The problem: typing in a filter box that drives a 50,000-row grid.
// Every keystroke re-renders the grid, so the input itself feels laggy.

// Option 1 - useTransition: you own the setter. Mark the EXPENSIVE
// update as non-urgent and keep the input update urgent.
function Filter() {
  const [text, setText] = useState("");          // urgent: the input
  const [query, setQuery] = useState("");        // non-urgent: the grid
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    setText(e.target.value);                     // renders immediately
    startTransition(() => setQuery(e.target.value));  // interruptible
  }

  return (
    <>
      <input value={text} onChange={onChange} />
      <Grid query={query} dimmed={isPending} />
    </>
  );
}

// Option 2 - useDeferredValue: you only own the value (it arrives as a
// prop, or from a store you do not control).
function Grid({ query }) {
  const deferred = useDeferredValue(query);
  const stale = deferred !== query;
  const rows = useMemo(() => filterRows(all, deferred), [all, deferred]);
  return <List rows={rows} className={stale ? "is-stale" : ""} />;
}

// Both require the expensive child to be memoised. If <Grid> re-renders
// on every parent render anyway, deferring the value achieves nothing.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Transitions are not debouncing, and the difference is the point",
          text: "Debouncing *delays starting* the work by a fixed guess at a timeout. A transition *starts immediately* at low priority and is abandoned and restarted if something more urgent arrives. So on a fast machine a transition gives you results sooner than a 300ms debounce, and on a slow one it still keeps the input responsive — no timeout to tune. The other half of the answer: transitions keep the previous UI visible instead of flashing a spinner, which is why they pair with `useDeferredValue`'s stale-marking rather than with a loading state. They are not a substitute for reducing the work — you still virtualise the 50,000 rows. They are how you stop the work you cannot avoid from blocking input.",
        },
        { t: "h", text: "Server Components: the mental model" },
        {
          t: "list",
          items: [
            "**Two kinds of component, one tree.** Server Components render on the server (at request time or build time) and never ship their code to the browser. Client Components are what you already write. In the App Router everything is a Server Component until a file says `\"use client\"`.",
            "**`\"use client\"` is a boundary, not a label.** It marks an entry point: that module and everything it imports goes into the client bundle. Putting it at the top of your layout defeats the entire architecture.",
            "**Data flows down and must be serialisable.** Server to Client props cross the wire, so no functions, no class instances, no `Date` methods — only serialisable data plus, specially, Server Actions and JSX elements.",
            "**No hooks, no state, no effects, no event handlers on the server.** A Server Component runs once and is gone. `async` components that `await` are the norm there — the fetch happens next to the data, so no client waterfall and no loading spinner for the initial render.",
            "**Client Components can be children of Server Components and vice versa** — the common shape is a server shell that fetches, wrapping small interactive client islands.",
            "**Streaming and Suspense are the delivery mechanism.** The server flushes HTML as it becomes ready; `loading.tsx` is a Suspense boundary. The RSC payload is a serialised tree, not HTML, which is how client-side navigation can update parts of the tree without a full reload.",
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "A server shell with a client island",
          code: `// app/stores/[id]/page.jsx  - Server Component (no "use client")
import { StockGrid } from "./stock-grid";        // a client component

export default async function StorePage({ params }) {
  // Runs on the server. No useEffect, no loading state, no client
  // waterfall - and none of this query code reaches the browser.
  const [store, rows] = await Promise.all([
    db.stores.byId(params.id),
    db.stock.forStore(params.id, { limit: 500 }),
  ]);

  return (
    <main>
      <h1>{store.name}</h1>
      <Suspense fallback={<GridSkeleton />}>
        <StockGrid initialRows={rows} storeId={store.id} />
      </Suspense>
    </main>
  );
}

// ./stock-grid.jsx
"use client";
// This module and its imports ship to the browser. Keep the boundary
// as low in the tree as possible - it is a bundle boundary.
export function StockGrid({ initialRows, storeId }) {
  const rows = useLiveStock(storeId, initialRows);   // SSE subscription
  return <VirtualGrid rows={rows} />;
}`,
        },
        { t: "h", text: "React 19: `use()`, Actions, `useOptimistic`" },
        {
          t: "code",
          lang: "jsx",
          caption: "The three additions most likely to come up",
          code: `// 1. use() - unwrap a promise or a context DURING render. Unlike hooks it
// may be called conditionally and inside loops, because it is not backed
// by the positional hook list. The component suspends until it resolves.
function StoreName({ storePromise }) {
  const store = use(storePromise);           // suspends; nearest Suspense shows
  return <h1>{store.name}</h1>;
}
// Create the promise on the SERVER (or in a cache) and pass it down.
// Creating it inside the client component means a new promise per render.

// 2. Actions + useActionState - async functions passed to form 'action'.
// Pending state, errors and progressive enhancement come for free, and
// the form works before hydration.
function AdjustForm({ storeId }) {
  const [state, submit, isPending] = useActionState(adjustStock, null);
  return (
    <form action={submit}>
      <input name="delta" type="number" />
      <button disabled={isPending}>Adjust</button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}

// 3. useOptimistic - show the intended result now, reconcile on settle.
// React reverts automatically if the action throws, which is the part
// people get wrong by hand.
function StockCell({ qty, onAdjust }) {
  const [shown, addOptimistic] = useOptimistic(qty, (curr, delta) => curr + delta);
  return (
    <button onClick={async () => { addOptimistic(+1); await onAdjust(+1); }}>
      {shown}
    </button>
  );
}

// Also in 19: ref as a plain prop (no forwardRef), ref cleanup functions,
// document metadata hoisting, useFormStatus, and the React Compiler
// handling memoisation at build time.`,
        },
        { t: "h", text: "Choosing a state tool, and defending the choice" },
        {
          t: "table",
          head: ["Tool", "Model", "Re-render granularity", "Choose it when", "Real cost"],
          rows: [
            ["**Redux Toolkit**", "Single store, reducers, immutable updates via Immer", "Per `useSelector`, with your own equality check", "Many teams, shared conventions, complex cross-slice logic, time-travel and audit needs", "Boilerplate even after RTK; selector discipline required or you re-render everything"],
            ["**RTK Query**", "Server cache built on RTK", "Per hook subscription", "You are already on Redux and want caching, invalidation and polling without a second library", "Ties your cache to Redux; less ergonomic than TanStack Query for pure data fetching"],
            ["**TanStack Query**", "Server cache, keyed and independent of your UI state", "Per query key", "Most apps. It is a cache, not a store — stale-while-revalidate, retries, dedupe, pagination, offline", "It is not client state; you still need something for UI state"],
            ["**Zustand**", "One external store, hook + selector, no provider", "Per selector, opt-in shallow compare", "You want Redux's model without the ceremony; migrating away from context sprawl", "No enforced structure, so large stores drift without conventions"],
            ["**Jotai**", "Bottom-up atoms, derived atoms compose", "Per atom — the finest granularity here", "Highly interactive UIs with lots of small, independent, derived state", "Atom graphs get hard to reason about at scale; less familiar to interviewers"],
            ["**Context + `useReducer`**", "Built in", "Per provider, whole value", "Genuinely low-frequency values: theme, locale, auth, flags", "No selectors. Becomes the performance bug you are hired to fix"],
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "The answer to \"would you still choose Redux?\"",
          text: "This question is a trap only if you defend the tool instead of the decision. The strong answer separates the two axes: server cache and client state are different problems, and most Redux stores in the wild are 80% badly-implemented server cache. So: \"the standardised Redux data layer was the right call for a 4-engineer team across 50+ shared components — one convention, predictable reviews, and the store shape is the contract between six brands' screens. If I were starting it today I would move the server cache to TanStack Query or RTK Query and keep Redux only for genuine cross-cutting client state — the SSE-driven live stock buffer, selection, filters. That would delete most of the reducers.\" Then name the constraint that actually drove it: with ~30 reviews a sprint, a boring, uniform data layer is worth more than the best-fit library, because consistency is what makes reviews fast. That is a staff-level framing of a library question.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Concurrent features do not make work faster; they decide what is allowed to block the user.",
            "`useTransition` when you own the setter, `useDeferredValue` when you only have the value. Both need the expensive subtree memoised.",
            "A transition starts immediately at low priority and is restartable — strictly better than guessing a debounce timeout.",
            "`\"use client\"` is a bundle boundary. Keep it low in the tree and pass only serialisable props across it.",
            "Server Components have no state, effects or handlers; they fetch next to the data and stream HTML.",
            "`use()` is not a hook in the positional sense, which is why it can be conditional; `useOptimistic` reverts for you on failure.",
            "Separate server cache from client state before choosing a library — that distinction is the actual interview answer.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain the two heuristics that reduce React's diffing from O(n³) to O(n), and give a concrete case where each one does the wrong thing.",
    "Walk through what the reconciler concludes when the first item of an index-keyed list is deleted, and name three pieces of state that end up on the wrong row.",
    "Explain why defining a component inside another component's body causes a remount on every render.",
    "Explain what a fiber is as a data structure, and why replacing the call stack with it is what made interruption possible.",
    "Explain the difference between the render phase and the commit phase, and why render must be side-effect free.",
    "Explain lanes as a priority bitmask, and what actually happens when a higher-priority update arrives mid-render.",
    "Explain the rules of hooks from the implementation up — the hook linked list and identification by call order.",
    "Explain what changed about batching in React 18, which roots it applies to, and what `flushSync` is for.",
    "Place `useEffect` and `useLayoutEffect` precisely in the commit sequence relative to DOM mutation, ref attachment and paint.",
    "Give the cost model for `useMemo` and `useCallback`, and describe two situations where adding them makes an app measurably slower.",
    "Explain the three reasons a component re-renders, and why 'its props changed' is not one of them.",
    "Explain why a context consumer re-renders when a part of the value it does not read changes, and give two fixes.",
    "Explain what `useSyncExternalStore` solves that a `useEffect` subscription does not, including tearing.",
    "List five things an error boundary does not catch, and say what you would do instead in each case.",
    "Explain the difference between `useTransition` and `useDeferredValue`, and why a transition beats a debounce.",
    "Explain the Server Components mental model: what `\"use client\"` marks, what can cross the boundary, and why there are no effects on the server.",
  ],

  math: [
    {
      title: "Fiber work loop",
      formula: "while (workInProgress !== null && !shouldYield()) workInProgress = performUnitOfWork(workInProgress)",
      note: "Down to `child`, across `sibling`, up through `return`. The `shouldYield` time-slice check (~5ms, scheduled via MessageChannel) is the entire difference between the sync and concurrent loops. Being able to sketch this is the strongest single internals signal available.",
    },
    {
      title: "Double buffering",
      formula: "current tree  <->  workInProgress tree ; commit swaps the pointer atomically",
      note: "Why interrupting a render is safe: abandoned work only ever touched the work-in-progress tree, so `current` is never half-updated. Also why the user never sees a partially rendered concurrent update.",
    },
    {
      title: "Hook storage",
      formula: "fiber.memoizedState -> hook0 -> hook1 -> hook2 -> null   // identified by call INDEX, never by name",
      note: "The entire justification for the rules of hooks, and for `useState` returning a tuple. Two instances of a component never share state because the list hangs off the fiber, and each element position has its own fiber.",
    },
    {
      title: "Re-render triggers",
      formula: "own state changed  OR  parent re-rendered  OR  consumed context has a new value",
      note: "Note that changed props are NOT on the list — a parent re-rendering is. This is why `React.memo` works at all, and why one inline `style={{}}` prop defeats it.",
    },
    {
      title: "Commit sequence",
      formula: "render -> mutation (DOM, refs detached) -> useLayoutEffect + refs attached -> PAINT -> useEffect",
      note: "Memorise the position of PAINT. It answers every effect-timing question, explains layout flicker, and explains why heavy work in `useLayoutEffect` is directly visible as jank.",
    },
    {
      title: "Reconciliation heuristics",
      formula: "type changed => unmount subtree and remount ; same type => reuse fiber, diff props ; children matched by key then position",
      note: "Three clauses that explain nearly every mysterious remount, lost input focus and reset scroll position. Say them in this order.",
    },
    {
      title: "Split-context provider",
      formula: "<StateCtx value={state}><ApiCtx value={useMemo(() => api, [])}>{children}</ApiCtx></StateCtx>",
      note: "Separates volatile state from a stable API so dispatch-only consumers stop re-rendering. Note `{children}` passed from above does not re-render on provider state change — composition is itself a performance tool.",
    },
    {
      title: "External store subscription",
      formula: "useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)",
      note: "The official primitive under Redux, Zustand and Jotai. `getSnapshot` must be cheap and referentially stable or you get an infinite loop or a tearing warning. This is the answer to 'context has no selector'.",
    },
    {
      title: "Imperative handle",
      formula: "useImperativeHandle(ref, () => ({ scrollToRow, focusCell }), [])",
      note: "Expose intent, never nodes. The right escape hatch for virtualised grids, canvas surfaces and third-party widgets — anything where declarative props cannot express 'do this now'.",
    },
    {
      title: "Priority split for expensive filtering",
      formula: "setText(v) /* urgent */ ; startTransition(() => setQuery(v)) /* interruptible */",
      note: "Two pieces of state for one input: one that must land this frame, one that may be abandoned. Requires the expensive consumer to be memoised, otherwise deferring achieves nothing.",
    },
    {
      title: "Optimistic update with automatic revert",
      formula: "const [shown, addOptimistic] = useOptimistic(server, (curr, action) => next)",
      note: "React reverts on rejection, which is the part hand-rolled optimistic code gets wrong. Pair it with an idempotent server action and a stable id so a retry cannot double-apply.",
    },
  ],

  practice: [
    { type: "math", q: "Build a virtualised list from scratch — no library — with fixed row height, an overscan window and correct scroll handling. Render 50,000 rows and keep the DOM under 60 nodes. 45 minutes." },
    { type: "math", q: "Write a demo that reproduces the index-key bug with an uncontrolled input in each row, then fix it by keying on id. Screenshot both — you now have a 30-second explanation for an interview." },
    { type: "math", q: "Implement `useState`, `useEffect` and `useMemo` against a hand-rolled hook linked list with a render loop, then break the rules deliberately and observe the misalignment." },
    { type: "math", q: "Build a search-over-50k-rows page twice: once with a 300ms debounce, once with `useTransition`. Profile both and record input latency and time-to-results." },
    { type: "math", q: "Take a provider holding six unrelated values and split it into state and API contexts. Use the Profiler to show the drop in re-rendered components." },
    { type: "math", q: "Write a store with `useSyncExternalStore` plus selector support and shallow equality, then prove with the Profiler that a component reading one field ignores changes to the others." },
    { type: "math", q: "Build an SSE-driven live-updating grid: buffer incoming events, flush on an animation frame, and keep scroll position and selection stable across updates. 40 minutes." },
    { type: "math", q: "Add per-panel error boundaries with retry and `resetKeys` to a multi-widget dashboard, then throw from a render, an event handler and a rejected promise and record which are caught." },
    { type: "math", q: "Build a compound `<Select>` with trigger, options, keyboard navigation, typeahead and correct ARIA — using an internal context, no state exposed to the consumer." },
    { type: "math", q: "Convert a client-fetching page to the App Router: a server shell that awaits data, a Suspense boundary, and one client island. Measure the JavaScript shipped before and after." },
    { type: "math", q: "Profile a real page of your own with the React Profiler. Write down the three most expensive commits, the cause of each, and the fix — then apply one and re-measure." },
    { type: "theory", q: "Explain, at a whiteboard with no notes, why React needed Fiber. Start from 'you cannot pause a call stack'." },
    { type: "theory", q: "A colleague adds `useMemo` to 40 components after a performance complaint. Write the review comment: what you would measure first and what you would revert." },
    { type: "theory", q: "Explain to a backend engineer why a context change re-rendered a component that does not read the value it changed." },
    { type: "theory", q: "Given a component that reads `ref.current` during render to pick what to display, explain what breaks under concurrent rendering." },
    { type: "theory", q: "Answer \"would you still choose Redux for this app?\" in ninety seconds, separating server cache from client state and naming the team constraint that drove the original decision." },
  ],

  resources: [
    { label: "react.dev — 'Render and Commit' and 'State as a Snapshot'. The official mental model, and the closest thing to a canonical answer to timing questions.", url: "https://react.dev/learn/render-and-commit", kind: "docs" },
    { label: "React Fiber Architecture (Andrew Clark) — the original design note. Short, and still the best explanation of why the call stack had to be replaced.", url: "https://github.com/acdlite/react-fiber-architecture", kind: "repo" },
    { label: "Legacy React docs — Reconciliation. The only place the two diffing heuristics are stated plainly; quote it and you sound like you read the source.", url: "https://legacy.reactjs.org/docs/reconciliation.html", kind: "docs" },
    { label: "React 18 working group — 'Automatic batching for fewer renders'. Primary source on exactly what changed from 17 and which roots it applies to.", url: "https://github.com/reactwg/react-18/discussions/21", kind: "docs" },
    { label: "jser.dev — line-by-line walkthroughs of the React source (lanes, hooks, the work loop). Read this when the docs stop being specific enough.", url: "https://jser.dev/series/react-source-code-walkthrough", kind: "blog" },
    { label: "Nadia Makarevich, developerway.com — the most rigorous writing on re-render causes, context behaviour and memoisation myths. Start with the re-renders series.", url: "https://www.developerway.com/", kind: "blog" },
    { label: "Josh Comeau — 'Why React Re-Renders'. The clearest short correction of the 'props changed' misconception.", url: "https://www.joshwcomeau.com/react/why-react-re-renders/", kind: "blog" },
    { label: "TkDodo's blog — the definitive writing on server cache versus client state, and why most Redux stores are a cache in disguise. Read before answering any state-library question.", url: "https://tkdodo.eu/blog/all", kind: "blog" },
    { label: "react.dev — `useTransition` and `useDeferredValue` references. Read both, including the caveats section; the caveats are what interviewers probe.", url: "https://react.dev/reference/react/useTransition", kind: "docs" },
    { label: "Next.js docs — Server Components and the App Router rendering model. The practical spec for what `\"use client\"` means and what may cross the boundary.", url: "https://nextjs.org/docs/app/getting-started/server-and-client-components", kind: "docs" },
    { label: "React 19 release notes — `use()`, Actions, `useOptimistic`, ref as a prop, and the Compiler. Know what is new before someone asks you what is new.", url: "https://react.dev/blog/2024/12/05/react-19", kind: "docs" },
  ],
};

export default p03;
