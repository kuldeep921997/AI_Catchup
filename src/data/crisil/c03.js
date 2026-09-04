const c03 = {
  id: "c03",
  week: 3,
  hours: 3,
  title: "WebSocket APIs & Real-Time Backends in Python",
  tag: "Real-Time",
  why: "You already shipped real-time UI over Kafka and SSE at Jio and JVA — this module is about implementing the server side of that same problem in Python, which is exactly what 'develop REST APIs and WebSocket APIs for real-time applications' means on the JD.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "WebSocket, SSE and polling — picking correctly, then building it",
      summary:
        "Why WebSocket is the right choice for order/market-data streaming specifically, the FastAPI connection-manager pattern, and how to scale it past one process with Redis pub/sub.",
      blocks: [
        {
          t: "p",
          text: "You have already made this call once, on the client side, choosing SSE for JVA's alerting feed. The server-side reasoning is the same trade-off viewed from the other end, plus one new constraint: trading systems need bidirectional communication — the client sends order actions, not just receives updates — which SSE cannot do at all.",
        },
        { t: "h", text: "Choosing the transport" },
        {
          t: "table",
          head: ["Transport", "Direction", "Use it for"],
          rows: [
            ["Polling", "Client asks repeatedly", "Low-frequency updates where simplicity beats latency — never for live market data"],
            ["SSE", "Server → client only, over plain HTTP", "One-way feeds: notifications, alerts — what you built at JVA"],
            ["WebSocket", "Full duplex", "Order actions + live fills + market-data ticks over one connection — the trading-system default"],
          ],
        },
        { t: "h", text: "A FastAPI WebSocket endpoint with a connection manager" },
        {
          t: "code",
          lang: "python",
          caption: "The pattern you will be asked to reproduce or extend",
          code: `from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active: dict[str, WebSocket] = {}   # user_id -> socket

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self.active[user_id] = ws

    def disconnect(self, user_id: str):
        self.active.pop(user_id, None)

    async def send_to(self, user_id: str, message: dict):
        ws = self.active.get(user_id)
        if ws:
            await ws.send_json(message)

    async def broadcast(self, message: dict):
        # gather, not a sequential loop — one slow client should not
        # delay delivery to everyone else
        for ws in list(self.active.values()):
            await ws.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def order_updates(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()   # e.g. a cancel-order action
            await handle_client_action(user_id, data)
    except WebSocketDisconnect:
        manager.disconnect(user_id)`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The single-process trap",
          text: "That ConnectionManager only knows about sockets held by *this* process. Run two Uvicorn workers behind a load balancer and an execution-report generated on worker A can never reach a client whose WebSocket is held open on worker B. This is the question that separates people who have built one demo from people who have run this in production.",
        },
        { t: "h", text: "Scaling past one process: Redis pub/sub as the fan-out layer" },
        {
          t: "code",
          lang: "python",
          caption: "Every worker subscribes; any worker can publish",
          code: `import redis.asyncio as redis

async def redis_listener(manager: ConnectionManager):
    r = redis.from_url("redis://localhost")
    pubsub = r.pubsub()
    await pubsub.subscribe("order-updates")
    async for message in pubsub.listen():
        if message["type"] != "message":
            continue
        payload = json.loads(message["data"])
        await manager.send_to(payload["user_id"], payload)

# Anywhere in the app — another worker, a background job, the order
# service itself — publishing is a one-liner and reaches every worker:
await r.publish("order-updates", json.dumps({"user_id": uid, "status": "FILLED"}))`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Say this unprompted",
          text: "“A WebSocket connection is pinned to one process. The moment you run more than one worker, you need a fan-out layer — Redis pub/sub is the simplest one, Kafka if you also need durability and replay. The connection manager handles local delivery; pub/sub handles cross-process delivery.” This is the exact shape of the answer a trading-systems interviewer wants.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "WebSocket over SSE whenever the client needs to send as well as receive — order actions make this non-negotiable for a trading backend.",
            "A connection manager (dict of id → socket) is the standard local-delivery pattern; broadcast with gather-style concurrency, not a blocking sequential loop.",
            "One process cannot see another process's sockets — Redis pub/sub (or Kafka) is what makes fan-out work across multiple workers.",
            "Always handle WebSocketDisconnect explicitly and clean up the connection-manager entry — a leaked entry means messages sent into the void.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain why WebSocket, not SSE, is the correct transport for an order-entry and execution-report feed.",
    "Explain why a naive in-memory connection manager breaks the moment you run more than one backend worker, and what fixes it.",
    "Explain the difference between Redis pub/sub and Redis Streams for this use case, and when durability/replay would push you toward Streams or Kafka instead.",
    "Explain how you would detect and clean up a dead WebSocket connection that disconnected without a clean close handshake.",
  ],

  math: [
    {
      title: "Connection manager",
      formula: "dict[user_id] -> WebSocket, with connect/disconnect/send_to/broadcast",
      note: "The single most-asked real-time backend pattern in Python interviews. Know it well enough to write from memory in under 10 minutes.",
    },
    {
      title: "Cross-process fan-out via Redis pub/sub",
      formula: "PUBLISH channel message  /  SUBSCRIBE channel -> async for message in pubsub.listen()",
      note: "Every worker process runs its own subscriber loop feeding its own local connection manager. Publishing from anywhere reaches every worker.",
    },
  ],

  practice: [
    { type: "math", q: "Implement a FastAPI WebSocket endpoint with a connection manager supporting connect, disconnect, send-to-one and broadcast. 25 minutes." },
    { type: "theory", q: "Your WebSocket service is deployed with 4 replicas behind a load balancer and clients report missing order updates roughly 75% of the time. Diagnose the cause and propose the fix." },
    { type: "theory", q: "Compare Redis pub/sub against Kafka as the fan-out layer for a multi-instance WebSocket service, in terms of delivery guarantees and replay." },
  ],

  resources: [
    { label: "FastAPI docs — WebSockets.", url: "https://fastapi.tiangolo.com/advanced/websockets/", kind: "docs" },
    { label: "redis-py docs — asyncio pub/sub.", url: "https://redis.readthedocs.io/en/stable/examples/asyncio_examples.html", kind: "docs" },
  ],
};

export default c03;
