const p11 = {
  id: "p11",
  week: 11,
  hours: 9,
  title: "HLD and Distributed Systems Recall",
  tag: "Interview Rounds",
  why: "You have already done the HLD study, so this module is not teaching — it is recall speed and attachment. Every concept here needs to come out in under thirty seconds and land next to something you have actually run in production. The highest-leverage hour in the whole module is the last one: whiteboarding your own Jio platform end to end with no notes, because an interviewer trusts a system you built far more than a rehearsed URL shortener.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "Scaling, load balancing and the caching stack",
      summary:
        "A rapid recall pass over horizontal scaling, load-balancer algorithms, sticky sessions, the four cache layers and every invalidation strategy — with the failure modes, because the failure modes are what get asked.",
      blocks: [
        {
          t: "p",
          text: "Treat this lesson as a timed recall drill, not reading. For each heading, close your eyes and say the answer out loud before you read on. Anything you cannot produce in thirty seconds is a gap, and gaps in the first ten minutes of an HLD round set the interviewer's expectations for the remaining forty.",
        },
        { t: "h", text: "Vertical versus horizontal, and the thing that actually stops you" },
        {
          t: "p",
          text: "Vertical scaling is a bigger machine: no code changes, one failure domain, a hard ceiling, and superlinear cost at the top end. Horizontal scaling is more machines: near-linear cost, real fault tolerance, and a hard requirement that your service be **stateless**. That requirement is the whole answer. The reason teams cannot scale out is almost never CPU — it is that some state lives in process memory: a session, an in-memory cache, an upload buffer, a WebSocket or SSE connection. Move state to Redis, the database or the client, and horizontal scaling becomes a configuration change.",
        },
        {
          t: "table",
          head: ["LB algorithm", "How it decides", "Right when", "Failure mode"],
          rows: [
            ["Round robin", "Next server in rotation", "Homogeneous servers, uniform request cost", "One slow endpoint drags every server equally"],
            ["Weighted round robin", "Rotation biased by capacity", "Mixed instance sizes, canary rollouts", "Weights go stale as instance types change"],
            ["Least connections", "Fewest in-flight requests", "Long-lived or highly variable requests", "A hung server holds zero connections and attracts traffic"],
            ["Least response time", "Lowest latency plus connections", "Latency-sensitive APIs", "Needs good health data; noisy under bursty load"],
            ["IP hash / consistent hash", "Hash of client or key", "Cache affinity, sharded state", "Hot keys concentrate; resizing reshuffles some traffic"],
            ["Random with two choices", "Pick two, take the less loaded", "Very large fleets", "Slightly worse than optimal, dramatically cheaper to compute"],
          ],
        },
        {
          t: "p",
          text: "Know the layer distinction too. **L4** balances on IP and port — fast, protocol-agnostic, no visibility into the request. **L7** terminates TLS and reads the HTTP request, so it can route by path or header, retry idempotent requests, and do rate limiting. Also be able to say what health checks buy you: passive checks eject a server after failures, active checks probe an endpoint on an interval, and a good `/health` distinguishes liveness (am I running) from readiness (can I serve traffic) so a warming instance is not sent requests.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Sticky sessions: why they are a trap worth naming",
          text: "Stickiness pins a client to one server so in-process session state keeps working. It buys you a deploy that does not log everyone out and costs you almost everything else: **uneven load** (long-lived clients accumulate on old servers), **broken autoscaling** (you cannot drain a server without dropping its sessions), **a real failure domain** (that server dies and its users lose state), and **useless capacity headroom** during a spike because new capacity gets no existing clients. The senior answer is to externalise session state — a signed token the client carries, or Redis — and treat stickiness as a migration crutch. The one legitimate case is connection-oriented protocols: your SSE streams are inherently sticky for the life of the connection, which is exactly why an SSE fleet needs connection-count-aware balancing and graceful drain on deploy.",
        },
        { t: "h", text: "The four cache layers, outside in" },
        {
          t: "list",
          items: [
            "**Browser / client cache** — `Cache-Control`, `ETag`, service worker. Free, closest to the user, and completely outside your control once shipped. Use `immutable` with content-hashed filenames for static assets, and never long-cache an HTML document.",
            "**CDN / edge** — geographically distributed, kills latency and origin load for static and cacheable dynamic responses. Key questions: what is the cache key (path, query, `Vary` headers), and how do you purge. Stale-while-revalidate at the edge is the highest-value single header most teams never set.",
            "**Application cache** — Redis or Memcached in front of the database, or a local in-process cache. The workhorse. Local caches are faster but inconsistent across instances; a shared cache is consistent but a network hop and a new failure domain.",
            "**Database cache** — the buffer pool, query plan cache and materialised views. Largely automatic, but this is where your work belongs in the conversation: pre-aggregating stock-on-hand in stored procedures is caching at the data layer, and a materialised view refreshed on a schedule is the same trade as a TTL cache.",
          ],
        },
        {
          t: "table",
          head: ["Strategy", "Write path", "Read path", "Cost you accept"],
          rows: [
            ["Cache-aside (lazy)", "Write DB, delete or update the key", "Miss, load from DB, populate", "First read after a write is slow; a race can cache a stale value"],
            ["Write-through", "Write cache and DB synchronously", "Always warm", "Every write pays cache latency; caches data nobody reads"],
            ["Write-behind", "Write cache, flush to DB async", "Always warm", "Data loss if the cache dies before flushing — needs durability"],
            ["Read-through", "As cache-aside, but the cache loads", "Miss handled inside the cache layer", "Less control over the load path; harder to instrument"],
            ["Refresh-ahead", "Proactively reload before expiry", "Never cold", "Wasted work on keys that were not going to be read"],
            ["TTL only", "No invalidation at all", "Serve until it expires", "Bounded staleness, in exchange for zero invalidation logic"],
          ],
        },
        {
          t: "p",
          text: "Be opinionated: **cache-aside with a delete on write is the correct default**, because deleting is idempotent and safe under concurrency whereas updating the cache races with other writers. Then name the two consistency hazards. First, the classic race: reader A misses, loads value `v1`, and before it writes to the cache, writer B commits `v2` and deletes the key — A then populates the cache with `v1`, which now never expires until TTL. Fix with a short TTL on everything (defence in depth), or versioned keys, or delayed double-delete. Second, if two systems can write the same row, only one of them invalidating produces permanent staleness — which is why change-data-capture-driven invalidation is more robust than application-level invalidation at scale.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Cache-aside with single-flight, the anti-stampede primitive",
          code: `// Cache stampede (dogpile): a hot key expires, and every concurrent
// request misses simultaneously and hits the database at once. On a
// 12,000-user portal, one expiring dashboard key becomes thousands of
// identical aggregation queries in the same second.

const inFlight = new Map();          // key -> Promise, per process

async function getCached(key, loader, ttlMs = 60_000) {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);

  // SINGLE FLIGHT: collapse concurrent misses in this process into one load.
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    try {
      // Distributed lock so only ONE instance across the fleet loads.
      const gotLock = await redis.set("lock:" + key, "1", "NX", "PX", 5000);
      if (!gotLock) {
        await sleep(50 + Math.random() * 100);      // jittered retry
        return getCached(key, loader, ttlMs);
      }
      const value = await loader();
      // Jitter the TTL so keys written together do not expire together.
      const ttl = ttlMs + Math.floor(Math.random() * ttlMs * 0.1);
      await redis.set(key, JSON.stringify(value), "PX", ttl);
      return value;
    } finally {
      inFlight.delete(key);
      redis.del("lock:" + key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}`,
        },
        {
          t: "note",
          tone: "interview",
          title: "You have the stampede story already",
          text: "The slowest stock-on-hand report going from 10s to 2s via PostgreSQL stored procedures is a caching-and-precomputation story, and you should tell it that way. A 10-second aggregation with no cache means every concurrent request runs it; precomputing it moves the work off the read path entirely. When asked \"how would you make this dashboard fast\", the four-part answer is: precompute the aggregate, cache the result with a jittered TTL, collapse concurrent misses with single-flight, and serve stale while revalidating so no user ever waits for a cold load. Then add: \"and the freshness requirement decides which of those you need — five-second freshness on SOH ruled out a long TTL, which is why we went event-driven over Kafka instead.\"",
        },
        {
          t: "list",
          items: [
            "Horizontal scaling is blocked by in-process state, not by hardware. Find the state, externalise it.",
            "Know six LB algorithms and their failure modes, plus L4 versus L7 and liveness versus readiness.",
            "Sticky sessions break autoscaling and draining. Legitimate only for connection-oriented traffic like SSE.",
            "Four cache layers: client, edge, application, database. Name the cache key and the purge path for each.",
            "Cache-aside with delete-on-write by default. Every cache needs a TTL as a backstop, jitter to de-synchronise expiry, and single-flight to survive a stampede.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 20,
      title: "The data layer: choice, indexes, sharding, and consistency",
      summary:
        "SQL versus NoSQL argued from access patterns rather than fashion, why indexes work and when they do not, replication and replica lag, and CAP, PACELC and the four consistency models you must be able to place in a product.",
      blocks: [
        {
          t: "p",
          text: "Database questions are where HLD rounds separate people who have operated a system from people who have read about one. The tell is the direction of the argument: a weak candidate picks a database and then justifies it; a strong one states the access patterns, the read/write ratio, the consistency requirement and the growth rate, and lets the choice fall out.",
        },
        { t: "h", text: "Choose on access patterns, not on fashion" },
        {
          t: "table",
          head: ["Signal in the requirements", "Points to", "Because"],
          rows: [
            ["Multi-entity transactions, invariants that must hold", "Relational (PostgreSQL)", "ACID across rows and tables is the product feature, not a nice-to-have"],
            ["Ad-hoc queries and reporting nobody specified yet", "Relational", "SQL plus indexes answers questions you did not model for"],
            ["Known key, single-item reads, extreme write volume", "Key-value / wide column (DynamoDB, Cassandra)", "Partition-key access scales horizontally with no coordination"],
            ["Heterogeneous, evolving documents read whole", "Document (MongoDB)", "One read returns the aggregate; no join, no migration for a new field"],
            ["Time-ordered metrics, retention and downsampling", "Time-series (Timescale, Influx)", "Columnar compression and time-bucket aggregation built in"],
            ["Full-text and faceted search, relevance ranking", "Search engine (Elasticsearch, OpenSearch)", "Inverted index; never make your primary store do this"],
            ["Relationship traversal many hops deep", "Graph (Neo4j)", "Adjacency traversal instead of recursive self-joins"],
          ],
        },
        {
          t: "p",
          text: "The honest default for most product systems is PostgreSQL, and you should say so — it does JSONB documents, full-text search, and partitioning, so \"one database until the access pattern genuinely diverges\" is a defensible senior position. NoSQL earns its place when you can name the partition key up front and every query goes through it. The follow-up you must handle: **NoSQL is not schemaless, it is schema-on-read** — the schema moved into your application code, where nothing enforces it.",
        },
        { t: "h", text: "Indexes: the mechanism, and when they stop helping" },
        {
          t: "p",
          text: "A B-tree index is a sorted structure with O(log n) lookup that also answers range scans and ordering for free, which is why one index serves `WHERE`, `ORDER BY` and `GROUP BY`. The costs are real: every write must maintain every index on the table, and each index is storage. The rules worth reciting are: **leftmost prefix** (a composite index on `(store_id, sku, updated_at)` serves queries on `store_id`, on `store_id, sku`, and on all three — never on `sku` alone); **selectivity** (an index on a boolean column is usually ignored because the planner would rather scan than do random I/O for half the table); **covering indexes** (if the index contains every column the query needs, the heap is never touched — this is often the single biggest win available); and **sargability** (wrapping the column in a function, as in `WHERE DATE(created_at) = ...`, disables the index; rewrite as a range predicate or build an expression index).",
        },
        {
          t: "code",
          lang: "sql",
          caption: "The optimisation conversation, in the order you should present it",
          code: `-- 1. Measure. Never optimise from intuition.
EXPLAIN (ANALYZE, BUFFERS)
SELECT store_id, SUM(qty * unit_price) AS value
FROM   stock_on_hand
WHERE  brand_id = 3 AND updated_at >= now() - interval '1 day'
GROUP  BY store_id;
-- Seq Scan on stock_on_hand  (rows=42,000,000)  actual time=9,840ms

-- 2. Index the selective predicate, ordered to serve the range scan,
--    and include the aggregated columns so the heap is never read.
CREATE INDEX CONCURRENTLY idx_soh_brand_updated
  ON stock_on_hand (brand_id, updated_at DESC)
  INCLUDE (store_id, qty, unit_price);
-- CONCURRENTLY: no exclusive lock, so no write outage on a live table.

-- 3. Partition by time when the table is mostly cold history.
--    Old partitions are then detached, not deleted row by row.
CREATE TABLE stock_on_hand_2026_09 PARTITION OF stock_on_hand
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

-- 4. Precompute when the read pattern is fixed and the aggregate is hot.
--    This is a cache that lives in the database.
CREATE MATERIALIZED VIEW soh_by_store AS
SELECT brand_id, store_id, SUM(qty * unit_price) AS value, max(updated_at) AS as_of
FROM   stock_on_hand GROUP BY brand_id, store_id;
CREATE UNIQUE INDEX ON soh_by_store (brand_id, store_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY soh_by_store;   -- needs a unique index`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Your stored procedures are real database engineering — present them as such",
          text: "Frontend candidates almost never have a credible database story, and you do. Authoring the REST contracts and the PostgreSQL stored procedures for high-volume stock-on-hand aggregation, taking the slowest report from 10s to 2s, is exactly the work an HLD interviewer is trying to establish you can do. Tell it with the mechanism, not the outcome: what the original query plan was, why it was scanning, what the index or pre-aggregation changed, and the trade-off you accepted (staleness, write cost, storage). Also be ready for the pushback — \"why business logic in the database?\" — and have the answer: aggregation over tens of millions of rows belongs next to the data because moving those rows over the wire to compute a scalar is the actual cost, and everything else stayed in the service layer.",
        },
        { t: "h", text: "Replication, read replicas and lag" },
        {
          t: "list",
          items: [
            "**Single leader** — all writes to one node, reads from followers. Simple, no write conflicts, and the default for relational systems. The leader is a write bottleneck and a failover event.",
            "**Multi leader** — writes accepted in several regions. Buys write availability, costs you conflict resolution (last-write-wins loses data; CRDTs or application merge rules do not).",
            "**Leaderless (quorum)** — Dynamo-style, with `R + W > N` giving you overlap and therefore read-your-writes. Tunable per query, which is the point.",
            "**Sync versus async replication** — synchronous guarantees no data loss on failover but couples your write latency to the slowest replica; asynchronous is fast and can lose the tail of committed writes when the leader dies. Semi-synchronous (one sync replica, the rest async) is the usual production compromise.",
            "**Replica lag is the bug you will be asked about**: a user posts, the write goes to the leader, the subsequent read hits a lagging replica, and their own change is missing. Fixes, in increasing order of sophistication: route reads to the leader for a short window after a write; pin the session to the leader; or track a write log-sequence number per session and only read from a replica that has caught up past it.",
          ],
        },
        { t: "h", text: "Sharding, and the two decisions that matter" },
        {
          t: "p",
          text: "Sharding splits data across independent databases. Two decisions define everything: the **shard key** and the **mapping function**. Hash-range mapping distributes evenly but destroys range queries; range mapping preserves them but creates hot shards (shard by timestamp and today's shard takes every write). Directory mapping is flexible but the directory becomes a lookup dependency. **Consistent hashing** with virtual nodes is what makes resharding survivable — adding a node moves roughly `1/n` of the keys instead of reshuffling everything. Then say the costs plainly: cross-shard joins are gone, cross-shard transactions need two-phase commit or a saga, global secondary indexes need their own store, and rebalancing is an operational project. Which is why the correct answer to \"should we shard\" is usually \"not yet — partition, add read replicas, and move cold data out first\".",
        },
        { t: "h", text: "CAP, PACELC and consistency models" },
        {
          t: "p",
          text: "CAP is narrower than people quote it: **during a network partition**, you must choose between consistency and availability. Partitions are rare, so CAP says nothing about the 99.9% of the time the network is fine — which is what **PACELC** adds: if Partitioned, choose Availability or Consistency; **Else**, choose Latency or Consistency. That second clause is the one that actually shapes systems. DynamoDB and Cassandra are PA/EL — available under partition, low latency otherwise. A single-leader PostgreSQL is PC/EC. Spanner is PC/EC and pays for it with coordination latency. Saying \"CAP is about partitions; the interesting trade-off in normal operation is PACELC's latency-versus-consistency\" is a strong, cheap signal.",
        },
        {
          t: "table",
          head: ["Model", "Guarantee", "Acceptable for", "Never for"],
          rows: [
            ["Strong / linearisable", "Every read sees the latest committed write", "Payments, stock reservation, seat booking", "Nothing — it is just expensive"],
            ["Eventual", "Replicas converge, given no new writes", "Like counts, view counts, recommendations, analytics", "Anything the user immediately re-reads"],
            ["Read-your-writes", "A client always sees its own writes", "Profile edits, posting a comment, submitting a form", "Cross-user coordination"],
            ["Monotonic reads", "You never see time move backwards", "Feeds, notification lists, any paginated view", "Where two users must agree on a value"],
            ["Causal", "Cause is seen before effect", "Comment threads, chat replies", "Global ordering requirements"],
          ],
        },
        {
          t: "p",
          text: "The product framing is what makes this real: **inventory is not uniformly consistent**. A dashboard showing INR 1,000 Cr of stock across 1,900 stores is fine at eventual consistency with a five-second lag — nobody makes a decision on the last hundred rupees. A self-checkout decrementing on-hand quantity for the item in someone's hand needs strong consistency on that row, because overselling is a real customer-facing failure. Being able to say \"different consistency for different operations in the same system\" is the answer that ends the CAP question well.",
        },
        {
          t: "list",
          items: [
            "State access patterns, read/write ratio, consistency need and growth first. The database then chooses itself.",
            "Indexes: leftmost prefix, selectivity, covering, sargability. Always `EXPLAIN ANALYZE` before and after.",
            "Replica lag breaks read-your-writes. Know all three fixes, including the LSN-tracking one.",
            "Shard key plus mapping function is the whole design; consistent hashing with virtual nodes is what makes it operable.",
            "CAP is only about partitions; PACELC's else-branch (latency versus consistency) is what you live with daily.",
            "Pick consistency per operation, not per system.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "advanced",
      minutes: 22,
      title: "Kafka, to a depth nobody can shake",
      summary:
        "This is your production strength and it must be unbeatable: partitions and ordering, consumer groups and the true cost of a rebalance, offset commit strategies, the three delivery semantics, idempotent and transactional producers, consumer lag, retention versus compaction, and why a dead-letter queue is non-negotiable.",
      blocks: [
        {
          t: "p",
          text: "You have run Kafka in anger — SOH and RFID events in the inventory platform, camera-feed fan-out across 100+ streams in the video analytics platform. That means an interviewer can go three questions deeper than they would with a normal frontend candidate, and this is an advantage only if you are ready for the third question. The goal of this lesson is that there is no follow-up you cannot answer. Read it as verification, and say every answer out loud before reading it.",
        },
        { t: "h", text: "Topics, partitions, and the only ordering guarantee that exists" },
        {
          t: "list",
          items: [
            "A **topic** is a named log. A **partition** is an ordered, append-only, immutable sequence of records within that topic. The partition is the unit of parallelism, of ordering, and of retention.",
            "Ordering is guaranteed **within a partition only**. There is no global ordering across a topic, ever. If your design needs ordering, it needs a partition key that puts the related events in the same partition.",
            "The **partition key** decides placement: `partition = murmur2(key) % numPartitions` when a key is present, sticky-batched round robin when it is null. So the key is a design decision about ordering and about load distribution simultaneously.",
            "An **offset** is a monotonically increasing position within a partition. It is meaningful only in the context of one topic-partition; there is no such thing as a topic-wide offset.",
            "**Partition count is effectively one-way.** You can add partitions, but doing so rehashes keys to different partitions, which breaks ordering for keys that move and invalidates any per-partition state your consumers hold. Over-provision at design time.",
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "The partition key is the most consequential line in a Kafka design",
          code: `// WRONG for inventory: no key means round robin, so two events for the
// same SKU can land in different partitions and be consumed out of order.
// A "qty 4" event processed after a stale "qty 7" leaves the wrong value.
await producer.send({
  topic: "stock-on-hand",
  messages: [{ value: JSON.stringify(event) }],
});

// RIGHT: key by the entity whose ordering must be preserved.
// All events for one store+SKU share a partition, so they are strictly
// ordered relative to each other. Different SKUs stay parallel.
await producer.send({
  topic: "stock-on-hand",
  messages: [{
    key: event.storeId + ":" + event.sku,
    value: JSON.stringify(event),
    headers: { schemaVersion: "2", traceId: ctx.traceId },
  }],
});

// KEY CARDINALITY IS THE TRADE-OFF:
//   key = brandId    -> 6 distinct keys, so at most 6 partitions get data.
//                       One busy brand becomes a hot partition and a lag
//                       hotspot; the other partitions idle.
//   key = storeId    -> ~1,900 keys. Good spread; per-store ordering.
//                       Correct if consumers keep per-store state.
//   key = store:sku  -> millions of keys. Best spread, finest ordering,
//                       but no cross-SKU ordering within a store.
//
// Choose the coarsest key that still gives the ordering you actually need.

// Defensive consumers: never trust ordering you did not key for.
// Carry a monotonic version and discard regressions.
function apply(state, event) {
  const current = state[event.sku];
  if (current && current.version >= event.version) return state;   // stale
  return { ...state, [event.sku]: event };
}`,
        },
        { t: "h", text: "Consumer groups, and what a rebalance actually costs" },
        {
          t: "p",
          text: "A consumer group is a set of consumers sharing a `group.id`. The group coordinator assigns each partition to exactly one consumer in the group, which is why **your maximum parallelism equals your partition count** — the eleventh consumer on a ten-partition topic sits idle. Two groups on the same topic each get every message independently, which is precisely the property that let you add analytics consumers to the RFID stream without touching ingestion.",
        },
        {
          t: "p",
          text: "A **rebalance** is triggered by a consumer joining, leaving, crashing, or exceeding `max.poll.interval.ms` (the broker decides it is dead because it stopped polling — usually because a single message took too long to process). Under the classic eager protocol, a rebalance is a **stop-the-world event**: every consumer in the group revokes all its partitions, the coordinator recomputes the assignment, and consumption pauses for the whole group. On a large group this is seconds, sometimes tens of seconds, and consumer lag spikes visibly. The mitigations you should be able to name are: **cooperative incremental rebalancing** (`CooperativeStickyAssignor`), which revokes only the partitions that actually move; **static group membership** (`group.instance.id`) so a rolling restart does not trigger a rebalance at all; a `session.timeout.ms` and heartbeat tuned so a GC pause is not mistaken for death; and keeping per-message processing well under `max.poll.interval.ms`, or reducing `max.poll.records`, so slow processing never looks like a dead consumer.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The rebalance question separates users from operators",
          text: "\"What happens when you deploy a new version of a consumer?\" is the question. The naive answer is \"rolling restart\". The operator's answer is: each restarting instance triggers a rebalance, so a rolling deploy of ten consumers causes up to ten stop-the-world pauses and a lag spike each time — which is exactly why static membership plus cooperative assignment exists, and why you drain and commit offsets before shutdown rather than letting the session time out. If you had a five-second freshness SLA on SSE-delivered stock data, a fifteen-second rebalance is an SLA breach, and saying that connects the Kafka internals to the product guarantee.",
        },
        { t: "h", text: "Offsets, commit strategy, and the three delivery semantics" },
        {
          t: "table",
          head: ["Semantic", "How you get it", "Failure result", "Use for"],
          rows: [
            ["At most once", "Commit the offset **before** processing", "Message lost on a crash mid-processing", "High-volume telemetry where loss is cheaper than duplication"],
            ["At least once", "Commit **after** processing succeeds", "Duplicates on a crash after work, before commit", "The correct default for almost everything"],
            ["Exactly once (effectively)", "Idempotent producer plus transactions, or at-least-once plus an idempotent consumer", "Neither loss nor visible duplication", "Financial postings, stock movements, anything counted"],
          ],
        },
        {
          t: "code",
          lang: "javascript",
          caption: "At-least-once done properly, with idempotent handling and a DLQ",
          code: `// Auto-commit is at-least-once with an unpredictable window, because the
// commit fires on a timer regardless of whether processing finished.
// Turn it off for anything that matters.
await consumer.connect();
await consumer.subscribe({ topic: "rfid-tracking", fromBeginning: false });

await consumer.run({
  autoCommit: false,
  eachBatchAutoResolve: false,
  eachBatch: async ({ batch, resolveOffset, commitOffsetsIfNecessary,
                      heartbeat, isRunning, isStale }) => {
    for (const message of batch.messages) {
      if (!isRunning() || isStale()) break;      // partition was revoked

      try {
        await handleWithIdempotency(message);
        resolveOffset(message.offset);           // mark processed, not committed
      } catch (err) {
        if (isRetryable(err) && retryCount(message) < 5) {
          await republishWithDelay(message, backoff(retryCount(message)));
        } else {
          // DEAD LETTER: never block the partition on one poison message.
          await dlq.send({
            topic: "rfid-tracking.dlq",
            messages: [{
              key: message.key,
              value: message.value,
              headers: {
                ...message.headers,
                originalTopic: batch.topic,
                originalPartition: String(batch.partition),
                originalOffset: message.offset,
                error: err.message,
                failedAt: new Date().toISOString(),
              },
            }],
          });
        }
        resolveOffset(message.offset);           // move past it either way
      }

      await heartbeat();                         // do not look dead
    }
    await commitOffsetsIfNecessary();
  },
});

// IDEMPOTENT CONSUMER: this is what makes at-least-once safe, and it is
// the honest answer to "how do you get exactly once end to end".
async function handleWithIdempotency(message) {
  const eventId = message.headers.eventId.toString();
  // Atomic: the dedupe insert and the business write share one transaction.
  await db.tx(async (t) => {
    const fresh = await t.insertIfAbsent("processed_events", {
      event_id: eventId, at: new Date(),
    });
    if (!fresh) return;                          // already applied, skip
    await t.upsertStockOnHand(JSON.parse(message.value));
  });
}`,
        },
        {
          t: "p",
          text: "Three details behind that code that interviewers dig for. First, the **idempotent producer** (`enable.idempotence=true`) gives each producer a PID and a per-partition sequence number, so a broker-side retry after a lost acknowledgement does not append the record twice — it prevents duplicates *from retries*, which is a narrower guarantee than exactly-once and is often confused with it. Second, **transactions** (`transactional.id`, `sendOffsetsToTransaction`) make the consume-process-produce cycle atomic — the output records and the input offset commit succeed or fail together — which is what \"exactly-once\" means in Kafka Streams, and it only holds *inside* Kafka. Third, the moment you write to an external system such as PostgreSQL, you are back to at-least-once plus an idempotency key, because Kafka's transaction cannot span your database. Say that last sentence and the topic is closed.",
        },
        { t: "h", text: "Lag, retention, compaction" },
        {
          t: "list",
          items: [
            "**Consumer lag** = log end offset minus committed offset, per partition. It is the single most important operational metric for a streaming system: absolute lag tells you how far behind you are, and the *derivative* tells you whether you are catching up or falling behind. Alert on sustained growth, not on a threshold, because a burst that drains is normal and a slow steady climb is an outage in progress. Per-partition lag also reveals a bad partition key immediately: one partition lagging while nine idle is a hot key, not a capacity problem.",
            "**Retention** — time-based (`retention.ms`) or size-based (`retention.bytes`). This is what makes Kafka a replayable log rather than a queue: with seven days of retention, a new consumer group can start `fromBeginning` and rebuild its entire state. That property is why your event-driven design let new analytics consumers join without touching ingestion — they replay history instead of asking for a backfill.",
            "**Compaction** (`cleanup.policy=compact`) — retain only the latest record per key, forever. This turns a topic into a durable snapshot of current state, which is exactly right for stock-on-hand: a consumer that restarts replays one record per store-SKU rather than every movement ever recorded. A `null` value is a tombstone and deletes the key. Use `compact,delete` when you want a bounded snapshot.",
            "**Dead-letter queue** — without one, a single unparseable message halts the partition forever, because offsets are sequential and you cannot skip without committing past it. The DLQ turns a total outage into a triage queue. Requirements: preserve the original key, topic, partition, offset and headers; record the error and the attempt count; and build a replay path, because a DLQ nobody drains is just a slower data-loss mechanism.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "The Kafka answer that ends the round",
          text: "When Kafka comes up, do not describe it — narrate a decision you made. \"We published SOH and RFID tracking events keyed by store and SKU, which gave us per-item ordering while keeping 1,900 stores spread across partitions. The portals consumed a projection over SSE, so freshness went from a 15-minute batch to under five seconds. The reason we used Kafka rather than calling the portal service directly is that adding an analytics consumer became a new consumer group instead of a change to the ingestion path — and the video analytics platform reused the same shape to fan 100+ camera streams to multiple consumers.\" That paragraph demonstrates partitioning, ordering, consumer groups, decoupling and a measured product outcome in about forty seconds.",
        },
        { t: "h", text: "Queues generally, plus rate limiting and circuit breakers" },
        {
          t: "p",
          text: "Know the axis: **Kafka is a replayable partitioned log** (consumers own their offsets, messages survive consumption, ordering per partition, high throughput); **RabbitMQ and SQS are brokers** (the broker tracks per-message state, acknowledgements and redelivery, per-message TTL, priority, and easy competing-consumer work distribution). Choose the log for event streaming, replay and multiple independent consumers; choose the broker for task queues where each job is handled once and you want per-message control. Queues buy you three things worth naming: **load levelling** (absorb a spike instead of dropping it), **decoupling** (the producer does not care whether the consumer is up), and **retry with backpressure**. They cost you: added latency, at-least-once duplication, ordering complexity, and a new thing to operate.",
        },
        {
          t: "p",
          text: "**Rate limiting** sits at the edge (gateway or CDN) and protects you from clients — token bucket for burst tolerance, sliding window counter as the practical accurate option, and a shared atomic store such as Redis with a Lua script once you have more than one instance. Return `429` with `Retry-After` so well-behaved clients back off rather than hammering. **Circuit breakers** sit at your outbound calls and protect you from *dependencies*. Three states: **closed** (calls pass, failures counted), **open** (calls fail immediately for a cool-down, so you stop queueing threads against a dead service), **half-open** (a few trial calls decide whether to close or re-open). The point people miss is what happens when it trips: an open breaker must have a **defined fallback** — serve stale cache, return a degraded response, or fail fast with a clear error — because an open circuit with no fallback is just a faster outage. On the frontend, the equivalents are the same: retry with jittered backoff, a request timeout on every call, and a degraded UI state rather than an indefinite spinner.",
        },
        {
          t: "list",
          items: [
            "Ordering exists per partition only, and the partition key is the design decision that grants it. Pick the coarsest key that gives the ordering you need.",
            "Parallelism is capped by partition count. Partition count is effectively one-way.",
            "Rebalances are stop-the-world under the eager protocol: static membership, cooperative assignment, tuned poll interval.",
            "Commit after processing plus an idempotent consumer is at-least-once done right, and it is the honest route to effectively-once across an external database.",
            "Consumer lag per partition, watched as a trend, is your primary health metric — and it diagnoses hot keys for free.",
            "Compaction gives you a keyed snapshot; retention gives you replay; a DLQ with a replay path stops one poison message becoming an outage.",
            "A circuit breaker without a defined fallback is just a faster failure.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 20,
      title: "Whiteboard your own platform in 30 minutes",
      summary:
        "The single highest-value exercise in the module. Back-of-envelope estimation, a script for driving any HLD round, the classic designs you should be able to sketch, and then the real work: your Jio inventory platform end to end, from RFID scan to portal, with no notes.",
      blocks: [
        {
          t: "p",
          text: "Interviewers discount rehearsed designs, and they should — anyone can memorise a URL shortener. What they cannot discount is a system you operated, with real numbers, real failure modes and a real regret. You have one, and most candidates for these roles do not. The exercise at the end of this lesson is worth more than the rest of the module combined, so do it properly: thirty minutes, a whiteboard or a sheet of A3, no notes, out loud.",
        },
        { t: "h", text: "Back-of-envelope estimation, done in ninety seconds" },
        {
          t: "p",
          text: "Estimation is not about precision; it is about establishing scale so the design has constraints. Round aggressively and say your rounding out loud. The numbers to have memorised: **86,400 seconds in a day, so call it 100,000** — that makes QPS from daily volume a decimal shift. One million seconds is about 12 days; a billion is about 32 years. A UUID is 16 bytes, a timestamp 8, a typical JSON event 200 bytes to 1 KB, a small image 200 KB. Read-heavy consumer products run 100:1 to 1000:1 read:write; internal enterprise tools like yours run much closer to even.",
        },
        {
          t: "code",
          lang: "javascript",
          caption: "Estimate your own platform, so the numbers are yours and not a textbook's",
          code: `// ---- Traffic -------------------------------------------------------
// 12,000 daily users, ~20 page views each, over an 8-hour working day.
//   views/day   = 12,000 * 20            = 240,000
//   API calls   = 240,000 * 5            = 1,200,000 / day
//   avg QPS     = 1,200,000 / 28,800 s   ~ 42 QPS
//   peak QPS    = avg * 5 (shift starts) ~ 210 QPS
// Conclusion out loud: this is small. A single well-indexed Postgres and
// two app instances handle it. The load is NOT the interesting problem.

// ---- Event ingestion, which IS the interesting problem -------------
// 1,900 stores, RFID scanning. Assume 20,000 tagged items per store,
// cycle-counted daily, plus movement events.
//   scans/day     = 1,900 * 20,000       = 38,000,000
//   avg events/s  = 38,000,000 / 86,400  ~ 440/s
//   peak (counts cluster in the evening, say 4h window)
//                 = 38,000,000 / 14,400  ~ 2,640/s
//   at 300 bytes  = 2,640 * 300          ~ 800 KB/s ingest  (trivial)
// Conclusion: throughput is easy; the hard parts are ORDERING per item
// and FAN-OUT to consumers. That is why the answer was Kafka, not a
// bigger database.

// ---- Storage growth ------------------------------------------------
//   raw events  = 38,000,000/day * 300 B  ~ 11.4 GB/day
//   90 days raw = 11.4 * 90               ~ 1.03 TB   (+ replication x3)
//   compacted current-state topic:
//     keys = 1,900 stores * 20,000 SKUs   = 38,000,000 keys
//     at 300 B                            ~ 11.4 GB, and it stops growing
// Conclusion: raw retention is the cost driver, so retain raw for 7 days
// for replay and keep a compacted topic as the durable snapshot.

// ---- Real-time fan-out ---------------------------------------------
//   concurrent SSE connections at peak ~ 12,000 * 0.3   = 3,600
//   per connection ~ 10 KB of server memory              = 36 MB  (fine)
//   updates pushed = 5/s/client * 3,600 * 200 B          = 3.6 MB/s egress
// Conclusion: connection COUNT is the constraint, not bandwidth. Each
// node holds thousands of long-lived connections, so the limits that
// bite are file descriptors, LB idle timeouts and graceful drain on
// deploy - not CPU.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The most valuable sentence in an estimation exercise",
          text: "\"Given those numbers, the load is not the problem — the problem is X.\" Most candidates estimate and then design as if every system were Twitter. Estimating and then *correctly concluding that scale is not the bottleneck* is a much stronger signal, because it shows the estimate changed your design. For your platform the honest conclusion is that 210 peak QPS is nothing, and the genuinely hard parts are per-item event ordering, fan-out to independent consumers, and holding thousands of live SSE connections through a deploy.",
        },
        { t: "h", text: "The script for driving any HLD round" },
        {
          t: "steps",
          items: [
            {
              title: "Requirements and scope — 5 minutes",
              text: "Functional (what must it do), non-functional (scale, latency, freshness, availability target, consistency), and explicit non-goals. Write the SLOs on the board: \"under 5s freshness, 99.9% availability, eventual consistency on dashboards and strong on stock decrements\". Numbers on the board make every later trade-off arguable rather than aesthetic.",
            },
            {
              title: "Estimate — 3 minutes",
              text: "QPS from DAU, storage growth, bandwidth. Then say what the numbers imply and what they rule out. Ninety seconds, not ten minutes.",
            },
            {
              title: "API and data model — 5 minutes",
              text: "Three or four endpoints or event schemas, and the core entities with their keys. This is where a frontend background is an advantage: you design contracts for a living, so lead with the contract. Name the partition key and the primary key explicitly.",
            },
            {
              title: "High-level architecture — 10 minutes",
              text: "Client, CDN, gateway, services, queue or log, stores, caches. Draw the write path and the read path as separate flows — conflating them is the most common way these diagrams become unreadable. Say why each box exists; a box you cannot justify should be erased.",
            },
            {
              title: "Deep dive where they push — 12 minutes",
              text: "Let them choose. Steer gently toward the area you know cold: partitioning and ordering, the real-time layer, the caching and pre-aggregation strategy.",
            },
            {
              title: "Bottlenecks, failure modes, and what you would change — 5 minutes",
              text: "What happens when the queue backs up, the cache dies cold, a consumer group rebalances mid-deploy, a region drops. What you monitor and what you alert on. Then one honest regret. Candidates who volunteer failure modes are read as people who have been on call.",
            },
          ],
        },
        {
          t: "table",
          head: ["Classic design", "The one idea it tests", "Say this unprompted"],
          rows: [
            ["URL shortener", "ID generation and the read/write ratio", "Base62 of a counter beats hashing — no collision check. Reads are 100:1, so cache and CDN the redirect and return 301 versus 302 deliberately."],
            ["News feed", "Fan-out on write versus on read", "Fan-out on write for normal users (fast reads, expensive writes), on read for celebrities with millions of followers. The hybrid is the answer, and the threshold is the design."],
            ["Notification system", "Multi-channel delivery with dedupe", "Per-user preferences and quiet hours, an idempotency key per notification to survive at-least-once, provider fallback per channel, and a template service so copy is not code."],
            ["Chat", "Connection state and message ordering", "WebSocket with a connection registry so you know which node holds a user; per-conversation sequence numbers for ordering; client-generated ids for optimistic send and dedupe."],
            ["Rate limiter", "Distributed atomic counters", "Token bucket for burst, sliding window counter for accuracy, Redis plus Lua for atomicity, and 429 with Retry-After so clients cooperate."],
            ["Metrics pipeline", "Aggregation, cardinality and retention", "Aggregate at the edge before shipping, downsample by age, and treat high-cardinality labels as the actual cost driver."],
            ["Your Jio platform", "Everything above, but you lived it", "The event-driven decision: a new consumer is a new consumer group, not a change to ingestion."],
          ],
        },
        { t: "h", text: "The exercise: your platform, end to end, 30 minutes, no notes" },
        {
          t: "steps",
          items: [
            {
              title: "Entities and boundaries — 4 minutes",
              text: "`Store` (1,900), `Brand` (6), `Item`/`SKU`, `RfidTag` (EPC to SKU binding), `Reader` and `Antenna`, `StockOnHand` (store, SKU, qty, as-of), `Movement` (in, out, transfer, adjustment, shrink), `CycleCount`, `User` with role and store scope. Then the three portals — Store, Cluster, Self-Checkout — and one sentence each on which entities they read and which they write. Do not draw boxes until every entity has a one-clause responsibility."
            },
            {
              title: "The write path, scan to store — 6 minutes",
              text: "RFID reader emits EPC reads to an edge gateway; the gateway deduplicates (a tag in an antenna field reads many times per second, so you debounce per EPC per reader within a window) and batches; the ingestion service resolves EPC to SKU and store, validates, and publishes to Kafka keyed by store plus SKU; consumers project into PostgreSQL stock-on-hand and into a compacted current-state topic. Name what is idempotent and where the idempotency key comes from. Name the ordering guarantee you rely on and the partition key that grants it."
            },
            {
              title: "The read path, and why it is two paths — 6 minutes",
              text: "Portals read aggregates from PostgreSQL, where stored procedures pre-aggregate stock-on-hand so the heavy work is off the request path — that is the 10s to 2s story. Simultaneously the real-time layer holds an SSE connection per open portal tab and pushes deltas within five seconds, replacing the 15-minute batch. Be explicit about the reconciliation problem: the initial page load is a snapshot at time T and the stream delivers events from time T', so you need a sequence number or an as-of timestamp per row to avoid applying a delta you already have, or missing one in the gap. That is the detail an interviewer will find if you do not raise it."
            },
            {
              title: "Data stores, and one justification each — 4 minutes",
              text: "PostgreSQL as the system of record (transactions on movements, ad-hoc reporting, partitioned by time). Kafka as the event log (replay, fan-out, ordering). A compacted topic or Redis as the current-state snapshot for fast consumer restart. Redis for sessions, rate limits and hot dashboard aggregates. Object storage for exports and camera-derived artefacts. If you cannot justify a store in one sentence, remove it."
            },
            {
              title: "Failure modes, stated before they are asked — 6 minutes",
              text: "A reader goes offline: gaps in cycle counts, so tags absent from a count must not be assumed shrunk — you need a completeness signal per count. Kafka consumer lag grows: the portal shows stale data, so surface an as-of timestamp in the UI rather than silently lying, and alert on lag trend per partition. A consumer group rebalance during deploy: freshness SLA breached, so static membership and cooperative assignment. A poison message: DLQ with the original offset and a replay path. The SSE fleet redeploys: thousands of connections drop simultaneously, so clients need jittered reconnect with Last-Event-ID resume or you self-inflict a thundering herd. Postgres replica lag: a user adjusts stock and does not see it, so read-your-writes routing for that session."
            },
            {
              title: "What you would change with hindsight — 4 minutes",
              text: "Have two real answers ready, with reasoning. Candidates: a schema registry and versioned event contracts from day one, because untyped JSON on a topic with several consumers becomes an undocumented coupling; an explicit outbox pattern so the database write and the Kafka publish cannot diverge; per-partition lag SLOs wired to alerts rather than dashboards; and an as-of timestamp surfaced in the UI from the start, because 'is this number current' was the question users actually asked. A stated regret with a mechanism behind it reads as seniority; 'nothing, it worked well' reads as inexperience."
            },
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Practise it as a monologue, then as a dialogue",
          text: "Run it twice. First alone, out loud, thirty minutes, no notes, and record yourself — you will find the two places you hesitate, and those are exactly where an interviewer will push. Then have one of the four engineers you lead play interviewer with a brief to interrupt: \"why Kafka and not a cron job\", \"what if a consumer is down for two hours\", \"how do you know the number on the screen is correct\", \"why stored procedures\". The second run is the one that makes the story robust, because the first run only proves you can recite it.",
        },
        {
          t: "list",
          items: [
            "Estimate in ninety seconds, then say what the numbers rule out. Concluding that scale is not the bottleneck is a strong answer.",
            "Drive the round: requirements with numbers, estimate, API and data model, architecture with separate read and write paths, deep dive, failure modes.",
            "Six classic designs, one core idea each. Learn the idea, not the diagram.",
            "Your own platform is the strongest asset in this module. Rehearse it to fluency: entities, write path, read path, stores, failure modes, regrets.",
            "Always surface the snapshot-versus-stream reconciliation problem yourself. It is the detail that proves you built a real-time system rather than read about one.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain what actually prevents a service from scaling horizontally, and name four places in-process state hides.",
    "Name six load-balancer algorithms with the failure mode of each, and explain the difference between L4 and L7 balancing.",
    "Explain why sticky sessions complicate autoscaling and draining, and name the one case where stickiness is unavoidable.",
    "List the four cache layers and, for each, state the cache key and the invalidation path.",
    "Compare cache-aside, write-through, write-behind and refresh-ahead, and justify cache-aside with delete-on-write as the default.",
    "Describe the cache-aside race that permanently caches a stale value, and give three independent mitigations.",
    "Explain cache stampede and describe single-flight, distributed locking, TTL jitter and stale-while-revalidate as fixes.",
    "Argue SQL versus NoSQL purely from access patterns for a given product, and rebut the claim that NoSQL is schemaless.",
    "Explain the leftmost-prefix rule, selectivity, covering indexes and sargability, using a query from your own reporting work.",
    "Explain replica lag, why it breaks read-your-writes, and give three fixes including the log-sequence-number approach.",
    "Explain sharding: shard key, mapping function, hash versus range, consistent hashing with virtual nodes, and what you lose.",
    "State CAP precisely, then explain what PACELC adds and why the else-branch matters more in practice.",
    "Place strong, eventual, read-your-writes, monotonic and causal consistency in a product, and argue for different consistency per operation.",
    "Explain Kafka partitions, the partition key, and the exact scope of the ordering guarantee. Then explain why adding partitions is dangerous.",
    "Explain consumer groups, what triggers a rebalance, why the eager protocol is stop-the-world, and four ways to reduce rebalance cost.",
    "Compare at-most-once, at-least-once and exactly-once, and explain why an idempotent consumer is the honest answer once an external database is involved.",
    "Explain what the idempotent producer actually guarantees, and why it is narrower than exactly-once.",
    "Explain consumer lag as an operational metric, why you alert on its trend, and how per-partition lag reveals a bad partition key.",
    "Compare retention and compaction, and explain when a compacted topic is the right current-state store.",
    "Explain why a dead-letter queue is mandatory on a partitioned log, and what metadata it must preserve.",
    "Compare a partitioned log with a broker-style queue, and give one system you would build with each.",
    "Explain the three circuit-breaker states and why an open breaker without a fallback is just a faster outage.",
    "Estimate QPS, daily storage growth and peak bandwidth for your own platform from memory, then state what those numbers rule out.",
    "Explain fan-out on write versus fan-out on read for a news feed, and where the hybrid threshold should sit.",
    "Whiteboard your Jio inventory platform end to end in 30 minutes with no notes, then state two things you would change with hindsight.",
  ],

  math: [
    {
      title: "QPS from daily active users",
      formula: "avgQPS = DAU x actionsPerUser / secondsActive · peakQPS = avgQPS x peakFactor (3-10)",
      note: "Use 86,400 s/day, or 28,800 for an 8-hour enterprise workday. Your platform: 12,000 x 20 views x 5 calls / 28,800 ~ 42 avg, ~210 peak. Say the conclusion out loud: at that scale, load is not the bottleneck and the design should not pretend otherwise.",
    },
    {
      title: "Storage growth and retention cost",
      formula: "bytesPerDay = writesPerDay x bytesPerRecord · total = bytesPerDay x retentionDays x replicationFactor",
      note: "38M RFID events/day at 300 B is ~11.4 GB/day, ~1 TB over 90 days, x3 for replication. Retention is the cost driver, which is the argument for 7 days of raw replay plus a compacted current-state topic that stops growing.",
    },
    {
      title: "Compacted topic size",
      formula: "compactedBytes = distinctKeys x bytesPerRecord   // bounded, not time-proportional",
      note: "1,900 stores x 20,000 SKUs = 38M keys at 300 B is ~11.4 GB and stable. This is why compaction is the right snapshot store for stock-on-hand: consumer restart replays one record per item, not every movement ever recorded.",
    },
    {
      title: "Bandwidth and real-time fan-out",
      formula: "egress = concurrentConnections x updatesPerSec x payloadBytes · memory = connections x perConnBytes",
      note: "3,600 SSE connections x 5 updates/s x 200 B is ~3.6 MB/s, and ~36 MB of connection memory. Connection COUNT is the constraint, not bandwidth: file descriptors, LB idle timeouts and graceful drain on deploy are what actually bite.",
    },
    {
      title: "Kafka partition sizing",
      formula: "partitions >= max(targetThroughput / perPartitionThroughput, desiredConsumerParallelism)",
      note: "Parallelism within a group is capped by partition count, so this number sets your ceiling. Add headroom: increasing partitions later rehashes keys and breaks per-key ordering. partition = murmur2(key) % numPartitions when a key is present.",
    },
    {
      title: "Consumer lag",
      formula: "lag(partition) = logEndOffset - committedOffset · timeToDrain = lag / (consumeRate - produceRate)",
      note: "Alert on sustained positive derivative, not an absolute threshold — bursts that drain are normal. If consumeRate <= produceRate the lag is unbounded and no amount of waiting helps. Uneven lag across partitions means a hot key, not a capacity shortfall.",
    },
    {
      title: "Token bucket rate limiter",
      formula: "tokens = min(capacity, tokens + elapsedMs x refillPerMs); allow = tokens >= 1",
      note: "Lazy refill computed from elapsed time, so no timers. Capacity is the burst allowance, refill rate is the sustained limit. Distributed, it must be atomic: Redis plus a Lua script, or a compare-and-swap loop. Return 429 with Retry-After.",
    },
    {
      title: "Quorum reads and writes",
      formula: "R + W > N  =>  read set and write set overlap  =>  read-your-writes",
      note: "N replicas, W acknowledged writes, R queried reads. W = N gives fast reads and slow writes; R = 1, W = N is a read-optimised choice. Tunable per query is the whole point of leaderless replication.",
    },
    {
      title: "Availability arithmetic",
      formula: "99.9% = 43.2 min/month · 99.99% = 4.3 min/month · serial deps multiply: 0.999^5 = 99.5%",
      note: "Quote the minutes, not the nines. The multiplication is the useful part: five serial dependencies at three nines each cannot produce a three-nines service, which is the mathematical argument for graceful degradation and circuit breakers with fallbacks.",
    },
    {
      title: "Little's law for queue sizing",
      formula: "L = lambda x W   (items in system = arrival rate x time in system)",
      note: "At 2,640 events/s with 50 ms of processing, roughly 132 events are in flight, which sizes your consumer concurrency and prefetch. It also tells you that if arrival rate exceeds service rate the queue grows without bound — a queue is a shock absorber, never a capacity fix.",
    },
    {
      title: "Cache effectiveness",
      formula: "effectiveLatency = hitRate x cacheLatency + (1 - hitRate) x originLatency",
      note: "A 90% hit rate on a 2 ms cache in front of a 200 ms origin gives ~22 ms. The lesson is the shape of the curve: going 90% to 95% halves origin load, while 50% to 55% barely moves latency. Always state the hit rate you are assuming and how you would measure it.",
    },
    {
      title: "Fan-out on write versus on read",
      formula: "writeCost = followers x insertCost   ·   readCost = following x queryCost + mergeCost",
      note: "Fan-out on write is right when followers-per-user is small and reads dominate; it collapses on celebrity accounts, where one post becomes millions of writes. The hybrid threshold (fan-out on write below N followers, on read above) is the actual design decision.",
    },
  ],

  practice: [
    { type: "theory", q: "Whiteboard your Jio inventory platform end to end in 30 minutes with no notes, out loud, recorded. Then watch it back and list every place you hesitated." },
    { type: "theory", q: "Repeat the platform whiteboard with a colleague briefed to interrupt: why Kafka and not a cron job, what if a consumer is down two hours, how does the user know the number is current, why stored procedures." },
    { type: "math", q: "Estimate your platform from memory in ninety seconds: QPS, ingestion events per second at peak, daily and 90-day storage, SSE connection count and egress. Then write the one-sentence conclusion about what the real bottleneck is." },
    { type: "math", q: "Design the partition key for your SOH topic three ways (brand, store, store plus SKU). For each, state the key cardinality, the ordering guarantee gained, and the hot-partition risk." },
    { type: "theory", q: "Write out what happens, second by second, during a rolling deploy of ten Kafka consumers under the eager rebalance protocol. Then rewrite it with static membership and cooperative assignment." },
    { type: "math", q: "Implement an idempotent consumer against PostgreSQL: dedupe table, single transaction covering the dedupe insert and the business write, and a DLQ path with full original metadata. Explain why this is the honest answer to exactly-once." },
    { type: "math", q: "Implement cache-aside with single-flight, a distributed lock, TTL jitter and stale-while-revalidate. Then write the test that proves 100 concurrent misses cause exactly one origin load." },
    { type: "math", q: "Take one slow query from your reporting work. Run EXPLAIN ANALYZE, add a covering index, re-run it, and write down the plan change and the ratio. This is your database credibility in one paragraph." },
    { type: "math", q: "Implement a distributed token-bucket rate limiter with Redis and a Lua script. Explain why the Lua script is required and what breaks with GET then SET." },
    { type: "math", q: "Implement a circuit breaker with closed, open and half-open states, a failure-rate threshold over a rolling window, and a mandatory fallback. Wire it into a fetch wrapper." },
    { type: "theory", q: "Design a URL shortener in 30 minutes. Justify base62-of-a-counter over hashing, and state the read/write ratio and the caching strategy that follows from it." },
    { type: "theory", q: "Design a news feed in 40 minutes. Present fan-out on write, fan-out on read, and the hybrid, and state where you would put the follower-count threshold and why." },
    { type: "theory", q: "Design a multi-channel notification system in 40 minutes: preferences, quiet hours, dedupe with idempotency keys, per-channel provider fallback, templating, and delivery-status tracking." },
    { type: "theory", q: "Design a chat system in 40 minutes. Cover the connection registry, per-conversation sequence numbers, offline delivery, read receipts, and what happens when a user is connected on three devices." },
    { type: "theory", q: "Design a metrics and monitoring pipeline in 30 minutes: edge aggregation, cardinality control, downsampling by age, alert evaluation, and where the storage cost actually lives." },
    { type: "theory", q: "For your own platform, write down five failure modes and, for each, the alert that would catch it and the degraded behaviour the user would see." },
    { type: "theory", q: "Write a one-page brief on the snapshot-versus-stream reconciliation problem in your SSE layer, including the exact mechanism you would use to avoid double-applying or missing a delta." },
  ],

  resources: [
    { label: "Designing Data-Intensive Applications — Martin Kleppmann. The single book that makes distributed systems answers sound earned rather than memorised. For recall, re-read Chapters 5 (replication), 6 (partitioning), 7 (transactions), 9 (consistency and consensus) and 11 (stream processing).", url: "https://dataintensive.net/", kind: "book" },
    { label: "System Design Interview Vol. 1 and 2 — Alex Xu. Not deep, but the best format practice available: it teaches the shape of an answer, which is what you are optimising for at this stage.", url: "https://www.amazon.in/System-Design-Interview-insiders-Second/dp/B08CMF2CQF", kind: "book" },
    { label: "ByteByteGo — diagram-led explanations of exactly the classic designs listed in this module. Use it for rapid recall, not first-time learning.", url: "https://bytebytego.com/", kind: "course" },
    { label: "Apache Kafka documentation — Design and Implementation sections. Read the actual docs on the log, partitioning, consumer groups, delivery semantics and log compaction. When an interviewer probes Kafka, this is the source that makes you unshakeable.", url: "https://kafka.apache.org/documentation/#design", kind: "docs" },
    { label: "Confluent — Consumer group rebalancing, static membership and incremental cooperative rebalancing. The best written explanation of the rebalance cost and its mitigations.", url: "https://www.confluent.io/blog/cooperative-rebalancing-in-kafka-streams-consumer-ksqldb/", kind: "blog" },
    { label: "Confluent — Exactly-once semantics: transactions in Kafka. Read it specifically to be able to explain what idempotent producers do and do not guarantee, and where the boundary with an external database sits.", url: "https://www.confluent.io/blog/transactions-apache-kafka/", kind: "blog" },
    { label: "The System Design Primer — the best free structured checklist. Use it to find the topics you cannot answer in thirty seconds, then close the gaps.", url: "https://github.com/donnemartin/system-design-primer", kind: "repo" },
    { label: "Use The Index, Luke — Markus Winand. The clearest explanation anywhere of leftmost prefix, covering indexes and sargability. Directly upgrades the way you talk about your stored-procedure work.", url: "https://use-the-index-luke.com/", kind: "docs" },
    { label: "Amazon Builders' Library — production essays on timeouts, retries, jitter, load shedding and health checks. This is where the failure-mode language in the last ten minutes of an HLD round comes from.", url: "https://aws.amazon.com/builders-library/", kind: "blog" },
    { label: "Dynamo: Amazon's Highly Available Key-value Store (2007). Worth reading once for quorum, consistent hashing and vector clocks in the authors' own words — it is where R + W > N comes from.", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", kind: "paper" },
    { label: "Daniel Abadi — Consistency Tradeoffs in Modern Distributed Database System Design (PACELC). Short, and it gives you the framing that beats a CAP recital.", url: "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf", kind: "paper" },
  ],
};

export default p11;
