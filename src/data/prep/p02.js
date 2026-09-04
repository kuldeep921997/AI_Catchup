const p02 = {
  id: "p02",
  week: 2,
  hours: 9,
  title: "TypeScript for Large Frontends",
  tag: "Fundamentals",
  why: "You list TypeScript as a primary skill, which means it gets probed properly rather than with \"do you use interfaces\". At senior level the question is whether you use the type system to make bad states unrepresentable, or whether you use it as documentation with extra steps. The highest-value idea in this module is modelling state as a discriminated union instead of four independent booleans — it is the one change that removes whole classes of bug from a codebase the size of the platform you own.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "Generics, constraints, and the utility types worth knowing cold",
      summary:
        "Generics are parameters for types; constraints are where they earn their keep. Plus the twelve utility types you should be able to use without looking anything up, and the compiler flags that make all of it meaningful.",
      blocks: [
        {
          t: "p",
          text: "A generic is a **parameter for a type**, resolved at each call site. That is the whole idea. Everything difficult about generics is really about *constraints* — how much you tell the compiler about `T` so it can help you, without telling it so much that the function stops being reusable. Before any of it matters, though, the compiler has to be configured to care.",
        },
        { t: "h", text: "The compiler flags that make types mean something" },
        {
          t: "table",
          head: ["Flag", "What it catches", "Why it matters here"],
          rows: [
            ["`strictNullChecks`", "`null` and `undefined` are no longer assignable to every type", "The single highest-value flag. Without it, `T | undefined` is meaningless and every optional chain is guesswork."],
            ["`noImplicitAny`", "Parameters and variables the compiler could not infer", "Stops `any` leaking in silently at function boundaries."],
            ["`strictFunctionTypes`", "Unsound parameter bivariance in function *type* positions", "Why a handler taking `Dog` cannot be passed where one taking `Animal` is expected. Methods are still bivariant — know that exception."],
            ["`strictPropertyInitialization`", "Class fields never assigned in the constructor", "Mostly matters if you still have classes; pairs with `strictNullChecks`."],
            ["`useUnknownInCatchVariables`", "`catch (e)` typed as `any`", "Forces you to narrow before using `e.message`. Real bugs live here."],
            ["`noUncheckedIndexedAccess`", "`arr[i]` and `record[key]` pretending they always return a value", "Not part of `strict`. Turn it on deliberately — it is noisy, and it is right."],
            ["`exactOptionalPropertyTypes`", "Distinguishes \"absent\" from \"present but `undefined`\"", "Matters when you PATCH: `{ locked: undefined }` and `{}` mean different things to an API."],
            ["`noImplicitOverride`", "Methods that shadow a base method without saying so", "Cheap safety on class hierarchies."],
          ],
        },
        {
          t: "p",
          text: "`strict: true` turns on the first five. The last three are separate opt-ins. On a codebase your size the honest answer in an interview is \"`strict` is on everywhere; `noUncheckedIndexedAccess` is on in the shared library and staged in the app\" — that shows you understand the migration cost, not just the ideal.",
        },
        { t: "h", text: "Generics: inference first, annotation second" },
        {
          t: "code",
          lang: "typescript",
          caption: "Let inference do the work; annotate the inputs, not the outputs",
          code: `function first<T>(items: T[]): T | undefined {
  return items[0];
}

first([1, 2, 3]);          // T inferred as number
first(["a", "b"]);         // T inferred as string

// Multiple parameters, and a default for the second.
type ApiResult<TData, TError = Error> =
  | { ok: true; data: TData }
  | { ok: false; error: TError };

// Inference flows through the call, so the return type stays specific.
const stamp = <T,>(value: T) => ({ value, at: Date.now() });
const s = stamp({ sku: "TR-4410" });
//    ^? { value: { sku: string }; at: number }`,
        },
        { t: "h", text: "Constraints are where the value is" },
        {
          t: "code",
          lang: "typescript",
          caption: "The constrained getter is the pattern to know cold",
          code: `// Unconstrained T knows nothing at all. This does not compile.
function len<T>(x: T) { return x.length; }   // Error: no 'length' on 'T'

// Constrain to the shape you need and keep the caller's specific type.
function len2<T extends { length: number }>(x: T) { return x.length; }

// keyof gives a union of key names. The classic two-parameter getter:
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const store = { id: "S117", brand: "Trends", stockValue: 4_210_000 };

get(store, "brand");        // string
get(store, "stockValue");   // number
get(store, "sku");          // Error: not assignable to "id" | "brand" | "stockValue"

// Constrain to only the keys whose value type matches - useful for
// generic table columns that must be numeric to be summable.
type KeysOfType<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T];

type NumericColumns = KeysOfType<typeof store, number>;   // "stockValue"`,
        },
        {
          t: "note",
          tone: "insight",
          title: "When to reach for a generic at all",
          text: "A generic is only justified when a type appears in **at least two positions** and the relationship between them matters — input and return, or two arguments that must agree. If `T` appears once, you wanted a union or `unknown`, not a generic. `function log<T>(x: T)` is a `function log(x: unknown)` wearing a costume, and interviewers notice.",
        },
        { t: "h", text: "The utility types worth knowing cold" },
        {
          t: "table",
          head: ["Utility", "Signature in words", "Reach for it when"],
          rows: [
            ["`Partial<T>`", "Every property optional", "PATCH payloads, form drafts, default-merging"],
            ["`Required<T>`", "Every property mandatory", "After validation, to express \"this has been checked\""],
            ["`Pick<T, K>`", "Keep only keys `K`", "Narrowing a wide row type down to what a list cell needs"],
            ["`Omit<T, K>`", "Drop keys `K`", "Building a create-payload from an entity by removing `id`"],
            ["`Record<K, V>`", "Object with keys `K`, values `V`", "Lookups keyed by a closed union — forces exhaustive maps"],
            ["`ReturnType<F>`", "What `F` returns", "Deriving `RootState` from `store.getState`, never restating it"],
            ["`Parameters<F>`", "Tuple of `F`'s arguments", "Wrappers, decorators, mock factories in tests"],
            ["`Awaited<T>`", "Unwrap `Promise`, recursively", "The resolved shape of an async function"],
            ["`NonNullable<T>`", "Remove `null` and `undefined`", "After an assertion or a filter"],
            ["`Readonly<T>`", "Shallow freeze at the type level", "Props, and store state you do not want mutated"],
            ["`Exclude<U, X>` / `Extract<U, X>`", "Filter a union out / in", "Narrowing string-literal unions, splitting variants"],
            ["`NoInfer<T>` (5.4+)", "Block a position from driving inference", "Fixing generics that widen from the wrong argument"],
          ],
        },
        {
          t: "code",
          lang: "typescript",
          caption: "The same six utilities, in the shape real code takes",
          code: `interface StoreRow {
  id: string;
  brand: Brand;
  stockValue: number;
  updatedAt: string;
  locked?: boolean;
}

// A patch payload: everything optional EXCEPT the id.
type StorePatch = Partial<Omit<StoreRow, "id">> & Pick<StoreRow, "id">;

// A lookup keyed by a closed union. Miss a brand and it will not compile -
// that is the entire reason to use Record instead of an index signature.
type Brand = "Trends" | "Digital" | "Mart" | "AJIO" | "Smart" | "Fresh";

const brandColour: Record<Brand, string> = {
  Trends: "#e1113b", Digital: "#0066cc", Mart: "#00a878",
  AJIO:   "#7a3cf0", Smart:   "#f28500", Fresh: "#2bb673",
};

// Derive from the function; never restate its shape by hand.
async function fetchStores(page: number, brand: Brand): Promise<StoreRow[]> {
  return [];
}

type FetchArgs   = Parameters<typeof fetchStores>;         // [number, Brand]
type FetchReturn = ReturnType<typeof fetchStores>;         // Promise<StoreRow[]>
type Stores      = Awaited<FetchReturn>;                   // StoreRow[]
type Locked      = NonNullable<StoreRow["locked"]>;        // boolean
type ListCell    = Pick<StoreRow, "id" | "brand" | "stockValue">;`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Two sharp edges on Omit and Partial",
          text: "`Omit<T, K>` does **not** check that `K` exists on `T` — `Omit<StoreRow, \"identifier\">` compiles happily and silently omits nothing, so a rename leaves dead code behind. Guard it with `Omit<T, keyof T & K>` or a `StrictOmit` helper. And `Partial<T>` is **shallow**: nested objects stay fully required, which is why every codebase eventually hand-rolls a recursive `DeepPartial`. Naming both of these unprompted reads as someone who has maintained types, not just written them.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "A generic is only earning its keep if `T` appears in two related positions.",
            "Constraints are the interesting half. `K extends keyof T` returning `T[K]` is the pattern you will write in an interview.",
            "Derive types from values (`typeof`, `ReturnType`, `Awaited`) instead of maintaining a parallel copy by hand.",
            "`Record` over an index signature whenever the key space is closed — it turns a missing case into a compile error.",
            "Know which flags `strict` includes and which it does not; `noUncheckedIndexedAccess` is the one worth arguing for.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 22,
      title: "Conditional types, `infer`, and mapped types",
      summary:
        "The type-level programming that separates people who use TypeScript from people who can extend it: conditional types, extracting with `infer`, distributivity, key remapping with `as`, and template literal types.",
      blocks: [
        {
          t: "p",
          text: "This is the part of the language that looks like magic until you notice it is three constructs: a ternary (`extends ? :`), a pattern-match variable (`infer`), and a loop (`[K in keyof T]`). Every clever type in every library you use is built from those three. Being able to write `ReturnType` from scratch is the standard proof that you understand them, and it comes up constantly.",
        },
        { t: "h", text: "A conditional type is a ternary for types" },
        {
          t: "code",
          lang: "typescript",
          caption: "`extends` here means \"is assignable to\", not \"inherits from\"",
          code: `type IsArray<T> = T extends readonly unknown[] ? true : false;

type A = IsArray<string[]>;    // true
type B = IsArray<string>;      // false

// Nesting gives you a lookup table at the type level.
type TypeName<T> =
  T extends string    ? "string" :
  T extends number    ? "number" :
  T extends boolean   ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function  ? "function" : "object";

type C = TypeName<() => void>;   // "function"

// Conditionals are how you make one function signature serve two shapes.
type Response<T> = T extends { paginated: true }
  ? { items: unknown[]; cursor: string | null }
  : { item: unknown };`,
        },
        { t: "h", text: "`infer` names the thing you matched" },
        {
          t: "p",
          text: "`infer R` inside an `extends` clause says: *match this shape, and bind whatever sat in that slot to `R`*. It is regex capture groups for types. Almost every utility type in `lib.es5.d.ts` is a conditional with one `infer` in it.",
        },
        {
          t: "code",
          lang: "typescript",
          caption: "Build the standard library yourself — this is the classic exercise",
          code: `// The real definition, near enough. Write this from memory.
type MyReturnType<F> =
  F extends (...args: never[]) => infer R ? R : never;

type MyParameters<F> =
  F extends (...args: infer P) => unknown ? P : never;

// Recursive: unwrap nested promises down to the value.
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type X = MyAwaited<Promise<Promise<StoreRow[]>>>;   // StoreRow[]

// Array and tuple destructuring at the type level.
type ElementOf<A> = A extends readonly (infer E)[] ? E : never;

type Head<A extends readonly unknown[]> =
  A extends readonly [infer H, ...unknown[]] ? H : never;

type Last<A extends readonly unknown[]> =
  A extends readonly [...unknown[], infer L] ? L : never;

type Y = Last<[string, number, boolean]>;           // boolean

// Why 'never[]' and not 'any[]' in the parameter position: 'never' is the
// bottom type, so it is assignable to every parameter type. Using 'any[]'
// also works but weakens strictFunctionTypes checking.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Where `infer` sits changes the answer",
          text: "In a **covariant** position (a return type) multiple candidates for the same `infer` variable are combined with a *union*; in a **contravariant** position (a parameter) they are combined with an *intersection*. That single fact is how `UnionToIntersection` is built, and it is the follow-up question when you get `ReturnType` right too quickly. You do not need to derive it under pressure — you need to say the words \"parameters are contravariant, so the candidates intersect\".",
        },
        { t: "h", text: "Distributivity — the behaviour that bites" },
        {
          t: "code",
          lang: "typescript",
          caption: "A naked type parameter distributes over unions. Everything follows from this.",
          code: `type ToArray<T> = T extends unknown ? T[] : never;
type A = ToArray<string | number>;      // string[] | number[]   <- distributed!

// Wrap the parameter in a tuple to switch distribution OFF.
type ToArrayFlat<T> = [T] extends [unknown] ? T[] : never;
type B = ToArrayFlat<string | number>;  // (string | number)[]

// Distribution is exactly what makes these one-liners work.
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

type Status = "idle" | "loading" | "success" | "error";
type Settled = MyExclude<Status, "idle" | "loading">;   // "success" | "error"

// The nasty case: 'boolean' is secretly 'true | false', so it distributes.
type IsTrue<T> = T extends true ? "yes" : "no";
type C = IsTrue<boolean>;               // "yes" | "no", not "no"`,
        },
        { t: "h", text: "Mapped types, and key remapping with `as`" },
        {
          t: "code",
          lang: "typescript",
          caption: "A loop over keys, plus the ability to rename or delete them",
          code: `// Modifiers: '?' and 'readonly' can be added or removed with + / -.
type Mutable<T>     = { -readonly [K in keyof T]: T[K] };
type Concrete<T>    = { [K in keyof T]-?: T[K] };
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 'as' remaps the key. Combine it with template literal types to generate
// names, and with 'never' to filter keys out entirely.
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};

type StoreGetters = Getters<{ id: string; stockValue: number }>;
// { getId: () => string; getStockValue: () => number }

type Handlers<T> = {
  [K in keyof T as \`on\${Capitalize<K & string>}Change\`]?: (next: T[K]) => void;
};

// Filtering: map a key to 'never' and it disappears from the result.
type OnlyFunctions<T> = {
  [K in keyof T as T[K] extends (...a: never[]) => unknown ? K : never]: T[K];
};`,
        },
        { t: "h", text: "Template literal types" },
        {
          t: "code",
          lang: "typescript",
          caption: "String types with structure — cheap, and surprisingly useful",
          code: `type Brand = "Trends" | "Digital" | "Mart";
type Action = "created" | "updated" | "depleted";

// Cross-product: 9 members, generated, always in sync with the sources.
type StockEvent = \`stock.\${Lowercase<Brand>}.\${Action}\`;
// "stock.trends.created" | "stock.trends.updated" | ...

type CssVar = \`--\${string}\`;
type Route  = \`/stores/\${string}/inventory\`;
type Px     = \`\${number}px\`;

// Parse a string type back apart with infer.
type ParseEvent<S> = S extends \`\${infer Domain}.\${infer Rest}\`
  ? { domain: Domain; rest: Rest }
  : never;

// The real payoff: an SSE topic map that cannot drift from the emitter.
type Topics = { [E in StockEvent]: (payload: { sku: string; delta: number }) => void };`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "The Kafka-over-SSE layer is the natural story here. Event names arriving as strings are the classic place where a producer rename silently breaks a consumer at runtime. \"I generated the topic union with a template literal type and keyed the handler map off it, so an unhandled event became a compile error instead of a support ticket\" is a much stronger answer than \"we used TypeScript\". Have the union-of-topics detail ready — it is concrete and it is clearly yours.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Type-level code has a runtime cost — at build time",
          text: "Deeply recursive conditionals, large cross-products and unions over a few thousand members will make `tsc` and your editor crawl, and TypeScript will eventually refuse with \"type instantiation is excessively deep\". On a 50-component library that is a real productivity tax. Measure with `tsc --diagnostics` or `--generateTrace`, and be willing to say \"the clever type was not worth the four-second editor lag\".",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Three constructs: `extends ? :` is the ternary, `infer` is the capture group, `[K in keyof T]` is the loop.",
            "`MyReturnType<F> = F extends (...a: never[]) => infer R ? R : never` — write it from memory.",
            "A naked type parameter distributes over unions; `[T] extends [U]` turns that off.",
            "`as` in a mapped type renames keys; mapping a key to `never` deletes it.",
            "Template literal types keep string unions in sync with the things that generate them.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 20,
      title: "Discriminated unions: making bad states unrepresentable",
      summary:
        "The highest-value practical idea in the module. Replace independent booleans with one tagged union, get exhaustiveness for free via `never`, and learn where `satisfies` and type predicates belong.",
      blocks: [
        {
          t: "p",
          text: "Four booleans describe sixteen states. Your feature has four. The other twelve are bugs waiting for a slow network, and every one of them has to be defended against by hand in the component. A discriminated union removes them from the type system entirely — the illegal combination becomes unwritable rather than merely unlikely. If you take one thing from this module into your next code review, take this.",
        },
        {
          t: "code",
          lang: "typescript",
          caption: "The same feature, modelled twice",
          code: `// Anti-pattern. 2^3 = 8 combinations, 5 of them meaningless.
type Bad = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  data?: StoreRow[];
  error?: Error;
};
// What does { isLoading: true, isError: true } render?
// Why is 'data' optional when we have "succeeded"?
// Who resets 'error' on retry? (Nobody. That is the bug.)

// Model it as a state machine. Four states, and each carries exactly
// the data that is valid IN that state - and nothing else.
type Fetch<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; fetchedAt: number }
  | { status: "error"; error: Error; retryable: boolean };

// Now the compiler enforces the pairing:
declare const s: Fetch<StoreRow[]>;
if (s.status === "success") {
  s.data;          // StoreRow[] - not optional, no '!' needed
  s.error;         // Error: property does not exist on this variant
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Connect it to your own work",
          text: "The inventory dashboard is the perfect vehicle for this answer. A grid that can be loading, streaming live updates over SSE, stale after a dropped connection, or failed is *four states plus a reconnecting one* — and the boolean version of that is where flicker and phantom spinners come from. \"I replaced five booleans in the grid container with a tagged union and deleted the impossible branches\" is a specific, senior, verifiable claim. It also sets you up perfectly if they follow with \"how would you model optimistic stock adjustments\".",
        },
        { t: "h", text: "Exhaustiveness with `never`" },
        {
          t: "code",
          lang: "tsx",
          caption: "Add a variant and the compiler tells you every place to update",
          code: `function assertNever(value: never): never {
  throw new Error("Unhandled variant: " + JSON.stringify(value));
}

function StockPanel({ state }: { state: Fetch<StoreRow[]> }) {
  switch (state.status) {
    case "idle":
      return null;
    case "loading":
      return <GridSkeleton rows={20} />;
    case "success":
      return <Grid rows={state.data} syncedAt={state.fetchedAt} />;
    case "error":
      return <Retry error={state.error} disabled={!state.retryable} />;
    default:
      return assertNever(state);
  }
}

// Add { status: "reconnecting"; since: number } to Fetch<T> and every
// switch that forgot it fails to compile, because the residual union at
// 'default' is no longer 'never'. This is the whole point: refactors
// become a checklist the compiler hands you.`,
        },
        { t: "h", text: "What narrowing actually tracks" },
        {
          t: "list",
          items: [
            "**`typeof`** — for primitives. Remember `typeof null === \"object\"`, so a `null` check has to come first.",
            "**`instanceof`** — for classes and `Error` subclasses. Unreliable across realms (iframes, workers).",
            "**`in`** — for optional properties: `if (\"cursor\" in res)`. The pragmatic tool when there is no tag.",
            "**Truthiness** — narrows out `null`, `undefined`, `\"\"`, `0`, `NaN`. That is a trap for numeric fields: `if (row.stockValue)` skips zero, which is a *real* stock level.",
            "**Literal equality** — `===` against a discriminant. The cheapest and most reliable form.",
            "**Discriminant property** — the tagged-union case, and the only one that scales past three variants.",
            "**Control-flow analysis** — the compiler follows early returns, `throw`, and assignments. It gives up at closure boundaries, which is why a narrowed value goes wide again inside a callback.",
          ],
        },
        { t: "h", text: "Type predicates and assertion functions" },
        {
          t: "code",
          lang: "typescript",
          caption: "Two ways to teach the compiler something it cannot infer",
          code: `// 1. A predicate: returns boolean, narrows the argument in the true branch.
function isStoreRow(v: unknown): v is StoreRow {
  return (
    typeof v === "object" && v !== null &&
    typeof (v as StoreRow).id === "string" &&
    typeof (v as StoreRow).stockValue === "number"
  );
}

// The single best everyday use: making .filter() narrow properly.
const maybe: (StoreRow | null)[] = await loadAll();

const clean1 = maybe.filter((r) => r !== null);           // still (StoreRow | null)[]
const clean2 = maybe.filter((r): r is StoreRow => r !== null);  // StoreRow[]

// 2. An assertion function: returns void, narrows everything AFTER the call.
function assertDefined<T>(v: T, what: string): asserts v is NonNullable<T> {
  if (v == null) throw new Error(what + " was " + String(v));
}

const row = rows.find((r) => r.id === id);
assertDefined(row, "row");
row.stockValue;      // narrowed from StoreRow | undefined`,
        },
        {
          t: "note",
          tone: "warn",
          title: "A predicate is a promise the compiler cannot check",
          text: "`v is StoreRow` is an **assertion**, not a proof. Write `return true` in the body and TypeScript believes you, then your app crashes at runtime with a type error the type system said was impossible. Predicates are only as good as the checks inside them, which is the real argument for a runtime schema validator: `zod` derives the type *from* the validator with `z.infer`, so there is one source of truth instead of a hand-written predicate that drifts. At any trust boundary — network, `localStorage`, URL params, `postMessage` — parse, do not assert.",
        },
        { t: "h", text: "`satisfies`: the operator that fixed a real annoyance" },
        {
          t: "code",
          lang: "typescript",
          caption: "Check against a type without losing the literal types",
          code: `type ColumnDef = { header: string; width: number; align?: "left" | "right" };

// Annotation: checked, but 'keyof typeof' is now widened to string.
const colsA: Record<string, ColumnDef> = {
  sku: { header: "SKU", width: 120 },
  qty: { header: "Qty", width: 64, align: "right" },
};
colsA.typo;                       // no error - the keys were forgotten

// 'as': no widening, but also no checking. Never use it here.
const colsB = { sku: { header: "SKU", width: "120" } } as Record<string, ColumnDef>;

// 'satisfies': checked AND the literal shape is preserved.
const cols = {
  sku: { header: "SKU", width: 120 },
  qty: { header: "Qty", width: 64, align: "right" },
} satisfies Record<string, ColumnDef>;

type ColumnKey = keyof typeof cols;   // "sku" | "qty"
cols.qty.align;                       // "right", not the whole union
cols.typo;                            // Error, as it should be`,
        },
        {
          t: "table",
          head: ["Form", "Checks the value?", "Keeps literal types?", "Use for"],
          rows: [
            ["`const x: T = {...}`", "Yes", "No — widens to `T`", "Values you only ever read through `T`"],
            ["`const x = {...} as T`", "No — it silences", "No", "Almost never. An `as` in a review needs a comment justifying it."],
            ["`const x = {...} as const`", "No", "Yes, deeply readonly", "Frozen tables of literals with no target type"],
            ["`const x = {...} satisfies T`", "Yes", "Yes", "Config objects, column maps, route tables, theme tokens"],
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Independent booleans multiply states; a discriminated union enumerates them. Prefer the union every time.",
            "`default: return assertNever(state)` turns \"we added a state\" into a compile-time checklist.",
            "`.filter((x): x is T => ...)` is the predicate you will use weekly.",
            "Predicates are unchecked assertions. At trust boundaries, parse with a schema instead.",
            "`satisfies` when you want checking without widening — which is most config objects.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 18,
      title: "Typing React properly, and a client that types itself",
      summary:
        "`unknown` at the boundaries, generic and polymorphic components, `forwardRef` with generics, module augmentation for types you do not own, and a fully typed API client built from a route map.",
      blocks: [
        {
          t: "p",
          text: "Application types are only as good as their boundaries. Everything that enters your app from outside — `fetch`, `JSON.parse`, `localStorage`, `postMessage`, a URL param — arrives as `any` or `unknown` and gets whatever type you claim for it. Discipline at that seam is what makes the rest of the type system worth having. Then the React-specific work: components that stay generic, and refs that survive it.",
        },
        { t: "h", text: "`unknown`, `any`, `never` — three types people conflate" },
        {
          t: "table",
          head: ["Type", "Position in the system", "Assignable to it", "Assignable from it"],
          rows: [
            ["`any`", "Escape hatch — disables checking in both directions", "Everything", "Everything (this is the hole)"],
            ["`unknown`", "Top type — the safe `any`", "Everything", "Nothing, until you narrow"],
            ["`never`", "Bottom type — the empty set", "Nothing", "Everything (it inhabits no value)"],
            ["`void`", "\"Return value is not to be used\"", "`undefined` (and anything, in callback positions)", "Not comparable — do not use it as a value type"],
            ["`object`", "Any non-primitive", "Objects, arrays, functions", "Nothing useful without narrowing"],
          ],
        },
        {
          t: "code",
          lang: "typescript",
          caption: "`any` is contagious; `unknown` forces a decision at the door",
          code: `// The leak: one 'any' propagates through every downstream inference.
const raw: any = JSON.parse(localStorage.getItem("prefs") ?? "{}");
raw.columns.map((c) => c.widht);       // typo compiles, crashes at runtime

// The gate: 'unknown' cannot be used until you prove what it is.
const parsed: unknown = JSON.parse(localStorage.getItem("prefs") ?? "{}");
parsed.columns;                        // Error - good
const prefs = PrefsSchema.parse(parsed);   // zod: validated, and typed

// 'never' as a design tool, not just an error message.
type Impossible = string & number;                   // never
type Fn = () => never;                               // throws or loops forever
function exhaustive(x: never): never { throw new Error("unreachable"); }

// 'never' also silently deletes union members and mapped-type keys,
// which is why an accidental 'never' shows up as "the property vanished"
// rather than as an error. Look for it when a type mysteriously empties.`,
        },
        { t: "h", text: "Components that stay generic" },
        {
          t: "code",
          lang: "tsx",
          caption: "Typing children, and a generic list that infers its item type",
          code: `import type { ReactNode, PropsWithChildren, ComponentProps } from "react";

// Children: be specific about what you accept.
type A = { children: ReactNode };            // anything renderable, incl. null
type B = { children: ReactNode[] };          // requires 2+ children - rarely what you want
type C = { children: (row: StoreRow) => ReactNode };   // render prop
type D = PropsWithChildren<{ title: string }>;         // sugar for children: ReactNode

// Reuse a DOM element's props instead of listing them.
type ButtonProps = ComponentProps<"button"> & { tone?: "primary" | "ghost" };

// A generic component: T is inferred from 'items' and flows into
// 'renderRow' and 'keyOf', so nothing is 'any' and nothing is restated.
type ListProps<T> = {
  items: readonly T[];
  keyOf: (item: T) => string;
  renderRow: (item: T, index: number) => ReactNode;
  empty?: ReactNode;
};

export function VirtualList<T>({ items, keyOf, renderRow, empty }: ListProps<T>) {
  if (items.length === 0) return <>{empty ?? null}</>;
  return <>{items.map((item, i) => <Row key={keyOf(item)}>{renderRow(item, i)}</Row>)}</>;
}

// Call site: T = StoreRow, inferred. 'row' is typed inside the callback.
<VirtualList
  items={rows}
  keyOf={(row) => row.id}
  renderRow={(row) => <StoreCell brand={row.brand} value={row.stockValue} />}
/>;`,
        },
        { t: "h", text: "`forwardRef` with generics, and the polymorphic `as` prop" },
        {
          t: "code",
          lang: "tsx",
          caption: "Two patterns every design-system author eventually needs",
          code: `import { forwardRef } from "react";
import type { ElementType, ComponentPropsWithoutRef, ForwardedRef, ReactElement } from "react";

// 1. forwardRef erases generics: the returned component is typed with the
// T from the definition site, so a generic T collapses to 'unknown'.
// The accepted fix is to re-cast the wrapper to a generic function type.
type ListWithRef = <T>(
  props: ListProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement | null;

export const List = forwardRef(function ListInner<T>(
  props: ListProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return <div ref={ref}>{/* ... */}</div>;
}) as ListWithRef;

// In React 19 this problem mostly disappears: 'ref' is an ordinary prop,
// so a plain generic function component takes a ref with no wrapper.

// 2. Polymorphic 'as': render as any element, and inherit that element's props.
type PolymorphicProps<E extends ElementType> = {
  as?: E;
  tone?: "primary" | "ghost";
} & Omit<ComponentPropsWithoutRef<E>, "as" | "tone">;

export function Box<E extends ElementType = "div">(
  { as, ...rest }: PolymorphicProps<E>,
) {
  const Tag = as ?? "div";
  return <Tag {...rest} />;
}

<Box as="a" href="/stores" />;        // href allowed, inferred from 'a'
<Box as="button" href="/stores" />;   // Error: 'href' not valid on button`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Both of these have a price, and you should say so",
          text: "The `as ListWithRef` cast is genuinely unchecked — you are asserting the wrapper's signature and TypeScript will not verify it, so it needs a comment and a test. Polymorphic components are worse than they look: every `as` site instantiates a large conditional over `ElementType`, which is one of the most reliable ways to make a component library's type-check time balloon. On a 50-component library, use `as` on the two or three primitives that need it (`Box`, `Text`, `Button`) and nowhere else. \"We deliberately limited polymorphism to the layout primitives because of compile time\" is exactly the kind of trade-off a senior interview is fishing for.",
        },
        { t: "h", text: "Declaration merging and module augmentation" },
        {
          t: "code",
          lang: "typescript",
          caption: "Extending types you do not own — the three cases that come up",
          code: `// 1. Declaration merging: two interfaces with the same name in the same
// scope combine. This is the mechanism behind everything below.
interface Theme { space: (n: number) => string; }
interface Theme { colours: Record<"bg" | "fg" | "brand", string>; }
// Theme now has both members. Note: types (not interfaces) cannot merge.

// 2. Global augmentation - for things genuinely on 'window'.
declare global {
  interface Window {
    __FLAGS__?: Record<string, boolean>;
  }
  namespace NodeJS {
    interface ProcessEnv { VITE_API_BASE: string; }
  }
}

// 3. Module augmentation - teaching a library about your types.
declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}

// The Redux pattern worth copying: derive the store types once, then
// every component gets full inference from two typed hooks.
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Rule: augmentation must live in a module with a top-level import or
// export. A file with no imports is a script, and 'declare global' there
// applies to the global scope in a way you did not intend.`,
        },
        { t: "h", text: "Putting it together: a client that types itself" },
        {
          t: "code",
          lang: "typescript",
          caption: "One route map, and every call site is typed end to end",
          code: `// Describe the surface once.
type Routes = {
  "GET /stores":            { query: { page: number; brand?: Brand }; res: StoreRow[] };
  "GET /stores/:id":        { params: { id: string };                 res: StoreRow };
  "POST /stores/:id/adjust":{ params: { id: string }; body: { delta: number }; res: StoreRow };
};

type Endpoint = keyof Routes;
type Res<E extends Endpoint>     = Routes[E]["res"];
type Options<E extends Endpoint> = Omit<Routes[E], "res">;

// Routes that need nothing take one argument; the rest require options.
type Args<E extends Endpoint> =
  keyof Options<E> extends never ? [endpoint: E] : [endpoint: E, options: Options<E>];

export async function api<E extends Endpoint>(...args: Args<E>): Promise<Res<E>> {
  const [endpoint, options] = args as [E, Options<E> | undefined];
  const [method, template] = endpoint.split(" ") as [string, string];

  const opts = options as { params?: Record<string, string>; query?: object; body?: unknown };
  const path = fillParams(template, opts?.params);

  const res = await fetch(path + toQueryString(opts?.query), {
    method,
    headers: { "content-type": "application/json" },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) throw new ApiError(res.status, endpoint);

  // The only cast in the whole client. Swap it for a per-route schema
  // parse and the boundary becomes checked rather than asserted.
  return (await res.json()) as Res<E>;
}

api("GET /stores", { query: { page: 1 } });            // -> StoreRow[]
api("GET /stores/:id", { params: { id: "S117" } });    // -> StoreRow
api("GET /stores/:id");                                // Error: options required
api("GET /store/:id", { params: { id: "x" } });        // Error: no such endpoint`,
        },
        {
          t: "note",
          tone: "interview",
          title: "The version of this story to tell",
          text: "This is the design question underneath \"how did you standardise the data layer across 50 components\". The strong framing is: one declaration of the API surface, request and response types derived from it, and a single cast at the deserialisation boundary that a schema parser can replace. Then name the payoff in terms they care about — an endpoint rename becomes a compile error across six brands' worth of screens instead of a runtime 404 someone finds in production. If they push on cost, the honest answer is that the route map has to be generated from the backend contract (OpenAPI, or shared types in a monorepo) or it drifts, and drift is worse than no types at all.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "`unknown` at every boundary, then parse. `any` is not a type, it is the absence of one, and it spreads.",
            "`never` is the bottom type — it deletes union members and mapped keys, so an unexpected `never` looks like a missing property.",
            "Generic components infer `T` from props; keep `keyOf` and `renderRow` as callbacks so `T` flows through.",
            "`forwardRef` erases generics — know the cast workaround, and know React 19 removes the need for it.",
            "Polymorphic `as` is expensive at type-check time. Restrict it to primitives on purpose.",
            "Derive `RootState` from `store.getState`; augment library modules rather than casting at call sites.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain what a generic actually is, and give the rule for when a function should be generic rather than take a union or `unknown`.",
    "Explain the difference between `extends` in a class declaration and `extends` in a conditional type.",
    "Write `ReturnType` from scratch on a whiteboard and explain why the parameter type is `never[]`.",
    "Explain distributive conditional types, show what `ToArray<string | number>` produces, and show how to switch distribution off.",
    "Explain key remapping with `as`, including how mapping a key to `never` removes it.",
    "Explain the difference between `Partial<T>` and a hand-rolled `DeepPartial<T>`, and why the standard library does not ship the latter.",
    "Explain why `Omit<T, K>` does not error on a key that does not exist on `T`, and how you would make it strict.",
    "Make the case for modelling a data-fetching state as a discriminated union instead of `isLoading` / `isError` / `data`, in under ninety seconds.",
    "Explain how `assertNever` gives you exhaustiveness checking, and what error you get when a new variant is added.",
    "List the narrowing mechanisms TypeScript understands, and explain why a narrowed value widens again inside a callback.",
    "Explain why a type predicate is unsound, and when you should reach for a runtime schema validator instead.",
    "Explain the difference between an annotation, `as`, `as const` and `satisfies` on the same object literal.",
    "Explain `unknown` versus `any` versus `never` in terms of assignability in both directions.",
    "Explain why `forwardRef` loses a component's generic parameter, and what changed in React 19.",
    "Explain declaration merging and module augmentation, and why an augmentation file must contain a top-level import or export.",
    "Explain what `strictFunctionTypes` catches, and why methods are exempted from it.",
  ],

  math: [
    {
      title: "Discriminated union state machine",
      formula: "type Fetch<T> = { status:\"idle\" } | { status:\"loading\" } | { status:\"success\"; data:T } | { status:\"error\"; error:E }",
      note: "The single highest-value pattern in the module. N booleans describe 2^N states; a tagged union describes exactly the states that exist, and each variant carries only the data valid in it. Use it for fetching, forms, wizards, websocket connections, uploads.",
    },
    {
      title: "Exhaustiveness guard",
      formula: "function assertNever(x: never): never { throw new Error(\"unreachable\") }  // in the default branch",
      note: "The residual union at `default` is `never` only if every variant was handled. Adding a variant therefore breaks compilation at every incomplete switch — the compiler hands you the refactor checklist.",
    },
    {
      title: "ReturnType from scratch",
      formula: "type ReturnType<F> = F extends (...a: never[]) => infer R ? R : never",
      note: "The canonical conditional-plus-infer exercise. Same skeleton gives Parameters (infer in the args position), Awaited (recursive on Promise<infer U>) and ElementOf (infer inside an array).",
    },
    {
      title: "Constrained key access",
      formula: "function get<T, K extends keyof T>(obj: T, key: K): T[K]",
      note: "The two-parameter generic. Wrong keys fail at compile time and the return type is the specific property type, not a union. Extend it to dotted paths only if asked — that version needs recursive template literal parsing.",
    },
    {
      title: "Key remapping with a template literal",
      formula: "type Handlers<T> = { [K in keyof T as `on${Capitalize<K & string>}`]?: (v: T[K]) => void }",
      note: "Generates prop names from data shape so the two cannot drift. Map a key to `never` in the `as` clause to filter it out. This is how library authors derive event props, getters and CSS-var maps.",
    },
    {
      title: "Distribution control",
      formula: "T extends U ? X : Y   // distributes over unions      vs      [T] extends [U] ? X : Y   // does not",
      note: "A naked type parameter is distributed member by member. Exclude, Extract and NonNullable all depend on that; anything comparing a union as a whole needs the tuple wrapper.",
    },
    {
      title: "Runtime gate at a trust boundary",
      formula: "const data: unknown = await res.json();  const parsed = Schema.parse(data);  // type = z.infer<typeof Schema>",
      note: "Type the boundary as `unknown` and validate once. Deriving the static type from the validator keeps one source of truth; a hand-written `v is T` predicate is an unchecked promise that drifts from reality.",
    },
    {
      title: "Filter with a narrowing predicate",
      formula: "arr.filter((x): x is T => x != null)  // -> T[], not (T | null)[]",
      note: "The predicate you use weekly. Without the annotation `filter` returns the original union, so every downstream access needs a non-null assertion.",
    },
    {
      title: "Generic component signature",
      formula: "function List<T>(props: { items: readonly T[]; keyOf: (i:T)=>string; renderRow: (i:T, n:number)=>ReactNode })",
      note: "T is inferred from `items` and flows into both callbacks. Keep the render function a prop rather than a child element type, or inference breaks and you end up with `unknown`.",
    },
    {
      title: "Polymorphic component props",
      formula: "type Props<E extends ElementType> = { as?: E } & Omit<ComponentPropsWithoutRef<E>, \"as\">",
      note: "Inherits the target element's props so `href` is legal on `as=\"a\"` and illegal on `as=\"button\"`. Expensive to type-check — budget it for layout primitives only.",
    },
    {
      title: "Typed route-map client",
      formula: "api<E extends keyof Routes>(...args: Args<E>): Promise<Routes[E][\"res\"]>",
      note: "One declaration of the API surface; request options via `Omit<Routes[E], \"res\">` and a conditional tuple so parameterless routes take one argument. Exactly one cast, at deserialisation, replaceable by a schema parse.",
    },
  ],

  practice: [
    { type: "math", q: "Implement `MyReturnType`, `MyParameters`, `MyAwaited` (recursive) and `MyExclude` from scratch in 15 minutes, no reference material." },
    { type: "math", q: "Write `DeepPartial<T>` and `DeepReadonly<T>`, then make them behave correctly on arrays, tuples, `Map`, `Set` and functions. 25 minutes." },
    { type: "math", q: "Write `StrictOmit<T, K extends keyof T>` and `StrictExclude`, and a test file proving they reject keys that do not exist." },
    { type: "math", q: "Build `Getters<T>` and `Handlers<T>` using key remapping and template literal types, then add a filter so only string-valued keys produce handlers." },
    { type: "math", q: "Refactor a component that uses `isLoading`, `isError`, `isEmpty` and optional `data` into a four-variant discriminated union with an `assertNever` default. Then add a fifth 'reconnecting' state and count how many compile errors guided you." },
    { type: "math", q: "Write `UnionToIntersection<U>` and explain, in comments, why the contravariant `infer` position produces an intersection. 20 minutes." },
    { type: "math", q: "Build the typed API client from lesson 4 for five real endpoints, including params, query and body, with exactly one cast in the whole file. 40 minutes." },
    { type: "math", q: "Replace that single cast with a per-route `zod` schema so the response is validated as well as typed, and the static type is derived with `z.infer`." },
    { type: "math", q: "Type a generic `<VirtualList<T>>` with `items`, `keyOf`, `renderRow` and an `estimateSize` callback, and confirm `T` is inferred at three different call sites with no explicit type argument." },
    { type: "math", q: "Build a polymorphic `Box` with an `as` prop that correctly allows `href` on anchors and `disabled` on buttons, then measure `tsc --diagnostics` before and after adding it to ten call sites." },
    { type: "math", q: "Write a generic `createStore<S>` with typed `getState`, `setState(partial | updater)` and a `subscribe` returning an unsubscribe function — with no `any` anywhere." },
    { type: "math", q: "Type an SSE event bus: derive the topic union with a template literal type, key the handler map off it, and make an unhandled topic a compile error. 30 minutes." },
    { type: "math", q: "Complete type-challenges 'easy' and 'medium' tiers up to 20 solved problems, writing each solution without looking at the answers." },
    { type: "theory", q: "Explain to a mid-level engineer why four booleans is worse than one union, using a concrete bug from a real screen and no jargon." },
    { type: "theory", q: "Given a PR that adds three `as unknown as T` casts, write the review comments — what you would ask for instead in each case." },
    { type: "theory", q: "Justify enabling `noUncheckedIndexedAccess` on a 200-file codebase to a sceptical tech lead, including a realistic migration plan." },
  ],

  resources: [
    { label: "TypeScript Handbook — Generics, then Conditional Types and Mapped Types. Skip the basics; these three chapters are the whole module in primary-source form.", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html", kind: "docs" },
    { label: "type-challenges — 150+ graded type-level puzzles. The single most efficient way to get fluent at `infer` and mapped types; do the easy and medium tiers.", url: "https://github.com/type-challenges/type-challenges", kind: "repo" },
    { label: "Total TypeScript (Matt Pocock) — the free 'Beginners' and 'Type Transformations' workshops cover exactly the generics-and-conditional-types ground interviewers probe.", url: "https://www.totaltypescript.com/", kind: "course" },
    { label: "React TypeScript Cheatsheet — the community answer to every \"how do I type this component\" question, including forwardRef with generics and polymorphic props.", url: "https://react-typescript-cheatsheet.netlify.app/", kind: "docs" },
    { label: "tsconfig reference — read the `strict` family entry by entry so you can say which flags it includes and which are separate opt-ins.", url: "https://www.typescriptlang.org/tsconfig/", kind: "docs" },
    { label: "Effective TypeScript (Dan Vanderkam) — 83 short, opinionated items. Items on `any`, inference and type design are the ones that change how you write code.", url: "https://effectivetypescript.com/", kind: "book" },
    { label: "TypeScript Deep Dive (Basarat) — free, and the best written explanation of structural typing, variance and declaration merging.", url: "https://basarat.gitbook.io/typescript/", kind: "book" },
    { label: "type-fest — read the source, not just the README. It is a masterclass in practical conditional and mapped types you can lift straight into a codebase.", url: "https://github.com/sindresorhus/type-fest", kind: "repo" },
    { label: "Zod docs — the argument for parsing over asserting at boundaries, and `z.infer` as the way to keep one source of truth.", url: "https://zod.dev/", kind: "docs" },
    { label: "TypeScript 4.9 release notes — the `satisfies` announcement, with the exact problem it was introduced to solve. Worth reading before you explain it out loud.", url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html", kind: "docs" },
    { label: "ts-reset — small library that fixes the standard library's weakest typings (`JSON.parse` returning `any`, `filter(Boolean)` not narrowing). Good discussion fodder on boundary discipline.", url: "https://github.com/total-typescript/ts-reset", kind: "repo" },
  ],
};

export default p02;
