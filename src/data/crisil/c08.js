const c08 = {
  id: "c08",
  week: 8,
  hours: 3,
  title: "Algo Trading, Backtesting, Broker APIs & FIX Protocol",
  tag: "Trading Domain",
  why: "These are the specific 'preferred' bullets on the JD you have the least direct exposure to — FIX protocol especially. The goal here is not mastery, it is being able to hold a competent conversation about each and be honest about depth where you have not touched something directly.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "From strategy signal to exchange fill, and the message format underneath it",
      summary:
        "The algo-trading pipeline end to end, what backtesting actually has to guard against, how broker/exchange integrations are typically shaped, and enough FIX protocol to read a message and not freeze.",
      blocks: [
        {
          t: "p",
          text: "This module covers four JD bullets that are really one pipeline viewed at different stages: a strategy generates a signal, a backtester validates it against history, a broker/exchange API sends it live, and FIX is very often the wire format that carries it there. You have already built the piece in the middle of this pipeline — order execution against a data model — so anchor the new material to that.",
        },
        { t: "h", text: "The algo-trading pipeline" },
        {
          t: "steps",
          items: [
            { title: "Signal generation", text: "A strategy (rules-based or model-driven) evaluates market data and produces a directional decision: buy, sell, or hold, at what size." },
            { title: "Risk/sizing layer", text: "Position sizing and pre-trade risk checks (the RMS from the previous module) sit here, before anything reaches an order." },
            { title: "Order routing / execution", text: "The signal becomes an actual order, sent to a broker or directly to an exchange, using whatever protocol that venue exposes." },
            { title: "Execution feedback", text: "Fills, partial fills and rejections come back as execution reports, updating the strategy's view of its own position." },
            { title: "Reconciliation", text: "End-of-day (or continuous) comparison of the system's internal position/P&L record against the broker's or exchange's official record, catching any drift." },
          ],
        },
        { t: "h", text: "Backtesting: the part people get wrong" },
        {
          t: "list",
          items: [
            "**Look-ahead bias** — accidentally letting the backtest see data that would not have been available at that point in time (a very common bug: using a day's closing price to decide a trade that 'happens' during that same day).",
            "**Survivorship bias** — testing only against instruments that still exist today, silently excluding the ones that went bankrupt or were delisted, which flatters the strategy's historical performance.",
            "**Slippage and commission modelling** — a backtest that assumes you always get the quoted price with zero cost will overstate real-world returns; realistic backtests subtract an estimated slippage and fee on every simulated fill.",
            "**Overfitting** — tuning a strategy's parameters until it looks great on one historical window, with no reason to believe it generalises forward. The standard guard is an out-of-sample test period the parameters were never tuned against.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The one sentence that shows you understand backtesting",
          text: "“A backtest that doesn't model slippage, commissions and look-ahead bias isn't measuring the strategy — it's measuring how good the backtest is at flattering the strategy.” Said naturally, this signals real understanding rather than textbook recall.",
        },
        { t: "h", text: "Broker / exchange API integration patterns" },
        {
          t: "p",
          text: "Broker and exchange connectivity generally comes in one of three shapes: a modern **REST/WebSocket API** (increasingly common with retail-facing and newer venues — this is where your FastAPI/WebSocket module applies directly), a vendor **SDK** wrapping a proprietary binary or FIX session, or raw **FIX protocol** itself for institutional-grade connectivity. A backend engineer's job across all three is largely the same: translate your internal order representation into the venue's format, handle acknowledgements and rejections, and reconcile execution reports back into your own order state machine.",
        },
        { t: "h", text: "FIX protocol: just enough to not freeze" },
        {
          t: "p",
          text: "FIX (Financial Information eXchange) messages are a sequence of `tag=value` pairs separated by a delimiter (SOH, shown here as `|` for readability), not JSON and not XML. You do not need to memorise the spec — you need to recognise the shape and the handful of tags that come up constantly.",
        },
        {
          t: "code",
          lang: "text",
          caption: "A simplified NewOrderSingle message",
          code: `8=FIX.4.4|9=112|35=D|49=CLIENT12|56=BROKER|34=215|52=20260904-10:15:30|
11=ORD00001|55=AAPL|54=1|38=100|40=2|44=189.50|59=0|10=128|

  8  BeginString     -> FIX.4.4
  9  BodyLength
 35  MsgType         -> D  = NewOrderSingle
 49  SenderCompID    -> who is sending
 56  TargetCompID    -> who should receive it
 34  MsgSeqNum
 52  SendingTime
 11  ClOrdID         -> the client's own order id (matches your internal order)
 55  Symbol          -> AAPL
 54  Side            -> 1 = Buy, 2 = Sell
 38  OrderQty        -> 100
 40  OrdType         -> 2  = Limit (1 = Market)
 44  Price           -> 189.50
 59  TimeInForce     -> 0  = Day
 10  Checksum`,
        },
        {
          t: "p",
          text: "The reply is an ExecutionReport (`35=8`), carrying `39` (OrdStatus: 0=New, 1=Partially Filled, 2=Filled, 8=Rejected...), `150` (ExecType — what just happened), `17` (ExecID), and `37` (the venue's own OrderID, distinct from your `ClOrdID`). The mental model: `ClOrdID` is how you correlate an incoming ExecutionReport back to the order you sent, exactly like correlating a webhook callback to the request that triggered it.",
        },
        {
          t: "note",
          tone: "interview",
          title: "The honest answer if pressed on hands-on FIX experience",
          text: "“I haven't operated a live FIX session, but I understand the message shape — tag=value pairs, NewOrderSingle and ExecutionReport as the core pair, ClOrdID for correlation — and conceptually it maps directly onto the order-execution data model I built at Algonauts, just with a different wire format. I'd expect to be productive with a FIX engine library (like QuickFIX/Python) within days, not weeks, because the domain model is already familiar.” This is far stronger than pretending to depth you do not have.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "The pipeline is signal → risk/sizing → order routing → execution feedback → reconciliation. Anchor every answer to where in this pipeline the question sits.",
            "Backtesting has four classic traps: look-ahead bias, survivorship bias, unmodelled slippage/commissions, and overfitting. Name them unprompted.",
            "Broker/exchange connectivity is REST/WebSocket, a vendor SDK, or raw FIX — your job is the same translation-and-reconciliation role regardless of wire format.",
            "FIX is tag=value, not JSON. Know NewOrderSingle (35=D), ExecutionReport (35=8), and that ClOrdID is the correlation key — that is enough to hold a real conversation.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Walk through the algo-trading pipeline from signal generation to reconciliation, naming what happens at each stage.",
    "Explain look-ahead bias and survivorship bias, each with a concrete example of how it silently creeps into a backtest.",
    "Explain why unmodelled slippage and commissions make a backtest's returns unreliable.",
    "Explain what ClOrdID is for in FIX, and how it relates to the OrderID a venue assigns.",
    "Explain, honestly, what you do and do not have hands-on experience with regarding FIX protocol, and how you would ramp up quickly.",
  ],

  math: [
    {
      title: "FIX message shape",
      formula: "tag=value delimited fields; 35=MsgType identifies the message (D=NewOrderSingle, 8=ExecutionReport)",
      note: "Not JSON, not XML — a flat, ordered set of numbered fields. Recognise the shape, don't try to memorise the full spec.",
    },
    {
      title: "Backtest realism checklist",
      formula: "return_net = return_gross - slippage_est - commission_est, tested strictly out-of-sample",
      note: "The four words to say unprompted: look-ahead, survivorship, slippage, overfitting.",
    },
  ],

  practice: [
    { type: "theory", q: "Design, out loud, the reconciliation job that compares your system's end-of-day positions against a broker's official statement, and what you would do on a mismatch." },
    { type: "theory", q: "A backtest shows a strategy returning 40% annually with zero drawdown. List the three things you would check before believing that number." },
    { type: "theory", q: "Explain to a non-trading engineer what ClOrdID and OrderID each identify, and why a system needs both." },
  ],

  resources: [
    { label: "FIX Trading Community — FIX protocol overview and specifications.", url: "https://www.fixtrading.org/what-is-fix/", kind: "docs" },
    { label: "QuickFIX/Python — open-source FIX engine, useful for seeing real message construction in Python.", url: "https://quickfixengine.org/", kind: "repo" },
    { label: "Investopedia — Backtesting, and the biases that undermine it.", url: "https://www.investopedia.com/terms/b/backtesting.asp", kind: "docs" },
  ],
};

export default c08;
