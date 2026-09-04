const p04 = {
  id: "p04",
  week: 4,
  hours: 9,
  title: "Frontend Performance Engineering",
  tag: "Performance",
  why: "Performance is the one area where your resume already has numbers in it, which makes this the highest-leverage module in the track. But \"time-to-interactive 8s to 3s on 50,000 rows\" is only worth a senior offer if you can decompose it into named levers, state how you measured it, and volunteer the attempt that failed. Interviewers do not doubt the number; they doubt that you know why it moved.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "Core Web Vitals and the levers that actually move them",
      summary:
        "Current thresholds for LCP, INP and CLS, the sub-parts each metric decomposes into, and the specific intervention for each sub-part — because \"I optimised images\" is not an answer.",
      blocks: [
        {
          t: "p",
          text: "Core Web Vitals are three numbers Google will quote at you, and most candidates can recite the thresholds without knowing what a metric is *made of*. That is the difference between a mid-level and a senior answer. A senior engineer hears \"LCP is 4.2s\" and immediately asks which of the four LCP sub-parts is large, because each one has a different fix. Learn the decompositions and you can diagnose a page you have never seen.",
        },
        { t: "h", text: "The three metrics and the numbers you must not fumble" },
        {
          t: "table",
          head: ["Metric", "Good", "Needs work", "Poor", "What it really measures"],
          rows: [
            ["**LCP** — Largest Contentful Paint", "< 2.5s", "2.5s – 4.0s", "> 4.0s", "How long until the biggest above-the-fold element is painted. A loading metric."],
            ["**INP** — Interaction to Next Paint", "< 200ms", "200ms – 500ms", "> 500ms", "Worst-case latency from a user input to the next frame that reflects it. A responsiveness metric."],
            ["**CLS** — Cumulative Layout Shift", "< 0.1", "0.1 – 0.25", "> 0.25", "Sum of unexpected layout shift scores over the page's life. A visual stability metric."],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "INP replaced FID in March 2024 — say this unprompted",
          text: "First Input Delay only measured the *delay before* the first handler ran, so a page could score a perfect FID while every interaction took a second to repaint. INP measures the whole interaction — input delay, handler processing, and presentation delay to the next paint — and it takes roughly the worst interaction of the visit, not the first. Anyone still quoting FID thresholds has not touched performance since 2023, and interviewers at product companies notice.",
        },
        { t: "h", text: "LCP is four sub-parts, and only one of them is \"the image\"" },
        {
          t: "list",
          ordered: true,
          items: [
            "**TTFB** — time to the first byte of the document. Fix with CDN edge caching, server render caching, fewer redirects. Frontend cannot fix a 900ms TTFB and you should say so.",
            "**Resource load delay** — the gap between TTFB and the browser *starting* to fetch the LCP resource. This is the sub-part frontend engineers own and almost always ignore: the image is discovered late because it is inside a lazy-loaded component, injected by JS, or behind a CSS background. Fix with `<link rel=\"preload\">` and `fetchpriority=\"high\"`.",
            "**Resource load duration** — the actual download. Fix with AVIF/WebP, correct `srcset` and `sizes`, and not shipping a 2400px hero to a 390px phone.",
            "**Element render delay** — the resource has arrived but is not painted yet, usually because a render-blocking stylesheet or a hydration pass is still in the way.",
          ],
        },
        {
          t: "code",
          lang: "html",
          caption: "The LCP image, done properly — every attribute here earns its place",
          code: `<!-- In <head>: makes the LCP image discoverable in the preload scanner,
     before the JS bundle has even parsed. Kills load delay. -->
<link rel="preload" as="image"
      href="/hero-1200.avif"
      imagesrcset="/hero-600.avif 600w, /hero-1200.avif 1200w"
      imagesizes="(max-width: 640px) 100vw, 1200px"
      fetchpriority="high">

<!-- In the markup. Note: NO loading="lazy" on the LCP element.
     Lazy-loading your hero is the single most common self-inflicted
     LCP regression in React apps. -->
<img src="/hero-1200.avif"
     srcset="/hero-600.avif 600w, /hero-1200.avif 1200w"
     sizes="(max-width: 640px) 100vw, 1200px"
     width="1200" height="630"
     fetchpriority="high"
     decoding="async"
     alt="Stock movement across 1,900 stores">

<!-- Below the fold, invert every choice. -->
<img src="/chart.webp" width="640" height="360"
     loading="lazy" fetchpriority="low" decoding="async" alt="">`,
        },
        { t: "h", text: "CLS is caused by space you did not reserve" },
        {
          t: "list",
          items: [
            "**Images and iframes without dimensions.** Always set `width` and `height` attributes, or `aspect-ratio` in CSS. The browser then reserves the box before the bytes arrive.",
            "**Web fonts.** A fallback font with different metrics reflows all text on swap. Fix with `font-display: optional` or `swap` plus `size-adjust` / `ascent-override` on the fallback face, and `preload` the critical font file.",
            "**Late-injected banners.** Cookie bars, promo strips and error toasts inserted above existing content. Reserve the height or render them as an overlay that does not participate in layout.",
            "**Content replacing a skeleton of the wrong size.** A 120px skeleton row replaced by a 156px real row shifts everything below it. Skeletons must match final dimensions exactly, which is an argument for deriving both from the same token.",
          ],
        },
        {
          t: "code",
          lang: "css",
          caption: "Reserving space, and the font trick most people have not seen",
          code: `/* Reserve the box from the first frame. */
.card-media {
  aspect-ratio: 16 / 9;
  width: 100%;
  background: var(--skeleton);
}

/* Table rows: fix the height so a skeleton and a real row are
   dimensionally identical. Also lets a virtualiser do exact maths. */
.grid-row { height: 44px; }

/* Match fallback metrics to the web font so the swap does not reflow. */
@font-face {
  font-family: "Inter-fallback";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
body { font-family: Inter, "Inter-fallback", sans-serif; }`,
        },
        { t: "h", text: "INP is a main-thread problem wearing a UX costume" },
        {
          t: "list",
          ordered: true,
          items: [
            "**Input delay** — the main thread was busy when the user clicked. Caused by long tasks: hydration, a big JSON parse, an unyielding loop, a third-party script. Fix by breaking work up and yielding.",
            "**Processing time** — your own handler plus the React render and commit it triggers. In a 50,000-row grid this is where the whole budget goes. Fix with virtualisation, memoised selectors, and moving non-urgent updates into `startTransition`.",
            "**Presentation delay** — layout, paint and composite for the next frame. Fix by not animating layout-triggering properties, avoiding forced synchronous layout (read/write thrash), and using `transform`/`opacity` for motion.",
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Forced synchronous layout — the read/write thrash that inflates presentation delay",
          code: `// BAD: every iteration writes, then reads, forcing layout 50,000 times.
rows.forEach((el) => {
  el.style.height = "44px";           // write, invalidates layout
  totals += el.offsetHeight;          // read, forces layout NOW
});

// GOOD: batch all reads, then all writes.
const heights = rows.map((el) => el.offsetHeight);   // read phase
rows.forEach((el, i) => {                             // write phase
  el.style.height = heights[i] + "px";
});

// Better still: never measure DOM in a loop. If row height is a
// design token, you already know it and can compute the total.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "On the Jio inventory dashboards, the metric that was actually broken was not LCP — the shell painted quickly. It was INP: applying a brand or store filter across 50,000 rows blocked the main thread for seconds, so the checkbox itself did not even repaint. Framing your story as \"the loading metric was fine, the responsiveness metric was catastrophic, and those need completely different fixes\" is a much stronger opening than \"the dashboard was slow\". It shows you diagnosed before you optimised.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "LCP < 2.5s, INP < 200ms, CLS < 0.1. INP replaced FID in March 2024 and is worst-case, not first.",
            "Never say \"I optimised LCP\" — say which of TTFB, load delay, load duration or render delay you attacked.",
            "CLS is unreserved space. Dimensions, `aspect-ratio`, font metric overrides, skeletons that match.",
            "INP is input delay plus processing plus presentation. All three are main-thread contention in disguise.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 22,
      title: "Shipping less JavaScript, and caching what you must ship",
      summary:
        "The critical rendering path, route- and component-level splitting, a real bundle analysis workflow, why barrel files silently defeat tree shaking, and the caching and resource-hint decisions that follow.",
      blocks: [
        {
          t: "p",
          text: "Every performance problem in a React app eventually reduces to \"we sent too much JavaScript and then executed all of it before showing anything\". Bytes cost download time; parsed and executed bytes cost main-thread time, which is far more expensive on the mid-range Android devices your Jio store users actually hold. Compressed transfer size is the number everyone quotes; *execution* time is the number that hurts.",
        },
        { t: "h", text: "The critical rendering path, and what blocks it" },
        {
          t: "steps",
          items: [
            { title: "Parse HTML into the DOM", text: "The parser also runs a **preload scanner** ahead of itself, speculatively fetching `src` and `href` it can see in the raw markup. Anything injected by JavaScript is invisible to it — this is why a JS-inserted hero image loads late." },
            { title: "Build the CSSOM", text: "CSS is **render-blocking by default**. Nothing paints until every stylesheet in `<head>` is fetched and parsed. Split non-critical CSS behind a media query or load it with `rel=\"preload\"` plus an `onload` swap." },
            { title: "Combine into the render tree, then layout", text: "Only visible nodes participate. `display: none` nodes cost nothing at layout; `visibility: hidden` still occupies space and still costs." },
            { title: "Paint and composite", text: "`transform` and `opacity` can be handled by the compositor without relayout or repaint. `width`, `top`, `margin` cannot — animating them is the classic jank source." },
          ],
        },
        {
          t: "p",
          text: "A classic `<script src>` in `<head>` blocks parsing entirely. `defer` fetches in parallel and executes after the DOM is parsed, in document order — the right default for your app bundle. `async` fetches in parallel and executes the moment it lands, out of order — correct only for genuinely independent third-party scripts, and even then it can steal the main thread at exactly the wrong moment. `type=\"module\"` is deferred implicitly.",
        },
        { t: "h", text: "Code splitting: routes first, then the expensive components" },
        {
          t: "code",
          lang: "javascript",
          caption: "Route-level splitting is the highest-value change in most React apps",
          code: `import { lazy, Suspense, startTransition } from "react";
import { Routes, Route } from "react-router-dom";

// Each lazy() becomes its own chunk. The dashboard's charting and
// grid dependencies no longer sit in the entry bundle.
const StockDashboard = lazy(() => import("./routes/StockDashboard"));
const RfidConsole    = lazy(() => import("./routes/RfidConsole"));
const Reports        = lazy(() => import("./routes/Reports"));

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Routes>
        <Route path="/stock"   element={<StockDashboard />} />
        <Route path="/rfid"    element={<RfidConsole />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}

// Component-level: a heavy modal nobody opens on most visits.
const RoiEditor = lazy(() => import("./canvas/RoiEditor")); // Konva ~180KB

// Warm the chunk on intent, so the click feels instant.
function EditRoiButton({ onOpen }) {
  const warm = () => import("./canvas/RoiEditor");
  return (
    <button onMouseEnter={warm} onFocus={warm} onClick={onOpen}>
      Configure ROI
    </button>
  );
}`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Splitting too finely makes things slower",
          text: "Each chunk is a request with its own latency, and a chunk that imports another chunk creates a **waterfall**: the browser cannot discover the second until the first has downloaded and executed. Three hundred tiny chunks on a 4G connection is worse than twenty sensible ones. Split on real user boundaries — routes, modals, editors, charting libraries — and prefetch on intent (`onMouseEnter`, `onFocus`, viewport intersection) so the network work happens before the click. If you split it, warm it.",
        },
        { t: "h", text: "The bundle analysis workflow" },
        {
          t: "steps",
          items: [
            { title: "Generate a treemap of the production build", text: "`rollup-plugin-visualizer` for Vite/Rollup, `webpack-bundle-analyzer` for webpack. Look at **gzip/brotli** size, not raw — raw size flatters nothing and misleads you about text-heavy modules." },
            { title: "Attribute bytes to source with source maps", text: "`source-map-explorer dist/assets/*.js` maps every byte of the shipped bundle back to the file it came from, including bytes inside dependencies. This is what finds the accidental import." },
            { title: "Find the three usual criminals", text: "A date library with all locales (`moment`, or `date-fns` imported wholesale), an icon set imported as a namespace, and `lodash` rather than `lodash-es` with named imports. Also check for two copies of the same library at different versions." },
            { title: "Set a budget and enforce it in CI", text: "A `size-limit` or `bundlesize` check that fails the build when the entry chunk grows more than a few percent. Without a gate the bundle grows back within two sprints — this is the part that makes you look like a lead rather than a firefighter." },
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Analyser wiring plus a CI-enforceable budget",
          code: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({ template: "treemap", gzipSize: true, brotliSize: true }),
  ],
  build: {
    sourcemap: true,             // required for source-map-explorer
    rollupOptions: {
      output: {
        manualChunks: {
          // Long-lived vendor chunks keep their cache hash across
          // app deploys, so users re-download only your code.
          react: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
});

// package.json
// "scripts": {
//   "analyse": "vite build && source-map-explorer dist/assets/*.js"
// },
// "size-limit": [{ "path": "dist/assets/index-*.js", "limit": "180 kB" }]`,
        },
        { t: "h", text: "Tree shaking, `sideEffects`, and why barrel files defeat both" },
        {
          t: "p",
          text: "Tree shaking is static dead-code elimination over ES module graphs. It works only when imports and exports are statically analysable — which means named ESM imports, no `require`, and no dynamic member access on a namespace object. Even then the bundler will keep a module it cannot prove is pure, because evaluating it might do something observable. That proof is what the `sideEffects` field provides.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The barrel file problem — and it is a real 30KB in your component library",
          code: `// package.json of your shared library.
// "false" = every module in this package is pure; drop what is unused.
// The array form is the honest version when CSS imports exist.
{
  "name": "@jio/ui",
  "sideEffects": ["**/*.css", "./src/polyfills.js"]
}

// src/index.js  <-- the barrel
export * from "./Button";
export * from "./DataGrid";      // pulls in the grid engine
export * from "./RoiCanvas";     // pulls in Konva
export * from "./Chart";         // pulls in recharts

// Consumer. Looks like one small import.
import { Button } from "@jio/ui";

// What actually happens without correct sideEffects + ESM output:
// the whole barrel is evaluated, so Konva and recharts land in the
// bundle to render one button. Under Jest with CJS transforms it is
// worse -- every barrel member is required at test time too, and
// your unit tests get slower for no reason.

// The fix that always works, regardless of bundler config:
import { Button } from "@jio/ui/Button";   // deep, explicit import`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The barrel file answer, compressed",
          text: "\"A barrel re-exports everything, so a single named import makes the bundler evaluate the entire index module. If any member has a side effect the bundler cannot prove away — or if the package ships CJS, or `sideEffects` is missing — the whole graph is retained. We kept the barrel for developer ergonomics but added `exports` subpath entries plus an ESLint rule banning barrel imports inside the library itself, so internal modules never pull the graph in.\" That is a library-owner's answer, and you own a 50-component library.",
        },
        { t: "h", text: "Caching what you do ship" },
        {
          t: "table",
          head: ["Header / strategy", "What it does", "Use it for"],
          rows: [
            ["`Cache-Control: public, max-age=31536000, immutable`", "Never revalidate for a year", "Hashed build assets — `index-a91f3c.js`. Safe because the filename changes when contents do."],
            ["`Cache-Control: no-cache`", "Cache, but revalidate every time", "`index.html` and the service worker script. Poison these with long TTLs and users are stuck on an old deploy."],
            ["`ETag` + `If-None-Match`", "Conditional request, 304 with no body", "API responses where freshness matters but payloads are large. Costs a round trip; saves the bytes."],
            ["`stale-while-revalidate=60`", "Serve stale instantly, refresh in the background", "Dashboard data that can be a minute old. Perceived latency near zero at the cost of brief staleness."],
            ["SW: cache-first", "Never hits network if cached", "Fonts, icons, the app shell."],
            ["SW: network-first with cache fallback", "Fresh when online, usable when not", "Stock data on a store's flaky in-branch wifi — arguably the most defensible SW use case you have."],
          ],
        },
        {
          t: "p",
          text: "Resource hints are the other half of delivery, and each one backfires in a specific way. `preconnect` opens DNS, TCP and TLS early — powerful for the one origin your LCP depends on, wasteful past three or four origins because each held connection consumes finite resources. `dns-prefetch` is the cheap fallback for origins you are less sure about. `preload` fetches at high priority *now* — preload something the current page does not use and you have taken bandwidth directly from the LCP resource, which is why Chrome logs a console warning for unused preloads. `prefetch` fetches at lowest priority for a *future* navigation, so prefetching aggressively on a metered mobile connection burns a user's data for pages they never visit. `modulepreload` is the one to reach for with split chunks: it warms the chunk and its dependency graph without executing it, flattening the import waterfall.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Bytes cost download; parsed bytes cost main thread. On mid-range Android, execution dominates.",
            "`defer` for your bundle, `async` only for independent third parties, CSS is render-blocking by default.",
            "Split on user boundaries and prefetch on intent. Unwarmed splits just move the wait.",
            "Analyse gzip size in a treemap, attribute bytes with source maps, then gate the budget in CI.",
            "Barrels plus a missing or dishonest `sideEffects` field silently disable tree shaking. Deep imports always work.",
            "Immutable caching for hashed assets, `no-cache` for HTML, and never preload what the current page will not use.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 22,
      title: "Rendering 50,000 rows: virtualisation, memoisation and the main thread",
      summary:
        "The windowing maths you should be able to derive on a whiteboard, TanStack Virtual versus hand-rolling, when React.memo costs more than it saves, and how to yield so a filter click repaints.",
      blocks: [
        {
          t: "p",
          text: "This is your home ground, so it is where the questioning will get most specific. A 50,000-row table with twelve columns is 600,000 DOM nodes if you render it naively. Each node carries layout and style cost, memory, and a slice of every subsequent style recalculation. No amount of memoisation saves you, because the problem is not *re-*rendering — it is rendering at all. The only real fix is to stop creating nodes the user cannot see.",
        },
        { t: "h", text: "The windowing maths — be able to derive this live" },
        {
          t: "math",
          formula: "startIndex = floor(scrollTop / rowHeight) - overscan\nvisibleCount = ceil(viewportHeight / rowHeight) + 2 * overscan\nendIndex = min(count - 1, startIndex + visibleCount)\noffsetY = startIndex * rowHeight\ntotalHeight = count * rowHeight",
          note: "A spacer of `totalHeight` gives the scrollbar the right size and feel. The visible slice is absolutely positioned at `offsetY`, or pushed down with a `translateY`. Overscan of 3-5 rows renders slightly outside the viewport so fast scrolling does not flash blank space. For 50,000 rows at 44px in an 800px viewport: 19 visible, ~27 rendered with overscan. That is a 1,850x reduction in row nodes.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Fixed-height virtualiser — write this from memory, it is a standard round",
          code: `import { useRef, useState, useMemo } from "react";

function VirtualList({ items, rowHeight = 44, height = 800, overscan = 4, Row }) {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef(null);

  const { start, end, offsetY, totalHeight } = useMemo(() => {
    const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const count = Math.ceil(height / rowHeight) + overscan * 2;
    const last  = Math.min(items.length, first + count);
    return {
      start: first,
      end: last,
      offsetY: first * rowHeight,
      totalHeight: items.length * rowHeight,
    };
  }, [scrollTop, rowHeight, height, overscan, items.length]);

  const slice = items.slice(start, end);

  return (
    <div
      ref={ref}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      style={{ height, overflowY: "auto", position: "relative",
               contain: "strict" }}
    >
      <div style={{ height: totalHeight }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0,
                    transform: "translateY(" + offsetY + "px)" }}>
        {slice.map((item, i) => (
          <Row key={item.id} item={item} index={start + i} height={rowHeight} />
        ))}
      </div>
    </div>
  );
}

// Deliberate choices worth narrating:
// - key is item.id, never the array index; index keys destroy row
//   identity on sort and re-scramble any local row state.
// - transform, not top: composited, no layout on every scroll frame.
// - contain: strict scopes layout and paint invalidation to the box.
// - scroll handler is NOT debounced. Debouncing scroll shows blank
//   rows; overscan is the correct answer to scroll speed.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Variable row heights are where hand-rolling stops being worth it",
          text: "With unknown heights you cannot compute `startIndex` arithmetically. You need measurement on mount, a cumulative-offset array (or a prefix-sum tree) to binary-search into, and correction logic when a measured height differs from the estimate — while avoiding a scroll-position jump as the estimate is corrected. That is a genuinely hard problem, and it is where you should say \"at this point I use TanStack Virtual rather than maintaining my own\". Knowing the boundary between \"write it\" and \"adopt it\" is a senior judgement call, not a cop-out.",
        },
        {
          t: "table",
          head: ["Concern", "Hand-rolled", "TanStack Virtual", "react-window"],
          rows: [
            ["Fixed heights", "Fine — 40 lines", "Fine", "Fine"],
            ["Dynamic measured heights", "Hard: offset cache, scroll anchoring, correction", "Built in via `measureElement`", "Needs the variable-size list plus manual cache resets"],
            ["Horizontal / grid / both axes", "Doubles the maths", "Same hook, `horizontal: true`", "Separate grid components"],
            ["Sticky headers, pinned columns", "You own it", "You own it, but offsets are exposed", "Awkward"],
            ["Markup control", "Total", "Total — headless, no DOM opinions", "Renders its own container"],
            ["Bundle cost", "0", "~5KB", "~7KB"],
            ["Sensible default in 2026", "Interview whiteboard, fixed-height grids", "Production, anything dynamic", "Legacy codebases"],
          ],
        },
        { t: "h", text: "Memoisation at scale, and when `React.memo` is a net loss" },
        {
          t: "p",
          text: "`React.memo` performs a shallow prop comparison and skips the re-render if nothing changed. It is not free: you pay the comparison on *every* render, plus the memory to retain previous props. It pays off when the component is expensive to render and its props are genuinely stable. It loses when the component is cheap — a `<td>` wrapper — or when a prop identity changes every render anyway, in which case you pay the comparison and re-render regardless. That second case is the common one, and it is why so many codebases are covered in `memo` with no measurable benefit.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Memo defeated by inline identities — then actually fixed",
          code: `const Row = React.memo(function Row({ item, onSelect, style }) {
  return <div style={style} onClick={() => onSelect(item.id)}>{item.sku}</div>;
});

// BROKEN. Every parent render creates a new arrow and a new object,
// so the shallow compare always fails. You now pay comparison cost
// on 50,000 rows AND re-render all of them. Strictly worse than
// no memo at all.
{rows.map((item) => (
  <Row key={item.id} item={item}
       onSelect={(id) => dispatch(select(id))}
       style={{ height: 44 }} />
))}

// FIXED: stable callback, hoisted constant, stable item references.
const ROW_STYLE = { height: 44 };
const onSelect = useCallback((id) => dispatch(select(id)), [dispatch]);

{rows.map((item) => (
  <Row key={item.id} item={item} onSelect={onSelect} style={ROW_STYLE} />
))}`,
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The selector bug that made memoisation impossible across the whole grid",
          code: `// BROKEN: filter() returns a new array every call, so useSelector
// sees a new reference on EVERY store action -- including unrelated
// SSE stock ticks arriving several times a second. The grid
// re-rendered constantly and no amount of React.memo helped.
const rows = useSelector((s) =>
  s.stock.items.filter((i) => i.brandId === brandId)
);

// FIXED: createSelector memoises on input identity, so the output
// array reference is stable until items or brandId actually change.
import { createSelector } from "@reduxjs/toolkit";

const selectRowsByBrand = createSelector(
  [(s) => s.stock.items, (_s, brandId) => brandId],
  (items, brandId) => items.filter((i) => i.brandId === brandId)
);

// Per-component instance memoisation, since the selector takes an
// argument and multiple brand panels are mounted at once.
const selectRows = useMemo(() => selectRowsByBrand, []);
const rows = useSelector((s) => selectRows(s, brandId));

// Also: normalise. createEntityAdapter gives you { ids, entities },
// so a single stock tick patches one entity and only the rows whose
// entity changed have any reason to re-render.`,
        },
        { t: "h", text: "Yielding: long tasks, `scheduler.yield`, and Web Workers" },
        {
          t: "p",
          text: "Any task over 50ms is a long task; while it runs, nothing repaints and no input is processed. The fix is not to make the work faster but to *break it up*, because responsiveness is about yielding, not throughput. `setTimeout(fn, 0)` yields but sends your continuation to the back of the task queue behind anything else waiting. `scheduler.yield()` yields to the browser and resumes your work with elevated priority — a genuinely better primitive, available in Chromium and worth naming with a feature-detected fallback. `startTransition` is the React-level version: it marks an update as interruptible so a filter recomputation cannot block the checkbox from repainting.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Chunked processing with scheduler.yield, and offloading real compute to a worker",
          code: `const yieldNow = () =>
  typeof scheduler !== "undefined" && scheduler.yield
    ? scheduler.yield()
    : new Promise((r) => setTimeout(r, 0));

// Process 50,000 rows without a single long task.
async function annotateRows(rows) {
  const out = [];
  let sliceStart = performance.now();
  for (const row of rows) {
    out.push(annotate(row));
    if (performance.now() - sliceStart > 40) {   // stay under 50ms
      await yieldNow();
      sliceStart = performance.now();
    }
  }
  return out;
}

// For genuinely heavy compute -- aggregating stock value across
// 1,900 stores, or parsing a multi-megabyte CSV export -- move it
// off the main thread entirely.
// worker.js
self.onmessage = (e) => {
  const totals = aggregate(e.data.rows);       // no DOM here, ever
  self.postMessage(totals);
};

// main thread
const worker = new Worker(new URL("./worker.js", import.meta.url),
                          { type: "module" });
worker.postMessage({ rows });                   // structured clone
worker.onmessage = (e) => setTotals(e.data);

// Know the cost: postMessage structured-clones the payload, so for
// very large arrays the copy itself can be the bottleneck. Transfer
// an ArrayBuffer (zero-copy) or send ids and let the worker fetch.`,
        },
        {
          t: "note",
          tone: "interview",
          title: "The 8s to 3s story, decomposed — and the part that failed",
          text: "Interviewers will not accept the headline. Decompose it: route-level splitting removed the charting and canvas dependencies from the entry bundle and cut parse/execute on first load; virtualisation took rendered rows from 50,000 to roughly 30 and eliminated the multi-second layout pass; memoised `createSelector` outputs plus a normalised entity store stopped every SSE stock tick from re-rendering the grid. Then volunteer the failure: **the first attempt was memoisation everywhere** — `React.memo` on every row and cell, `useMemo` on everything. It bought almost nothing and in places measured *worse*, because the selector returned a fresh array on every action and callbacks were inline, so the shallow compares always failed and we paid comparison cost on top of unchanged render cost. That taught the actual lesson: memoisation cannot fix a reference-identity problem, and it can never fix rendering nodes you should not have created. Say that out loud — admitting a failed approach with a mechanical explanation of *why* it failed is more convincing than the win itself.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Virtualisation beats memoisation because the problem is node count, not re-render count.",
            "Derive the windowing maths live: `floor(scrollTop / h)`, `ceil(viewport / h)`, spacer, `translateY`, overscan.",
            "Hand-roll fixed heights; adopt TanStack Virtual the moment heights are dynamic.",
            "`React.memo` with an inline callback or object prop is pure overhead. Fix identity first, memoise second.",
            "A selector returning a new array is the single most common cause of \"memoisation did nothing\".",
            "Break work at 40-50ms with `scheduler.yield`, and move DOM-free compute into a Worker.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 20,
      title: "How to prove a performance win",
      summary:
        "The measurement toolchain, lab versus field data, a before/after methodology that survives cross-examination, and exactly what to capture so \"how did you measure that?\" is the easiest question in the interview.",
      blocks: [
        {
          t: "p",
          text: "Every performance claim on your resume is an invitation to the question \"how did you measure that?\". Most candidates answer \"Lighthouse\" and lose the thread, because Lighthouse is a simulated single run on synthetic throttling and any interviewer who has done this work knows its variance. The credible answer names a *method*: what you measured, on what device and network, how many runs, what you held constant, and what the field data said afterwards. Method beats magnitude — a well-evidenced 30% improvement outranks an unexplained 60%.",
        },
        { t: "h", text: "Lab versus field, and why you need both" },
        {
          t: "table",
          head: ["", "Lab (synthetic)", "Field (RUM)"],
          rows: [
            ["Tools", "Lighthouse, Lighthouse CI, WebPageTest, DevTools Performance panel", "`web-vitals` library, CrUX, Sentry/Datadog/SpeedCurve RUM"],
            ["Strength", "Reproducible, isolatable, attributable to a code change", "Real devices, real networks, real interaction patterns"],
            ["Weakness", "One synthetic profile; INP is barely observable without scripted interaction", "Noisy, delayed, hard to attribute to a specific commit"],
            ["Statistic to quote", "Median of 5+ runs, plus the spread", "**p75** across real users — this is the threshold Google grades on"],
            ["Use it for", "Gating a PR, proving causation", "Proving the change reached users and mattered"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "p75, and why a mean is a red flag",
          text: "Core Web Vitals are assessed at the **75th percentile** of real users. Quote a median or a mean and you are hiding the tail, which is where slow devices, in-store wifi and the largest tenants live. \"p75 LCP went from 4.1s to 2.3s across roughly 12,000 daily users\" is a sentence an interviewer cannot poke a hole in. \"Lighthouse score went from 62 to 91\" is one they will, because the score is a weighted composite that moves for reasons unrelated to what users feel.",
        },
        { t: "h", text: "Instrumenting the field, properly" },
        {
          t: "code",
          lang: "javascript",
          caption: "Real user monitoring in about twenty lines",
          code: `import { onLCP, onINP, onCLS, onTTFB } from "web-vitals";

// Attribution build gives you the culprit element and the slow
// phase, not just the number. This is what makes RUM actionable.
function report(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,             // good | needs-improvement | poor
    id: metric.id,
    route: window.__APP_ROUTE__,       // segment by route, always
    release: import.meta.env.VITE_RELEASE,
    attribution: metric.attribution,   // e.g. LCP element, INP target
  });
  // sendBeacon survives page unload; fetch often does not.
  navigator.sendBeacon("/rum", body);
}

onLCP(report);
onINP(report, { reportAllChanges: false });
onCLS(report);
onTTFB(report);

// Custom timings for the things Google does not measure but your
// users feel. Name them; they show up in the Performance panel.
performance.mark("grid:filter:start");
applyBrandFilter(brandId);
performance.mark("grid:filter:end");
performance.measure("grid:filter", "grid:filter:start", "grid:filter:end");

// Catch regressions you did not think to look for.
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 100) report({ name: "long-task", value: entry.duration });
  }
}).observe({ type: "longtask", buffered: true });`,
        },
        { t: "h", text: "A before/after methodology that survives cross-examination" },
        {
          t: "steps",
          items: [
            { title: "Fix the environment and write it down", text: "Same device or the same throttling profile, same network conditions, cache state stated explicitly (cold versus warm), extensions disabled, same dataset size. If you change the seed data between runs, your measurement means nothing. Say the profile out loud in the interview: \"mid-tier Android, 4x CPU throttle, Slow 4G, cold cache\"." },
            { title: "Take a baseline of at least five runs", text: "Record the median and the range. A single run has enough variance to invent or hide a 20% change. If the range is wider than the improvement you are claiming, you have not measured anything." },
            { title: "Change exactly one lever", text: "Virtualisation, then measure. Selector memoisation, then measure. This is what lets you say \"virtualisation was worth about 2.4s of it\" instead of \"we did a bunch of things and it got faster\" — and it is the answer to \"which change mattered most?\"." },
            { title: "Capture the artefacts, not just the numbers", text: "A DevTools performance trace before and after (the flame chart tells the story visually), a React Profiler commit chart, the bundle treemap before and after, and the RUM p75 chart spanning the deploy. These are what you screenshot and keep." },
            { title: "Verify in the field after release", text: "Watch p75 LCP and INP for a week, segmented by route. Lab improvements that do not show up in RUM usually mean you optimised something users were not waiting on." },
            { title: "Gate it so it cannot regress", text: "Lighthouse CI assertions plus a bundle size limit in the pipeline. \"We also stopped it coming back\" is the sentence that reads as ownership rather than a one-off heroics story." },
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Lighthouse CI as a build gate — the artefact that proves you institutionalised it",
          code: `// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:4173/stock",
        "http://localhost:4173/reports",
      ],
      numberOfRuns: 5,                 // median of 5, never 1
      settings: { preset: "desktop" },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift":  ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time":      ["error", { maxNumericValue: 300 }],
        "unused-javascript":        ["warn",  { maxLength: 1 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};

// Azure DevOps pipeline step
// - script: |
//     npm ci && npm run build
//     npx http-server dist -p 4173 &
//     npx @lhci/cli autorun
//   displayName: "Lighthouse CI budget gate"

// TBT is the lab proxy for INP -- INP needs real interactions, so
// gate on Total Blocking Time in CI and watch INP in RUM.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The traps in your own numbers",
          text: "Three things will get caught. **Cache state**: an 8s cold-cache baseline against a 3s warm-cache result is not a win, it is a measurement error, so state the cache condition unprompted. **Confounded deploys**: if the backend also got faster in that window — and your stored procedure went 10s to 2s — you must separate frontend TTI from backend latency, or an interviewer will do it for you and conclude the backend did the work. **Dataset drift**: if the row count changed between measurements the comparison is void. Pre-empting all three makes you sound like someone who has been challenged on numbers before and learned from it.",
        },
        { t: "h", text: "The tools, and what each is actually for" },
        {
          t: "list",
          items: [
            "**DevTools Performance panel** — the only place you see *why*. Flame chart for long tasks, the Main track for attribution, layout shift regions, and the interaction track for INP phases. Learn to read it; it is the difference between guessing and diagnosing.",
            "**React Profiler (DevTools tab)** — commit-by-commit render cost, and \"why did this render?\" attribution once you enable it in settings. This is how you prove a memoisation change did something.",
            "**`<Profiler>` component** — programmatic `onRender(id, phase, actualDuration, baseDuration)`. Ship it behind a flag to log render cost from real sessions.",
            "**Performance API** — `mark`/`measure` for your own milestones, `PerformanceObserver` for `longtask`, `layout-shift`, `event` and `largest-contentful-paint` entries.",
            "**WebPageTest** — real devices, real locations, filmstrip and waterfall. Use it when you need to prove something about network ordering that Lighthouse abstracts away.",
            "**Chrome DevTools Coverage tab** — how much of the shipped CSS and JS the page actually executes. The fastest way to find dead weight worth splitting.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "The answer to \"how did you measure that?\"",
          text: "Have this rehearsed to about forty seconds: \"Lab first — DevTools traces and Lighthouse, median of five runs on a throttled mid-tier profile with a cold cache and a fixed 50,000-row fixture, changing one lever at a time so I could attribute the gain. Virtualisation was the largest single contributor, then route-level splitting, then memoised selectors. Then field verification — we already had `web-vitals` reporting to our own endpoint, so I watched p75 INP and LCP by route across the deploy for the 12,000 daily users. And I added a Lighthouse CI budget plus a bundle size limit to the Azure pipeline so it could not silently regress.\" Every clause in that sentence is a hook the interviewer can pull on, and you have a prepared answer behind each one. That is what a defensible claim looks like.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Method beats magnitude. Name the device, network, cache state, run count and the one lever you changed.",
            "Quote p75 from the field, not a mean, and never lead with a Lighthouse score.",
            "Lab proves causation; RUM proves it reached users. You need both sentences.",
            "TBT is your CI proxy for INP, because INP needs real interactions.",
            "Screenshot the traces, the profiler commits, the treemap and the RUM chart across the deploy.",
            "Finish every performance story with the gate you added so it could not come back.",
          ],
        },
      ],
    },
  ],

  theory: [
    "State the current thresholds for LCP, INP and CLS, then explain what changed when INP replaced FID in March 2024 and why it matters.",
    "Decompose LCP into its four sub-parts and give the specific fix for each. Explain which ones a frontend engineer cannot fix alone.",
    "Explain the preload scanner and why a JavaScript-injected hero image loads late even on a fast connection.",
    "Explain the three phases of INP and which phase a 50,000-row filter recomputation lands in.",
    "List four independent causes of CLS and the mechanism by which each one is fixed.",
    "Walk through the critical rendering path, then explain the difference between `defer`, `async` and `type=\"module\"` for script loading.",
    "Explain forced synchronous layout, show the read/write pattern that causes it, and explain why batching fixes it.",
    "Explain why splitting a bundle into very many small chunks can be slower than a few larger ones, using the word waterfall.",
    "Explain tree shaking, the `sideEffects` field, and exactly how a barrel file defeats both.",
    "Compare `preload`, `prefetch`, `preconnect`, `dns-prefetch` and `modulepreload`, and describe how each one backfires when misused.",
    "Choose between `Cache-Control: immutable`, `no-cache`, `ETag` and `stale-while-revalidate` for four given resource types and justify each.",
    "Derive the windowing maths for a fixed-height virtual list on a whiteboard, then explain what breaks with variable heights.",
    "Explain a case where `React.memo` makes an application measurably slower, in mechanical terms.",
    "Explain why a `useSelector` that calls `.filter()` inline defeats every memoisation downstream of it.",
    "Explain the difference between `setTimeout(fn, 0)`, `scheduler.yield()` and `startTransition` as ways of yielding.",
    "Explain when a Web Worker is the right answer and name the cost of `postMessage` for large payloads.",
    "Explain the difference between lab and field data, why Core Web Vitals are graded at p75, and why a mean is misleading.",
    "Defend the 8s to 3s dashboard improvement end to end, including the measurement method and one approach that did not work.",
  ],

  math: [
    {
      title: "Core Web Vitals thresholds",
      formula: "LCP < 2.5s · INP < 200ms · CLS < 0.1  (assessed at p75 of real users)",
      note: "INP replaced FID in March 2024 and is worst-case-ish, not first-interaction. \"Needs improvement\" bands are LCP 2.5-4.0s, INP 200-500ms, CLS 0.1-0.25. Quote p75, never a mean — the tail is where slow store devices live.",
    },
    {
      title: "Frame and task budget",
      formula: "60fps => 16.7ms/frame · long task > 50ms · yield every 40-50ms · TBT < 300ms in CI",
      note: "A 300ms synchronous render blocks roughly 18 frames, which users call laggy. Break loops at 40ms so you stay inside the long-task threshold with headroom. TBT is the lab proxy to gate on because INP needs real interactions.",
    },
    {
      title: "Virtual list windowing",
      formula: "start = floor(scrollTop / h) - overscan · visible = ceil(viewportH / h) + 2*overscan · offsetY = start * h · totalH = count * h",
      note: "50,000 rows at 44px in an 800px viewport gives ~19 visible and ~27 rendered — a 1,850x cut in row nodes. Spacer div gives correct scrollbar length; translateY the slice so scrolling is composited rather than laid out.",
    },
    {
      title: "LCP decomposition",
      formula: "LCP = TTFB + resource load delay + resource load duration + element render delay",
      note: "Diagnose before optimising. Load delay is the frontend-owned sub-part almost everyone ignores: fix with preload plus fetchpriority=high so the preload scanner finds the image before the bundle parses.",
    },
    {
      title: "INP decomposition",
      formula: "INP = input delay + processing time + presentation delay",
      note: "Input delay means the main thread was already busy — split long tasks. Processing means your handler and the React commit — virtualise, memoise, startTransition. Presentation means layout/paint — animate transform and opacity only, never width or top.",
    },
    {
      title: "Route-level code splitting",
      formula: "const Route = lazy(() => import(\"./routes/Route\")) inside <Suspense fallback={...}>",
      note: "Highest-value single change in most React apps. Always pair with intent-based warming on onMouseEnter/onFocus, otherwise you have moved the wait rather than removed it. Keep react/react-dom in a stable manualChunks vendor bundle for cache longevity.",
    },
    {
      title: "Bundle analysis workflow",
      formula: "build --sourcemap -> rollup-plugin-visualizer (gzip) -> source-map-explorer dist/assets/*.js -> size-limit in CI",
      note: "Read gzip/brotli size, not raw. Usual criminals: a date library with every locale, an icon namespace import, lodash instead of lodash-es, and two versions of the same dependency. The CI budget is the part that stops regrowth.",
    },
    {
      title: "Tree shaking preconditions",
      formula: "static ESM imports + \"sideEffects\": false | [\"**/*.css\"] + no barrel re-exports on hot paths",
      note: "The bundler keeps anything it cannot prove is pure. Ship ESM with an honest sideEffects field, add `exports` subpaths, and ban intra-library barrel imports with an ESLint rule. Deep imports work regardless of bundler config.",
    },
    {
      title: "Memo cost/benefit rule",
      formula: "React.memo pays off only if renderCost > compareCost AND prop identities are stable",
      note: "Inline arrows and inline object props guarantee the compare fails, so you pay comparison plus full re-render — strictly worse than no memo. Fix identity with useCallback and hoisted constants first; memoise second; measure third.",
    },
    {
      title: "Stable selector output",
      formula: "createSelector([inputA, inputB], (a, b) => derive(a, b))  // stable ref until inputs change",
      note: "An inline .filter() in useSelector returns a new array on every store action, so every SSE stock tick re-renders the grid. Pair with createEntityAdapter normalisation so one tick patches one entity and touches one row.",
    },
    {
      title: "Yielding to the main thread",
      formula: "await (scheduler.yield?.() ?? new Promise(r => setTimeout(r, 0)))",
      note: "scheduler.yield resumes your continuation with elevated priority instead of sending it to the back of the task queue. Feature-detect it. startTransition is the React-level equivalent for marking an update interruptible.",
    },
    {
      title: "RUM instrumentation",
      formula: "onLCP/onINP/onCLS/onTTFB(metric => navigator.sendBeacon(\"/rum\", payload))  // segment by route + release",
      note: "sendBeacon survives unload where fetch often does not. Use the attribution build so you get the culprit element and slow phase, not just a number. Always tag route and release, or you cannot attribute a regression to a deploy.",
    },
  ],

  practice: [
    { type: "math", q: "Build a fixed-height virtual list from scratch in 25 minutes: spacer, translateY slice, overscan, id-based keys. No libraries. Then load it with 100,000 rows and record scroll FPS." },
    { type: "math", q: "Extend that virtual list to variable heights with a measured offset cache and binary search. Time yourself, then compare your implementation with TanStack Virtual and write down three things it handles that you did not." },
    { type: "math", q: "Take a real page you own, run Lighthouse five times, and record median plus range for LCP, TBT and CLS. Write one sentence on whether the range is small enough to detect a 20% change." },
    { type: "math", q: "Add rollup-plugin-visualizer and source-map-explorer to a project. Find the three largest unnecessary contributors to the entry bundle and remove them. Record before/after gzip size." },
    { type: "math", q: "Convert one route to React.lazy with a Suspense skeleton, add intent-based prefetch on hover and focus, and measure the entry bundle reduction plus the post-click delay with and without warming." },
    { type: "math", q: "Build a barrel-file reproduction: a library with four modules where one imports a heavy dependency. Prove the bloat, then fix it three ways — sideEffects, exports subpaths, deep imports — and measure each." },
    { type: "math", q: "Write a loop that blocks the main thread for 800ms, confirm it in the Performance panel as a long task, then chunk it with scheduler.yield and a setTimeout fallback until no task exceeds 50ms." },
    { type: "math", q: "Move a heavy aggregation into a Web Worker. Measure main-thread time before and after, then measure the postMessage structured-clone cost for a 10MB payload and try again with a transferred ArrayBuffer." },
    { type: "math", q: "Instrument a page with the web-vitals library reporting to a local endpoint. Trigger a deliberate CLS and a deliberate slow interaction, and confirm the attribution data names the culprit element." },
    { type: "math", q: "Deliberately introduce CLS four ways — unsized image, font swap, injected banner, mismatched skeleton — then fix each and record the CLS delta per fix." },
    { type: "math", q: "Wire Lighthouse CI with LCP, CLS and TBT assertions into a pipeline, then push a commit that imports a 200KB library and confirm the build fails." },
    { type: "math", q: "Profile a memoised list in React DevTools with 'why did this render?' enabled. Find one React.memo that never prevents a render and one that does, and record the measured cost of each." },
    { type: "theory", q: "A page reports LCP of 4.4s. Walk through your diagnostic order out loud, naming what you check for each of the four LCP sub-parts before proposing any fix." },
    { type: "theory", q: "Explain to a mid-level engineer why adding React.memo to every row of a 50,000-row table made the app slower, using no jargon beyond 'reference'." },
    { type: "theory", q: "Answer 'how did you measure the 8s to 3s improvement?' in under sixty seconds, covering device profile, cache state, run count, per-lever attribution, field verification and the regression gate." },
    { type: "theory", q: "Answer 'what did you try that did not work?' for the same story, and explain mechanically why memoisation could not have fixed it." },
    { type: "theory", q: "An interviewer says 'your backend also got faster in that period, so how do you know the frontend work mattered?'. Answer it." },
    { type: "theory", q: "Argue both sides of hand-rolling a virtualiser versus adopting TanStack Virtual for a shared component library used by four teams." },
  ],

  resources: [
    { label: "web.dev — Core Web Vitals. The authoritative source for thresholds and the p75 assessment rule; read this before quoting any number in an interview.", url: "https://web.dev/articles/vitals", kind: "docs" },
    { label: "web.dev — Optimize INP. The single best explanation of input delay vs processing vs presentation, which is the framing that makes you sound senior.", url: "https://web.dev/articles/optimize-inp", kind: "blog" },
    { label: "web.dev — Optimize LCP. Walks the four sub-parts and the fix for each; this is the diagnostic order you should internalise.", url: "https://web.dev/articles/optimize-lcp", kind: "blog" },
    { label: "web.dev — Optimize long tasks. Covers scheduler.yield, isInputPending and chunking strategy with honest trade-offs.", url: "https://web.dev/articles/optimize-long-tasks", kind: "blog" },
    { label: "GoogleChrome/web-vitals — the RUM library itself. Read the attribution build docs; that is what turns a number into an actionable culprit.", url: "https://github.com/GoogleChrome/web-vitals", kind: "repo" },
    { label: "TanStack Virtual docs. Headless virtualisation; study the dynamic measurement API to understand exactly what hand-rolling costs you.", url: "https://tanstack.com/virtual/latest", kind: "docs" },
    { label: "React docs — <Profiler> and performance. The official position on when memoisation helps, worth quoting back at interviewers who over-index on useMemo.", url: "https://react.dev/reference/react/Profiler", kind: "docs" },
    { label: "Chrome DevTools — Performance panel reference. Learn the Main track, interaction track and layout-shift regions; reading a flame chart is the actual skill.", url: "https://developer.chrome.com/docs/devtools/performance", kind: "docs" },
    { label: "Lighthouse CI — getting started. The budget-gating recipe you can lift almost directly into an Azure DevOps pipeline.", url: "https://github.com/GoogleChrome/lighthouse-ci", kind: "repo" },
    { label: "MDN — HTTP caching. Precise, complete treatment of Cache-Control, ETag and stale-while-revalidate; settles most caching arguments.", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching", kind: "docs" },
    { label: "Addy Osmani — 'Speed at Scale' / patterns.dev rendering patterns. Good for the architectural framing of performance rather than the tactics.", url: "https://www.patterns.dev/vanilla/rendering-patterns", kind: "book" },
  ],
};

export default p04;
