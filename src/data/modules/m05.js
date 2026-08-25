const m05 = {
  id: "m05",
  week: 5,
  hours: 8,
  title: "LLM Fundamentals: Pretraining, Decoding & Scaling",
  tag: "Core LLM",
  why: "Now that you know the architecture, learn how a raw Transformer becomes 'ChatGPT-like' — the training pipeline, decoding strategies, and the vocabulary you'll need in interviews (context window, RLHF, MoE, etc).",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "The pipeline: from raw transformer to assistant",
      summary: "Four stages, each answering a different question. Knowing which stage causes which behaviour is a genuine diagnostic skill.",
      blocks: [
        {
          t: "p",
          text: "A freshly pretrained transformer is not a chatbot. Ask it \"What is the capital of France?\" and a good base model might reply \"What is the capital of Germany? What is the capital of Spain?\" — because in its training data, that string most often appears in a list of quiz questions. It has learned the *distribution of text on the internet*, which is not the same as being helpful. Four stages bridge that gap.",
        },
        {
          t: "table",
          head: ["Stage", "Data", "Objective", "Teaches"],
          rows: [
            ["1. Pretraining", "10–15T tokens of web text, books, code", "Next-token prediction", "Language, facts, reasoning, code — nearly all capability"],
            ["2. Supervised fine-tuning (SFT)", "10k–1M curated instruction/response pairs", "Next-token prediction on responses only", "Format: answer questions, follow instructions, use the chat template"],
            ["3. Reward modelling", "100k+ human preference comparisons", "Ranking loss on (chosen, rejected) pairs", "A proxy for 'which response would a human prefer?'"],
            ["4. Alignment (RLHF / DPO)", "Prompts + the reward model or preference pairs", "Policy optimisation / preference loss", "Tone, helpfulness, honesty, refusals"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The proportions matter enormously",
          text: "Pretraining is roughly 98–99% of the compute and is where essentially all knowledge and capability comes from. Post-training is a thin, cheap layer that *elicits and shapes* behaviour that is already latent. This is the single most useful mental model in the module: **capability comes from pretraining, behaviour comes from post-training.** It tells you immediately that you cannot fine-tune knowledge into a model that never had it, which is exactly why RAG exists.",
        },
        { t: "h", text: "Stage 1: Pretraining" },
        {
          t: "p",
          text: "Predict the next token, on everything. No labels, no humans in the loop — the text is its own supervision, which is what made scaling to trillions of tokens possible. Cost: millions of dollars and weeks on thousands of GPUs. The result is a *base model*: excellent at continuing text, poor at being asked to do things.",
        },
        { t: "h", text: "Stage 2: Supervised fine-tuning" },
        {
          t: "p",
          text: "Exactly the same loss function, on a much smaller and much more curated dataset of (instruction, good response) pairs. The critical detail is that the loss is computed **only on the response tokens** — the prompt is masked out. You are teaching the model what a good answer looks like, not teaching it to generate the questions.",
        },
        {
          t: "code",
          lang: "python",
          caption: "What an SFT example actually looks like",
          code: `# Raw pair
{"instruction": "Explain photosynthesis to a 10-year-old.",
 "response": "Photosynthesis is how plants make their own food..."}

# Rendered through the model's chat template
"""<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
Explain photosynthesis to a 10-year-old.<|im_end|>
<|im_start|>assistant
Photosynthesis is how plants make their own food...<|im_end|>"""

# Loss mask: -100 (ignored) on system+user tokens, real labels on the
# assistant response only. Getting this mask wrong is the single most
# common SFT bug — the model learns to generate user turns.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Chat templates are not cosmetic",
          text: "Special tokens like `<|im_start|>` are real vocabulary entries the model was trained to recognise as turn boundaries. Using the wrong template at inference — or hand-rolling your own string format — reliably degrades quality and can break stop conditions. Always use `tokenizer.apply_chat_template()`. This one line prevents a whole category of \"the fine-tune got worse\" reports."
        },
        { t: "h", text: "Stages 3 and 4: learning from preferences" },
        {
          t: "p",
          text: "SFT teaches the model to imitate demonstrations. But for open-ended questions there is no single right answer, and writing perfect demonstrations at scale is expensive. It is far easier for a human to *compare* two responses than to author the ideal one. That asymmetry is the entire basis of preference learning.",
        },
        {
          t: "steps",
          items: [
            { title: "Collect comparisons", text: "Sample two responses to the same prompt, ask a human which is better. Repeat ~100k+ times." },
            { title: "Train a reward model", text: "A model — often the LLM with a scalar head — that scores a response. Trained so that score(chosen) > score(rejected)." },
            { title: "Optimise the policy", text: "Use RL (PPO) to adjust the LLM to maximise reward, with a KL penalty keeping it close to the SFT model so it does not collapse into gibberish that games the reward." },
            { title: "Or skip the middle", text: "DPO (Module 11) derives a loss that optimises directly on preference pairs, removing the reward model and the RL loop entirely. Far simpler, and now the default for most open-model post-training." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Diagnosing which stage caused a problem",
          text: "The model does not know a fact → pretraining (or it needs RAG). The model knows it but answers in the wrong format → SFT. The model is correct but rude, waffly, or over-refuses → alignment. The model is confidently wrong → pretraining plus a calibration failure that alignment often makes *worse*, because RLHF rewards confident-sounding answers. Being able to route a complaint to a stage is a genuinely useful production skill.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "Pretraining data: the part that actually determines quality",
      summary: "Architectures have largely converged. Data is where the remaining differences come from.",
      blocks: [
        {
          t: "p",
          text: "Llama, Mistral, Qwen, and Gemma have nearly identical architectures — pre-norm, RoPE, SwiGLU, GQA. They differ mainly in data. Labs publish architecture details freely and are secretive about data mixtures, which tells you where they believe the value is.",
        },
        { t: "h", text: "Where the tokens come from" },
        {
          t: "table",
          head: ["Source", "Rough share", "Contributes"],
          rows: [
            ["Filtered web crawl (CommonCrawl → FineWeb, C4)", "60–80%", "Breadth, volume, general language"],
            ["Code (GitHub, StackExchange)", "5–20%", "Reasoning and structure — improves non-code tasks too"],
            ["Books and long-form", "5–10%", "Long-range coherence, narrative structure"],
            ["Wikipedia and reference", "2–5%", "Dense, reliable facts"],
            ["Academic (arXiv, PubMed)", "2–5%", "Technical vocabulary, mathematics"],
            ["Synthetic / model-generated", "Growing fast", "Targeted skills, textbook-quality explanation"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Code makes models better at things that are not code",
          text: "A consistent, initially surprising finding: adding code to the pretraining mix improves performance on general reasoning benchmarks. The plausible explanation is that code is unusually clean supervision for structured, multi-step, compositional reasoning with unambiguous correctness. It is one of the clearest examples of data mixture as a design lever rather than an afterthought.",
        },
        { t: "h", text: "Filtering: most of the crawl is unusable" },
        {
          t: "steps",
          items: [
            { title: "1. Language identification", text: "Keep the target languages; a multilingual model needs a deliberate mix rather than whatever the crawl happens to contain." },
            { title: "2. Quality heuristics", text: "Drop pages with too few words, extreme symbol-to-word ratios, missing punctuation, boilerplate navigation, or SEO spam patterns. Gopher's rules are the standard published baseline." },
            { title: "3. Model-based quality scoring", text: "Train a classifier to recognise 'text like Wikipedia and books' and use it to filter. This is roughly what the Phi models pushed to its extreme with 'textbook-quality' data." },
            { title: "4. Deduplication", text: "Exact and near-duplicate removal (MinHash/LSH) at document and paragraph level. The web is enormously redundant, and duplicates cause memorisation without teaching anything new." },
            { title: "5. Decontamination", text: "Remove anything matching known benchmark test sets. Skipping this makes your evaluation numbers meaningless (Module 15)." },
            { title: "6. Toxicity and PII filtering", text: "Reduces the harm surface, though over-filtering measurably damages capability and can erase entire dialects and communities." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Deduplication is not optional",
          text: "Lee et al. showed that deduplicating training data reduces memorised regurgitation by an order of magnitude while *improving* perplexity. Duplicated data is worse than useless: it consumes compute, encourages verbatim memorisation, and creates privacy and copyright exposure. If you take one operational lesson from this lesson, take this one.",
        },
        { t: "h", text: "The data wall" },
        {
          t: "p",
          text: "High-quality public text is finite. Credible estimates put the usable public web at roughly 10–20 trillion tokens after filtering — and Llama-3 already trained on 15T. Chinchilla scaling says you need proportionally more data as models grow, so the field is approaching a genuine constraint. Three responses are in play:",
        },
        {
          t: "list",
          items: [
            "**Repeat data.** Works for up to about 4 epochs with returns close to fresh data, then degrades sharply. Buys a factor, not an order of magnitude.",
            "**Synthetic data.** Generate training data with a strong model. Effective for targeted skills and now standard in post-training. The open risk is model collapse — training on your own outputs narrows the distribution over generations.",
            "**Multimodal data.** Video and audio are vastly larger corpora than text. Whether they transfer to text reasoning is an active question, and part of why frontier labs are all building multimodal (Module 13).",
            "**Spend compute at inference instead.** Extended chain-of-thought and search at test time buy capability without more pretraining data. This has become a major axis since 2024.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Two labs have identical architectures and compute. Why is one model better?\" Data — mixture, filtering quality, deduplication, decontamination, and increasingly the synthetic component. Adding that architectures have converged while data recipes have not is the observation that shows you follow the field rather than the headlines.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 20,
      title: "Decoding: turning a distribution into text",
      summary: "The model gives you probabilities. How you sample from them changes output quality more than most people realise.",
      blocks: [
        {
          t: "p",
          text: "At every step the model hands you a probability distribution over ~100,000 tokens. Choosing one is *decoding*, and it is entirely outside the model — no retraining needed, immediate effect. It is the cheapest quality lever you have, and the most commonly misconfigured.",
        },
        { t: "h", text: "Greedy decoding" },
        {
          t: "p",
          text: "Always take the argmax. Deterministic, fast, and reproducible — genuinely the right choice for classification, extraction, structured JSON, and evaluation runs. Its failure mode is repetition loops: once the model enters a self-reinforcing pattern (\"the best way to do this is the best way to do this is…\"), greedy decoding has no mechanism to escape.",
        },
        { t: "h", text: "Beam search" },
        {
          t: "p",
          text: "Maintain k partial sequences and expand the best-scoring ones, aiming to find a high-probability *sequence* rather than a chain of high-probability tokens. This is genuinely better for translation and summarisation, where there is roughly one correct output.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Why beam search is bad for open-ended chat",
          text: "The most probable sequence is boring. Human text is not maximum-likelihood text — real writing includes surprise, and a model optimised to find the single likeliest continuation produces bland, repetitive, generic prose. This is the 'likelihood trap' documented in the nucleus-sampling paper. Beam search also costs k× the compute and interacts badly with KV-caching. Almost nobody uses it for chat.",
        },
        { t: "h", text: "Top-k sampling" },
        {
          t: "p",
          text: "Keep the k highest-probability tokens, renormalise, sample. Simple, but k is a fixed number applied to a distribution whose shape varies enormously. After \"The capital of France is\" the distribution is nearly one-hot and k=50 admits 49 wrong answers. After \"She opened the door and saw\" the distribution is genuinely broad and k=50 truncates good options.",
        },
        { t: "h", text: "Top-p (nucleus) sampling — the default" },
        {
          t: "math",
          formula: "V' = smallest set such that Σ_{x∈V'} P(x) ≥ p,  then renormalise and sample from V'",
          note: "Instead of a fixed count, take a fixed probability mass. The candidate set adapts automatically: sharp distributions yield a tiny nucleus, flat ones a large nucleus. p = 0.9 to 0.95 is standard.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example — p = 0.8", text: "Distribution {A: 0.5, B: 0.3, C: 0.15, D: 0.05}." },
            { title: "Accumulate", text: "A alone is 0.5, below 0.8. A+B = 0.8, which meets the threshold." },
            { title: "Result", text: "Nucleus = {A, B}. Renormalise: A → 0.5/0.8 = 0.625, B → 0.3/0.8 = 0.375. C and D become impossible." },
            { title: "Contrast with top-k=3", text: "That would have kept {A, B, C} regardless of whether C deserved it. Top-p decided based on the actual shape of this particular distribution." },
          ],
        },
        { t: "h", text: "The rest of the toolbox" },
        {
          t: "table",
          head: ["Parameter", "What it does", "Typical", "Notes"],
          rows: [
            ["temperature", "Scales logits before softmax", "0 – 1.0", "The primary randomness knob (Module 1)"],
            ["top_p", "Nucleus mass cutoff", "0.9 – 0.95", "Set this or top_k, rarely both"],
            ["top_k", "Fixed candidate count", "40 – 50", "Cruder than top_p; still common"],
            ["min_p", "Cutoff relative to the top token's probability", "0.05 – 0.1", "Newer; more robust at high temperature"],
            ["repetition_penalty", "Divides logits of already-used tokens", "1.0 – 1.2", "Blunt — can suppress legitimately needed repeats"],
            ["frequency / presence penalty", "Subtracts from logits by usage count", "0 – 1.0", "OpenAI-style; finer-grained than repetition_penalty"],
            ["seed", "Fixes the RNG", "any", "Necessary but not sufficient for reproducibility"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Determinism is harder than setting temperature to 0",
          text: "Even at temperature 0 with a fixed seed, outputs can vary across runs. Floating-point reductions on GPU are not associative, and batching changes the reduction order — so the same prompt in a different batch position can produce a different argmax when two logits are nearly tied. MoE models add routing that depends on batch composition. Never promise bit-identical reproducibility from a hosted API.",
        },
        { t: "h", text: "Speculative decoding" },
        {
          t: "p",
          text: "A genuinely clever trick that gives 2–3× speedup with **zero** quality change. A small, fast draft model proposes several tokens ahead. The large model then verifies all of them in a single forward pass — cheap, because verification is parallel while generation is sequential. Accepted tokens are kept; the first rejected one is resampled correctly.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Why it is exact, not approximate",
          text: "The acceptance rule (modified rejection sampling) is constructed so that the output distribution is provably identical to sampling from the large model directly. You are not trading quality for speed; you are exploiting the fact that verifying k tokens costs about the same as generating one, because decoding is memory-bandwidth-bound rather than compute-bound (Modules 1 and 14). Variants like Medusa and EAGLE replace the draft model with extra prediction heads on the target model itself.",
        },
        {
          t: "table",
          head: ["Task", "Recommended settings"],
          rows: [
            ["Structured JSON / function calls", "temperature 0, plus constrained decoding if available"],
            ["Classification, extraction, evals", "temperature 0"],
            ["RAG question answering", "temperature 0 – 0.3, top_p 0.9"],
            ["Code generation", "temperature 0.2, top_p 0.95"],
            ["General chat", "temperature 0.7, top_p 0.9"],
            ["Creative writing / brainstorming", "temperature 0.9 – 1.1, top_p 0.95"],
            ["Self-consistency voting", "temperature 0.7 – 1.0, multiple samples, then vote"],
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 14,
      title: "The context window",
      summary: "What the number actually means, why extending it is genuinely hard, and why a bigger one is not automatically better.",
      blocks: [
        {
          t: "p",
          text: "The context window is the maximum number of tokens the model can attend over in one forward pass. It is the model's entire working memory. Everything it can use — system prompt, chat history, retrieved documents, tool outputs, and the answer being generated — must fit inside it.",
        },
        {
          t: "math",
          formula: "context = system + history + retrieved + query + reserved_output",
          note: "Output shares the budget with input. A 'reserved output' allocation is not optional: if you fill 8,000 of an 8,192-token window with retrieved chunks, the model has 192 tokens to answer in, and you will get truncated responses that look like a model failure but are a budgeting failure.",
        },
        { t: "h", text: "Why extending context is hard" },
        {
          t: "list",
          items: [
            "**Quadratic attention cost.** 4× the context is 16× the attention compute during prefill. FlashAttention fixed the memory scaling but not the arithmetic.",
            "**Linear KV-cache growth.** From Module 4: cache size scales with T and with batch size, and quickly exceeds the model weights. This is usually the binding constraint in production.",
            "**Positional extrapolation.** A model trained to 4k has never seen position 30,000. Learned absolute embeddings simply have no entry. RoPE can be interpolated (YaRN, NTK-aware scaling) but usually needs a fine-tune to work well.",
            "**Training data scarcity.** Very few documents are 100k tokens long, so long-range dependency examples are rare, and models get little practice actually using distant context.",
          ],
        },
        { t: "h", text: "How long-context models are actually made" },
        {
          t: "steps",
          items: [
            { title: "1. Pretrain at a modest length", text: "Typically 4k or 8k, where training is cheap and data is plentiful." },
            { title: "2. Rescale RoPE", text: "Apply NTK-aware or YaRN scaling to the rotation frequencies so positions beyond the training range map sensibly." },
            { title: "3. Continue pretraining briefly on long documents", text: "A small fraction of total compute — often under 1% — on curated long-form data." },
            { title: "4. Fine-tune on long-context instructions", text: "Teach the model to actually use distant information: multi-document QA, long summarisation, retrieval-style tasks." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Effective context is shorter than advertised",
          text: "\"Lost in the middle\" (Module 4) is robust: recall is high at the start and end of the context and drops in the middle. Needle-in-a-haystack tests measure the easy case — one distinctive fact — and pass long after multi-fact reasoning over the same span has degraded. Treat the advertised number as a hard limit, not as a performance guarantee, and measure on your own task.",
        },
        { t: "h", text: "Long context versus RAG" },
        {
          t: "table",
          head: ["Consideration", "Long context (stuff everything in)", "RAG (retrieve, then answer)"],
          rows: [
            ["Cost per query", "Pay for every token, every call", "Pay only for what you retrieve"],
            ["Latency", "Prefill over 100k tokens is slow", "Retrieval is milliseconds"],
            ["Corpus size", "Bounded by the window", "Unbounded"],
            ["Freshness", "Rebuild the prompt", "Update the index"],
            ["Precision", "Degrades with distractors", "Depends entirely on retrieval quality"],
            ["Simplicity", "Very simple", "A pipeline with several failure points"],
            ["Citations", "Hard to attribute", "Natural — you know which chunk was used"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The honest answer is 'both'",
          text: "Long context did not kill RAG; it changed its shape. Retrieval still selects the relevant subset — you cannot fit a 50GB corpus in any window, and you would not want to pay for it if you could. What long context changed is that you can now retrieve *generously*: bigger chunks, more of them, whole parent documents rather than fragments. Prompt caching makes a large stable prefix cheap on repeat calls. The modern pattern is retrieval with a wide net into a large window, not one replacing the other.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 14,
      title: "Mixture of Experts",
      summary: "How to have 400B parameters and pay for 30B at inference — and what it costs you elsewhere.",
      blocks: [
        {
          t: "p",
          text: "A dense model uses every parameter for every token. That is wasteful: the parameters that know about French poetry are not helping you debug Rust. MoE makes the model *sparse* — many parameters, few active per token.",
        },
        { t: "h", text: "The mechanism" },
        {
          t: "p",
          text: "Replace the feed-forward network in each block with N parallel FFNs (\"experts\") plus a small router. From Module 2 you know the FFN holds roughly two-thirds of a transformer's parameters, which is exactly why the FFN and not attention is what gets replaced.",
        },
        {
          t: "math",
          formula: "g = softmax(x W_router)        y = Σ_{i ∈ top-k(g)} gᵢ · Expertᵢ(x)",
          note: "The router scores every expert for this token, the top-k are selected (usually k = 1 or 2), and their outputs are combined weighted by the router's gate values. Routing is per token and per layer — not per prompt.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example — Mixtral 8x7B", text: "8 experts per layer, top-2 routing." },
            { title: "Total parameters", text: "~47B. Note it is not 8×7 = 56B, because attention and embeddings are shared across experts rather than duplicated." },
            { title: "Active parameters per token", text: "~13B — two experts out of eight, plus all the shared components." },
            { title: "The result", text: "Roughly the inference FLOPs of a 13B model with the knowledge capacity of something closer to 47B. Mixtral matched or beat Llama-2-70B on most benchmarks at a fraction of the compute per token." },
          ],
        },
        { t: "h", text: "Load balancing: the thing that makes it hard" },
        {
          t: "p",
          text: "Left alone, the router collapses. A slightly-better expert gets picked more, therefore trains more, therefore becomes better, therefore gets picked more. You end up with two useful experts and six dead ones — the classic rich-get-richer failure.",
        },
        {
          t: "math",
          formula: "L_total = L_LM + α · N · Σᵢ fᵢ · Pᵢ",
          note: "The auxiliary load-balancing loss. fᵢ is the fraction of tokens routed to expert i, Pᵢ is the mean router probability for expert i. The product is minimised when routing is uniform. α is typically 0.01 — small enough not to disturb the language-modelling objective. Newer models (DeepSeek-V3) instead use a bias-adjustment scheme that avoids an auxiliary loss entirely.",
        },
        { t: "h", text: "The catch nobody mentions in the announcement post" },
        {
          t: "note",
          tone: "warn",
          title: "MoE saves compute, not memory",
          text: "All experts must be resident in GPU memory, because any token might route to any of them. Mixtral 8x7B needs ~94 GB in FP16 to serve — the memory of a 47B model — while giving you the *speed* of a 13B model. MoE is a throughput and latency optimisation, not a way to run big models on small GPUs. Candidates routinely get this backwards.",
        },
        {
          t: "list",
          items: [
            "**Expert parallelism.** Experts are usually sharded across GPUs, so routing becomes an all-to-all communication pattern — network-sensitive and awkward at small batch sizes.",
            "**Fine-tuning is fiddlier.** The router can collapse during fine-tuning; the auxiliary loss must be preserved, and LoRA on MoE requires care about which matrices you adapt.",
            "**Batch-dependent behaviour.** With capacity limits, tokens can be dropped when an expert is oversubscribed, so results can depend on what else is in the batch — a subtle source of non-determinism.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The direction of travel",
          text: "Recent MoE designs push toward many smaller experts with fine-grained routing plus a few always-on 'shared' experts that capture common patterns (DeepSeek-V3, Qwen-MoE). The intuition is that fine-grained specialisation gives more useful combinations, while shared experts prevent every expert from wasting capacity relearning the basics. Most frontier models are now believed to be MoE.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"What is MoE and what does it buy you?\" Say: sparse activation of FFN experts via a per-token router, giving large capacity at small active compute. Then deliver the discriminating point unprompted — it does not reduce memory, since all experts must be loaded, so it is a compute optimisation and can actually make serving harder.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 16,
      title: "Hallucination: a property, not a bug",
      summary: "Why the training objective guarantees it, why alignment can make it worse, and what actually helps.",
      blocks: [
        {
          t: "p",
          text: "\"Hallucination\" means the model produces fluent, confident, false content. It is treated as a defect to be patched. It is better understood as a direct consequence of what we trained the model to do — and understanding the mechanism tells you which mitigations can possibly work.",
        },
        { t: "h", text: "Four structural causes" },
        {
          t: "steps",
          items: [
            {
              title: "1. The objective rewards plausibility, not truth",
              text: "Cross-entropy asks: what token is likely to come next in text like this? Not: what token is true? For \"The 2019 Nobel Prize in Physics went to\", a plausible-sounding physicist's name is a low-loss continuation whether or not it is correct. Truth was never in the loss function.",
            },
            {
              title: "2. There is no lookup table",
              text: "Facts are distributed across billions of weights, learned by compression, not stored as records. Compression is lossy. The model has no mechanism to distinguish 'I have a sharp memory of this' from 'I am interpolating between similar things I saw'.",
            },
            {
              title: "3. Autoregressive commitment",
              text: "Once a token is emitted it becomes part of the context and the model conditions on it. Begin a sentence with a wrong premise and the model will fluently, consistently elaborate it — because the most probable continuation of a confident false statement is more confident false statement. There is no backspace.",
            },
            {
              title: "4. Alignment can make it worse",
              text: "RLHF trains on human preference, and humans prefer confident, complete, helpful-sounding answers over 'I'm not sure'. You are therefore actively rewarding the appearance of knowledge. This is why some aligned models are *less* calibrated than their base models — a well-documented and slightly uncomfortable finding.",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The sharpest framing",
          text: "The model is always doing the same thing — sampling plausible continuations. When the plausible continuation happens to be true we call it knowledge; when it is false we call it hallucination. The model cannot tell the difference because, mechanically, there is no difference. Any fix must come from outside the next-token objective: retrieval, tools, verification, or abstention.",
        },
        { t: "h", text: "A taxonomy that helps in production" },
        {
          t: "table",
          head: ["Type", "Example", "Best mitigation"],
          rows: [
            ["Factual fabrication", "Inventing a paper, citation, or API method", "RAG with citations; require quoted evidence"],
            ["Faithfulness failure", "Contradicting the provided context", "Grounded prompting + a faithfulness check (RAGAS, Module 15)"],
            ["Instruction drift", "Ignoring a stated constraint", "Better prompting; constrained decoding; validation"],
            ["Overgeneralisation", "Stating a plausible-sounding rule that does not exist", "Ask for sources; verify against ground truth"],
            ["Temporal error", "Confidently stating outdated information", "Include the current date; retrieve fresh data"],
          ],
        },
        { t: "h", text: "What actually reduces it" },
        {
          t: "list",
          items: [
            "**Retrieval (Module 9).** By far the highest-leverage intervention. It changes the task from recall to reading comprehension, which the model is genuinely good at.",
            "**Require citations.** Demanding a quoted span from the provided context makes unsupported claims mechanically detectable — you can programmatically check the quote exists.",
            "**Tools.** Calculators, code execution, database queries. Do not ask the model to know; ask it to look up.",
            "**Self-consistency.** Sample n times at temperature > 0 and compare. Genuine knowledge is stable across samples; confabulation varies. This is the basis of SelfCheckGPT-style detectors.",
            "**Give permission to abstain.** \"If the context does not contain the answer, say you do not know\" measurably works, and is trivially cheap. Most systems omit it.",
            "**Check the logprobs.** Low token probability on entity names correlates with fabrication. Underused because most people never look at the logprobs their API already returns.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "What does not work",
          text: "\"Do not hallucinate\" in the system prompt. \"Only state facts you are certain about\" — the model has no reliable access to its own certainty. And fine-tuning on more facts, which teaches the model that confidently stating obscure facts is the expected behaviour, and can *increase* fabrication on facts it does not have. Gekhman et al. showed fine-tuning on new knowledge actively encourages hallucination.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Can hallucination be fixed?\" The strong answer: not within the next-token objective, because the objective optimises plausibility and has no truth term, and RLHF adds pressure toward confident phrasing. It can be substantially *mitigated* from outside — retrieval, tools, verification, abstention, consistency checks. Framing it as a systems problem rather than a model problem is what a senior engineer says.",
        },
      ],
    },

    {
      id: "l7",
      level: "advanced",
      minutes: 12,
      title: "The model landscape and how to choose",
      summary: "A decision framework that survives the next release cycle, plus the numbers that actually drive the decision.",
      blocks: [
        {
          t: "p",
          text: "Specific model names date within months. The *structure* of the decision does not, so learn the structure.",
        },
        { t: "h", text: "The three tiers" },
        {
          t: "table",
          head: ["Tier", "Examples", "Access", "Use when"],
          rows: [
            ["Frontier closed", "GPT-class, Claude, Gemini", "API only", "Hardest reasoning; you want no infrastructure"],
            ["Open-weight strong", "Llama, Qwen, Mistral, DeepSeek, Gemma", "Downloadable weights", "Data must stay in your VPC; you want to fine-tune; high volume"],
            ["Small / specialised", "1–8B models, embedding and reranking models", "Downloadable, often permissive", "Narrow tasks, edge deployment, cost-critical paths"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "\"Open source\" mostly is not",
          text: "Llama's licence restricts use above 700M monthly active users and imposes naming requirements. Truly OSI-open weights (Apache 2.0 / MIT) include Mistral 7B, Qwen, and OLMo. If your company has a legal review, know which one you are proposing — this distinction has derailed real projects late.",
        },
        { t: "h", text: "The decision framework" },
        {
          t: "steps",
          items: [
            { title: "1. Can the data leave your infrastructure?", text: "If no — regulated health, finance, defence, or contractual restrictions — you are self-hosting an open-weight model. This constraint dominates everything else and should be checked first." },
            { title: "2. Build the evaluation set before choosing", text: "50–200 examples from your real task with known-good answers. Without this you are choosing on vibes and benchmark marketing. This is the step teams skip and regret." },
            { title: "3. Prototype on the strongest model available", text: "Establish what good looks like and whether the task is even feasible. Do not optimise cost against a target you have not proven reachable." },
            { title: "4. Walk down the cost curve", text: "Retest on progressively smaller and cheaper models against your eval set. Stop at the cheapest one that passes. The gap between tiers has narrowed dramatically — smaller models often suffice." },
            { title: "5. Route rather than settle", text: "Use a small model for the 90% of easy traffic and escalate hard cases. Classify difficulty cheaply, or escalate on low confidence. Often a 5–10× cost reduction with no measurable quality loss." },
          ],
        },
        { t: "h", text: "The cost arithmetic" },
        {
          t: "math",
          formula: "cost/request = (in_tokens × price_in + out_tokens × price_out) / 1e6",
          note: "Output tokens are typically 3–5× the price of input tokens because generation is sequential and memory-bound while prefill is parallel. Prompt caching can cut repeated-prefix input cost by up to ~90% and is the single easiest saving in most RAG systems.",
        },
        {
          t: "steps",
          items: [
            { title: "Self-hosting break-even", text: "An 8×H100 node runs roughly $20–30/hour on demand, about $17k–22k/month. Serving a 70B model it might sustain ~10–20 requests/second at moderate length." },
            { title: "The comparison", text: "That capacity is only cheaper than an API if you keep it genuinely busy. At 5% utilisation you are paying a large premium for idle GPUs plus an on-call rotation." },
            { title: "The honest rule", text: "Self-host for data-residency requirements, for sustained high volume, or when you need a fine-tuned model. Do not self-host to save money at low volume — you will not, once you cost the engineering time." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "What to actually track",
          text: "Ignore leaderboard rankings; they are contaminated and rarely reflect your task. Track three things: your own eval set's score, cost per successful request (not per call — failures cost money too), and p95 latency. If a model change does not move one of those, it is not an improvement.",
        },
      ],
    },
  ],

  theory: [
    "The four-stage pipeline: pretraining → SFT → reward modelling → alignment (RLHF/DPO), and what each stage is responsible for.",
    "Capability comes from pretraining; behaviour comes from post-training — which is why you cannot fine-tune in knowledge the model never had.",
    "SFT mechanics: same loss as pretraining, but masked to the response tokens only, rendered through the model's chat template.",
    "Why chat templates and special tokens are functional, not cosmetic — and why apply_chat_template() prevents a whole class of bugs.",
    "Pretraining data: sources and proportions, why code improves general reasoning, and why architectures converged while data recipes did not.",
    "The filtering pipeline: language ID → quality heuristics → model-based scoring → deduplication → decontamination → toxicity/PII.",
    "Why deduplication reduces memorisation by ~10× while improving perplexity.",
    "The data wall: finite high-quality public text, ~4-epoch repetition limit, synthetic data and model collapse, and test-time compute as an alternative axis.",
    "Decoding: greedy, beam search (and the likelihood trap), top-k, top-p/nucleus, min-p, repetition and frequency penalties.",
    "Why determinism is hard even at temperature 0 — non-associative floating point, batch-dependent reduction order, MoE routing.",
    "Speculative decoding: 2-3× speedup with provably identical output distribution, exploiting that verification is parallel and decoding is memory-bound.",
    "Context window: what shares the budget, why extending is hard (quadratic attention, linear KV-cache, positional extrapolation, data scarcity).",
    "How long-context models are made in practice: pretrain short → rescale RoPE → brief long-document continued pretraining → long-context instruction tuning.",
    "Long context vs RAG: the tradeoff table, and why the answer is 'both' — retrieval selects, a big window lets you retrieve generously.",
    "Mixture of Experts: per-token top-k routing over FFN experts, the load-balancing auxiliary loss, and why MoE saves compute but NOT memory.",
    "Hallucination as a structural property: the objective rewards plausibility, facts are lossily compressed, autoregression commits, and RLHF rewards confident phrasing.",
    "What actually mitigates hallucination (retrieval, citations, tools, self-consistency, permission to abstain, logprob checks) and what does not.",
    "Model selection: the three tiers, licence traps in 'open source', build-eval-first, prototype-high-then-walk-down, and routing.",
  ],

  math: [
    {
      title: "Top-p (nucleus) sampling",
      formula: "V' = smallest set where Σ(x∈V') P(x) ≥ p, then renormalise",
      note: "Adapts the candidate set to the shape of each distribution, unlike top-k's fixed count. p=0.9-0.95 is standard. For {A:.5,B:.3,C:.15,D:.05} with p=0.8, the nucleus is {A,B}.",
    },
    {
      title: "Perplexity",
      formula: "PPL = exp( -(1/N) Σ log P(xi | x<i) )",
      note: "The exponentiated average negative log-likelihood — the effective number of equally likely choices per token. Lower is better; not comparable across tokenizers.",
    },
    {
      title: "Chinchilla scaling law",
      formula: "L(N,D) ≈ E + A/N^α + B/D^β ; D ≈ 20N compute-optimal",
      note: "Loss as a function of parameters and tokens. E is the irreducible entropy of language. Production deliberately over-trains past D=20N because inference cost scales with N.",
    },
    {
      title: "MoE routing",
      formula: "g = softmax(x·W_router) ; y = Σ_(i∈top-k(g)) gi · Expert_i(x)",
      note: "Per-token, per-layer routing over FFN experts. Mixtral 8x7B: 8 experts, top-2, ~47B total but ~13B active. Memory is still 47B-sized.",
    },
    {
      title: "MoE load-balancing loss",
      formula: "L = L_LM + α · N · Σi fi · Pi",
      note: "fi = fraction of tokens routed to expert i, Pi = mean router probability. Minimised at uniform routing. α ≈ 0.01. Without it, routing collapses to a few experts.",
    },
    {
      title: "Context budget",
      formula: "context = system + history + retrieved + query + reserved_output",
      note: "Output shares the window with input. Failing to reserve output tokens produces truncated answers that look like model failures but are budgeting failures.",
    },
    {
      title: "Cost per request",
      formula: "cost = (in_tokens × price_in + out_tokens × price_out) / 1e6",
      note: "Output is typically 3-5× the input price because generation is sequential and memory-bound. Prompt caching can cut repeated-prefix input cost by up to ~90%.",
    },
  ],

  practice: [
    { type: "theory", q: "Describe the four-stage pipeline (pretraining, SFT, reward modelling, RLHF/DPO) and what each stage is responsible for." },
    { type: "theory", q: "A model gives correct information in the wrong format. Which training stage is at fault? What if it is confidently wrong instead?" },
    { type: "theory", q: "Why is the SFT loss masked to response tokens only, and what happens if you get the mask wrong?" },
    { type: "theory", q: "Two labs have identical architectures and identical compute. Why would one model be better? Name at least four data-side factors." },
    { type: "theory", q: "Why does including code in the pretraining mix improve performance on non-code reasoning benchmarks?" },
    { type: "theory", q: "Why is beam search good for translation but bad for open-ended chat? Name the phenomenon." },
    { type: "theory", q: "Explain why setting temperature=0 does not guarantee identical outputs across runs on a hosted API." },
    { type: "theory", q: "Explain speculative decoding and why it is exact rather than an approximation." },
    { type: "theory", q: "Explain why hallucination is a consequence of the training objective rather than a patchable bug — and why RLHF can make calibration worse." },
    { type: "theory", q: "What is Mixture-of-Experts, and why does it reduce compute per token but NOT memory requirements?" },
    { type: "theory", q: "Has long context made RAG obsolete? Argue both sides, then give your actual recommendation." },
    { type: "math", q: "Given probabilities {A:0.5, B:0.3, C:0.15, D:0.05}, which tokens are kept under top-p with p=0.8? What are the renormalised probabilities? How does this differ from top-k=3?" },
    { type: "math", q: "A model assigns average per-token log-likelihood of -0.4 (natural log) on a test set. Compute its perplexity." },
    { type: "math", q: "Mixtral 8x7B has 8 experts with top-2 routing and ~47B total parameters. Why is it not 56B, and what are the active parameters per token? What GPU memory does it need in FP16?" },
    { type: "math", q: "A RAG request sends 6,000 input tokens and generates 400 output tokens at $3/1M in and $15/1M out. Compute the cost. Then recompute if prompt caching makes 5,000 of the input tokens cost 10% of the normal rate." },
    { type: "math", q: "You have an 8k context window, a 400-token system prompt, and need 800 tokens of output. Each retrieved chunk is 500 tokens and the user query averages 100. What is your maximum top_k?" },
    { type: "theory", q: "A 7B model trained on 1T tokens vs a 70B model trained on 300B tokens — using the ~20 tokens/parameter Chinchilla heuristic, which is closer to compute-optimal, and which error is worse in production?" },
  ],

  resources: [
    { label: "Brown et al. 2020 — Language Models are Few-Shot Learners (GPT-3)", url: "https://arxiv.org/abs/2005.14165", kind: "paper" },
    { label: "Ouyang et al. 2022 — Training LMs to follow instructions (InstructGPT/RLHF)", url: "https://arxiv.org/abs/2203.02155", kind: "paper" },
    { label: "Hoffmann et al. 2022 — Chinchilla scaling laws", url: "https://arxiv.org/abs/2203.15556", kind: "paper" },
    { label: "Holtzman et al. 2019 — The Curious Case of Neural Text Degeneration (nucleus sampling)", url: "https://arxiv.org/abs/1904.09751", kind: "paper" },
    { label: "Leviathan et al. 2022 — Fast Inference via Speculative Decoding", url: "https://arxiv.org/abs/2211.17192", kind: "paper" },
    { label: "Jiang et al. 2024 — Mixtral of Experts", url: "https://arxiv.org/abs/2401.04088", kind: "paper" },
    { label: "Fedus et al. 2021 — Switch Transformers (MoE at scale)", url: "https://arxiv.org/abs/2101.03961", kind: "paper" },
    { label: "Lee et al. 2021 — Deduplicating Training Data Makes LMs Better", url: "https://arxiv.org/abs/2107.06499", kind: "paper" },
    { label: "Penedo et al. 2024 — FineWeb: decanting the web for the finest text data", url: "https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1", kind: "blog" },
    { label: "Gekhman et al. 2024 — Does Fine-Tuning LLMs on New Knowledge Encourage Hallucinations?", url: "https://arxiv.org/abs/2405.05904", kind: "paper" },
    { label: "mlabonne/llm-course — roadmaps and Colab notebooks", url: "https://github.com/mlabonne/llm-course", kind: "repo" },
    { label: "Raschka — Build a Large Language Model (From Scratch)", url: "https://github.com/rasbt/LLMs-from-scratch", kind: "repo" },
  ],
};

export default m05;
