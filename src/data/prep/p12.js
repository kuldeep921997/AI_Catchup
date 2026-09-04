const p12 = {
  id: "p12",
  week: 12,
  hours: 8,
  title: "DSA Maintenance",
  tag: "Interview Rounds",
  why: "You have already finished Blind 150. This module is not about learning data structures — it is about keeping them warm, fast and speakable while you spend your real preparation hours on machine coding. Frontend offers are decided in the machine coding and system design rounds; DSA is a filter you have already passed once and now simply need to not fail.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "The maintenance protocol, and why you must not over-invest here",
      summary:
        "Two timed problems a day, 25 minutes each, forever. Why consistency beats volume at this stage, how to budget DSA against machine coding, and the honest ceiling on what more grinding buys you.",
      blocks: [
        {
          t: "p",
          text: "Say this plainly to yourself once and then act on it: **you are done learning DSA for this campaign**. Blind 150 is complete. Every further hour you put into LeetCode has sharply diminishing returns, because the marginal problem teaches you a pattern you have already seen. Meanwhile the round that actually decides a senior frontend offer — machine coding — is the one you are still improving at. Every hour is a choice between the two, and the correct allocation is roughly **80/20 against DSA**.",
        },
        {
          t: "p",
          text: "But you cannot drop it to zero. Recall decays fast and unevenly. Three weeks without touching a graph problem and you will spend eight minutes of a 45-minute screen remembering how to write a BFS queue — which is not a knowledge failure, it is a fluency failure, and the interviewer cannot tell the difference. The purpose of this module is to keep the fluency at zero marginal cost.",
        },
        { t: "h", text: "The protocol" },
        {
          t: "steps",
          items: [
            {
              title: "Two problems a day, timed at 25 minutes each",
              text: "Fifty minutes total, ideally first thing before your brain is tired from machine coding work. One medium you have seen before, one medium you have not. Set an actual timer and stop when it fires, solved or not.",
            },
            {
              title: "Write the complexity before you write the code",
              text: "Type the target bound as a comment at the top of the editor first — `// target: O(n) time, O(k) space`. This forces you to plan rather than flail, and it is exactly the habit that makes you sound composed in a live round.",
            },
            {
              title: "If unsolved at 25 minutes, read the solution properly",
              text: "Do not extend the timer. Read the editorial, understand the pattern, close it, and re-implement from scratch immediately. The re-implementation is where the learning happens, not the reading.",
            },
            {
              title: "Log the pattern, not the problem",
              text: "One line in a spreadsheet: problem, pattern, solved yes/no, minutes. You are building a decay map. The patterns with repeated failures are the ones that get spaced revision.",
            },
            {
              title: "Spaced revisit on failures",
              text: "Anything you failed or needed a hint on gets re-solved at day 3, day 10 and day 24. Same problem, cold, no notes. If you solve it clean at day 24 it is genuinely retained; if not, it goes back into the queue.",
            },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The trap this module exists to prevent",
          text: "LeetCode is comfortable. It has a green tick, a progress counter and a clear definition of done. Machine coding has none of that — it is ambiguous, it makes you feel incompetent, and there is no dopamine at the end. So candidates drift back to LeetCode and call it preparation. If you find yourself doing four problems a day in week 3, you are not being diligent, you are avoiding the harder work. Notice it and stop.",
        },
        { t: "h", text: "What the DSA round is actually for at your level" },
        {
          t: "p",
          text: "At SDE-2 to SDE-3 frontend, the DSA screen is a **negative filter**, not a ranking signal. Nobody gets hired because they solved a hard graph problem elegantly. People get rejected because they froze, could not state a complexity, or wrote code that did not compile. The bar is: solve two mediums cleanly, talk while you do it, state the bounds correctly. That is it. Optimising past that bar earns you nothing.",
        },
        {
          t: "table",
          head: ["Round", "Decides the offer?", "Your current state", "Weekly hours"],
          rows: [
            ["DSA screen", "No — pure filter", "Blind 150 done, needs maintenance", "**4-5**"],
            ["Machine coding", "**Yes — the real filter**", "In progress, weakest link", "**14-16**"],
            ["Frontend system design", "Yes", "HLD complete, needs frontend framing", "8-10"],
            ["React / JS deep dive", "Yes", "Strong, needs vocabulary polish", "6-8"],
            ["Behavioural / HM", "Yes, and decides the number", "Unprepared", "4-5"],
          ],
        },
        { t: "h", text: "Frontend DSA screens are easier than backend ones" },
        {
          t: "p",
          text: "This is worth internalising because it changes what you revise. Frontend loops at GCCs and most product companies pitch DSA at **easy-to-medium**, and they lean towards strings, arrays, hash maps and simple recursion. Segment trees, advanced graph algorithms and heavy DP are rare. Where frontend rounds *do* get distinctive is in problems shaped like real UI work — caches, tries, tree traversal, interval merging — which is the whole of lesson 3.",
        },
        {
          t: "note",
          tone: "interview",
          title: "If you get a genuinely hard problem",
          text: "It happens, usually at Flipkart or a bar-raiser round. The recovery is procedural: state the brute force immediately so there is something on the board, say \"that's O(n squared), let me look for structure I can exploit\", then think out loud about what the constraints suggest. An interviewer will almost always nudge a candidate who is reasoning audibly. They cannot nudge silence. Silence is what actually fails you.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "You are maintaining, not learning. Fifty minutes a day, timed, no more.",
            "Every hour past that is an hour stolen from machine coding, which is the round that decides the offer.",
            "State the complexity target *before* coding — it is a planning habit and an interview habit at once.",
            "Log patterns, not problems. Space your failures at days 3, 10 and 24.",
            "The DSA screen is a negative filter. Clear the bar, do not try to win it.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 20,
      title: "The patterns that rust fastest",
      summary:
        "Ten patterns ranked by how quickly they decay, each with the one-line trigger that identifies it and the skeleton you should be able to type from memory in under two minutes.",
      blocks: [
        {
          t: "p",
          text: "Decay is not uniform. Two pointers and hash-map counting stay with you for months because the shape is simple and you use similar logic in real code. Topological sort, union-find and 2D DP fall off a cliff in about three weeks, because the skeleton has fiddly detail that only lives in muscle memory. Revise in that order — spend your maintenance time on the fast-rusting patterns and let the sticky ones look after themselves.",
        },
        {
          t: "table",
          head: ["Pattern", "Decay speed", "Trigger phrase in the problem", "Typical bound"],
          rows: [
            ["Two pointers", "Slow", "\"sorted array\", \"pair sum\", \"in place\"", "O(n) / O(1)"],
            ["Sliding window", "Medium", "\"longest / shortest substring\", \"at most k\"", "O(n) / O(k)"],
            ["Hash map counting", "Slow", "\"frequency\", \"anagram\", \"seen before\"", "O(n) / O(n)"],
            ["BFS / DFS on grid or graph", "Medium", "\"shortest path\", \"islands\", \"connected\"", "O(V+E)"],
            ["Binary search on the answer", "**Fast**", "\"minimum largest\", \"minimise the maximum\"", "O(n log range)"],
            ["Heap / top-K", "Medium", "\"k largest\", \"merge k\", \"median stream\"", "O(n log k)"],
            ["Intervals", "Medium", "\"merge\", \"overlap\", \"meeting rooms\"", "O(n log n)"],
            ["Topological sort", "**Fast**", "\"prerequisite\", \"build order\", \"cycle\"", "O(V+E)"],
            ["1D DP", "Medium", "\"number of ways\", \"min cost to reach\"", "O(n) / O(n)"],
            ["2D DP", "**Fast**", "\"two strings\", \"grid paths\", \"edit distance\"", "O(mn)"],
            ["Trie", "**Fast**", "\"prefix\", \"autocomplete\", \"dictionary\"", "O(L) per op"],
            ["Union-find", "**Fast**", "\"groups\", \"redundant connection\", \"accounts merge\"", "~O(1) amortised"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Revise triggers, not solutions",
          text: "The expensive part of a live round is not writing the code, it is the ninety seconds of panic before you know which pattern applies. Train the mapping from problem phrasing to pattern and you compress that ninety seconds to five. Read a problem statement, say the pattern out loud, and move on without solving it — you can drill twenty problems this way in ten minutes.",
        },
        { t: "h", text: "The four skeletons worth typing from memory weekly" },
        {
          t: "code",
          lang: "javascript",
          caption: "Sliding window — variable size, the shape that covers most window problems",
          code: `// "Longest substring with at most k distinct characters"
function longestWithKDistinct(s, k) {
  const count = new Map();
  let left = 0, best = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    count.set(c, (count.get(c) || 0) + 1);

    // shrink until the window is valid again
    while (count.size > k) {
      const d = s[left++];
      const n = count.get(d) - 1;
      if (n === 0) count.delete(d); else count.set(d, n);
    }

    best = Math.max(best, right - left + 1);
  }
  return best;                       // O(n) time, O(k) space
}`,
        },
        {
          t: "p",
          text: "Every variable-size window problem is this shape: expand right unconditionally, shrink left while the window is invalid, record the answer. If you can type that skeleton without thinking, you have covered a large slice of the medium string problems that frontend screens favour.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Binary search on the answer — the fastest-rusting pattern, and the highest-value one",
          code: `// Search the ANSWER SPACE, not the array.
// "What is the smallest capacity that ships all packages in d days?"
function minCapacity(weights, days) {
  let lo = Math.max(...weights);              // must fit the heaviest item
  let hi = weights.reduce((a, b) => a + b, 0); // one giant day

  const feasible = (cap) => {
    let used = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { used++; load = 0; }
      load += w;
    }
    return used <= days;
  };

  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);   // avoids overflow, and it looks deliberate
    if (feasible(mid)) hi = mid;         // mid works, try smaller
    else lo = mid + 1;
  }
  return lo;                             // O(n log(sum)) time, O(1) space
}`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The two bugs that cost people this problem",
          text: "First, using `while (lo <= hi)` with a separate `best` variable and then getting the update direction wrong. The `lo < hi` collapse form above has no off-by-one because the loop can only exit when the bounds meet. Second, forgetting that `lo` must start at the largest single element, not at 1 — a capacity smaller than the heaviest package is not merely suboptimal, it is impossible, and a naive predicate loops forever.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Topological sort (Kahn) — memorise the in-degree bookkeeping",
          code: `function topoOrder(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);

  for (const [from, to] of edges) {     // from must come before to
    adj[from].push(to);
    indeg[to]++;
  }

  const queue = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);

  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of adj[node]) {
      if (--indeg[next] === 0) queue.push(next);
    }
  }

  // Shorter than n means a cycle exists — say this out loud.
  return order.length === n ? order : null;
}`,
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Union-find with path compression and union by size",
          code: `class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];  // path halving
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;                     // already connected
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    return true;
  }
}`,
        },
        {
          t: "p",
          text: "Both optimisations matter and you should name them: **path compression** flattens the tree during lookup, **union by size** keeps it shallow during merge. Together they give near-constant amortised time. Without them the structure degenerates into a linked list and you are back to O(n) per operation — which an interviewer will ask about specifically.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Prioritise revision by decay speed: binary search on the answer, topological sort, 2D DP, trie and union-find first.",
            "Drill the trigger-to-pattern mapping separately from solving. It is where the live-round time actually goes.",
            "Four skeletons — variable window, binary search collapse, Kahn, DSU — typed from memory once a week.",
            "Name your optimisations. \"Path compression and union by size\" is a two-word senior signal.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 22,
      title: "Frontend-flavoured DSA",
      summary:
        "The algorithmic problems that are actually asked in frontend loops, because they look like the code you ship: LRU, tries for autocomplete, object flattening, DOM traversal, virtual-DOM diff, JSON paths, deep equality, event bubbling and calendar intervals.",
      blocks: [
        {
          t: "p",
          text: "This is the lesson that separates a frontend DSA screen from a generic one. Interviewers at Walmart, Flipkart, Razorpay and Swiggy increasingly prefer problems where the data structure is dressed as a browser concern — because it simultaneously tests algorithms and tests whether you actually understand the platform. These are also disproportionately likely to appear as the *warm-up* in a machine coding round, so the payoff is doubled.",
        },
        {
          t: "table",
          head: ["Problem", "Underlying structure", "Where it shows up in real work"],
          rows: [
            ["LRU cache", "Hash map + doubly linked list", "Client-side query cache, image cache"],
            ["Autocomplete", "Trie with a top-K per node", "Search suggestions, command palette"],
            ["Flatten nested object", "DFS with a path accumulator", "Form state, i18n keys, feature flags"],
            ["DOM tree traversal", "BFS / DFS on an n-ary tree", "Querying, virtualisation, a11y trees"],
            ["Virtual DOM diff", "Keyed n-ary tree comparison", "The core of React reconciliation"],
            ["JSON path lookup", "Iterative descent with segment parsing", "Config readers, safe access utilities"],
            ["Deep equality", "Recursive compare with a cycle set", "Memoisation, re-render prevention"],
            ["Event bubbling", "Parent-chain walk with a stop flag", "Delegation, synthetic event systems"],
            ["Interval merge", "Sort by start, sweep", "Calendar UIs, Gantt charts, booking grids"],
          ],
        },
        { t: "h", text: "LRU cache — the single most-asked frontend DSA question" },
        {
          t: "p",
          text: "Both operations must be O(1), which forces the hash-map-plus-doubly-linked-list design: the map gives O(1) lookup, the list gives O(1) reordering. In JavaScript you have a shortcut worth knowing and worth *declaring*: `Map` preserves insertion order, so delete-and-reinsert moves a key to the back in O(1). Write the Map version first because it is fast and correct, then say you can write the linked-list version if they want to see the data structure.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The Map version — write this, then offer the linked-list one",
          code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();               // insertion-ordered: oldest key is first
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);               // O(1) removal
    this.map.set(key, value);           // reinsert at the most-recent end
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "The follow-ups, in the order they come",
          text: "\"Now add a TTL per entry\" — store `{ value, expiresAt }` and treat an expired hit as a miss, deleting lazily on read. \"Now make it LFU\" — you need frequency buckets, not recency order, and the O(1) LFU design is genuinely harder; say so. \"Would you use this in production?\" — for a real app you would reach for the cache inside TanStack Query rather than hand-roll, and knowing when *not* to build it is a senior answer.",
        },
        { t: "h", text: "Trie-backed autocomplete" },
        {
          t: "code",
          lang: "javascript",
          caption: "Prefix search returning the first k matches",
          code: `class TrieNode {
  constructor() { this.children = new Map(); this.isWord = false; }
}

class Autocomplete {
  constructor(words = []) {
    this.root = new TrieNode();
    for (const w of words) this.insert(w);
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isWord = true;
  }

  suggest(prefix, k = 10) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return [];            // prefix absent: no allocation, no walk
    }
    const out = [];
    const dfs = (n, path) => {
      if (out.length >= k) return;     // early exit is the whole optimisation
      if (n.isWord) out.push(prefix + path);
      for (const [ch, child] of n.children) dfs(child, path + ch);
    };
    dfs(node, "");
    return out;
  }
}`,
        },
        {
          t: "p",
          text: "The complexity to state: insert is O(L) in the word length, prefix descent is O(P), and collecting k suggestions is O(k · L) with the early exit — crucially **not** proportional to the size of the dictionary. That last clause is the reason a trie beats filtering an array, and it is the sentence the interviewer is waiting for. If asked to make it faster still, precompute a top-k list at each node at build time and the query becomes O(P).",
        },
        { t: "h", text: "Flatten a nested object into dot-notation keys" },
        {
          t: "code",
          lang: "javascript",
          caption: "Asked constantly. The edge cases are the question.",
          code: `function flatten(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? prefix + "." + key : key;

    if (Array.isArray(value)) {
      // Arrays index with brackets: a.b[0] — decide and state your convention.
      value.forEach((v, i) => {
        const p = path + "[" + i + "]";
        if (v && typeof v === "object") flatten(v, p, out);
        else out[p] = v;
      });
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      if (Object.keys(value).length === 0) out[path] = {};  // keep empty objects
      else flatten(value, path, out);
    } else {
      out[path] = value;               // null, Date, primitives all land here
    }
  }
  return out;
}`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Say the edge cases before you are asked",
          text: "`typeof null === \"object\"` — the truthiness check is what saves you. An empty object or array is a leaf and silently disappears unless you handle it. Dates are objects and will be shredded into their absence of enumerable keys. Arrays need a stated convention. Volunteering these four in the first thirty seconds turns a five-minute warm-up into a strong signal, because it shows you think about the input space rather than the happy path.",
        },
        { t: "h", text: "Virtual DOM diff, and why keys exist" },
        {
          t: "p",
          text: "A full tree edit-distance diff is O(n cubed), which is unusable. React's heuristic reduces it to O(n) with two assumptions: **different element types produce different trees** (so unmount and rebuild rather than compare), and **children can be matched by a stable key**. Without keys the diff falls back to index comparison, which is why reordering a keyed-by-index list destroys component state and mangles uncontrolled input values. Being able to explain that trade-off — the heuristic, the assumptions, and the failure mode when the assumptions break — is a genuinely senior answer and it bridges straight into your React round.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "A minimal keyed diff producing a patch list",
          code: `function diff(oldNode, newNode, path = []) {
  const patches = [];

  if (!oldNode) return [{ type: "CREATE", path, node: newNode }];
  if (!newNode) return [{ type: "REMOVE", path }];
  if (oldNode.type !== newNode.type) {
    return [{ type: "REPLACE", path, node: newNode }];   // heuristic #1
  }

  const changed = diffProps(oldNode.props, newNode.props);
  if (changed.length) patches.push({ type: "PROPS", path, changed });

  const oldByKey = new Map((oldNode.children || []).map((c, i) => [c.key ?? i, c]));
  const newChildren = newNode.children || [];

  newChildren.forEach((child, i) => {
    const match = oldByKey.get(child.key ?? i);          // heuristic #2
    patches.push(...diff(match, child, [...path, i]));
    oldByKey.delete(child.key ?? i);
  });

  for (const stale of oldByKey.values()) {
    patches.push({ type: "REMOVE", path: [...path, stale.key] });
  }
  return patches;
}`,
        },
        { t: "h", text: "The rest, as one-liners you should be able to attempt cold" },
        {
          t: "list",
          items: [
            "**DOM tree traversal** — iterative DFS with an explicit stack, or BFS with a queue for level order. Use `node.children` for elements only, `childNodes` if text nodes matter. Say which and why.",
            "**JSON path lookup** — `get(obj, \"a.b[0].c\", fallback)`. Split on dots and brackets, descend with a null guard at each step, return the fallback on the first miss. Iterative beats recursive here for the early exit.",
            "**Deep equality** — compare types, then constructors, then keys length, then recurse. Handle `NaN` (use `Object.is`), `Date` by `getTime`, `Map` and `Set` explicitly, and cycles with a `WeakMap` of visited pairs.",
            "**Event bubbling simulation** — build the parent chain from target to root, fire capture handlers root-to-target, then target, then bubble target-to-root, honouring a `stopPropagation` flag. This is also the answer to \"how does event delegation work\".",
            "**Interval merge for a calendar** — sort by start, then sweep merging when `current.start <= last.end`. For \"maximum concurrent meetings\" convert to a sweep line of `+1` at start and `-1` at end, sort, and track the running maximum.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "These nine problems have a far higher hit rate in frontend loops than generic LeetCode mediums. Drill them specifically.",
            "LRU with `Map` first, linked list on request. Trie complexity is independent of dictionary size — say that sentence.",
            "In object-shaped problems the edge cases *are* the interview. Volunteer null, empty, Date and arrays unprompted.",
            "The virtual-DOM diff answer doubles as your React reconciliation answer. Learn it once, use it in two rounds.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 18,
      title: "Talking while you solve, and the weekly timed mock",
      summary:
        "The four-phase narration that turns a solve into a signal, stating complexity confidently including space, and a webcam-on mock protocol that rehearses the actual failure mode.",
      blocks: [
        {
          t: "p",
          text: "Two candidates produce identical working code. One gets a strong hire, the other a lean no-hire. The difference is entirely what they said while typing. The interviewer is not scoring the code — they have seen the solution a hundred times — they are scoring whether they would want you debugging a production incident with them at 2am. That is a communication assessment wearing an algorithms costume.",
        },
        { t: "h", text: "The four phases, in order, every time" },
        {
          t: "steps",
          items: [
            {
              title: "1. Restate and clarify (60-90 seconds)",
              text: "Say the problem back in your own words, then ask two or three real questions: input size, are values unique, is the input sorted, can I mutate it, what should happen on empty input. Then state one example and its expected output. This is not stalling — an interviewer who sees you nail the input space relaxes immediately.",
            },
            {
              title: "2. Brute force out loud, with its bound (30-60 seconds)",
              text: "\"The naive approach is to check every pair, which is O(n squared) time and O(1) space. That's correct but it will not hold at the constraint of 10 to the 5, so let me look for structure.\" You now have a fallback on the record, and you have shown you can reason about scale.",
            },
            {
              title: "3. Optimise, naming the pattern (60-90 seconds)",
              text: "\"Since the array is sorted, I can use two pointers and drop it to O(n). Trading the nested loop for a single pass.\" Name the pattern explicitly — sliding window, monotonic stack, binary search on the answer. Get agreement before you type: \"does that approach sound reasonable to you?\" It costs five seconds and prevents fifteen minutes of coding the wrong thing.",
            },
            {
              title: "4. Code, narrating intent not syntax",
              text: "Say \"I'm tracking the last seen index in a map so I can jump the left pointer directly\" — not \"now I'm writing a for loop\". Intent is signal, syntax is noise. Then dry-run one example aloud, and finish by stating final time and space complexity unprompted.",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Narrate intent, not keystrokes",
          text: "The most common narration failure at senior level is describing what the code says — the interviewer can read. Describe why: what invariant you are maintaining, what you are trading away, what you would change if the constraint were different. If you cannot say why a line exists, that is itself worth flagging: \"I'm not certain this handles duplicates; I'll come back to it\" is a mark of engineering maturity, not weakness.",
        },
        { t: "h", text: "Stating complexity confidently, including space" },
        {
          t: "p",
          text: "Space is where most candidates get vague, and vagueness reads as not knowing. Be specific about *what* the space is: the recursion stack, the hash map, the output. Note that output space is conventionally excluded when the output is the answer — saying \"O(n) auxiliary, excluding the output array\" shows precision that almost nobody bothers with.",
        },
        {
          t: "table",
          head: ["Construct", "Time", "Space", "The detail people miss"],
          rows: [
            ["Hash map lookup", "O(1) average", "O(n)", "Worst case O(n) on adversarial collisions — say \"average\""],
            ["Sorting", "O(n log n)", "O(log n) to O(n)", "`Array.prototype.sort` is not stable-free; V8 uses TimSort, which is stable"],
            ["Recursion depth d", "—", "**O(d) stack**", "Forgetting the call stack is the single most common space error"],
            ["BFS on a grid", "O(rows × cols)", "O(min dimension)", "Queue peaks at the frontier width, not the whole grid"],
            ["DFS on a graph", "O(V+E)", "O(V)", "Visited set plus stack, both O(V)"],
            ["Heap of size k", "O(n log k)", "O(k)", "The whole point of top-K: bounded space, not O(n log n)"],
            ["2D DP table", "O(mn)", "O(mn) → **O(min(m,n))**", "Rolling two rows is almost always available — offer it"],
            ["Trie", "O(L) per op", "O(total chars)", "Independent of dictionary size on query — the key claim"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Do not hedge",
          text: "\"I think it's maybe O(n log n)?\" with rising intonation costs you more than a wrong answer stated firmly and then corrected. Say \"O(n log n), because the sort dominates the linear sweep.\" If you are actually unsure, reason it aloud rather than guessing: \"the outer loop is n, and inside it I do a binary search, so n log n.\" Derivation beats recall, and it is checkable.",
        },
        { t: "h", text: "The weekly timed mock, webcam on" },
        {
          t: "p",
          text: "You will not be nervous solving alone at your desk. You will be nervous with a stranger watching, a shared editor with no autocomplete, and a clock. So rehearse the nerves, not the algorithm. Once a week, non-negotiable, run a 45-minute mock in the conditions you will actually face.",
        },
        {
          t: "list",
          items: [
            "**Webcam on and recording.** Watching yourself back is uncomfortable and it is the fastest feedback you will get. Count your filler words and your silent gaps.",
            "**Plain editor.** Use a shared-doc-style environment with no IntelliSense, no linting, no run button. Most companies use CoderPad or HackerRank; the absence of autocomplete is a real handicap if you have never felt it.",
            "**Two problems, 45 minutes total.** That is the real screen shape. Practising one problem in an hour trains the wrong pacing.",
            "**Talk the entire time, even alone.** Silence in practice becomes silence under pressure.",
            "**Score yourself on three axes:** correctness, communication, complexity. Two of the three are not about the code.",
            "**Every third week, use a real human.** Pramp and interviewing.io are free or cheap. A peer who can ask an unexpected follow-up is worth ten solo sessions.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "The specific thing to rehearse: being stuck",
          text: "You are fluent when things go well. The unrehearsed state is minute 18 with nothing working. Practise the recovery script until it is automatic: \"Let me step back. My current approach is doing redundant work at this step. I have a working brute force at O(n squared) — I'll get that down on the board first so we have something correct, then optimise if there's time.\" A candidate who converts a stall into a working brute force passes. A candidate who freezes for eight minutes does not, even if they eventually get the optimal answer.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Clarify, brute force with its bound, name the pattern, get agreement, then code. Every time, no exceptions.",
            "Narrate intent and invariants, never syntax.",
            "State space complexity as specifically as time, and name what occupies it. Do not hedge.",
            "One 45-minute mock a week, webcam on, plain editor, two problems, recorded.",
            "Rehearse being stuck. The recovery script is the highest-value thirty seconds in your preparation.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain why the DSA round is a negative filter at senior frontend level, and what the actual bar is.",
    "Justify an 80/20 hour split against machine coding to someone who thinks more LeetCode is always better.",
    "Rank the ten core patterns by decay speed and explain why the fast-rusting ones rust.",
    "Given a problem statement, name the pattern within ten seconds and justify it from the trigger phrasing.",
    "Explain the invariant that makes the variable-size sliding window correct.",
    "Explain binary search on the answer: what the search space is, what the predicate must be, and why monotonicity is required.",
    "Explain Kahn's algorithm and how it detects a cycle without a separate check.",
    "Explain path compression and union by size, and what happens to the complexity without them.",
    "Explain why an LRU cache needs both a hash map and a doubly linked list, and why JavaScript's Map lets you skip the list.",
    "State the complexity of trie prefix search and explain why it is independent of dictionary size.",
    "List the four edge cases that break a naive object-flattening function.",
    "Explain React's two reconciliation heuristics, why they reduce O(n cubed) to O(n), and the failure mode when keys are array indices.",
    "Explain the difference between capture and bubble phases and how event delegation exploits bubbling.",
    "Explain how you would compute the maximum number of concurrent meetings with a sweep line.",
    "State the space complexity of a recursive solution correctly, including the call stack, and explain when you would convert to iteration.",
    "Describe your four-phase narration protocol and what each phase signals to the interviewer.",
  ],

  math: [
    {
      title: "Maintenance protocol",
      formula: "2 problems/day × 25 min timed · log pattern not problem · respace failures at d+3, d+10, d+24",
      note: "Consistency beats volume once the syllabus is covered. The timer is the discipline: stop at 25 minutes, read the editorial, re-implement immediately from scratch. Fifty minutes a day, nothing more.",
    },
    {
      title: "Variable-size sliding window",
      formula: "for right in 0..n: expand(right); while (invalid) shrink(left++); best = max(best, right-left+1)",
      note: "Expand unconditionally, shrink while invalid, record after shrinking. Covers longest-substring, at-most-k-distinct, minimum-window and fruit-basket in one shape. O(n) because each index enters and leaves once.",
    },
    {
      title: "Binary search on the answer",
      formula: "lo = minPossible; hi = maxPossible; while (lo < hi) { mid = lo + ((hi-lo)>>1); feasible(mid) ? hi = mid : lo = mid+1 } return lo",
      note: "Requires a monotone predicate: if capacity c works, every c' > c works. The `lo < hi` collapse form removes off-by-one entirely. Triggers: 'minimise the maximum', 'smallest k such that'. Rusts fastest of all patterns.",
    },
    {
      title: "Kahn topological sort",
      formula: "indeg[] from edges → queue of indeg 0 → pop, append, decrement neighbours → order.length < n means cycle",
      note: "Cycle detection is free: if you cannot drain all n nodes, the remainder is a cycle. Triggers: course schedule, build order, dependency resolution, task ordering.",
    },
    {
      title: "Union-find with both optimisations",
      formula: "find: path halving (parent[x] = parent[parent[x]]) · union: attach smaller root under larger → ~O(alpha(n))",
      note: "Name both optimisations out loud. Without them the structure degenerates to a chain and every operation is O(n). Triggers: connected components, accounts merge, redundant connection, number of provinces.",
    },
    {
      title: "LRU cache — O(1) both operations",
      formula: "get: map.delete(k); map.set(k, v) · put: evict map.keys().next().value when size > capacity",
      note: "JavaScript Map preserves insertion order, so delete-then-reinsert is an O(1) move-to-back. State that you can also write the hash-map + doubly-linked-list version. Follow-ups are TTL, then LFU.",
    },
    {
      title: "Trie autocomplete",
      formula: "insert O(L) · descend prefix O(P) · collect k with early exit O(k·L) — independent of dictionary size",
      note: "The independence from dictionary size is the sentence that wins the question. To go further, precompute a top-k list per node at build time and the query drops to O(P).",
    },
    {
      title: "Object flatten to dot notation",
      formula: "flatten(obj, prefix) → recurse on plain objects, index arrays as path[i], everything else is a leaf",
      note: "Four edge cases decide the grade: typeof null is 'object'; empty object/array must be preserved as a leaf; Date has no enumerable keys and will vanish; array notation is a convention you must state.",
    },
    {
      title: "Keyed virtual-DOM diff",
      formula: "type differs → REPLACE subtree · same type → diff props · children matched by key ?? index → O(n)",
      note: "Full tree edit distance is O(n cubed); the two heuristics buy the linear bound. Index keys break state on reorder — this is also the answer in your React round.",
    },
    {
      title: "Interval sweep",
      formula: "merge: sort by start, extend while cur.start <= last.end · concurrency: +1 at start, -1 at end, sort, running max",
      note: "The sweep-line reformulation is the general tool: any 'maximum simultaneous X' becomes a sorted list of deltas. Calendar and booking UIs are the frontend framing.",
    },
    {
      title: "Four-phase narration",
      formula: "clarify + example → brute force with bound → name the pattern, get agreement → code narrating intent → restate time AND space",
      note: "Two of the three scoring axes are not the code. Get explicit agreement on the approach before typing — five seconds that prevent fifteen minutes of the wrong solution.",
    },
  ],

  practice: [
    { type: "math", q: "Implement an LRU cache with get and put in O(1), using Map. 15 minutes. Then rewrite it with a hand-rolled doubly linked list. 20 minutes." },
    { type: "math", q: "Extend your LRU with a per-entry TTL, treating expired entries as misses and deleting them lazily. 15 minutes." },
    { type: "math", q: "Build a trie-backed autocomplete with insert and suggest(prefix, k), including early exit. Then add a precomputed top-k per node. 30 minutes." },
    { type: "math", q: "Write flatten(obj) producing dot-notation keys, handling null, empty objects, arrays and Dates. Then write the inverse unflatten. 25 minutes." },
    { type: "math", q: "Write get(obj, path, fallback) supporting 'a.b[0].c' iteratively, with an early exit on the first missing segment. 15 minutes." },
    { type: "math", q: "Implement deepEqual handling NaN, Date, RegExp, Map, Set and cyclic references. 25 minutes." },
    { type: "math", q: "Implement a keyed virtual-DOM diff returning a patch list, then write the applyPatches function. 35 minutes." },
    { type: "math", q: "Simulate event capture, target and bubble phases over a tree of nodes, honouring stopPropagation and stopImmediatePropagation. 25 minutes." },
    { type: "math", q: "Merge overlapping calendar intervals, then compute the maximum number of concurrent meetings with a sweep line. 20 minutes." },
    { type: "math", q: "Iterative DOM traversal: return all elements matching a predicate using an explicit stack, then again in level order with a queue. 15 minutes." },
    { type: "math", q: "Type the four skeletons — variable sliding window, binary search collapse, Kahn, DSU — from memory with no reference. Under 12 minutes total." },
    { type: "math", q: "Solve one binary-search-on-the-answer problem cold each week. Ship capacity, split array largest sum, and Koko eating bananas, in rotation." },
    { type: "theory", q: "Read twenty problem statements and name the pattern for each without solving. Target under ten seconds per problem." },
    { type: "theory", q: "Record yourself solving a medium with the webcam on. Watch it back and count filler words, silent gaps over five seconds, and whether you stated space complexity unprompted." },
    { type: "theory", q: "Run a 45-minute two-problem mock in a plain editor with no autocomplete. Score correctness, communication and complexity separately." },
    { type: "theory", q: "Deliberately practise being stuck: pick a hard problem, set 18 minutes, and rehearse the recovery script when you have nothing working." },
    { type: "theory", q: "For five problems you have already solved, state the space complexity aloud and name exactly what occupies it — stack, map, or output." },
  ],

  resources: [
    { label: "Blind 75 / NeetCode 150 — the maintenance rotation you already know. Use the pattern groupings, not the list order, when respacing weak areas.", url: "https://neetcode.io/practice", kind: "course" },
    { label: "BFE.dev — implementation challenges shaped exactly like frontend DSA: LRU, deep equal, flatten, event emitter. The single best fit for this module.", url: "https://bigfrontend.dev/", kind: "repo" },
    { label: "GreatFrontEnd — graded frontend coding questions with model solutions and complexity discussion. Worth the paid tier for one month.", url: "https://www.greatfrontend.com/", kind: "course" },
    { label: "Sean Prashad's LeetCode Patterns — problems grouped by pattern with trigger phrasing. Use it for the trigger-recognition drill.", url: "https://seanprashad.com/leetcode-patterns/", kind: "repo" },
    { label: "Pramp — free peer mock interviews. Book one every third week; a live stranger is the only way to rehearse the nerves.", url: "https://www.pramp.com/", kind: "course" },
    { label: "interviewing.io — anonymous mocks with real engineers, plus free recorded interviews. Watch two before your first screen to calibrate the bar.", url: "https://interviewing.io/", kind: "course" },
    { label: "React reconciliation docs — the two heuristics, in React's own words. Read it before your virtual-DOM diff answer.", url: "https://legacy.reactjs.org/docs/reconciliation.html", kind: "docs" },
    { label: "MDN — Map, and why insertion order is guaranteed. The one line that makes the LRU implementation short.", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map", kind: "docs" },
    { label: "Frontend Interview Handbook — algorithms section framed for browser work rather than generic competitive programming.", url: "https://www.frontendinterviewhandbook.com/", kind: "docs" },
    { label: "Grokking the Coding Interview patterns (DesignGurus) — pattern-first framing. Skim, do not buy the whole course; you have already done the problems.", url: "https://www.designgurus.io/course/grokking-the-coding-interview", kind: "course" },
  ],
};

export default p12;
