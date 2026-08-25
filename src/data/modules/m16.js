const m16 = {
  id: "m16",
  week: 16,
  hours: 8,
  title: "Agentic AI: Multi-Step Reasoning, Planning & Multi-Agent Systems",
  tag: "Agents",
  why: "Not on your original list, but this is where the whole industry is heading in 2025-2026 — agents that plan, use tools, and collaborate. This ties every prior module together into the current frontier.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "What is an agent, and do you need one?",
      summary: "The distinction that matters most, and the most useful piece of engineering advice in the whole field.",
      blocks: [
        {
          t: "p",
          text: "\"Agent\" has been stretched to mean anything involving an LLM and a loop. The useful definition draws a line based on who controls the control flow.",
        },
        {
          t: "table",
          head: ["", "Workflow", "Agent"],
          rows: [
            ["Control flow", "You wrote it, in code", "The model decides at runtime"],
            ["Steps", "Known in advance", "Determined dynamically"],
            ["Predictability", "High", "Low"],
            ["Testability", "Straightforward", "Hard"],
            ["Cost per request", "Bounded and known", "Variable, needs a cap"],
            ["Handles novelty", "Only what you anticipated", "Can adapt"],
            ["Example", "Retrieve → rerank → generate", "\"Investigate this incident and report back\""],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The single most useful piece of advice in this module",
          text: "**Find the simplest thing that works, and only add agency when you have measured that you need it.** A prompt is simpler than a chain. A chain is simpler than a workflow. A workflow is simpler than an agent. Every step up the ladder buys flexibility and costs predictability, latency, money, and debuggability. Most tasks that people build agents for are workflows in disguise — and the workflow version is faster, cheaper, and more reliable.",
        },
        { t: "h", text: "The workflow patterns you should try first" },
        {
          t: "list",
          items: [
            "**Prompt chaining** — decompose into fixed sequential steps, each simpler than the whole. Add a validation gate between steps.",
            "**Routing** — classify the input, dispatch to a specialised handler. Cheap, and it lets each path be optimised and tested independently.",
            "**Parallelisation** — fan out independent subtasks and aggregate. Either sectioning (different subtasks) or voting (same task, multiple attempts).",
            "**Orchestrator-workers** — a model decides which of a *fixed set* of subtasks to run; the subtasks themselves are workflows. This is often the sweet spot: dynamic where it needs to be, deterministic everywhere else.",
            "**Evaluator-optimiser** — generate, critique, revise, with a bounded number of iterations. Excellent for writing and code where quality criteria are articulable.",
          ],
        },
        {
          t: "p",
          text: "Notice that four of those five have deterministic control flow. You get most of the perceived intelligence of an agent while keeping the ability to test, cost-bound, and reason about your system.",
        },
        { t: "h", text: "When agency genuinely earns its cost" },
        {
          t: "table",
          head: ["Condition", "Why it favours an agent"],
          rows: [
            ["The number of steps is unpredictable", "You cannot write a graph for a path you cannot enumerate"],
            ["Which tools are needed depends on intermediate findings", "Routing must happen after seeing results"],
            ["The environment gives feedback the agent can act on", "Compile errors, test failures, query results — a real signal to iterate against"],
            ["Errors are recoverable and verifiable", "The agent can detect failure and retry differently"],
            ["The value per task is high", "Justifies the extra cost and latency"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Coding agents are the clearest success case, and it is not a coincidence",
          text: "Software has all five properties: the number of steps is unknown, tools depend on findings, the compiler and test suite give unambiguous feedback, errors are visible and recoverable, and a completed task is worth a lot. Domains lacking verifiable feedback — open-ended research, subjective writing — see far weaker agent results. When assessing whether a task suits an agent, the first question to ask is: **what tells the agent it was wrong?** If nothing does, an agent will confidently compound its errors.",
        },
        {
          t: "note",
          tone: "warn",
          title: "The demo-to-production gap is unusually large here",
          text: "Agent demos are compelling and agent production deployments are hard. A 90%-reliable agent is a wonderful demo and an unacceptable product for anything consequential, because the 10% failures are unpredictable and expensive. Be sceptical of published capability claims, and always measure end-to-end task success on your own tasks rather than per-step accuracy.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "The ReAct loop",
      summary: "The core mechanism, what it looks like when it works, and what it looks like when it fails.",
      blocks: [
        {
          t: "p",
          text: "ReAct — Reason + Act — interleaves reasoning with tool use. The model thinks about what to do, does it, observes the result, and thinks again. That loop is what separates an agent from a single function call.",
        },
        {
          t: "code",
          lang: "text",
          caption: "A ReAct trace",
          code: `Goal: "Why did checkout error rates spike yesterday afternoon?"

Thought: I need the error rate timeline first to find the window.
Action:  query_metrics(service="checkout", metric="error_rate",
                       start="-36h")
Observ.: Baseline 0.3%. Spike to 4.1% between 14:20 and 15:05.

Thought: A 45-minute window. Check for deploys in that window.
Action:  list_deploys(start="-36h")
Observ.: checkout-api v2.14.0 deployed 14:18.

Thought: Two minutes before the spike — strong candidate. Confirm
         by looking at the errors themselves.
Action:  search_logs(service="checkout", level="error",
                     start="14:18", end="15:05")
Observ.: 8,412 × "PaymentValidator: null reference at line 87"

Thought: I have deploy correlation and a specific error. Check
         whether the rollback resolved it.
Action:  query_metrics(service="checkout", metric="error_rate",
                       start="15:00", end="16:00")
Observ.: Returns to 0.3% at 15:07, matching a rollback at 15:05.

Thought: Confirmed. I can now answer with evidence.
Answer:  v2.14.0 introduced a null reference in PaymentValidator...

Note what makes this work: each observation genuinely changes the
next action. That adaptivity is the whole point — and it is why
you cannot replace it with a fixed sequence of calls.`,
        },
        { t: "h", text: "Why interleaving beats separating" },
        {
          t: "list",
          items: [
            "**Reasoning grounds the action.** Rather than guessing which tool to call, the model articulates why — which measurably improves selection, for the same reason chain-of-thought helps generally (Module 11).",
            "**Observations correct the reasoning.** Pure chain-of-thought can build an elaborate argument on a false premise with nothing to contradict it. A tool result is external evidence that can break the chain.",
            "**Failures become recoverable.** A tool error is just another observation. The model can try different arguments, a different tool, or report that it cannot proceed. A single-shot function call has no such option.",
          ],
        },
        { t: "h", text: "The implementation" },
        {
          t: "code",
          lang: "python",
          caption: "The whole agent loop, with the guardrails that matter",
          code: `messages = [{"role": "user", "content": goal}]

for step in range(MAX_STEPS):                    # 1. hard bound
    response = llm.invoke(messages, tools=tools)
    messages.append(response)

    if not response.tool_calls:                  # model chose to answer
        return response.content

    for call in response.tool_calls:             # 2. often parallel
        if not authorised(call, user):           # 3. YOUR check, not the
            result = "Permission denied."        #    model's judgement
        elif requires_confirmation(call):
            result = await confirm_with_user(call)   # 4. human gate
        else:
            try:
                result = execute(call)
            except Exception as e:
                result = f"Error: {e}. Check the arguments and retry."
                                                 # 5. actionable error text
        messages.append(tool_result(call.id, truncate(result)))
                                                 # 6. bound context growth

return "I couldn't complete this within the step limit."   # 7. graceful

# Seven lines of the above are safety and reliability machinery, not
# agent logic. That ratio is representative of production agents.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Context growth is the constraint nobody plans for",
          text: "Every step appends a thought, a tool call, and a result. Twenty steps with verbose tool output easily exceeds 100k tokens — so cost rises superlinearly across the run, latency climbs with each step's prefill, and quality degrades as important early context gets lost in the middle (Module 4). Practical mitigations: truncate and summarise tool results aggressively, keep only the last few observations verbatim, offload bulk data to files the agent can re-read on demand, and compact the history when it crosses a threshold.",
        },
        { t: "h", text: "Failure modes of the bare loop" },
        {
          t: "table",
          head: ["Failure", "What it looks like", "Fix"],
          rows: [
            ["Loop", "The same tool call repeated with identical arguments", "Detect duplicate calls; inject a nudge; hard step cap"],
            ["Thrash", "Alternating between two approaches without progress", "Force a plan; track progress against it"],
            ["Premature answer", "Answers before gathering enough evidence", "Require evidence in the answer; add a verification step"],
            ["Tool confusion", "Uses the wrong tool for the job", "Better tool descriptions with negative guidance (Module 10)"],
            ["Error blindness", "Ignores a tool error and carries on", "Make errors explicit and instructive in the observation"],
            ["Context loss", "Forgets a constraint stated at the start", "Restate the goal and constraints periodically"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Native tool calling replaced ReAct's text format",
          text: "The original ReAct paper parsed `Thought: … Action: …` out of free text with regexes, which failed constantly. Modern implementations use native tool calling (Module 10): the reasoning is ordinary content, the action is a structured tool-call object. The *pattern* is unchanged and the reliability is transformed. If you see a tutorial parsing agent actions with regular expressions, it predates the API feature that fixed the problem.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 14,
      title: "Planning and decomposition",
      summary: "When to plan up front, when to plan as you go, and how to search when one path is not enough.",
      blocks: [
        {
          t: "p",
          text: "Bare ReAct is greedy: it picks the locally best next action with no view of the whole task. That works for short tasks and degrades on long ones, where an early wrong turn wastes many steps. Planning addresses that.",
        },
        { t: "h", text: "Plan-and-execute" },
        {
          t: "steps",
          items: [
            { title: "1. Plan", text: "One call: produce an explicit ordered list of steps to achieve the goal." },
            { title: "2. Execute", text: "Work through the steps, each potentially with its own small ReAct loop. Often a cheaper model suffices here." },
            { title: "3. Re-plan on divergence", text: "If a step fails or reveals something unexpected, revise the remaining plan rather than abandoning the whole thing." },
          ],
        },
        {
          t: "table",
          head: ["", "ReAct (interleaved)", "Plan-and-execute"],
          rows: [
            ["Sees the whole task", "No — greedy", "Yes"],
            ["Adapts to surprises", "Immediately", "At re-planning points"],
            ["LLM calls", "One per step", "One plan + cheap execution"],
            ["Cost", "Higher (frontier model every step)", "Lower (plan once with a strong model)"],
            ["Observability", "Poor — no stated intent", "Good — the plan is inspectable and steerable"],
            ["Best for", "Short, exploratory tasks", "Long tasks with a knowable structure"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The underrated benefit of an explicit plan: human review",
          text: "A plan is a checkpoint you can show a person *before* anything happens. \"I'm going to do these six things, three of which modify data — approve?\" This is far more tractable than approving twenty individual tool calls, and it maps directly onto LangGraph's interrupt-before-node (Module 10). For any agent with write access, plan review is the highest-value human-in-the-loop design.",
        },
        { t: "h", text: "Decomposition" },
        {
          t: "list",
          items: [
            "**Least-to-most** — solve the simplest subproblem first and use its answer for the next. Good for compositional problems where later parts depend on earlier ones.",
            "**Parallel decomposition** — split into independent subtasks, fan out concurrently, aggregate. This is where latency savings live: a research task with six independent lookups should take one lookup's time, not six.",
            "**Recursive decomposition** — a subtask may itself be decomposed. Powerful, and requires a depth limit or it does not terminate.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Decomposition has a cost you must weigh",
          text: "Each subtask is a separate LLM call with its own context, so it may lack information from sibling subtasks and may duplicate work. Aggregation is itself a non-trivial step where contradictions surface. Only decompose when subtasks are genuinely near-independent — otherwise a single call with the whole problem often beats five calls plus a merge.",
        },
        { t: "h", text: "Search: Tree of Thoughts" },
        {
          t: "p",
          text: "For problems where one reasoning path is not enough, generate multiple candidate steps, evaluate them, and expand the promising branches — classical search with an LLM as both the generator and the heuristic.",
        },
        {
          t: "math",
          formula: "cost ≈ branching_factor^depth × cost_per_node",
          note: "Branching 3 to depth 4 is 81 nodes plus evaluation calls. This is why ToT stays largely in research: the cost is exponential and most practical tasks do not need it. Beam search — keeping the best k at each level — is the affordable compromise.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Reasoning models absorbed much of this",
          text: "Models trained with RL on verifiable outcomes perform extended internal search — backtracking, checking, exploring alternatives — inside a single generation. Much of what ToT and self-consistency provided externally is now trained in. The practical consequence: **try a reasoning model before building an explicit search harness.** It is usually cheaper, simpler, and better. Explicit search remains valuable when you have an external verifier (a test suite, a simulator) that the model cannot run internally.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 16,
      title: "Tool design and context engineering",
      summary: "Agent reliability is determined mostly by tool design and context management, not by the model.",
      blocks: [
        {
          t: "p",
          text: "When an agent misbehaves, the instinct is to blame the model or add prompt instructions. In practice most failures trace to two things: tools that are badly specified, and a context window that has become a mess.",
        },
        { t: "h", text: "Tool design rules" },
        {
          t: "steps",
          items: [
            {
              title: "1. Design tools for the agent, not for your API",
              text: "Do not expose your REST endpoints one-to-one. A REST API is designed for programmers with documentation; an agent has only the description. Prefer one `search_customer_orders(query)` over five endpoints requiring IDs the agent must obtain first. Fewer round trips, fewer chances to go wrong.",
            },
            {
              title: "2. Make the description do the work",
              text: "State when to use it, when NOT to use it, what the arguments mean with example values, and what the result looks like. Negative guidance — 'do not use this for policy questions, use search_policies' — is what prevents confusion between adjacent tools.",
            },
            {
              title: "3. Constrain arguments with types and enums",
              text: "`status: Literal['pending','shipped','delivered']` is enforced by the schema. `status: str` invites invented values and a wasted round trip.",
            },
            {
              title: "4. Return compact, structured results",
              text: "Tool output enters the context and costs tokens for the rest of the run. Return the fields that matter. If a result is inherently large, write it to a file and return a path plus a summary.",
            },
            {
              title: "5. Make errors instructive",
              text: "\"No customer matched 'CUST-4471'. IDs are 6 digits, e.g. 447112. Try search_customers by name.\" The agent can act on that. A stack trace produces a retry with the same wrong argument.",
            },
            {
              title: "6. Make writes idempotent and gated",
              text: "Idempotency keys so retries are safe; permission checks in your code; confirmation for anything irreversible. Never rely on the model choosing not to call a destructive tool.",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Test tools in isolation",
          text: "For each tool, write ten queries that should trigger it and ten that should not, and measure selection accuracy. This localises the problem: if the agent picks correctly in isolation but not in combination, you have overlapping descriptions; if it picks wrongly in isolation, the description is the bug. Debugging tool selection inside a full agent run is far harder than testing it directly.",
        },
        { t: "h", text: "Too many tools" },
        {
          t: "p",
          text: "Reliability degrades noticeably beyond roughly 10–20 tools in one call — descriptions consume context, and similar tools become confusable. Three responses:",
        },
        {
          t: "list",
          items: [
            "**Namespacing and grouping** — coherent prefixes (`orders_*`, `billing_*`) help the model reason about categories.",
            "**Progressive disclosure** — expose a small set, plus a `find_tools(description)` tool that returns relevant schemas on demand. Scales to hundreds without filling the context.",
            "**Routing to sub-agents** — a supervisor with 5 sub-agents, each owning 10 tools, keeps any single decision small. See lesson 6.",
          ],
        },
        { t: "h", text: "Context engineering" },
        {
          t: "p",
          text: "The term has largely displaced \"prompt engineering\" for agents, and the shift is meaningful: with a multi-step loop, the question is not how to word one prompt but how to manage what occupies a finite window across twenty steps.",
        },
        {
          t: "table",
          head: ["Technique", "What it does"],
          rows: [
            ["Truncate tool results", "Cap output size; return a summary plus a handle to full data"],
            ["Compact the history", "Summarise older steps when a token threshold is crossed"],
            ["Offload to files", "Write findings to disk; the agent re-reads what it needs (used by real coding agents)"],
            ["Restate goal and constraints", "Re-inject periodically so they do not get lost in the middle"],
            ["Prune dead ends", "Remove abandoned branches from the history entirely"],
            ["Structure the scratchpad", "A maintained todo list or state object rather than free-form accumulation"],
            ["Sub-agent isolation", "Give a sub-agent a clean context for its subtask; return only the conclusion"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The sub-agent context argument",
          text: "The strongest reason to use sub-agents is not specialisation — it is context isolation. A research sub-agent may read 50k tokens of documents and return a 500-token summary. The parent never sees the 50k. This keeps the orchestrator's context clean and its decisions sharp across a long run, and it is why multi-agent systems often work better than one agent with a very long history even when the 'specialisation' is nominal.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 12,
      title: "Memory and environment",
      summary: "What an agent should remember across steps, tasks, and sessions — and why the filesystem is underrated.",
      blocks: [
        {
          t: "p",
          text: "Module 12 covered chatbot memory. Agents add a requirement: they accumulate *working* state during a task, and that state is often larger than the context window.",
        },
        {
          t: "table",
          head: ["Type", "Scope", "Implementation"],
          rows: [
            ["Scratchpad", "Within one task", "The message history, or an explicit state object"],
            ["Working artefacts", "Within one task, too large for context", "Files, a database, a scratch directory"],
            ["Episodic", "Across tasks", "Vector store of past task summaries and outcomes"],
            ["Semantic", "Across tasks", "Key-value facts about the user and environment"],
            ["Procedural", "Across tasks", "Learned recipes: 'for this task type, do X then Y'"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The filesystem is the most underrated agent memory",
          text: "Give the agent a working directory and tools to read, write, and list files. It can then keep notes, save intermediate results, and re-read what it needs — with no token cost for data it is not currently using. This is how effective coding agents work, and it neatly sidesteps the context-growth problem from lesson 2. It is also inspectable: you can look at the files afterwards and see what the agent actually did, which is worth a great deal when debugging.",
        },
        { t: "h", text: "Procedural memory: learning from experience" },
        {
          t: "p",
          text: "The most interesting and least mature category. After completing a task, record what worked as a reusable recipe; retrieve relevant recipes when starting a similar task. Voyager demonstrated this convincingly in Minecraft by building a growing skill library of verified code.",
        },
        {
          t: "list",
          items: [
            "**Works when success is verifiable** — you can only store a skill as 'known good' if something confirmed it worked.",
            "**Risks entrenching bad habits** — a recipe that worked once by luck gets reused. Store outcomes alongside recipes and prune what stops working.",
            "**Retrieval matters** — this is a RAG problem (Module 9), with the same failure modes: retrieve the wrong recipe and you have actively harmed the run.",
          ],
        },
        { t: "h", text: "Environment design" },
        {
          t: "list",
          items: [
            "**Sandbox code execution.** A container with no network, no credentials, resource limits, and a timeout. Non-negotiable if the agent runs code.",
            "**Scope credentials to the task.** A token with exactly the permissions this task needs, expiring when it ends. Not your service account.",
            "**Make the environment observable.** The agent needs to see the results of its actions — file listings, exit codes, query results. An agent acting blind compounds errors invisibly.",
            "**Make actions reversible where you can.** Git branches rather than direct edits, staged changes rather than applied ones, soft deletes rather than hard. Reversibility is what makes a 90%-reliable agent tolerable.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Never give an agent credentials broader than its task",
          text: "The confused-deputy problem from Module 12 applies with full force: if an agent reads untrusted content and holds broad credentials, injected instructions execute with your authority. Scope every credential to the minimum, prefer read-only by default, and require explicit escalation for writes. This is the control that holds even when everything else fails.",
        },
      ],
    },

    {
      id: "l6",
      level: "core",
      minutes: 14,
      title: "Multi-agent systems",
      summary: "The patterns, the honest assessment of when they help, and the one property that predicts success.",
      blocks: [
        {
          t: "p",
          text: "Multi-agent architectures are appealing and frequently over-applied. They genuinely help in specific circumstances and add coordination overhead in all of them.",
        },
        { t: "h", text: "The patterns" },
        {
          t: "table",
          head: ["Pattern", "Structure", "Suits"],
          rows: [
            ["Supervisor / workers", "One orchestrator delegates to specialists", "The general-purpose default"],
            ["Sequential pipeline", "A → B → C, each a specialist", "Well-understood stages (research → draft → edit)"],
            ["Parallel fan-out", "N agents on independent subtasks, then merge", "Broad research; the main latency win"],
            ["Debate", "Agents argue, a judge decides", "Subjective questions; expensive"],
            ["Reviewer / critic", "One produces, another critiques", "Quality gates; the most reliably useful pattern"],
            ["Hierarchical", "Supervisors of supervisors", "Very large tasks; coordination cost grows fast"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The reviewer pattern is the one that consistently earns its cost",
          text: "A separate critic with a clean context and an adversarial instruction finds problems the author misses — not because it is smarter, but because it is not anchored on the author's reasoning. Self-critique in the same context is measurably weaker, because the model is defending its own chain of thought. If you adopt one multi-agent pattern, adopt this one.",
        },
        { t: "h", text: "Parallel fan-out: where the real win is" },
        {
          t: "p",
          text: "A research task needing information from six independent sources takes six sequential steps with one agent, or roughly one step's time with six parallel sub-agents. That is a genuine, measurable, defensible improvement — and it comes with the context-isolation benefit from lesson 4: each sub-agent reads a lot and returns a little.",
        },
        {
          t: "note",
          tone: "warn",
          title: "The token cost is the honest counterargument",
          text: "Published accounts put multi-agent research systems at roughly 15× the tokens of a single chat interaction. That is justifiable for high-value tasks and absurd for routine ones. Do the arithmetic on your task's value before adopting a fan-out architecture — and note that the *latency* improvement is often the real prize, not the quality improvement.",
        },
        { t: "h", text: "Where multi-agent systems fail" },
        {
          t: "list",
          items: [
            "**Ambiguous ownership.** Two agents that could both handle a task, or none that will. Same failure as overlapping tool descriptions, one level up.",
            "**Lossy handoffs.** Agent A's conclusion loses the caveats and uncertainty that mattered. Structure the handoff payload explicitly rather than passing prose.",
            "**Compounding errors.** Every handoff is another opportunity to misinterpret, and errors propagate without correction.",
            "**Coordination cost exceeding the benefit.** Three agents debating a question one could answer is pure overhead.",
            "**Debugging difficulty.** A failure in a five-agent system requires reconstructing five interacting traces. Budget for observability from the start (Module 10).",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The property that predicts success",
          text: "Multi-agent systems work when subtasks are **genuinely parallelisable and near-independent**, and fail when they require shared evolving context. Six independent literature searches: excellent. Six agents collaboratively editing one document: worse than one agent, because the shared state they all need is the thing they cannot share. Ask that question first and it will settle most architecture debates.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"When would you use a multi-agent architecture?\" Lead with the parallelisability test, name the reviewer pattern as the most reliably useful, cite the ~15× token cost honestly, and finish with the context-isolation argument — that a sub-agent reading 50k tokens and returning 500 keeps the orchestrator's context clean. That combination of enthusiasm and cost-awareness is what a senior answer sounds like.",
        },
      ],
    },

    {
      id: "l7",
      level: "advanced",
      minutes: 16,
      title: "Failure, safety, and evaluating agents",
      summary: "Why long agent chains fail arithmetically, what to do about it, and how to measure whether it worked.",
      blocks: [
        {
          t: "p",
          text: "Agents fail differently from single calls. The failures compound, they are expensive, and they are hard to reproduce. Start with the arithmetic, because it is the most clarifying thing in this lesson.",
        },
        { t: "h", text: "Compounding error" },
        {
          t: "math",
          formula: "P(success) = Π_{i=1}^{n} pᵢ     (independent steps)",
          note: "For n steps each succeeding with probability p, overall success is pⁿ. This is why per-step accuracy is a misleading metric for agents and why end-to-end task success is the only number that matters.",
        },
        {
          t: "table",
          head: ["Per-step accuracy", "5 steps", "10 steps", "20 steps", "50 steps"],
          rows: [
            ["90%", "59%", "35%", "12%", "0.5%"],
            ["95%", "77%", "60%", "36%", "8%"],
            ["99%", "95%", "90%", "82%", "61%"],
            ["99.9%", "99.5%", "99%", "98%", "95%"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Read that table carefully — it explains the whole field",
          text: "A 90%-reliable step is useless over 20 steps. This single fact explains why long-horizon agents are hard, why verification steps matter so much, and why coding agents work best: the compiler and test suite push per-step reliability toward 99.9% by catching errors immediately rather than letting them propagate. **The way to build a long agent is not a better model — it is a feedback signal that stops errors compounding.**",
        },
        {
          t: "list",
          items: [
            "**Add verification after consequential steps.** Turning a silent 90% into a detected-and-retried 99% transforms the table above.",
            "**Prefer shorter chains.** Ten steps beat thirty. Decompose into separately-verified tasks rather than one long run.",
            "**Make failures loud.** A step that fails silently is far worse than one that errors, because the agent proceeds on a false premise.",
            "**Checkpoint.** Persist state so a failure at step 15 does not restart from step 1 (Module 10).",
          ],
        },
        { t: "h", text: "Safety controls" },
        {
          t: "steps",
          items: [
            { title: "1. Step and token caps", text: "In code, not in a prompt. A stuck loop otherwise generates unbounded cost — the most common agent incident by a wide margin." },
            { title: "2. Least privilege, always", text: "Read-only by default; writes require explicit escalation, scoped credentials, and expiry." },
            { title: "3. Human approval for irreversible actions", text: "Sending communications, moving money, deleting data, modifying production. Approve the *plan* where possible (lesson 3) rather than each call." },
            { title: "4. Sandbox everything executable", text: "Container, no network, no credentials, resource and time limits." },
            { title: "5. Audit every action", text: "What, when, why, which conversation, which model version. You will need this the first time something goes wrong." },
            { title: "6. A kill switch per capability", text: "A feature flag that disables a tool immediately. More valuable than any amount of prompt hardening." },
            { title: "7. Treat all observations as untrusted", text: "Tool results, retrieved documents, and web content can carry injected instructions. The lethal trifecta from Module 12 applies with full force here — an agent with private data access, untrusted input, and an outbound channel is the canonical dangerous configuration." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Agents make prompt injection consequential",
          text: "In a chatbot, a successful injection produces bad text. In an agent with tools, it produces bad *actions* — an email sent, a record deleted, data exfiltrated. The severity is categorically different, and there is no reliable defence at the model level. This is why least privilege and human gates are not optional extras: they are the controls that still hold when injection succeeds.",
        },
        { t: "h", text: "Evaluating agents" },
        {
          t: "table",
          head: ["Metric", "Measures", "Note"],
          rows: [
            ["End-to-end task success", "Did it achieve the goal?", "The only metric that really counts"],
            ["Steps to completion", "Efficiency", "A rising trend signals degradation"],
            ["Cost per completed task", "Unit economics", "Include failed attempts, or the number is fiction"],
            ["Tool selection accuracy", "Right tool for the step", "Diagnostic — localises the fix to tool descriptions"],
            ["Recovery rate", "Did it recover from an error?", "The key differentiator between demo and production agents"],
            ["Unsafe action rate", "Attempted something it should not", "Must be measured, not assumed to be zero"],
            ["Human intervention rate", "How often a person was needed", "The honest measure of autonomy"],
          ],
        },
        {
          t: "steps",
          items: [
            { title: "Build a task suite with verifiable outcomes", text: "Tasks where success is programmatically checkable — a test passes, a record has the right value, a file contains the right content. Subjective tasks cannot be evaluated at the scale an agent needs." },
            { title: "Use a sandboxed replica environment", text: "Agents take actions, so evaluation needs somewhere they can act. A seeded database that resets between runs." },
            { title: "Run each task several times", text: "Agents are high-variance. A single run tells you almost nothing; five runs give you a success rate and a spread." },
            { title: "Include adversarial tasks", text: "Impossible tasks (does it give up gracefully or hallucinate success?), injected content in tool results, and tasks it should refuse." },
            { title: "Report cost and steps alongside success", text: "An agent that succeeds 95% of the time at $4 per task may be worse than one at 90% for $0.30, depending entirely on task value." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Where this is all heading, and what stays true",
          text: "Models are getting better at long-horizon work, environments and tool standards (MCP) are maturing, and RL against verifiable rewards is pushing per-step reliability up. What will not change is the arithmetic in the table above: reliability compounds multiplicatively, so verification, reversibility, and bounded blast radius will remain the load-bearing engineering ideas regardless of how good the models get. Build for those and your system survives the next model generation.",
        },
      ],
    },
  ],

  theory: [
    "Workflow vs agent: the distinction is who controls the control flow — you in code, or the model at runtime.",
    "The core advice: find the simplest thing that works; add agency only when measured to be necessary.",
    "The workflow patterns to try first: prompt chaining, routing, parallelisation, orchestrator-workers, evaluator-optimiser.",
    "The five conditions that justify real agency: unpredictable step count, tool choice depending on findings, environmental feedback, recoverable/verifiable errors, high task value.",
    "Why coding agents are the clearest success case — and the diagnostic question 'what tells the agent it was wrong?'",
    "The ReAct loop: Thought → Action → Observation, and why interleaving beats separate planning and execution.",
    "Why native tool calling replaced ReAct's regex-parsed text format while leaving the pattern unchanged.",
    "Context growth as the practical constraint: truncation, compaction, file offloading, goal restatement, dead-end pruning.",
    "Bare-loop failure modes: looping, thrashing, premature answers, tool confusion, error blindness, context loss.",
    "Plan-and-execute vs interleaved ReAct: cost, observability, and adaptability tradeoffs.",
    "The underrated benefit of an explicit plan: it is a reviewable checkpoint before anything happens.",
    "Decomposition strategies (least-to-most, parallel, recursive) and the cost of decomposing non-independent subtasks.",
    "Tree of Thoughts and why exponential cost keeps it mostly in research; beam search as the affordable compromise.",
    "Why reasoning models absorbed much of explicit search, and when external search is still warranted.",
    "Tool design: design for the agent not your API, negative guidance in descriptions, enum-constrained arguments, compact results, instructive errors, idempotent gated writes.",
    "Testing tools in isolation to localise selection failures.",
    "Handling too many tools: namespacing, progressive disclosure via a find_tools tool, routing to sub-agents.",
    "Context engineering as the successor to prompt engineering for agents.",
    "Sub-agents for context ISOLATION, not merely specialisation — read 50k, return 500.",
    "Agent memory types: scratchpad, working artefacts, episodic, semantic, procedural.",
    "The filesystem as underrated agent memory: no token cost for unused data, and inspectable afterwards.",
    "Procedural memory / skill libraries (Voyager), and why they need verifiable success and pruning.",
    "Environment design: sandboxing, task-scoped credentials, observability, and reversibility.",
    "Multi-agent patterns: supervisor/workers, sequential, parallel fan-out, debate, reviewer/critic, hierarchical.",
    "Why the reviewer pattern consistently earns its cost — a clean, unanchored context finds what the author cannot.",
    "The ~15× token cost of multi-agent research systems, and why latency is often the real prize.",
    "The property that predicts multi-agent success: genuinely parallelisable, near-independent subtasks.",
    "Compounding error: P(success) = Π pi, so 90% per step is 12% over 20 steps.",
    "Why the fix for long agents is a feedback signal, not a better model.",
    "Safety controls: step/token caps in code, least privilege, human approval for irreversible actions, sandboxing, audit logs, per-capability kill switches, all observations untrusted.",
    "Why agents make prompt injection categorically more dangerous — bad actions rather than bad text.",
    "Agent evaluation: end-to-end task success, steps, cost per completed task, tool selection accuracy, recovery rate, unsafe action rate, human intervention rate.",
    "Building an agent eval harness: verifiable outcomes, sandboxed replica environment, repeated runs, adversarial and impossible tasks.",
  ],

  math: [
    {
      title: "Compounding error probability",
      formula: "P(success) = Π(i=1..n) p_i",
      note: "10 steps at 95% each ≈ 60% overall; 20 steps at 90% ≈ 12%. This is why per-step accuracy is misleading and end-to-end task success is the only metric that counts.",
    },
    {
      title: "Required per-step reliability",
      formula: "p = target^(1/n)",
      note: "To hit 90% end-to-end over 20 steps you need p = 0.90^(1/20) ≈ 0.9947 — 99.5% per step. Verification steps are how you get there, not a better base model.",
    },
    {
      title: "Agent loop cost bound",
      formula: "cost_total ≤ max_steps × cost_per_step",
      note: "Enforce max_steps in code. Note cost_per_step grows as context accumulates, so the real total is superlinear — cap tokens as well as steps.",
    },
    {
      title: "Context growth per step",
      formula: "context_n ≈ context_0 + n × (thought + tool_call + observation)",
      note: "20 steps with 2k-token observations adds 40k+ tokens. Cost rises superlinearly across a run because every step re-prefills the whole accumulated history.",
    },
    {
      title: "Tree of Thoughts cost",
      formula: "cost ≈ branching^depth × cost_per_node",
      note: "Branching 3 to depth 4 is 81 nodes plus evaluation calls. Exponential cost is why beam search (keep best k per level) is the practical version.",
    },
    {
      title: "Parallel fan-out latency",
      formula: "T_sequential = Σ Ti  vs  T_parallel = max(Ti) + T_merge",
      note: "Six independent 3-second lookups: 18s sequential, ~4s parallel. The clearest and most defensible benefit of a multi-agent architecture.",
    },
  ],

  practice: [
    { type: "theory", q: "Define the difference between a workflow and an agent, and give the five conditions under which real agency is justified." },
    { type: "theory", q: "Name the five workflow patterns to try before building an agent, and note which have deterministic control flow." },
    { type: "theory", q: "Why are coding agents the clearest success case for agency? State the diagnostic question you would ask about any candidate task." },
    { type: "theory", q: "Explain the ReAct loop and how it lets an agent recover from a failed tool call, unlike a single function-calling request." },
    { type: "theory", q: "Why did native tool calling replace ReAct's original text format, and what stayed the same?" },
    { type: "theory", q: "Explain why context growth makes agent cost superlinear in the number of steps, and give four mitigations." },
    { type: "theory", q: "Compare plan-and-execute with pure ReAct across cost, adaptability, and observability. What is the underrated benefit of an explicit plan?" },
    { type: "theory", q: "Give six rules for designing agent tools, and explain why 'design for the agent, not your API' matters." },
    { type: "theory", q: "How would you handle an agent that needs access to 200 tools? Give three approaches." },
    { type: "theory", q: "Explain the context-isolation argument for sub-agents, and why it is a stronger reason than specialisation." },
    { type: "theory", q: "Why is the filesystem an underrated form of agent memory? Give two distinct benefits." },
    { type: "theory", q: "Describe the reviewer/critic pattern and explain why a separate critic outperforms self-critique in the same context." },
    { type: "theory", q: "What property of a task predicts whether a multi-agent architecture will help? Give one example where it applies and one where it does not." },
    { type: "theory", q: "Explain why the fix for unreliable long agent chains is a feedback signal rather than a better model." },
    { type: "theory", q: "What safeguards would you put in place before letting an agent autonomously execute code or send emails? Give seven." },
    { type: "theory", q: "Why does prompt injection become categorically more dangerous in an agent than in a chatbot? Which controls still hold when injection succeeds?" },
    { type: "theory", q: "Give an example of a task that should NOT use an autonomous agent, and explain why a simpler pipeline is more appropriate." },
    { type: "theory", q: "Describe how you would build an evaluation harness for an agent. Why must the outcomes be programmatically verifiable?" },
    { type: "math", q: "If a 6-step agent pipeline has each step succeed independently with 90% probability, what is the overall success probability? What about 20 steps?" },
    { type: "math", q: "You need 95% end-to-end success over 15 steps. What per-step reliability is required? What does that imply about your architecture?" },
    { type: "math", q: "An agent runs 12 steps. Step 1 has 2,000 context tokens; each step adds 1,500. At $3/1M input, what is the total input cost across the run? Compare with 12 independent 2,000-token calls." },
    { type: "math", q: "A research task needs 8 independent lookups, each taking 4 seconds, plus a 6-second merge. Compare sequential and parallel latency. If parallel costs 15× the tokens and the task is worth $50, is it justified?" },
    { type: "math", q: "Tree of Thoughts with branching factor 4 to depth 3, at $0.01 per node generation and $0.005 per evaluation. What is the total cost of one search?" },
  ],

  resources: [
    { label: "Anthropic — Building Effective Agents (workflows vs agents)", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "blog" },
    { label: "Anthropic — Writing effective tools for agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", kind: "blog" },
    { label: "Anthropic — How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" },
    { label: "Yao et al. 2022 — ReAct: Synergizing Reasoning and Acting", url: "https://arxiv.org/abs/2210.03629", kind: "paper" },
    { label: "Yao et al. 2023 — Tree of Thoughts", url: "https://arxiv.org/abs/2305.10601", kind: "paper" },
    { label: "Wang et al. 2023 — Plan-and-Solve Prompting", url: "https://arxiv.org/abs/2305.04091", kind: "paper" },
    { label: "Wang et al. 2023 — Voyager: an open-ended embodied agent with skill library", url: "https://arxiv.org/abs/2305.16291", kind: "paper" },
    { label: "Shinn et al. 2023 — Reflexion: verbal reinforcement learning", url: "https://arxiv.org/abs/2303.11366", kind: "paper" },
    { label: "LangGraph — multi-agent and supervisor patterns", url: "https://langchain-ai.github.io/langgraph/concepts/multi_agent/", kind: "docs" },
    { label: "Model Context Protocol — specification", url: "https://modelcontextprotocol.io/", kind: "docs" },
    { label: "SWE-bench — verifiable agent benchmark on real GitHub issues", url: "https://www.swebench.com/", kind: "docs" },
    { label: "Simon Willison — the lethal trifecta for AI agents", url: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/", kind: "blog" },
    { label: "Chip Huyen — Agents", url: "https://huyenchip.com/2025/01/07/agents.html", kind: "blog" },
  ],
};

export default m16;
