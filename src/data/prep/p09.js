const p09 = {
  id: "p09",
  week: 9,
  hours: 11,
  title: "Frontend System Design",
  tag: "Interview Rounds",
  why: "This is a distinct round from backend HLD and almost nobody prepares for it properly — candidates walk in and start drawing load balancers and Kafka topics for a question about a news feed. That gap is your biggest single opportunity, because you have already made and defended these decisions in production: SSE over WebSocket for a Kafka-backed real-time stock feed, virtualisation on 50,000-row grids, a 50-component library on a standardised data layer. The work here is turning that experience into a repeatable forty-five-minute structure.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 22,
      title: "RADIO, with a clock on it",
      summary:
        "Requirements, Architecture, Data model, Interface, Optimisations — the framework that stops a frontend design round from turning into a rambling list of libraries, plus the time budget that makes it fit in forty minutes.",
      blocks: [
        {
          t: "p",
          text: "A frontend system design round is open-ended by construction, so the marking is mostly about whether you *have* a structure. RADIO is the one most Indian product companies' interviewers recognise, and the recognition itself helps — when you announce the five phases up front, the interviewer knows where you are going and stops worrying that you will run out of road.",
        },
        { t: "h", text: "What is actually being tested, versus backend HLD" },
        {
          t: "table",
          head: ["Dimension", "Backend HLD", "Frontend system design"],
          rows: [
            ["Bottleneck you reason about", "Throughput, storage, consistency across nodes", "The main thread, the network round trip, bundle bytes, the DOM"],
            ["Scale units", "QPS, TB, replicas, partitions", "Concurrent users per tab, payload size, rows rendered, LCP/INP budgets"],
            ["Core diagram", "Services, queues, databases, caches", "Component hierarchy, data flow, client cache, transport"],
            ["Data model means", "Table schema, indexes, sharding key", "Client entities, normalised store shape, cache keys, what is server state versus UI state"],
            ["Interface means", "Service-to-service contracts, RPC", "HTTP/WS contracts *and* component prop APIs"],
            ["The thing juniors miss", "Consistency trade-offs", "Loading, empty and error states; accessibility; the offline case"],
            ["Where you win", "Capacity maths", "Naming a real trade-off you have actually paid for in production"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The most common way this round is failed",
          text: "Designing before asking. \"Design a news feed\" is not a spec — it is an invitation to negotiate one. If you start drawing components in minute one you will design the wrong product, and the interviewer will spend the rest of the round correcting you instead of assessing you. Five minutes of requirements is not overhead; it is the first marked section.",
        },
        { t: "h", text: "The forty-minute budget" },
        {
          t: "steps",
          items: [
            {
              title: "R — Requirements, 5 min",
              text: "Split functional from non-functional and write both lists where the interviewer can see them. Functional: what can a user do, on what devices, with what permissions. Non-functional: how many concurrent users, what latency and freshness, offline, SEO, accessibility, i18n, browser support. Close by reading the list back and asking which two matter most — that answer tells you what to optimise for later, and it is the same trick as asking a PM to rank the backlog.",
            },
            {
              title: "A — Architecture, 10 min",
              text: "Draw the component hierarchy, the module boundaries, and the data flow arrows. State explicitly where each piece of state lives and why. Then draw the line between client and server responsibility: who paginates, who filters, who aggregates, who authorises. This is the section that most differentiates senior from mid, because juniors draw boxes and seniors draw *ownership*.",
            },
            {
              title: "D — Data model, 5 min",
              text: "List the client-side entities and their relationships, then say how the store is shaped: normalised by id or nested; what the cache key is; what is server state (cacheable, refetchable, shared) versus client state (ephemeral, local, never persisted). Point at where derived data is computed rather than stored.",
            },
            {
              title: "I — Interface, 8 min",
              text: "Two interfaces, and say that out loud so they know you mean both. The network interface: endpoint shapes, pagination strategy, real-time transport, error envelope, auth. And the component interface: the prop API of the two or three components a consumer would actually touch, including controlled/uncontrolled and the escape hatch.",
            },
            {
              title: "O — Optimisations, 10 min",
              text: "Ordered by impact on the requirements you agreed in R, not by what you find interesting. Network (caching, prefetch, compression), rendering (virtualisation, memoisation, code-splitting, image strategy), perceived performance (skeletons, optimistic updates, streaming), then the cross-cutting set: accessibility, error and empty states, i18n and RTL, observability. Finish with the two things you deliberately left out and why.",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Say the budget out loud in minute zero",
          text: "\"I'll take five minutes on requirements, ten on architecture, five on the data model, eight on the interfaces, and keep ten for optimisations and trade-offs — stop me if you want to go deeper anywhere.\" This single sentence does three things: it proves you have a method, it invites the interviewer to steer, and it gives you permission to cut a tangent short later with \"let me park that and come back in the optimisations section\".",
        },
        { t: "h", text: "The requirements questions that always pay" },
        {
          t: "list",
          items: [
            "**Users and scale** — \"How many concurrent users on a single view, and how many items in the largest realistic list?\" This one question decides pagination, virtualisation and transport.",
            "**Freshness** — \"How stale can this data be? One second, one minute, or on-demand refresh?\" Sub-second freshness forces a push transport; sixty seconds means polling is genuinely fine and saying so is a maturity signal.",
            "**Devices and network** — \"Desktop-only internal tool, or 3G mobile in a store aisle?\" Completely different bundle and image budgets.",
            "**SEO** — \"Does this need to be indexable?\" The single input that decides CSR versus SSR/SSG. Internal dashboards never need it; a PDP always does.",
            "**Authentication and personalisation** — \"Is the content per-user?\" Personalised content cannot be cached at the CDN edge in the naive way, which reshapes the whole rendering answer.",
            "**Write path** — \"Can users mutate this data, and do they expect their own edits to appear instantly?\" That is the optimistic-update conversation.",
            "**Offline** — \"Does this have to work with no connection?\" Rare, but if yes it dominates the design and you should say so immediately.",
            "**Constraints** — \"Existing stack, existing design system, team size, deadline?\" Real architecture is constrained architecture, and acknowledging that reads as experience.",
          ],
        },
        {
          t: "code",
          lang: "text",
          caption: "The requirements block, written where the interviewer can see it",
          code: `FUNCTIONAL
  - operator sees live stock-on-hand for one store, ~8,000 SKUs
  - filter by category / low-stock, sort by any column
  - drill into a SKU for movement history
  - acknowledge an alert (write path)

NON-FUNCTIONAL
  - freshness: < 5s from the source event      -> push transport, not polling
  - 12,000 daily users, ~400 concurrent peak   -> connection cost matters
  - 8,000 rows in one view                     -> virtualisation, server-side filter
  - desktop Chrome in-store + tablet           -> no legacy browser tax
  - no SEO (authenticated internal)            -> CSR is fine, SSR adds nothing
  - keyboard-operable (store staff, gloves)    -> a11y is a requirement, not polish
  - corporate proxies between client and DC    -> transport must survive them

OUT OF SCOPE (agreed)
  - offline editing, native app, multi-store aggregation`,
        },
        {
          t: "p",
          text: "Every line in the non-functional list has an arrow pointing at a decision. That is the whole trick: requirements are not a formality you get through, they are the premises you will cite for the next thirty-five minutes. When you later say \"polling is wrong here\", you point at line one instead of asserting a preference.",
        },
        { t: "h", text: "Architecture: draw ownership, not boxes" },
        {
          t: "list",
          items: [
            "**Component hierarchy** — three or four levels is enough. Shell, route/page, feature containers, presentational leaves. Name the containers after domain concepts.",
            "**Module boundaries** — which folders/packages exist and what may import what. A one-way dependency rule (`features` may import `shared`, never the reverse) is a cheap, credible answer.",
            "**Data flow** — draw arrows for reads and writes separately. Reads: server to cache to selector to component. Writes: component to mutation to cache invalidation or optimistic patch.",
            "**Where state lives** — server cache, global client store, URL, component local, form state. Five buckets; assign every piece of state to exactly one and defend it.",
            "**Client versus server responsibility** — filtering 8,000 rows client-side is fine; filtering 8,000,000 is not. Say where the line is and what moves it.",
          ],
        },
        {
          t: "code",
          lang: "text",
          caption: "The architecture sketch — boxes are cheap, ownership is the mark",
          code: `<AppShell>                 auth, theme, error boundary, one data client
  <Route>                  owns: NOTHING. reads filters from the URL
    <FilterBar>            URL <-> controls  (shareable, back-button-able)
    <SummaryStrip>         derived via memoised selectors, never stored
    <ItemList>             owns: scroll position, selection
      <ItemRow>            memoised, subscribes to ONE entity id
    <DetailPanel>          lazy chunk, loaded on first open

STATE BUCKETS
  server cache   items, categories        refetchable, shared, keyed
  URL            filters, sort, cursor    shareable, bookmarkable
  global store   session, theme, toasts   cross-route, small
  local          scroll, hover, open      per-view, ephemeral
  form           in-progress input        uncontrolled until submit

CLIENT / SERVER LINE
  server: authz, filtering at scale, aggregation, export jobs
  client: presentation, virtualisation, derived summaries, optimistic writes`,
        },
        {
          t: "note",
          tone: "interview",
          title: "The URL is a state container and almost nobody says so",
          text: "Filters, sort, pagination cursor, selected tab and open modal are shareable, bookmarkable, back-button-able state, and they belong in the query string, not in Redux. On the Jio Cluster portal that difference is operationally real: a store manager pastes a filtered low-stock view into a chat and the person receiving it sees the same rows. Mentioning the URL as your first state bucket is a small thing that consistently surprises interviewers, because it shows you think about the product and not just the code.",
        },
        { t: "h", text: "The two failure modes at each end of seniority" },
        {
          t: "table",
          head: ["Failure mode", "How it sounds", "The fix"],
          rows: [
            ["Backend cosplay", "\"I'd put Kafka between the API gateway and three sharded Postgres replicas...\"", "Mention the backend only where it constrains the client. Spend your minutes on the client."],
            ["Library catalogue", "\"I'd use React Query, Zustand, Tailwind, Radix, Framer Motion...\"", "Name the *mechanism* you need, then the library as an implementation detail. \"A normalised cache with stale-while-revalidate — React Query gives me that.\""],
            ["No numbers", "\"It would be fast because we'd optimise the rendering.\"", "Quote budgets: 8,000 rows times 12 cells, LCP under 2.5s, INP under 200ms, bundle under 200KB gzipped for the initial route."],
            ["No trade-off", "Every decision presented as obviously correct", "For each big call, name the alternative and the condition under which you would flip. That is the actual senior signal."],
            ["Silent scope creep", "Forty minutes on the feed component, nothing on caching or errors", "The budget. Announce it, and cut yourself off."],
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Announce RADIO plus the time budget in minute zero.",
            "Never design before asking. Write functional and non-functional lists and get the top two priorities ranked.",
            "Architecture means ownership: component hierarchy, module boundaries, data flow, state buckets, client/server line.",
            "Interface means both the network contract and the component prop API.",
            "Order optimisations by the requirements you agreed, and close by naming what you left out.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 18,
      title: "Rendering strategy: choosing and defending",
      summary:
        "CSR, SSR, SSG, ISR, streaming SSR and islands. Six options, three real inputs — SEO, time-to-first-byte and personalisation — and a decision rule you can state in one sentence.",
      blocks: [
        {
          t: "p",
          text: "Rendering strategy is the most common opening probe in this round because it separates people who have shipped from people who have read the Next.js docs. The trap is having a favourite. The correct posture is a decision rule driven by three product facts: does it need to be indexed, how personalised is it, and how fresh must it be.",
        },
        {
          t: "table",
          head: ["Strategy", "HTML produced", "Best for", "The honest downside"],
          rows: [
            ["**CSR**", "Empty shell, JS builds the DOM", "Authenticated apps, dashboards, internal tools", "Blank screen until JS parses; poor SEO; slow on weak devices"],
            ["**SSR**", "Per request, on the server", "Personalised content that must be indexed or must paint fast", "Server cost per request; TTFB tied to your slowest API; hydration cost still paid"],
            ["**SSG**", "At build time", "Docs, marketing, blogs, category pages", "Stale until the next build; a 50,000-page build takes forever"],
            ["**ISR**", "At build, then revalidated in the background", "Large catalogues that change occasionally — e-commerce PDPs", "First visitor after invalidation may see stale content; needs infra support"],
            ["**Streaming SSR**", "Flushed in chunks as data resolves", "Pages with one slow section and several fast ones", "Harder to reason about; error boundaries and suspense placement become design work"],
            ["**Islands / RSC**", "Mostly static HTML, JS only for interactive parts", "Content-heavy pages with isolated interactivity", "Newer ecosystem; the boundary between server and client components is a real learning cost"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The one-sentence decision rule",
          text: "Does it need SEO or a fast first paint on a cold cache? If no, CSR. If yes and the content is the same for everyone, SSG or ISR. If yes and it is personalised, SSR — and if one part of that page is slow, stream it. Islands when the page is mostly content with a few interactive pockets. Say it in that order and you have answered the question and shown the reasoning in the same breath.",
        },
        { t: "h", text: "Hydration, and why it is the real cost" },
        {
          t: "p",
          text: "Server rendering gets you pixels early, not interactivity early. The browser still has to download the JS bundle, re-run your component tree and attach event handlers before anything responds to a click. That gap — visible but dead — is the uncanny valley of SSR, and it is why a server-rendered page can score a great LCP and a terrible INP. Naming this distinction is the fastest way to show you have actually measured a real app rather than read about one.",
        },
        {
          t: "list",
          items: [
            "**Progressive hydration** — hydrate above-the-fold and interactive regions first, defer the rest. Cuts the long task that blocks first input.",
            "**Selective hydration** (React 18) — with `Suspense` boundaries, React can hydrate the boundary the user just interacted with before the others. The boundary placement is your design decision, not the framework's.",
            "**Islands** — do not hydrate what is not interactive at all. A product description does not need JS; the add-to-cart button does.",
            "**Server components** — the component never ships to the client, so its dependencies never enter the bundle. This is the strongest bundle-size argument in modern React and worth stating as such.",
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "Streaming SSR: the fast shell paints while the slow section resolves",
          code: `// The shell and the product details flush immediately.
// Recommendations hit a slow model service, so they stream in later
// behind their own Suspense boundary and never block first paint.
export default function ProductPage({ id }) {
  return (
    <Layout>
      <ProductDetails id={id} />              {/* fast: cached read */}

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews id={id} />                   {/* medium */}
      </Suspense>

      <Suspense fallback={<RecsSkeleton />}>
        <Recommendations id={id} />           {/* slow: 800ms p95 */}
      </Suspense>
    </Layout>
  );
}

// The design decision is WHERE the boundaries go. One boundary around
// everything gets you no streaming benefit at all; a boundary per row
// gets you layout shift and a hundred skeletons. Boundaries belong
// around independently-slow, independently-useful regions.`,
        },
        { t: "h", text: "The trade-off table you should be able to draw from memory" },
        {
          t: "table",
          head: ["Requirement", "Pick", "Because"],
          rows: [
            ["Internal dashboard behind auth", "CSR", "No SEO, warm cache after first load, server rendering per request buys nothing and costs money"],
            ["E-commerce category page", "SSG or ISR", "Same for everyone, must be indexed, changes a few times a day"],
            ["E-commerce PDP with live price and stock", "ISR shell + client fetch for the volatile bits", "Cache the 95% that is stable; fetch the 5% that must be correct"],
            ["Logged-in home feed", "SSR or CSR with a skeleton", "Personalised, so no shared cache; SSR if first paint matters, CSR if the app shell is already cached"],
            ["Marketing site", "SSG", "Cheapest, fastest, most cacheable; there is no excuse for anything else"],
            ["Docs with search", "SSG + client-side search index", "Static pages, interactive search island"],
            ["Real-time ops console", "CSR + push transport", "Every value is volatile within seconds, so pre-rendering is actively misleading"],
          ],
        },
        {
          t: "code",
          lang: "jsx",
          caption: "What you do instead of SSR when the app is authenticated: route-level splitting",
          code: `// Route-level code-splitting is the CSR answer to slow first load.
// The dashboard route ships; everything else arrives on demand.
const Dashboard = lazy(() => import("./routes/Dashboard"));   // ~90KB
const Analytics = lazy(() => import("./routes/Analytics"));   // ~140KB, charts
const AdminTools = lazy(() => import("./routes/AdminTools")); // ~60KB, rare

// Prefetch on intent, not on load: the chunk is warm by the time the
// click lands, so the split costs the user nothing perceptible.
<Link
  to="/analytics"
  onMouseEnter={() => import("./routes/Analytics")}
  onFocus={() => import("./routes/Analytics")}
>
  Analytics
</Link>

// Budget to quote: initial route JS under ~200KB gzipped. The charting
// library alone is often 140KB, which is exactly why it must not sit in
// the entry bundle just because one route uses it.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Defend CSR without apologising for it",
          text: "The Jio Store, Cluster and Self-Checkout portals are client-rendered, and that is the right call: authenticated, no indexing requirement, returning users on warm caches, and data so volatile that server-rendered HTML would be stale before it painted. What you did instead of SSR was route-level code-splitting so the initial route stays small, and the numbers back it — time-to-interactive 8s to 3s on the heaviest views. That is a much stronger answer than reflexively reaching for Next.js, and it directly rebuts the interviewer's likely follow-up of \"why not SSR?\"",
        },
        {
          t: "note",
          tone: "warn",
          title: "The metrics you will be asked to attach numbers to",
          text: "LCP under 2.5s, INP under 200ms, CLS under 0.1 — the Core Web Vitals thresholds. Then TTFB under about 800ms for a server-rendered page, and a first-load JS budget in the 150-200KB gzipped range for a route. Know that LCP is what SSR improves, INP is what hydration damages, and CLS is what skeletons and reserved image dimensions fix. Quoting the wrong metric for the wrong fix is a visible error.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Three inputs: SEO, personalisation, freshness. They determine the answer; your preference does not.",
            "SSR buys first paint, not interactivity. Hydration is where INP goes to die.",
            "Suspense boundary placement is a design decision — around independently slow, independently useful regions.",
            "CSR is a legitimate, defensible choice for authenticated apps. Have the code-splitting numbers ready when you say so.",
            "LCP 2.5s, INP 200ms, CLS 0.1, TTFB 800ms. Attach the right fix to the right metric.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 24,
      title: "The cross-cutting decisions that recur in every question",
      summary:
        "Pagination, client caching, real-time transport, component API design, micro-frontends, error and empty states, i18n and RTL, offline sync. Seven or eight decisions cover every design question in the bank.",
      blocks: [
        {
          t: "p",
          text: "The question changes; the decisions do not. Whether you are designing a feed, a gallery, a chat app or a spreadsheet, you will make roughly the same eight calls. Prepare them as reusable modules with the trade-off already worked out, and each design question becomes assembly plus the two or three details unique to that product.",
        },
        { t: "h", text: "Decision 1 — Pagination" },
        {
          t: "table",
          head: ["", "Offset (`?page=3&size=20`)", "Cursor (`?after=eyJpZCI6...`)"],
          rows: [
            ["Jump to page 47", "Yes", "No — sequential only"],
            ["Correct under inserts/deletes", "No — items shift, you get duplicates and skips", "Yes — the cursor anchors to a row"],
            ["Cost at deep pages", "`OFFSET 100000` scans and discards", "Constant — an index seek"],
            ["Total count available", "Usually", "Usually not, or expensive"],
            ["Right for", "Admin tables, search results, anything with page numbers", "Feeds, chat history, infinite scroll, real-time lists"],
          ],
        },
        {
          t: "p",
          text: "The follow-up is always infinite scroll versus numbered pages, and it is a product question, not a technical one. Infinite scroll suits exploratory browsing with no target — a photo gallery, a feed. Numbered pages suit finding a specific thing and returning to it, and they are more accessible, linkable and keyboard-friendly. \"Load more\" is the honest middle: user-triggered, so no scroll hijacking, no unreachable footer, and the URL can carry the cursor. Say the footer problem out loud — an infinite feed makes the footer permanently unreachable, which is a real bug teams ship constantly.",
        },
        { t: "h", text: "Decision 2 — Client caching" },
        {
          t: "code",
          lang: "javascript",
          caption: "Normalised cache plus stale-while-revalidate, described as a shape",
          code: `// NORMALISED: entities once, by id. Structure as id arrays.
cache = {
  entities: {
    sku:   { "SKU-1": { id: "SKU-1", name: "...", onHand: 42 } },
    store: { "S-119": { id: "S-119", name: "..." } },
  },
  queries: {
    // key -> { ids, meta, fetchedAt }
    "skus|store=S-119|low=true|cursor=null": {
      ids: ["SKU-1", "SKU-7"], nextCursor: "abc", fetchedAt: 1712345678000,
    },
  },
};

// WHY normalised: a single SSE event updating SKU-1's onHand patches
// ONE entity, and every list, chart and detail panel showing SKU-1
// updates consistently. In a nested cache the same SKU exists in four
// places and you get three of them wrong.

// STALE-WHILE-REVALIDATE: render cached data instantly, refetch in the
// background, swap on arrival. Two knobs, and they are different:
//   staleTime  - how long before a refetch is considered necessary
//   cacheTime  - how long unused data survives before eviction
// staleTime 0 with cacheTime 5min = instant navigation, always fresh.`,
        },
        {
          t: "list",
          items: [
            "**Cache key = every input that changes the response.** Endpoint, filters, sort, cursor, and the user or tenant id. Forgetting the tenant is how you leak one store's data into another store's view.",
            "**Optimistic updates** — write the expected result into the cache immediately, keep the previous value, roll back on failure and show a toast. Worth it for high-frequency, low-risk actions: like, acknowledge an alert, reorder a list. Not worth it for payments.",
            "**Invalidation** — after a mutation, either patch the affected entity from the server response (precise, cheap) or invalidate the query keys it touches (simple, one extra round trip). Say which you would pick and why; the naive answer is refetching everything.",
            "**Eviction** — an unbounded client cache is a memory leak on a long-lived dashboard. LRU with a size cap, plus time-based eviction of unused queries.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Optimistic updates need a rollback story or they are a bug",
          text: "The interesting half of the answer is failure. Keep a snapshot of the previous cache value, restore it if the mutation rejects, and surface a non-blocking error that says what was undone. The nastier case is two optimistic updates in flight on the same entity — the second rollback can restore a value that the first mutation already legitimately changed. Mention that you would serialise mutations per entity, or key rollbacks by mutation id rather than by entity.",
        },
        { t: "h", text: "Decision 3 — Real-time transport" },
        {
          t: "table",
          head: ["", "Polling", "SSE", "WebSocket"],
          rows: [
            ["Direction", "Client pull", "Server to client only", "Full duplex"],
            ["Protocol", "HTTP", "HTTP (`text/event-stream`)", "Upgrade from HTTP, then its own framing"],
            ["Reconnect", "Trivially, it is just requests", "**Built in**, with `Last-Event-ID` replay", "You implement it: backoff, heartbeat, resubscribe"],
            ["Proxies, corporate firewalls", "Always fine", "Fine — it is plain HTTP", "Frequently blocked or silently killed"],
            ["Server cost per client", "Repeated request overhead", "One held connection, cheap", "One held connection plus your own state"],
            ["Compression, HTTP/2 multiplexing, auth headers", "Yes", "Yes", "No, or awkward"],
            ["Right for", "Freshness measured in minutes; dashboards nobody watches", "Feeds, notifications, live metrics, progress, alerts", "Chat, collaborative editing, multiplayer, anything with a client to server channel"],
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "This is your single strongest differentiator — rehearse it",
          text: "You built the Jio real-time layer consuming Kafka-published stock-on-hand events over SSE, delivering under five seconds and replacing a fifteen-minute batch refresh. The defence, in order: the data flow is unidirectional so full duplex is capability you would pay for and not use; `EventSource` reconnects natively with `Last-Event-ID` so you get replay-after-drop for free instead of hand-rolling backoff and resubscription; it is plain HTTP, which matters because corporate store networks sit behind proxies that mangle WebSocket upgrades; and it inherits normal auth headers, gzip and HTTP/2 multiplexing. Then close it honestly: \"if we had needed client-to-server messaging — the RFID write path, or collaborative ROI editing on the video-analytics canvas — I would have gone WebSocket.\" A decision plus the condition that would reverse it is the shape of a senior answer.",
        },
        {
          t: "list",
          items: [
            "**The six-connection trap** — SSE over HTTP/1.1 is limited to six concurrent connections per origin, and a multi-tab operator will exhaust that. Over HTTP/2 it multiplexes and the limit effectively disappears. Knowing this is a strong sign of production experience.",
            "**Backpressure** — a thousand events per second will melt React if you `setState` per event. Buffer into an array and flush on a `requestAnimationFrame` or a 100ms interval; coalesce multiple events for the same entity into the latest value. This is the follow-up question to every real-time design.",
            "**Reconnect gaps** — even with native reconnect, you missed events while disconnected. Either replay from `Last-Event-ID` server-side, or refetch a snapshot on reconnect and resume the stream. Say which; \"the stream reconnects\" alone is incomplete.",
            "**Tab visibility** — pause or downgrade the stream when `document.hidden`, resume with a snapshot refetch on focus. Free battery, free server capacity, and nobody else mentions it.",
          ],
        },
        { t: "h", text: "Decision 4 — Component API design" },
        {
          t: "code",
          lang: "jsx",
          caption: "Configuration versus composition — the design system question",
          code: `// CONFIGURATION: every new requirement adds a prop. This is how a
// component library dies. By month six there are 40 props and four
// of them are mutually exclusive.
<Modal
  title="Confirm" showCloseButton hideFooter
  footerAlign="right" primaryLabel="Yes" secondaryLabel="No"
  onPrimary={ok} onSecondary={cancel} size="md" scrollBody
/>

// COMPOSITION: the component owns behaviour (focus trap, portal,
// dismissal, aria wiring). The consumer owns layout and content.
<Modal open={open} onClose={close}>
  <Modal.Header>Confirm</Modal.Header>
  <Modal.Body>This cannot be undone.</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={close}>No</Button>
    <Button onClick={ok}>Yes</Button>
  </Modal.Footer>
</Modal>

// ESCAPE HATCHES, so nobody has to fork your component:
//   className / style pass-through on the outer node
//   ...rest spread onto the underlying DOM element
//   ref forwarding
//   asChild / render-prop for the trigger element
// A design system without escape hatches gets copy-pasted. Say that.`,
        },
        {
          t: "list",
          items: [
            "**Controlled and uncontrolled both** — accept `value`/`onChange`, fall back to internal state, expose `defaultValue`. Every good primitive does this and interviewers recognise it instantly.",
            "**Tokens, not hardcoded values** — colours, spacing and typography as CSS custom properties so theming and dark mode are a token swap rather than a component rewrite.",
            "**Versioning and adoption** — semver, a changelog, codemods for breaking changes, and a deprecation window. \"How do you roll out a breaking change to nine consuming teams?\" is the real design-system interview question, and the answer is codemods plus a parallel-support period, not a migration doc.",
            "**Documentation is part of the API** — Storybook with interaction and a11y addons, plus visual regression snapshots in CI. A component nobody can discover gets rebuilt.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Your 50-component library is the whole answer to this question",
          text: "Fifty-plus components on a standardised Redux data layer, roughly 30% less duplicated UI code, consumed by three portals across six retail brands. Lead with the *problem*: before it, every screen re-implemented fetch-plus-loading-plus-error-plus-empty, and six brands meant six divergent tables. Then the mechanism: composition-based primitives, tokenised theming per brand, and a standard data layer so a screen declares what it needs instead of orchestrating it. Then the honest cost: you need a review process and a deprecation policy, or the library becomes a bottleneck that teams route around. Naming the cost is what makes the story credible.",
        },
        { t: "h", text: "Decision 5 — Micro-frontends, and when they are wrong" },
        {
          t: "p",
          text: "Module federation lets independently-deployed bundles share dependencies at runtime, so separate teams can ship separate parts of one page on their own cadence. It is a solution to an *organisational* problem — many teams contending on one release train — and it is almost always the wrong answer to a technical one.",
        },
        {
          t: "list",
          items: [
            "**The real costs**: duplicated framework code unless shared deps are configured perfectly and versions stay aligned; cross-app state and routing become a protocol you must design; a consistent design system now has to be versioned across independently-deployed hosts; debugging spans multiple sourcemaps; and integration bugs surface only in production because nobody composes the whole page locally.",
            "**When it genuinely fits**: five-plus teams, separate release cadences, a page that is legitimately a composition of independent products (a retail admin shell hosting inventory, pricing and logistics modules owned by different orgs), or an incremental migration off a legacy framework where a strangler pattern beats a rewrite.",
            "**When it does not**: one team, one product, or performance as the motivation. It makes performance worse, not better.",
            "**The senior answer**: \"I would start with a monorepo, clear module boundaries and route-level code-splitting, which gets you most of the independence at a fraction of the cost, and only reach for federation when *deployment* coupling — not code coupling — becomes the actual bottleneck.\"",
          ],
        },
        { t: "h", text: "Decisions 6-8 — the ones candidates forget" },
        {
          t: "list",
          items: [
            "**Error and empty states** — four distinct states per data view, not two: loading (first load versus background refetch), empty (no data at all versus no data matching this filter — completely different copy and different call to action), error (retryable versus fatal versus partial), and success. Add error boundaries per feature region so one broken widget does not blank the dashboard, and say where you would place them.",
            "**i18n and RTL** — never concatenate translated strings; use ICU message format for plurals and interpolation. Assume text expands 30-40% in German and design layouts that survive it. RTL is `dir=\"rtl\"` plus CSS logical properties (`margin-inline-start`, not `margin-left`) and mirrored icons. Load locale bundles on demand, not all upfront. For a six-brand retail platform this is a real requirement, not a hypothetical.",
            "**Offline and sync** — a service worker for the app shell, IndexedDB for data, and an outbox queue of pending mutations replayed on reconnect. The hard part is conflict resolution: last-write-wins is simplest and loses data; per-field merge is better; CRDTs are correct for collaborative text and overkill for a form. Always ask whether offline is actually required before designing for it.",
            "**Observability** — a design is not finished without a plan for knowing it is broken. Real-user monitoring for Web Vitals, error tracking with sourcemaps and release tags, and a small set of product events. Say what you would alert on: p75 INP regression, error rate per release, and for a streaming feed, reconnect rate and event lag.",
            "**Security, briefly** — XSS via `dangerouslySetInnerHTML` or unsanitised markdown, tokens in `localStorage` versus httpOnly cookies, CSP headers, and never trusting client-side authorisation. One or two sentences is enough, but zero sentences is noticed.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Cursor for feeds, offset for tables. Infinite scroll is a product decision with an unreachable-footer cost.",
            "Normalised cache plus stale-while-revalidate; cache key includes tenant; optimistic updates need rollback.",
            "SSE when the flow is one-way, WebSocket when you need a client channel, polling when freshness is measured in minutes.",
            "Composition over configuration, controlled and uncontrolled both, escape hatches always.",
            "Micro-frontends solve an org problem. Start with a monorepo and code-splitting.",
            "Four data states, i18n from day one, observability as part of the design.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 24,
      title: "Worked designs: a real-time operations dashboard, then a news feed",
      summary:
        "The full forty minutes on the design closest to your day job — this should become your showcase answer — followed by a compressed run at a news feed to prove the framework transfers.",
      blocks: [
        {
          t: "p",
          text: "Make the real-time dashboard your rehearsed answer. Not because interviewers always ask for it, but because it is where your production experience is deepest, and a well-rehearsed adjacent design can be steered toward from almost any prompt: \"design a live metrics view\", \"design an admin console\", \"design a monitoring UI\", even \"design a stock ticker\". Practise it until you can run all five RADIO sections without notes.",
        },
        { t: "h", text: "R — Requirements, 5 minutes" },
        {
          t: "list",
          items: [
            "**Functional**: an operator watches live stock-on-hand for one store (~8,000 SKUs); filters by category and low-stock; sorts any column; drills into a SKU for movement history; acknowledges alerts; exports the current view to CSV.",
            "**Non-functional**: freshness under five seconds from the source event; ~400 concurrent operators at peak out of 12,000 daily users; 8,000 rows in one view; desktop and in-store tablet; no SEO; fully keyboard-operable; sessions lasting a whole shift, so memory stability matters as much as start-up speed; corporate proxies between client and datacentre.",
            "**Ranked priorities** (ask for this): freshness first, then interaction responsiveness under continuous updates. Everything downstream is justified against those two.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The requirement nobody else surfaces",
          text: "\"Sessions last an entire eight-hour shift.\" That one line changes the design more than the row count does. It means memory growth, cache eviction, reconnect behaviour and event-buffer bounds are first-class concerns rather than polish — a leak that is invisible in a five-minute demo will kill a tab by hour three. Surfacing a requirement the interviewer had not thought of is the highest-value thing you can do in the R section.",
        },
        { t: "h", text: "A — Architecture, 10 minutes" },
        {
          t: "code",
          lang: "text",
          caption: "Component hierarchy with state ownership marked",
          code: `<AppShell>                       auth, theme, brand tokens, error boundary
  <RealtimeProvider>             ONE EventSource for the whole app
    |                            owns: connection status, event buffer,
    |                                  flush scheduler, resubscribe logic
    <DashboardRoute>             owns: nothing. reads filters from the URL
      <FilterBar>                URL <-> controls (category, lowStock, q, sort)
      <KpiStrip>                 derived from the store via memoised selectors
      <AlertPanel>               server state + optimistic acknowledge
      <StockGrid>                owns: scrollTop, columnWidths, selectedId
        <VirtualRows>            renders ~30 of 8,000 rows
          <StockRow>             memoised; subscribes to ONE sku id
      <SkuDrawer>                lazy route chunk; movement history

DATA FLOW
  reads   Kafka -> SSE endpoint -> RealtimeProvider -> normalised store
                                                    -> selector -> row
  writes  ack click -> optimistic patch -> POST -> confirm | rollback
  initial GET /stores/S-119/stock?filters -> snapshot -> store
          then stream deltas from the snapshot's event id

CLIENT / SERVER LINE
  server: authorisation, filtering, sorting, aggregation, CSV export
  client: virtualisation, delta application, derived KPIs, presentation
  8,000 rows can be filtered client-side; 8,000,000 cannot. The line moves
  to the server the moment one store's SKU count stops fitting in memory.`,
        },
        {
          t: "p",
          text: "Two decisions in that diagram are worth defending out loud. First, exactly one `EventSource` for the whole application, held in a provider above the router — one connection per widget would exhaust the HTTP/1.1 six-connection limit and multiply server cost by the number of mounted panels. Second, the snapshot-then-stream sequence: you cannot start from an empty store and accumulate deltas, because you would only know about SKUs that happened to change. Fetch a snapshot, note its event id, then apply the stream from that point.",
        },
        { t: "h", text: "D — Data model, 5 minutes" },
        {
          t: "code",
          lang: "javascript",
          caption: "Normalised store, with the reason for every choice",
          code: `store = {
  // ENTITIES: one copy of each SKU, keyed by id.
  skus: {
    "SKU-1": { id: "SKU-1", name: "...", categoryId: "c3",
               onHand: 42, reserved: 3, updatedAt: 1712345678000, v: 91 },
  },
  categories: { c3: { id: "c3", name: "Beverages" } },

  // STRUCTURE: the current query's result as an ordered id array.
  view: {
    key: "store=S-119|cat=c3|low=true|sort=onHand:asc",
    ids: ["SKU-1", "SKU-7"],
    nextCursor: "eyJ...",
    lastEventId: "9f31c2",       // resume point for the stream
    status: "success",
  },

  // UI STATE: never persisted, never sent anywhere.
  ui: { selectedId: null, columnWidths: {}, drawerOpen: false },
  conn: { status: "open", lastEventAt: 1712345678000, missedEvents: 0 },
};

// SERVER STATE  vs  CLIENT STATE
//   skus, categories, view      server: cacheable, refetchable, shared
//   filters, sort, cursor       URL:    shareable, bookmarkable, back-able
//   selectedId, columnWidths    local:  ephemeral, per-tab
//   connection status           app:    global, but derived from transport
//
// DERIVED, never stored: lowStockCount, totalValue, visibleRows,
// sortedIds. Memoised selectors over entities. Storing these is how a
// KPI strip and a grid end up disagreeing on screen.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Why normalisation is load-bearing here, not academic",
          text: "A stock-on-hand event arrives for SKU-1. Because entities live once, you patch one object and the grid row, the KPI strip and the open drawer all re-render consistently from the same value. In a nested cache the same SKU exists in the view array, the KPI aggregate and the drawer payload, and you will update two of the three — which is precisely the class of bug that made the old batch-refresh system trusted more than the live one. Include the version field `v` and drop any event whose version is not greater than what you hold; out-of-order delivery is normal on a partitioned topic.",
        },
        { t: "h", text: "I — Interface, 8 minutes" },
        {
          t: "table",
          head: ["Endpoint", "Shape", "Notes to say out loud"],
          rows: [
            ["`GET /stores/:id/stock`", "`{ items, nextCursor, lastEventId, totals }`", "Cursor pagination; returns the resume point so the stream can be attached without a gap"],
            ["`GET /stores/:id/stream`", "`text/event-stream`, named events `stock.updated`, `alert.raised`, `heartbeat`", "Named event types so the client dispatches without sniffing payloads; heartbeat every 15s so a dead connection is detectable"],
            ["`POST /alerts/:id/ack`", "`{ ackedBy, at }` -> updated alert", "Idempotent, with a client-generated request id so a double click cannot double-acknowledge"],
            ["`GET /skus/:id/movements`", "`{ items, nextCursor }`", "Lazy, only on drawer open; its own route chunk"],
            ["`POST /stores/:id/export`", "`202` + job id, then poll or receive an SSE completion event", "Never block a request on generating a CSV of 8,000 rows; this is the async-job pattern"],
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The transport layer: one connection, buffered flush, snapshot on reconnect",
          code: `function createRealtime({ url, onPatch, onResync }) {
  let es = null;
  let buffer = new Map();          // entityId -> latest event (coalesced)
  let raf = null;
  let lastEventId = null;

  function flush() {
    raf = null;
    if (buffer.size === 0) return;
    const batch = [...buffer.values()];
    buffer = new Map();
    onPatch(batch);                // ONE state update for N events
  }

  function schedule() {
    if (raf === null) raf = requestAnimationFrame(flush);
  }

  function connect(resumeFrom) {
    lastEventId = resumeFrom ?? lastEventId;
    const qs = lastEventId ? "?lastEventId=" + lastEventId : "";
    es = new EventSource(url + qs, { withCredentials: true });

    es.addEventListener("stock.updated", (e) => {
      const evt = JSON.parse(e.data);
      lastEventId = e.lastEventId || lastEventId;
      const held = buffer.get(evt.id);
      // coalesce: within one frame only the newest version matters
      if (!held || evt.v > held.v) buffer.set(evt.id, evt);
      schedule();
    });

    // EventSource reconnects natively, but we may have missed events
    // that the server can no longer replay. On reopen, resync a snapshot.
    es.addEventListener("open", () => onResync(lastEventId));
    es.addEventListener("error", () => {
      // browser is already backing off and retrying; just surface state
      onPatch([]);
    });
  }

  function pause() { es?.close(); es = null; }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else connect();                // resync happens in the open handler
  });

  return { connect, close: () => { es?.close(); cancelAnimationFrame(raf); } };
}`,
        },
        {
          t: "p",
          text: "Three things in that file are the answer to the follow-up questions you will get. The `Map` coalescing means a thousand events per second for the same SKU produce one render per frame, not a thousand. The single `requestAnimationFrame` flush means React batches once per paint instead of once per event. And the visibility handling means an operator with six tabs open is not holding six live streams while looking at one of them.",
        },
        { t: "h", text: "O — Optimisations, 10 minutes, ordered by the ranked requirements" },
        {
          t: "table",
          head: ["Concern", "Move", "Why it is justified here"],
          rows: [
            ["Render cost of 8,000 rows", "Virtualise: render ~30 rows plus overscan", "The DOM, not React, is the bottleneck. This is the 8s to 3s change."],
            ["Re-render storm from the stream", "Memoised rows subscribed to a single entity id + coalesced rAF flush", "A change to SKU-1 must re-render one row, not the grid"],
            ["Derived KPI recomputation", "Memoised selectors keyed on entity references", "Recomputing totals over 8,000 rows on every event is the hidden long task"],
            ["Start-up time", "Route-level code-splitting; the SKU drawer and export are separate chunks", "The dashboard route stays small; rarely-used views cost nothing upfront"],
            ["Memory over an 8-hour shift", "Cache eviction (LRU), bounded event buffer, `es.close()` on unmount", "The requirement nobody else surfaced. A leak here kills the tab by hour three."],
            ["Interaction responsiveness", "Transitions for filter changes; keep showing stale rows while refetching", "Never replace visible data with a spinner on a monitored view"],
            ["Perceived correctness", "Per-cell change flash + a visible \"last updated\" and connection indicator", "Operators trusted the 15-min batch because it was legible. Live data must show that it is live."],
            ["Accessibility", "`aria-rowcount`/`aria-rowindex` on the virtual grid; `aria-live=\"polite\"` for alerts, not for stock deltas", "A live region firing per stock change would make a screen reader unusable"],
            ["Failure states", "Error boundary per panel; degraded banner on stream loss with a manual refresh", "One broken widget must not blank the console an operator depends on"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The trap in an aria-live region on a real-time feed",
          text: "The instinctive accessibility answer — put the updating region in `aria-live` — is actively harmful here. A screen reader would announce every stock delta continuously and drown out everything else. The correct design is `aria-live=\"polite\"` scoped narrowly to alerts and acknowledgement confirmations, an off-screen periodic summary (\"14 SKUs updated in the last minute\"), and no live region on the grid itself. Getting this right is a rare, specific, memorable answer.",
        },
        { t: "hr" },
        { t: "h", text: "Second worked example — a news feed, compressed" },
        {
          t: "list",
          ordered: true,
          items: [
            "**R** — post, like, comment, follow; infinite feed; images and video; personalised so no shared CDN cache; mobile-first on poor networks; SEO not required behind login but the public profile pages need it.",
            "**A** — `<FeedRoute>` owning the query key only; `useFeed` (cursor paginated, stale-while-revalidate); `<PostCard>` memoised with an `IntersectionObserver` sentinel below the last item; media as its own component with lazy loading and intrinsic dimensions to stop layout shift; a virtualised window for the feed with *known heights only after measurement*, which is why feeds usually use a windowed list with measured heights rather than fixed ones.",
            "**D** — normalised `posts`, `users`, `comments` by id; the feed is `{ pages: [{ ids, cursor }] }`; `likedByMe` and `likeCount` live on the post entity so an optimistic like patches one object; drafts and scroll position are client state.",
            "**I** — `GET /feed?after=cursor&limit=20` returning posts plus embedded author ids and a `nextCursor`; `POST /posts/:id/like` idempotent with a client request id; new-post notifications over SSE as a count badge rather than injecting items and shifting the reader's scroll position.",
            "**O** — cursor pagination so inserts do not duplicate rows; prefetch the next page when the sentinel is 500px away using `rootMargin`; responsive images with `srcset` and modern formats; `content-visibility: auto` on off-screen cards as a cheap win before full virtualisation; optimistic likes with rollback; a skeleton on first load and stale content plus a subtle indicator on refetch; scroll restoration on back navigation, which is the single most-forgotten feed requirement.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Two feed details that separate strong answers",
          text: "First, never inject new items into a feed the user is reading — it shifts their scroll position mid-sentence. Show a \"12 new posts\" pill at the top and let them opt in; that is what every real product does and almost no candidate mentions. Second, scroll restoration on back: users tap a post, come back, and expect their place. That means caching the feed pages *and* the scroll offset keyed by route entry. Both are product-sense signals dressed as technical details.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Rehearse the real-time dashboard until all five RADIO sections run without notes. Most live-data prompts can be steered onto it.",
            "One connection per app; snapshot then stream; coalesce and flush per frame; resync on reconnect; pause on hidden.",
            "Normalise entities so one event patches one object and every view agrees.",
            "Order optimisations by the requirements you agreed, and say which requirement each one serves.",
            "Surface a requirement they had not considered — session length, footer reachability, scroll restoration. That is the moment the round turns.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain how a frontend system design round differs from backend HLD, and name the three bottlenecks you actually reason about.",
    "Run the RADIO framework out loud with its time budget, as if opening a forty-minute round.",
    "Distinguish functional from non-functional requirements for a live dashboard and show how each non-functional line points at a specific design decision.",
    "Assign every piece of state in a filterable table to one of five buckets — server cache, global store, URL, component local, form state — defend each placement, and argue for the URL bucket using a product consequence rather than a technical one.",
    "Pick a rendering strategy for six different products (internal dashboard, PDP, category page, logged-in feed, docs site, marketing page) and justify each in one sentence.",
    "Explain what hydration costs, why a server-rendered page can have a great LCP and a terrible INP, what progressive and selective hydration each fix, and where Suspense boundaries belong in a streaming page.",
    "Defend client-side rendering for an authenticated internal platform against an interviewer pushing for SSR.",
    "Compare offset and cursor pagination on correctness under concurrent inserts, deep-page cost and total counts, then argue both sides of infinite scroll versus numbered pages including the unreachable-footer cost.",
    "Explain why a client cache should be normalised using a single entity update that must appear consistently in three places, then define stale-while-revalidate and the difference between staleTime and cacheTime.",
    "Describe an optimistic update including the rollback path, and the failure mode when two mutations on the same entity are in flight.",
    "Choose between WebSocket, SSE and polling for four scenarios, state the condition that would reverse each choice, and explain the HTTP/1.1 six-connection limit and what HTTP/2 changes about it.",
    "Explain how you would absorb a thousand events per second into a React table without destroying frame rate, and why the client needs a snapshot-then-stream sequence rather than accumulating deltas from empty.",
    "Contrast configuration and composition in component API design, and list the escape hatches a design system needs to avoid being forked.",
    "Explain how you would ship a breaking change in a shared component library to nine consuming teams.",
    "Make the honest case against micro-frontends, then name the specific organisational condition that would change your mind.",
    "Enumerate the four data states every view needs, and the difference between empty-because-no-data and empty-because-of-this-filter.",
    "Explain why aria-live is the wrong tool for a high-frequency real-time feed, and what you would do instead.",
    "Describe an offline sync design with an outbox queue, and compare last-write-wins, per-field merge and CRDTs for conflict resolution.",
  ],

  math: [
    {
      title: "RADIO time budget (40-45 min round)",
      formula: "R 5 min · A 10 min · D 5 min · I 8 min · O 10 min · buffer 2-7 min",
      note: "Announce it in minute zero. It proves method, invites the interviewer to steer, and gives you a legitimate way to cut a tangent: 'let me park that for the optimisations section'.",
    },
    {
      title: "Requirements checklist",
      formula: "users · scale · freshness · devices/network · SEO · auth/personalisation · write path · offline · a11y · i18n · constraints",
      note: "Eleven prompts, run in order, takes ninety seconds. Close by asking which two matter most — that ranking is what you will justify every later decision against.",
    },
    {
      title: "State bucket rule",
      formula: "server data -> cache · shareable UI -> URL · cross-route UI -> store · single-view UI -> local · in-progress input -> form state",
      note: "Five buckets, every piece of state in exactly one. The URL bucket is the one candidates forget and the one interviewers notice. Derived data belongs in none of them — memoise a selector.",
    },
    {
      title: "Rendering strategy decision rule",
      formula: "SEO or cold first paint? no -> CSR · yes + same for all -> SSG/ISR · yes + personalised -> SSR (+stream slow regions) · mostly content -> islands",
      note: "Three inputs only: indexability, personalisation, freshness. State the rule, then apply it. Having a favourite framework instead of a rule is the failure mode.",
    },
    {
      title: "Core Web Vitals budgets",
      formula: "LCP < 2.5s · INP < 200ms · CLS < 0.1 · TTFB < 800ms · initial route JS < ~200KB gzipped",
      note: "SSR improves LCP; hydration damages INP; reserved dimensions and skeletons fix CLS. Attaching the right fix to the right metric is what makes the numbers count for you rather than against you.",
    },
    {
      title: "Pagination choice",
      formula: "page numbers / jump-to-page -> offset · feed, chat, live list, deep pages -> cursor",
      note: "Offset duplicates and skips rows under concurrent inserts, and OFFSET 100000 scans and discards. Cursor is constant cost but sequential-only and usually gives no total count.",
    },
    {
      title: "Normalised cache shape",
      formula: "entities: { type: { id: entity } } · queries: { key: { ids, meta, fetchedAt } } · key = endpoint + filters + sort + cursor + tenant",
      note: "One event patches one entity and every view agrees. Omitting the tenant or user from the cache key is how one store's data appears in another store's view.",
    },
    {
      title: "Stale-while-revalidate",
      formula: "render cache immediately -> refetch if now - fetchedAt > staleTime -> swap · evict if unused for cacheTime",
      note: "staleTime controls freshness, cacheTime controls memory. staleTime 0 plus cacheTime 5min gives instant navigation with always-fresh data — the right default for a dashboard.",
    },
    {
      title: "Optimistic update with rollback",
      formula: "snapshot = cache.get(key) -> patch -> mutate -> on error: cache.set(key, snapshot) + non-blocking toast",
      note: "Worth it for likes, acknowledgements and reordering; never for payments. Key rollbacks by mutation id, not by entity, or two in-flight mutations will restore each other's stale values.",
    },
    {
      title: "Transport choice",
      formula: "one-way + needs reconnect + behind proxies -> SSE · needs client->server channel -> WebSocket · freshness in minutes -> polling",
      note: "SSE gives native reconnect with Last-Event-ID replay, plain HTTP through proxies, normal auth and gzip. This is your production decision — rehearse the defence and the reversing condition together.",
    },
    {
      title: "Real-time backpressure",
      formula: "buffer: Map<entityId, latestEvent> -> flush once per requestAnimationFrame -> one setState per frame",
      note: "Coalescing by entity id collapses N events for one row into the newest; a single rAF flush turns a thousand renders per second into sixty. Drop any event whose version is not greater than what you hold.",
    },
    {
      title: "Component API skeleton",
      formula: "<X open onOpenChange value onChange defaultValue className {...rest} ref asChild> with <X.Part> children",
      note: "Controlled and uncontrolled both; composition for layout; className, rest-spread, ref forwarding and asChild as escape hatches. Without escape hatches a design-system component gets copy-pasted instead of used.",
    },
  ],

  practice: [
    { type: "math", q: "Design a real-time operations dashboard: 8,000 SKUs per store, sub-5-second freshness from a Kafka-backed event source, filter/sort/drill-down, alert acknowledgement, eight-hour sessions. Full RADIO in 40 minutes, out loud, timed. This is your showcase answer — run it until it needs no notes." },
    { type: "math", q: "Design an autocomplete/typeahead as a system, not a component: debounce policy, cache layer, prefetch of popular queries, whether ranking happens client or server side, a trie or inverted index if it must work offline, and analytics on abandoned queries." },
    { type: "math", q: "Design a news feed: cursor pagination, media strategy, optimistic likes, new-post notification without scroll displacement, scroll restoration on back navigation, and windowing with measured heights." },
    { type: "math", q: "Design a design system and component library for six retail brands and three portals: theming tokens, composition-based APIs, versioning and codemods, Storybook and visual regression, a11y guarantees, and the adoption strategy across nine teams." },
    { type: "math", q: "Design an infinite photo gallery: masonry layout without layout shift, responsive srcset and modern formats, IntersectionObserver lazy loading with rootMargin prefetch, a blur-up placeholder strategy, and a lightbox with keyboard navigation and focus management." },
    { type: "math", q: "Design an e-commerce product detail page plus cart: ISR shell with client-fetched price and stock, variant selection in the URL, cart as server state versus local state for guests, cart merge on login, and the checkout funnel's error states." },
    { type: "math", q: "Design Google Docs: real-time collaborative text editing. Compare operational transforms and CRDTs honestly, cover presence and cursors, offline editing with a replay queue, undo semantics under concurrent edits, and why the transport must be WebSocket rather than SSE." },
    { type: "math", q: "Design a chat application: message list virtualisation with reverse infinite scroll, optimistic send with pending/sent/failed/read states, typing indicators, unread counts across tabs, media upload, and message ordering when the client clock is wrong." },
    { type: "math", q: "Design a video streaming UI: adaptive bitrate via HLS/DASH, buffer health and quality-switch indicators, custom controls with full keyboard and screen-reader support, captions, thumbnail seek previews, and resume-where-you-left-off across devices." },
    { type: "math", q: "Design an analytics SDK to embed on third-party sites: a tiny bundle, event batching with a flush interval, sendBeacon on pagehide, retry and dedupe, sampling, no interference with the host page's performance, and a consent and privacy story." },
    { type: "math", q: "Design file upload with resume: chunking, parallel chunk uploads with a concurrency limit, per-chunk retry with backoff, resumable sessions across a page reload via IndexedDB, checksum verification, and accurate aggregate progress." },
    { type: "math", q: "Design a spreadsheet grid: virtualised two-dimensional windowing with frozen rows and columns, a formula dependency graph with cycle detection, incremental recalculation, cell editing and selection ranges, copy/paste, and undo across dependent cells." },
    { type: "math", q: "Design a Kanban board used by 200 concurrent people on the same board: real-time card movement, conflict resolution when two users drop the same card in different places, presence, and optimistic drag with rollback." },
    { type: "math", q: "Design an internationalised, RTL-capable admin console for six brands: locale bundle loading, ICU messages, 40% text expansion, logical CSS properties, mirrored icons and directional charts, and per-brand theming without forking components." },
    { type: "theory", q: "You chose SSE over WebSocket in production. An interviewer says \"WebSocket is more flexible, why not just use that?\" Give the full defence in ninety seconds, then name the condition under which you would have chosen WebSocket." },
    { type: "theory", q: "An interviewer asks why you did not use SSR for the Jio portals. Defend CSR on requirements, and support it with the code-splitting and time-to-interactive numbers." },
    { type: "theory", q: "An interviewer suggests micro-frontends for a three-team platform. Argue against it without dismissing it, and state exactly what would change your answer." },
    { type: "theory", q: "Explain to a staff engineer why your client cache is normalised, using one stock-update event that must appear correctly in a grid row, a KPI aggregate and an open detail drawer." },
    { type: "theory", q: "You have ten minutes left and the interviewer asks how you would make the dashboard responsive under a thousand events per second. Answer with the buffer, the flush cadence, the coalescing rule and the version check, in that order." },
    { type: "theory", q: "Take three design questions from this bank and write only the requirements section for each — functional, non-functional, out of scope, and the two ranked priorities. Then check that every non-functional line points at a decision you would actually make." },
  ],

  resources: [
    { label: "GreatFrontEnd — the System Design section. This is where RADIO comes from, and the worked answers (news feed, autocomplete, image carousel, e-commerce) are written to the standard an interviewer expects. Start here and do not skip the case studies.", url: "https://www.greatfrontend.com/system-design", kind: "course" },
    { label: "Frontend System Design Guide (devbeautifully/greatfrontend community compilation) — a free structured checklist covering the same ground; useful as a revision sheet the night before.", url: "https://github.com/greatfrontend/awesome-front-end-system-design", kind: "repo" },
    { label: "Patterns.dev — rendering patterns chapter. The clearest side-by-side treatment of CSR, SSR, SSG, ISR, streaming and islands, with the trade-off framed as a product decision rather than a framework preference.", url: "https://www.patterns.dev/", kind: "book" },
    { label: "web.dev — Core Web Vitals. Read it for the exact thresholds and, more importantly, for which optimisation moves which metric. You will be asked to attach numbers to your design.", url: "https://web.dev/articles/vitals", kind: "docs" },
    { label: "MDN — Server-sent events and EventSource. Read the reconnection and Last-Event-ID sections carefully; they are the technical core of your strongest interview story.", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events", kind: "docs" },
    { label: "TanStack Query docs — the best written explanation anywhere of normalised caching, staleTime versus cacheTime, and optimistic updates with rollback. Read it as a specification for what a client cache must do, not as a library tutorial.", url: "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults", kind: "docs" },
    { label: "Relay's normalised store documentation — the most rigorous public description of client-side normalisation and cache consistency. Heavier than you need, but it is where the vocabulary comes from.", url: "https://relay.dev/docs/guided-tour/reusing-cached-data/", kind: "docs" },
    { label: "React docs — Suspense and streaming with prerenderToNodeStream. Read it for where boundaries belong, which is the actual design decision in streaming SSR.", url: "https://react.dev/reference/react/Suspense", kind: "docs" },
    { label: "Martin Kleppmann — 'CRDTs: The Hard Parts'. Watch before any collaborative-editing question so you can compare OT and CRDTs honestly instead of name-dropping them.", url: "https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html", kind: "paper" },
    { label: "Micro Frontends in Action / micro-frontends.org — Michael Geers' free reference. Read it specifically for the failure modes section; the honest case against is more useful in an interview than the case for.", url: "https://micro-frontends.org/", kind: "book" },
    { label: "WAI-ARIA Authoring Practices — the grid and live-region pages. Needed for the accessibility answer on any virtualised table or real-time feed, which is where most candidates have nothing to say.", url: "https://www.w3.org/WAI/ARIA/apg/patterns/", kind: "docs" },
    { label: "Building Micro-Frontends and Designing Data-Intensive Applications, chapter 5 — read DDIA's replication and ordering chapter only for the vocabulary of eventual consistency and out-of-order delivery, which is what your Kafka-to-SSE story is actually about.", url: "https://dataintensive.net/", kind: "book" },
  ],
};

export default p09;
