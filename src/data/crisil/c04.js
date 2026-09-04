const c04 = {
  id: "c04",
  week: 4,
  hours: 3,
  title: "PostgreSQL & SQL, the Python Side",
  tag: "Data",
  why: "You already tune PostgreSQL and write stored procedures at Jio — genuinely strong ground. This module fills the one real gap: how Python talks to Postgres asynchronously, and the query-layer mistakes that show up specifically in async backends.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 16,
      title: "asyncpg, connection pooling, and the N+1 problem in an async world",
      summary:
        "Why a shared connection pool matters more under asyncio than under threads, and how the N+1 query problem gets worse — not better — when your framework makes everything look like a cheap await.",
      blocks: [
        {
          t: "p",
          text: "Your PostgreSQL fundamentals — indexing, stored procedures, query plans — carry over directly; none of that is Python-specific. What changes under asyncio is connection management: you cannot share one blocking connection across concurrent coroutines the way a single-threaded script might get away with, and ORMs make it dangerously easy to hide a query storm behind clean-looking code.",
        },
        { t: "h", text: "Why a pool, not one connection" },
        {
          t: "code",
          lang: "python",
          caption: "asyncpg — the fast, Postgres-only async driver",
          code: `import asyncpg

pool = await asyncpg.create_pool(
    dsn="postgresql://user:pass@host/db",
    min_size=5, max_size=20,
)

async def get_order(order_id: int):
    async with pool.acquire() as conn:      # borrow one connection from the pool
        return await conn.fetchrow(
            "SELECT * FROM orders WHERE id = $1", order_id
        )

# Without a pool, 50 concurrent requests either serialise on one
# connection (killing your whole asyncio concurrency story) or each
# open a brand-new connection (Postgres has a hard connection limit,
# and each one costs real memory on the server).`,
        },
        { t: "h", text: "The N+1 problem, and why async makes it sneakier" },
        {
          t: "code",
          lang: "python",
          caption: "Looks fine, is 101 round trips to the database",
          code: `# N+1: one query for orders, then one more query PER order for its fills
orders = await conn.fetch("SELECT * FROM orders WHERE account_id = $1", acc_id)
for order in orders:
    fills = await conn.fetch(
        "SELECT * FROM fills WHERE order_id = $1", order["id"]
    )
    order["fills"] = fills

# Fixed: one query with a join, or a single IN-clause follow-up query
orders = await conn.fetch(
    """
    SELECT o.*, f.id AS fill_id, f.qty AS fill_qty, f.price AS fill_price
    FROM orders o
    LEFT JOIN fills f ON f.order_id = o.id
    WHERE o.account_id = $1
    """,
    acc_id,
)`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Why async hides this bug better than sync code",
          text: "In a synchronous framework, 101 sequential queries are visibly slow — the request just hangs and profiling finds it fast. In an async framework, each `await conn.fetch(...)` looks cheap and non-blocking in isolation, so the same N+1 pattern reads as 'fine' in code review even though it is issuing the exact same 101 round trips to Postgres. The fix is identical to the sync case: eliminate the per-row query with a join or a batched IN clause. The lesson is that 'it's async' is not a performance argument by itself.",
        },
        { t: "h", text: "ORM vs raw SQL vs SQLAlchemy Core, briefly" },
        {
          t: "list",
          items: [
            "**Raw SQL via asyncpg** — fastest, full control, no abstraction to fight; you write and own every query. Common in latency-sensitive trading paths.",
            "**SQLAlchemy Core** — a query builder, not an ORM: you write SQL-shaped Python, get back rows, no hidden lazy loading. A good middle ground.",
            "**SQLAlchemy ORM / Django ORM** — objects and relationships feel natural, but lazy-loaded relationships are exactly where N+1 hides; both offer explicit eager-loading (`selectinload` / `select_related`, `prefetch_related`) specifically to prevent it.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Always pool connections under asyncio — one shared blocking connection defeats your concurrency, unlimited new connections exhaust Postgres.",
            "N+1 is not a sync-only bug; async backends hide it better because every individual await looks fast.",
            "Fix N+1 with a join or a single batched query, or with the ORM's explicit eager-loading options — never by parallelising the per-row queries with gather, which just hides the same 101 round trips behind concurrency.",
            "Your stored-procedure and indexing experience from Jio transfers directly; the new material here is entirely about connection lifecycle under asyncio.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain why sharing a single database connection across concurrent coroutines is unsafe, and how a connection pool solves it.",
    "Explain the N+1 query problem and why it is often harder to spot in async code than in synchronous code.",
    "Explain the trade-off between raw SQL, SQLAlchemy Core, and a full ORM for a latency-sensitive trading service.",
    "Given a slow endpoint fetching orders and their fills, describe the two ways you would fix the underlying query pattern.",
  ],

  math: [
    {
      title: "Connection pool sizing",
      formula: "pool = await asyncpg.create_pool(dsn, min_size, max_size)",
      note: "max_size should stay well under Postgres's max_connections divided by the number of app instances — a common production incident is every service instance opening its own max-sized pool and exhausting the database.",
    },
    {
      title: "N+1 fix via batched IN clause",
      formula: "SELECT * FROM fills WHERE order_id = ANY($1::int[])",
      note: "One round trip for all child rows instead of one per parent row — the async-agnostic fix that applies whether you are in FastAPI, Django or Flask.",
    },
  ],

  practice: [
    { type: "math", q: "Write an async function using asyncpg and a connection pool that fetches an account's orders and all associated fills in at most two queries. 20 minutes." },
    { type: "theory", q: "A colleague says 'it's fine, everything is async so the extra queries don't block anything.' Write the rebuttal." },
  ],

  resources: [
    { label: "asyncpg docs — connection pools.", url: "https://magicstack.github.io/asyncpg/current/api/index.html#connection-pools", kind: "docs" },
    { label: "Use The Index, Luke — practical SQL indexing reference (framework-agnostic).", url: "https://use-the-index-luke.com/", kind: "docs" },
  ],
};

export default c04;
