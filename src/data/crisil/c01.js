const c01 = {
  id: "c01",
  week: 1,
  hours: 4,
  title: "Async Python: From JS Promises to asyncio",
  tag: "Fundamentals",
  why: "AsyncIO is a named mandatory skill on the Crisil JD, and it is the fastest place to lose credibility if you answer it like a JavaScript developer guessing at Python syntax. You already understand event loops, microtasks and concurrency limiting cold from the frontend side — this module is a translation layer, not a new mental model.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "One event loop, two languages",
      summary:
        "Where Python's asyncio matches your JavaScript mental model exactly, and the three places it does not — the GIL, blocking calls, and how a Task differs from a Promise.",
      blocks: [
        {
          t: "p",
          text: "You already know the shape of this problem: a single-threaded event loop, a queue of callbacks, and the rule that nothing else runs while your code is running. Python's asyncio is built on the same idea. The differences that actually matter in an interview are small in number but easy to get wrong if you have not said them out loud before.",
        },
        { t: "h", text: "The direct translation" },
        {
          t: "table",
          head: ["JavaScript", "Python asyncio", "Note"],
          rows: [
            ["`Promise`", "`Coroutine` (from `async def`)", "A coroutine object does nothing until it is awaited or scheduled — same as a promise executor does not lazily wait, but calling an async function without awaiting it just creates the object"],
            ["`await`", "`await`", "Identical purpose: suspend this coroutine, let the loop run something else, resume when the awaited thing resolves"],
            ["scheduling a promise / microtask", "`asyncio.create_task(coro)`", "This is the key gap: writing `await coro()` runs it inline (like a sequential await); wrapping it in `create_task` is what actually schedules it to run concurrently, like starting a promise without awaiting it yet"],
            ["`Promise.all([...])`", "`asyncio.gather(*coros)`", "Runs concurrently, returns results in order, one exception cancels the rest by default unless `return_exceptions=True`"],
            ["`Promise.allSettled([...])`", "`asyncio.gather(*coros, return_exceptions=True)`", "Exceptions come back as values in the result list instead of raising"],
            ["`Promise.race([...])`", "`asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)`", "Returns (done, pending) sets; you still need to cancel the pending ones yourself — Python does not do this automatically"],
            ["event loop", "`asyncio.run(main())`", "Creates the loop, runs `main()` to completion, closes the loop — the standard entry point since Python 3.7"],
          ],
        },
        { t: "h", text: "The one difference that breaks people: the GIL and blocking calls" },
        {
          t: "p",
          text: "JavaScript has no threads to worry about — the runtime itself is single-threaded, full stop. Python has the Global Interpreter Lock (GIL), which means only one thread executes Python bytecode at a time even in a multi-threaded program. asyncio does not use threads for concurrency; it uses cooperative scheduling on one thread, same as JS. The failure mode unique to Python is this: if you call a **blocking, synchronous** function inside an `async def` — a plain `requests.get()`, a synchronous DB driver call, `time.sleep()` — it blocks the entire event loop, not just your coroutine. There is no automatic yielding the way there is with Promise-based I/O in JS.",
        },
        {
          t: "code",
          lang: "python",
          caption: "The bug every Python backend interview probes for",
          code: `import asyncio
import requests   # synchronous library — this is the trap

async def get_price(symbol: str):
    # BLOCKS THE ENTIRE LOOP. Every other coroutine waits, even
    # ones that have nothing to do with this request.
    response = requests.get(f"https://api.example.com/price/{symbol}")
    return response.json()

async def get_price_correct(symbol: str, session):
    # httpx / aiohttp are built on asyncio and actually yield
    # control back to the loop while waiting on the socket.
    response = await session.get(f"https://api.example.com/price/{symbol}")
    return response.json()

# If you are stuck with a sync-only library (a legacy DB driver, say),
# the escape hatch is to run it in a thread pool without blocking the loop:
async def get_price_legacy(symbol: str):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, sync_blocking_call, symbol)`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Say this unprompted",
          text: "“In Python, the danger isn’t forgetting to await — that just gives you a coroutine object and a warning. The danger is calling a synchronous, blocking function inside an async function, because it stalls the whole event loop, not just the caller. The fix is either an async-native library (httpx, asyncpg, aioredis) or offloading to a thread pool with run_in_executor.” That single sentence answers a huge fraction of asyncio interview questions before they are even fully asked.",
        },
        { t: "h", text: "Task vs coroutine vs future, precisely" },
        {
          t: "list",
          items: [
            "**Coroutine object** — what you get back from calling an `async def` function. It is inert until awaited or scheduled. Calling it does not run any code yet.",
            "**Task** — a coroutine wrapped by `asyncio.create_task()` (or `TaskGroup` in 3.11+). Creating a Task schedules it on the loop immediately; it starts making progress even before you await it. This is the equivalent of a JS promise that is already “in flight”.",
            "**Future** — a lower-level, framework-y primitive representing an eventual result. You rarely create these by hand in application code; Tasks are built on top of them.",
            "The classic bug: `results = [some_coro(x) for x in items]` followed by `await asyncio.gather(*results)` — this is actually fine because gather schedules them. The bug version is doing `for c in results: await c` in a loop, which runs them **sequentially**, exactly like chained awaits in JS.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Your JS event-loop intuition transfers almost completely: single thread, cooperative scheduling, await suspends and resumes.",
            "`create_task` / `gather` is how you get concurrency; a bare sequence of `await` calls is sequential, just like unbatched awaits in JS.",
            "The unique Python failure mode is a blocking synchronous call inside async code — it stalls the entire loop, and there is no automatic protection against it.",
            "Prefer async-native libraries (httpx, asyncpg, aioredis) end to end; fall back to `run_in_executor` only for legacy sync code you cannot replace.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain why asyncio needs asyncio.create_task to get real concurrency, while a bare await runs things sequentially.",
    "Explain what happens to the entire event loop if you call a blocking, synchronous function inside an async def, and why this is worse than the equivalent mistake in JavaScript.",
    "Explain the difference between a coroutine object, a Task and a Future in your own words.",
    "Explain why the GIL exists and why it does not prevent asyncio from being useful for I/O-bound trading and market-data workloads.",
    "Explain the difference between asyncio.gather and asyncio.wait, including what happens to pending tasks in each.",
    "Explain run_in_executor and when you would reach for it instead of an async-native library.",
  ],

  math: [
    {
      title: "Concurrency limiter with asyncio.Semaphore",
      formula: "sem = asyncio.Semaphore(n); async with sem: await work()",
      note: "The direct Python equivalent of the thunk-based promise pool you already know from JS. The semaphore caps how many coroutines are inside the `async with` block at once; everything else awaits its turn.",
    },
    {
      title: "Fan-out / fan-in with gather",
      formula: "results = await asyncio.gather(*(fetch(i) for i in ids), return_exceptions=True)",
      note: "return_exceptions=True is the asyncio equivalent of Promise.allSettled — without it, one failure cancels the whole gather and raises.",
    },
    {
      title: "Timeout wrapping",
      formula: "async with asyncio.timeout(5): await slow_call()   # 3.11+, else asyncio.wait_for(coro, timeout=5)",
      note: "There is no built-in per-request timeout unless you add one — an un-timeboxed await on a broker or exchange API call can hang a worker indefinitely in production.",
    },
    {
      title: "Producer/consumer with asyncio.Queue",
      formula: "q = asyncio.Queue(maxsize=n); await q.put(item); item = await q.get()",
      note: "Standard shape for a market-data ingest loop: one coroutine reads a websocket and pushes ticks onto the queue, N worker coroutines pull and process — backpressure comes free from maxsize.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain to a Python-only backend engineer, using no JavaScript vocabulary, why calling requests.get() inside an async def is a production incident waiting to happen." },
    { type: "math", q: "Write an async function that fetches prices for 100 symbols with at most 10 in flight at once, using asyncio.Semaphore. 15 minutes." },
    { type: "math", q: "Write a producer/consumer pair using asyncio.Queue: one producer pushes 1000 fake market ticks, five consumers process them concurrently. 20 minutes." },
    { type: "theory", q: "Given a code review showing a for-loop with await inside it fetching ten independent resources sequentially, write the comment you would leave and the fixed version." },
  ],

  resources: [
    { label: "Python docs — asyncio: the official reference for Tasks, Futures and the event loop.", url: "https://docs.python.org/3/library/asyncio-task.html", kind: "docs" },
    { label: "Real Python — Async IO in Python: A Complete Walkthrough.", url: "https://realpython.com/async-io-python/", kind: "blog" },
    { label: "httpx docs — the async-native HTTP client used in modern FastAPI codebases.", url: "https://www.python-httpx.org/async/", kind: "docs" },
  ],
};

export default c01;
