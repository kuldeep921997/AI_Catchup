const m10 = {
  id: "m10",
  week: 10,
  hours: 8,
  title: "Orchestration Frameworks: LangChain, LangGraph & LlamaIndex",
  tag: "Frameworks",
  why: "These frameworks are the 'plumbing' that turns raw LLM API calls into real applications (chains, agents, tools, memory). Almost every GenAI job posting lists LangChain explicitly.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 14,
      title: "What frameworks are for — and when to skip them",
      summary: "An honest account, including the case against. This is a genuinely contested question and you should be able to argue both sides.",
      blocks: [
        {
          t: "p",
          text: "A single LLM call is three lines of code. Frameworks exist because real applications are not a single call — they are a retrieval step, a prompt template, a model call, a parser, a retry, a fallback, a trace, and a conversation state, with error handling at every hop. Frameworks provide vocabulary and plumbing for that.",
        },
        { t: "h", text: "What they actually give you" },
        {
          t: "table",
          head: ["Concern", "Without a framework", "With one"],
          rows: [
            ["Provider switching", "Rewrite call sites per SDK", "One interface, swap the model object"],
            ["Prompt management", "f-strings scattered through the code", "Templates with declared variables"],
            ["Structured output", "Parse JSON, handle failures, retry", "Schema-bound parsing with retries built in"],
            ["Retries and fallbacks", "Hand-rolled per call", "Declarative `.with_retry()` / `.with_fallbacks()`"],
            ["Streaming", "Per-provider SSE handling", "Uniform streaming across the pipeline"],
            ["Tracing", "Print statements", "Every step traced with inputs, outputs, timings, cost"],
            ["Document loaders", "Write a parser per source", "Hundreds of prebuilt loaders"],
            ["State and checkpointing", "Build it", "Persisted graph state, resumable runs"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The two genuinely load-bearing benefits",
          text: "Most items above are conveniences you could build in a day. The two that are hard to replicate are **tracing** (seeing every intermediate step of a multi-call pipeline is the difference between debugging in minutes and debugging in hours) and **state management with checkpointing** (durable, resumable, human-interruptible execution is real distributed-systems work). If you skip frameworks, budget for building these two.",
        },
        { t: "h", text: "The case against" },
        {
          t: "list",
          items: [
            "**Abstraction tax.** When something breaks four layers down, you debug the framework rather than your application. LangChain in particular attracted this criticism heavily in 2023–24, and the LCEL/LangGraph rewrite was largely a response to it.",
            "**Dependency weight.** A large framework pulls in a substantial dependency tree, and pinning versions across an ecosystem that moves this fast is real maintenance work.",
            "**Hidden prompts.** Some abstractions inject prompt text you did not write and cannot easily see. When prompt wording is your main quality lever, that is a genuine problem.",
            "**It can obscure how simple the thing is.** A RAG pipeline is: embed the query, search, format a prompt, call the model. Seeing that in ten lines of your own code is educationally and operationally valuable.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The advice that has aged well",
          text: "**Build your first version without a framework.** Write the direct API calls. You will understand exactly what a RAG pipeline is, and you will be able to evaluate what a framework is actually doing for you. Then adopt selectively — many production teams use LangChain's document loaders and LangGraph's state machine while writing their own prompting and model calls. Frameworks are a menu, not a religion.",
        },
        { t: "h", text: "The landscape" },
        {
          t: "table",
          head: ["Tool", "Core strength", "Reach for it when"],
          rows: [
            ["LangChain", "Breadth of integrations, composition, LCEL", "You need many connectors and standard chains"],
            ["LangGraph", "Stateful graphs, cycles, checkpointing, human-in-the-loop", "Agents and multi-step workflows needing control and durability"],
            ["LlamaIndex", "Ingestion, indexing, advanced retrieval", "The project is fundamentally about data over documents"],
            ["Haystack", "Pipeline-first, production-oriented, typed", "You want explicit pipelines with strong typing"],
            ["DSPy", "Programmatic prompt optimisation against metrics", "You have an eval set and want prompts compiled, not hand-tuned"],
            ["Instructor / Outlines", "Structured output enforcement", "You need reliable typed output and nothing else"],
            ["Provider SDKs directly", "No abstraction at all", "Simple applications; maximum control; learning"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "DSPy is the interesting outlier",
          text: "Everything else helps you *write* prompts. DSPy treats prompts as parameters to be optimised: you declare the signature of each step and a metric, and it searches over instructions and few-shot examples to maximise that metric on your data. It is a different paradigm and it only makes sense if you have an evaluation set — which, having read Modules 8 and 9, you now know you should have anyway.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 18,
      title: "LangChain and LCEL",
      summary: "The abstractions you will be asked about, and the composition model that replaced the old Chain classes.",
      blocks: [
        {
          t: "p",
          text: "LangChain's early design wrapped every workflow in a bespoke class — `RetrievalQA`, `ConversationalRetrievalChain`, dozens more. Each was opaque, hard to modify, and hid its prompts. LCEL (LangChain Expression Language) replaced that with function composition using the `|` operator, and it is what modern LangChain code looks like.",
        },
        { t: "h", text: "The Runnable interface" },
        {
          t: "p",
          text: "Everything in LCEL implements one interface, which is the whole idea. If every component has the same shape, they compose.",
        },
        {
          t: "list",
          items: [
            "`invoke(input)` — run once, synchronously.",
            "`batch(inputs)` — run many, parallelised automatically.",
            "`stream(input)` — yield output incrementally.",
            "`ainvoke` / `abatch` / `astream` — async variants, free with the interface.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why the uniform interface matters",
          text: "Because a composed chain is itself a Runnable, streaming, batching, and async work through arbitrarily deep pipelines without your writing any of it. Call `.stream()` on a five-step chain and tokens stream from the model through the parser to you. That property — composition preserving capabilities — is the actual engineering contribution, not the pipe syntax.",
        },
        { t: "h", text: "A RAG chain in LCEL" },
        {
          t: "code",
          lang: "python",
          caption: "The canonical LCEL RAG chain, annotated",
          code: `from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

prompt = ChatPromptTemplate.from_template(
    "Answer using only the context. Say you don't know if it isn't there.\\n\\n"
    "Context:\\n{context}\\n\\nQuestion: {question}"
)

def format_docs(docs):
    return "\\n\\n".join(f"[{i+1}] {d.page_content}" for i, d in enumerate(docs))

chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

chain.invoke("What is the refund window?")

# Read the dict literal carefully — it is the part people find confusing.
# A dict in an LCEL chain builds its values IN PARALLEL from the same input:
#   "context"  <- run the retriever on the input, then format the docs
#   "question" <- pass the input straight through unchanged
# The resulting dict then feeds the prompt template's two variables.`,
        },
        { t: "h", text: "The composition primitives" },
        {
          t: "table",
          head: ["Primitive", "Does", "Use for"],
          rows: [
            ["`a | b`", "Sequential — output of a feeds b", "The backbone of every chain"],
            ["`{\"x\": a, \"y\": b}`", "Parallel — both run on the same input", "Building multi-variable prompt inputs"],
            ["`RunnablePassthrough()`", "Returns its input unchanged", "Carrying the original question forward"],
            ["`RunnableLambda(fn)`", "Wraps a plain Python function", "Any custom transformation step"],
            ["`RunnableBranch`", "Conditional routing", "Choosing a path based on the input"],
            ["`.with_fallbacks([...])`", "Try alternatives on failure", "Model outages, rate limits"],
            ["`.with_retry()`", "Retry with backoff", "Transient API errors"],
            ["`.bind(**kwargs)`", "Fix arguments on a component", "Pinning temperature or tools per call site"],
          ],
        },
        { t: "h", text: "Structured output" },
        {
          t: "code",
          lang: "python",
          caption: "The pattern to use whenever you need typed output",
          code: `from pydantic import BaseModel, Field

class Invoice(BaseModel):
    vendor: str = Field(description="Company that issued the invoice")
    total:  float = Field(description="Total amount due")
    due_date: str = Field(description="ISO 8601 date")

structured_llm = llm.with_structured_output(Invoice)
result = structured_llm.invoke("Extract from: " + document_text)
result.total   # a float, validated — not a string you have to parse

# Under the hood this uses the provider's native tool/function-calling
# schema where available, which is far more reliable than asking for
# JSON in the prompt and hoping. Validation failures can be retried
# with the error fed back to the model.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Memory in LangChain is not memory",
          text: "`ConversationBufferMemory` and friends simply re-inject prior turns into the prompt. There is no persistent model state — the model is stateless (Module 1). Buffer memory keeps everything and grows your token cost linearly until it overflows the window; summary memory compresses old turns with an extra LLM call, trading cost and information loss for a bounded footprint. Knowing that 'memory' is just prompt construction stops you expecting behaviour that cannot exist, and it is a common interview probe.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 18,
      title: "LangGraph: workflows as state machines",
      summary: "Why cycles, explicit state, and checkpointing are what production agents actually need.",
      blocks: [
        {
          t: "p",
          text: "LCEL chains are directed acyclic graphs — data flows forward and never loops. But real workflows loop: retrieve, evaluate, retrieve again with a better query. Call a tool, look at the result, decide the next tool. Draft, critique, revise. LangGraph exists for that, and it is where the framework's centre of gravity moved.",
        },
        { t: "h", text: "The model" },
        {
          t: "list",
          items: [
            "**State** — a typed object (usually a `TypedDict`) that every node reads and writes. This is the single source of truth for the run.",
            "**Nodes** — functions taking state and returning a partial state update.",
            "**Edges** — where to go next. Fixed edges always go the same place; conditional edges call a function that inspects state and returns the next node's name.",
            "**Reducers** — how updates merge into state. `add_messages` appends to a list rather than replacing it; the default is overwrite.",
          ],
        },
        {
          t: "code",
          lang: "python",
          caption: "A self-correcting RAG loop — the canonical LangGraph example",
          code: `from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    question: str
    documents: list
    answer: str
    attempts: int

def retrieve(state):
    return {"documents": retriever.invoke(state["question"]),
            "attempts": state["attempts"] + 1}

def grade(state):
    """Are these documents sufficient? Returns the name of the next node."""
    if state["attempts"] >= 3:
        return "give_up"                       # ALWAYS bound the loop
    verdict = grader.invoke({"q": state["question"], "d": state["documents"]})
    return "generate" if verdict.relevant else "rewrite"

def rewrite(state):
    return {"question": rewriter.invoke(state["question"])}

def generate(state):
    return {"answer": rag_chain.invoke(state)}

def give_up(state):
    return {"answer": "I couldn't find enough information to answer that."}

g = StateGraph(State)
g.add_node("retrieve", retrieve)
g.add_node("rewrite",  rewrite)
g.add_node("generate", generate)
g.add_node("give_up",  give_up)

g.add_edge(START, "retrieve")
g.add_conditional_edges("retrieve", grade,
                        {"generate": "generate", "rewrite": "rewrite",
                         "give_up": "give_up"})
g.add_edge("rewrite", "retrieve")      # the cycle an LCEL chain cannot express
g.add_edge("generate", END)
g.add_edge("give_up",  END)

app = g.compile(checkpointer=checkpointer)`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The graph is a contract",
          text: "This is the real argument for LangGraph over a free-form agent loop. The graph declares every state the system can be in and every legal transition. A free-form ReAct agent can do anything the model decides, which is powerful and untestable. Here you can enumerate the paths, unit-test each node in isolation, and guarantee the loop terminates because you wrote the bound yourself. For anything touching production data, that constraint is a feature.",
        },
        { t: "h", text: "Checkpointing: the feature that justifies the framework" },
        {
          t: "p",
          text: "Compile with a checkpointer (in-memory, SQLite, or Postgres) and state is persisted after every node. That single capability unlocks four things that are otherwise significant engineering projects:",
        },
        {
          t: "list",
          items: [
            "**Durability.** The process crashes at step 7 of 10; on restart it resumes from step 7 rather than re-running everything (and re-paying for it).",
            "**Human-in-the-loop.** Interrupt before a sensitive node, surface the pending action to a human, and resume on approval — possibly hours later, from a different process. This is how you gate an agent's irreversible actions (Module 16).",
            "**Conversation threads.** Pass a `thread_id` and the full state is restored. Multi-turn memory becomes a property of the runtime rather than something you re-implement.",
            "**Time travel.** Rewind to an earlier checkpoint, change a value, and re-run from there. An exceptionally good debugging tool for non-deterministic systems.",
          ],
        },
        { t: "h", text: "Common topologies" },
        {
          t: "table",
          head: ["Pattern", "Shape", "Use for"],
          rows: [
            ["Linear pipeline", "A → B → C", "Deterministic multi-step processing"],
            ["Router", "Classify → one of N branches", "Intent routing, model selection by difficulty"],
            ["Reflection loop", "Generate → critique → revise (bounded)", "Writing, code generation, planning"],
            ["Self-correcting RAG", "Retrieve → grade → rewrite → retrieve", "The example above"],
            ["Supervisor / workers", "Supervisor delegates to specialist nodes", "Multi-agent systems (Module 16)"],
            ["Human approval gate", "Interrupt → wait → resume", "Any irreversible action"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Always bound your loops",
          text: "A cyclic graph with no step limit is a way to spend money very quickly. Put an attempt counter in the state and check it in the conditional edge, as in the example. LangGraph also supports a global `recursion_limit`. Use both — the counter gives you a graceful degradation path, the limit is your backstop. An unbounded agent loop is the single most common cause of surprise production bills in this space.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 14,
      title: "LlamaIndex: the data-first framework",
      summary: "What it does better, and why teams frequently run it alongside LangChain rather than instead of it.",
      blocks: [
        {
          t: "p",
          text: "LlamaIndex started as GPT Index with a single focus: get your data into a form an LLM can use. It has grown agent and workflow capabilities, but ingestion and retrieval remain where it is clearly strongest.",
        },
        { t: "h", text: "The core abstractions" },
        {
          t: "list",
          items: [
            "**Document** — a source file with content and metadata.",
            "**Node** — a chunk, with relationships to its source, its parent, and its neighbours. The relationship graph is the distinctive part and is what enables sophisticated retrieval.",
            "**Index** — how nodes are organised: VectorStoreIndex, SummaryIndex, DocumentSummaryIndex, PropertyGraphIndex, KeywordTableIndex.",
            "**Retriever** — turns a query into nodes.",
            "**Node postprocessor** — reranking, filtering, deduplication, or context expansion applied to retrieved nodes.",
            "**Query engine / chat engine** — retrieval plus synthesis, with or without conversation state.",
          ],
        },
        {
          t: "code",
          lang: "python",
          caption: "Ingestion with a declarative pipeline and caching",
          code: `from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.extractors import TitleExtractor, QuestionsAnsweredExtractor

pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=512, chunk_overlap=64),
        TitleExtractor(nodes=5),                    # infer a section title
        QuestionsAnsweredExtractor(questions=3),    # multi-vector indexing
        embed_model,
    ],
    docstore=SimpleDocumentStore(),   # enables hash-based dedup on re-runs
    vector_store=vector_store,
)

nodes = pipeline.run(documents=documents)

# The docstore gives you the incremental-update behaviour from Module 9
# for free: unchanged documents are skipped by content hash. Building
# that yourself is a couple of hundred lines you now do not write.`,
        },
        { t: "h", text: "Where it is genuinely ahead" },
        {
          t: "table",
          head: ["Capability", "What you get"],
          rows: [
            ["Node relationships", "Parent/child/prev/next links, enabling parent-document and sentence-window retrieval out of the box"],
            ["Auto-merging retrieval", "If enough sibling chunks match, automatically return the merged parent instead"],
            ["Sentence-window retrieval", "Embed single sentences for precision, return a window of surrounding sentences for context"],
            ["Recursive retrieval", "Nodes can reference other nodes or query engines, enabling hierarchical navigation"],
            ["Metadata extractors", "Titles, summaries, keywords, hypothetical questions — the Module 9 enrichment patterns, packaged"],
            ["LlamaParse", "A managed parsing service specifically targeting complex PDFs, tables, and layouts"],
            ["LlamaHub", "Hundreds of data connectors for real enterprise sources"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Auto-merging and sentence-window are the two to remember",
          text: "Both are elegant implementations of Module 9's 'embed one thing, return another'. Sentence-window embeds a single sentence — maximally precise — and returns the three sentences either side, so the model gets readable context. Auto-merging embeds fine-grained leaves and, when several children of the same parent match, returns the parent instead of duplicated fragments. These are the kinds of details that are annoying to build and are simply available here.",
        },
        { t: "h", text: "Choosing between them" },
        {
          t: "table",
          head: ["Situation", "Lean toward"],
          rows: [
            ["50,000 PDFs to ingest, index, and query", "LlamaIndex"],
            ["A stateful agent with tools and approval gates", "LangGraph"],
            ["Many third-party integrations to wire together", "LangChain"],
            ["Complex retrieval strategies over documents", "LlamaIndex"],
            ["Cyclic control flow with durable state", "LangGraph"],
            ["Optimising prompts against a metric", "DSPy"],
            ["A simple, well-understood single-purpose service", "Provider SDK directly"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "They interoperate, and mixing is normal",
          text: "A common production shape: LlamaIndex for ingestion and retrieval, exposed as a tool, driven by a LangGraph agent that handles control flow and human approval. Both projects ship adapters for exactly this. Treating the choice as exclusive is a false dichotomy — pick per concern, not per project.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 14,
      title: "Tool calling: native, and how the frameworks wrap it",
      summary: "The API feature that made agents work, and the design rules that decide whether yours does.",
      blocks: [
        {
          t: "p",
          text: "Before native tool calling, you prompted the model to emit a special string and parsed it with a regex. It failed constantly: extra prose around the JSON, hallucinated arguments, missing fields. Native tool calling moved this into the API contract, and it is the foundation of everything in Module 16.",
        },
        { t: "h", text: "How it works" },
        {
          t: "steps",
            items: [
            { title: "1. You declare tools as JSON Schema", text: "Name, description, and a typed parameter schema, passed alongside the messages." },
            { title: "2. The model returns a structured tool call", text: "Not text — a distinct response type containing the tool name and validated arguments. The model was fine-tuned to emit these, which is why reliability is far higher than prompting." },
            { title: "3. You execute the tool", text: "The provider never runs anything. Your code decides whether to execute, which is also where you enforce permissions." },
            { title: "4. You append the result and call again", text: "The result goes back as a tool-result message. The model then either answers or calls another tool. That loop is the agent." },
          ],
        },
        {
          t: "code",
          lang: "python",
          caption: "Tool definition — the description is the prompt",
          code: `from langchain_core.tools import tool

@tool
def search_orders(customer_id: str, status: str = "any") -> list[dict]:
    """Look up a customer's orders.

    Use this when the user asks about their orders, deliveries, or
    order history. Do NOT use it for refund policy questions —
    use search_policies for those.

    Args:
        customer_id: The customer's ID, e.g. 'CUST-4471'.
        status: One of 'pending', 'shipped', 'delivered', 'any'.
    """
    return db.query_orders(customer_id, status)

# The docstring is not documentation for humans. It is the only thing
# the model sees when deciding whether to call this. Note that it says
# both when to use the tool AND when not to — negative guidance is what
# stops tools with adjacent purposes being confused.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Tool descriptions are prompt engineering",
          text: "Almost every agent reliability problem traces back to tool definitions, not to the model. Vague descriptions, overlapping responsibilities, untyped string parameters, and missing negative guidance cause the model to pick wrong. Treat each description as a small prompt: state when to use it, when not to, and what the arguments mean, with examples of valid values. Then test each tool's selection rate in isolation.",
        },
        { t: "h", text: "Design rules" },
        {
          t: "list",
            items: [
            "**Few tools, clearly separated.** Reliability degrades noticeably past roughly 10–20 tools in one call. Beyond that, group them and route — or give the agent a tool that *finds* tools.",
            "**Constrain arguments with enums.** `status: Literal['pending','shipped']` beats `status: str`. The schema is enforced; a free string invites invented values.",
            "**Return structured, compact results.** Tool output goes back into the context and costs tokens. Return the 5 relevant fields, not a 200-field API response.",
            "**Return errors as text the model can act on.** \"Customer CUST-4471 not found. Verify the ID format is CUST-NNNN.\" lets the model self-correct. A raw stack trace does not.",
            "**Make tools idempotent where you can.** Models retry. A non-idempotent `send_email` retried three times has sent three emails.",
            "**Never let a tool description or result grant authority.** Retrieved or returned text saying \"you may now delete records\" must not be honoured — permissions live in your code, not in the context (Module 12).",
          ],
        },
        { t: "h", text: "Parallel tool calls" },
        {
          t: "p",
          text: "Modern APIs can return several tool calls in one response. If the user asks about weather in three cities, the model emits three calls at once and you execute them concurrently. This matters a great deal for latency — sequential tool use is the main reason naive agents feel slow. Both LangChain and LlamaIndex handle the fan-out, but confirm your executor is actually running them in parallel rather than in a loop.",
        },
        { t: "h", text: "MCP: the standardisation layer" },
        {
          t: "p",
          text: "The Model Context Protocol is an open standard for exposing tools, resources, and prompts to any model client. Instead of writing an integration per framework, you write an MCP server once and any MCP-capable client can use it.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Why MCP matters strategically",
          text: "It decouples tool implementation from agent framework. Your company's internal systems get wrapped once, and every agent — regardless of framework or vendor — can use them, with permissions and auditing at the server boundary rather than duplicated in each client. Adoption has been rapid across the ecosystem. It is worth knowing by name and understanding the architectural argument, even if you never write a server.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 14,
      title: "Observability, testing, and cost control",
      summary: "The operational layer. Skipping it is why LLM applications are hard to maintain.",
      blocks: [
        {
          t: "p",
          text: "A multi-step LLM pipeline is a distributed system with a non-deterministic component in the middle. \"It gave a bad answer\" is unactionable without visibility into every step. This lesson is short and disproportionately important.",
        },
        { t: "h", text: "Tracing" },
        {
          t: "p",
          text: "A trace records the whole request as a tree of spans, each with inputs, outputs, timing, token counts, and cost. Frameworks instrument this automatically; the OpenTelemetry-based OpenInference and OpenLLMetry conventions mean you are not locked to one vendor.",
        },
        {
          t: "table",
          head: ["Tool", "Character"],
          rows: [
            ["LangSmith", "Deep LangChain/LangGraph integration; tracing, datasets, evals, prompt versioning"],
            ["Langfuse", "Open source, self-hostable; framework-agnostic; strong cost tracking"],
            ["Arize Phoenix", "Open source, OpenInference-based; strong evaluation and drift tooling"],
            ["Weights & Biases Weave", "Good if you already use W&B for training"],
            ["OpenTelemetry + your existing stack", "No new vendor; more wiring"],
          ],
        },
        {
          t: "list",
          items: [
            "**Log a request ID through every span** so a user complaint maps to a trace in one lookup.",
            "**Record the retrieved chunks** (Module 9). This is the single most useful field in a RAG trace.",
            "**Record the resolved prompt**, not the template. What the model actually saw is what matters.",
            "**Record token counts and cost per span.** Cost surprises are almost always one step in one path, and this is how you find it.",
          ],
        },
        { t: "h", text: "Testing something non-deterministic" },
        {
          t: "steps",
          items: [
            { title: "1. Unit-test the deterministic parts normally", text: "Chunking, parsing, formatting, parsers, routing logic. Most of your pipeline is ordinary code and deserves ordinary tests." },
            { title: "2. Mock the LLM for structural tests", text: "Assert that the right nodes ran in the right order and the state evolved correctly. LangGraph nodes are plain functions and test cleanly in isolation." },
            { title: "3. Use a golden dataset for behaviour", text: "The eval sets from Modules 8 and 9. Run on every change; compare against the previous score rather than an absolute threshold." },
            { title: "4. Assert on properties, not exact strings", text: "\"Contains a citation\", \"is under 200 words\", \"refuses when the context is empty\", \"produces valid JSON matching the schema\". These are stable under paraphrase; exact-match assertions are not." },
            { title: "5. Pin model versions in CI", text: "Otherwise a silent provider update changes your test results and you spend a day debugging your own code." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "LLM-as-judge needs its own validation",
          text: "Using a model to grade outputs is scalable and standard, but judges have documented biases: they prefer longer answers, they prefer their own family's outputs, and they are sensitive to option ordering in pairwise comparisons. Validate your judge against human labels on a sample before trusting it, and randomise presentation order. Module 15 covers this properly.",
        },
        { t: "h", text: "Cost control" },
        {
          t: "math",
          formula: "cost/request = Σ_steps (in_tokens × price_in + out_tokens × price_out)",
          note: "A ReAct loop with 4 LLM calls at 800 input and 150 output tokens each, at $3/1M in and $15/1M out: input 4×800×3/1e6 = $0.0096, output 4×150×15/1e6 = $0.009, total ≈ $0.019 per query. At 100k queries/month that is $1,900 — from a loop that felt free in testing.",
        },
        {
          t: "list",
          items: [
            "**Cache aggressively.** Provider prompt caching for stable prefixes; semantic caching for repeated questions; plain memoisation for deterministic steps.",
            "**Route by difficulty.** A small model for classification, rewriting, grading, and routing; the large model only for final synthesis. Frequently a 5–10× reduction.",
            "**Cap the loops.** Maximum steps, maximum tokens, maximum tool calls — enforced in code, not hoped for in a prompt.",
            "**Alert on cost per request**, not just total spend. A regression that doubles per-request cost is invisible in a monthly total until the invoice arrives.",
            "**Track cost per *successful* request.** Failed and retried requests cost money too, and a system with a 30% retry rate is more expensive than its headline number suggests.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"How do you debug a chain that produced a weird answer?\" Answer with the trace: inspect each span's input and output to find the first step where things went wrong, and note that RAG traces must include the retrieved chunks and the resolved prompt. Then add that you would add the failing case to a golden dataset so the fix is regression-tested. That closing point — turning an incident into a test — is what separates an engineer from a prompt tinkerer.",
        },
      ],
    },
  ],

  theory: [
    "Why orchestration frameworks exist: prompt management, provider abstraction, structured output, retries/fallbacks, streaming, tracing, state.",
    "The two genuinely hard-to-replicate benefits: tracing multi-step pipelines, and durable state with checkpointing.",
    "The honest case against frameworks: abstraction tax, dependency weight, hidden prompts, and obscuring how simple the pipeline is.",
    "The advice that has aged well: build v1 without a framework, then adopt selectively per concern.",
    "The landscape: LangChain, LangGraph, LlamaIndex, Haystack, DSPy, Instructor/Outlines, and raw SDKs.",
    "DSPy's different paradigm: prompts as parameters optimised against a metric, which requires an eval set.",
    "The Runnable interface (invoke/batch/stream + async) and why a uniform interface makes composition preserve streaming and batching.",
    "LCEL composition primitives: pipe for sequential, dict for parallel, RunnablePassthrough, RunnableLambda, RunnableBranch, with_fallbacks, with_retry, bind.",
    "Structured output via with_structured_output and Pydantic, backed by native tool-calling schemas rather than prompt-and-hope.",
    "Why LangChain 'memory' is not memory: it is prompt re-injection; buffer grows linearly, summary trades an LLM call for a bounded footprint.",
    "LangGraph's model: typed state, nodes as state->partial-state functions, fixed and conditional edges, and reducers like add_messages.",
    "Why cycles matter: retrieve-grade-rewrite-retrieve loops cannot be expressed as a DAG.",
    "The graph as a contract: enumerable states and transitions, unit-testable nodes, and provable loop termination — versus untestable free-form agents.",
    "Checkpointing unlocks durability, human-in-the-loop approval, conversation threads, and time-travel debugging.",
    "Common graph topologies: linear, router, reflection loop, self-correcting RAG, supervisor/workers, approval gate.",
    "Always bound loops with both an in-state attempt counter and a global recursion limit.",
    "LlamaIndex abstractions: Document, Node with relationships, Index types, Retriever, node postprocessors, query/chat engines.",
    "LlamaIndex's distinctive retrieval: auto-merging, sentence-window, recursive retrieval — implementations of 'embed one thing, return another'.",
    "IngestionPipeline with a docstore gives hash-based incremental updates for free.",
    "Native tool calling: JSON Schema declaration, structured tool-call response, you execute, result appended, loop.",
    "Tool descriptions are prompt engineering — include negative guidance; most agent failures are tool-definition failures.",
    "Tool design rules: few tools, enum-constrained arguments, compact structured results, actionable error text, idempotency.",
    "Parallel tool calls and why sequential execution is the main cause of slow agents.",
    "MCP (Model Context Protocol): write the integration once, use it from any client; permissions and auditing at the server boundary.",
    "Observability: traces as span trees with inputs, outputs, timings, tokens, cost; log request IDs, retrieved chunks, and resolved prompts.",
    "Testing non-deterministic systems: unit-test deterministic parts, mock the LLM for structure, golden datasets for behaviour, property assertions, pinned model versions.",
    "LLM-as-judge biases (length preference, self-preference, position bias) and the need to validate the judge.",
    "Cost control: prompt and semantic caching, difficulty-based routing, hard loop caps, alerting on cost per successful request.",
  ],

  math: [
    {
      title: "Chain latency (sequential)",
      formula: "T_total = Σ Ti + Σ network_overhead_i",
      note: "Each step adds latency serially unless explicitly parallelised. Parallel tool calls and LCEL's parallel dict are the two main ways to recover it.",
    },
    {
      title: "Cost per request",
      formula: "cost = Σ_steps (in_tokens × price_in + out_tokens × price_out) / 1e6",
      note: "A 4-call ReAct loop at 800 in / 150 out per call at $3/$15 per 1M ≈ $0.019 per query — about $1,900/month at 100k queries.",
    },
    {
      title: "Cost per successful request",
      formula: "cost_effective = total_spend / successful_requests",
      note: "Failures and retries cost money. A 30% retry rate makes real cost ~1.4× the headline figure — track this, not raw spend.",
    },
    {
      title: "Buffer vs summary memory growth",
      formula: "buffer: tokens ≈ n_turns × avg_turn ; summary: tokens ≈ const + 1 LLM call/turn",
      note: "Buffer memory grows linearly until it overflows the window. Summary memory bounds the footprint but adds a call per turn and loses detail.",
    },
    {
      title: "Loop cost bound",
      formula: "cost_total ≤ max_steps × cost_per_step",
      note: "Enforce max_steps in code. An unbounded cyclic graph is the most common cause of surprise LLM bills.",
    },
  ],

  practice: [
    { type: "theory", q: "Give the honest case for and against using an orchestration framework. Which two benefits are genuinely hard to replicate yourself?" },
    { type: "theory", q: "Explain LCEL (`prompt | model | parser`) and why a uniform Runnable interface means streaming and batching work through arbitrarily deep chains." },
    { type: "theory", q: "In an LCEL chain, what does a dict literal like {\"context\": retriever, \"question\": RunnablePassthrough()} do?" },
    { type: "theory", q: "What is the difference between ConversationBufferMemory and ConversationSummaryMemory, and why is neither actually 'memory'?" },
    { type: "theory", q: "Why can an LCEL chain not express a retrieve-grade-rewrite-retrieve loop, and what does LangGraph add to make it possible?" },
    { type: "theory", q: "Explain why an explicit state graph gives more reliability than a free-form agent loop. What can you do with a graph that you cannot do with a free-form agent?" },
    { type: "theory", q: "Name the four capabilities that checkpointing unlocks, and explain why human-in-the-loop approval requires persisted state." },
    { type: "theory", q: "Describe two ways to bound a cyclic graph and why you should use both." },
    { type: "theory", q: "Explain auto-merging retrieval and sentence-window retrieval, and connect both to the 'embed one thing, return another' principle." },
    { type: "theory", q: "Compare LangChain and LlamaIndex for a project that is 90% about ingesting and querying 50,000 PDFs. Then describe a realistic architecture that uses both." },
    { type: "theory", q: "Why is native function/tool calling more reliable than prompting the model to output tool calls as text?" },
    { type: "theory", q: "Your agent keeps calling the wrong tool. Give five things you would change about the tool definitions before blaming the model." },
    { type: "theory", q: "Why should tool errors be returned as actionable natural-language text rather than raw exceptions?" },
    { type: "theory", q: "What is MCP and what architectural problem does it solve? Why does putting permissions at the server boundary matter?" },
    { type: "theory", q: "How would you test a non-deterministic LLM pipeline? Give five distinct strategies." },
    { type: "theory", q: "Name three documented biases of LLM-as-judge and how you would guard against each." },
    { type: "math", q: "An agent runs a ReAct loop with 4 LLM calls before answering, each with 800 input and 150 output tokens, at $3/1M input and $15/1M output. Compute the cost of one query, then the monthly cost at 100,000 queries." },
    { type: "math", q: "A conversation averages 150 tokens per turn with a 300-token system prompt in a 16k window reserving 1,000 tokens for output. Using buffer memory, after how many turns must you start trimming?" },
    { type: "math", q: "Your pipeline has 5 sequential steps taking 200, 20, 40, 1800, and 100ms. What is total latency? Which single change would help most, and what would parallelising steps 2 and 3 save?" },
    { type: "math", q: "You route 90% of traffic to a model costing $0.20 per 1M tokens and 10% to one costing $3 per 1M. What is the blended cost versus using the expensive model for everything?" },
  ],

  resources: [
    { label: "LangChain — conceptual guide (Runnables, LCEL, retrievers, tools)", url: "https://python.langchain.com/docs/concepts/", kind: "docs" },
    { label: "LangGraph — documentation and tutorials", url: "https://langchain-ai.github.io/langgraph/", kind: "docs" },
    { label: "LangGraph — agentic RAG and self-corrective RAG tutorials", url: "https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_agentic_rag/", kind: "docs" },
    { label: "LlamaIndex — documentation", url: "https://docs.llamaindex.ai/", kind: "docs" },
    { label: "LlamaIndex — production RAG optimisation guide", url: "https://docs.llamaindex.ai/en/stable/optimizing/production_rag/", kind: "docs" },
    { label: "Yao et al. 2022 — ReAct: Synergizing Reasoning and Acting", url: "https://arxiv.org/abs/2210.03629", kind: "paper" },
    { label: "Anthropic — Building Effective Agents (workflows vs agents)", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "blog" },
    { label: "Model Context Protocol — specification and docs", url: "https://modelcontextprotocol.io/", kind: "docs" },
    { label: "DSPy — programming, not prompting", url: "https://dspy.ai/", kind: "docs" },
    { label: "Langfuse — open-source LLM observability", url: "https://langfuse.com/docs", kind: "docs" },
    { label: "Arize Phoenix — open-source tracing and evaluation", url: "https://docs.arize.com/phoenix", kind: "docs" },
    { label: "Instructor — structured outputs with Pydantic", url: "https://python.useinstructor.com/", kind: "docs" },
  ],
};

export default m10;
