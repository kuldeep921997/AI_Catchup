const p10 = {
  id: "p10",
  week: 10,
  hours: 10,
  title: "LLD and Design Patterns for Frontend",
  tag: "Interview Rounds",
  why: "Your HLD is done; LLD is the live gap, and it is the round where senior frontend candidates most often stall. The trap is preparing the wrong LLD: nobody hiring a Senior Frontend Engineer at 35 LPA will spend 45 minutes on a parking lot, but they will absolutely ask you to design a form library, a data table or a state container. Spend your time on the problems that look like the code you would actually own.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "SOLID, expressed in components and hooks",
      summary:
        "The five principles are usually taught with animals and shapes, which is why nobody applies them. Here they are restated as concrete decisions about component boundaries, prop APIs and where dependencies come from.",
      blocks: [
        {
          t: "p",
          text: "You can recite SOLID in ninety seconds and still fail the round, because the interviewer is not testing the acronym — they are watching whether your component boundaries fall in sensible places. Every principle has a direct frontend translation, and each translation is a decision you have already made hundreds of times in the Jio portals, correctly or otherwise. Learn the translations and SOLID stops being vocabulary and becomes a review checklist.",
        },
        { t: "h", text: "Single responsibility — one reason to change" },
        {
          t: "p",
          text: "The useful phrasing is not \"a component should do one thing\" — that is unfalsifiable. It is **a module should have exactly one reason to change**. A component that fetches, transforms, formats and renders has four reasons: the endpoint moved, the business rule changed, the locale changed, the design changed. Four teams can force you to touch one file. Split along the axes of change, not along line count.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Four reasons to change, then one each",
          code: `// BEFORE: fetch + derive + format + render in one place.
function StockOnHandCard({ storeId }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetch("/api/soh?store=" + storeId)
      .then((r) => r.json())
      .then((d) => setRows(d.items));
  }, [storeId]);

  const total = rows.reduce((a, r) => a + r.qty * r.unitPrice, 0);
  const label = "INR " + (total / 10000000).toFixed(2) + " Cr";
  return <div className="card">{label}</div>;
}

// AFTER: transport, domain rule, presentation formatting, markup.
const fetchSoh = (storeId) => api.get("/soh", { store: storeId });   // transport

const stockValue = (rows) =>                                          // domain
  rows.reduce((a, r) => a + r.qty * r.unitPrice, 0);

const useStockOnHand = (storeId) => {                                 // binding
  const { data } = useQuery(["soh", storeId], () => fetchSoh(storeId));
  return { rows: data?.items ?? [], value: stockValue(data?.items ?? []) };
};

function StockOnHandCard({ storeId }) {                               // view
  const { value } = useStockOnHand(storeId);
  return <Card>{formatCrore(value)}</Card>;
}`,
        },
        { t: "h", text: "Open/closed — extend by composition, never by another boolean" },
        {
          t: "p",
          text: "Open for extension, closed for modification means: a new requirement should not require editing the component. In React the mechanism is almost always **composition** — children, slots, render props, compound components — not another prop. The signal of a closed-for-extension component is a prop list that grows every sprint: `showFooter`, `showCloseButton`, `hideHeader`, `variant`, `size`, `dense`, `withIcon`.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Compound components: the same modal serves every future case",
          code: `// CLOSED: every new requirement edits this file and its prop type.
<Modal
  title="Confirm transfer"
  showClose
  showFooter
  footerAlign="right"
  primaryLabel="Transfer"
  onPrimary={submit}
  dense
/>

// OPEN: the component owns behaviour (focus trap, escape, portal,
// aria wiring); the caller owns composition. New layouts need no edit.
<Modal onClose={close}>
  <Modal.Header>Confirm transfer</Modal.Header>
  <Modal.Body>
    <TransferSummary items={selected} />
  </Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button onClick={submit}>Transfer</Button>
  </Modal.Footer>
</Modal>

// Shared state travels by context, not by prop drilling.
const ModalCtx = createContext(null);
Modal.Header = function Header({ children }) {
  const { onClose, titleId } = useContext(ModalCtx);
  return (
    <header>
      <h2 id={titleId}>{children}</h2>
      <button aria-label="Close" onClick={onClose} />
    </header>
  );
};`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The prop-count smell, stated as a rule",
          text: "Boolean props that describe *layout* are an open/closed violation; boolean props that describe *state* are fine. `isLoading` and `isDisabled` are state and belong on the component. `showFooter` and `hideHeader` are layout and belong to the caller. When you catch yourself adding the third layout boolean, the component wants a slot, not a prop. Say this out loud in a component-design round — it lands better than reciting the principle.",
        },
        { t: "h", text: "Liskov — prop contracts you can actually substitute" },
        {
          t: "p",
          text: "Liskov in frontend is about **substitutability of implementations behind a shared contract**. If `<Input>`, `<Select>` and `<DatePicker>` all claim to be form controls, then every one of them must accept `value`, `onChange`, `name`, `disabled` and `aria-invalid` and behave identically for each. The moment `DatePicker` fires `onChange(dateObject)` while the others fire `onChange(event)`, your form library cannot treat them uniformly and every consumer needs a special case. The violation is not theoretical: it is exactly why teams end up with adapter wrappers around every third-party control. The same rule applies to hooks — if `useLocalStorage` and `useSessionStorage` are meant to be swappable, they must have identical signatures and identical behaviour on a missing key.",
        },
        { t: "h", text: "Interface segregation and dependency inversion" },
        {
          t: "table",
          head: ["Principle", "Frontend smell", "The fix"],
          rows: [
            [
              "Single responsibility",
              "One component fetches, transforms, formats and renders",
              "Extract transport, domain functions and a binding hook",
            ],
            [
              "Open/closed",
              "Prop list grows every sprint with layout booleans",
              "Compound components, slots, render props",
            ],
            [
              "Liskov",
              "`onChange` payload differs between controls of the same family",
              "One documented control contract; adapt at the boundary",
            ],
            [
              "Interface segregation",
              "A god `config` or `user` object passed where two fields are used",
              "Narrow props; pass `canEdit` not the whole permissions blob",
            ],
            [
              "Dependency inversion",
              "Component imports `axios` and the analytics singleton directly",
              "Depend on an injected interface via context or props",
            ],
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Dependency inversion is what makes a component testable",
          code: `// CONCRETE dependency: this component cannot be tested or reused
// outside an app that has exactly this HTTP client and this SDK.
import axios from "axios";
import analytics from "../lib/analytics";

function ExportButton({ storeId }) {
  const click = async () => {
    analytics.track("export_clicked", { storeId });
    await axios.post("/api/exports", { storeId });
  };
  return <Button onClick={click}>Export</Button>;
}

// INVERTED: the component declares what it needs, not who provides it.
const ServicesCtx = createContext(null);

export const useServices = () => {
  const s = useContext(ServicesCtx);
  if (!s) throw new Error("useServices must be used inside ServicesProvider");
  return s;
};

function ExportButton({ storeId }) {
  const { exports, telemetry } = useServices();     // interface, not impl
  const click = async () => {
    telemetry.track("export_clicked", { storeId });
    await exports.create(storeId);
  };
  return <Button onClick={click}>Export</Button>;
}

// Tests inject fakes; Storybook injects no-ops; SSR injects a server client.
render(
  <ServicesCtx.Provider value={{ exports: fakeExports, telemetry: noopTelemetry }}>
    <ExportButton storeId="S-1901" />
  </ServicesCtx.Provider>
);`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Your 50-component library is the SOLID story",
          text: "When they ask \"tell me about a design decision you regret\", the shared component library across three portals is the richest answer you have. Pick one component that acquired layout booleans until it was unmaintainable, describe the migration to slots, and quantify it — fewer variants, fewer regressions, one place owning focus management and ARIA. That is open/closed told as a war story, and it beats any definition you could give.",
        },
        {
          t: "list",
          items: [
            "One reason to change, not one thing done. Split along axes of change: transport, domain, binding, view.",
            "Layout booleans break open/closed. Slots and compound components fix it.",
            "Liskov is a contract on prop payloads and hook signatures — normalise at the boundary, never per consumer.",
            "Narrow props over god objects; inject dependencies through context so the component is testable.",
            "Every principle should come out of your mouth as a code smell plus a fix, never as a definition.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 22,
      title: "The patterns that actually recur in frontend",
      summary:
        "Nine patterns, each mapped to something you have shipped or used this week. Observer is your Kafka-to-SSE layer, decorator is a React HOC, command is undo/redo, and singleton plus facade is every SDK you have ever installed.",
      blocks: [
        {
          t: "p",
          text: "The Gang of Four catalogue has twenty-three patterns. Frontend interviews touch about nine, and you have already implemented most of them without naming them. The value of learning the names is not the names — it is that naming a pattern compresses thirty seconds of explanation into two words, which is exactly what you need when you have forty-five minutes and a whiteboard.",
        },
        {
          t: "table",
          head: ["Pattern", "Frontend incarnation", "Where you have already met it"],
          rows: [
            ["Observer / pub-sub", "Event emitter, store subscriptions, SSE and WebSocket fan-out", "Your Kafka-published SOH and RFID events fanned to the portals over SSE"],
            ["Strategy", "Swappable validators, sort comparators, pricing rules, retry policies", "Per-brand business rules across six retail brands"],
            ["Factory", "Component registry, widget-by-type rendering, client construction", "Dashboard widget rendering from a config-driven layout"],
            ["Adapter", "Normalising an API response or a third-party control to your contract", "Wrapping legacy report endpoints behind your REST contracts"],
            ["Decorator", "React HOCs, middleware, function wrappers such as `withRetry`", "`withAuth` / `withErrorBoundary` in the component library"],
            ["Command", "Undo/redo, action objects, replayable operations", "Stock adjustment actions that must be reversible and audited"],
            ["Singleton", "One API client, one analytics SDK, one feature-flag client per page", "The shared axios instance with interceptors"],
            ["Facade", "One narrow surface hiding auth refresh, retries, tracing, serialisation", "`api.get` / `api.post` over fetch plus interceptors"],
            ["Builder", "Fluent query and request construction, chained test fixtures", "Filter builders on 50,000-row report views"],
          ],
        },
        { t: "h", text: "Observer — you have already shipped the hardest version of this" },
        {
          t: "p",
          text: "Observer is a subject holding a set of listeners and notifying them on change. In-process that is an `EventEmitter`; across a network it is Kafka plus SSE. The pattern is identical and the interesting parts are the same at both scales: **removal**, **ordering**, **error isolation** and **replay**. A candidate who only knows the in-process version says \"you push to an array of callbacks\". You can say what happens when one subscriber throws, when a subscriber is slow, and when a subscriber joins late and needs history.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The observer you should be able to write from memory, plus the details that matter",
          code: `class Emitter {
  #listeners = new Map();               // event -> Set<fn>, Set gives O(1) off

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(fn);
    return () => this.off(event, fn);   // return an unsubscribe, not void
  }

  off(event, fn) {
    this.#listeners.get(event)?.delete(fn);
  }

  once(event, fn) {
    const wrapped = (...args) => { this.off(event, wrapped); fn(...args); };
    return this.on(event, wrapped);
  }

  emit(event, payload) {
    // Copy before iterating: a handler may unsubscribe during emit.
    const fns = [...(this.#listeners.get(event) ?? [])];
    for (const fn of fns) {
      // Error isolation: one bad subscriber must not stop the rest.
      try { fn(payload); } catch (err) { this.onError?.(err, event); }
    }
    return fns.length > 0;
  }
}

// The React binding: useSyncExternalStore is the correct hook, because it
// is tear-free under concurrent rendering where useEffect + useState is not.
function useEmitted(emitter, event, getSnapshot) {
  return useSyncExternalStore(
    (notify) => emitter.on(event, notify),   // returns unsubscribe already
    getSnapshot
  );
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Say the distributed version out loud",
          text: "When observer comes up, do not stop at the emitter. Your RFID platform published SOH and tracking events to Kafka precisely so that new analytics consumers could subscribe without anyone touching the ingestion path — that is open/closed and observer at system scale, and it is the single cleanest justification for pub-sub anyone can give: a new consumer is a new subscription, not a change to the producer. Then land the frontend half: the portals consume over SSE, sub-five-second freshness replacing a 15-minute batch. Same pattern, three layers, one story.",
        },
        { t: "h", text: "Strategy and Factory — the two that kill your if-else chains" },
        {
          t: "p",
          text: "Strategy replaces a conditional over *behaviour* with a lookup of interchangeable implementations behind one signature. Factory replaces a conditional over *construction*. They pair constantly: a factory picks the strategy. The interview signal is that you make the registry the extension point, so a new case is a new entry rather than a new branch in a switch that is already forty lines long.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Strategy behind a registry, factory in front of it",
          code: `// STRATEGY: one signature, many implementations, registered not branched.
// (value, ctx) => string | null      null means valid
const validators = {
  required: () => (v) => (v == null || v === "" ? "Required" : null),
  minLen: (n) => (v) => (String(v).length < n ? "Too short, min " + n : null),
  gtin: () => (v) => (/^\\d{8}(\\d{5,6})?$/.test(v) ? null : "Invalid GTIN"),
  skuUnique: (api) => async (v) =>
    (await api.exists(v)) ? "SKU already exists" : null,
};

const compose = (rules) => async (value, ctx) => {
  for (const rule of rules) {                // first error wins, order matters
    const err = await rule(value, ctx);
    if (err) return err;
  }
  return null;
};

// FACTORY: construction by type, from config. Adding a widget type
// touches the registry only - no consumer changes, no switch statement.
const widgetRegistry = {
  soh: SohWidget,
  rfidFeed: RfidFeedWidget,
  shrinkage: ShrinkageWidget,
  cameraAlerts: CameraAlertWidget,
};

function Widget({ type, ...rest }) {
  const Impl = widgetRegistry[type] ?? UnknownWidget;
  return <Impl {...rest} />;
}

// Cache keys built from a template literal - note the escaping requirement
// when this file itself is a template: the source writes a backslash dollar.
const cacheKey = (type, id) => \`\${type}:\${id}\`;`,
        },
        { t: "h", text: "Decorator — a React HOC is the decorator pattern, exactly" },
        {
          t: "p",
          text: "Decorator wraps an object in another object with the same interface, adding behaviour without touching the original. A higher-order component takes a component and returns a component with the same contract plus extra behaviour. That is not an analogy; it is the same pattern with JSX syntax. Middleware is the same idea again, applied to functions rather than components, which is why the Redux middleware chain later in this module will feel familiar.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Same behaviour, three shapes: decorator on a function, on a component, on a class",
          code: `// 1. Decorating a function.
const withRetry = (fn, attempts = 3) => async (...args) => {
  let last;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(...args); } catch (e) { last = e; }
  }
  throw last;
};
const fetchSohSafely = withRetry(withTiming(fetchSoh));

// 2. Decorating a component (a HOC). Note the contract preservation:
// same props in, ref forwarded, displayName set, statics hoisted.
function withPermission(permission) {
  return function decorate(Wrapped) {
    const Decorated = forwardRef((props, ref) => {
      const { can } = usePermissions();
      if (!can(permission)) return <NoAccess required={permission} />;
      return <Wrapped ref={ref} {...props} />;
    });
    Decorated.displayName = "withPermission(" + (Wrapped.displayName ||
      Wrapped.name || "Component") + ")";
    return Decorated;
  };
}
const AdjustStock = withPermission("stock.adjust")(StockAdjustPanel);

// 3. Decorating an object: same interface, added logging.
class LoggingApi {
  constructor(inner, log) { this.inner = inner; this.log = log; }
  async get(path, params) {
    const t = performance.now();
    try { return await this.inner.get(path, params); }
    finally { this.log("GET " + path, performance.now() - t); }
  }
}`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Why hooks replaced most HOCs, and where decorators still win",
          text: "HOCs have three chronic problems: prop-name collisions between stacked decorators, an unreadable component tree, and lost static typing on forwarded props. Hooks solve all three for *behaviour* reuse because the consumer calls them explicitly. But hooks cannot short-circuit rendering — they cannot decide *not* to render the wrapped component. That is why permission gates, error boundaries and Suspense wrappers are still legitimately HOCs or wrapper components. \"Hooks for behaviour, wrappers for control of rendering\" is the crisp answer.",
        },
        { t: "h", text: "Command — the spine of undo/redo, and the boundary patterns" },
        {
          t: "code",
          lang: "javascript",
          caption: "Command objects make history a data structure",
          code: `// A command knows how to do and undo itself, and carries its own payload.
// interface Command { label: string; do(state): state; undo(state): state }

const setCell = (rowId, col, next, prev) => ({
  label: "Edit " + col,
  do: (s) => ({ ...s, rows: patch(s.rows, rowId, { [col]: next }) }),
  undo: (s) => ({ ...s, rows: patch(s.rows, rowId, { [col]: prev }) }),
});

class History {
  #done = [];
  #undone = [];
  constructor(state) { this.state = state; }

  execute(cmd) {
    this.state = cmd.do(this.state);
    this.#done.push(cmd);
    this.#undone.length = 0;        // a new action invalidates the redo branch
    if (this.#done.length > 100) this.#done.shift();   // bound the history
    return this.state;
  }
  undo() {
    const cmd = this.#done.pop();
    if (!cmd) return this.state;
    this.state = cmd.undo(this.state);
    this.#undone.push(cmd);
    return this.state;
  }
  redo() {
    const cmd = this.#undone.pop();
    if (!cmd) return this.state;
    this.state = cmd.do(this.state);
    this.#done.push(cmd);
    return this.state;
  }
  get canUndo() { return this.#done.length > 0; }
  get labels() { return this.#done.map((c) => c.label); }
}`,
        },
        {
          t: "list",
          items: [
            "**Singleton** — one instance per page for things with shared connection or buffer state: the API client, the analytics queue, the feature-flag stream. The interview follow-up is always testability (inject it, do not import it) and SSR (a module-level singleton on the server is shared across requests, which is a data-leak bug).",
            "**Facade** — one narrow surface over a messy subsystem. `api.get(path, params)` hiding token refresh, retry, tracing headers, error normalisation and cancellation is a facade, and it is why 50 components never learn what an interceptor is.",
            "**Adapter** — translate a foreign shape into your contract at exactly one place. Two adapters, one per legacy endpoint, beat 40 components each knowing that one report returns `qty_on_hand` and another returns `stockQty`.",
            "**Builder** — for construction with many optional parts: fluent query builders, request builders, test fixtures. Ask whether the object is invalid until `build()` is called; if so, builder earns its keep, otherwise an options object is simpler.",
            "**Module pattern** — an IIFE returning a public object over closed-over private state. Pre-ESM this was the only encapsulation available; today it is `export` plus module-local `let`, and it is worth naming because it is the ancestor of every store you write.",
          ],
        },
        {
          t: "list",
          items: [
            "Nine patterns cover frontend interviews. Learn each as \"the smell it removes\", not as a UML diagram.",
            "Observer scales from an emitter to Kafka unchanged — removal, error isolation, ordering and replay are the real content.",
            "Strategy removes behaviour conditionals, factory removes construction conditionals, and a registry is the extension point in both.",
            "A HOC *is* a decorator. Hooks for behaviour, wrappers for control over whether rendering happens at all.",
            "Command turns history into a data structure, which is why undo/redo is a five-minute answer once you name it.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 22,
      title: "Worked LLD: design a form library",
      summary:
        "The most likely frontend LLD prompt you will get. Field registration, a subscription model that avoids re-rendering the whole form, sync and async validation with ordering, error surfacing and the full submit lifecycle.",
      blocks: [
        {
          t: "p",
          text: "\"Design a form library like React Hook Form\" is the archetypal senior frontend LLD question, because a form touches state ownership, subscription granularity, async coordination, accessibility and API design all at once — and the interviewer can go as deep as they like on any of them. Work it in the order below and the round runs itself: public API, entities, state shape, validation, submit.",
        },
        { t: "h", text: "Start from the public API — always" },
        {
          t: "p",
          text: "Write the code a consumer will type before you write a single internal. It forces the design to be usable, it gives the interviewer something concrete to push on, and it means every internal decision afterwards has a justification. State your design goals as you write it: minimal re-renders, uncontrolled inputs by default, validation pluggable, errors accessible.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The consumer surface, written first",
          code: `const {
  register,           // (name, rules) => props to spread onto an input
  handleSubmit,       // (onValid, onInvalid?) => (event) => void
  watch,              // (name?) => value, subscribes only this caller
  setValue, getValues,
  setError, clearErrors,
  reset,
  formState,          // { errors, isDirty, isValid, isSubmitting, submitCount }
} = useForm({
  defaultValues: { sku: "", qty: 1, storeId: "" },
  mode: "onBlur",           // onChange | onBlur | onSubmit
  reValidateMode: "onChange",
  resolver: zodResolver(schema),   // optional whole-form strategy
});

// Usage. Note the input is UNCONTROLLED: register returns ref + handlers,
// so keystrokes do not re-render the form at all.
<form onSubmit={handleSubmit(save, focusFirstError)}>
  <input {...register("sku", { required: true, pattern: GTIN })} />
  <FieldError name="sku" />                 {/* subscribes to one field */}

  <input type="number" {...register("qty", { min: 1, max: 9999 })} />
  <SubmitButton />                          {/* subscribes to isSubmitting */}
</form>`,
        },
        { t: "h", text: "Entities and responsibilities" },
        {
          t: "list",
          items: [
            "**FormStore** — owns `values`, `defaultValues`, `errors`, `touched`, `dirty`, `isSubmitting`, `submitCount`. Single source of truth, held in a ref so mutation does not itself trigger a render.",
            "**FieldRegistry** — `Map<name, FieldMeta>` where `FieldMeta` holds the DOM ref, the rule set, the mount count and the unregister behaviour. Registration is what lets the library validate and focus fields it never rendered itself.",
            "**Subscriptions** — `Map<path, Set<callback>>`. Publishing a change notifies only the paths that changed and their ancestors. This is the whole performance story.",
            "**Validator** — the strategy layer: per-field rules, plus an optional whole-form `resolver` for schema validation. One signature, sync or async.",
            "**SubmitController** — sequences validate, block double submit, call the handler, map server errors back onto fields, manage `isSubmitting`.",
            "**FormProvider** — context carrying the store so `FieldError` and `SubmitButton` can subscribe without prop drilling. Dependency inversion again.",
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "State shape and the subscription core",
          code: `// interface FieldMeta {
//   name: string; ref: HTMLElement | null;
//   rules: Rule[]; mounted: number; shouldUnregister: boolean;
// }
//
// interface FormState {
//   values: Record<string, unknown>;
//   defaultValues: Record<string, unknown>;
//   errors: Record<string, { type: string; message: string }>;
//   touched: Set<string>;
//   dirtyFields: Set<string>;
//   isSubmitting: boolean;
//   submitCount: number;
// }

function createFormStore(initial) {
  let state = {
    values: { ...initial },
    defaultValues: { ...initial },
    errors: {},
    touched: new Set(),
    dirtyFields: new Set(),
    isSubmitting: false,
    submitCount: 0,
  };
  const fields = new Map();
  const subs = new Map();               // path -> Set<callback>

  const subscribe = (path, cb) => {
    if (!subs.has(path)) subs.set(path, new Set());
    subs.get(path).add(cb);
    return () => subs.get(path).delete(cb);
  };

  // Notify the path and every ancestor: writing items.3.qty must wake
  // subscribers of items.3.qty, items.3, items and the root.
  const notify = (path) => {
    const parts = path.split(".");
    for (let i = parts.length; i >= 0; i--) {
      const p = parts.slice(0, i).join(".");
      subs.get(p)?.forEach((cb) => cb());
    }
  };

  const setFieldValue = (path, value) => {
    state = { ...state, values: setIn(state.values, path, value) };
    if (!deepEqual(value, getIn(state.defaultValues, path))) {
      state.dirtyFields.add(path);
    } else {
      state.dirtyFields.delete(path);
    }
    notify(path);
  };

  const register = (name, rules = []) => {
    const meta = fields.get(name) ?? { name, ref: null, rules, mounted: 0 };
    meta.rules = rules;
    meta.mounted += 1;
    fields.set(name, meta);
    return {
      name,
      ref: (el) => { meta.ref = el; },
      defaultValue: getIn(state.defaultValues, name),
      onChange: (e) => setFieldValue(name, readValue(e)),
      onBlur: () => { state.touched.add(name); validateField(name); },
    };
  };

  return { subscribe, register, setFieldValue, getState: () => state, fields };
}`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Subscription granularity is the answer they are hunting for",
          text: "A naive form keeps `values` in `useState` on the form component, so every keystroke re-renders the entire form — on a 60-field stock adjustment screen that is visible jank. The fix has two halves and you must say both: keep authoritative state in a **ref** so writes do not render, and expose it through **per-path subscriptions** so only the components that read a field wake up. `useSyncExternalStore` is the correct binding. This is why `register` returns a `ref` and handlers rather than `value` and `onChange` — the input is uncontrolled, and the DOM holds the transient keystroke state.",
        },
        { t: "h", text: "Validation: rules, ordering, and the async cases" },
        {
          t: "steps",
          items: [
            {
              title: "One signature for every rule",
              text: "`(value, allValues) => string | null | Promise<string | null>`. Sync and async are the same contract, which means the runner never branches on rule type — it just awaits. That is strategy applied properly.",
            },
            {
              title: "Run cheap before expensive, and short-circuit",
              text: "Sort rules so `required` and `pattern` run before any network rule. A field that is empty should never fire a SKU-uniqueness request. First error wins per field by default; offer a `criteriaMode: \"all\"` option for accessibility summaries that want every violation.",
            },
            {
              title: "Debounce and cancel async rules",
              text: "Async validation on every keystroke is a request storm. Debounce roughly 300ms, and carry an `AbortController` per field so the previous uniqueness check is cancelled when the user types again. Without cancellation you get the out-of-order response bug: the stale \"already exists\" lands after the fresh \"available\" and the field shows the wrong error.",
            },
            {
              title: "Stamp results so stale ones are discarded",
              text: "Cancellation is not always available — a validator may be a plain promise. Keep a monotonically increasing `runId` per field and drop any result whose id is not current. Mention both fixes; interviewers award the second one.",
            },
            {
              title: "Cross-field and whole-form rules need a separate pass",
              text: "\"Confirm password matches\" and \"transfer quantity cannot exceed on-hand\" depend on other fields. Model them as form-level rules that run after per-field validation, and record a dependency map so editing `qty` re-runs the rules that read `qty`, not all of them.",
            },
          ],
        },
        {
          t: "table",
          head: ["Mode", "Validates on", "Feels like", "Use when"],
          rows: [
            ["`onSubmit`", "Submit only", "Quietest; errors arrive in a batch", "Short forms, low-friction signup"],
            ["`onBlur`", "Field blur, then submit", "Best default — no nagging mid-typing", "Most business forms, including stock entry"],
            ["`onChange`", "Every keystroke", "Aggressive; needs debouncing to be tolerable", "Password strength, live search filters"],
            ["`onTouched`", "First blur, then every change", "Forgiving first pass, responsive corrections", "Long multi-step forms"],
            ["`all`", "Change and blur", "Noisiest, most immediate", "Rare; only with cheap sync rules"],
          ],
        },
        { t: "h", text: "Submit lifecycle and error surfacing" },
        {
          t: "code",
          lang: "javascript",
          caption: "Every state transition an interviewer will probe",
          code: `function handleSubmit(onValid, onInvalid) {
  return async (event) => {
    event?.preventDefault();
    if (store.getState().isSubmitting) return;      // block double submit

    setState({ isSubmitting: true, submitCount: submitCount + 1 });
    markAllTouched();                               // so errors become visible

    try {
      const errors = await validateAll();           // field rules, then form
      if (Object.keys(errors).length) {
        setErrors(errors);
        focusFirstError(errors);                    // a11y: move focus, in DOM order
        onInvalid?.(errors);
        return;
      }

      await onValid(getValues());
      reset({ keepValues: true, keepDirty: false }); // dirty is now clean
    } catch (err) {
      // Map 422 field errors from the server back onto fields, and put
      // anything unattributable on a form-level error slot.
      if (err.fieldErrors) {
        for (const [name, message] of Object.entries(err.fieldErrors)) {
          setError(name, { type: "server", message });
        }
        focusFirstError(err.fieldErrors);
      } else {
        setError("root.serverError", { type: "server", message: err.message });
      }
    } finally {
      setState({ isSubmitting: false });            // ALWAYS, even on throw
    }
  };
}

// Error surfacing is an accessibility contract, not a styling choice:
//   input  aria-invalid="true" aria-describedby="sku-error"
//   error  id="sku-error" role="alert"
//   form-level summary in a live region, focusable, listing links to fields
function FieldError({ name }) {
  const error = useFormSubscription("errors." + name);
  if (!error) return null;
  return <span id={name + "-error"} role="alert">{error.message}</span>;
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Ground it in the stock adjustment screens",
          text: "You have built exactly this against real constraints: multi-brand forms where validation rules differ per brand (strategy), SKU and GTIN checks that must hit the server (async rules with cancellation), and 60-plus field screens where naive state management visibly janks. When you present the design, say \"here is what I would do differently from what we shipped\" — that sentence signals a staff-level relationship with your own code, and it is far more persuasive than describing a library you read the source of.",
        },
        {
          t: "list",
          items: [
            "Public API first. It constrains every internal decision and gives the interviewer a surface to attack.",
            "Authoritative state in a ref, reads via per-path subscriptions, inputs uncontrolled. That trio is the performance answer.",
            "One rule signature for sync and async; cheap rules first; debounce, cancel and stamp the network ones.",
            "Submit is a state machine: guard double submit, mark touched, validate, focus first error, map server errors, always clear `isSubmitting`.",
            "`aria-invalid`, `aria-describedby`, `role=\"alert\"` and focus management are part of the design, not polish.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 20,
      title: "Worked LLD: a data table, a tiny Redux, and how to run the round",
      summary:
        "Two more prompts you should be able to design cold, the classic textbook problems in the small amount of time they deserve, and the five-step script for driving an LLD interview instead of being driven by it.",
      blocks: [
        {
          t: "p",
          text: "A data table and a state container are the other two prompts that come up constantly, and they test different muscles: the table is prop-API design under conflicting feature requirements, and the store is function composition dressed as a library. You have shipped both — 50,000-row report views and the shared library that serves three portals — so the goal here is a clean design vocabulary for work you have already done.",
        },
        { t: "h", text: "Data table: the prop API *is* the design" },
        {
          t: "p",
          text: "The critical early question, and the one you should ask the interviewer in the first two minutes, is **where does state live**. Sorting, filtering, pagination and selection can each be internal (uncontrolled), external (controlled), or server-driven. Get this wrong and the component is either unusable for server-side data or unusable for a quick client-side list. The professional answer is the same pattern React uses for inputs: support both, with an uncontrolled default and a controlled escape hatch per feature.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Columns as data, features as independently controllable slices",
          code: `// interface Column<Row> {
//   id: string;
//   header: ReactNode;
//   accessor: (row: Row) => unknown;         // data access, not rendering
//   cell?: (ctx: { value, row, rowIndex }) => ReactNode;
//   sortable?: boolean;
//   comparator?: (a, b) => number;           // strategy per column
//   filterFn?: (row, query) => boolean;      // strategy per column
//   width?: number; minWidth?: number; resizable?: boolean;
//   pinned?: "left" | "right";
//   align?: "left" | "right" | "center";
// }
//
// interface DataTableProps<Row> {
//   data: Row[];
//   columns: Column<Row>[];
//   getRowId: (row: Row) => string;          // REQUIRED - keys, selection,
//                                            // and virtualisation all need it
//   // Each feature: uncontrolled by default, controlled if both props given.
//   sort?: SortState;   defaultSort?: SortState;   onSortChange?: (s) => void;
//   filters?: Filters;  defaultFilters?: Filters;  onFiltersChange?: (f) => void;
//   page?: PageState;   defaultPage?: PageState;   onPageChange?: (p) => void;
//   selection?: string[]; onSelectionChange?: (ids: string[]) => void;
//
//   manualSorting?: boolean;                 // true = server does it
//   manualPagination?: boolean; rowCount?: number;
//
//   virtualised?: boolean; estimateRowHeight?: number | ((i) => number);
//   loading?: boolean; error?: unknown;
//   emptyState?: ReactNode;
//   renderRow?: (ctx) => ReactNode;          // escape hatch: open/closed
// }

// The pipeline is explicit, ordered, and each stage is skippable when
// the server owns that stage. Order matters: filter, then sort, then page.
function useTablePipeline({ data, columns, sort, filters, page, manual }) {
  const filtered = useMemo(
    () => (manual.filtering ? data : applyFilters(data, columns, filters)),
    [data, columns, filters, manual.filtering]
  );
  const sorted = useMemo(
    () => (manual.sorting ? filtered : applySort(filtered, columns, sort)),
    [filtered, columns, sort, manual.sorting]
  );
  const paged = useMemo(
    () => (manual.pagination ? sorted : slicePage(sorted, page)),
    [sorted, page, manual.pagination]
  );
  return { rows: paged, totalRows: filtered.length };
}`,
        },
        {
          t: "table",
          head: ["Feature", "Where state should live", "The hard part"],
          rows: [
            ["Sort", "Uncontrolled default, controlled for server sort", "Multi-column sort order, and stable sort for equal keys"],
            ["Filter", "Controlled in practice — URL is the real store", "Debouncing text filters; resetting page to 1 on filter change"],
            ["Pagination", "Controlled; offset for SQL, cursor for feeds", "Offset pagination drifts when rows are inserted mid-scan"],
            ["Selection", "Controlled — the parent acts on the selection", "\"Select all\" across pages means storing a predicate, not 50,000 ids"],
            ["Column resize", "Internal, persisted per user", "Must not trigger a data re-render; write widths to CSS custom properties"],
            ["Virtualisation", "Internal", "Variable row heights, sticky headers, and keyboard navigation off-screen"],
            ["Row expansion", "Uncontrolled default", "Expanded height breaks fixed-size virtualisation estimates"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Volunteer the two things virtualisation breaks",
          text: "First, **accessibility and find-in-page**: only rendered rows exist in the DOM, so Ctrl+F finds nothing and screen readers need explicit `aria-rowcount` and `aria-rowindex` to convey the real size. Second, **selection semantics**: with 50,000 rows, \"select all\" cannot mean an array of ids — it must be a mode (`all`, minus an exclusion set) so the payload stays small and the server can act on the predicate. Your dashboard work on 50,000-row views is the credibility here: 8s to 3s time-to-interactive came from not rendering what nobody can see, and windowing is the mechanism.",
        },
        { t: "h", text: "A tiny Redux, and why middleware is function composition" },
        {
          t: "code",
          lang: "javascript",
          caption: "The whole store in twenty lines — write this from memory",
          code: `function createStore(reducer, preloadedState, enhancer) {
  if (typeof enhancer === "function") {
    return enhancer(createStore)(reducer, preloadedState);
  }
  let state = preloadedState;
  let listeners = new Set();
  let dispatching = false;

  const getState = () => {
    if (dispatching) throw new Error("Cannot read state while reducing");
    return state;
  };

  const dispatch = (action) => {
    if (typeof action.type === "undefined") throw new Error("Action needs a type");
    if (dispatching) throw new Error("Reducers may not dispatch");
    try {
      dispatching = true;
      state = reducer(state, action);         // pure: (state, action) => state
    } finally {
      dispatching = false;
    }
    // Copy before notifying: a listener may unsubscribe during notification.
    [...listeners].forEach((l) => l());
    return action;
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  dispatch({ type: "@@INIT" });               // populate defaults
  return { getState, dispatch, subscribe, replaceReducer: (r) => { reducer = r; } };
}`,
        },
        {
          t: "code",
          lang: "javascript",
          caption: "compose is the pattern; applyMiddleware is one use of it",
          code: `// Right-to-left composition: compose(f, g, h)(x) === f(g(h(x))).
const compose = (...fns) =>
  fns.length === 0 ? (x) => x
  : fns.length === 1 ? fns[0]
  : fns.reduce((a, b) => (...args) => a(b(...args)));

// Each middleware has the curried shape:
//   (store) => (next) => (action) => result
// It receives the NEXT dispatch, so it can act before, after, replace,
// swallow or transform the action. That is decorator, at three levels of
// currying, and the chain is built with compose.
const applyMiddleware = (...middlewares) => (createStore) =>
  (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = () => { throw new Error("Dispatching during construction"); };

    const api = { getState: store.getState, dispatch: (a) => dispatch(a) };
    const chain = middlewares.map((mw) => mw(api));
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };

const logger = (store) => (next) => (action) => {
  const before = store.getState();
  const result = next(action);                 // call down the chain
  console.log(action.type, before, store.getState());
  return result;                               // pass the result back up
};

const thunk = (store) => (next) => (action) =>
  typeof action === "function"
    ? action(store.dispatch, store.getState)   // swallow, do not forward
    : next(action);

// The Kafka/SSE bridge as a middleware: one place owns the socket, and
// every reducer stays pure.
const sseBridge = (source) => (store) => (next) => {
  source.addEventListener("soh", (e) =>
    store.dispatch({ type: "soh/received", payload: JSON.parse(e.data) })
  );
  return (action) => next(action);
};`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The sentence that makes the middleware question trivial",
          text: "\"Middleware is a decorator around `dispatch`, and the chain is right-to-left function composition — each layer receives the next `dispatch` and decides whether to call it.\" Everything follows from that: thunk works because it *does not* call `next` for functions; logger works because it calls `next` between two reads of state; and the reason `next(action)` must return the result is so `await store.dispatch(thunk)` works at the call site. If you get asked why reducers must be pure, the answer is time-travel debugging, replay and server-side rendering — all three need `(state, action) => state` to be deterministic.",
        },
        { t: "h", text: "Classic LLD: enough not to be surprised, and no more" },
        {
          t: "list",
          items: [
            "**Parking lot** — the canonical \"can you find entities\" question. `ParkingLot`, `Level`, `Spot` (sized), `Vehicle` (subtyped), `Ticket`, `PricingStrategy`, `SpotAllocationStrategy`. The whole point is that pricing and allocation are strategies, so hourly-versus-flat and nearest-versus-first-free are configuration, not code changes.",
            "**Elevator** — a scheduling problem in disguise. `ElevatorCar` with a direction and a sorted request set, `Request` (external with a direction, internal with a floor), `Dispatcher` holding the scheduling strategy. Say \"SCAN, like a disk elevator algorithm\" and you have answered it.",
            "**Rate limiter** — the one classic that genuinely crosses into HLD. Token bucket for burst tolerance, sliding window log for accuracy at memory cost, sliding window counter for the practical compromise, fixed window for the boundary-burst bug. Know why distributed rate limiting needs a shared store and why that store is usually Redis with a Lua script for atomicity.",
            "**LRU cache** — `Map` plus a doubly linked list for O(1) get, put and eviction; or in JS, exploit `Map` insertion order (delete then re-set on access) and mention that the linked list is what you would write in a language without ordered maps. Then extend to LFU and to TTL eviction.",
            "**Logging framework** — `Logger` with levels, a chain of `Appender`s (console, HTTP, buffer), a `Formatter` strategy, and a level filter. It is chain-of-responsibility plus strategy, and it is a five-minute answer.",
            "Two of these, worked properly on paper, is the correct investment. You are not being hired to design elevators. The goal is that the *format* never surprises you — entities, relationships, strategies, extension points — because the format transfers directly to the frontend prompts.",
          ],
        },
        { t: "h", text: "How to run the round" },
        {
          t: "steps",
          items: [
            {
              title: "Clarify scope and pin the non-goals — 3 minutes",
              text: "\"Is this client-only or does the server own sorting and pagination? Do we need i18n, RTL, a11y to WCAG AA? Is this a library other teams consume, or one product surface?\" Then state what you are excluding. An LLD prompt with no constraints is a trap; the candidate who narrows it is the one who ships.",
            },
            {
              title: "Design the public API out loud — 8 minutes",
              text: "Write the consumer code first. For a component that is the prop interface; for a class problem it is the method signatures. This is the single biggest differentiator between mid and senior answers, because it proves you think about the people who will use your code rather than the code itself.",
            },
            {
              title: "Name the entities and their one responsibility each — 8 minutes",
              text: "A short list: entity, what it owns, what it never touches. \"FieldRegistry owns the map of name to DOM ref and rules; it never validates.\" If you cannot state an entity's responsibility in one clause, it is two entities.",
            },
            {
              title: "Draw the relationships and the data flow — 5 minutes",
              text: "Who holds a reference to whom, who subscribes to whom, and where state lives. Composition over inheritance, every time, and say why: inheritance couples you to the parent's future, composition does not.",
            },
            {
              title: "Volunteer extension points, trade-offs and failure modes — 10 minutes",
              text: "\"Sorting is a per-column comparator so a new type needs no core change. Async validation is debounced and cancellable, otherwise you get out-of-order errors. Virtualisation costs find-in-page. Here is what I would drop if the deadline halved.\" Interviewers score the trade-off discussion far more heavily than the class diagram, and this is where most candidates run out of things to say.",
            },
          ],
        },
        {
          t: "list",
          items: [
            "For any component prompt, decide state ownership first and support both controlled and uncontrolled per feature.",
            "Columns and rules are data, not code. A registry plus a strategy signature is how a component stays open for extension.",
            "The store is `getState`, `dispatch`, `subscribe`; middleware is a decorator chain built with right-to-left composition.",
            "Two classic problems on paper is enough. The format transfers; the domain does not.",
            "Run the round: scope, public API, entities, relationships, extension points and trade-offs. Never start with a class diagram.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Restate each SOLID principle as a frontend code smell plus its fix, without using the words 'animal', 'shape' or 'interface' abstractly.",
    "Explain the difference between a boolean prop that describes state and one that describes layout, and why only the second breaks open/closed.",
    "Explain what Liskov substitution means for a family of form controls, and what breaks in a form library when one control's onChange payload differs.",
    "Explain dependency inversion in React using context, and state the two things it buys you that a direct import does not.",
    "Explain the observer pattern in-process and then at system scale, using your Kafka-to-SSE pipeline as the distributed example.",
    "Explain why an event emitter must copy its listener set before iterating during emit, and what bug appears if it does not.",
    "Explain why useSyncExternalStore is the correct binding for an external store, and what tearing means under concurrent rendering.",
    "Explain the difference between strategy and factory, and why a registry is the extension point in both.",
    "Argue that a React HOC is the decorator pattern, then explain the three problems HOCs have that hooks solve and the one thing hooks cannot do.",
    "Explain how the command pattern makes undo/redo trivial, and why a new action must clear the redo stack.",
    "Explain when a singleton is correct on the client and why the same singleton is a bug under server-side rendering.",
    "Describe how a form library achieves minimal re-renders, covering ref-held state, per-path subscriptions and uncontrolled inputs.",
    "Describe the full submit lifecycle of a form, including double-submit guarding, focus management and mapping 422 field errors back onto fields.",
    "Explain why 'select all' on a 50,000-row virtualised table cannot be an array of ids, and what to send instead.",
    "Explain why Redux middleware is function composition, and trace what happens to an action passed through logger, thunk and a bridge middleware.",
    "Explain why reducers must be pure, naming the three capabilities that depend on it.",
  ],

  math: [
    {
      title: "Observer / EventEmitter",
      formula: "on(ev, fn) -> unsubscribe · off(ev, fn) · once(ev, fn) · emit(ev, payload) -> boolean",
      note: "Map<string, Set<fn>> internally: Set gives O(1) removal and dedupes handlers. Return the unsubscribe function from on, copy the set before iterating in emit, and isolate errors so one bad subscriber cannot break the fan-out. This is the base of stores, SSE bridges and Kafka consumers alike.",
    },
    {
      title: "Strategy behind a registry",
      formula: "type Rule = (value, ctx) => string | null | Promise<string | null>; registry: Record<string, (...opts) => Rule>",
      note: "One signature for sync and async so the runner never branches. Adding a validator, comparator or pricing rule becomes a registry entry rather than a switch branch. Order the rules cheap-to-expensive and short-circuit on the first failure.",
    },
    {
      title: "Factory by type",
      formula: "const registry = { [type]: Impl }; create(type, props) => registry[type] ?? Fallback",
      note: "Config-driven rendering, widget dashboards and client construction all reduce to this. Always define the fallback: an unknown type from a server-driven layout must degrade, not crash the page.",
    },
    {
      title: "Adapter at the boundary",
      formula: "adapt(foreignShape) -> DomainShape   // exactly one per foreign source",
      note: "Translate once, at the edge. The test is whether a field rename in a legacy endpoint touches one file or forty components. Also the correct place to normalise dates, units and null-versus-absent.",
    },
    {
      title: "Decorator / HOC",
      formula: "withX(Wrapped) -> Decorated  // same props, forwardRef, displayName, hoist statics",
      note: "Contract preservation is what makes it a decorator rather than a rewrite. Forget forwardRef and every consumer that needed the DOM node breaks silently. Hooks for behaviour, decorators when you must control whether the wrapped thing renders at all.",
    },
    {
      title: "Command + history stack",
      formula: "interface Command { label; do(state) -> state; undo(state) -> state }  ·  execute · undo · redo",
      note: "Two stacks. Executing a new command clears the redo stack, because history is a tree and you have just chosen a branch. Bound the done stack or a long editing session leaks. Commands are serialisable, which is what makes them auditable and replayable.",
    },
    {
      title: "Singleton + Facade (API client)",
      formula: "class ApiClient { get · post · put · delete }  ·  export const api = new ApiClient(config)",
      note: "One instance owns tokens, refresh-in-flight deduplication, retry, tracing headers, error normalisation and cancellation. Inject it through context rather than importing it, so tests and SSR can substitute. On the server, module-level state is shared across requests: create per-request instances.",
    },
    {
      title: "Builder",
      formula: "new QueryBuilder().where(f, op, v).orderBy(f, dir).limit(n).build() -> Query",
      note: "Earn it: a builder is justified when the object is invalid until build() and there are many optional parts. Otherwise an options object is simpler and easier to type. Each method returns this; build() validates and freezes.",
    },
    {
      title: "Form store core",
      formula: "createFormStore(defaults) -> { register(name, rules) -> {ref,onChange,onBlur}, subscribe(path, cb) -> unsub, setFieldValue, getState }",
      note: "Authoritative state in a ref, per-path subscriptions notifying the path plus every ancestor, inputs uncontrolled. That is the entire minimal-re-render story, and it is the first thing a good interviewer probes.",
    },
    {
      title: "Data table pipeline",
      formula: "rows = slicePage(applySort(applyFilters(data, filters), sort), page)  // each stage skippable when the server owns it",
      note: "Order is load-bearing: filter, then sort, then page. Memoise each stage separately so a page change does not re-filter 50,000 rows. Reset page to 1 whenever filters change, or the user lands on an empty page.",
    },
    {
      title: "Redux store + middleware chain",
      formula: "createStore(reducer, preloaded, enhancer) -> { getState, dispatch, subscribe }  ·  mw = store => next => action => result",
      note: "Middleware is a decorator over dispatch, assembled with right-to-left compose. Thunk works by not calling next; logger works by calling next between two getState reads. Returning the result of next is what makes awaiting a dispatched thunk possible.",
    },
    {
      title: "Token bucket rate limiter",
      formula: "tokens = min(capacity, tokens + (now - last) * refillPerMs); allow = tokens >= 1 && (tokens -= 1, true)",
      note: "The classic LLD problem that crosses into HLD. Lazy refill means no timer: compute tokens on demand from elapsed time. Capacity is your burst allowance, refill rate is the sustained limit. Distributed, this must be atomic — Redis with a Lua script, or a shared counter with compare-and-swap.",
    },
  ],

  practice: [
    { type: "theory", q: "Take one component from your Jio component library that accumulated layout booleans. Rewrite its API using slots or compound components, and write the migration note you would send the four engineers you lead." },
    { type: "math", q: "Design a form library on paper in 45 minutes: public API, entities, state shape, validation contract, submit lifecycle. Then implement register, subscribe and handleSubmit for real in 60 minutes." },
    { type: "math", q: "Implement the per-path subscription core: subscribe(path, cb) and notify(path) that wakes the path and every ancestor. Prove with a test that writing items.3.qty notifies subscribers of items, items.3 and the root." },
    { type: "math", q: "Add async validation to your form: debounced 300ms, AbortController per field, plus a runId guard. Write a test that fires two overlapping validations and asserts the stale result is discarded." },
    { type: "math", q: "Design a data table prop API in 30 minutes. For each of sort, filter, pagination and selection, decide controlled versus uncontrolled and justify it. Then explain how manualPagination changes the pipeline." },
    { type: "math", q: "Implement createStore with getState, dispatch and subscribe in 15 minutes from memory, including the guards against reading state during a reduce and dispatching from a reducer." },
    { type: "math", q: "Implement applyMiddleware and compose, then write logger, thunk and a timing middleware. Trace on paper the exact call order for one dispatched thunk." },
    { type: "math", q: "Implement an undo/redo stack for a spreadsheet-style editable table using command objects. Bound the history at 100 and handle the redo-branch invalidation." },
    { type: "math", q: "Implement an EventEmitter with on, off, once and emit that returns unsubscribe functions, copies before iterating, and isolates subscriber errors. 20 minutes." },
    { type: "math", q: "Design an analytics SDK: event batching by size and time, an in-memory queue with an offline buffer in IndexedDB, retry with backoff, sampling, and sendBeacon on pagehide. Write the class skeleton." },
    { type: "math", q: "Design a feature-flag client: evaluate(flag, context), a local cache, streaming updates over SSE, SSR-safe defaults, and no flicker on hydration. Say explicitly what happens when the flag service is unreachable." },
    { type: "math", q: "Design a toast system: a queue with a max visible count, dedupe by key, per-toast auto-dismiss timers that pause on hover, and aria-live announcements. Handle the imperative toast(...) API from outside React." },
    { type: "math", q: "Design a client-side router: route matching with params and wildcards, nested routes, guards, lazy loading, scroll restoration, and blocking navigation on a dirty form." },
    { type: "math", q: "Design an image-upload widget: drag and drop, client-side resize and EXIF orientation, chunked resumable upload, per-file progress, concurrency limit of 3, retry, and cancel." },
    { type: "math", q: "Design a permissions layer: a can(action, resource) evaluator, role and attribute rules, a usePermissions hook, a withPermission decorator, and route-level gating. State where the server must re-check." },
    { type: "math", q: "Implement an LRU cache with O(1) get, put and eviction. Do it once with a doubly linked list and once exploiting Map insertion order, then add TTL." },
    { type: "math", q: "Design a parking lot and an elevator on paper, 25 minutes each. Identify every strategy you would extract. Then stop — that is your entire classic-LLD budget." },
  ],

  resources: [
    { label: "refactoring.guru — Design Patterns. The best-explained catalogue online, with real problem statements before the diagrams. Read Observer, Strategy, Factory Method, Adapter, Decorator, Command and Facade; skip the rest for now.", url: "https://refactoring.guru/design-patterns", kind: "docs" },
    { label: "patterns.dev — patterns written specifically for modern JavaScript and React, including HOCs, render props, container/presentational and the module pattern. Closest thing to a syllabus for this module.", url: "https://www.patterns.dev/", kind: "docs" },
    { label: "React Hook Form source — read useForm, createFormControl and the subscription logic. This is the reference implementation for the form-library prompt, and reading it once is worth ten articles about it.", url: "https://github.com/react-hook-form/react-hook-form", kind: "repo" },
    { label: "TanStack Table — the most thoughtfully designed table prop API in the ecosystem. Study how column definitions, the row model pipeline and the controlled/uncontrolled split are organised before you design your own.", url: "https://tanstack.com/table/latest", kind: "repo" },
    { label: "Redux — Implementing Store Enhancers and the middleware source. Short, and the clearest real-world example of decorator plus composition you will find.", url: "https://redux.js.org/understanding/history-and-design/middleware", kind: "docs" },
    { label: "React docs — useSyncExternalStore. The official answer for binding an external store to React, and the explanation of tearing you should be able to give when asked.", url: "https://react.dev/reference/react/useSyncExternalStore", kind: "docs" },
    { label: "Kent C. Dodds — Advanced React Patterns. Compound components, prop collections, state reducers and control props: the vocabulary for every 'design this component' round.", url: "https://kentcdodds.com/blog/advanced-react-patterns", kind: "blog" },
    { label: "Clean Code / Clean Architecture — Robert C. Martin. Read only the SOLID chapters, and read them for the reasoning about axes of change rather than the Java.", url: "https://www.goodreads.com/book/show/18043011-clean-architecture", kind: "book" },
    { label: "Head First Design Patterns, 2nd ed. — the only patterns book that explains motivation before mechanism. Chapters on Strategy, Observer, Decorator and Command map one-to-one onto this module.", url: "https://www.oreilly.com/library/view/head-first-design/9781492077992/", kind: "book" },
    { label: "GreatFrontEnd — System Design (frontend). Structured walkthroughs of exactly these prompts: autocomplete, data table, image carousel, chat, news feed. The closest match to what you will actually be asked.", url: "https://www.greatfrontend.com/system-design", kind: "course" },
    { label: "Frontend at Scale — Architecture and design newsletter aimed at senior and staff frontend engineers. Good for the trade-off language that scores in the last ten minutes of an LLD round.", url: "https://frontendatscale.com/", kind: "blog" },
  ],
};

export default p10;
