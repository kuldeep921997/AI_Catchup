const c06 = {
  id: "c06",
  week: 6,
  hours: 3,
  title: "Microservices & Event-Driven Architecture",
  tag: "Architecture",
  why: "This is a named mandatory skill, and you already have the raw material for it from Jio's Kafka-based SOH/RFID event pipeline — the gap is naming the patterns (idempotency, outbox, circuit breaker) rather than just having shipped the outcomes.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "Service boundaries, events, and the failure modes that actually get asked about",
      summary:
        "REST vs event-driven communication, the outbox pattern for reliable event publishing, idempotency, and circuit breakers — framed against the Kafka pipeline you already built.",
      blocks: [
        {
          t: "p",
          text: "You already reason about this correctly in practice: the Jio platform publishes Stock-on-Hand and RFID events to Kafka so consumers can subscribe without coupling to the producer. Microservices interviews test whether you can name the failure modes of that architecture and the patterns that close them, not just whether you can describe the happy path.",
        },
        { t: "h", text: "Synchronous REST vs asynchronous events" },
        {
          t: "table",
          head: ["", "Synchronous (REST/gRPC)", "Asynchronous (events)"],
          rows: [
            ["Coupling", "Caller must know the callee is up right now", "Producer and consumer are decoupled in time — this is exactly your SOH example"],
            ["Latency", "Caller waits for the full round trip", "Producer returns immediately after publishing"],
            ["Failure handling", "Caller gets an explicit error to react to", "Failures are silent unless you build retry/dead-letter handling explicitly"],
            ["Use it for", "Order placement — the caller needs a real-time accept/reject", "Trade confirmations, position updates, market-data fan-out"],
          ],
        },
        { t: "h", text: "The outbox pattern: the answer to 'what if the publish fails?'" },
        {
          t: "p",
          text: "The dangerous version of event publishing writes to the database, then separately publishes to Kafka. If the process crashes between those two steps, you have a committed order with no event ever published — a silent, hard-to-detect data-consistency bug. The outbox pattern fixes this by writing the event to an `outbox` table in the **same database transaction** as the business write, then having a separate relay process (or CDC tool like Debezium) read the outbox table and publish to Kafka, marking rows as sent.",
        },
        {
          t: "code",
          lang: "python",
          caption: "Outbox write — one atomic transaction, not two separate steps",
          code: `async with pool.acquire() as conn:
    async with conn.transaction():
        order_id = await conn.fetchval(
            "INSERT INTO orders (symbol, side, qty) VALUES ($1,$2,$3) RETURNING id",
            symbol, side, qty,
        )
        await conn.execute(
            "INSERT INTO outbox (event_type, payload, created_at) VALUES ($1,$2, now())",
            "ORDER_PLACED", json.dumps({"order_id": order_id, "symbol": symbol}),
        )
# A separate relay process polls the outbox table (or uses Debezium's
# CDC on the WAL) and publishes each row to Kafka, then marks it sent.
# Either both the order and its event exist, or neither does.`,
        },
        { t: "h", text: "Idempotency: the other half of reliable messaging" },
        {
          t: "p",
          text: "Most message brokers give you at-least-once delivery, which means your consumer **will** see duplicate messages eventually — a network blip causing a redelivered ack is normal, not exceptional. An idempotent consumer produces the same end state whether it processes a message once or five times. The standard mechanism is an idempotency key: record the message id you have already processed, and skip (or safely no-op) anything you have seen before.",
        },
        {
          t: "code",
          lang: "python",
          caption: "Idempotent consumer using a processed-ids table",
          code: `async def handle_execution_report(event):
    async with pool.acquire() as conn:
        async with conn.transaction():
            inserted = await conn.fetchval(
                "INSERT INTO processed_events (event_id) VALUES ($1) "
                "ON CONFLICT (event_id) DO NOTHING RETURNING event_id",
                event["event_id"],
            )
            if inserted is None:
                return  # already processed this exact event — safe no-op
            await apply_fill(conn, event)`,
        },
        { t: "h", text: "Circuit breaker: protecting yourself from a dying downstream" },
        {
          t: "p",
          text: "If a downstream broker/exchange API starts timing out, retrying every call at full volume just adds load to an already-struggling service and can cascade the failure back into your own system (thread/connection exhaustion). A circuit breaker tracks the failure rate; once it crosses a threshold, it 'opens' and fails fast without even attempting the call for a cool-down period, then allows a trial request through to see if the downstream has recovered.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Choose sync REST when the caller needs an immediate answer (place an order); choose events when the caller just needs to know something happened eventually (a fill occurred).",
            "The outbox pattern closes the gap between 'wrote to the database' and 'published the event' by making them one atomic transaction.",
            "At-least-once delivery is the norm, not the exception — consumers must be idempotent, not just correct on the first try.",
            "A circuit breaker exists to protect your own system from a failing downstream, not just to be polite to that downstream.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain when you would choose synchronous REST versus an asynchronous event for a given interaction, with a trading-system example of each.",
    "Explain the outbox pattern and exactly what data-consistency bug it prevents.",
    "Explain why at-least-once delivery makes idempotent consumers mandatory, not optional, and describe one concrete mechanism for achieving idempotency.",
    "Explain what a circuit breaker protects against, and what happens during its 'open' and 'half-open' states.",
    "Using your own Jio Kafka/SOH work as the example, explain the coupling trade-off between the producer and its consumers.",
  ],

  math: [
    {
      title: "Outbox pattern",
      formula: "BEGIN; INSERT business_row; INSERT outbox_row; COMMIT; -- relay polls outbox -> publish -> mark sent",
      note: "Guarantees the business write and the event either both happen or neither does, without a distributed transaction across the database and the broker.",
    },
    {
      title: "Idempotent consumer via dedupe table",
      formula: "INSERT INTO processed_events(id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id",
      note: "If the INSERT returns nothing, you have already processed this event id — skip re-applying the side effect.",
    },
    {
      title: "Circuit breaker states",
      formula: "CLOSED --failures>threshold--> OPEN --cooldown elapsed--> HALF_OPEN --success--> CLOSED (else back to OPEN)",
      note: "OPEN fails fast without calling downstream at all; HALF_OPEN lets exactly one trial request through to test recovery.",
    },
  ],

  practice: [
    { type: "theory", q: "Design, out loud, the event flow for an order fill: which service publishes what event, who consumes it, and where idempotency needs to be enforced." },
    { type: "math", q: "Implement an idempotent event handler backed by a processed-events dedupe table, and write a test that feeds the same event twice." },
    { type: "theory", q: "A downstream broker API is returning 500s intermittently and your order service's thread pool is exhausting under retry load. Propose the fix using the vocabulary from this module." },
  ],

  resources: [
    { label: "microservices.io — Transactional Outbox pattern.", url: "https://microservices.io/patterns/data/transactional-outbox.html", kind: "docs" },
    { label: "Martin Fowler — CircuitBreaker.", url: "https://martinfowler.com/bliki/CircuitBreaker.html", kind: "blog" },
  ],
};

export default c06;
