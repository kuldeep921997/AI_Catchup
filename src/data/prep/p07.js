const p07 = {
  id: "p07",
  week: 7,
  hours: 8,
  title: "CSS Architecture and Accessibility",
  tag: "Platform",
  why: "This is the silent rejection reason for senior frontend candidates. Nobody says \"we passed because his CSS was guesswork\" — they say \"not quite senior enough\", and the signal they read was an inability to reason about the cascade or name a WCAG threshold. Accessibility in particular is now a hiring filter at retail GCCs like Walmart and Target, who audit for it because they are legally exposed, so it moves from nice-to-have to interview criterion.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "Layout you can reason about: Flexbox and Grid",
      summary:
        "The sizing algorithms behind flex-basis and grid tracks, grid-template-areas for real page layout, and the auto-fit versus auto-fill distinction that comes up constantly.",
      blocks: [
        {
          t: "p",
          text: "Most engineers with seven years of experience write CSS by trial and error and get away with it, because the feedback loop is fast enough to hide the guessing. An interviewer asking you to build a layout on a whiteboard removes that loop, and guessing becomes visible immediately. The fix is knowing the two sizing algorithms rather than the property names.",
        },
        { t: "h", text: "Flexbox: one axis, and a three-part sizing rule" },
        {
          t: "p",
          text: "Flexbox distributes space along a **main axis**. Everything confusing about it reduces to one algorithm: the browser computes each item's **hypothetical size** from `flex-basis`, sums them, compares against the container, and then distributes the difference using `flex-grow` (if there is free space) or `flex-shrink` (if there is a deficit). `flex: 1` is shorthand for `1 1 0%` — basis zero, so items share space in proportion to their grow factors, ignoring content width.",
        },
        {
          t: "code",
          lang: "css",
          caption: "The four flex shorthands you should be able to explain cold",
          code: `.a { flex: 1; }        /* 1 1 0%    - equal shares, content ignored */
.b { flex: auto; }     /* 1 1 auto  - grow from content size, keeps ratios */
.c { flex: none; }     /* 0 0 auto  - fixed at content size, never flexes */
.d { flex: 0 1 240px; } /* start at 240px, may shrink, never grows */

/* The overflow bug everyone hits: a flex item's min-width defaults to
   auto, which means "at least my content's minimum size". A long
   unbroken string or a nested overflow container will therefore blow
   the layout out. */
.truncating-cell {
  flex: 1;
  min-width: 0;             /* the fix. required, not optional */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Use gap, not margins. It does not apply outside the first/last item
   and it works identically in flex and grid. */
.toolbar { display: flex; align-items: center; gap: 12px; }`,
        },
        {
          t: "note",
          tone: "warn",
          title: "`min-width: 0` is the answer to half of all flex bugs",
          text: "\"My text will not truncate\", \"my flex item is wider than its container\", \"my chart overflows its panel\" — all the same bug. The initial `min-width: auto` on flex items means an item refuses to shrink below its content's minimum. You must opt out explicitly. Knowing this one line, and why it is needed, is worth more than memorising every alignment property.",
        },
        { t: "h", text: "Grid: two axes, and named areas for real layouts" },
        {
          t: "code",
          lang: "css",
          caption: "grid-template-areas makes the layout readable in the stylesheet",
          code: `.app {
  display: grid;
  min-height: 100dvh;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 56px 1fr 40px;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar status";
}

.app > .sidebar { grid-area: sidebar; }
.app > .header  { grid-area: header; }
.app > .main    { grid-area: main; min-height: 0; }   /* same min-size trap */
.app > .status  { grid-area: status; }

/* Collapse to a single column below the breakpoint - the whole
   responsive change is one redeclaration of the picture. */
@media (max-width: 900px) {
  .app {
    grid-template-columns: 1fr;
    grid-template-rows: 56px auto 1fr 40px;
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "status";
  }
}`,
        },
        {
          t: "p",
          text: "`1fr` is not \"one fraction of the container\" — it is one fraction of the **remaining free space** after fixed tracks and content minimums are satisfied. That distinction is why a `1fr` track containing a wide table refuses to shrink: `fr` has an implicit `auto` minimum. `minmax(0, 1fr)` is the fix, and it is the grid equivalent of `min-width: 0`.",
        },
        {
          t: "table",
          head: ["Track function", "Behaviour", "Use it for"],
          rows: [
            ["`minmax(200px, 1fr)`", "Never below 200px, otherwise share free space", "Responsive cards with a floor"],
            ["`minmax(0, 1fr)`", "Allowed to shrink to nothing", "Any track holding content that must truncate or scroll"],
            ["`repeat(auto-fill, minmax(220px, 1fr))`", "Creates as many tracks as fit, **keeping empty ones**", "Fixed grid rhythm — three items should still sit in the first three of five columns"],
            ["`repeat(auto-fit, minmax(220px, 1fr))`", "Creates as many as fit, then **collapses empty tracks** so the rest stretch", "Card galleries — three items expand to fill the row"],
            ["`fit-content(320px)`", "Content size, capped at 320px", "Label columns that should not run away"],
            ["`subgrid`", "Child inherits the parent's track lines", "Aligning fields across sibling cards without fixed heights"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "auto-fit versus auto-fill in one sentence",
          text: "Both compute how many tracks fit. `auto-fill` keeps the empty ones, so your items stay at their natural width and the row has gaps at the end; `auto-fit` collapses the empty ones, so your items stretch to fill the row. If you have four cards in a container wide enough for six: `auto-fill` gives four normal cards and two blank columns, `auto-fit` gives four wide cards. It is asked because the difference is invisible until the container is wider than the content.",
        },
        { t: "h", text: "Choosing between them, and why it is not a taste question" },
        {
          t: "list",
          items: [
            "**Flexbox** for one-dimensional distribution where content size should drive layout: toolbars, button rows, form fields, anything with an unknown number of items.",
            "**Grid** for two-dimensional structure where the layout should drive content: page chrome, dashboards, card galleries, data tables, form layouts with aligned labels.",
            "They compose. A grid page shell whose cells contain flex rows is the normal architecture, not a compromise.",
            "`place-items: center` on a grid is the shortest honest centring in CSS. Use it and stop reciting the old flex incantation.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "Your 50+ component shared library is the natural place to talk about layout primitives. The senior point is that you did not let 50 components each invent their own spacing: you shipped `Stack`, `Cluster` and `Grid` primitives with tokenised `gap` values, so spacing became a prop rather than a per-component margin decision. That is how you removed roughly 30% of duplicated UI code — and it is also why the layout stayed consistent across six retail brands with different theming.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "`flex: 1` means basis zero. `flex: auto` means basis content. Know which one you meant.",
            "`min-width: 0` on flex items and `minmax(0, 1fr)` on grid tracks fix the same class of overflow bug.",
            "`fr` divides free space, not total space, and carries an implicit `auto` minimum.",
            "`auto-fill` preserves empty tracks; `auto-fit` collapses them.",
            "`grid-template-areas` turns a layout into a diagram in the stylesheet, and turns a responsive change into one redeclaration.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 18,
      title: "The cascade, specificity, layers and stacking contexts",
      summary:
        "Why your selector loses, why `!important` is a design failure rather than a tool, and the real reason z-index \"isn't working\".",
      blocks: [
        {
          t: "p",
          text: "\"Why is this style not applying?\" is a question with a deterministic answer, and a senior engineer should be able to reach it without opening DevTools. The cascade resolves conflicts in a fixed order, and specificity is only one step of it — which is the part most people never learn.",
        },
        { t: "h", text: "The cascade, in the order it actually runs" },
        {
          t: "list",
          ordered: true,
          items: [
            "**Origin and importance** — user-agent, then user, then author styles, with `!important` declarations inverting the order within each origin. Transitions and animations sit above everything.",
            "**Cascade layers** — `@layer` order, declared once, and lower layers lose regardless of selector strength.",
            "**Specificity** — the (id, class, type) triple, compared left to right.",
            "**Source order** — the last matching declaration wins. This is the tie-breaker, not the primary rule.",
          ],
        },
        {
          t: "table",
          head: ["Selector", "Specificity (id, class, type)", "Note"],
          rows: [
            ["`*`, `:where(...)`", "0, 0, 0", "`:where()` is always zero, whatever is inside it"],
            ["`div`, `::before`", "0, 0, 1", "Type and pseudo-element"],
            ["`.card`, `[data-open]`, `:hover`", "0, 1, 0", "Class, attribute and pseudo-class all count the same"],
            ["`#header`", "1, 0, 0", "One id beats any number of classes"],
            ["`:is(#a, .b, p)`", "1, 0, 0", "`:is()` takes the **highest** specificity of its arguments"],
            ["`.a.b.c`", "0, 3, 0", "Still loses to a single id"],
            ["inline `style=\"\"`", "Above all selectors", "Only `!important` beats it"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "`:where()` versus `:is()` — the whole point",
          text: "They match identically. They differ only in specificity: `:is()` takes the highest specificity among its arguments, `:where()` contributes **zero**. That makes `:where()` the correct tool for library and reset styles, because a consumer can override your rule with a plain single class instead of fighting it. If you write `:where(.btn) svg { fill: currentColor; }` in a design system, any application-level rule wins cleanly. Getting this distinction right is a strong signal that you have built a component library, which you have.",
        },
        { t: "h", text: "Cascade layers, and why they end specificity wars" },
        {
          t: "code",
          lang: "css",
          caption: "Declare the priority order once, at the top of the entry stylesheet",
          code: `/* Order is fixed here and nothing below can change it.
   Later layers win, no matter how weak their selectors. */
@layer reset, tokens, base, components, utilities, overrides;

@layer components {
  /* Even a heavy selector here... */
  #app .data-table tbody tr.selected td { background: #eef; }
}

@layer utilities {
  /* ...loses to this single class, because the layer is later. */
  .bg-transparent { background: transparent; }
}

/* Unlayered styles beat ALL layers - a common surprise, and a useful
   escape hatch for genuinely app-specific one-offs. */
.late-patch { background: gold; }

/* Reverse rule for !important: within important declarations, EARLIER
   layers win. Worth knowing, worth never relying on. */`,
        },
        {
          t: "p",
          text: "This is the structural answer to `!important`. `!important` is a declaration that you have lost control of your cascade: it wins locally, cannot be overridden except by another `!important`, and every future override becomes an escalation. The legitimate uses are vanishingly rare — utility classes whose entire contract is \"this always wins\", and patching third-party CSS you cannot edit. Everything else means the layer order or the selector strategy is wrong.",
        },
        { t: "h", text: "Stacking contexts: the real reason z-index fails" },
        {
          t: "p",
          text: "`z-index` only compares siblings **within the same stacking context**. A child cannot escape its parent's context no matter how large its z-index — an element with `z-index: 9999` inside a parent with `z-index: 1` will still sit below a sibling of that parent with `z-index: 2`. This is the mechanism behind almost every \"my dropdown is behind the header\" bug, and the reason the fix is a portal rather than a bigger number.",
        },
        {
          t: "list",
          items: [
            "The **root element** always forms one.",
            "`position` other than `static` **with** a `z-index` other than `auto`.",
            "`position: fixed` or `sticky` — always, z-index or not.",
            "`opacity` less than 1. This is the sneaky one: a fade-in wrapper silently traps every descendant.",
            "`transform`, `filter`, `backdrop-filter`, `perspective`, `clip-path`, `mask` — any non-`none` value.",
            "`will-change` naming any of the above, `isolation: isolate`, `contain: paint`, and flex or grid children with a z-index.",
          ],
        },
        {
          t: "code",
          lang: "css",
          caption: "Two tools: isolate deliberately, or portal out entirely",
          code: `/* Deliberate containment: nothing inside this card can ever paint
   over the app header, whatever z-index it invents. */
.card { isolation: isolate; }

/* A named z-index scale, so nobody has to guess or escalate. */
:root {
  --z-base: 0;
  --z-sticky-header: 100;
  --z-dropdown: 200;
  --z-modal: 300;
  --z-toast: 400;
}
.dropdown { z-index: var(--z-dropdown); }

/* For overlays, the correct fix is not a number - it is rendering
   outside the trapping ancestor. In React: createPortal(node,
   document.body). Or use the top layer, which sits above every
   stacking context by definition: */
dialog::backdrop { background: rgb(0 0 0 / 0.5); }
/* <dialog> opened with showModal() renders in the top layer and is
   immune to ancestor stacking contexts entirely. */`,
        },
        {
          t: "note",
          tone: "interview",
          title: "The answer that separates you",
          text: "When asked \"z-index is not working, what do you do?\", the mid-level answer is \"increase it\" or \"check position: relative\". The senior answer names the mechanism: \"I would find the nearest ancestor that creates a stacking context — often an `opacity` or `transform` on an animation wrapper — because the child is confined to it. Then either portal the overlay to the body, use the top layer via `<dialog>`, or add `isolation: isolate` deliberately so the containment is intentional rather than accidental.\" Same question, completely different read on your seniority. As someone doing 30 code reviews a sprint, you can also say what you enforce: a named z-index scale in tokens, and no raw numbers in component CSS.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "The cascade checks origin and importance, then layers, then specificity, then source order. Specificity is step three, not step one.",
            "`:is()` inherits its strongest argument's specificity; `:where()` is always zero and is the right default for library CSS.",
            "`@layer` fixes priority structurally. Unlayered styles beat all layers.",
            "`!important` is an admission, not a technique. Utility classes and third-party patches only.",
            "z-index is scoped to a stacking context. `opacity` and `transform` create them silently; portals and the top layer are the real fixes.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 20,
      title: "Responsive strategy, styling architecture and animation performance",
      summary:
        "Container queries and fluid type, a defensible position on CSS Modules versus Tailwind versus CSS-in-JS, and FLIP plus containment for long lists.",
      blocks: [
        {
          t: "p",
          text: "Two of the most common senior CSS questions are \"how do you approach responsive design?\" and \"what styling solution would you pick and why?\". Both are testing whether you have a position you can defend under pressure, not whether you know the syntax. Have the position, and have the trade-offs you accepted.",
        },
        { t: "h", text: "Mobile-first, container queries, and fluid type" },
        {
          t: "code",
          lang: "css",
          caption: "Three techniques that eliminate most breakpoints",
          code: `/* 1. Mobile-first: the base rule is the smallest layout, and every
      media query only ADDS. min-width queries never fight each other,
      whereas overlapping max-width queries always eventually do. */
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 640px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); } }

/* 2. Container queries: the component responds to ITS OWN width, not
      the viewport. This is what makes a component library genuinely
      reusable - the same card works in a sidebar and in a main column
      with no props and no context. */
.card-host { container-type: inline-size; container-name: card; }

@container card (min-width: 420px) {
  .card { grid-template-columns: 96px 1fr; align-items: start; }
  .card .meta { display: block; }
}

/* 3. clamp() for fluid type - no breakpoints at all. */
h1 { font-size: clamp(1.75rem, 1.25rem + 2.5vw, 3rem); }
/*                    ^min       ^preferred          ^max
   Always include a rem term in the middle so the value still scales
   when the user increases their browser font size. A pure vw
   preferred value breaks zoom accessibility - WCAG 1.4.4 wants 200%
   zoom without loss of content. */

.section { padding-block: clamp(2rem, 5vw, 6rem); }`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Container queries change the architecture, not just the syntax",
          text: "Media queries make a component's appearance depend on the viewport, which means the component must know where it will be used — that is why library components end up with `variant=\"compact\"` props. Container queries invert it: the component measures its own inline size and adapts. For a 50-component library serving six brands and multiple layouts, that is the difference between one component and four variants of it. Say this and you are talking about component API design, not CSS.",
        },
        { t: "h", text: "Styling approaches, with an actual position" },
        {
          t: "table",
          head: ["Approach", "Runtime cost", "Strengths", "What you accept"],
          rows: [
            ["**CSS Modules**", "None — plain CSS, hashed names", "Scoped, zero-runtime, real CSS, trivially cacheable", "No design-token type safety; separate file per component; dynamic values need CSS variables"],
            ["**Tailwind**", "None — build-time", "No naming, no dead CSS, constraint system enforced by default, fast to iterate", "Unreadable class strings in markup; needs `clsx`/`cva` discipline; team must actually learn the scale"],
            ["**CSS-in-JS (styled-components, Emotion)**", "**Runtime** — serialises and injects on render", "Colocation, props-driven styles, dynamic theming", "Bundle weight, runtime cost per render, and genuine friction with React Server Components"],
            ["**vanilla-extract / Panda**", "None — compiled away", "TypeScript-typed tokens and variants, zero runtime, autocomplete on your design system", "Build-step complexity; smaller ecosystem; a learning curve for the team"],
          ],
        },
        {
          t: "p",
          text: "The defensible position: **zero-runtime, with typed tokens.** For a new design system, vanilla-extract or Tailwind with a token-driven config; for an existing codebase, CSS Modules plus custom properties for theming. Runtime CSS-in-JS was the right answer in 2018 and is now hard to justify — it costs bundle size and per-render work to solve a problem that build-time tooling solves for free, and it fights server components. Framing it as \"correct then, superseded now\" shows you track the ecosystem instead of defending a habit.",
        },
        {
          t: "code",
          lang: "css",
          caption: "Custom properties are how you do runtime theming with zero-runtime CSS",
          code: `/* Six retail brands, one stylesheet. The component never knows which
   brand it is in - it only reads tokens. */
:root {
  --brand-primary: #0b5cff;
  --brand-surface: #ffffff;
  --brand-on-surface: #101318;
  --space-2: 8px;
  --space-3: 12px;
  --radius-md: 8px;
}

[data-brand="reliance-trends"] { --brand-primary: #b4123c; }
[data-brand="reliance-smart"]  { --brand-primary: #0a7d3c; }

[data-theme="dark"] {
  --brand-surface: #101318;
  --brand-on-surface: #e8eaed;
}

.button {
  background: var(--brand-primary);
  color: #fff;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

/* Custom properties are inherited and live, so switching a single
   data attribute on <html> retheme the whole tree with no re-render
   and no JavaScript style recalculation per component. */`,
        },
        { t: "h", text: "Animation performance and FLIP" },
        {
          t: "p",
          text: "You cannot transition to or from `height: auto`, and animating layout properties reflows every frame. FLIP sidesteps both by animating a **transform** that fakes a layout change: measure **F**irst, apply the layout change and measure **L**ast, **I**nvert the delta with a transform so it appears unmoved, then **P**lay by removing the transform with a transition. Everything the browser animates is a composite-only transform.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "FLIP by hand, and the one-line modern equivalent",
          code: `function flip(el, mutate) {
  const first = el.getBoundingClientRect();
  mutate();                                    // do the real DOM change
  const last = el.getBoundingClientRect();

  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / last.width;

  el.animate(
    [
      { transform: "translate(" + dx + "px," + dy + "px) scaleX(" + sx + ")" },
      { transform: "none" },
    ],
    { duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)" }
  );
}

// Modern equivalent for many cases - the browser does the FLIP for you:
//   document.startViewTransition(() => mutate());
// and in CSS:  ::view-transition-old(root), ::view-transition-new(root)

// will-change: use it sparingly and remove it after.
el.style.willChange = "transform";
el.addEventListener("transitionend", () => { el.style.willChange = "auto"; },
  { once: true });`,
        },
        {
          t: "note",
          tone: "warn",
          title: "`will-change` is a budget, not a hint you sprinkle",
          text: "It promotes an element to its own compositor layer, which costs GPU memory and creates a stacking context. Applied to every row of a long list it will make the page slower and simultaneously break your z-index. The correct pattern is to add it just before the animation starts — on hover or focus, or in JS — and remove it when the animation ends. Also respect `@media (prefers-reduced-motion: reduce)` and cut transform and opacity animation to near-zero duration; vestibular disorders are real and this is a WCAG 2.3.3 concern, not a preference.",
        },
        { t: "h", text: "Containment for long lists" },
        {
          t: "code",
          lang: "css",
          caption: "Telling the browser where it does not need to look",
          code: `/* contain: content = layout + paint + style containment. The browser
   knows nothing inside this row can affect anything outside it, so a
   change to one row does not invalidate layout for the whole table. */
.table-row {
  contain: content;
}

/* content-visibility: auto skips rendering work entirely for
   offscreen elements - style, layout and paint are all deferred.
   contain-intrinsic-size supplies a placeholder height so the
   scrollbar does not jump as elements are realised. */
.report-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 480px;
}

/* Caveat worth saying out loud: skipped content is not laid out, so
   in-page find (Ctrl+F) and anchor navigation behave differently, and
   it is not a substitute for windowing when you have 50,000 rows -
   the DOM nodes still exist. Windowing removes the nodes; containment
   makes the nodes you keep cheaper. */`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "This is the CSS half of your 8s to 3s dashboard story, and it pairs with the windowing you did in JavaScript. The complete answer has two layers: windowing so 50,000 rows become the ~40 that are visible, and containment plus compositor-only animation so the ones you do render are cheap. Then the honest note — you measured, you did not guess: Performance panel for dropped frames, and the layout and paint timings before and after. Interviewers trust \"I measured it\" far more than a list of techniques.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Mobile-first with `min-width` queries only. Overlapping `max-width` queries eventually contradict each other.",
            "Container queries let a component adapt to its own width — that is a component API improvement, not a CSS trick.",
            "`clamp()` needs a rem term in its preferred value or you break 200% zoom.",
            "Zero-runtime styling with typed tokens is the current defensible default; custom properties give you live theming for free.",
            "FLIP animates a transform to fake a layout change. `will-change` is a budget you spend and release.",
            "Containment makes rendered nodes cheaper; windowing removes nodes. You usually want both.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 22,
      title: "Accessibility as an engineering concern",
      summary:
        "Semantics as the cheapest win, the WCAG 2.2 AA numbers to quote, the first rule of ARIA, and the keyboard patterns — focus traps, roving tabindex, live regions — that real interviews probe.",
      blocks: [
        {
          t: "p",
          text: "Accessibility is where senior frontend interviews at retail GCCs quietly diverge from everywhere else. Walmart and Target are large US retailers with genuine ADA and Section 508 exposure; they run audits, they have remediation backlogs, and they screen for engineers who will not add to them. A platform with 12,000 daily internal users across 1,900 stores has the same obligation for a plainer reason: some of those employees use screen readers or cannot use a mouse, and if your dashboard is keyboard-hostile you have made their job impossible. Treat this as engineering, not compliance theatre.",
        },
        { t: "h", text: "Semantic HTML is the cheapest accessibility you will ever ship" },
        {
          t: "p",
          text: "A native `<button>` arrives with a role, keyboard activation on both Enter and Space, focusability, a focus ring, and disabled-state semantics. A `<div onClick>` has none of those, and reproducing them takes five lines you will get subtly wrong. Landmarks — `header`, `nav`, `main`, `aside`, `footer` — let screen reader users jump between regions instead of reading linearly, and heading structure gives them an outline. Both are free if you write the right element.",
        },
        {
          t: "code",
          lang: "html",
          caption: "The same UI, twice. One of these needs no ARIA at all.",
          code: `<!-- Reimplementing a button badly. Not focusable, no keyboard
     activation, no role, no disabled semantics. -->
<div class="btn" onclick="save()">Save</div>

<!-- What it actually takes to fix the div version -->
<div class="btn" role="button" tabindex="0"
     aria-disabled="false"
     onclick="save()"
     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();save()}">
  Save
</div>

<!-- Or just... -->
<button type="button" onclick="save()">Save</button>

<!-- Landmarks and headings: navigable structure for free -->
<a class="skip-link" href="#main">Skip to main content</a>
<header>
  <nav aria-label="Primary">...</nav>
</header>
<main id="main">
  <h1>Stock on hand</h1>
  <section aria-labelledby="low-stock-h">
    <h2 id="low-stock-h">Low stock alerts</h2>
    ...
  </section>
</main>

<style>
  /* A skip link must be reachable but out of the way until focused. */
  .skip-link {
    position: absolute; left: -9999px;
  }
  .skip-link:focus {
    left: 8px; top: 8px; position: fixed; z-index: 9999;
    background: #fff; padding: 8px 12px;
  }
</style>`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Never remove the focus ring",
          text: "`outline: none` with no replacement is the single most common accessibility failure in professional codebases, and it makes keyboard navigation literally impossible — the user cannot see where they are. If the default ring is ugly, replace it: `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }`. `:focus-visible` applies on keyboard focus but not on mouse click, which is exactly the behaviour designers were reaching for when they deleted the outline in the first place. WCAG 2.2 also added 2.4.11 Focus Not Obscured — a sticky header that covers the focused element is now a failure.",
        },
        { t: "h", text: "The WCAG 2.2 AA numbers to have on hand" },
        {
          t: "table",
          head: ["Criterion", "Requirement", "Why it gets missed"],
          rows: [
            ["1.4.3 Contrast (Minimum)", "**4.5:1** for body text; **3:1** for large text (18.66px bold or 24px+)", "Grey-on-white placeholder and helper text is almost always below it"],
            ["1.4.11 Non-text Contrast", "**3:1** for UI component boundaries, icons and focus indicators", "Subtle 1px input borders and light icon buttons fail routinely"],
            ["1.4.4 Resize Text", "Usable at **200% zoom** with no loss of content", "Fixed pixel heights and pure `vw` font sizing break this"],
            ["2.5.8 Target Size (Minimum)", "**24x24 CSS px** minimum target, or adequate spacing", "Dense data-table icon buttons — exactly your use case"],
            ["2.4.7 / 2.4.11-13 Focus", "Focus visible, not obscured, and not vanishingly small", "Sticky headers and `outline: none`"],
            ["4.1.2 Name, Role, Value", "Every control exposes an accessible name and state", "Icon-only buttons with no `aria-label`"],
            ["1.3.1 Info and Relationships", "Structure conveyed programmatically, not just visually", "Layout tables, `<div>` headings, unlabelled form fields"],
          ],
        },
        {
          t: "p",
          text: "Contrast ratio is computed from relative luminance, ranges from 1:1 to 21:1, and you should not be estimating it — the DevTools colour picker shows the ratio and the pass/fail directly, and Chrome's Rendering panel can emulate reduced motion and forced colours. Knowing the two numbers **4.5:1 and 3:1** and which applies to what puts you ahead of the large majority of candidates.",
        },
        { t: "h", text: "ARIA, and the first rule of ARIA" },
        {
          t: "p",
          text: "**No ARIA is better than bad ARIA.** The first rule of the W3C ARIA Authoring Practices Guide is: if you can use a native HTML element or attribute instead of repurposing an element and adding ARIA, do that. The reason is that ARIA changes only what is *announced* — it adds no behaviour whatsoever. `role=\"button\"` does not make an element focusable or keyboard-operable; it just tells a screen reader to call it a button, and now you have promised behaviour you have not implemented. That is worse than the unstyled div, because the user is now misled.",
        },
        {
          t: "code",
          lang: "html",
          caption: "The accessible name computation, and where each source wins",
          code: `<!-- Name resolution order (simplified but interview-accurate):
     aria-labelledby > aria-label > native label/alt/legend >
     text content > title. First match wins. -->

<!-- Icon-only button: no text content, so it MUST be labelled. -->
<button aria-label="Adjust stock for SKU-1029">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- aria-hidden on the svg matters: without it some engines announce
     the icon's own title and you get a doubled or nonsense name. -->

<!-- Prefer a real label over aria-label: clicking it focuses the
     input, which aria-label does not give you. -->
<label for="sku">SKU</label>
<input id="sku" name="sku"
       aria-describedby="sku-hint sku-err"
       aria-invalid="true" />
<p id="sku-hint">Format: SKU-0000</p>
<p id="sku-err" role="alert">SKU not found in this store</p>

<!-- State goes in ARIA, appearance goes in CSS. Do not fake state. -->
<button aria-expanded="false" aria-controls="filters">Filters</button>
<div id="filters" hidden>...</div>

<!-- Decorative image: empty alt, NOT a missing alt. -->
<img src="divider.svg" alt="" />`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The accessibility tree is a real thing you can inspect",
          text: "The browser builds a parallel tree from your DOM: each node reduced to a role, an accessible name, a value and a set of states. That tree, not your DOM, is what a screen reader reads. Open DevTools, Elements, Accessibility pane, and look at your own components — you will find icon buttons named \"button\", inputs with no name, and headings that are divs. Being able to say \"I check the computed accessible name in the accessibility pane\" is a concrete, credible answer to \"how do you test accessibility?\"",
        },
        { t: "h", text: "Keyboard interaction: the three patterns you will be asked to build" },
        {
          t: "code",
          lang: "javascript",
          caption: "Focus trap for a modal - the standard interview build",
          code: `const FOCUSABLE = [
  "a[href]", "button:not([disabled])", "input:not([disabled])",
  "select:not([disabled])", "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function trapFocus(dialog, { onClose }) {
  const opener = document.activeElement;          // remember where we came from

  const nodes = () => [...dialog.querySelectorAll(FOCUSABLE)]
    .filter((el) => el.offsetParent !== null);    // skip hidden

  // 1. Move focus IN, to the dialog or its first control.
  (nodes()[0] || dialog).focus();

  function onKeyDown(e) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key !== "Tab") return;

    const list = nodes();
    if (list.length === 0) { e.preventDefault(); return; }
    const first = list[0], last = list[list.length - 1];

    // 2. Cycle: Tab off the end wraps to the start, and vice versa.
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  dialog.addEventListener("keydown", onKeyDown);

  return function release() {
    dialog.removeEventListener("keydown", onKeyDown);
    // 3. Return focus to the opener. Skipping this is the most common
    //    bug - the user is dumped at the top of the document.
    opener && opener.focus();
  };
}

// Also required: aria-modal="true", role="dialog", an accessible name
// via aria-labelledby, and inert or aria-hidden on the background.
// Native <dialog>.showModal() gives you the trap, the top layer, the
// backdrop and Escape handling for free - prefer it.`,
        },
        {
          t: "list",
          items: [
            "**Focus trap (modals, drawers).** Focus moves in on open, cycles within, Escape closes, and focus **returns to the trigger** on close. Background content gets `inert`. Native `<dialog>` with `showModal()` does nearly all of this for you.",
            "**Roving tabindex (menus, toolbars, tabs, trees).** A composite widget is **one** tab stop, not twenty. Exactly one child has `tabindex=\"0\"`, the rest have `-1`, and arrow keys move both the `0` and the focus. Otherwise a user must press Tab thirty times to get past your toolbar.",
            "**Skip links.** First focusable element on the page, jumps to `#main`. Ten lines, and it saves a keyboard user tabbing through your entire navigation on every single page load.",
            "**Escape and Enter conventions.** Escape closes and cancels; Enter submits and activates; Space activates buttons and toggles checkboxes; Home and End jump to the ends of a list. Users expect these without being told.",
          ],
        },
        { t: "h", text: "Live regions: telling users what changed" },
        {
          t: "code",
          lang: "html",
          caption: "Async updates are silent to a screen reader unless you announce them",
          code: `<!-- polite: queued, announced when the user pauses. Default choice. -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">
  42 results for "SKU-1029"
</div>

<!-- assertive: interrupts immediately. Errors and time-critical
     alerts only - overuse makes the app unusable. -->
<div role="alert">Stock adjustment failed. Try again.</div>

<!-- role="status" is an implicit polite live region.
     role="alert"  is an implicit assertive one. -->
<div role="status">Saving...</div>

<!-- The rule people get wrong: the live region container must be in
     the DOM BEFORE the content changes. Mounting a div that already
     contains the message announces nothing, because there was no
     mutation to observe. Render the empty region, then fill it. -->

<style>
  /* Visually hidden but still announced. Do NOT use display:none or
     visibility:hidden - both remove it from the accessibility tree. */
  .visually-hidden {
    position: absolute; width: 1px; height: 1px;
    margin: -1px; padding: 0; overflow: hidden;
    clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap;
  }
</style>`,
        },
        {
          t: "note",
          tone: "interview",
          title: "The honest screen reader note, and how to use it",
          text: "Spend one hour with NVDA on Windows — it is free — or VoiceOver on macOS (Cmd+F5). Navigate one of your own screens with the monitor off. It permanently changes how you build, because you hear the consequences: unnamed buttons announced as \"button\", tables that read as an undifferentiated stream, a filter panel that opens with no announcement, a data grid you cannot escape. In an interview, say it plainly: \"I ran NVDA over our inventory dashboard and found icon-only action buttons with no accessible names and a filter drawer that did not trap or restore focus. I fixed both in the shared component library, so all 50-odd components inherited the fix and roughly 30 teams' worth of screens got it for free.\" That is an accessibility answer with an engineering shape — a systemic fix at the library level, not a one-off patch — and it is the exact story a Walmart or Target panel is listening for. Pair it with what you automated: axe-core in CI via `jest-axe` or `@axe-core/playwright` catches perhaps 40% of issues, and you should say the number and say that the rest needs manual keyboard and screen reader testing.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Native elements first. ARIA adds announcement, never behaviour — that is the whole reason for the first rule of ARIA.",
            "4.5:1 body text, 3:1 large text and non-text contrast, 24x24px targets, usable at 200% zoom. Quote the numbers.",
            "`:focus-visible`, never `outline: none`. WCAG 2.2 also requires focus not be obscured by sticky chrome.",
            "Modals trap focus and return it. Composite widgets are one tab stop with a roving tabindex.",
            "Live regions must exist before the content changes, and `assertive` is for errors only.",
            "Automated tooling catches a minority of issues. Keyboard-only and one screen reader pass find the rest.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain the flex sizing algorithm: what `flex-basis` contributes, and the exact difference between `flex: 1`, `flex: auto` and `flex: none`.",
    "Explain why a flex item overflows its container and why `min-width: 0` fixes it, then give the grid equivalent.",
    "Explain what `1fr` actually divides, and why `minmax(0, 1fr)` is often required.",
    "Explain `auto-fit` versus `auto-fill` with a concrete four-cards-in-a-six-column-container example.",
    "State the cascade resolution order in full, and explain where specificity sits in it.",
    "Explain the specificity difference between `:is()` and `:where()`, and why a component library should prefer `:where()`.",
    "Explain how `@layer` changes override behaviour, including where unlayered styles rank and the inverted rule for `!important`.",
    "Argue that `!important` is a design failure, then name the two cases where it is legitimate.",
    "List six things that create a stacking context and explain why a `z-index: 9999` child can still render behind something.",
    "Explain the difference between media queries and container queries in terms of component API design, not syntax.",
    "Explain `clamp()` and why a purely `vw`-based preferred value breaks the 200% zoom requirement.",
    "Pick a styling approach for a new 50-component design system and defend it against the three alternatives.",
    "Explain FLIP: what each letter does, and why it can animate a layout change that CSS cannot transition.",
    "Explain what `will-change` does to the compositor, and why applying it broadly makes a page slower.",
    "Explain `contain: content` and `content-visibility: auto`, and why neither replaces windowing for 50,000 rows.",
    "State the first rule of ARIA and explain the mechanism that makes bad ARIA worse than none.",
    "Quote the WCAG 2.2 AA contrast requirements and target size minimum, and say which applies to icons and focus rings.",
    "Describe the accessible name computation order and where `aria-label` sits relative to a native `<label>`.",
    "Describe everything a correct modal must do for keyboard and screen reader users, then say what native `<dialog>` gives you free.",
    "Explain roving tabindex and why a toolbar should be one tab stop rather than many.",
    "Explain why a live region must be mounted before its content changes, and when `assertive` is justified over `polite`.",
    "Describe how you would test accessibility on a feature, being honest about what automated tooling does and does not catch.",
  ],

  math: [
    {
      title: "Flex shorthand decoder",
      formula: "flex: 1 => 1 1 0% · flex: auto => 1 1 auto · flex: none => 0 0 auto · flex: 0 1 240px",
      note: "Basis 0 means content width is ignored and grow factors decide everything; basis auto means content sets the starting point. Add `min-width: 0` to any flex item whose content must truncate or scroll.",
    },
    {
      title: "Responsive grid without breakpoints",
      formula: "grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;",
      note: "auto-fit collapses empty tracks so items stretch; swap to auto-fill to preserve them and keep a fixed rhythm. Use `minmax(0, 1fr)` whenever a track holds overflowing content.",
    },
    {
      title: "Page shell with named areas",
      formula: "grid-template-areas: \"sidebar header\" \"sidebar main\" / 260px 1fr",
      note: "The layout becomes a readable picture, and the mobile breakpoint is one redeclaration of the same picture. Give the main cell `min-height: 0` so an internal scroll container behaves.",
    },
    {
      title: "Specificity triple",
      formula: "(ids, classes+attrs+pseudo-classes, types+pseudo-elements) compared left to right · inline > all selectors · !important > inline",
      note: "`:where()` contributes 0 always; `:is()` takes its strongest argument. One id beats any number of classes, which is why ids in stylesheets are a maintenance trap.",
    },
    {
      title: "Cascade layer order",
      formula: "@layer reset, tokens, base, components, utilities, overrides;  // later wins, regardless of specificity",
      note: "Declare it once at the top of the entry stylesheet. Unlayered styles beat every layer. Within `!important` declarations the order reverses — know it, do not depend on it.",
    },
    {
      title: "Stacking context triggers",
      formula: "root · position != static WITH z-index != auto · fixed/sticky · opacity < 1 · transform/filter/backdrop-filter/clip-path/mask · will-change of those · isolation: isolate · contain: paint",
      note: "z-index only compares siblings inside the same context, so a child cannot escape its parent. Fix overlays with a portal or the top layer (`dialog.showModal()`), not a bigger number. Keep a named z-index scale in tokens.",
    },
    {
      title: "Fluid type with a safe floor",
      formula: "font-size: clamp(1.75rem, 1.25rem + 2.5vw, 3rem)",
      note: "The rem term in the preferred value is what preserves zoom scaling — a pure vw value fails WCAG 1.4.4 at 200%. Same pattern works for `padding-block` and `gap`.",
    },
    {
      title: "Container query pattern",
      formula: "host { container-type: inline-size } · @container (min-width: 420px) { … }",
      note: "The component adapts to its own width, so the same card works in a sidebar and a main column with no variant prop. This is the single biggest reusability win available to a component library.",
    },
    {
      title: "FLIP animation",
      formula: "First rect -> mutate DOM -> Last rect -> Invert with transform(delta) -> Play to transform: none",
      note: "Animates layout changes that CSS cannot transition, including height auto, using composite-only transforms. `element.animate()` is the cleanest implementation; `document.startViewTransition()` now covers many cases natively.",
    },
    {
      title: "WCAG 2.2 AA thresholds",
      formula: "text 4.5:1 · large text (24px / 18.66px bold) 3:1 · non-text & focus indicators 3:1 · targets 24x24 CSS px · usable at 200% zoom",
      note: "The numbers most candidates cannot produce. Verify with the DevTools colour picker rather than estimating, and check target size on dense data-table action buttons — that is where real products fail.",
    },
    {
      title: "Focus management contract for a dialog",
      formula: "on open: focus in · Tab cycles within · Escape closes · background inert · on close: focus returns to opener",
      note: "Plus role=\"dialog\", aria-modal=\"true\" and an accessible name via aria-labelledby. Native `<dialog>.showModal()` provides the trap, the top layer, the backdrop and Escape — reach for it before hand-rolling.",
    },
    {
      title: "Roving tabindex",
      formula: "exactly one child tabindex=\"0\", all others tabindex=\"-1\" · arrow keys move both focus and the 0",
      note: "Makes a menu, toolbar, tab list or tree a single tab stop. Add Home and End to jump to the ends, and typeahead for long lists. This is the APG pattern for every composite widget.",
    },
    {
      title: "Live region rules",
      formula: "aria-live=\"polite\" (default) · role=\"status\" == polite · role=\"alert\" == assertive · region must exist BEFORE content changes",
      note: "Hide it with the clip-based visually-hidden class, never `display: none`, which removes it from the accessibility tree entirely. Reserve assertive for errors — constant interruption is worse than silence.",
    },
  ],

  practice: [
    { type: "math", q: "Build a full dashboard shell — sidebar, header, scrollable main, status bar — using `grid-template-areas`, then collapse it to single column at 900px by redeclaring only the areas. 30 minutes, no framework." },
    { type: "math", q: "Build a responsive card gallery with `repeat(auto-fit, minmax(220px, 1fr))`, then switch to `auto-fill` and screenshot both at four cards. 15 minutes." },
    { type: "math", q: "Build a data-table row where one cell truncates with an ellipsis and another holds a fixed action group. Fix it properly with `min-width: 0` and explain in a comment why it was needed. 20 minutes." },
    { type: "math", q: "Set up a six-layer `@layer` architecture, then deliberately try to override a `#id .a .b` rule in an earlier layer with a single class in a later one. 20 minutes." },
    { type: "math", q: "Reproduce the dropdown-behind-header bug by putting `opacity: 0.999` on an ancestor. Then fix it three ways: portal, `<dialog>`, and `isolation: isolate`. 30 minutes." },
    { type: "math", q: "Convert a component that takes a `variant=\"compact\"` prop into one that uses a container query instead, and delete the prop. 25 minutes." },
    { type: "math", q: "Implement FLIP for a list reorder by hand with `element.animate()`, then reimplement the same effect with `document.startViewTransition()`. 35 minutes." },
    { type: "math", q: "Apply `content-visibility: auto` with `contain-intrinsic-size` to a 500-section report page and measure rendering time in the Performance panel before and after. 25 minutes." },
    { type: "math", q: "Build an accessible modal from scratch: focus trap, Escape to close, focus restore, `inert` background, `aria-modal`, labelled by its heading. No library. 40 minutes." },
    { type: "math", q: "Rebuild the same modal with native `<dialog>` and `showModal()` and list every behaviour you no longer had to write. 20 minutes." },
    { type: "math", q: "Implement a menu button with a roving tabindex: arrow keys, Home, End, typeahead, Escape returning focus to the trigger. Check it against the APG pattern afterwards. 40 minutes." },
    { type: "math", q: "Add a polite live region announcing filter result counts, and an `role=\"alert\"` for save failures. Verify both with a screen reader, not by reading the code. 25 minutes." },
    { type: "math", q: "Run axe DevTools over one real screen of your inventory platform, triage every finding into must-fix and won't-fix with a written reason, then wire `jest-axe` into one component test. 45 minutes." },
    { type: "math", q: "Navigate one full workflow on your own app using only the keyboard, monitor on. Then do it again with NVDA or VoiceOver and the monitor off. Write down every point you got stuck. 60 minutes." },
    { type: "theory", q: "Whiteboard the cascade order from origin down to source order, then place specificity and layers correctly within it. Three minutes." },
    { type: "theory", q: "Defend your styling architecture choice for a 50-component library serving six brands, including why you rejected runtime CSS-in-JS." },
    { type: "theory", q: "An engineer in code review has used `!important` to fix an override. Write the review comment, including the structural fix." },
    { type: "theory", q: "Explain to a product manager why accessibility work is not optional for a 12,000-user enterprise platform, in terms of risk and of the actual users affected." },
  ],

  resources: [
    { label: "W3C ARIA Authoring Practices Guide (APG) — the canonical source for every widget pattern, with required keyboard interactions spelled out. If you build one composite widget from here you will build all of them correctly.", url: "https://www.w3.org/WAI/ARIA/apg/", kind: "docs" },
    { label: "MDN — CSS Grid Layout guide. The 'Grid template areas' and 'Auto-placement' pages are the ones that convert guesswork into fluency.", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout", kind: "docs" },
    { label: "CSS-Tricks — 'A Complete Guide to Flexbox' and the Grid equivalent. Still the fastest visual reference when you are mid-build.", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", kind: "blog" },
    { label: "Josh Comeau — 'CSS for JavaScript Developers'. Explains the layout algorithms as mechanisms rather than recipes, which is exactly what interviews test.", url: "https://css-for-js.dev/", kind: "course" },
    { label: "web.dev — Learn CSS. Free, structured, and the cascade, layers and containment chapters are unusually good.", url: "https://web.dev/learn/css", kind: "course" },
    { label: "MDN — Cascade, specificity and inheritance, plus the `@layer` reference. Read the layer ordering rules once, including the inverted `!important` behaviour.", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade", kind: "docs" },
    { label: "MDN — Stacking context. The definitive list of what creates one; the `opacity` entry explains most z-index bugs you have ever had.", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context", kind: "docs" },
    { label: "WCAG 2.2 Quick Reference. Filter it to Level AA and learn the handful of numeric criteria — that alone puts you ahead of most candidates.", url: "https://www.w3.org/WAI/WCAG22/quickref/", kind: "docs" },
    { label: "The A11Y Project checklist — a practical, ordered list you can actually work through on a real feature before you ship it.", url: "https://www.a11yproject.com/checklist/", kind: "docs" },
    { label: "Deque axe DevTools and axe-core. The industry-standard automated engine; know that it catches a minority of issues and say so.", url: "https://github.com/dequelabs/axe-core", kind: "repo" },
    { label: "'Inclusive Components' — Heydon Pickering. Builds accessible versions of the widgets you actually ship, with the reasoning left in.", url: "https://inclusive-components.design/", kind: "book" },
    { label: "WebAIM — screen reader user survey and the NVDA/VoiceOver getting-started guides. Read the survey for how real users navigate: headings and landmarks first.", url: "https://webaim.org/projects/screenreadersurvey10/", kind: "blog" },
  ],
};

export default p07;
