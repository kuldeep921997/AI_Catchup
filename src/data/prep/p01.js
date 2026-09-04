const p01 = {
  id: "p01",
  week: 1,
  hours: 9,
  title: "JavaScript Core: The Senior Bar",
  tag: "Fundamentals",
  why: "More senior frontend candidates are rejected for shallow fundamentals than for anything else. Frameworks are learnable on the job; an interviewer probing the event loop or a closure leak is testing whether you actually understand the runtime you have been shipping to for seven years.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "The event loop, properly",
      summary:
        "Why a promise always beats a setTimeout(0), how a microtask can starve rendering, and the mental model that answers every 'what logs first' question.",
      blocks: [
        {
          t: "p",
          text: "Almost every candidate can recite \"JavaScript is single-threaded and non-blocking\". Very few can explain why `Promise.resolve().then(fn)` runs before a `setTimeout(fn, 0)` that was scheduled earlier. That gap is exactly what the question is designed to find. The good news is that one diagram answers the entire family of questions.",
        },
        { t: "h", text: "One stack, two queues, one loop" },
        {
          t: "list",
          items: [
            "**Call stack** — where synchronous code runs. While anything is on the stack, nothing else can run. This is what \"single-threaded\" means.",
            "**Macrotask queue** (task queue) — `setTimeout`, `setInterval`, I/O callbacks, `MessageChannel`, user events like clicks.",
            "**Microtask queue** — promise reactions (`.then`/`.catch`/`.finally`), `queueMicrotask`, `MutationObserver` callbacks, and the continuation after every `await`.",
            "**The loop** — take one macrotask, run it to completion, then **drain the entire microtask queue**, then let the browser render if it wants to. Repeat.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The whole rule in one sentence",
          text: "Microtasks are not \"faster\" than macrotasks — they run at a different point in the cycle. After every single macrotask, the engine drains microtasks completely before picking up the next macrotask. That is why one promise beats one timer, and why a thousand chained promises still beat that same timer.",
        },
        { t: "h", text: "The canonical interview question" },
        {
          t: "code",
          lang: "javascript",
          caption: "Predict the output before reading on",
          code: `console.log("1: script start");

setTimeout(() => console.log("2: timeout"), 0);

Promise.resolve()
  .then(() => console.log("3: promise one"))
  .then(() => console.log("4: promise two"));

queueMicrotask(() => console.log("5: queued microtask"));

(async () => {
  console.log("6: async fn body (synchronous!)");
  await null;
  console.log("7: after await");
})();

console.log("8: script end");`,
        },
        {
          t: "p",
          text: "The order is **1, 6, 8, 3, 5, 7, 4, 2**. Walk it slowly. Lines 1, 6 and 8 are synchronous — note that the body of an `async` function runs synchronously up to its first `await`, which is the detail most people miss. Then the current macrotask (the script itself) ends and microtasks drain in FIFO order: the first `.then` (3), the `queueMicrotask` (5), the continuation after `await null` (7). The second `.then` (4) was only *scheduled* when the first one resolved, so it joins the back of the queue. Only when the microtask queue is completely empty does the timer (2) get its turn.",
        },
        { t: "h", text: "Where this stops being trivia" },
        {
          t: "p",
          text: "Because microtasks drain *completely* before the browser is allowed to render, a recursive microtask will freeze the page permanently — no paint, no input, no scroll. A recursive `setTimeout` will not, because each iteration yields a macrotask boundary and lets rendering happen.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "One of these locks the tab forever",
          code: `// Freezes the page. The microtask queue never empties,
// so the browser never reaches the render step.
function starve() {
  queueMicrotask(starve);
}

// Fine. Each tick is a separate macrotask, so paint and
// input get a chance between iterations.
function polite() {
  setTimeout(polite, 0);
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "This is the theory behind the dashboard optimisation on your resume. Long synchronous render work blocks the macrotask, which blocks paint, which is what a user experiences as jank. \"I broke the work up so the main thread could yield between chunks\" is a senior answer; \"I added useMemo\" is a mid-level one. Have both ready.",
        },
        { t: "h", text: "Rendering, and where requestAnimationFrame sits" },
        {
          t: "list",
          items: [
            "`requestAnimationFrame` callbacks run **before** the next paint, after microtasks — the right place for visual updates.",
            "`requestIdleCallback` runs when the browser has spare time in a frame — the right place for analytics and prefetching, wrong place for anything the user is waiting on.",
            "A 60fps budget is **16.7ms per frame**. Anything over 50ms is a \"long task\" and directly damages INP.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Sync code → drain **all** microtasks → optional render → next macrotask.",
            "An `async` function body is synchronous until its first `await`; everything after is a microtask.",
            "Microtask recursion starves rendering; macrotask recursion does not.",
            "Long tasks block paint. That is the bridge between this lesson and every performance question you will be asked.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 20,
      title: "Closures, `this`, and how functions capture",
      summary:
        "The two independent capture mechanisms in JavaScript — lexical scope and the call-site `this` — and the leaks that follow from misunderstanding the first.",
      blocks: [
        {
          t: "p",
          text: "JavaScript functions capture two different things by two completely different rules. Variables are captured **lexically**, decided when you write the code. `this` is captured **dynamically**, decided when you call the function. Conflating the two produces most of the confusion in the language, and separating them cleanly is a strong senior signal.",
        },
        { t: "h", text: "Closures: a function plus its birthplace" },
        {
          t: "p",
          text: "A closure is a function bundled with the scope it was created in. The scope stays alive as long as the function does — which is both the feature and the memory leak.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The three classic uses, all one mechanism",
          code: `// 1. Private state — no class needed.
function counter() {
  let n = 0;                        // captured, unreachable from outside
  return { inc: () => ++n, get: () => n };
}

// 2. Run-once semantics.
function once(fn) {
  let called = false, result;
  return (...args) => {
    if (called) return result;
    called = true;
    result = fn(...args);
    return result;
  };
}

// 3. Partial application — the captured arg outlives the outer call.
const add = (a) => (b) => a + b;
const add5 = add(5);
add5(3);                            // 8`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The leak they will ask you to find",
          text: "A closure retains its **entire** enclosing scope, not just the variables it uses — engines optimise this, but you cannot rely on it. If a long-lived event listener closes over a scope containing a large array or a DOM node, that memory is pinned for as long as the listener is attached. This is the number one cause of leaks in long-lived SPAs, and the reason every `addEventListener` needs a matching `removeEventListener` in cleanup.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Same bug, React flavour",
          code: `// Leaks: the listener closes over \`rows\`, and is never removed.
useEffect(() => {
  const rows = new Array(100_000).fill({ /* ... */ });
  window.addEventListener("resize", () => recalc(rows));
}, []);

// Correct: return a cleanup function.
useEffect(() => {
  const rows = new Array(100_000).fill({ /* ... */ });
  const onResize = () => recalc(rows);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);`,
        },
        { t: "h", text: "`this`: four rules, checked in order" },
        {
          t: "table",
          head: ["Rule", "Trigger", "`this` becomes"],
          rows: [
            ["`new` binding", "`new Fn()`", "The freshly created object"],
            ["Explicit binding", "`fn.call(o)`, `fn.apply(o)`, `fn.bind(o)`", "`o`"],
            ["Implicit binding", "`o.fn()`", "`o` — the object left of the dot"],
            ["Default binding", "`fn()`", "`undefined` in strict mode, `globalThis` otherwise"],
          ],
        },
        {
          t: "p",
          text: "Arrow functions sit outside this table entirely. They have no `this` of their own; they close over the `this` of the enclosing lexical scope, exactly like any other variable. This is why an arrow function is correct for a callback inside a method, and wrong for an object method that needs to reference its own object.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The lost-binding trap",
          code: `const user = {
  name: "Kuldeep",
  greet() { return "Hi, " + this.name; },
};

user.greet();                       // "Hi, Kuldeep"  — implicit binding

const fn = user.greet;
fn();                               // "Hi, undefined" — binding lost

setTimeout(user.greet, 0);          // "Hi, undefined" — same reason

setTimeout(() => user.greet(), 0);  // "Hi, Kuldeep"  — call site preserved
setTimeout(user.greet.bind(user), 0); // also fine`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The one-line answer",
          text: "\"Variables are captured lexically at definition time; `this` is captured dynamically at call time, unless the function is an arrow, in which case `this` is lexical too.\" Say that and the follow-up questions get easier.",
        },
        { t: "h", text: "Prototypes, briefly but properly" },
        {
          t: "p",
          text: "Property lookup walks the prototype chain: own properties first, then `Object.getPrototypeOf(obj)`, and so on until `null`. `class` is syntax over exactly this — methods land on `Ctor.prototype`, which is why every instance shares one function object rather than each getting a copy. Know that `__proto__` is the accessor and `prototype` is the property on constructor functions; interviewers like that distinction because it separates people who read the spec from people who pattern-matched.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Closure = function + captured scope. It is how you get privacy, memoisation and partial application.",
            "Closures pin memory. Long-lived listeners over large scopes are the classic SPA leak.",
            "`this` follows four rules in priority order; arrows opt out and inherit lexically.",
            "`class` is prototype delegation with better syntax — methods are shared, not copied.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 22,
      title: "Async orchestration: what they actually ask you to build",
      summary:
        "Promise combinators, the concurrency limiter, retry with backoff, and cancellation — the four async utilities that appear in real senior interviews.",
      blocks: [
        {
          t: "p",
          text: "Once past \"what is a promise\", senior async questions become small engineering problems: run these hundred requests but only five at a time; retry this but back off; cancel the in-flight request when the user types again. These have canonical solutions. Knowing them cold converts a stressful question into a two-minute answer.",
        },
        { t: "h", text: "The combinators, and when each is right" },
        {
          t: "table",
          head: ["Combinator", "Resolves when", "Rejects when", "Use it for"],
          rows: [
            ["`Promise.all`", "All fulfil", "**Any** rejects (fail fast)", "Parallel data you all need — a dashboard's initial load"],
            ["`Promise.allSettled`", "All settle, ever", "Never", "Independent work where partial success is fine — analytics fan-out"],
            ["`Promise.race`", "First **settles**", "First settles as rejected", "Timeouts — race the work against a rejecting timer"],
            ["`Promise.any`", "First **fulfils**", "All reject (`AggregateError`)", "Redundant sources — try three mirrors, take the winner"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The `Promise.all` trap worth voicing",
          text: "`Promise.all` rejects on the first failure but does **not** cancel the others — they keep running, and an unhandled rejection from a later one can still surface. If each request matters independently, `allSettled` is almost always the right call. Saying this unprompted marks you out immediately.",
        },
        { t: "h", text: "Sequential versus parallel await" },
        {
          t: "code",
          lang: "javascript",
          caption: "The most common real-world async mistake",
          code: `// 900ms — each await blocks the next. Almost always a bug.
const user  = await getUser(id);       // 300ms
const posts = await getPosts(id);      // 300ms
const stats = await getStats(id);      // 300ms

// 300ms — all three start immediately, then we wait once.
const [user, posts, stats] = await Promise.all([
  getUser(id), getPosts(id), getStats(id),
]);

// Sequential is only correct when there is a real data dependency:
const user = await getUser(id);
const team = await getTeam(user.teamId);   // needs user first`,
        },
        { t: "h", text: "The concurrency limiter" },
        {
          t: "p",
          text: "\"Run 200 requests, at most 5 in flight\" is asked constantly, because it separates people who understand promises from people who memorised syntax. The clean solution is N workers pulling from a shared cursor — no queue library, no recursion.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Worth memorising — you will write this in an interview",
          code: `async function pool(tasks, limit = 5) {
  const results = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const i = cursor++;              // claim an index, sync — no race in JS
      try {
        results[i] = { status: "fulfilled", value: await tasks[i]() };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker)
  );
  return results;
}

// tasks must be an array of THUNKS (() => Promise), not promises.
// A promise is already running; a thunk lets the pool control start time.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Why thunks, not promises",
          text: "This is the detail interviewers dig into. `[fetch(a), fetch(b)]` has already fired both requests — you cannot limit concurrency after the fact. `[() => fetch(a), () => fetch(b)]` defers the work, so the pool decides when each begins. If you get asked to \"limit concurrency\" and you accept an array of promises, the function cannot possibly work.",
        },
        { t: "h", text: "Retry with exponential backoff and jitter" },
        {
          t: "code",
          lang: "javascript",
          caption: "Jitter is the part people forget",
          code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retry(fn, { attempts = 4, base = 300, factor = 2 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === attempts - 1) break;
      const backoff = base * factor ** i;         // 300, 600, 1200...
      const jitter  = Math.random() * backoff;    // spread the herd
      await sleep(backoff + jitter);
    }
  }
  throw lastErr;
}`,
        },
        {
          t: "p",
          text: "Without jitter, every client that failed at the same moment retries at the same moment — you have built a synchronised stampede against a service that is already struggling. Mentioning the thundering-herd problem is a systems-thinking signal in what looks like a coding question.",
        },
        { t: "h", text: "Cancellation with AbortController" },
        {
          t: "code",
          lang: "javascript",
          caption: "Race conditions in search-as-you-type",
          code: `let controller;

async function search(term) {
  controller?.abort();                  // cancel the previous in-flight call
  controller = new AbortController();
  try {
    const res = await fetch(\`/api/search?q=\${encodeURIComponent(term)}\`, {
      signal: controller.signal,
    });
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") return null;   // expected, not an error
    throw err;
  }
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "The out-of-order response bug",
          text: "Type \"rea\" then \"react\". Without cancellation, if the response for \"rea\" arrives *after* the one for \"react\", you render results for the wrong query. Raising this before the interviewer does is one of the strongest signals available in a machine coding round — it is a bug they specifically watch for. The fixes are aborting the previous request, or stamping each request and discarding stale responses.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Pick combinators by failure semantics, not by habit. `allSettled` more often than you think.",
            "Independent awaits in sequence is a latency bug; `Promise.all` is the fix.",
            "The pool takes thunks. That single design decision is the whole question.",
            "Retry needs jitter. Search needs cancellation. Say both out loud.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 15,
      title: "Reimplementing the standard library",
      summary:
        "Polyfills are not busywork — writing bind, deep clone and a debounce with cancel forces you to confront the parts of the language you have been coasting on.",
      blocks: [
        {
          t: "p",
          text: "\"Implement `Function.prototype.bind`\" is not a test of whether you know what bind does. It is a test of whether you understand `this`, argument forwarding, and the `new` edge case simultaneously. Each of these small exercises has one detail that reveals depth — learn the detail, not just the shape.",
        },
        { t: "h", text: "bind, and the `new` edge case" },
        {
          t: "code",
          lang: "javascript",
          caption: "The last two lines are the actual question",
          code: `Function.prototype.myBind = function (ctx, ...bound) {
  const fn = this;
  function wrapped(...args) {
    // If called with \`new\`, the bound context must be IGNORED
    // and \`this\` must be the newly constructed object.
    const isNew = this instanceof wrapped;
    return fn.apply(isNew ? this : ctx, [...bound, ...args]);
  }
  wrapped.prototype = Object.create(fn.prototype || null);
  return wrapped;
};`,
        },
        { t: "h", text: "debounce with the parts people omit" },
        {
          t: "code",
          lang: "javascript",
          caption: "Leading, trailing, and cancel",
          code: `function debounce(fn, wait = 300, { leading = false, trailing = true } = {}) {
  let timer = null;
  let lastArgs = null;

  function invoke(ctx) {
    fn.apply(ctx, lastArgs);
    lastArgs = null;
  }

  function debounced(...args) {
    lastArgs = args;
    const callNow = leading && timer === null;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) invoke(this);
    }, wait);
    if (callNow) invoke(this);
  }

  debounced.cancel = () => { clearTimeout(timer); timer = null; lastArgs = null; };
  debounced.flush  = () => { if (lastArgs) { clearTimeout(timer); timer = null; invoke(null); } };
  return debounced;
}`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Why cancel matters in React",
          text: "Without `cancel`, a debounced handler can fire after the component unmounts — you get a state update on a dead component, or a request whose result nobody wants. Any debounce you create inside a component needs `debounced.cancel()` in the effect cleanup. Volunteering this shows you have shipped it, not just read about it.",
        },
        { t: "h", text: "throttle, and how it differs" },
        {
          t: "p",
          text: "Debounce waits for quiet: it fires once the events **stop**. Throttle enforces a rate: it fires at most once per interval **while** events continue. Search-as-you-type wants debounce. Scroll position tracking and resize handlers want throttle. Getting this pairing wrong in a machine coding round is a visible mistake.",
        },
        { t: "h", text: "deep clone, and the four things that break naive versions" },
        {
          t: "list",
          items: [
            "**Cycles** — `a.self = a` causes infinite recursion. Fix with a `WeakMap` of seen objects.",
            "**Built-ins** — `Date`, `RegExp`, `Map`, `Set` need explicit handling; `JSON.parse(JSON.stringify(x))` silently mangles all of them.",
            "**Functions and symbols** — `JSON` drops them entirely, along with `undefined` values.",
            "**Prototypes** — a clone should usually keep its prototype; the JSON round-trip returns a plain object.",
          ],
        },
        {
          t: "p",
          text: "The modern answer is `structuredClone()`, which handles cycles, `Map`, `Set`, `Date` and typed arrays natively but throws on functions and DOM nodes. The best interview answer is both: \"in production I'd reach for `structuredClone`; here's the hand-rolled version and the four cases it has to handle.\"",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Every polyfill has one revealing detail — `bind` has `new`, `debounce` has `cancel`, `clone` has cycles.",
            "Debounce for \"stopped\", throttle for \"while\". Never mix them up out loud.",
            "Know `structuredClone` exists; still be able to write the manual version.",
            "Cleanup is not optional. Timers, listeners and requests all need teardown.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Walk through the event loop out loud: sync stack, microtask drain, render opportunity, next macrotask. Then explain why a promise beats a setTimeout(0).",
    "Explain why the body of an async function runs synchronously up to its first await, and what the continuation after await actually is.",
    "Explain how recursive microtasks freeze a page while recursive setTimeout does not.",
    "Define a closure precisely, then explain the memory-leak mechanism it creates in long-lived listeners.",
    "State the four `this` binding rules in priority order, and explain why arrow functions are not on that list.",
    "Explain the difference between `__proto__` and `prototype`, and what `class` desugars to.",
    "Choose between all / allSettled / race / any for a given scenario and justify it on failure semantics.",
    "Explain why a concurrency limiter must accept thunks rather than promises.",
    "Explain the thundering-herd problem and why retry backoff needs jitter.",
    "Explain the out-of-order response bug in search-as-you-type and give two independent fixes.",
    "Explain the difference between debounce and throttle, with a real use case for each from your own work.",
    "List four things `JSON.parse(JSON.stringify(x))` silently breaks, and name the modern replacement.",
    "Explain event delegation, and the difference between stopPropagation and preventDefault.",
    "Explain how you would find a memory leak in a running SPA using Chrome DevTools heap snapshots.",
    "Explain what makes a task a 'long task', the 50ms threshold, and how it connects to INP.",
  ],

  math: [
    {
      title: "Debounce — trailing, leading, with cancel",
      formula: "function debounce(fn, wait, { leading, trailing }) -> debounced & { cancel, flush }",
      note: "Fires after events STOP. The cancel method is the senior detail: without it a debounced callback can fire after unmount. Reach for this on search inputs, autosave and validation.",
    },
    {
      title: "Throttle — rate limiting",
      formula: "function throttle(fn, interval) -> throttled  // fires at most 1× per interval",
      note: "Fires WHILE events continue, unlike debounce. Two implementations: timestamp comparison (fires immediately, simpler) or trailing timer (guarantees a final call). Use for scroll, resize, mousemove.",
    },
    {
      title: "Concurrency limiter / promise pool",
      formula: "async function pool(thunks: (() => Promise<T>)[], limit) -> Promise<Settled<T>[]>",
      note: "N workers pulling from a shared cursor. MUST take thunks, not promises — a promise has already started. Asked constantly at senior level; know it from memory.",
    },
    {
      title: "Retry with exponential backoff + jitter",
      formula: "delay(i) = base × factor^i + random() × base × factor^i",
      note: "Jitter de-synchronises clients that all failed together, preventing a thundering herd against an already-struggling service. Also decide which errors are retryable — 5xx yes, 4xx usually no.",
    },
    {
      title: "Memoize with a key resolver",
      formula: "function memoize(fn, resolver = (...a) => JSON.stringify(a)) -> memoized & { cache }",
      note: "Default JSON key breaks on functions, cycles and key order. Use a WeakMap for single object arguments so entries are garbage collected. Discuss cache eviction unprompted — an unbounded memo cache is a leak.",
    },
    {
      title: "EventEmitter",
      formula: "on(ev, fn) · off(ev, fn) · once(ev, fn) · emit(ev, ...args) -> boolean",
      note: "Map<string, Set<fn>> internally — a Set gives O(1) removal and dedupes handlers. once wraps the handler so it can remove itself. Foundation for a dozen other questions including the observer pattern in LLD.",
    },
    {
      title: "Deep clone",
      formula: "clone(value, seen = new WeakMap()) -> value  // cycles, Map, Set, Date, RegExp, prototype",
      note: "The WeakMap of seen objects is what stops infinite recursion on cyclic input. Name structuredClone() as the production answer, then write the manual version.",
    },
    {
      title: "Curry / partial application",
      formula: "curry(fn) -> (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args))",
      note: "fn.length (arity) is the termination condition. Infinite currying — sum(1)(2)(3)() — instead accumulates and uses toString/valueOf coercion to produce the total.",
    },
    {
      title: "Abortable fetch wrapper",
      formula: "const c = new AbortController(); fetch(url, { signal: c.signal }); c.abort()",
      note: "AbortError is expected control flow, not a failure — swallow it, never surface it to the user. The same signal can cancel several requests at once, which is how you tear down a whole view's in-flight work.",
    },
    {
      title: "Frame budget",
      formula: "60fps => 16.7ms/frame · long task > 50ms · INP target < 200ms",
      note: "The numbers to quote when discussing jank. A single 300ms synchronous render blocks roughly 18 frames — that is what a user calls 'laggy'. Ties directly to your 8s to 3s dashboard story.",
    },
  ],

  practice: [
    { type: "math", q: "Build a promise pool from scratch in 20 minutes. Accept thunks, honour the limit, and return settled results in input order. No libraries." },
    { type: "math", q: "Implement debounce with leading, trailing, cancel and flush in 15 minutes, then write five unit tests using fake timers." },
    { type: "math", q: "Implement throttle twice — once with timestamps, once with a trailing timer — and write down the observable behavioural difference." },
    { type: "math", q: "Implement deep clone handling cycles, Map, Set, Date and RegExp, preserving prototypes. 25 minutes." },
    { type: "math", q: "Implement EventEmitter with on/off/once/emit in 15 minutes. Then extend it so emit returns whether any listener fired." },
    { type: "math", q: "Implement Function.prototype.bind including the `new` case. 15 minutes." },
    { type: "math", q: "Implement retry with exponential backoff and jitter, plus a predicate deciding which errors are retryable. 20 minutes." },
    { type: "math", q: "Build a search-as-you-type function that debounces input, cancels in-flight requests, and caches results by query. 30 minutes." },
    { type: "math", q: "Implement Promise.all, Promise.allSettled and Promise.any from scratch, without using each other." },
    { type: "theory", q: "Predict the output of a mixed script containing setTimeout, two chained .then calls, queueMicrotask and an async IIFE with an await. Explain each position." },
    { type: "theory", q: "Given a React component that leaks memory via an event listener over a large array, identify the leak and describe the DevTools workflow that would find it." },
    { type: "theory", q: "Explain to a mid-level engineer why `[fetch(a), fetch(b)]` cannot be concurrency-limited, using no jargon." },
    { type: "theory", q: "You see three sequential awaits with no data dependency in a code review. Write the review comment you would leave, including the latency impact." },
    { type: "theory", q: "Explain why over-using useMemo can make an app slower, referencing what memoisation actually costs." },
  ],

  resources: [
    { label: "You Don't Know JS Yet, 2nd ed. — Kyle Simpson (free, full text on GitHub). Read 'Scope & Closures' and 'Objects & Classes'.", url: "https://github.com/getify/You-Dont-Know-JS", kind: "book" },
    { label: "javascript.info — the best structured modern JS reference. The Promises and Event Loop chapters especially.", url: "https://javascript.info/", kind: "docs" },
    { label: "Jake Archibald — 'In The Loop' (JSConf.Asia). Thirty minutes that will fix your event loop model permanently.", url: "https://www.youtube.com/watch?v=cCOL7MC4Pl0", kind: "course" },
    { label: "Jake Archibald — 'Tasks, microtasks, queues and schedules'. The canonical written explanation.", url: "https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/", kind: "blog" },
    { label: "BFE.dev — 300+ JavaScript implementation challenges. Exactly the polyfill-style questions asked at senior level.", url: "https://bigfrontend.dev/", kind: "repo" },
    { label: "GreatFrontEnd — frontend interview platform with graded JS utility questions and solutions.", url: "https://www.greatfrontend.com/", kind: "course" },
    { label: "Frontend Interview Handbook — free, well-curated, strong on JS fundamentals.", url: "https://www.frontendinterviewhandbook.com/", kind: "docs" },
    { label: "MDN — Concurrency model and the event loop.", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model", kind: "docs" },
    { label: "MDN — AbortController, for cancellation patterns.", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController", kind: "docs" },
    { label: "web.dev — Optimize long tasks. Connects the event loop to INP and real performance work.", url: "https://web.dev/articles/optimize-long-tasks", kind: "blog" },
  ],
};

export default p01;
