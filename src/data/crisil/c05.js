const c05 = {
  id: "c05",
  week: 5,
  hours: 3,
  title: "Redis, Caching & Messaging",
  tag: "Infrastructure",
  why: "Redis is a named mandatory skill, and you already have real Redis experience from the AnyTrac tag-management work — this module turns that into the vocabulary a backend interviewer expects: data structures, caching patterns, and Redis as a messaging layer.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "Redis as cache, as pub/sub, and as a queue — three roles, one tool",
      summary:
        "The data structures that matter in interviews, the caching patterns and their failure modes, and where Redis stops being the right messaging tool.",
      blocks: [
        {
          t: "p",
          text: "Redis shows up in three completely different roles in backend systems, and interviewers often test whether you can tell them apart: a cache in front of Postgres, a lightweight pub/sub fan-out layer (you met this in the WebSocket module), and — with more care — a message queue. Knowing which role a given use case actually needs is the senior signal.",
        },
        { t: "h", text: "The data structures worth knowing cold" },
        {
          t: "table",
          head: ["Structure", "Shape", "Trading-system example"],
          rows: [
            ["String", "key -> bytes/text, with TTL", "Cached last-traded-price for a symbol, `SETEX price:AAPL 5 189.32`"],
            ["Hash", "key -> {field: value}", "An order's current state as a single object: `HSET order:123 status FILLED qty 100`"],
            ["Sorted Set", "key -> members ranked by score", "An order book side: score = price, member = order id — `ZADD` / `ZRANGE` give you the book sorted for free"],
            ["List", "key -> ordered sequence, push/pop from either end", "A simple FIFO work queue via `LPUSH` / `BRPOP`"],
            ["Stream", "key -> append-only log with consumer groups", "A durable, replayable event log — the closest thing to 'Kafka-lite' inside Redis"],
          ],
        },
        { t: "h", text: "Caching patterns, and the two failure modes" },
        {
          t: "code",
          lang: "python",
          caption: "Cache-aside — the default pattern",
          code: `async def get_instrument(symbol: str):
    cached = await redis.get(f"instrument:{symbol}")
    if cached:
        return json.loads(cached)

    row = await db.fetchrow("SELECT * FROM instruments WHERE symbol=$1", symbol)
    await redis.setex(f"instrument:{symbol}", 300, json.dumps(dict(row)))  # 5-minute TTL
    return dict(row)`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Cache stampede",
          text: "When a hot key expires, dozens of concurrent requests can all miss the cache at once and all hammer the database simultaneously to repopulate it — a self-inflicted spike right when the system is already under load. The standard fixes: a short-lived Redis lock so only one request repopulates the cache while others wait or serve slightly stale data, or proactively refreshing hot keys before they expire.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Cache invalidation, the other classic bug",
          text: "Cache-aside on read is easy; the hard part is invalidating on write. If an order's status changes in Postgres and you forget to also update or delete `order:123` in Redis, the API keeps serving stale status forever, or until the TTL happens to expire. The safest default is: write to the database, then delete (not update) the cache key, and let the next read repopulate it correctly.",
        },
        { t: "h", text: "Redis as a queue — and where it stops being enough" },
        {
          t: "list",
          items: [
            "`LPUSH` / `BRPOP` gives you a basic FIFO queue with blocking pop — fine for low-stakes background jobs.",
            "It has no acknowledgement model: if a worker pops a job and crashes before finishing it, that job is gone. For anything you cannot afford to lose — order events, trade confirmations — that is disqualifying on its own.",
            "**Redis Streams** close part of this gap with consumer groups and explicit `XACK`, closer to a real message broker, but still lack Kafka's durability, partitioning and replay guarantees at scale.",
            "The honest interview answer: “I'd reach for Redis Streams for something lightweight and I control both ends; for anything that needs durable, replayable, multi-consumer delivery — like order and execution events across services — I'd use Kafka or RabbitMQ instead.”",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Match the data structure to the access pattern: sorted sets for ranked data (an order book), hashes for an object's fields, strings for simple cached values.",
            "Cache-aside with a TTL is the default; guard against stampede with a short lock, and invalidate by deleting on write, not updating in place.",
            "Redis can act as a basic queue, but has no durable acknowledgement story — know when to escalate to Streams, and when to escalate further to Kafka/RabbitMQ.",
            "Naming the trade-off unprompted (“Redis for speed, Kafka for durability and replay”) is worth more than describing either tool in isolation.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain cache-aside end to end, including what happens on a cache miss and how the cache gets repopulated.",
    "Explain the cache stampede problem and at least one concrete fix.",
    "Explain why 'update the cache on write' is riskier than 'delete the cache key on write', in terms of the failure modes each produces.",
    "Explain why a sorted set is a natural fit for representing one side of an order book.",
    "Explain why Redis Lists are unsuitable as a durable queue for financial events, and what you would use instead.",
  ],

  math: [
    {
      title: "Cache-aside with TTL",
      formula: "GET key -> miss -> compute -> SETEX key ttl value",
      note: "The default pattern for almost any read-heavy, write-light dataset — reference data, instrument metadata, computed aggregates.",
    },
    {
      title: "Distributed lock to prevent stampede",
      formula: "SET lock:key value NX PX 5000  (acquire) ... DEL lock:key  (release, only if you own it)",
      note: "NX = only set if not exists, PX = TTL in ms so a crashed holder does not lock forever. Release safely with a Lua script comparing the value before deleting, to avoid releasing someone else's lock.",
    },
    {
      title: "Order book side as a sorted set",
      formula: "ZADD book:AAPL:bids price order_id  /  ZREVRANGE book:AAPL:bids 0 4 WITHSCORES",
      note: "Score = price gives you the best five bids in one O(log n) call with no application-side sorting.",
    },
  ],

  practice: [
    { type: "math", q: "Implement cache-aside for a symbol lookup with a 60-second TTL and a stampede-safe lock around the repopulation step. 20 minutes." },
    { type: "theory", q: "An order's status was updated in Postgres but the API kept returning the old status for two minutes afterward. Diagnose the likely cache bug and describe the fix." },
    { type: "theory", q: "Justify, out loud, why you would not use plain Redis Lists as the backbone for order-event delivery between microservices." },
  ],

  resources: [
    { label: "Redis docs — data types.", url: "https://redis.io/docs/latest/develop/data-types/", kind: "docs" },
    { label: "Redis docs — Streams and consumer groups.", url: "https://redis.io/docs/latest/develop/data-types/streams/", kind: "docs" },
    { label: "AWS — Caching patterns overview (cache-aside, write-through, stampede).", url: "https://aws.amazon.com/caching/best-practices/", kind: "blog" },
  ],
};

export default c05;
