const p06 = {
  id: "p06",
  week: 6,
  hours: 8,
  title: "Browser, Network and Security",
  tag: "Platform",
  why: "This is the layer where mid-level candidates get exposed and where the cheapest marks in the whole loop are available. Almost nobody prepares CORS, cookie flags or transport choice properly, so a precise answer reads as seniority rather than revision. It is also the module that owns your strongest story — Kafka stock events over SSE — and you need to be unbeatable on why that transport, not a WebSocket.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "The rendering pipeline and the DOM event model",
      summary:
        "What each stage of parse to composite actually costs, why animation belongs to transform and opacity only, and the event mechanics behind delegation.",
      blocks: [
        {
          t: "p",
          text: "\"The browser parses HTML and paints pixels\" is not an answer. The pipeline has six stages, each with a different cost and a different set of triggers, and the entire discipline of frontend performance is knowing which stages your change invalidates. Get this right and every jank question afterwards becomes mechanical.",
        },
        { t: "h", text: "The six stages, in order" },
        {
          t: "steps",
          items: [
            { title: "Parse", text: "HTML is tokenised into the **DOM** tree. A synchronous `<script>` in `<head>` stops the parser dead; `defer` waits for parse completion, `async` runs the moment it downloads. CSS is parsed into the **CSSOM**, which is render-blocking because you cannot compute styles from a partial stylesheet." },
            { title: "Style", text: "Selectors are matched against DOM nodes to produce a computed style for every element. Cost scales with node count times selector complexity, which is the real reason deeply nested descendant selectors are discouraged." },
            { title: "Layout (reflow)", text: "Geometry — position and size of every box — is computed. This is the expensive stage. It is global in nature: changing one element's width can move everything after it." },
            { title: "Paint", text: "Each box is rasterised into paint records — text, borders, shadows, background images. Expensive per pixel, not per node, which is why large blurred box-shadows hurt." },
            { title: "Composite", text: "Painted layers are assembled and transformed on the GPU. Cheap, off the main thread, and the only stage that can keep a 60fps animation smooth under main-thread load." },
            { title: "Present", text: "The frame is handed to the display. If you missed the 16.7ms budget, the previous frame is shown again — that dropped frame is what a user calls lag." },
          ],
        },
        {
          t: "table",
          head: ["Change you make", "Stages re-run", "Cost"],
          rows: [
            ["`width`, `top`, `font-size`, `display`, adding a node", "Style → Layout → Paint → Composite", "Worst case — reflow"],
            ["`color`, `background-color`, `box-shadow`, `visibility`", "Style → Paint → Composite", "Repaint, no reflow"],
            ["`transform`, `opacity` (on a composited layer)", "Composite only", "Cheapest — GPU, off main thread"],
            ["`filter`, `will-change: transform`", "Promotes to its own layer", "Cheap to animate, costs GPU memory"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The rule that answers every animation question",
          text: "Animate `transform` and `opacity`. Nothing else. `left`/`top` animation reflows the document on every frame; `transform: translateX()` skips style, layout and paint entirely and only recomposites. If an interviewer asks you to make a janky animation smooth and you say \"I would move it from `left` to `transform: translate3d` so it runs on the compositor\", that question is over.",
        },
        { t: "h", text: "Forced synchronous layout — the bug you will be shown" },
        {
          t: "p",
          text: "The browser batches layout work and flushes it once per frame. But reading a geometry property forces it to flush *now*, because you asked for a value it has not computed yet. Interleave reads and writes in a loop and you trigger one reflow per iteration — layout thrashing.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Same loop, 100x difference on a long list",
          code: `// BAD: read, write, read, write... one forced reflow per row.
rows.forEach((row) => {
  const h = row.offsetHeight;        // forces layout flush
  row.style.height = h * 2 + "px";   // invalidates layout again
});

// GOOD: batch all reads, then all writes. One layout, one paint.
const heights = rows.map((row) => row.offsetHeight);   // read phase
rows.forEach((row, i) => {
  row.style.height = heights[i] * 2 + "px";            // write phase
});

// Properties that force a synchronous layout when read:
// offsetTop/Left/Width/Height, clientWidth/Height, scrollTop/Height,
// getBoundingClientRect(), getComputedStyle(), focus(), scrollIntoView()`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "This is the mechanism behind your 8s to 3s time-to-interactive result on the 50,000-row dashboards. Name the causes in order: too many DOM nodes for the style and layout stages to chew through, layout thrash from measuring rows while mutating them, and paint cost from shadows and gradients on every cell. Then name the fixes: windowing so only visible rows exist, batched read/write phases, and CSS containment. That is a mechanism-level answer, and it is what separates you from a candidate who says \"I virtualised the list\".",
        },
        { t: "h", text: "Events: three phases, two verbs" },
        {
          t: "p",
          text: "A dispatched event travels **capture** (window down to the target), hits the **target**, then **bubbles** (target back up to window). `addEventListener` defaults to the bubble phase; pass `{ capture: true }` to intercept on the way down. Focus events (`focus`, `blur`) and a handful of others do not bubble at all — use `focusin`/`focusout` when you need them to.",
        },
        {
          t: "table",
          head: ["Call", "What it stops", "When you want it"],
          rows: [
            ["`e.preventDefault()`", "The browser's **default action** — form submit, link navigation, text input", "Custom form handling, custom drag behaviour"],
            ["`e.stopPropagation()`", "Further **travel** up (or down) the tree. Other listeners on the same node still fire", "Nested interactive widgets — a close button inside a clickable card"],
            ["`e.stopImmediatePropagation()`", "Travel **and** remaining listeners on the same node", "Rare. Usually a smell in application code"],
          ],
        },
        {
          t: "p",
          text: "The two are independent. Returning `false` from a jQuery handler did both, which is where the confusion comes from; in plain DOM code you must call each one deliberately. Note also that `stopPropagation` is how you break event delegation and analytics without realising — a library that stops propagation at a wrapper will silently kill every delegated listener above it.",
        },
        { t: "h", text: "Delegation, and why it still matters" },
        {
          t: "code",
          lang: "javascript",
          caption: "One listener for a table of any size",
          code: `// 50,000 rows, one listener. Attaching per-row handlers would
// allocate 50,000 closures and keep every row's scope alive.
table.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn || !table.contains(btn)) return;   // guard: click hit blank space

  const { action, sku } = btn.dataset;
  if (action === "adjust") openAdjustModal(sku);
  if (action === "audit")  openAuditTrail(sku);
});

// React's synthetic events do exactly this: one listener per event type
// on the root container, dispatched through the fibre tree. That is why
// onClick works on elements added after mount without rebinding.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Passive listeners and scroll jank",
          text: "A non-passive `touchstart` or `wheel` listener forces the browser to wait for your handler before scrolling, because you might call `preventDefault()`. Pass `{ passive: true }` and it scrolls immediately. Chrome now defaults document-level touch listeners to passive for this reason — but your own listeners on inner scroll containers are not covered.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Six stages: parse, style, layout, paint, composite, present. Know which your change invalidates.",
            "Reflow is global and expensive; repaint is per-pixel; composite is nearly free.",
            "Animate only `transform` and `opacity`. Everything else is a compromise.",
            "Reading geometry mid-mutation forces synchronous layout. Batch reads, then writes.",
            "Capture down, target, bubble up. `preventDefault` stops the action, `stopPropagation` stops the journey.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 20,
      title: "HTTP/1.1 to HTTP/3, caching, storage and service workers",
      summary:
        "Why the bundling advice you learned in 2016 is now wrong, how to write cache headers you can defend, and the stale-service-worker trap that bricks deployments.",
      blocks: [
        {
          t: "p",
          text: "Transport protocol choices leak upwards into build configuration. If you cannot explain multiplexing you cannot explain why \"concatenate everything into one bundle\" stopped being good advice, and that is a question senior candidates get asked directly because it tests whether your practices are reasoned or inherited.",
        },
        { t: "h", text: "Three protocols, one problem" },
        {
          t: "table",
          head: ["", "HTTP/1.1", "HTTP/2", "HTTP/3"],
          rows: [
            ["Transport", "TCP, text protocol", "TCP, binary framing", "QUIC over UDP"],
            ["Concurrency", "One request per connection; browsers open ~6 per origin", "Many streams multiplexed on one connection", "Same, but streams are independent at transport level"],
            ["Head-of-line blocking", "**Application layer** — request 2 waits for request 1", "Fixed at app layer, **still present at TCP layer** — one lost packet stalls all streams", "Eliminated — a lost packet stalls only its own stream"],
            ["Header cost", "Full text headers every request", "HPACK compression", "QPACK compression"],
            ["Handshake", "TCP + TLS, 2-3 round trips", "TCP + TLS, 2-3 round trips", "QUIC merges transport and TLS — 1 RTT, 0-RTT on resumption"],
            ["Server push", "n/a", "Existed, effectively dead — deprecated in Chrome", "Replaced by `103 Early Hints`"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why bundling advice changed",
          text: "Under HTTP/1.1, each file cost a connection from a pool of six, so concatenating 40 files into one was a genuine win. Under HTTP/2 those 40 files are 40 streams on one connection, so the per-request penalty largely disappears — and many small files cache far better, because changing one component invalidates one chunk instead of your entire bundle. The modern position: split by route and by change frequency, keep chunks in the tens-to-low-hundreds of KB, and do not go to hundreds of tiny files either, because compression works better on larger payloads and there is still per-stream overhead.",
        },
        { t: "h", text: "Caching headers you can actually defend" },
        {
          t: "code",
          lang: "http",
          caption: "The two-tier strategy behind every modern build tool",
          code: `# Hashed build assets - content-addressed, so cache forever.
# app.4f9c2b1e.js
Cache-Control: public, max-age=31536000, immutable

# The HTML shell - must always be revalidated, it names the hashes.
# index.html
Cache-Control: no-cache
ETag: "a17f-9b2"

# API responses that may be served stale while refreshing behind the scenes.
Cache-Control: private, max-age=0, must-revalidate
Cache-Control: public, max-age=60, stale-while-revalidate=600

# Never cache. Note: no-store, not no-cache.
Cache-Control: no-store`,
        },
        {
          t: "p",
          text: "`no-cache` is the most misnamed header in HTTP: it means *store it, but revalidate before use*. `no-store` is the one that means do not keep a copy. `immutable` tells the browser not to revalidate even on reload, which is safe only because the filename contains a content hash. Revalidation is conditional — the browser sends `If-None-Match` with the ETag and the server answers `304 Not Modified` with no body, which is cheap but still a round trip.",
        },
        { t: "h", text: "Client storage: four APIs, four jobs" },
        {
          t: "table",
          head: ["API", "Capacity", "Sync?", "Sent to server?", "Right job"],
          rows: [
            ["`localStorage`", "~5-10MB per origin", "**Synchronous** — blocks the main thread", "No", "Small UI preferences: theme, collapsed panels, last-selected store"],
            ["`sessionStorage`", "~5-10MB per tab", "Synchronous", "No", "Per-tab wizard state that must not leak across tabs"],
            ["`IndexedDB`", "Large — quota is a share of free disk", "Async, transactional", "No", "Offline datasets, cached query results, queued mutations"],
            ["Cache API", "Same quota pool", "Async, promise-based", "No", "HTTP response objects, driven by a service worker"],
            ["Cookies", "~4KB total per domain", "Synchronous", "**Yes, every request**", "Session identifiers and nothing else"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "localStorage is synchronous, and that matters",
          text: "Every `localStorage.getItem` is a blocking disk-backed read on the main thread. Reading a 2MB JSON blob out of it during startup is a measurable chunk of your time-to-interactive, and it happens before React ever mounts. Rule of thumb: localStorage for kilobytes of scalar preferences, IndexedDB for anything you would call a dataset.",
        },
        { t: "h", text: "Service workers and caching strategies" },
        {
          t: "code",
          lang: "javascript",
          caption: "The four strategies, and when each is correct",
          code: `self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Cache-first - hashed static assets. Fast, never stale by design.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(event.request).then((hit) => hit || fetch(event.request))
    );
    return;
  }

  // 2. Network-first with cache fallback - the app shell, so a deploy
  //    is picked up immediately but an offline user still gets a page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // 3. Stale-while-revalidate - reference data. Serve the cached copy
  //    instantly, refresh in the background for next time.
  if (url.pathname.startsWith("/api/reference/")) {
    event.respondWith(
      caches.open("ref-v1").then(async (cache) => {
        const hit = await cache.match(event.request);
        const net = fetch(event.request).then((res) => {
          cache.put(event.request, res.clone());
          return res;
        });
        return hit || net;
      })
    );
    return;
  }

  // 4. Network-only - anything live or authorised. Do not touch it.
});`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The stale service worker trap",
          text: "A service worker controls the page until every tab for that origin is closed — a reload is not enough. Ship a cache-first rule over `index.html` and users are pinned to an old build indefinitely, with no way for you to reach them. Two defences: never cache-first the HTML shell, and give the worker a kill switch — a `skipWaiting()` path plus a version check that can unregister it. Every team that has been burned by this remembers it, so raising it unprompted reads as scar tissue rather than reading.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "HTTP/2 fixed application-layer head-of-line blocking; HTTP/3 fixed the transport-layer kind by moving to QUIC over UDP.",
            "Multiplexing is why per-file cost fell and why splitting by route and change frequency now beats one big bundle.",
            "`no-cache` means revalidate. `no-store` means do not keep it. `immutable` is safe only with content hashes.",
            "localStorage is synchronous and small; IndexedDB is where datasets belong.",
            "A service worker is a deployed proxy that outlives your deploy. Give it a kill switch before you need one.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 22,
      title: "Origins, CORS, cookies, XSS, CSRF and auth",
      summary:
        "How to debug a CORS error instead of guessing at it, what each cookie flag actually defends against, and a token-storage answer that survives follow-up questions.",
      blocks: [
        {
          t: "p",
          text: "The same-origin policy is the axiom the entire browser security model rests on: scripts from one origin cannot read responses from another. An **origin** is scheme plus host plus port — `https://app.jio.com` and `https://api.jio.com` are different origins, and so are `http` and `https` on the same host. CORS is not a security feature that stops attacks; it is a controlled, server-authorised relaxation of that policy.",
        },
        { t: "h", text: "What actually triggers a preflight" },
        {
          t: "p",
          text: "A request is **simple** — no preflight — only if the method is `GET`, `HEAD` or `POST`, *and* every header is on the CORS-safelist, *and* `Content-Type` is one of `text/plain`, `multipart/form-data` or `application/x-www-form-urlencoded`. Anything else earns an `OPTIONS` preflight first. In practice this means: the moment you send `Content-Type: application/json` or an `Authorization` header, you are preflighting. That is nearly every API call a real SPA makes.",
        },
        {
          t: "code",
          lang: "http",
          caption: "The exchange, both halves",
          code: `# Browser sends this automatically before your PUT:
OPTIONS /api/stock/SKU-1029 HTTP/1.1
Origin: https://inventory.jio.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, authorization

# Server MUST answer with all of these or the real request never happens:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://inventory.jio.com
Access-Control-Allow-Methods: GET, PUT, POST, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400          # cache the preflight for a day

# To read a custom response header from JS, the server must expose it:
Access-Control-Expose-Headers: x-total-count, x-request-id`,
        },
        {
          t: "note",
          tone: "insight",
          title: "How to debug CORS in four checks, not four hours",
          text: "1) Open the Network tab and find the **OPTIONS** row, not the row you were expecting — that is where the failure lives. 2) Compare `Access-Control-Allow-Origin` character for character with your `Origin`; a trailing slash or an `http` versus `https` mismatch is the usual culprit. 3) If you send cookies, `credentials: \"include\"` requires `Allow-Credentials: true` **and** a literal origin — wildcard `*` is illegal with credentials, by design. 4) Check every custom header you send appears in `Allow-Headers`. Also know this: a CORS failure is enforced by the browser *after* the response arrives, so the server has already executed the request. CORS protects the reader, not the resource.",
        },
        { t: "h", text: "Cookies: three flags that carry the whole defence" },
        {
          t: "table",
          head: ["Flag", "Mechanism", "Attack it blocks"],
          rows: [
            ["`HttpOnly`", "Invisible to `document.cookie`", "Token theft via XSS"],
            ["`Secure`", "Only sent over HTTPS", "Interception on the wire"],
            ["`SameSite=Lax`", "Not sent on cross-site subrequests; sent on top-level navigation", "Most CSRF (browser default now)"],
            ["`SameSite=Strict`", "Never sent cross-site at all", "All CSRF, at the cost of breaking inbound links to logged-in pages"],
            ["`SameSite=None`", "Sent cross-site — **requires** `Secure`", "Nothing. Only for deliberate cross-site use, like an embedded widget"],
          ],
        },
        {
          t: "p",
          text: "Session cookie versus JWT is a trade of revocation against statelessness. A server-side session is instantly revocable — delete the record and the user is out — but every request needs a session lookup. A JWT is verified by signature with no lookup, which scales beautifully and means you **cannot revoke it** before it expires. The standard resolution is short-lived access tokens (5-15 minutes) plus a long-lived refresh token that is revocable, stored server-side, and rotated on every use.",
        },
        { t: "h", text: "XSS: the one that actually gets exploited" },
        {
          t: "list",
          items: [
            "**Stored** — attacker input is persisted server-side and served to every viewer. A product-note field rendered as HTML on an inventory dashboard is the classic vector, and the blast radius is every one of your 12,000 users.",
            "**Reflected** — payload arrives in a URL or form and is echoed straight back into the response. Delivered by link, so it needs a click.",
            "**DOM-based** — no server involvement at all. `element.innerHTML = location.hash` is the whole bug. Frameworks do not save you here, because you wrote the sink yourself.",
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "React escapes by default - and here is exactly where it stops",
          code: `// SAFE. React escapes interpolated text. This renders the tag as
// literal characters, it does not execute.
<div>{userSuppliedNote}</div>

// UNSAFE. The prop is named as a warning, not as a description.
<div dangerouslySetInnerHTML={{ __html: userSuppliedNote }} />

// If you genuinely must render HTML, sanitise on the way in.
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userSuppliedNote, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "li"],
    ALLOWED_ATTR: ["href", "title"],
  }),
}} />

// Other sinks React does NOT protect:
<a href={userUrl} />                  // javascript: URLs still execute
<div style={untrustedStyleObject} />  // CSS-based exfiltration
eval, new Function, setTimeout("string"), element.outerHTML`,
        },
        {
          t: "p",
          text: "The defence in depth on top of sanitisation is **Content-Security-Policy**. A strict nonce-based policy means an injected `<script>` tag simply does not run, because it lacks the per-response nonce. `script-src 'self' 'nonce-abc123'; object-src 'none'; base-uri 'none'` is a serious starting point. Avoid `unsafe-inline`, which disables most of the benefit, and treat `report-uri`/`report-to` as mandatory — you want the violations even in report-only mode, because they tell you what would have broken.",
        },
        {
          t: "note",
          tone: "warn",
          title: "SPAs are not immune to CSRF",
          text: "The belief that \"we are a JSON API so we are safe\" rests on two accidents: `SameSite=Lax` defaults and the fact that `Content-Type: application/json` triggers a preflight, which an attacker's page cannot satisfy. Both are properties of your current configuration, not guarantees. If you set `SameSite=None` for an embedded use case, or accept `x-www-form-urlencoded` on a write endpoint, or run a permissive CORS policy that reflects any origin, CSRF is back. The real defence is explicit: `SameSite` cookies plus a double-submit or synchroniser token on every state-changing request.",
        },
        { t: "h", text: "OAuth2, OIDC and PKCE in one pass" },
        {
          t: "list",
          items: [
            "**OAuth2** is authorisation — it gets you an access token to call an API. **OIDC** is a thin layer on top that adds authentication, delivering an `id_token` (a JWT) describing *who* the user is. Mixing the two up is a common and visible slip.",
            "**Authorization Code flow with PKCE** is the only correct flow for a browser SPA. The implicit flow is deprecated; it returned tokens in the URL fragment, where they landed in history and referrer headers.",
            "**PKCE** works because the client generates a random `code_verifier`, sends its SHA-256 hash as `code_challenge` at the start, and presents the original verifier when redeeming the code. An attacker who steals the authorisation code cannot redeem it without the verifier — which never left the browser.",
            "**Refresh-token rotation** issues a new refresh token on every use and invalidates the old one. If an old token is ever replayed, the server knows the family is compromised and revokes all of them. This is what makes long sessions safe without long-lived credentials.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "The token storage question, answered honestly",
          text: "There is no clean win here and pretending otherwise is the wrong answer. `localStorage` is readable by any script on the page, so one XSS is total token theft — but it is simple and survives cross-origin API calls. An `HttpOnly; Secure; SameSite=Strict` cookie cannot be read by script, so XSS cannot exfiltrate the token, but it is attached automatically, which reintroduces CSRF and requires cookie-capable CORS. The position to hold: **refresh token in an HttpOnly, Secure, SameSite cookie scoped to the auth endpoint; access token in memory only, in a module-scoped variable, never persisted; silent re-auth on page load via the refresh cookie.** A reload costs one refresh round trip, and that is the price of not leaving a bearer token on disk. Then add the line that shows judgement: none of this matters if you have an XSS, so CSP and sanitisation are the primary control and storage choice is the secondary one.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Origin is scheme + host + port. CORS relaxes the same-origin policy with server permission; it does not protect the server.",
            "JSON bodies and `Authorization` headers always preflight. Debug the OPTIONS row, not the GET.",
            "Wildcard `Allow-Origin` with credentials is illegal. That single rule explains most CORS dead ends.",
            "HttpOnly stops theft, SameSite stops CSRF, Secure stops interception. Name the flag with the attack.",
            "Access token in memory, refresh token in an HttpOnly cookie, and CSP as the control that makes both safe.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 22,
      title: "Real-time transports: SSE, WebSocket and long polling",
      summary:
        "The module centrepiece. Everything needed to own the SSE decision on your resume — mechanism, failure modes, scaling limits, and the honest case for the alternative.",
      blocks: [
        {
          t: "p",
          text: "You built a real-time layer consuming Kafka-published stock events over Server-Sent Events, cutting a 15-minute batch refresh to under five seconds across 1,900 stores. That is the strongest single line on your resume and it will be attacked, because \"why not WebSockets?\" is the reflex question. The wrong answer is \"SSE was simpler\". The right answer is that the data flow is unidirectional and SSE matches that shape, and then you prove you know what you gave up.",
        },
        { t: "h", text: "The three transports, mechanically" },
        {
          t: "table",
          head: ["", "Long polling", "Server-Sent Events", "WebSocket"],
          rows: [
            ["Protocol", "Plain HTTP, repeated", "Plain HTTP, one streamed response", "HTTP `Upgrade` to `ws://`/`wss://`, then framed TCP"],
            ["Direction", "Client asks, server answers", "**Server to client only**", "Full duplex"],
            ["Reconnection", "Inherent — every cycle is a new request", "**Automatic**, built into `EventSource`, with `Last-Event-ID` replay", "You write it: backoff, resubscribe, resync"],
            ["Payload", "JSON, anything", "UTF-8 text only (base64 or JSON for binary)", "Text or binary frames"],
            ["Proxies, CDNs, load balancers", "Just works", "Usually works — needs buffering disabled", "Needs explicit upgrade support on every hop"],
            ["Auth", "Normal headers and cookies", "Cookies work; **custom headers do not** in the native API", "Cookies work; no custom headers on the handshake"],
            ["Per-connection cost", "Highest — full request overhead per cycle", "One long-lived HTTP connection", "One long-lived TCP connection, lowest per-message overhead"],
            ["Server complexity", "Trivial", "Low — write to a stream", "Highest — stateful connection registry, heartbeats, backpressure"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The decision rule, stated in one line",
          text: "If the server talks and the client only listens, SSE. If both sides talk with low latency in both directions — chat, collaborative editing, multiplayer, live cursors — WebSocket. If you must support ancient infrastructure that terminates streams, long polling. Choosing WebSocket for a one-way feed means writing and operating a reconnection, resubscription and resync protocol that `EventSource` gives you for nothing.",
        },
        { t: "h", text: "The wire format, which is the whole protocol" },
        {
          t: "code",
          lang: "http",
          caption: "SSE is this simple - and the simplicity is the argument",
          code: `HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no          # critical: stops nginx buffering the stream

retry: 3000

id: 88213
event: stock-delta
data: {"sku":"SKU-1029","storeId":"1421","onHand":42,"delta":-3}

id: 88214
event: stock-delta
data: {"sku":"SKU-7781","storeId":"0912","onHand":0,"delta":-12}

: heartbeat

# Rules worth memorising:
#   - fields are  name: value , records are separated by a BLANK line
#   - a line starting with ":" is a comment - the idiomatic heartbeat
#   - "retry:" sets the client reconnect delay in ms
#   - "id:" is echoed back as the Last-Event-ID header on reconnect
#   - multiple "data:" lines in one record are joined with newlines`,
        },
        {
          t: "p",
          text: "That `id:` field is the feature people miss. When the connection drops, `EventSource` reconnects automatically and sends `Last-Event-ID: 88214`. If your server keeps a short replay buffer keyed by that id, the client resumes exactly where it stopped with no gap and no client-side bookkeeping. Getting the same guarantee over a WebSocket means designing a sequence-number protocol and a resync handshake yourself.",
        },
        { t: "h", text: "The client, and the four things production adds" },
        {
          t: "code",
          lang: "javascript",
          caption: "EventSource with the hardening that real deployments need",
          code: `function subscribeStock({ brand, onDelta, onStatus }) {
  let es = null;
  let watchdog = null;
  let closed = false;

  const HEARTBEAT_TIMEOUT = 45000;   // server sends ":heartbeat" every 15s

  function armWatchdog() {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      // Silent death: TCP still open, no data arriving. EventSource will
      // NOT fire onerror for this, so we force a reconnect ourselves.
      onStatus("stalled");
      es.close();
      connect();
    }, HEARTBEAT_TIMEOUT);
  }

  function connect() {
    if (closed) return;

    // No custom headers in the native API - auth rides on the cookie,
    // and any scoping goes in the query string.
    es = new EventSource("/api/stock/stream?brand=" + encodeURIComponent(brand), {
      withCredentials: true,
    });

    es.onopen = () => { onStatus("live"); armWatchdog(); };

    es.addEventListener("heartbeat", armWatchdog);

    es.addEventListener("stock-delta", (e) => {
      armWatchdog();
      const evt = JSON.parse(e.data);
      onDelta(evt);                  // e.lastEventId is available here
    });

    es.onerror = () => {
      // Browser reconnects on its own using the "retry:" interval.
      // readyState 2 (CLOSED) means it gave up - usually a 4xx.
      onStatus(es.readyState === 2 ? "failed" : "reconnecting");
    };
  }

  connect();
  return () => { closed = true; clearTimeout(watchdog); es && es.close(); };
}`,
        },
        {
          t: "list",
          items: [
            "**Heartbeats and a watchdog.** A stream can die silently — mobile network changes, an idle proxy timeout — with the socket still open and no error event. The only reliable detector is a server comment every 10-15 seconds and a client timer that forces a reconnect when it goes quiet.",
            "**Coalescing on the client.** A Kafka burst can deliver hundreds of deltas in a second. Do not call `setState` per event. Buffer into a `Map` keyed by SKU plus store, and flush once per animation frame or on a 250ms timer. Without this the transport is fine and React is the bottleneck.",
            "**A visible connection state.** `live`, `reconnecting`, `stalled`, `failed`. Users on a warehouse floor need to know whether a stale number is stale, and it is the difference between a dashboard people trust and one they refresh out of superstition.",
            "**Reconciliation on reconnect.** Deltas are only safe if you know you have them all. Either replay from `Last-Event-ID`, or refetch the snapshot on reconnect and apply deltas from that point. Say which one you chose.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The HTTP/1.1 six-connection limit",
          text: "Browsers cap simultaneous HTTP/1.1 connections at roughly six per origin, and an open SSE stream holds one for its entire life. Open a stream in seven tabs and the seventh hangs — along with every other request to that origin. This is the single most common SSE production failure and it is invisible in development with one tab open. Two fixes: serve over HTTP/2, where streams are multiplexed and the limit effectively disappears, or run one `EventSource` in a `SharedWorker` and fan out to tabs via `BroadcastChannel`. Volunteering this is the detail that proves you operated the thing rather than prototyped it.",
        },
        { t: "h", text: "Scaling: where the server-side limits actually are" },
        {
          t: "p",
          text: "Both SSE and WebSocket hold one connection per client, so 12,000 concurrent users means 12,000 open file descriptors regardless of transport. The load-bearing constraint is that these connections are **stateful and sticky**: a Kafka consumer group on instance A cannot push to a client connected to instance B without a shared fan-out layer. That is where the real architecture lives — Redis pub/sub or a Kafka consumer per instance — and it is identical for both transports. Sticky sessions or connection-aware routing at the load balancer follows from the same fact. Rolling deploys drop every connection at once, which is precisely why automatic reconnection with jittered backoff matters: 12,000 clients reconnecting in the same 200ms window is a self-inflicted thundering herd.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Own the answer, then volunteer the trade-off",
          text: "Script it roughly like this. \"Stock events were published to Kafka and the flow was strictly server-to-client — the dashboard never pushed. SSE matched that shape, so we got automatic reconnection with `Last-Event-ID` replay for free, it went straight through the existing nginx and corporate proxies with no upgrade handshake to negotiate, and auth reused the same session cookie as the rest of the platform. We moved from a 15-minute batch refresh to sub-five-second visibility across 1,900 stores.\" Then, unprompted: \"What we gave up is a client-to-server channel, so any write still goes over normal HTTP — which was fine, because writes were not high-frequency. If we had needed live collaborative editing of stock adjustments, I would have moved to WebSockets and accepted owning the reconnection and resync protocol. The two things that bit us were nginx buffering the stream until we set `X-Accel-Buffering: no`, and the six-connection limit on HTTP/1.1 when users opened multiple tabs.\" Naming what bit you is what makes the whole story credible.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Transport follows data shape: one-way is SSE, bidirectional is WebSocket, hostile infrastructure is long polling.",
            "`Last-Event-ID` replay and automatic reconnection are the concrete things SSE gives you and WebSocket makes you build.",
            "Streams die silently. Heartbeat plus client watchdog, or you will ship a dashboard that quietly stops updating.",
            "Coalesce bursts before they reach state. The transport is rarely the bottleneck; per-event renders are.",
            "Fan-out across instances is the real scaling problem, and it is the same problem for both transports.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Walk through the rendering pipeline from HTML bytes to pixels, naming which stages a change to `width`, to `background-color`, and to `transform` each invalidate.",
    "Explain why animating `left` janks and animating `transform` does not, in terms of which pipeline stages run per frame.",
    "Explain layout thrashing: what forces a synchronous layout, why a read-write loop is O(n) reflows, and how the read/write split fixes it.",
    "Explain the three event phases and the precise difference between `preventDefault`, `stopPropagation` and `stopImmediatePropagation`.",
    "Explain event delegation, why it is memory-efficient at 50,000 rows, and how React's synthetic event system uses the same idea.",
    "Explain head-of-line blocking at both the application layer and the TCP layer, and what HTTP/2 and HTTP/3 each solved.",
    "Argue for or against bundling everything into one file, given an HTTP/2 origin. Reference caching granularity and compression.",
    "State exactly what makes a cross-origin request 'simple', and therefore what triggers a preflight in a normal SPA.",
    "Walk through debugging a CORS error you have never seen before, in the order you would actually check things.",
    "Explain why `Access-Control-Allow-Origin: *` cannot be used with credentialed requests.",
    "Name each of `HttpOnly`, `Secure` and `SameSite` and the specific attack each one defends against.",
    "Compare server-side sessions with JWTs on revocation, scaling and statelessness, then describe the refresh-rotation compromise.",
    "Distinguish stored, reflected and DOM-based XSS, and explain why a framework protects you from some and not others.",
    "Explain what a strict nonce-based CSP does to an injected script tag, and why `unsafe-inline` defeats the point.",
    "Explain why a JSON-only SPA is not automatically safe from CSRF, and name two configuration changes that would reintroduce it.",
    "Explain PKCE: what the verifier and challenge are, and precisely which attack it prevents.",
    "Defend a token-storage decision for an SPA, arguing both sides of localStorage versus HttpOnly cookies before landing.",
    "Compare SSE, WebSocket and long polling on direction, reconnection, proxy compatibility and auth, then justify SSE for a Kafka-fed dashboard.",
    "Explain how `Last-Event-ID` gives gap-free resumption, and what you would have to build to get the same guarantee over WebSocket.",
    "Explain the six-connection-per-origin limit and how it breaks a multi-tab SSE deployment, with two fixes.",
  ],

  math: [
    {
      title: "Frame budget and pipeline cost",
      formula: "60fps => 16.7ms/frame · layout+paint ~ expensive · composite ~ free · long task > 50ms",
      note: "Quote these when discussing jank. A change to geometry costs style+layout+paint+composite; a change to colour skips layout; a change to transform or opacity is composite-only. This ordering is the whole of frontend performance intuition.",
    },
    {
      title: "Compositor-only animation rule",
      formula: "animate: transform, opacity  //  never: left, top, width, height, margin",
      note: "Add `will-change: transform` to promote a layer BEFORE the animation starts, and remove it after — a permanent will-change leaks GPU memory and can slow the page down. Use `translate3d(x,0,0)` if you need to force promotion on older engines.",
    },
    {
      title: "Read/write batching against layout thrash",
      formula: "phase 1: read all geometry -> phase 2: write all styles  (never interleave)",
      note: "Forcing properties: offsetTop/Height, clientWidth, scrollTop, getBoundingClientRect, getComputedStyle. Interleaving them with writes gives one reflow per iteration. `requestAnimationFrame` is the natural place for the write phase.",
    },
    {
      title: "Event delegation skeleton",
      formula: "container.addEventListener(type, e => { const el = e.target.closest(sel); if (el && container.contains(el)) handle(el.dataset); })",
      note: "The `closest` plus `contains` pair is the correct guard — closest alone can walk out of the container in portalled DOM. Add `{ passive: true }` for wheel and touch listeners so scrolling is not blocked on your handler.",
    },
    {
      title: "CORS preflight trigger rule",
      formula: "simple iff method in {GET,HEAD,POST} AND safelisted headers only AND Content-Type in {text/plain, multipart/form-data, application/x-www-form-urlencoded}",
      note: "Break any clause and you get an OPTIONS request. Content-Type: application/json breaks it, so effectively every real API call preflights. Cache them with Access-Control-Max-Age; expose custom response headers with Access-Control-Expose-Headers.",
    },
    {
      title: "Cache-Control recipes",
      formula: "hashed assets: public, max-age=31536000, immutable · HTML shell: no-cache · API: private, max-age=0, must-revalidate · never: no-store",
      note: "no-cache means revalidate, no-store means do not keep. `stale-while-revalidate=600` serves the cached copy instantly and refreshes behind it — the best default for slow-changing reference data.",
    },
    {
      title: "Session cookie flags",
      formula: "Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=…",
      note: "HttpOnly defeats XSS exfiltration, Secure defeats wire interception, SameSite defeats most CSRF. SameSite=None is only legal with Secure and should make you justify the cross-site requirement out loud.",
    },
    {
      title: "Strict CSP starting point",
      formula: "Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}' 'strict-dynamic'; object-src 'none'; base-uri 'none'; report-to csp-endpoint",
      note: "Per-response nonce means an injected script tag cannot execute. `strict-dynamic` lets nonce'd scripts load their own dependencies, which is what makes this workable with a bundler. Ship in Report-Only first and read the violations before enforcing.",
    },
    {
      title: "SPA token storage decision",
      formula: "access token -> in-memory variable · refresh token -> HttpOnly; Secure; SameSite; Path=/auth · silent refresh on load",
      note: "Costs one refresh round trip per page load, and buys you a page where no XSS can read a bearer token off disk. State the alternative and its cost too — the interviewer is testing whether you know it is a trade-off.",
    },
    {
      title: "SSE endpoint contract",
      formula: "Content-Type: text/event-stream · Cache-Control: no-cache · Connection: keep-alive · X-Accel-Buffering: no",
      note: "Miss the last one behind nginx and the stream buffers until it is useless — events arrive in batches, or not at all. Record format is `field: value` lines terminated by a blank line; a line starting with ':' is a comment and is the idiomatic heartbeat.",
    },
    {
      title: "SSE liveness and resume budget",
      formula: "server heartbeat every 15s · client watchdog 45s -> force reconnect · retry: 3000 + jitter · replay from Last-Event-ID",
      note: "EventSource does not fire onerror when a stream dies silently, so the watchdog is not optional. Add jitter to reconnect delay or a rolling deploy makes 12,000 clients reconnect in the same instant.",
    },
    {
      title: "Real-time transport decision rule",
      formula: "one-way server->client ? SSE : (low-latency both ways ? WebSocket : long polling)",
      note: "Then check the constraints: HTTP/1.1 caps you at ~6 connections per origin, custom headers are impossible on native EventSource, and cross-instance fan-out via Redis or Kafka is required either way. Coalesce bursts per animation frame before they hit state.",
    },
  ],

  practice: [
    { type: "math", q: "Take a 5,000-row table that measures each row's height and then sets it. Rewrite it as a batched read phase and write phase, and measure the reflow count in DevTools Performance before and after. 25 minutes." },
    { type: "math", q: "Build the same slide-in panel twice — once animating `left`, once animating `transform: translateX` — then record both with CPU throttled 4x and compare dropped frames. 20 minutes." },
    { type: "math", q: "Implement event delegation for a table with row-level actions, using `closest` plus a `contains` guard, and handle clicks that land on empty space. 15 minutes." },
    { type: "math", q: "Write a minimal Express or Node SSE endpoint that streams incrementing events with ids and a 15-second heartbeat comment, then consume it with EventSource. 30 minutes." },
    { type: "math", q: "Extend that endpoint with a 100-event replay buffer, then honour `Last-Event-ID` on reconnect. Kill the connection mid-stream and prove there is no gap. 30 minutes." },
    { type: "math", q: "Add a client-side watchdog that forces a reconnect when heartbeats stop, then test it by pausing the server process rather than closing the socket. 20 minutes." },
    { type: "math", q: "Build a burst coalescer: buffer incoming SSE deltas into a Map keyed by SKU and flush once per animation frame. Fire 500 events in 200ms and count renders with and without it. 25 minutes." },
    { type: "math", q: "Run one EventSource inside a SharedWorker and fan events out to three tabs over BroadcastChannel. 40 minutes." },
    { type: "math", q: "Deliberately break CORS four ways — wrong origin, missing Allow-Headers, wildcard with credentials, missing Expose-Headers — and write down the exact console message for each. 25 minutes." },
    { type: "math", q: "Build a login flow with an in-memory access token plus an HttpOnly refresh cookie, including silent refresh on page load and a 401 retry interceptor. 45 minutes." },
    { type: "math", q: "Write a stored-XSS payload into a text field rendered with `dangerouslySetInnerHTML`, then block it twice: once with DOMPurify, once with a nonce-based CSP. 30 minutes." },
    { type: "math", q: "Register a service worker with a cache-first rule over `index.html`, deploy a change, and experience the stale-worker trap. Then write the kill switch that recovers it. 35 minutes." },
    { type: "theory", q: "Whiteboard the rendering pipeline and annotate which stages three different CSS changes each trigger. Time yourself at three minutes." },
    { type: "theory", q: "Defend SSE over WebSocket for your Kafka-fed stock feed, then immediately state what you gave up and what you would change if writes had to be real-time." },
    { type: "theory", q: "A colleague says 'we are a JSON API, CSRF does not apply to us'. Write the reply, including the two configuration changes that would make them wrong." },
    { type: "theory", q: "Explain to a backend engineer why their `Access-Control-Allow-Origin: *` will not work now that the frontend sends cookies, without using the word CORS more than twice." },
    { type: "theory", q: "You are asked where to store JWTs in a new SPA. Give the answer, both counter-arguments, and the reason CSP matters more than the storage choice." },
  ],

  resources: [
    { label: "web.dev — 'How browsers work' / rendering performance. The clearest account of what each pipeline stage costs and what invalidates it.", url: "https://web.dev/articles/rendering-performance", kind: "blog" },
    { label: "MDN — Cross-Origin Resource Sharing. Read the 'Preflighted requests' and 'Requests with credentials' sections properly once and you will never guess at a CORS error again.", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", kind: "docs" },
    { label: "MDN — Using server-sent events, plus the EventSource reference. The `Last-Event-ID` and `retry` behaviour is documented here and almost nobody has read it.", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events", kind: "docs" },
    { label: "WHATWG HTML spec — the event stream format. Two pages, and it settles every argument about field parsing and reconnection semantics.", url: "https://html.spec.whatwg.org/multipage/server-sent-events.html", kind: "docs" },
    { label: "OWASP Cheat Sheet Series — the XSS Prevention, CSRF Prevention and Session Management sheets are the industry reference and read like a senior engineer's checklist.", url: "https://cheatsheetseries.owasp.org/", kind: "docs" },
    { label: "web.dev — 'Strict CSP'. Explains nonce plus strict-dynamic and why the allowlist approach failed in practice.", url: "https://web.dev/articles/strict-csp", kind: "blog" },
    { label: "IETF — OAuth 2.0 for Browser-Based Applications. The actual normative guidance on PKCE and token storage in SPAs, not a blog opinion.", url: "https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps", kind: "paper" },
    { label: "Cloudflare Learning — HTTP/3 and QUIC. The best plain-English explanation of transport-layer head-of-line blocking.", url: "https://www.cloudflare.com/learning/performance/what-is-http3/", kind: "blog" },
    { label: "'HTTP/2 in Action' — Barry Pollard. Read chapters 1-4 if you want to be genuinely unshakeable on multiplexing and bundling strategy.", url: "https://www.manning.com/books/http2-in-action", kind: "book" },
    { label: "Google — Offline Cookbook. The canonical catalogue of service worker caching strategies, including when each one is wrong.", url: "https://web.dev/articles/offline-cookbook", kind: "blog" },
    { label: "web.dev — Storage for the web. Quota behaviour, eviction rules and a defensible localStorage-versus-IndexedDB decision.", url: "https://web.dev/articles/storage-for-the-web", kind: "blog" },
  ],
};

export default p06;
