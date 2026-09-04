const p05 = {
  id: "p05",
  week: 5,
  hours: 8,
  title: "Testing: Jest, RTL and Playwright",
  tag: "Quality",
  why: "Jest, React Testing Library and Playwright are on your resume, which means they will be probed rather than assumed. The mid-level answer describes tools; the senior answer describes judgement — what deserves a test, what layer to mock at, why a suite that passes on a broken app is worse than no suite, and how the pipeline stops a regression reaching 1,900 stores. That judgement is the whole module.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "What to test, what not to, and where coverage lies to you",
      summary:
        "The testing trophy versus the pyramid, why frontend weights toward integration, a concrete rule for deciding whether something deserves a test, and why chasing 100% coverage produces a worse suite.",
      blocks: [
        {
          t: "p",
          text: "Interviewers rarely ask \"do you write tests\". They ask what you test, and then they listen for whether you have a *rule* or just a habit. A candidate who says \"we aim for 80% coverage\" has told you they have no rule. A candidate who says \"we test behaviour at the boundary a user or a caller actually crosses, and we do not test implementation detail because it makes refactoring expensive\" has told you they have led a codebase.",
        },
        { t: "h", text: "Pyramid, trophy, and why the shape changed" },
        {
          t: "p",
          text: "The classic pyramid — a huge base of unit tests, fewer integration, a handful of E2E — comes from a world where the unit was the interesting thing and integration was expensive. On the frontend that is inverted. A React component in isolation is nearly meaningless: the interesting behaviour is a component *plus* its hooks, its store, its router and its network layer, exercised through the DOM the way a user touches it. Kent C. Dodds' testing trophy makes integration the widest band for exactly this reason, and jsdom plus MSW made that band cheap enough to be the default.",
        },
        {
          t: "table",
          head: ["Layer", "What it covers", "Weight on a React codebase", "Cost of a failure being wrong"],
          rows: [
            ["**Static** — TypeScript, ESLint", "Whole classes of bug, for free, on every keystroke", "Always on. The cheapest tests you will ever write.", "Near zero"],
            ["**Unit**", "Pure functions: selectors, reducers, formatters, date and currency maths, permission logic", "Narrow but deep — high value where logic is branchy", "Low; failures are precise"],
            ["**Integration** (RTL + MSW)", "A feature rendered for real: user events, async states, error paths, store wiring", "**The widest band.** Most of your value lives here.", "Moderate; usually a real bug"],
            ["**E2E** (Playwright)", "Critical journeys across real routing, auth, and a real or seeded backend", "Thin and ruthlessly chosen — 10 to 30 specs, not 300", "High; flake destroys trust in the whole pipeline"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The one-line rule for what to test",
          text: "Test the things that would page you at 2am, plus the things whose logic is branchy enough that you cannot hold them in your head. Everything else is documentation you have to maintain. Concretely: test that submitting the stock-adjustment form with an invalid quantity shows an error and does not call the API; do not test that the button has the class `btn-primary`.",
        },
        { t: "h", text: "The four things worth testing, and the five that are not" },
        {
          t: "list",
          items: [
            "**Test: branchy business logic.** Permission checks, price and tax maths, stock reconciliation rules, date-window logic. Pure functions, unit-tested, many cases, cheap to run.",
            "**Test: user-visible behaviour of a feature.** Render it, click it, assert what the user would see — including the loading, empty, error and forbidden states, which is where real bugs live.",
            "**Test: the contract at a boundary.** Reducers and selectors given a state shape; API adapters given a payload; a shared component given its documented props. If four teams consume your component library, its props *are* an API and deserve tests.",
            "**Test: every bug you fix.** A regression test at the moment of the fix is the highest-value test in any codebase, because you have proof the failure is possible.",
            "**Do not test: implementation detail.** State variable names, internal function calls, hook call order, class names. These change on every refactor and produce failing tests with a working app — the worst possible signal.",
            "**Do not test: the framework or the library.** React re-renders on state change. React Router navigates. Formik tracks touched fields. Those are their maintainers' tests, not yours.",
            "**Do not test: styling, via assertions.** Snapshotting a class list is not a visual test. If appearance matters, take a real screenshot diff in Playwright.",
            "**Do not test: trivial pass-throughs.** A component that renders `props.children` inside a `<div>` does not need a spec, and a test for it inflates coverage while catching nothing.",
            "**Do not test: mocked-out logic.** If you mock the thing under test, you are asserting that your mock works. This happens more often than anyone admits.",
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The same intent tested badly and well",
          code: `// BAD: asserts implementation. Passes when the app is broken,
// fails when you rename anything. Nothing here is user-facing.
it("sets loading state", () => {
  const { result } = renderHook(() => useStockForm());
  act(() => result.current.setIsLoading(true));
  expect(result.current.isLoading).toBe(true);
  expect(result.current.internalDraft).toEqual({});
});

// GOOD: asserts the behaviour a store manager depends on.
// Survives any refactor that preserves the behaviour.
it("blocks submission and explains why when quantity exceeds stock", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  render(<StockAdjustForm available={12} onSubmit={onSubmit} />);

  await user.type(screen.getByRole("spinbutton", { name: /quantity/i }), "15");
  await user.click(screen.getByRole("button", { name: /adjust stock/i }));

  expect(
    await screen.findByText(/cannot exceed available stock/i)
  ).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});`,
        },
        { t: "h", text: "Coverage: a diagnostic, never a target" },
        {
          t: "p",
          text: "Coverage tells you which lines executed. It does not tell you whether anything was asserted. A suite that renders every component and asserts nothing can hit 95% line coverage and catch zero bugs — and once a percentage becomes a target, that is precisely the suite people write, because it is the cheapest way to move the number. The useful reading is the inverse: **look at what is at 0%**. Uncovered branches in a pricing rule or a permission guard are a real finding. The last 15% is usually error handling you cannot easily provoke, generated code, and config.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "A coverage policy that is actually enforceable",
          code: `// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.stories.jsx",
    "!src/**/index.js",          // barrels: no logic, pure noise
    "!src/generated/**",
    "!src/test/**",
  ],
  coverageThreshold: {
    // A deliberately unambitious global floor: it exists to stop
    // collapse, not to be chased.
    global: { statements: 70, branches: 65, functions: 70, lines: 70 },

    // High bars only where the logic is branchy and the blast
    // radius is 1,000 Cr of stock.
    "./src/domain/pricing/**": { branches: 95, lines: 95 },
    "./src/domain/permissions/**": { branches: 95, lines: 95 },
    "./src/store/**/selectors.js": { branches: 90, lines: 90 },
  },
};

// The number that matters more than global coverage is coverage on
// changed lines in the PR. Most CI coverage tools report it; gate
// on that instead and the suite improves where work is happening.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "You run roughly 30 code reviews a sprint across a 4-engineer team, which makes this a leadership answer rather than a tooling one. Say it like this: \"Our global threshold is deliberately modest, but pricing, permissions and selectors are gated in the 90s because a wrong number there is stock value across 1,900 stores. In review I push back on two things specifically — assertions on internal state, and any test whose name does not describe user-visible behaviour. And every bug fix needs the failing test in the same PR.\" That is a testing *policy*, and almost no candidate has one.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Frontend weights toward integration because a component without its hooks, store and network layer barely has behaviour.",
            "Test branchy logic, user-visible feature behaviour, boundary contracts, and every bug you fix.",
            "A failing test on a working app is the worst outcome in testing. That is what testing implementation detail buys you.",
            "Coverage is a diagnostic. Read the zeroes, gate per-directory and on changed lines, never chase 100%.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 22,
      title: "Jest and RTL that survive a refactor",
      summary:
        "Mocks versus spies, fake timers, snapshot rot, RTL query priority, why user-event beats fireEvent, renderHook, and resolving act warnings properly instead of silencing them.",
      blocks: [
        {
          t: "p",
          text: "This lesson is the mechanical core. Everything here is something an interviewer can ask you to do live in a shared editor, and the failure modes are specific enough that getting them right reads as experience rather than reading.",
        },
        { t: "h", text: "Mocks, spies, stubs — the distinction they will check" },
        {
          t: "table",
          head: ["Tool", "What it does", "Original still runs?", "Reach for it when"],
          rows: [
            ["`jest.fn()`", "Creates a brand-new recording function", "No original", "Passing a callback prop and asserting it was called with the right arguments"],
            ["`jest.spyOn(obj, \"m\")`", "Wraps an existing method, records calls", "**Yes**, unless you chain `.mockImplementation()`", "You want the real behaviour *and* the call record — the classic 'did we call analytics' case"],
            ["`jest.mock(\"module\")`", "Replaces the whole module in the registry", "No", "The module is genuinely unavailable in jsdom — canvas, a native SDK, a heavy chart lib"],
            ["`jest.spyOn(...).mockResolvedValue(x)`", "Stub: replaces behaviour with a fixed result", "No", "Forcing a specific branch, e.g. a 403 path"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "`restoreMocks`, or a spy leaks into every later test",
          text: "`jest.spyOn` mutates the object it is given. Forget to restore it and the mock is still there in the next test in the same file — you get a suite that passes in order and fails in isolation, or vice versa, which is a genuinely painful afternoon. Set `restoreMocks: true`, `clearMocks: true` and `resetMocks: false` in your Jest config once and stop thinking about it. If a test only passes when the whole file runs, cross-test state is the first thing to suspect.",
        },
        { t: "h", text: "Fake timers, and the deadlock that catches everyone" },
        {
          t: "code",
          lang: "javascript",
          caption: "Debounced search with fake timers — note the advanceTimers wiring",
          code: `beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();     // flush before switching back
  jest.useRealTimers();
});

it("issues one request after the user stops typing", async () => {
  // CRITICAL: user-event waits on real timers internally. Without
  // this, every await user.type() hangs forever under fake timers.
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  render(<StoreSearch />);
  await user.type(screen.getByRole("searchbox", { name: /store/i }), "andheri");

  expect(fetchStores).not.toHaveBeenCalled();      // still debouncing

  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  expect(fetchStores).toHaveBeenCalledTimes(1);
  expect(fetchStores).toHaveBeenCalledWith("andheri");
});

// Also freeze the clock whenever a test touches dates, or a test
// that passes in September fails in October:
jest.useFakeTimers().setSystemTime(new Date("2026-03-15T10:00:00Z"));`,
        },
        {
          t: "p",
          text: "Snapshot tests rot for a structural reason, not a cultural one. A snapshot asserts *everything* about the rendered output, so any legitimate change fails it — and because the failure carries no intent, the only available response is `jest -u`. Within a few sprints nobody reads the diffs and the snapshots assert nothing while still failing regularly. Snapshots earn their place for small, stable, serialisable values: a reducer's output shape, a generated GraphQL document, a config object, a design-token map. For a whole component tree, an explicit assertion about the two things you care about is strictly better, and inline snapshots (`toMatchInlineSnapshot`) at least keep the expected value next to the test where a reviewer will see it.",
        },
        { t: "h", text: "RTL query priority — this is a memorisable list, so memorise it" },
        {
          t: "list",
          ordered: true,
          items: [
            "`getByRole(role, { name })` — how assistive technology sees the page. **Default choice.** Using it means an element without an accessible name fails your test, which quietly enforces accessibility.",
            "`getByLabelText` — form fields. The label is the user's contract with the input.",
            "`getByPlaceholderText` — only when there is genuinely no label, which is itself a bug worth filing.",
            "`getByText` — non-interactive content: messages, cells, headings.",
            "`getByDisplayValue` — an input's current value, useful for edit forms.",
            "`getByAltText` / `getByTitle` — images and the odd tooltip.",
            "`getByTestId` — the escape hatch. Legitimate for a canvas node or a virtualised container with no accessible identity; a smell everywhere else. If most of your queries are test ids, your tests know your implementation, not your users."],
        },
        {
          t: "table",
          head: ["Query prefix", "Returns", "Throws when absent?", "Waits?", "Use for"],
          rows: [
            ["`getBy*`", "Element", "**Yes**", "No", "Something that must already be there"],
            ["`queryBy*`", "Element or `null`", "No", "No", "**Asserting absence** — the only correct way to do it"],
            ["`findBy*`", "`Promise<Element>`", "Yes, after timeout", "**Yes**", "Something that will appear after async work"],
            ["`*AllBy*`", "Array", "Varies by prefix", "Varies", "Counting rows, options, list items"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "`user-event` over `fireEvent`, always",
          text: "`fireEvent.click(el)` dispatches one synthetic click. A real click is `pointerdown`, `mousedown`, `focus`, `pointerup`, `mouseup`, `click` — and `fireEvent` will happily click a `disabled` button or a node covered by an overlay, so your test passes where a user is blocked. `user-event` simulates the full sequence, respects pointer-events and disabled state, and moves focus, which is why it catches keyboard and focus-management bugs that `fireEvent` cannot see. It is async: `const user = userEvent.setup()` once, then `await` every interaction. Missing those awaits is the leading cause of `act` warnings in RTL suites.",
        },
        { t: "h", text: "Async: `findBy` versus `waitFor`, and resolving `act` warnings properly" },
        {
          t: "code",
          lang: "javascript",
          caption: "Four async patterns, ranked",
          code: `// BEST: findBy - waits for appearance, retries, one clear failure.
expect(await screen.findByRole("row", { name: /SKU-4412/i }))
  .toBeInTheDocument();

// GOOD: waitFor for a non-DOM condition, or disappearance.
await waitForElementToBeRemoved(() => screen.queryByRole("progressbar"));
await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));

// BAD: side effects inside waitFor. The callback runs repeatedly
// until it passes, so this can fire the request several times.
await waitFor(async () => {
  await user.click(screen.getByRole("button", { name: /save/i })); // no
  expect(screen.getByText(/saved/i)).toBeInTheDocument();
});

// WORST: a sleep. Slow when it passes, flaky when it does not,
// and it hides the actual race rather than resolving it.
await new Promise((r) => setTimeout(r, 1000));

// Absence needs a settled state first, or you assert on a frame
// where the element had not rendered yet and get a false pass.
await screen.findByRole("table");                        // settled
expect(screen.queryByRole("alert")).not.toBeInTheDocument();`,
        },
        {
          t: "p",
          text: "An `act` warning means state updated outside the window React uses to flush and commit — in practice, a promise resolved or a timer fired after your test's last `await`. The correct response is to find the un-awaited update and await it: swap `getBy` for `findBy`, add the missing `await` on a `user-event` call, or wrap a deliberate timer advance in `await act(async () => { ... })`. What you must not do is wrap the whole test body in `act`, add a blanket `waitFor(() => {})`, or filter the warning out of the console — those hide a real race that will resurface as an intermittent CI failure at the worst moment. In an interview, \"an act warning is a symptom of an un-awaited state update, so I go and find it\" is a strong, specific answer.",
        },
        { t: "h", text: "Testing hooks with `renderHook`" },
        {
          t: "code",
          lang: "javascript",
          caption: "renderHook, with the two details people miss",
          code: `import { renderHook, act, waitFor } from "@testing-library/react";

it("debounces the value and cancels on unmount", async () => {
  jest.useFakeTimers();

  const { result, rerender, unmount } = renderHook(
    ({ value }) => useDebounced(value, 300),
    { initialProps: { value: "a" } }
  );

  expect(result.current).toBe("a");

  rerender({ value: "ab" });
  rerender({ value: "abc" });
  expect(result.current).toBe("a");                 // not settled yet

  await act(async () => { jest.advanceTimersByTime(300); });
  expect(result.current).toBe("abc");               // last value wins

  unmount();                                        // must not warn
  jest.useRealTimers();
});

// Detail 1: result.current is a live snapshot. Never destructure it
// at the top of a test -- you will assert against a stale render.
// Detail 2: hooks needing context take a wrapper.
const { result } = renderHook(() => useStockFilters(), {
  wrapper: ({ children }) => (
    <Provider store={makeStore()}>{children}</Provider>
  ),
});

// And the senior point: if a hook is only used by one component,
// prefer testing it THROUGH that component. renderHook is for
// shared hooks in a library, where the hook itself is the API.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "Your 50+ component shared library is the strongest justification for `renderHook` you have: those hooks are consumed by four teams, so the hook signature genuinely is a published API and deserves direct tests. Contrast that with a feature-local hook, which you test through its component. Drawing that line unprompted answers \"do you test hooks?\" far better than yes or no.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "`jest.fn` creates, `spyOn` wraps and can keep the original, `jest.mock` replaces a module. Set `restoreMocks: true`.",
            "Under fake timers, `userEvent.setup({ advanceTimers })` is mandatory or your test hangs.",
            "Snapshots suit small stable values; whole component trees rot into `jest -u` reflexes.",
            "`getByRole` first, `getByTestId` last. `queryBy` for absence, `findBy` for arrival.",
            "`user-event` respects disabled, pointer-events and focus; `fireEvent` does not.",
            "An `act` warning is an un-awaited update. Find it — never silence it.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 20,
      title: "Mocking at the network layer, and testing the Redux layer",
      summary:
        "Why MSW beats jest.mock on fetch, request handlers for the error paths you never test, and testing reducers, thunks and RTK Query endpoints without asserting on internals.",
      blocks: [
        {
          t: "p",
          text: "Where you mock decides how much of your own code the test actually exercises. Mock a module and everything from the call site inward is skipped — your fetch wrapper, headers, query serialisation, error normalisation, response parsing. Mock at the network layer and all of that runs for real; only the wire is fake. That single decision usually explains why one team's integration tests catch bugs and another's do not.",
        },
        { t: "h", text: "Why `jest.mock` on fetch is the weaker choice" },
        {
          t: "table",
          head: ["", "`jest.mock(\"./api\")`", "MSW (`msw` request handlers)"],
          rows: [
            ["What runs for real", "Nothing below the mocked module", "Your client, interceptors, serialisation, error mapping, retry logic"],
            ["Coupling", "To your module paths — a refactor breaks every test", "To URL and method, which is the actual contract"],
            ["Reuse", "Test-only", "Same handlers in Jest, Storybook, Playwright and local dev with a Service Worker"],
            ["Error and edge paths", "Awkward: `mockRejectedValueOnce` chains", "First-class: return 500, 403, a delay, an empty page, a malformed body"],
            ["Failure signal", "Passes even if the real request shape is wrong", "Unhandled request warning tells you the app called something unexpected"],
            ["Cost", "Zero setup", "One server file, one setup file"],
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "MSW v2 setup and the per-test override that makes error paths cheap",
          code: `// src/test/handlers.js
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/stock", ({ request }) => {
    const url = new URL(request.url);
    const brand = url.searchParams.get("brand");
    return HttpResponse.json({
      items: fixtures.stock.filter((i) => !brand || i.brand === brand),
      total: 50000,
    });
  }),

  http.post("/api/stock/adjust", async ({ request }) => {
    const body = await request.json();
    if (body.quantity > body.available) {
      return HttpResponse.json(
        { code: "EXCEEDS_STOCK", message: "Cannot exceed available stock" },
        { status: 422 }
      );
    }
    return HttpResponse.json({ ok: true }, { status: 201 });
  }),
];

// src/test/server.js
import { setupServer } from "msw/node";
export const server = setupServer(...handlers);

// jest.setup.js
// onUnhandledRequest: "error" is the important part -- an unexpected
// call becomes a failing test instead of a silent hang.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// In a single test, override just the case you care about.
it("surfaces a retryable message when the server fails", async () => {
  server.use(
    http.get("/api/stock", () =>
      HttpResponse.json({ message: "upstream down" }, { status: 503 })
    )
  );

  render(<StockDashboard />);
  expect(await screen.findByRole("alert")).toHaveTextContent(/try again/i);
  expect(screen.getByRole("button", { name: /retry/i })).toBeEnabled();
});`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The reusable-handlers argument is the one that wins the room",
          text: "The strongest case for MSW is not test ergonomics, it is that one set of handlers serves Jest (via `setupServer`), the browser during local development and Storybook (via `setupWorker`), and Playwright when you want a deterministic backend. One definition of the API contract, four consumers. Say that and you have moved from \"which mocking library do you like\" to \"how do you keep frontend and backend in agreement\", which is a much better conversation to be having.",
        },
        { t: "h", text: "Reducers and selectors: the cheapest tests in the codebase" },
        {
          t: "code",
          lang: "javascript",
          caption: "Slice, selector and thunk — all tested through public behaviour",
          code: `import reducer, { stockReceived, selectLowStock, fetchStock } from "./stockSlice";

// A reducer is a pure function. Call it directly -- no store needed.
describe("stockSlice reducer", () => {
  it("upserts an SSE stock event without dropping other entities", () => {
    const before = reducer(undefined, stockReceived([
      { id: "a", qty: 5 }, { id: "b", qty: 9 },
    ]));
    const after = reducer(before, stockReceived([{ id: "a", qty: 2 }]));

    expect(after.entities.a.qty).toBe(2);
    expect(after.entities.b.qty).toBe(9);     // untouched
    expect(after.ids).toEqual(["a", "b"]);    // order preserved
  });
});

// Selectors: assert the output AND the memoisation, because a
// selector that returns a new reference every call is a real
// performance bug and this is the only place it is cheap to catch.
it("returns a stable reference when inputs have not changed", () => {
  const state = { stock: { ids: ["a"], entities: { a: { id: "a", qty: 1 } } } };
  expect(selectLowStock(state)).toBe(selectLowStock(state));
});

// Thunks: test through a REAL store. Asserting on dispatch call
// order with a mock store tests Redux, not your code.
it("moves through pending and fulfilled and lands the data", async () => {
  const store = makeStore();                        // real configureStore
  const promise = store.dispatch(fetchStock({ brand: "trends" }));

  expect(store.getState().stock.status).toBe("loading");
  await promise;
  expect(store.getState().stock.status).toBe("succeeded");
  expect(store.getState().stock.ids).toHaveLength(3);   // from MSW fixture
});`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Stop using `redux-mock-store`",
          text: "`redux-mock-store` never runs your reducers, so all you can assert is a sequence of dispatched actions — which is implementation detail of the thunk, not behaviour. It breaks whenever you refactor a thunk into two, even though the state outcome is identical. Use a real `configureStore` with a factory that returns a fresh store per test, and assert on `getState()`. The RTK maintainers recommend exactly this, and quoting it is a cheap credibility win.",
        },
        { t: "h", text: "RTK Query endpoints" },
        {
          t: "code",
          lang: "javascript",
          caption: "RTK Query is cache-aware, so reset it between tests or results leak",
          code: `import { setupApiStore } from "../test/setupApiStore";
import { stockApi } from "./stockApi";

it("caches by argument and refetches after invalidation", async () => {
  const { store } = setupApiStore(stockApi);

  const first = await store.dispatch(
    stockApi.endpoints.getStock.initiate({ brand: "trends" })
  );
  expect(first.data.items).toHaveLength(3);
  expect(first.isSuccess).toBe(true);

  // Same argument: served from cache, no second network call.
  const cached = await store.dispatch(
    stockApi.endpoints.getStock.initiate({ brand: "trends" })
  );
  expect(cached.data).toBe(first.data);              // identical reference

  // A mutation with matching invalidatesTags forces a refetch.
  await store.dispatch(
    stockApi.endpoints.adjustStock.initiate({ id: "a", quantity: 1 })
  );
  await waitFor(() =>
    expect(store.getState().stockApi.queries["getStock({\\"brand\\":\\"trends\\"})"]
      ?.status).toBe("fulfilled")
  );
});

// Prefer testing RTK Query THROUGH a component in most cases:
// render the feature, let MSW answer, assert on what the user sees.
// Reach into endpoints.initiate only when caching, polling or tag
// invalidation IS the behaviour you are verifying.

// Two traps worth naming in an interview:
// 1. Cache survives between tests unless you build a fresh store,
//    so test two gets you a false pass from test one's data.
// 2. RTK Query retries and refetches on focus/reconnect by default
//    in some setups -- disable that in tests or you get stray calls.`,
        },
        { t: "h", text: "Testing the real-time layer" },
        {
          t: "p",
          text: "Your SSE layer over Kafka-published stock events is genuinely hard to test and therefore genuinely impressive to have tested. MSW can stream a Server-Sent Events response, but the more robust approach is to inject the transport: have the feature take an event-source factory, pass a fake in tests, and push events at it directly. Then you can assert what nobody usually bothers to assert — that events arriving out of order do not regress a quantity, that a reconnect with `Last-Event-ID` does not duplicate rows, and that a burst of 500 events in a second does not thrash the grid. Bringing up out-of-order delivery and reconnect de-duplication unprompted is a distributed-systems signal inside a frontend interview.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Mocking at the network layer runs your client, serialisation and error mapping for real. Module mocks skip all of it.",
            "`onUnhandledRequest: \"error\"` turns an unexpected call into a failing test rather than a hanging one.",
            "One set of MSW handlers serves Jest, Storybook, local dev and Playwright.",
            "Reducers are pure functions — call them directly. Selectors deserve a reference-stability assertion.",
            "Test thunks against a real store and assert `getState()`. Retire `redux-mock-store`.",
            "RTK Query caches; build a fresh store per test or you will get false passes.",
            "Inject the transport for SSE and test out-of-order events and reconnect de-duplication.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 20,
      title: "Playwright, flake, and making CI the gate",
      summary:
        "Locators and auto-waiting, page objects that are worth the indirection, the four real causes of flake, sharded CI, trace viewer, visual regression, jest-axe, and a pipeline where a regression cannot merge.",
      blocks: [
        {
          t: "p",
          text: "E2E tests are the most valuable and most dangerous tests you own. Valuable because they are the only ones that prove the whole system works. Dangerous because a flaky suite trains a team to re-run the pipeline instead of reading the failure — and at that point the suite is worse than nothing, because it costs money and consumes trust while catching nothing. Most of what follows is about flake, because that is what actually determines whether E2E survives contact with a team shipping multiple deploys a week.",
        },
        { t: "h", text: "Locators and auto-waiting: the thing Playwright does that Selenium did not" },
        {
          t: "p",
          text: "A Playwright locator is a lazy description of an element, not a handle to one. It is resolved at the moment of the action, and every action first waits for a set of actionability conditions — attached, visible, stable (not animating), enabled, and receiving pointer events. That is why a correctly written Playwright suite needs no explicit waits: `await page.getByRole(\"button\", { name: \"Adjust\" }).click()` already waits for the button to exist, stop moving and become clickable. Almost every `waitForTimeout` in a Playwright codebase is a bug someone papered over.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Locator hygiene, web-first assertions, and request interception",
          code: `import { test, expect } from "@playwright/test";

test("adjusting stock updates the grid and shows a toast", async ({ page }) => {
  await page.goto("/stock?brand=trends");

  // Role-first, same priority order as RTL. Scope with a container
  // locator instead of writing long brittle selector chains.
  const grid = page.getByRole("table", { name: /stock by sku/i });
  const row = grid.getByRole("row", { name: /SKU-4412/ });

  await row.getByRole("button", { name: /adjust/i }).click();
  await page.getByLabel(/quantity/i).fill("8");
  await page.getByRole("button", { name: /^confirm$/i }).click();

  // Web-first assertions RETRY until timeout. This is the single
  // biggest flake reducer in the framework.
  await expect(page.getByRole("status")).toHaveText(/stock adjusted/i);
  await expect(row.getByRole("cell", { name: "8" })).toBeVisible();

  // Never assert on a value you read into a variable first --
  // that snapshot cannot retry:
  // const text = await row.textContent();      // BAD
  // expect(text).toContain("8");
});

test("shows a recoverable error when the API rejects", async ({ page }) => {
  // Deterministic failure injection, no backend cooperation needed.
  await page.route("**/api/stock/adjust", (route) =>
    route.fulfill({ status: 503, body: JSON.stringify({ message: "down" }) })
  );

  await page.goto("/stock");
  await page.getByRole("button", { name: /adjust/i }).first().click();
  await page.getByRole("button", { name: /^confirm$/i }).click();

  await expect(page.getByRole("alert")).toContainText(/try again/i);
});`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The four real causes of flake",
          text: "**1. Shared mutable state.** Two specs adjusting the same SKU in parallel. Fix by giving each spec its own seeded data, keyed by worker index. **2. Time and animation.** A toast that auto-dismisses in 3s, a CSS transition, a polling interval. Fix with web-first assertions, `prefers-reduced-motion` in the test project, and clock control. **3. Authentication cost and drift.** Logging in through the UI in every spec is slow and adds a failure point; do it once in a setup project and reuse `storageState`. **4. Real network.** Third-party scripts, analytics, upstream latency. Route-block anything not under test. Notice that \"add a longer timeout\" is not on this list — raising a timeout makes a flaky test slow *and* flaky.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Config that removes three of those four causes structurally",
          code: `// playwright.config.js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,          // no accidental .only merges
  retries: process.env.CI ? 2 : 0,       // retries expose flake, not hide it
  workers: process.env.CI ? 4 : undefined,
  reporter: [["html"], ["junit", { outputFile: "results.xml" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:4173",
    trace: "on-first-retry",             // full trace only when it matters
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },

  projects: [
    // Log in once; every other project reuses the cookie jar.
    { name: "setup", testMatch: /auth\\.setup\\.js/ },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
    },
    { name: "mobile", dependencies: ["setup"],
      use: { ...devices["Pixel 7"], storageState: "e2e/.auth/user.json" } },
  ],

  webServer: {
    command: "npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});

// Sharding across CI agents -- this is how a 20-minute suite
// becomes 5 minutes on four Azure DevOps agents:
//   npx playwright test --shard=1/4   (agent 1)
//   npx playwright test --shard=2/4   (agent 2)  ... etc
// then merge the blob reports into one HTML report at the end.`,
        },
        {
          t: "p",
          text: "Two things about retries that are worth saying precisely, because interviewers use this to separate people who have owned a pipeline from people who have written specs. First, `retries: 2` is not a way to hide flake — it is a way to *classify* it: Playwright marks a test that failed then passed as **flaky** rather than passed, so you get a flake list to work through instead of a red build every morning. Second, a test that only passes on retry is a bug report about your test, and if you never triage that list the retries become a permanent sedative. Track flaky-test count as a metric and fix the top offender each sprint.",
        },
        { t: "h", text: "Page objects, and when the indirection stops paying" },
        {
          t: "p",
          text: "A page object is worth it when a *selector* or a *multi-step flow* is reused across many specs — login, a wizard, the stock-adjust dialog. It stops paying the moment it becomes a wrapper that renames Playwright's API (`clickAdjustButton()` around one `.click()`), because now a reader has to open two files to understand one action, and the assertion has moved away from the test where its intent lived. The practical rule: page objects own *how to reach and drive* things; specs own *what to assert*. Fixtures are often the better tool anyway — a custom fixture that yields an already-authenticated page with seeded stock data removes more duplication than any class hierarchy.",
        },
        {
          t: "table",
          head: ["Capability", "How", "The senior caveat"],
          rows: [
            ["**Trace viewer**", "`trace: \"on-first-retry\"`, then `npx playwright show-trace trace.zip`", "DOM snapshots, network, console and a timeline per action. This is how you debug a CI-only failure without adding logging — say this when asked how you handle 'it only fails in CI'."],
            ["**Visual regression**", "`await expect(page).toHaveScreenshot(\"grid.png\", { maxDiffPixels: 100 })`", "Baselines are OS- and font-dependent, so generate them in the same container as CI or you will diff on font hinting forever. Mask timestamps and avatars with `mask:`."],
            ["**Accessibility**", "`@axe-core/playwright` in E2E, `jest-axe` in unit/integration", "Automated axe catches roughly a third to a half of real issues — contrast, missing names, bad landmarks. It never catches a nonsensical tab order. Say that; over-claiming here is a visible tell."],
            ["**Component testing**", "`@playwright/experimental-ct-react`", "Real browser, real CSS, so it catches what jsdom cannot — but slower than RTL. Use it for canvas, layout-sensitive and pointer-heavy components, not as an RTL replacement."],
            ["**API testing**", "`request.post(\"/api/...\")` fixture", "Fastest way to seed and tear down test data. Set up state via API, assert through the UI — never drive setup through eight UI clicks."],
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "jest-axe in the integration layer, so a11y regressions fail like any other test",
          code: `import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

it("stock adjust dialog has no detectable a11y violations", async () => {
  const { container } = render(<StockAdjustDialog open available={12} />);
  // Wait for the settled state -- auditing a loading skeleton is
  // auditing the wrong DOM.
  await screen.findByRole("dialog", { name: /adjust stock/i });

  const results = await axe(container, {
    rules: {
      // Colour contrast cannot be computed in jsdom; it is checked
      // in the Playwright axe run against a real browser instead.
      "color-contrast": { enabled: false },
    },
  });
  expect(results).toHaveNoViolations();
});

// Because queries are role-based, an element with no accessible
// name already fails the functional test. jest-axe then catches the
// structural problems roles alone do not: duplicate ids, nesting
// violations, missing landmarks, unlabelled regions.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "You have the pieces for the strongest possible version of this answer: Docker plus Azure DevOps, multiple production deploys per week, and a 4-engineer team. Frame it as a gate, not a suite: \"PR pipeline runs lint, typecheck, Jest with coverage on changed lines, then Playwright sharded across four agents against a Docker Compose stack with a seeded database. Branch policy requires the build, so a regression physically cannot merge. Traces and the HTML report are published as pipeline artefacts, which is how a CI-only failure gets diagnosed without anyone re-running the job. Full-suite and visual-regression runs happen nightly rather than per-PR, because we would rather keep PR feedback under about ten minutes.\" Every clause there is a decision with a trade-off behind it, and that is what they are listening for."},
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Locators are lazy and actions auto-wait on actionability. A `waitForTimeout` is almost always a hidden bug.",
            "Use web-first assertions (`await expect(locator).toHaveText`) — they retry. Reading a value into a variable cannot.",
            "Flake comes from shared state, time/animation, auth drift and real network. Not from short timeouts.",
            "Retries classify flake, they do not fix it. Triage the flaky list or it becomes a sedative.",
            "Page objects own how to drive; specs own what to assert. Fixtures often beat page objects.",
            "Seed state through the API, assert through the UI. Never click your way through setup.",
            "Axe catches a third to a half of a11y issues. Claim exactly that, never more.",
            "The gate is the point: branch policy on a green pipeline, artefacts published, PR feedback under ten minutes.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain the testing trophy, why frontend weights toward integration rather than unit, and what changed to make that affordable.",
    "Give your rule for deciding whether a piece of code deserves a test, then apply it to three examples from your own codebase.",
    "Explain why a failing test on a working application is the worst outcome in testing, and name three habits that cause it.",
    "Explain why 100% coverage is a poor target, and describe what you actually read a coverage report for.",
    "Distinguish `jest.fn`, `jest.spyOn` and `jest.mock`, and give a scenario where each is the right tool.",
    "Explain why a test can pass when the whole file runs but fail in isolation, and what config prevents it.",
    "Explain why `userEvent.setup` needs `advanceTimers` under fake timers, in terms of what user-event does internally.",
    "Explain mechanically why snapshot tests rot, and name the cases where a snapshot is still the right assertion.",
    "Recite the RTL query priority order and justify why `getByRole` is first in accessibility terms.",
    "Explain the difference between `getBy`, `queryBy` and `findBy`, and why asserting absence requires `queryBy` plus a settled state.",
    "Explain three concrete bugs `user-event` catches that `fireEvent` cannot.",
    "Explain what an `act` warning means, how you resolve one properly, and three ways of silencing it that you would reject in review.",
    "Argue when to use `renderHook` and when to test a hook through its component instead.",
    "Explain why mocking at the network layer exercises more of your own code than mocking a module, with specific examples of what runs.",
    "Explain why `redux-mock-store` produces implementation-detail tests, and what to do instead.",
    "Explain why RTK Query tests need a fresh store per test, and what a false pass from cache leakage looks like.",
    "Explain how you would test an SSE stream, including out-of-order events and reconnect de-duplication.",
    "Explain Playwright's actionability checks and why a correctly written suite needs no explicit waits.",
    "Name the four real causes of E2E flake and the structural fix for each. Explain why raising the timeout is not one.",
    "Explain what retries in CI are for, given that they do not fix flake.",
    "Explain when a page object earns its indirection and when a fixture is the better tool.",
    "State honestly what automated accessibility testing catches and what it cannot, then describe your manual complement.",
    "Describe a CI pipeline in which a frontend regression cannot merge, including what runs per-PR versus nightly and why.",
  ],

  math: [
    {
      title: "Test distribution target",
      formula: "static (always) · unit ~25% · integration ~65% · E2E ~10%  (10-30 E2E specs, not 300)",
      note: "Frontend inverts the classic pyramid because a component without hooks, store, router and network barely has behaviour. Percentages are a shape, not a KPI — the real rule is that integration is where you reach first.",
    },
    {
      title: "Coverage policy",
      formula: "global floor 70% · domain logic 90-95% branches · gate on changed-lines coverage in the PR",
      note: "A modest global floor stops collapse; high per-directory bars go where a wrong answer costs money — pricing, permissions, selectors. Read the zeroes, not the average. Coverage measures execution, never assertion.",
    },
    {
      title: "Jest config that prevents cross-test leakage",
      formula: "{ restoreMocks: true, clearMocks: true, testEnvironment: \"jsdom\", setupFilesAfterEnv: [\"<rootDir>/jest.setup.js\"] }",
      note: "restoreMocks undoes every spyOn after each test — without it a spy survives into later tests in the same file. If a test passes only when the file runs in order, suspect this first.",
    },
    {
      title: "Fake timers with user-event",
      formula: "jest.useFakeTimers(); const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });",
      note: "user-event awaits real timers internally, so without advanceTimers every await user.type() hangs. Also setSystemTime any test that touches dates, or it fails next month.",
    },
    {
      title: "RTL query priority",
      formula: "getByRole > getByLabelText > getByPlaceholderText > getByText > getByDisplayValue > getByAltText > getByTestId",
      note: "Role-first queries fail when an element has no accessible name, which quietly enforces accessibility. Test ids are legitimate for canvas and virtualised containers, a smell everywhere else.",
    },
    {
      title: "Query prefix semantics",
      formula: "getBy = must exist now · queryBy = may be absent (returns null) · findBy = will exist (async, retries) · *AllBy = collection",
      note: "Absence assertions need queryBy AND a settled state first — await a findBy for something that must be there, then assert the alert is not. Otherwise you assert on a frame before render and get a false pass.",
    },
    {
      title: "Resolving an act warning",
      formula: "act warning => find the un-awaited update: getBy -> findBy · add await on user-event · await act(async () => jest.advanceTimersByTime(n))",
      note: "Never wrap the whole test in act, never add a blanket waitFor(() => {}), never filter the console. All three hide a race that returns as an intermittent CI failure.",
    },
    {
      title: "MSW handler skeleton",
      formula: "http.get(\"/api/x\", ({ request }) => HttpResponse.json(body, { status })) + server.listen({ onUnhandledRequest: \"error\" })",
      note: "onUnhandledRequest: \"error\" converts an unexpected call into a failing test instead of a hang. server.use(...) inside a single test overrides one route for error-path coverage. resetHandlers in afterEach.",
    },
    {
      title: "Thunk and slice testing",
      formula: "const store = makeStore(); await store.dispatch(thunk(arg)); expect(store.getState().slice)...",
      note: "Real configureStore, fresh per test, assert on state — not on a dispatched-action sequence. Reducers are pure so call them directly. Add selector reference-stability assertions: selectX(s) === selectX(s).",
    },
    {
      title: "Playwright anti-flake config",
      formula: "{ fullyParallel: true, retries: CI ? 2 : 0, trace: \"on-first-retry\", storageState via a setup project, forbidOnly: CI }",
      note: "Retries classify flake rather than fixing it — Playwright reports flaky separately from passed, giving you a triage list. trace on-first-retry is how you debug CI-only failures with no extra logging.",
    },
    {
      title: "Web-first assertions",
      formula: "await expect(locator).toHaveText(/x/)   // retries until timeout    vs    expect(await l.textContent()).toBe(\"x\")   // snapshot, cannot retry",
      note: "The single biggest flake reducer in Playwright. The moment you read a value into a variable you have frozen it and given up auto-retry. Same reason waitForTimeout is nearly always wrong.",
    },
    {
      title: "CI sharding and gating",
      formula: "npx playwright test --shard=i/N across N agents -> merge blob reports · branch policy requires green",
      note: "Four agents turn a 20-minute suite into about five. Keep PR feedback under ten minutes: lint, typecheck, Jest, sharded critical-path E2E per PR; full suite and visual regression nightly.",
    },
  ],

  practice: [
    { type: "math", q: "Take one existing test in your codebase that asserts on internal state and rewrite it as a behaviour test. Then refactor the component's internals and confirm the new test still passes." },
    { type: "math", q: "Write an RTL test for a form covering all five states — idle, submitting, validation error, server error, success — using only role-based queries. 30 minutes." },
    { type: "math", q: "Set up MSW from scratch in a project with `onUnhandledRequest: \"error\"`, then write three tests for the same endpoint: happy path, 422 with field errors, and 503 with a retry affordance." },
    { type: "math", q: "Write a debounced-search test under fake timers with `userEvent.setup({ advanceTimers })`. Then deliberately remove `advanceTimers` and observe the hang so you recognise it instantly in future." },
    { type: "math", q: "Find an `act` warning in a real suite. Resolve it by locating the un-awaited update rather than wrapping anything, and write one sentence naming what the race actually was." },
    { type: "math", q: "Test a custom hook with `renderHook`, covering initial value, prop-driven rerender, timer advancement and clean unmount with no warnings." },
    { type: "math", q: "Write reducer tests for a slice using `createEntityAdapter`, covering upsert, partial update and removal, plus a selector reference-stability assertion." },
    { type: "math", q: "Replace a `redux-mock-store` test with one against a real `configureStore`, asserting on `getState()`. Note what you can no longer assert and whether it mattered." },
    { type: "math", q: "Test an RTK Query endpoint for caching by argument and for tag invalidation triggering a refetch. Then run the tests without resetting the store and reproduce the false pass." },
    { type: "math", q: "Write three Playwright specs for your critical path with zero `waitForTimeout` calls, using only web-first assertions and role locators." },
    { type: "math", q: "Move Playwright login into a setup project with `storageState`, then measure total suite runtime before and after." },
    { type: "math", q: "Deliberately create a flaky spec using shared mutable data across parallel workers. Confirm the flake, then fix it with per-worker seeded data." },
    { type: "math", q: "Break a spec, let it fail in CI, and diagnose it purely from the published trace with no local reproduction. This is the skill, not the trace." },
    { type: "math", q: "Add `toHaveScreenshot` visual regression to two pages, generate baselines inside the CI container, and mask the timestamp region so the diff is stable." },
    { type: "math", q: "Add `jest-axe` to three components and `@axe-core/playwright` to one page. Fix everything reported, then find one issue by keyboard alone that neither tool flagged." },
    { type: "math", q: "Build a pipeline stage that runs lint, typecheck, Jest with a changed-lines coverage gate and sharded Playwright, and prove it fails on a deliberately regressed PR. Record total wall-clock time." },
    { type: "theory", q: "An engineer opens a PR with 40 new snapshot tests and a coverage jump from 62% to 84%. Write the review comment you would leave." },
    { type: "theory", q: "Explain to a mid-level engineer why testing at the network layer beats mocking the fetch module, using their own code as the example." },
    { type: "theory", q: "Answer 'how do you keep E2E tests from becoming flaky?' in ninety seconds, naming causes and structural fixes rather than timeouts." },
    { type: "theory", q: "Answer 'what do you deliberately not test, and why?' with three concrete examples and the cost you are avoiding in each." },
    { type: "theory", q: "Describe your CI pipeline end to end and justify each per-PR versus nightly decision on feedback-time grounds." },
  ],

  resources: [
    { label: "Testing Library docs — start with the guiding principles and the query priority page. Short, opinionated, and the source of every RTL judgement call you will be asked about.", url: "https://testing-library.com/docs/queries/about/#priority", kind: "docs" },
    { label: "Kent C. Dodds — 'Common mistakes with React Testing Library'. The highest-density article in frontend testing; most RTL code review comments you will ever write are in here.", url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library", kind: "blog" },
    { label: "Kent C. Dodds — 'The Testing Trophy and Testing Classifications'. The source of the shape, and the reasoning that lets you defend it rather than just cite it.", url: "https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications", kind: "blog" },
    { label: "MSW docs. Read the Node integration and the request-handler API; the reusable-handlers argument is the one that wins interviews.", url: "https://mswjs.io/docs/", kind: "docs" },
    { label: "Jest docs — Timer Mocks and Mock Functions. Reference these two pages until fake timers and spy restoration are reflexes.", url: "https://jestjs.io/docs/timer-mocks", kind: "docs" },
    { label: "Redux docs — Writing Tests. The official position on real stores over redux-mock-store; cite it and the argument ends.", url: "https://redux.js.org/usage/writing-tests", kind: "docs" },
    { label: "Playwright — Best Practices. Written specifically around flake and locator discipline; treat it as a checklist for your own suite.", url: "https://playwright.dev/docs/best-practices", kind: "docs" },
    { label: "Playwright — Trace Viewer. Learn this properly; being able to debug a CI-only failure from a trace is a demonstrable senior skill.", url: "https://playwright.dev/docs/trace-viewer-intro", kind: "docs" },
    { label: "Playwright — Test Sharding and parallelism. The exact recipe for cutting suite time across CI agents.", url: "https://playwright.dev/docs/test-sharding", kind: "docs" },
    { label: "jest-axe repo. Small, quick to read, and the README is honest about what automated a11y checking cannot detect.", url: "https://github.com/nickcolley/jest-axe", kind: "repo" },
    { label: "Deque — axe-core rule descriptions. Skim these once so you can say precisely which rule classes are automatable and which are not.", url: "https://dequeuniversity.com/rules/axe/4.10", kind: "docs" },
    { label: "Martin Fowler — 'Test Double' and 'Unit Test'. The vocabulary of mocks, stubs, spies and fakes, used correctly. Cheap credibility.", url: "https://martinfowler.com/bliki/TestDouble.html", kind: "blog" },
  ],
};

export default p05;
