const m15 = {
  id: "m15",
  week: 15,
  hours: 6,
  title: "Evaluation, Safety & LLMOps (Deployment, Monitoring, Guardrails)",
  tag: "MLOps",
  why: "Not on your original list, but essential: every GenAI job posting expects familiarity with evaluating, deploying, and monitoring these systems in production, not just building a demo.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "Why evaluating GenAI is genuinely hard",
      summary: "Classical ML evaluation assumes a correct answer exists. Most of the difficulty follows from that assumption failing.",
      blocks: [
        {
          t: "p",
          text: "In classical ML you have labels. The model says 'spam', the label says 'spam', you increment a counter. Accuracy, precision, recall, F1 — well-defined, cheap, uncontroversial. Generative models break every part of that setup.",
        },
        { t: "h", text: "What breaks" },
        {
          t: "list",
          items: [
            "**The output space is unbounded.** There are millions of valid summaries of a document. There is no set of correct answers to compare against.",
            "**Quality is multi-dimensional.** A response can be accurate but rude, helpful but too long, well-written but subtly wrong. One scalar cannot capture it, and different stakeholders weight the dimensions differently.",
            "**Quality is contextual.** The right answer for a doctor differs from the right answer for a patient. Evaluation without a specified user is under-defined.",
            "**Outputs are non-deterministic.** The same input gives different outputs. Any single-sample measurement has variance you must account for.",
            "**Benchmarks leak.** Public test sets end up in pretraining data, so a high score may measure memorisation (Module 1).",
            "**Small changes have large effects.** Reordering two sentences in a prompt can move a benchmark several points, which means your measurement is partly measuring your prompt.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The reframing that makes it tractable",
          text: "Stop asking \"is this output correct?\" and start asking \"does this output satisfy the specific properties my application requires?\" Properties are checkable: is it valid JSON, does it cite a real source, is every claim grounded in the context, is it under 200 words, does it refuse when it should. You have traded an unanswerable question for a list of answerable ones — and the list is your specification.",
        },
        { t: "h", text: "The three levels of evaluation" },
        {
          t: "table",
          head: ["Level", "Measures", "Cost", "When"],
          rows: [
            ["Unit / assertion", "Deterministic properties: schema validity, length, format, forbidden strings, citation existence", "Free", "Every commit"],
            ["Golden dataset", "Task performance against known-good answers", "Cheap to run, expensive to build", "Every change; CI"],
            ["Human / production", "Real user outcomes: task success, satisfaction, escalation", "Expensive, slow", "Continuously, on a sample"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Start at the top of that table, not the bottom",
          text: "Teams reach for LLM-as-judge before they have written a single assertion. Deterministic checks are free, run in milliseconds, never disagree with themselves, and catch a surprising share of real regressions — malformed JSON, missing citations, responses that blew past the length limit, refusals that leaked the system prompt. Exhaust them first.",
        },
        { t: "h", text: "The n-of-1 problem" },
        {
          t: "p",
          text: "Because outputs vary, a single run on a single example tells you very little. If your eval set has 50 examples and a change improves the score from 72% to 76%, that is two examples — well within sampling noise.",
        },
        {
          t: "math",
          formula: "SE ≈ √( p(1−p) / n )        95% CI ≈ p ± 1.96·SE",
          note: "For p = 0.75 and n = 50: SE = √(0.75×0.25/50) = 0.061, so the 95% interval is roughly ±12 points. You genuinely cannot distinguish 72% from 76% with 50 examples. To detect a 5-point difference reliably you need several hundred.",
        },
        {
          t: "list",
          items: [
            "**Report confidence intervals**, or at least know roughly how wide they are before you celebrate a change.",
            "**Run each example several times** at your production temperature and average, to separate model variance from real effect.",
            "**Use paired comparisons** where possible — running old and new on the same examples removes example-difficulty variance and is far more sensitive than comparing two independent averages.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "Metrics: reference-based, LLM-as-judge, and human",
      summary: "What each family measures, what each gets wrong, and when to use which.",
      blocks: [
        {
          t: "p",
          text: "Three families of metric, in rough order of when they were invented and inverse order of how much you should trust them for open-ended tasks.",
        },
        { t: "h", text: "Reference-based n-gram metrics" },
        {
          t: "math",
          formula: "BLEU = BP · exp( Σₙ wₙ log pₙ )        ROUGE-N = matching n-grams / n-grams in reference",
          note: "BLEU is precision-oriented with a brevity penalty (does the candidate's content appear in the reference?), designed for translation. ROUGE is recall-oriented (does the reference's content appear in the candidate?), designed for summarisation.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked ROUGE-1 recall", text: "Candidate: 'the cat sat on the mat'. Reference: 'the cat sat on a mat quietly'." },
            { title: "Reference unigrams (7)", text: "the, cat, sat, on, a, mat, quietly." },
            { title: "Matches present in the candidate (5)", text: "the, cat, sat, on, mat. ('a' and 'quietly' are missing.)" },
            { title: "ROUGE-1 recall", text: "5/7 ≈ **0.714**. Note this measures word overlap only — a perfect paraphrase using different words would score near zero." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Why these correlate poorly with human judgement",
          text: "They measure surface word overlap. A correct answer phrased differently scores badly; a fluent, wrong answer that reuses the reference's vocabulary scores well. For translation and extractive summarisation — where there is roughly one right output and it shares vocabulary with the reference — they remain useful. For open-ended chat they are close to noise, and reporting them signals unfamiliarity.",
        },
        {
          t: "p",
          text: "**BERTScore** and similar embedding-based metrics improve on this by comparing embeddings rather than exact tokens, so paraphrases score well. Better, still reference-dependent, and still blind to factual correctness.",
        },
        { t: "h", text: "LLM-as-judge" },
        {
          t: "p",
          text: "Use a strong model to score outputs against a rubric. This is now the workhorse of GenAI evaluation because it scales, handles open-ended output, and — when done carefully — correlates reasonably with human judgement.",
        },
        {
          t: "code",
          lang: "text",
          caption: "A judge prompt that works",
          code: `You are evaluating an answer for GROUNDEDNESS only.
Ignore style, length, and whether you personally agree.

Context given to the assistant:
<context>{context}</context>

Question: {question}
Answer:   {answer}

Score on this scale:
  1 - Contains claims contradicted by or absent from the context
  2 - Mostly grounded, but at least one unsupported claim
  3 - Every claim is directly supported by the context

First list each factual claim in the answer and mark it
SUPPORTED or UNSUPPORTED, quoting the supporting span.
Then give the score as: SCORE: <1-3>

  ^ Three design choices doing the work:
    * ONE dimension per judge call — multi-dimensional rubrics
      collapse into a general "goodness" score
    * A discrete, defined scale — "rate 1-10" produces mush
    * Reasoning BEFORE the score, and evidence quoted, so the
      judgement is checkable and the model has done the work
      before committing (Module 11)`,
        },
        {
          t: "table",
          head: ["Judge bias", "Effect", "Mitigation"],
          rows: [
            ["Position bias", "Prefers the first (or last) option in a pairwise comparison", "Run both orders and average; discard disagreements as ties"],
            ["Verbosity bias", "Prefers longer answers regardless of quality", "Control for length; penalise it explicitly in the rubric"],
            ["Self-preference", "Prefers text from its own model family", "Use a different family as judge, or an ensemble"],
            ["Scale compression", "Almost everything gets a 4 out of 5", "Fewer levels with explicit anchors; force reasoning first"],
            ["Sycophancy", "Agrees with a stated expectation in the prompt", "Never tell the judge what you hope the answer is"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Validate the judge before you trust it",
          text: "Label 50–100 examples by hand, run your judge on the same examples, and compute agreement (Cohen's kappa, or simple correlation). If the judge does not agree with you, its scores are not measuring what you think. This step takes an afternoon and is skipped almost universally — which is why so many teams have confident dashboards measuring nothing in particular.",
        },
        { t: "h", text: "Human evaluation" },
        {
          t: "list",
          items: [
            "**Pairwise comparison beats absolute rating.** \"Which is better, A or B?\" is a far more reliable human judgement than \"rate this 1–5\". Ratings drift between annotators and over time; comparisons do not.",
            "**Elo / Bradley-Terry aggregation** turns pairwise comparisons into a ranking. This is how LMArena works, and it is the same model underlying RLHF reward training (Module 11).",
            "**Measure inter-annotator agreement.** If two humans disagree 40% of the time, no automatic metric can do better than that ceiling, and you should fix your rubric before anything else.",
            "**Domain experts for domain tasks.** A crowdworker cannot judge whether a clinical summary is correct. This is expensive and there is no way around it in regulated domains.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The pragmatic hierarchy",
          text: "Deterministic assertions for anything checkable → LLM-as-judge for open-ended dimensions, validated against human labels → human evaluation on a small sample as the ground truth that calibrates everything else. Each level is cheaper and less trustworthy than the one below it, and the point of the human layer is to keep the cheap layers honest.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 14,
      title: "Building an evaluation suite that survives contact with reality",
      summary: "Concrete, opinionated advice on the artefact that determines whether you can improve your system at all.",
      blocks: [
        {
          t: "p",
          text: "Every module in this curriculum has said \"measure it on your eval set\". This lesson is how to build that set. It is the most reusable skill here: it applies to retrieval, RAG, chatbots, fine-tuning, and agents identically.",
        },
        { t: "h", text: "Composition" },
        {
          t: "table",
          head: ["Category", "Share", "Purpose"],
          rows: [
            ["Typical cases", "~50%", "The bread and butter; catches broad regressions"],
            ["Hard cases", "~20%", "Ambiguous, multi-hop, long inputs — where improvements show up"],
            ["Negative cases", "~15%", "No answer exists; correct behaviour is refusal"],
            ["Adversarial cases", "~10%", "Injection attempts, out-of-scope requests, abuse"],
            ["Regression cases", "~5%", "Every bug you have ever fixed, frozen forever"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Negative cases are the ones everyone omits",
          text: "A system that answers everything looks excellent on a dataset where every question has an answer. Add twenty questions your corpus genuinely cannot answer and the picture changes completely — you discover the system confidently fabricates. Since fabrication is the failure mode that destroys user trust fastest, these are arguably your most valuable examples.",
        },
        { t: "h", text: "Building it" },
        {
          t: "steps",
          items: [
            { title: "1. Mine production logs", text: "Real queries beat invented ones every time. If you have no production yet, ask the people who will use it to write twenty questions each — and take their phrasing verbatim, including the ambiguity." },
            { title: "2. Cluster and sample", text: "Embed the queries, cluster, and sample across clusters. This gives coverage rather than fifty variants of the most common question." },
            { title: "3. Bootstrap labels with a strong model, then verify", text: "Have a frontier model draft the expected answers and relevance judgements, then review by hand. Roughly 5× faster than writing from scratch, and the verification is what makes it trustworthy." },
            { title: "4. Store as data, not code", text: "A JSONL or CSV file in version control. Anyone should be able to add a case without touching the harness." },
            { title: "5. Make it one command", text: "`make eval` prints a table of metrics plus a diff against the last run. If it takes more than one command, it will stop being run within a month." },
            { title: "6. Grow it from incidents", text: "Every production failure becomes a test case, permanently. This is the single habit that compounds — after a year your eval set encodes everything the system has ever got wrong." },
          ],
        },
        { t: "h", text: "Reporting" },
        {
          t: "code",
          lang: "text",
          caption: "What a useful eval report looks like",
          code: `$ make eval

  RETRIEVAL                    baseline    current     delta
    recall@50                    0.912      0.938     +0.026
    ndcg@10                      0.741      0.783     +0.042
    zero-result rate             0.031      0.024     -0.007

  GENERATION
    faithfulness (judge)         0.884      0.891     +0.007
    answer relevance (judge)     0.913      0.902     -0.011
    citation validity (exact)    0.967      0.994     +0.027

  BEHAVIOUR (deterministic assertions)
    valid JSON                   100.0%     100.0%       -
    refuses when no answer        68.0%      92.0%    +24.0%   <-
    under length limit            97.5%      98.0%     +0.5%

  COST & LATENCY
    mean cost / request         $0.0182    $0.0211    +15.9%   <-
    p95 latency                   2.41s      2.58s     +7.1%

  17 regressions on: eval/regressions.jsonl  ->  0 failing

Two things to notice: the big win is on refusal behaviour, and it
cost 16% more per request. That is a tradeoff to decide consciously,
which is only possible because both numbers are on the same report.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Do not optimise your eval set into uselessness",
          text: "If you tune prompts against the same 100 examples for three months, you have overfitted to them and your score no longer predicts production behaviour. Keep a held-out set you look at rarely, rotate in fresh production cases regularly, and treat a large gap between eval score and user satisfaction as evidence that the eval set has gone stale — not as evidence that users are wrong.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 16,
      title: "Safety, guardrails, and red-teaming",
      summary: "The harm surface of a generative system, and the layered controls that reduce it.",
      blocks: [
        {
          t: "p",
          text: "Module 12 covered prompt injection from the chatbot's perspective. This lesson takes the wider view: what can go wrong, and what controls exist.",
        },
        { t: "h", text: "The harm categories" },
        {
          t: "table",
          head: ["Risk", "Manifestation", "Primary control"],
          rows: [
            ["Hallucination", "Confident fabrication", "Retrieval, citations, verification (Modules 5, 9)"],
            ["Prompt injection", "Instructions in untrusted content", "Least privilege, output filtering, human gates (Module 12)"],
            ["Data leakage", "System prompt, PII, or other users' data in output", "Output scanning, partitioning, no secrets in prompts"],
            ["Training-data extraction", "Verbatim memorised content", "Deduplication at training time; output filters"],
            ["Toxic or unsafe content", "Harmful generations", "Input and output classifiers"],
            ["Bias", "Systematically different quality by demographic", "Disaggregated evaluation; diverse test sets"],
            ["Over-refusal", "Declining benign requests", "Measure it — it is a real failure with a real cost"],
            ["Unsafe autonomy", "An agent taking a harmful action", "Approval gates, step limits, sandboxing (Module 16)"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Over-refusal is a safety failure too",
          text: "A medical-information bot that refuses to discuss medication interactions is not safe — it is useless, and users will go somewhere less careful. Teams measure harmful-output rate obsessively and refusal rate not at all, which produces systems that are safe in the sense that a brick is safe. Track both, and treat an unjustified refusal as a defect with the same seriousness as a harmful completion.",
        },
        { t: "h", text: "Never put secrets in a system prompt" },
        {
          t: "p",
          text: "System prompts are extractable. Assume any user who wants your system prompt will eventually get it — through direct extraction, injection, or repetition attacks. So: no API keys, no credentials, no internal URLs, no confidential business rules whose disclosure would matter. Treat the system prompt as public-facing configuration, and put anything sensitive behind a tool call with server-side authorisation.",
        },
        { t: "h", text: "Red-teaming" },
        {
          t: "steps",
          items: [
            { title: "1. Enumerate what would actually be bad", text: "Not generic 'harmful content' — specific to your system. Issues a refund it should not. Reveals another customer's data. Gives dangerous dosage advice. Be concrete; the generic version produces generic testing." },
            { title: "2. Attack each one deliberately", text: "Direct requests, roleplay framings, encoded instructions, multi-turn setups where the harmful step looks innocuous in isolation, and — most importantly — injected content in whatever your system retrieves." },
            { title: "3. Automate what you find", text: "Every successful attack becomes a permanent test case. There are also automated red-teaming tools (PyRIT, garak, promptfoo) that generate attack variants at scale." },
            { title: "4. Re-run on every model change", text: "A new model version has different failure modes. Safety behaviour does not transfer across models, and a model upgrade can silently reopen a hole you closed." },
            { title: "5. Have an incident path", text: "When something gets through in production, you need a way to disable a capability quickly. A feature flag per tool is worth more than any amount of prompt hardening." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Multi-turn attacks defeat single-turn filters",
          text: "Almost all published guardrail evaluation is single-turn. Real attacks are conversational: establish an innocuous frame over several turns, then make a request that is only harmful in the accumulated context. Each individual message passes moderation. Test your system over multi-turn conversations, not isolated prompts — this is where most deployed guardrails are weakest.",
        },
        { t: "h", text: "Layered controls" },
        {
          t: "list",
          items: [
            "**Input** — moderation classifier, PII detection, injection heuristics, rate limits per user.",
            "**Context** — clearly delimit and label untrusted retrieved content; never let it carry authority.",
            "**Model** — an aligned model, a well-specified system prompt, and constrained decoding for structured output.",
            "**Output** — moderation, PII redaction, groundedness scoring, citation verification, and outbound-URL scanning.",
            "**Action** — permission checks in code, human approval for irreversible operations, audit logs, idempotency keys.",
            "**Monitoring** — refusal rate, escalation rate, flagged-output rate, and sampled human review.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "No single layer is reliable; the stack is",
          text: "Every individual control here has documented bypasses. The engineering posture that works is defence in depth combined with limiting blast radius: assume something will get through, and ensure that when it does, the worst outcome is bounded. That means least-privilege tools and human gates on consequential actions — controls that hold even when the model is fully compromised.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 14,
      title: "LLMOps: shipping and operating",
      summary: "Versioning, deployment strategy, and the monitoring that tells you something broke before your users do.",
      blocks: [
        {
          t: "p",
          text: "LLMOps is MLOps with three additional moving parts: prompts change constantly, the model is often a third-party dependency you do not control, and quality is not directly observable from production traffic.",
        },
        { t: "h", text: "Version everything" },
        {
          t: "table",
          head: ["Artefact", "Why it must be versioned"],
          rows: [
            ["Prompts", "The primary quality lever. Changed most often, tracked least often."],
            ["Model identifier", "Providers update models behind the same name; pin explicit versions."],
            ["Retrieval config", "Chunk size, k, reranker, fusion weights all change results."],
            ["Embedding model", "Changing it invalidates the whole index (Module 6)."],
            ["Index snapshot", "Which documents were present when this answer was produced."],
            ["Eval set", "So you know what a historical score actually measured."],
            ["Tool schemas", "A changed description changes agent behaviour."],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Prompts belong in version control, not in a database someone edits at 6pm",
          text: "Prompt-management UIs are convenient and they detach your most important configuration from code review, CI, and rollback. If you use one, mirror prompts into the repository and require the same review process as code. An unreviewed prompt edit is a production deployment with no changelog.",
        },
        { t: "h", text: "Deployment strategies" },
        {
          t: "list",
          items: [
            "**Shadow** — run the new version on real traffic without serving its output. Compare offline. The safest way to evaluate a significant change, and it costs only inference.",
            "**Canary** — route 1–5% of traffic to the new version, watch metrics, ramp gradually. The standard for prompt and model changes.",
            "**A/B test** — split traffic and compare a business metric. The only way to settle subjective quality disputes, and it needs enough traffic for significance.",
            "**Blue/green** — full switch with instant rollback. Appropriate for index rebuilds, where partial states are incoherent.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The rollback question decides your architecture",
          text: "Before deploying anything, ask: how fast can I undo this? Prompts should roll back in seconds via config. Models should roll back in seconds via a version pin. An index rebuilt in place cannot roll back at all — which is exactly why Module 6 insisted on building the new index alongside the old. Design for reversal, and you can deploy confidently.",
        },
        { t: "h", text: "What to monitor" },
        {
          t: "table",
          head: ["Signal", "Watch for", "Indicates"],
          rows: [
            ["p50 / p95 / p99 latency", "Tail growth", "Preemption, longer contexts, provider degradation"],
            ["Cost per request", "Upward creep", "Prompt bloat, more retrieved chunks, longer outputs"],
            ["Error and timeout rate", "Spikes", "Provider incident, rate limits, a broken tool"],
            ["Refusal / \"I don't know\" rate", "Sudden rise", "Retrieval broke or the index went stale"],
            ["Zero-result retrieval rate", "Any nonzero trend", "Filtering bug or corpus coverage gap (Module 7)"],
            ["Output length distribution", "Shift", "A model update changed behaviour"],
            ["Query embedding drift", "New clusters", "Users asking about things you do not cover"],
            ["Thumbs-down rate", "Rise", "Something broke that your metrics do not capture"],
            ["Guardrail trigger rate", "Rise", "An attack campaign, or an over-tightened filter"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Percentiles, not averages",
          text: "Mean latency of 1.2s can hide a p99 of 30 seconds. If 1% of requests take 30 seconds, a user making ten requests in a session has a ~10% chance of hitting one, and that is what they will remember. Alert on p95 and p99. The same argument applies to cost: a mean of $0.02 with a tail of $2.00 is a very different system from a uniform $0.02.",
        },
        { t: "h", text: "Continuous evaluation on production traffic" },
        {
          t: "steps",
          items: [
            { title: "1. Sample", text: "Score 1–5% of real requests with your LLM judge. Enough for a trend, cheap enough to run always." },
            { title: "2. Alert on distribution shift", text: "Not on individual bad scores — on the aggregate moving. A single low faithfulness score is noise; a 10-point weekly drop is an incident." },
            { title: "3. Route low-scoring cases to human review", text: "This is your pipeline for discovering failure modes you never imagined, and it feeds directly into the eval set." },
            { title: "4. Close the loop", text: "Reviewed failures become eval cases; eval cases drive fixes; fixes are verified by the same harness. Without this loop you are collecting metrics rather than improving." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The provider-dependency risk nobody plans for",
          text: "If you use a hosted model you have an unversioned dependency that can change, be deprecated, be rate-limited, or have an outage — with no notice you control. Mitigations: pin explicit model versions, keep an evaluated fallback model configured behind a flag, degrade gracefully rather than hard-failing, and re-run your eval suite whenever the provider announces anything. Teams discover this dependency during an incident rather than before one.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 12,
      title: "Cost engineering",
      summary: "The discipline that decides whether your system is a product or a science project.",
      blocks: [
        {
          t: "p",
          text: "GenAI features have a marginal cost per request that traditional software does not. A feature that costs $0.05 per use and gets used ten million times a month is a $500k line item. Cost is a product constraint, not an afterthought.",
        },
        {
          t: "math",
          formula: "cost/request = Σ_calls (in_tokens × p_in + out_tokens × p_out) / 1e6",
          note: "Output typically costs 3-5× input, because generation is sequential and memory-bound while prefill is parallel (Module 14). Multi-step pipelines multiply this by the number of calls.",
        },
        { t: "h", text: "The levers, in order of return" },
        {
          t: "steps",
          items: [
            {
              title: "1. Prompt caching — usually the largest single win",
              text: "Stable prefixes (system prompt, tool schemas, few-shot examples, long shared context) can be cached by the provider at roughly 10% of the input rate. Requires structuring your prompt with stable content first. Frequently a 50–80% reduction in input cost for RAG and agent workloads, for a day's work.",
            },
            {
              title: "2. Model routing",
              text: "Send classification, rewriting, grading, and extraction to a small cheap model; reserve the frontier model for final synthesis. Often 5–10× overall reduction with no measurable quality change — verify on your eval set.",
            },
            {
              title: "3. Reduce retrieved context",
              text: "Reranking to 5 excellent chunks instead of stuffing 20 mediocre ones cuts input tokens *and* improves quality (Module 9). One of the rare changes that is strictly better on both axes.",
            },
            {
              title: "4. Semantic caching",
              text: "Repeated and near-duplicate questions get cached answers. 30–50% hit rates are common in support workloads. Mind the correctness risks from Module 12.",
            },
            {
              title: "5. Cap the loops",
              text: "Maximum steps, maximum tokens, maximum tool calls, enforced in code. An unbounded agent loop is the classic source of a surprise invoice."
            },
            {
              title: "6. Then consider fine-tuning or self-hosting",
              text: "Distilling into a small fine-tuned model, or self-hosting, can be dramatically cheaper at sustained high volume — but both add engineering and operational cost. Do the earlier steps first; they are cheaper and reversible.",
            },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Measure cost per *successful* request",
          text: "Failed requests, retries, guardrail rejections, and abandoned conversations all consume tokens. A system with a 30% retry rate has real unit costs about 1.4× its headline number. Dividing total spend by successful outcomes is the only figure that reflects what you are actually paying for value delivered.",
        },
        { t: "h", text: "The build-versus-buy arithmetic" },
        {
          t: "steps",
          items: [
            { title: "Self-hosted capacity", text: "An 8×H100 node is roughly $20–30/hour on demand, about $17k–22k/month, less on reserved pricing." },
            { title: "What that buys", text: "Serving a 70B-class model with good batching, perhaps 3,000–5,000 output tokens/second sustained. Over a month at full utilisation that is on the order of 10 billion tokens." },
            { title: "The comparison", text: "At $3/1M output tokens an API would charge ~$30k for the same volume. So self-hosting wins — but only at high, sustained utilisation." },
            { title: "The honest caveat", text: "At 10% utilisation you pay the same $20k for a tenth of the volume, plus an on-call rotation, plus engineering time. Self-host for data residency, sustained volume, or a custom fine-tuned model. Do not self-host to save money at low volume; you will not." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Set a cost budget per feature and alert on it",
          text: "Treat cost like latency: give each feature an explicit per-request budget, instrument it, and alert when it is exceeded. Cost regressions are otherwise invisible until the monthly invoice, by which point you are debugging a month of changes at once. A cost assertion in your eval report (Module 15, lesson 3) catches it at the pull request.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Your GenAI feature costs too much. What do you do?\" Give the ordered levers — prompt caching, routing, less context via reranking, semantic caching, loop caps — and note that reducing retrieved context improves quality at the same time. Then close with the discipline: measure cost per successful request and budget it per feature. Reaching straight for self-hosting or fine-tuning signals someone who has not done the cheap work.",
        },
      ],
    },
  ],

  theory: [
    "Why evaluating GenAI is fundamentally harder than classical ML: unbounded output space, multi-dimensional and contextual quality, non-determinism, benchmark contamination, prompt sensitivity.",
    "The reframing: stop asking 'is this correct?' and ask 'does it satisfy the specific properties my application requires?'",
    "The three evaluation levels: deterministic assertions (free), golden dataset (cheap to run), human/production (expensive) — and why to start at the top.",
    "The n-of-1 problem: SE ≈ √(p(1-p)/n) means 50 examples gives roughly ±12 points of confidence interval.",
    "Paired comparisons and repeated sampling as ways to reduce measurement variance.",
    "Reference-based metrics: BLEU (precision, translation) and ROUGE (recall, summarisation), and why n-gram overlap correlates poorly with human judgement for open-ended text.",
    "BERTScore and embedding-based metrics as an improvement that is still reference-dependent and still blind to factual correctness.",
    "LLM-as-judge design: one dimension per call, discrete anchored scales, reasoning and evidence before the score.",
    "Judge biases: position, verbosity, self-preference, scale compression, sycophancy — and the mitigation for each.",
    "Why you must validate the judge against human labels before trusting it.",
    "Human evaluation: pairwise beats absolute rating, Elo/Bradley-Terry aggregation, inter-annotator agreement as a ceiling, domain experts for domain tasks.",
    "Eval set composition: typical, hard, negative (no-answer), adversarial, and frozen regression cases.",
    "Why negative cases are the most valuable and most commonly omitted.",
    "Building the set: mine logs, cluster and sample, LLM-bootstrap then verify, store as data, one command to run, grow from incidents.",
    "Reporting: baseline vs current with deltas across retrieval, generation, behaviour, cost, and latency on one report.",
    "Overfitting to your own eval set, and rotating in fresh production cases.",
    "The harm categories: hallucination, prompt injection, data leakage, training-data extraction, toxicity, bias, over-refusal, unsafe autonomy.",
    "Over-refusal as a genuine safety failure that teams systematically fail to measure.",
    "Never put secrets in a system prompt — assume it is extractable.",
    "Red-teaming: enumerate concrete harms, attack deliberately, automate findings, re-run on model changes, keep a per-tool kill switch.",
    "Why multi-turn attacks defeat single-turn guardrail evaluation.",
    "Layered controls across input, context, model, output, action, and monitoring — no single layer is reliable.",
    "LLMOps versioning: prompts, model IDs, retrieval config, embedding model, index snapshots, eval sets, tool schemas.",
    "Why prompts belong in version control rather than an unreviewed prompt-management UI.",
    "Deployment strategies: shadow, canary, A/B, blue/green — and designing for fast rollback.",
    "Production monitoring signals: latency percentiles, cost per request, error rate, refusal rate, zero-result retrievals, output length shift, query drift, thumbs-down rate, guardrail trigger rate.",
    "Why percentiles rather than averages, for both latency and cost.",
    "Continuous evaluation: sample production traffic, alert on distribution shift, route low scores to human review, close the loop into the eval set.",
    "Provider dependency risk: pin versions, keep an evaluated fallback, degrade gracefully, re-evaluate on provider announcements.",
    "Cost levers in order of return: prompt caching, model routing, less retrieved context, semantic caching, loop caps, then fine-tuning or self-hosting.",
    "Cost per SUCCESSFUL request as the honest unit metric, and per-feature cost budgets with alerting.",
    "The self-hosting break-even: it depends on sustained utilisation, not on headline token prices.",
  ],

  math: [
    {
      title: "BLEU (simplified)",
      formula: "BLEU = BP × exp(Σ wn log pn)",
      note: "pn = n-gram precision between candidate and reference; BP = brevity penalty. Precision-oriented, designed for translation. Poor fit for open-ended chat.",
    },
    {
      title: "ROUGE-N recall",
      formula: "ROUGE-N = matching n-grams / total n-grams in reference",
      note: "Recall-oriented, designed for summarisation. 'the cat sat on the mat' vs 'the cat sat on a mat quietly' gives 5/7 ≈ 0.714 on unigrams.",
    },
    {
      title: "Evaluation confidence interval",
      formula: "SE ≈ √(p(1-p)/n) ; 95% CI ≈ p ± 1.96·SE",
      note: "At p=0.75, n=50: ±12 points. You cannot distinguish 72% from 76% with 50 examples. Detecting a 5-point difference needs several hundred.",
    },
    {
      title: "Faithfulness",
      formula: "faithfulness = supported_claims / total_claims",
      note: "Decompose the answer into atomic claims and verify each against the provided context. Measures groundedness, independent of whether the answer is correct.",
    },
    {
      title: "Cost per successful request",
      formula: "cost_eff = total_spend / successful_requests",
      note: "Retries, guardrail rejections, and abandonments all consume tokens. A 30% retry rate makes real unit cost ~1.4× the headline figure.",
    },
    {
      title: "Self-hosting break-even",
      formula: "break_even_tokens = monthly_gpu_cost / api_price_per_token",
      note: "At $20k/month for a node and $3/1M output tokens, break-even is ~6.7B tokens/month — achievable only at high sustained utilisation.",
    },
    {
      title: "SLO budget",
      formula: "p95 latency ≤ target ; cost/request ≤ budget",
      note: "Percentiles, not averages. A 1.2s mean can hide a 30s p99, which a user making ten requests will hit about 10% of the time.",
    },
  ],

  practice: [
    { type: "theory", q: "Give five reasons evaluating a generative model is harder than evaluating a spam classifier." },
    { type: "theory", q: "Explain the reframing from 'is this correct?' to 'does this satisfy required properties', and give five checkable properties for a RAG answer." },
    { type: "theory", q: "Why do BLEU and ROUGE correlate poorly with human judgement for open-ended chat, even though they remain useful for translation and extractive summarisation?" },
    { type: "theory", q: "Name four biases of LLM-as-judge and give a specific mitigation for each." },
    { type: "theory", q: "Describe three design choices that make an LLM judge prompt reliable, and explain what each one prevents." },
    { type: "theory", q: "How would you validate that your LLM judge is measuring what you think? What would you do if agreement were poor?" },
    { type: "theory", q: "Why is pairwise comparison more reliable than absolute rating for human evaluation, and how do you turn pairwise results into a ranking?" },
    { type: "theory", q: "Describe the five categories your eval set should contain and their approximate proportions. Which is most commonly omitted and why does it matter most?" },
    { type: "theory", q: "Explain why over-refusal is a safety failure, not a safe default." },
    { type: "theory", q: "Why should you never put secrets in a system prompt, and where should sensitive logic live instead?" },
    { type: "theory", q: "Why do multi-turn attacks defeat most deployed guardrails, and how would you test for them?" },
    { type: "theory", q: "What is a canary deployment, and why is it especially useful for a prompt change? Which change type cannot be rolled back, and how do you design around that?" },
    { type: "theory", q: "List six things you would monitor for a deployed RAG chatbot beyond uptime, and say what each one indicates when it moves." },
    { type: "theory", q: "Why do production systems track P95/P99 latency instead of average? Give a scenario where the average looks fine and the p99 does not." },
    { type: "theory", q: "Describe the continuous-evaluation loop on production traffic and explain why closing the loop into the eval set is the part that matters." },
    { type: "theory", q: "Your GenAI feature costs too much. Give the ordered list of levers you would apply and explain which one also improves quality." },
    { type: "math", q: "Compute ROUGE-1 recall for candidate 'the cat sat on the mat' against reference 'the cat sat on a mat quietly'." },
    { type: "math", q: "Your eval set has 80 examples and you score 0.70. Compute the standard error and the 95% confidence interval. Could you detect an improvement to 0.75? How many examples would you need?" },
    { type: "math", q: "A pipeline makes 3 LLM calls per request: 1,200 in / 100 out, 4,000 in / 300 out, 800 in / 50 out, at $3/1M in and $15/1M out. Compute cost per request. Then recompute assuming prompt caching makes 3,000 of the second call's input tokens cost 10% of the rate." },
    { type: "math", q: "You spend $9,000/month and serve 400,000 requests, of which 15% fail and are retried once. What is your cost per successful request, and how does it compare to the naive figure?" },
    { type: "math", q: "An 8×H100 node costs $22,000/month and sustains 4,000 output tokens/second at 60% average utilisation. Compute the effective cost per 1M output tokens and compare it to an API at $3/1M." },
  ],

  resources: [
    { label: "Zheng et al. 2023 — Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", url: "https://arxiv.org/abs/2306.05685", kind: "paper" },
    { label: "Papineni et al. 2002 — BLEU", url: "https://aclanthology.org/P02-1040/", kind: "paper" },
    { label: "Lin 2004 — ROUGE", url: "https://aclanthology.org/W04-1013/", kind: "paper" },
    { label: "Zhang et al. 2019 — BERTScore", url: "https://arxiv.org/abs/1904.09675", kind: "paper" },
    { label: "RAGAS — RAG evaluation framework", url: "https://docs.ragas.io/", kind: "docs" },
    { label: "promptfoo — prompt testing, evals and red-teaming", url: "https://www.promptfoo.dev/docs/intro/", kind: "docs" },
    { label: "Microsoft PyRIT — automated risk identification toolkit", url: "https://github.com/Azure/PyRIT", kind: "repo" },
    { label: "garak — LLM vulnerability scanner", url: "https://github.com/NVIDIA/garak", kind: "repo" },
    { label: "NVIDIA NeMo Guardrails — documentation", url: "https://docs.nvidia.com/nemo/guardrails/", kind: "docs" },
    { label: "OWASP Top 10 for LLM Applications", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", kind: "docs" },
    { label: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", kind: "docs" },
    { label: "Hamel Husain — Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "blog" },
    { label: "Chip Huyen — Designing Machine Learning Systems (monitoring, deployment)", url: "https://huyenchip.com/books/", kind: "book" },
  ],
};

export default m15;
