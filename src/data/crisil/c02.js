const c02 = {
  id: "c02",
  week: 2,
  hours: 4,
  title: "FastAPI / Django / Flask: One Question, Three Right Answers",
  tag: "Framework",
  why: "The JD names all three frameworks — that is a strong signal they want someone who can reason about trade-offs, not just recite one framework's syntax. You need one working mental model that maps cleanly onto whichever one comes up in the interview.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 22,
      title: "Same REST API, three frameworks, one set of trade-offs",
      summary:
        "WSGI vs ASGI, where each framework sits on the batteries-included spectrum, and how to answer 'which would you pick and why' without sounding like you memorised a comparison chart.",
      blocks: [
        {
          t: "p",
          text: "Every one of these frameworks solves the same problem — turn an HTTP request into a validated response — with different defaults. The question to prepare for is never “explain Flask”; it is “why would you pick X here, and what does it cost you.” Have the trade-offs ready as opinions backed by reasons, not a memorised table.",
        },
        { t: "h", text: "The one structural fact that explains most of the differences" },
        {
          t: "table",
          head: ["Framework", "Protocol", "Async-native?", "Philosophy"],
          rows: [
            ["FastAPI", "ASGI", "Yes — built around async def from the ground up", "Minimal core + typed everything via Pydantic; you assemble what you need"],
            ["Django", "WSGI by default, ASGI supported (Django Channels / async views since 3.1+)", "Partial — async views exist, but the ORM is sync unless you're careful", "Batteries included: ORM, admin panel, auth, migrations all ship in the box"],
            ["Flask", "WSGI (or ASGI via Quart, a separate async-flavoured sibling)", "No, not natively", "Micro-framework: routing and little else; you choose every other piece via extensions"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "WSGI vs ASGI, in one sentence",
          text: "WSGI handles one request per worker thread/process, synchronously, full stop — it has no concept of awaiting anything. ASGI is the async-capable successor: a single worker can hold many requests in flight, awaiting I/O on each, which is exactly the concurrency model a trading backend juggling market-data streams and order calls needs.",
        },
        { t: "h", text: "The same endpoint, three ways" },
        {
          t: "code",
          lang: "python",
          caption: "FastAPI — validation is the framework's whole personality",
          code: `from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI()

class OrderRequest(BaseModel):
    symbol: str
    side: str          # "BUY" | "SELL"
    quantity: int
    price: float | None = None   # None => market order

async def get_db():
    async with db_pool.acquire() as conn:
        yield conn

@app.post("/orders")
async def place_order(order: OrderRequest, db=Depends(get_db)):
    # order is already validated and typed by the time you get here —
    # a bad payload returns 422 automatically, before this line runs
    order_id = await db.fetchval(
        "INSERT INTO orders (symbol, side, qty, price) VALUES ($1,$2,$3,$4) RETURNING id",
        order.symbol, order.side, order.quantity, order.price,
    )
    return {"order_id": order_id, "status": "NEW"}`,
        },
        {
          t: "code",
          lang: "python",
          caption: "Django REST Framework — same shape, framework does more for you",
          code: `# serializers.py
class OrderSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    side = serializers.ChoiceField(choices=["BUY", "SELL"])
    quantity = serializers.IntegerField()
    price = serializers.FloatField(required=False, allow_null=True)

# views.py
class OrderView(APIView):
    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = Order.objects.create(**serializer.validated_data)
        return Response({"order_id": order.id, "status": "NEW"})`,
        },
        {
          t: "code",
          lang: "python",
          caption: "Flask — smallest surface area, you wire validation yourself",
          code: `from flask import Flask, request, jsonify
from marshmallow import Schema, fields, validate

app = Flask(__name__)

class OrderSchema(Schema):
    symbol = fields.Str(required=True)
    side = fields.Str(validate=validate.OneOf(["BUY", "SELL"]))
    quantity = fields.Int(required=True)
    price = fields.Float(allow_none=True)

@app.post("/orders")
def place_order():
    data = OrderSchema().load(request.get_json())  # raises on invalid input
    order_id = db.insert_order(**data)
    return jsonify(order_id=order_id, status="NEW")`,
        },
        { t: "h", text: "Dependency injection: FastAPI's sharpest tool" },
        {
          t: "p",
          text: "FastAPI's `Depends()` is worth understanding properly because it is genuinely elegant and interviewers like probing it. A dependency is just a callable; FastAPI resolves it before your endpoint runs, caches it per-request if reused, and supports `yield`-based dependencies for setup/teardown — which is precisely how you acquire and release a DB connection or a Redis client cleanly around a request, without a try/finally in every handler.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "ASGI vs WSGI is the load-bearing distinction — it is why FastAPI feels natural for a real-time, I/O-heavy trading backend and Flask does not without extra work.",
            "Django buys you an ORM, migrations, admin and auth for free; that speed comes from convention, and async is still a partial story there.",
            "Flask's minimalism is the point — pick it when you want full control and few opinions, not when you want the fastest path to a working service.",
            "FastAPI's Depends() with yield is the clean pattern for per-request resource lifecycle (DB connections, Redis clients) — know it cold, it is a common code-reading question.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain the practical difference between WSGI and ASGI and why it matters for a trading backend handling live market data.",
    "Given a hypothetical service that needs an admin panel, auth, and rapid CRUD scaffolding, argue for Django. Given one that needs a lean async API in front of a WebSocket feed, argue for FastAPI.",
    "Explain how FastAPI's Depends() with yield handles setup and teardown, and why that is safer than manual try/finally scattered across handlers.",
    "Explain what Pydantic validation actually buys you over hand-written if-checks in a Flask view.",
  ],

  math: [
    {
      title: "FastAPI dependency with yield (resource lifecycle)",
      formula: "async def get_conn(): async with pool.acquire() as c: yield c",
      note: "Code before yield runs on request start, code after yield runs on cleanup — even if the handler raises. This is the idiomatic replacement for try/finally per-endpoint.",
    },
    {
      title: "Pydantic model as the single source of truth",
      formula: "class X(BaseModel): field: type = default",
      note: "One model gives you validation, serialization, OpenAPI docs and IDE typing simultaneously — worth naming all four benefits, not just 'validation'.",
    },
  ],

  practice: [
    { type: "math", q: "Build a FastAPI endpoint that accepts an order payload, validates it with Pydantic, and inserts it via an async DB dependency. 20 minutes." },
    { type: "theory", q: "A teammate proposes building a new low-latency order-status WebSocket service in Django. Write the two-paragraph pushback you would give, focused on ASGI maturity and the ORM's sync default." },
    { type: "theory", q: "Explain, as if to a non-technical recruiter, why 'FastAPI, Django, or Flask' is not really an apples-to-apples comparison." },
  ],

  resources: [
    { label: "FastAPI official docs — Dependencies with yield.", url: "https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/", kind: "docs" },
    { label: "Django docs — Asynchronous support (views, ORM caveats).", url: "https://docs.djangoproject.com/en/stable/topics/async/", kind: "docs" },
    { label: "ASGI vs WSGI — official ASGI spec introduction.", url: "https://asgi.readthedocs.io/en/latest/introduction.html", kind: "docs" },
  ],
};

export default c02;
