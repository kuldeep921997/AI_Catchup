const c07 = {
  id: "c07",
  week: 7,
  hours: 3,
  title: "Trading Domain Primer: OMS, RMS, Order Lifecycle & Market Data",
  tag: "Trading Domain",
  why: "This is the part of the JD you are already strongest on, even though it does not look that way from the resume yet. You built order-execution and portfolio APIs at Algonauts — this module gives you the vocabulary (OMS, RMS, order states, market data levels) to describe that work the way a trading-systems interviewer thinks about it.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "OMS vs RMS, order states, and where your Algonauts work already fits",
      summary:
        "The vocabulary interviewers use for order management and risk systems, mapped directly onto the trading simulator you already built.",
      blocks: [
        {
          t: "p",
          text: "You built 'order-execution and portfolio APIs' for an algorithmic trading simulator — in the vocabulary this JD uses, that means you have already built a slice of an OMS and touched the data an RMS depends on. The work is the same; the words are what is missing. This module supplies the words.",
        },
        { t: "h", text: "OMS vs RMS — different jobs, same trade" },
        {
          t: "table",
          head: ["System", "Job", "Answers the question"],
          rows: [
            ["OMS (Order Management System)", "Creates, routes, tracks and updates orders through their lifecycle", "\"What is the current state of this order, and where is it in the market?\""],
            ["RMS (Risk Management System)", "Checks orders against limits before and during trading; can block or kill", "\"Are we allowed to send this order, and should we stop trading right now?\""],
          ],
        },
        {
          t: "p",
          text: "In practice these sit next to each other: an order typically passes through pre-trade RMS checks (position limits, buying power, fat-finger checks on size/price) before the OMS is allowed to route it to a broker or exchange. The data model behind order execution, position keeping and intraday P&L that you designed at Algonauts is precisely the shared substrate both systems read from.",
        },
        { t: "h", text: "The order lifecycle: states you must be able to recite" },
        {
          t: "table",
          head: ["State", "Meaning"],
          rows: [
            ["New", "Order accepted by the OMS/exchange, not yet matched"],
            ["Partially Filled", "Some quantity executed, remainder still working"],
            ["Filled", "Fully executed"],
            ["Cancelled", "Withdrawn before full execution, by the client or the system"],
            ["Rejected", "Never accepted — failed validation or a risk check"],
            ["Expired", "Time-in-force elapsed (e.g. a Day order at market close) without full execution"],
          ],
        },
        { t: "h", text: "Order types, briefly" },
        {
          t: "list",
          items: [
            "**Market** — execute immediately at the best available price; no price control, guaranteed (near-)immediate fill.",
            "**Limit** — execute only at a specified price or better; price control, fill is not guaranteed.",
            "**Stop** — becomes a market order once a trigger price is touched; used to cap losses or enter breakouts.",
            "**Time-in-force flags**: **Day** (expires at close), **IOC** (Immediate-Or-Cancel — fill what you can right now, cancel the rest), **FOK** (Fill-Or-Kill — fill the entire quantity immediately or cancel it entirely, no partial fills allowed).",
          ],
        },
        { t: "h", text: "Market data: what Level 1 and Level 2 actually mean" },
        {
          t: "list",
          items: [
            "**Level 1** — best bid, best ask, and last trade price/size. Enough for a simple price ticker.",
            "**Level 2 / order book depth** — the full stack of resting bids and offers at each price level. This is what a sorted-set-backed order book (from the Redis module) is modelling.",
            "**Tick data** — every individual trade/quote event, timestamped; the raw input to any backtest.",
            "**OHLC / candles** — Open-High-Low-Close aggregated over a time bucket, derived from tick data for charting and lower-frequency strategies.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Your rehearsed answer for 'tell me about your trading-systems experience'",
          text: "“At Algonauts I was the founding engineer on an algorithmic trading simulator. I designed the data model behind order execution, position keeping and intraday P&L — so I was directly modelling order state transitions, and the portfolio APIs I built consumed the same kind of position and market data an RMS would use for risk checks. I haven't operated a production OMS/RMS at exchange scale, but the domain model is one I designed from scratch, not one I read about.” That is honest, specific, and reframes a simulator as real domain exposure rather than a toy project.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "OMS manages the order lifecycle; RMS gates it with pre-trade and real-time risk checks. Know the boundary between them.",
            "Recite the six order states and the difference between Day, IOC and FOK without hesitation.",
            "Level 1 is best bid/ask; Level 2 is the full depth of the book; tick data is the raw feed everything else aggregates from.",
            "Translate your Algonauts work into this vocabulary explicitly — the substance is already there.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain the difference between an OMS and an RMS, including a concrete example of a check the RMS would perform before the OMS routes an order.",
    "Recite the order lifecycle states and explain the difference between Rejected and Cancelled.",
    "Explain the difference between IOC and FOK, and give a scenario where each is the correct choice.",
    "Explain the difference between Level 1 and Level 2 market data, and what an order book is built from.",
    "Describe your Algonauts order-execution work using OMS/RMS vocabulary, out loud, in under 90 seconds.",
  ],

  math: [
    {
      title: "Order state machine",
      formula: "NEW -> (PARTIALLY_FILLED)* -> FILLED | CANCELLED | REJECTED | EXPIRED",
      note: "A REJECTED order never passes through NEW in most models — it fails validation/risk before acceptance. Partially filled orders can still be cancelled for the remainder.",
    },
    {
      title: "Pre-trade risk check shape",
      formula: "check(order) -> allow | reject(reason)  # position limit, buying power, price collar, max order size",
      note: "Runs synchronously before the OMS routes the order — this is exactly the kind of low-latency, correctness-critical check a Python backend interview may ask you to design or implement.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain, using your Algonauts experience as the example, how position keeping and intraday P&L connect to what an RMS checks in real time." },
    { type: "theory", q: "Design a pre-trade risk check function that rejects an order exceeding a per-symbol position limit, and describe what data it needs to read." },
    { type: "theory", q: "Walk through what happens, state by state, to a Day Limit order that is partially filled and then the market closes." },
  ],

  resources: [
    { label: "Investopedia — Order Management System (OMS).", url: "https://www.investopedia.com/terms/o/order-management-system.asp", kind: "docs" },
    { label: "Investopedia — Time in Force order types (Day, IOC, FOK, GTC).", url: "https://www.investopedia.com/terms/t/timeinforce.asp", kind: "docs" },
  ],
};

export default c07;
