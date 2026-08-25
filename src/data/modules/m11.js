const m11 = {
  id: "m11",
  week: 11,
  hours: 8,
  title: "Prompt Engineering & Fine-Tuning (LoRA, QLoRA, RLHF, DPO)",
  tag: "Adaptation",
  why: "Not every problem needs fine-tuning — but you need to know precisely when prompting is enough vs when you need PEFT vs when you need full fine-tuning/alignment, which is a very common interview question.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "Prompt engineering that actually works",
      summary: "Past the listicles: the techniques with measurable effects and the reasons they work.",
      blocks: [
        {
          t: "p",
          text: "Prompt engineering has a bad reputation because most of what is written about it is superstition — \"take a deep breath\", \"you are a world-class expert\", tipping the model. Some of these had measurable effects on specific 2023 models and do not replicate. The techniques below are the ones with a mechanism behind them.",
        },
        { t: "h", text: "The techniques that hold up" },
        {
          t: "steps",
          items: [
            {
              title: "1. Be specific about the output you want",
              text: "Not \"summarise this\" but \"summarise this in exactly three bullet points, each under 20 words, focused on financial implications\". The model is sampling from a distribution of plausible continuations; every constraint you add narrows that distribution toward what you actually want.",
            },
            {
              title: "2. Give examples (few-shot)",
              text: "The most reliable single technique. Two or three examples of input→output communicate format, tone, and edge-case handling far more precisely than a paragraph of description. Make sure your examples cover the tricky cases, because the model will imitate their distribution — including their mistakes.",
            },
            {
              title: "3. Put instructions before the data, and repeat critical constraints after",
              text: "For long inputs, attention favours the beginning and end (Module 4). Instructions at the top set the frame; a short restatement at the bottom sits closest to generation.",
            },
            {
              title: "4. Give the model an out",
              text: "\"If the information isn't available, say so.\" Without permission to fail, the model's implicit objective is to produce an answer, so it constructs one (Modules 5 and 9)."
            },
            {
              title: "5. Ask for reasoning before the answer, not after",
              text: "Because generation is autoregressive, tokens produced after the answer cannot influence it. Reasoning must come first to do any work. This is not a style preference — it is a consequence of the architecture.",
            },
            {
              title: "6. Use delimiters and structure",
              text: "XML-ish tags or clear markers separate instructions from data unambiguously. This also matters for security: it is the first line of defence against injected instructions in retrieved content.",
            },
          ],
        },
        {
          t: "code",
          lang: "text",
          caption: "Before and after",
          code: `WEAK:
  Summarize this document and tell me if it's risky.
  [50,000 characters of contract]

STRONG:
  You are reviewing a vendor contract for a procurement team.

  Analyse the contract below and produce:
  1. A 3-bullet summary of the commercial terms.
  2. Any clause that creates unlimited liability, quoted verbatim.
  3. A risk rating: LOW / MEDIUM / HIGH, with one sentence of
     justification.

  If a section is ambiguous, say so rather than guessing.

  <contract>
  [50,000 characters of contract]
  </contract>

  Remember: quote liability clauses verbatim and give an explicit
  risk rating.`,
        },
        { t: "h", text: "Zero-shot, few-shot, and what few-shot is really doing" },
        {
          t: "p",
          text: "Zero-shot is instruction only. Few-shot adds demonstrations. Modern instruction-tuned models are strong zero-shot, so few-shot matters most when the output format is unusual, the task is subjective, or edge cases need demonstrating.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Few-shot examples teach format more than content",
          text: "A striking result from Min et al. (2022): replacing few-shot examples' labels with *random* labels barely hurts performance, as long as the label *space* and the input distribution are preserved. What the model mostly extracts is \"this is the shape of the task and these are the allowed answers\", not \"here is the correct mapping\". Practical implication: invest your effort in covering the format and the range of possible outputs, and worry less about whether every example is perfectly labelled.",
        },
        { t: "h", text: "Structured output" },
        {
          t: "list",
          items: [
            "**Native structured output / tool schemas** — the model is constrained to produce valid JSON matching your schema. Always prefer this where the provider supports it (Module 10).",
            "**Constrained decoding** — libraries like Outlines and llama.cpp's grammars mask invalid tokens at each step, making malformed output impossible rather than unlikely. Available when you control inference.",
            "**Prompt-and-validate** — ask for JSON, parse, and retry with the validation error on failure. The fallback when neither of the above is available.",
            "**Do not** ask for JSON and hope. Models add prose, wrap output in code fences, and trail commas. If you find yourself writing regexes to extract JSON, you are using the wrong mechanism.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Prompts are not portable",
          text: "A prompt tuned for one model family frequently underperforms on another, and even on a newer version of the same model. Different post-training makes them respond differently to the same instructions. Version your prompts, tie them to a model version, and re-evaluate on every model change. Treating a prompt as a stable artefact is a reliable way to be surprised.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "Chain-of-thought and its descendants",
      summary: "Why writing out reasoning improves accuracy, and the family of techniques built on that fact.",
      blocks: [
        {
          t: "p",
          text: "Ask a model \"what is 17 × 23?\" and it must produce the answer in a single forward pass. Ask it to work step by step and it can compute 17 × 20 = 340, then 17 × 3 = 51, then add. Accuracy improves dramatically, and the reason is architectural rather than psychological.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Chain-of-thought buys computation, not insight",
          text: "A transformer performs a fixed amount of computation per token — depth × width, and no more. There is no loop inside the forward pass. For a problem needing 10 sequential reasoning steps, one token's worth of compute is simply not enough. Generating intermediate tokens gives the model *more forward passes*, using its own output as a scratchpad. This is why CoT helps enormously on multi-step arithmetic and logic and barely at all on single-fact lookup — the latter never needed the extra compute.",
        },
        { t: "h", text: "The variants" },
        {
          t: "table",
          head: ["Technique", "Mechanism", "Cost", "Best for"],
          rows: [
            ["Zero-shot CoT", "Append \"Let's think step by step\"", "Longer output", "Quick win on reasoning tasks"],
            ["Few-shot CoT", "Show examples that include reasoning", "Longer prompt", "Domain-specific reasoning patterns"],
            ["Self-consistency", "Sample n reasoning paths, majority-vote the answer", "n× calls", "Arithmetic and logic with a checkable final answer"],
            ["Tree of Thoughts", "Explore and prune a tree of partial solutions", "Very high", "Search problems, planning, puzzles"],
            ["Least-to-most", "Decompose into subproblems, solve in order", "Several calls", "Compositional problems"],
            ["Step-back", "Ask a general question first, then the specific one", "2 calls", "Questions needing background principles"],
            ["Program-of-thought", "Generate code, execute it, use the result", "Call + execution", "Anything numerical — strictly better than mental arithmetic"],
          ],
        },
        { t: "h", text: "Self-consistency" },
        {
          t: "p",
          text: "Sample the same question several times at temperature ~0.7, take the majority answer. It works because there are many wrong paths and they disagree with each other, while correct reasoning tends to converge. Errors are diffuse; correctness is concentrated.",
        },
        {
          t: "math",
          formula: "accuracy_vote ≥ accuracy_single  when errors are independent and p > 1/k",
          note: "The standard ensemble argument. If each sample is right with probability p and wrong answers are scattered across many alternatives, majority voting over n samples converges toward the mode. Gains are largest when single-sample accuracy is moderate — around 50–70%. Above ~90% there is little left to gain and you are paying n× for noise.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Sample disagreement is a free uncertainty signal",
          text: "Beyond improving accuracy, the *spread* of answers is informative. Five samples agreeing means the model is confident; five different answers means it is guessing. This is one of the few practical uncertainty estimates available for LLMs, and it underpins hallucination detectors like SelfCheckGPT (Module 5). If you are already sampling for self-consistency, you get the confidence signal at no extra cost — use it to trigger escalation or abstention.",
        },
        { t: "h", text: "Program-of-thought: the one to reach for on numbers" },
        {
          t: "code",
          lang: "text",
          caption: "Do not ask a language model to be a calculator",
          code: `PROMPT:
  Compute the compound annual growth rate from $2.4M to $7.1M
  over 5 years. Write Python, then give the result.

MODEL:
  \`\`\`python
  start, end, years = 2.4e6, 7.1e6, 5
  cagr = (end / start) ** (1 / years) - 1
  print(f"{cagr:.4%}")
  \`\`\`

EXECUTED: 24.2938%

Why this is strictly better than mental arithmetic:
  * Tokenization mangles numbers (Module 3), so digit-level
    arithmetic is fighting the representation.
  * Code is verifiable — you can read and re-run it.
  * The failure mode is an exception, not a plausible wrong number.
Whenever precision matters, generate code or call a tool (Module 16).`,
        },
        { t: "h", text: "Reasoning models change the calculus" },
        {
          t: "p",
          text: "Models trained specifically to reason — using RL on verifiable outcomes — generate extended internal chains of thought before answering. For these, much of the manual CoT prompting above is redundant or actively harmful.",
        },
        {
          t: "list",
          items: [
            "**Do not add \"think step by step\"** — they already do, and forcing a shorter external chain can interfere with the trained behaviour.",
            "**Prefer clear problem statements over elaborate technique.** State the goal, the constraints, and the output format, then get out of the way.",
            "**Cost and latency change shape.** Reasoning tokens are billed and can be many times the visible output. Budget accordingly.",
            "**Use them selectively.** For extraction, classification, and formatting, a fast non-reasoning model is cheaper and just as good. Routing by task type is the practical pattern.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The chain of thought is not necessarily the real reason",
          text: "Faithfulness research shows models can produce reasoning that does not reflect what actually drove the answer — including cases where a hint changes the answer but is never mentioned in the reasoning. Treat visible reasoning as useful, checkable output, not as an audit trail of the computation. This matters if you are relying on CoT for explainability in a regulated setting.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 14,
      title: "Prompt, RAG, or fine-tune? The decision framework",
      summary: "The most common interview question in applied GenAI, and the most common expensive mistake in practice.",
      blocks: [
        {
          t: "p",
          text: "Teams reach for fine-tuning far too early. It is expensive, slow to iterate, hard to update, and frequently solves a problem the team did not have. The decision is usually straightforward once you ask what kind of gap you are closing.",
        },
        { t: "h", text: "Diagnose the gap first" },
        {
          t: "table",
          head: ["The model lacks…", "That is a gap in…", "Use"],
          rows: [
            ["Facts about your data", "Knowledge", "RAG"],
            ["Current information", "Knowledge", "RAG or tools"],
            ["A consistent output format", "Behaviour", "Prompting first, then fine-tune if still inconsistent"],
            ["Your house tone or style", "Behaviour", "Fine-tune (after trying a strong system prompt)"],
            ["Domain vocabulary and idiom", "Behaviour", "Fine-tune"],
            ["A reasoning strategy", "Technique", "Prompting (CoT, decomposition) or a reasoning model"],
            ["Access to live systems", "Capability", "Tools / function calling"],
            ["Raw capability on hard tasks", "Capability", "A bigger model — fine-tuning will not create it"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The one-line rule",
          text: "**Fine-tune for behaviour, retrieve for knowledge, prompt for technique, use tools for capability.** Almost every misapplication of fine-tuning is someone trying to teach facts with it — which is expensive, does not update, cannot cite, and measurably increases hallucination (Module 5).",
        },
        { t: "h", text: "The escalation ladder" },
        {
          t: "steps",
          items: [
            { title: "1. Better prompt", text: "Hours. Free. Try specificity, few-shot examples, structured output, and CoT. Measure on your eval set. Astonishingly often, this is where it ends." },
            { title: "2. Better model", text: "Minutes to test. A stronger model often eliminates the problem entirely, and its cost is frequently less than the engineering time you would spend avoiding it." },
            { title: "3. RAG", text: "Days. The right answer for every knowledge gap. Also cheaper to iterate than fine-tuning by an order of magnitude." },
            { title: "4. Tools", text: "Days. For anything requiring computation, live data, or actions." },
            { title: "5. LoRA fine-tune", text: "Days to weeks, including dataset construction. Now worth it if behaviour is still wrong after all of the above, and you have 500+ good examples." },
            { title: "6. Full fine-tune or continued pretraining", text: "Weeks and serious compute. Justified for genuinely new domains — a low-resource language, a specialised notation, a scientific modality — not for tone." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The hidden costs of fine-tuning",
          text: "The training run is often the cheapest part. You also own: dataset construction and cleaning (usually the dominant cost), an evaluation set to prove it helped, model hosting (a fine-tuned model rarely runs on a shared serverless endpoint), version management, and re-doing all of it when the base model is deprecated in nine months. Weigh that against a prompt change you can ship in an afternoon.",
        },
        { t: "h", text: "When fine-tuning genuinely wins" },
        {
          t: "list",
          items: [
            "**Consistent structured output at scale.** A fine-tuned small model producing your exact schema, reliably, at a fraction of the cost of a large model with a long prompt.",
            "**Distillation.** Use a large model to generate high-quality outputs, fine-tune a small model on them. Frequently 10–50× cheaper inference at close to the same quality on your specific task. This is one of the strongest arguments for fine-tuning.",
            "**Prompt compression.** If every call carries a 2,000-token instruction block, fine-tuning that behaviour in removes it from every request forever. At high volume this pays for itself quickly.",
            "**Style and tone that resists instruction.** Legal, medical, and brand voice are often easier to demonstrate than to describe.",
            "**Latency.** A fine-tuned 3B model responding in 200ms versus a 70B model in 2s can be the difference between a usable product and an unusable one.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"How do you decide between prompting, RAG, and fine-tuning?\" Give the four-way rule (behaviour / knowledge / technique / capability), then the escalation ladder, then the discriminating point: fine-tuning on new facts increases hallucination, so knowledge gaps go to retrieval regardless of how tempting a fine-tune looks. Naming distillation and prompt compression as the strongest *pro*-fine-tuning cases shows you are not just reciting a caution.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 14,
      title: "Supervised fine-tuning and the data that decides it",
      summary: "The mechanics are easy. The dataset is the whole job.",
      blocks: [
        {
          t: "p",
          text: "SFT is the same next-token loss as pretraining, on curated (instruction, response) pairs, with the loss masked to the response (Module 5). The training code is largely solved — TRL, Axolotl, Unsloth, and LLaMA-Factory all handle it. Everything that determines whether it works is upstream, in the data.",
        },
        { t: "h", text: "Quality dominates quantity" },
        {
          t: "note",
          tone: "insight",
          title: "The LIMA result",
          text: "Meta's LIMA fine-tuned Llama-65B on just **1,000** carefully curated examples and matched or beat models trained on 52,000 noisier ones. The interpretation — the \"superficial alignment hypothesis\" — is that pretraining already contains the capability, and SFT mostly teaches the model which of its existing behaviours to surface. You are selecting a mode, not installing a skill. This reframes dataset work from collection to curation.",
        },
        {
          t: "table",
          head: ["Dataset size", "Realistic expectation"],
          rows: [
            ["< 100", "Not enough. Use few-shot prompting instead."],
            ["100 – 500", "Viable for a narrow, well-defined format task with LoRA."],
            ["500 – 5,000", "The sweet spot for most applied fine-tuning."],
            ["5,000 – 50,000", "Multi-task, or broad domain adaptation."],
            ["> 50,000", "You are doing general instruction tuning; ensure diversity, not just volume."],
          ],
        },
        { t: "h", text: "Building the dataset" },
        {
          t: "steps",
          items: [
            { title: "1. Prefer real examples", text: "Production logs, historical support tickets, existing human-written documents. Real inputs have a distribution you cannot invent." },
            { title: "2. Distil from a stronger model", text: "Generate responses with a frontier model, then human-review. Far faster than writing from scratch and usually higher quality than crowdsourcing. Check the provider's terms on training from outputs." },
            { title: "3. Diversify deliberately", text: "Vary length, difficulty, phrasing, and topic. A dataset of 2,000 near-identical examples teaches one narrow behaviour and generalises poorly." },
            { title: "4. Include the hard cases", text: "Ambiguous inputs, requests the model should refuse, questions with no answer, adversarial phrasings. If refusal is not in the training data, the model will not learn to refuse." },
            { title: "5. Deduplicate and decontaminate", text: "Near-duplicates cause memorisation. Anything overlapping your eval set makes the evaluation meaningless (Modules 1 and 5)." },
            { title: "6. Read a random sample by hand", text: "One hundred examples, personally. You will find truncated responses, wrong formats, and leaked template artefacts. Nothing substitutes for this." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The three bugs that silently ruin an SFT run",
          text: "**Wrong loss mask** — training on prompt tokens teaches the model to generate user turns. **Wrong chat template** — a mismatch with the base model's format degrades everything and breaks stop tokens. **Truncation** — examples longer than max_seq_length are silently cut, teaching the model to stop mid-sentence. Verify all three by decoding a few tokenized training examples before you launch. Ten minutes now, days saved later.",
        },
        { t: "h", text: "Catastrophic forgetting" },
        {
          t: "p",
          text: "Train hard on a narrow dataset and the model gets better at that task and worse at everything else — including capabilities you were relying on, like following instructions or refusing harmful requests. The mechanism is simply that gradient descent moves weights toward the new distribution with no memory of the old one.",
        },
        {
          t: "list",
          items: [
            "**Use LoRA rather than full fine-tuning.** Far fewer changed parameters means far less forgetting, and it is the main practical mitigation.",
            "**Low learning rate, few epochs.** 1–3 epochs is typical; 10 epochs on a small dataset is how you memorise and forget simultaneously.",
            "**Mix in general instruction data.** 5–20% of a general dataset alongside your domain data measurably preserves broad capability.",
            "**Evaluate broadly, not just on the target task.** Hold out a general benchmark. A fine-tune that improves your metric by 10 points and drops instruction-following by 20 is a regression you shipped.",
          ],
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 18,
      title: "LoRA and QLoRA",
      summary: "The technique that turned fine-tuning from a data-centre activity into something you can do on one GPU.",
      blocks: [
        {
          t: "p",
          text: "From Module 2: full fine-tuning needs roughly 16 bytes per parameter for weights, gradients, and Adam state. That is ~112 GB for a 7B model, before activations — more than a single 80 GB GPU. LoRA changes that arithmetic completely.",
        },
        { t: "h", text: "The idea" },
        {
          t: "math",
          formula: "W' = W + ΔW = W + BA     where B ∈ ℝ^{d×r}, A ∈ ℝ^{r×k}, r ≪ min(d,k)",
          note: "Freeze the pretrained W entirely. Learn the *update* as the product of two thin matrices. Rank r is typically 8–64. At inference you can either add BA into W (zero added latency) or keep it separate (swappable adapters).",
        },
        {
          t: "note",
          tone: "insight",
          title: "Why a low-rank update is enough",
          text: "The LoRA paper's premise is that the weight *change* required to adapt a pretrained model to a downstream task has low intrinsic rank — you are nudging an existing capability, not building a new one. This dovetails exactly with LIMA's superficial alignment hypothesis from the previous lesson: if fine-tuning is mode selection rather than skill installation, a low-rank nudge should suffice. Empirically it does, which is good evidence for both claims.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example — one 4096×4096 attention matrix", text: "Full fine-tuning: 4096 × 4096 = 16,777,216 trainable parameters." },
            { title: "LoRA at r = 16", text: "A is 16×4096 and B is 4096×16, so r(d+k) = 16 × 8192 = 131,072 parameters." },
            { title: "Reduction", text: "16,777,216 / 131,072 = **128×** fewer trainable parameters for that matrix." },
            { title: "At r = 8", text: "65,536 parameters — a 256× reduction. Across a whole 7B model, LoRA typically trains 0.1–1% of the parameters." },
          ],
        },
        { t: "h", text: "Why the memory saving is larger than it first looks" },
        {
          t: "table",
          head: ["Component", "Full FT (7B, BF16 + AdamW)", "LoRA (r=16, ~20M trainable)"],
          rows: [
            ["Base weights", "14 GB (BF16)", "14 GB — frozen, but still resident"],
            ["FP32 master copy", "28 GB", "~0.08 GB (adapters only)"],
            ["Gradients", "14 GB", "~0.04 GB"],
            ["Adam state (m, v)", "56 GB", "~0.16 GB"],
            ["**Total static**", "**~112 GB**", "**~14.3 GB**"],
          ],
        },
        {
          t: "p",
          text: "The saving comes overwhelmingly from optimiser state. Adam stores two moments per *trainable* parameter, so cutting trainable parameters by 100× cuts optimiser memory by 100×. The frozen base weights still have to be loaded — which is exactly the gap QLoRA closes.",
        },
        { t: "h", text: "QLoRA" },
        {
          t: "p",
          text: "QLoRA quantises the frozen base model to 4 bits while training LoRA adapters in 16-bit on top. Three contributions make it work rather than merely compress:",
        },
        {
          t: "list",
          items: [
            "**NF4 (4-bit NormalFloat)** — a data type whose quantisation levels are information-theoretically optimal for normally-distributed data, which pretrained weights approximately are. Better than naive int4 at the same bit width.",
            "**Double quantisation** — quantise the quantisation constants themselves, saving a further ~0.37 bits per parameter.",
            "**Paged optimisers** — use NVIDIA unified memory to page optimiser state to CPU RAM during memory spikes, preventing OOM crashes on long sequences.",
          ],
        },
        {
          t: "p",
          text: "The result: base weights drop from 14 GB to ~3.5 GB, and a 7B fine-tune fits comfortably on a 16 GB consumer GPU. A 70B fine-tune fits on a single 48 GB card. The paper's Guanaco models showed near-full-fine-tuning quality, which is why QLoRA became the default for anyone without a cluster.",
        },
        {
          t: "note",
          tone: "warn",
          title: "QLoRA's cost is speed, not quality",
          text: "Weights must be dequantised on the fly for every forward and backward pass, so QLoRA typically runs 20–40% slower than plain LoRA. You are trading time for memory. If the model fits in BF16, use LoRA. Use QLoRA when it does not.",
        },
        { t: "h", text: "Tuning LoRA" },
        {
          t: "table",
          head: ["Hyperparameter", "Typical", "Guidance"],
          rows: [
            ["r (rank)", "8 – 64", "Start at 16. Raise for larger or more diverse datasets; higher r rarely helps small datasets and increases overfitting risk."],
            ["alpha", "16 – 32", "Scaling is alpha/r. The common convention is alpha = 2r; keep the ratio fixed when you change r."],
            ["target_modules", "All linear layers", "The original paper adapted only q and v. Later work found adapting all linear layers (including the MLP) is consistently better. Default to all."],
            ["dropout", "0 – 0.1", "0.05 is a reasonable default for small datasets; 0 for large ones."],
            ["learning rate", "1e-4 – 2e-4", "Roughly 10× higher than full fine-tuning, because you are training far fewer parameters."],
            ["epochs", "1 – 3", "More than 3 on a small dataset usually memorises. Watch validation loss."],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The operational superpower: swappable adapters",
          text: "A LoRA adapter is tens of megabytes, not tens of gigabytes. So you can serve one base model in GPU memory and hot-swap adapters per request — one for summarisation, one per customer, one per language. Frameworks like vLLM support multi-LoRA serving with hundreds of adapters against a single base. This changes the economics of per-customer customisation entirely, and it is impossible with full fine-tuning.",
        },
        {
          t: "list",
          items: [
            "**DoRA** decomposes the update into magnitude and direction, adapting each separately; consistently slightly better than LoRA at the same rank.",
            "**rsLoRA** rescales by alpha/√r rather than alpha/r, which makes higher ranks actually help instead of plateauing.",
            "**LoRA+** uses a higher learning rate for B than A, improving convergence.",
            "**Adapters can be merged** back into base weights for zero inference overhead — at the cost of losing swappability.",
          ],
        },
      ],
    },

    {
      id: "l6",
      level: "core",
      minutes: 16,
      title: "RLHF and DPO",
      summary: "How preferences become gradients, and why DPO replaced a three-model reinforcement-learning pipeline with one loss function.",
      blocks: [
        {
          t: "p",
          text: "SFT teaches imitation of demonstrations. But for open-ended questions there is no single correct response, and writing ideal demonstrations at scale is expensive. Humans find it far easier to *compare* two responses than to author the best one. Preference learning converts that comparison signal into a training gradient.",
        },
        { t: "h", text: "The RLHF pipeline" },
        {
          t: "steps",
          items: [
            { title: "1. Start from an SFT model", text: "It must already produce reasonable responses. RLHF refines; it cannot bootstrap." },
            { title: "2. Collect preferences", text: "Sample two responses per prompt, have a human pick the better. Tens to hundreds of thousands of comparisons." },
            { title: "3. Train a reward model", text: "Typically the LLM with a scalar head, trained so that r(chosen) > r(rejected)." },
            { title: "4. Optimise the policy with PPO", text: "Generate responses, score with the reward model, update the policy to increase expected reward — subject to a KL penalty against the SFT model." },
          ],
        },
        {
          t: "math",
          formula: "L_RM = − log σ( r(x, y_w) − r(x, y_l) )",
          note: "The Bradley-Terry preference model. y_w is the chosen response, y_l the rejected one. Minimising this maximises the probability that the reward model ranks the pair the way the human did. Note the model learns a *relative* score; the absolute scale is arbitrary.",
        },
        {
          t: "math",
          formula: "objective = E[ r(x,y) ] − β · KL( π_θ ‖ π_ref )",
          note: "Maximise reward while staying close to the reference (SFT) policy. The KL term is essential: without it the policy drifts into degenerate text that scores highly on the reward model and is unreadable to humans — reward hacking.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Why RLHF is painful in practice",
          text: "You must hold **four** models in memory simultaneously — policy, reference, reward, and PPO's value head. It is unstable and sensitive to hyperparameters. Reward hacking is a constant threat (the classic symptom: responses become uniformly long and hedged, because human raters mildly prefer thorough-looking answers). And debugging an RL run is much harder than debugging supervised training. This difficulty is precisely why DPO caught on so fast.",
        },
        { t: "h", text: "DPO: skip the reward model entirely" },
        {
          t: "p",
          text: "Rafailov et al. showed that the optimal policy under the KL-constrained RLHF objective has a closed form in terms of the reward — which can be inverted to express the reward in terms of the policy. Substituting that into the Bradley-Terry loss eliminates the reward model altogether.",
        },
        {
          t: "math",
          formula: "L_DPO = − log σ( β [ log(π_θ(y_w|x)/π_ref(y_w|x)) − log(π_θ(y_l|x)/π_ref(y_l|x)) ] )",
          note: "Increase the policy's log-probability of the preferred response relative to the reference, and decrease it for the dispreferred one. No reward model, no sampling loop, no RL — it is a supervised loss over preference pairs. β (typically 0.1–0.5) plays the role of the KL coefficient.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The clean way to state DPO's contribution",
          text: "\"Your language model is secretly a reward model.\" The policy's log-probability ratio against the reference *is* an implicit reward. Once you see that, the entire reward-model-plus-PPO apparatus is revealed as an indirect route to a gradient you can compute directly. Two models in memory instead of four, standard supervised training, and vastly easier debugging.",
        },
        {
          t: "table",
          head: ["", "RLHF (PPO)", "DPO"],
          rows: [
            ["Models in memory", "4", "2 (policy + frozen reference)"],
            ["Training type", "Online RL with sampling", "Offline supervised on pairs"],
            ["Stability", "Finicky", "Stable"],
            ["Can exceed the preference data?", "Yes — explores new responses", "No — bounded by the pairs you have"],
            ["Compute", "High", "Comparable to SFT"],
            ["Used by", "InstructGPT, early ChatGPT, Llama-2", "Zephyr, Tulu, most open post-training"],
          ],
        },
        {
          t: "p",
          text: "That fourth row is the real tradeoff. PPO generates new responses and gets them scored, so it can discover behaviours absent from the dataset. DPO only reweights responses it was given. For frontier alignment, online methods still have an edge — which is why online DPO, RLAIF, and GRPO variants exist, reintroducing sampling while keeping DPO's simplicity.",
        },
        { t: "h", text: "The rest of the family" },
        {
          t: "list",
          items: [
            "**IPO** — fixes a DPO overfitting failure where the loss keeps pushing the margin apart long after the preference is satisfied.",
            "**KTO** — needs only binary good/bad labels rather than pairs, which is far easier to collect from production thumbs-up/down data.",
            "**ORPO** — combines SFT and preference optimisation in a single stage with no reference model, simplifying the pipeline further.",
            "**GRPO** — drops the value network by normalising rewards within a group of sampled responses; central to recent reasoning-model training on verifiable tasks.",
            "**RLAIF / Constitutional AI** — replace human labellers with a model judging against written principles. Cheaper, more consistent, and scalable; inherits the judge's biases."
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Where RL is genuinely winning right now",
          text: "For *reasoning*, RL against automatically verifiable rewards — does the code pass the tests, is the maths answer correct — has been the biggest recent advance. There is no reward model and no human labelling, just ground truth. That removes reward hacking almost entirely, because the reward cannot be gamed by sounding good. It is the clearest current example that the bottleneck in RL is the reward signal, not the algorithm.",
        },
      ],
    },

    {
      id: "l7",
      level: "advanced",
      minutes: 14,
      title: "Running a fine-tune end to end",
      summary: "The practical checklist, the numbers to expect, and how to know whether it worked.",
      blocks: [
        {
          t: "p",
          text: "Everything above is theory. This is the procedure, in the order you should actually do it — and note that training is step 6 of 9.",
        },
        { t: "h", text: "The procedure" },
        {
          t: "steps",
          items: [
            { title: "1. Build the evaluation set first", text: "Before any training. 100+ examples with known-good outputs, plus hard and out-of-scope cases. Without this you cannot tell whether the fine-tune helped, and you will convince yourself it did." },
            { title: "2. Establish the baseline", text: "Score the base model with your best prompt. This is the number to beat, and surprisingly often it is already good enough." },
            { title: "3. Build and inspect the dataset", text: "500+ examples, diverse, deduplicated, decontaminated against your eval set. Read 100 by hand." },
            { title: "4. Choose the base model", text: "Smallest that plausibly works. Check the licence. Prefer an instruct-tuned checkpoint unless you are doing domain pretraining." },
            { title: "5. Verify the tokenized data", text: "Decode 3 examples. Confirm the chat template, the loss mask, and that nothing is truncated. This ten-minute check catches the three most expensive bugs." },
            { title: "6. Train", text: "LoRA r=16, alpha=32, all linear layers, lr 2e-4, 2 epochs, cosine schedule with warmup, BF16, gradient checkpointing. Hold out 5% for validation." },
            { title: "7. Watch validation loss", text: "Rising validation loss while training loss falls means overfitting — stop. Flat training loss means the learning rate is too low or the mask is wrong." },
            { title: "8. Evaluate against the baseline", text: "On the target task *and* on general capability. Report both. A win on one and a loss on the other is a tradeoff to decide consciously, not to discover in production." },
            { title: "9. Decide honestly", text: "If the gain over a good prompt is marginal, do not ship it. You would be taking on hosting, versioning, and maintenance for noise." },
          ],
        },
        { t: "h", text: "Numbers to expect" },
        {
          t: "table",
          head: ["Setup", "Hardware", "Rough time for 5k examples"],
          rows: [
            ["7B QLoRA, 2048 seq", "1× RTX 4090 (24 GB)", "2–4 hours"],
            ["7B LoRA, 2048 seq", "1× A100 (80 GB)", "1–2 hours"],
            ["13B QLoRA", "1× A100 (80 GB)", "3–5 hours"],
            ["70B QLoRA", "2× A100 (80 GB)", "12–24 hours"],
            ["7B full fine-tune", "8× A100", "2–4 hours"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The tooling worth knowing",
          text: "**TRL** (HuggingFace) — SFTTrainer, DPOTrainer, the reference implementations. **Axolotl** — YAML-configured fine-tuning; the standard for reproducible community recipes. **Unsloth** — heavily optimised kernels, roughly 2× faster with lower memory on single GPUs. **LLaMA-Factory** — broad model support with a UI. **PEFT** — the adapter library underneath most of these. Start with Axolotl or Unsloth for a first fine-tune; both remove a great deal of boilerplate.",
        },
        { t: "h", text: "Reading the loss curve" },
        {
          t: "table",
          head: ["Pattern", "Diagnosis", "Action"],
          rows: [
            ["Train ↓, val ↓", "Learning correctly", "Continue"],
            ["Train ↓, val ↑", "Overfitting", "Stop; fewer epochs, more data, lower rank"],
            ["Train flat and high", "Not learning", "Check the loss mask and chat template first; then raise LR"],
            ["Loss → NaN", "Numerical blow-up", "Lower LR, enable gradient clipping, check for BF16/FP16 mismatch"],
            ["Loss drops to ~0", "Memorisation or a data leak", "Check for duplicate or trivially-copied examples"],
            ["Spiky loss", "LR too high or batch too small", "Lower LR, increase gradient accumulation"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Loss is not quality",
          text: "A lower validation loss does not guarantee a better model for your users. It measures token-level likelihood on held-out examples of a particular style. Always confirm with task-level evaluation and by reading actual generations. A model can achieve excellent loss by learning to imitate your dataset's formatting quirks while being no more useful — and this failure is invisible on the curve.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Walk me through fine-tuning a model for our use case.\" The strongest possible opening is: \"First I'd build an eval set and check whether prompting already gets us there.\" Then the ladder, then LoRA specifics, then the honest ship/don't-ship decision. Leading with hyperparameters signals someone who has read about fine-tuning; leading with evaluation signals someone who has done it.",
        },
      ],
    },
  ],

  theory: [
    "Prompt engineering that replicates: specificity, few-shot examples, instruction placement, permission to abstain, reasoning-before-answer, delimiters.",
    "Why reasoning must precede the answer: autoregressive generation means tokens after the answer cannot influence it.",
    "What few-shot examples actually teach (format and label space) — Min et al.'s random-label result.",
    "Structured output: native schemas > constrained decoding > prompt-and-validate > never prompt-and-hope.",
    "Prompts are not portable across model families or versions; version them and re-evaluate on model changes.",
    "Chain-of-thought buys sequential computation, not insight — a transformer does fixed work per token and CoT adds forward passes.",
    "Why CoT helps arithmetic and logic but not single-fact lookup.",
    "The CoT family: zero-shot, few-shot, self-consistency, Tree of Thoughts, least-to-most, step-back, program-of-thought.",
    "Self-consistency as an ensemble: gains are largest at moderate single-sample accuracy, and sample disagreement is a free uncertainty signal.",
    "Program-of-thought: generate and execute code for anything numerical, because tokenization makes mental arithmetic fight the representation.",
    "Reasoning models change the calculus: do not add 'think step by step', budget for reasoning tokens, route by task type.",
    "Chain-of-thought is not necessarily faithful to the actual computation — a caution for explainability claims.",
    "The decision framework: fine-tune for behaviour, retrieve for knowledge, prompt for technique, tools for capability.",
    "The escalation ladder: better prompt → better model → RAG → tools → LoRA → full fine-tune.",
    "The hidden costs of fine-tuning: dataset construction, evaluation, hosting, versioning, and redoing it when the base model is deprecated.",
    "When fine-tuning genuinely wins: distillation, prompt compression, consistent structured output, resistant style, and latency.",
    "SFT mechanics and the LIMA result — 1,000 curated examples beating 52,000 noisy ones (the superficial alignment hypothesis).",
    "Dataset construction: real examples, distillation, deliberate diversity, hard and refusal cases, dedup and decontamination, manual inspection.",
    "The three silent SFT bugs: wrong loss mask, wrong chat template, silent truncation.",
    "Catastrophic forgetting and its mitigations: LoRA, low LR, few epochs, mixing general data, evaluating broadly.",
    "LoRA: W' = W + BA with r << d,k; why the memory saving comes overwhelmingly from optimizer state.",
    "Why a low-rank update suffices — the intrinsic-rank hypothesis, and its agreement with LIMA.",
    "QLoRA: NF4 quantisation, double quantisation, paged optimizers — trading 20-40% speed for a 4× reduction in base-weight memory.",
    "LoRA hyperparameters: r, alpha (alpha=2r convention), targeting all linear layers, ~10× higher LR than full fine-tuning.",
    "Swappable adapters and multi-LoRA serving — hundreds of per-customer adapters against one base model.",
    "LoRA variants: DoRA, rsLoRA, LoRA+, and merging for zero inference overhead.",
    "RLHF: Bradley-Terry reward modelling plus PPO with a KL penalty; four models in memory; reward hacking.",
    "DPO: 'your language model is secretly a reward model' — inverting the closed-form optimal policy removes the reward model and the RL loop.",
    "RLHF vs DPO: the key tradeoff is that PPO can explore beyond the preference data while DPO cannot.",
    "The preference-optimisation family: IPO, KTO, ORPO, GRPO, RLAIF/Constitutional AI.",
    "RL against verifiable rewards (code tests, maths answers) as the current frontier, because ground truth cannot be gamed.",
    "The end-to-end fine-tuning procedure: eval set FIRST, baseline, dataset, model choice, tokenization check, train, watch validation, evaluate broadly, decide honestly.",
    "Reading loss curves, and why low loss does not imply a better model for users.",
  ],

  math: [
    {
      title: "LoRA decomposition",
      formula: "W' = W + ΔW = W + B·A   (B∈ℝ^(d×r), A∈ℝ^(r×k), r << d,k)",
      note: "Freeze W, learn the low-rank update. r is typically 8-64. Merge BA into W at inference for zero latency overhead, or keep separate for swappable adapters.",
    },
    {
      title: "LoRA parameter count",
      formula: "params = r×(d+k)  vs full d×k",
      note: "For d=k=4096, r=16: 131,072 vs 16,777,216 — a 128× reduction on that matrix. Across a 7B model LoRA typically trains 0.1-1% of parameters.",
    },
    {
      title: "LoRA scaling",
      formula: "ΔW_effective = (alpha / r) · B·A",
      note: "alpha/r is the scaling factor. The common convention alpha = 2r keeps effective scale constant when you change rank. rsLoRA uses alpha/√r instead so higher ranks keep helping.",
    },
    {
      title: "Fine-tuning memory",
      formula: "full ≈ 16 bytes/param ; LoRA ≈ base_weights + 16 bytes/trainable_param",
      note: "7B full FT ≈ 112GB; 7B LoRA ≈ 14.3GB; 7B QLoRA ≈ 5GB. The saving comes from Adam state scaling with TRAINABLE parameters, not total.",
    },
    {
      title: "Bradley-Terry reward loss",
      formula: "L_RM = -log σ( r(x,yw) - r(x,yl) )",
      note: "Trains a reward model to rank chosen above rejected. Only relative scores are learned; the absolute scale is arbitrary.",
    },
    {
      title: "RLHF objective",
      formula: "max E[r(x,y)] - β · KL(πθ || πref)",
      note: "The KL term prevents reward hacking. Without it the policy drifts into degenerate text that scores well on the reward model and is unreadable.",
    },
    {
      title: "DPO loss",
      formula: "L = -log σ( β [log πθ(yw|x)/πref(yw|x) - log πθ(yl|x)/πref(yl|x)] )",
      note: "The log-probability ratio against the frozen reference IS an implicit reward. Two models instead of four, supervised instead of RL, β ≈ 0.1-0.5.",
    },
    {
      title: "Self-consistency",
      formula: "accuracy_vote ≥ accuracy_single when errors are independent and p > 1/k",
      note: "Majority voting over n sampled reasoning paths. Gains are largest at 50-70% single-sample accuracy; disagreement across samples doubles as an uncertainty signal.",
    },
  ],

  practice: [
    { type: "theory", q: "Give a decision framework: for a given problem, how do you decide between prompt engineering, RAG, tools, and fine-tuning? State the one-line rule." },
    { type: "theory", q: "Explain why chain-of-thought helps arithmetic and logic but barely helps single-fact lookup. Give the architectural reason." },
    { type: "theory", q: "Why must reasoning be generated before the answer rather than after?" },
    { type: "theory", q: "Explain the Min et al. random-label result for few-shot prompting and what it implies about how you should construct examples." },
    { type: "theory", q: "Explain self-consistency, when its gains are largest, and the second benefit you get beyond accuracy." },
    { type: "theory", q: "Why should you generate and execute code rather than asking the model to compute a number directly? Give two reasons, one of which relates to tokenization." },
    { type: "theory", q: "How does prompting a reasoning model differ from prompting a standard instruct model?" },
    { type: "theory", q: "Explain the LIMA result and the superficial alignment hypothesis. How does it connect to LoRA's low-rank premise?" },
    { type: "theory", q: "Name the three silent bugs that ruin an SFT run and the single check that catches all three." },
    { type: "theory", q: "What is catastrophic forgetting, and give four mitigations when fine-tuning on a narrow customer-support dataset." },
    { type: "theory", q: "Explain how LoRA reduces trainable parameters, and explain why the memory saving is much larger than the parameter reduction alone would suggest." },
    { type: "theory", q: "What does the 'Q' in QLoRA add, and what does it cost? Name its three technical contributions." },
    { type: "theory", q: "Explain multi-LoRA serving and why it changes the economics of per-customer model customisation." },
    { type: "theory", q: "Compare RLHF and DPO. What does DPO remove, what is the one-line statement of its insight, and what capability does it give up?" },
    { type: "theory", q: "Why is RL against verifiable rewards (unit tests, maths answers) less vulnerable to reward hacking than RLHF against a learned reward model?" },
    { type: "theory", q: "Why is a lower validation loss not sufficient evidence that your fine-tune improved the product?" },
    { type: "math", q: "For a weight matrix of shape 4096×4096, compute trainable parameters for full fine-tuning vs LoRA with r=16 and with r=8. State both reduction factors." },
    { type: "math", q: "Estimate GPU memory for full fine-tuning a 7B model in BF16 mixed precision with AdamW, broken down by component. Then estimate LoRA with 20M trainable parameters, then QLoRA." },
    { type: "math", q: "You have 3,000 training examples averaging 600 tokens. At 2 epochs with an effective batch of 32, how many optimiser steps? Roughly how many tokens does the model see in total?" },
    { type: "math", q: "With LoRA r=32 and the alpha=2r convention, what is the scaling factor applied to BA? What would rsLoRA use instead?" },
    { type: "theory", q: "Walk through fine-tuning a model end to end, in the order you would actually do it. What is step 1, and why is it step 1?" },
  ],

  resources: [
    { label: "Hu et al. 2021 — LoRA: Low-Rank Adaptation of Large Language Models", url: "https://arxiv.org/abs/2106.09685", kind: "paper" },
    { label: "Dettmers et al. 2023 — QLoRA: Efficient Finetuning of Quantized LLMs", url: "https://arxiv.org/abs/2305.14314", kind: "paper" },
    { label: "Rafailov et al. 2023 — Direct Preference Optimization", url: "https://arxiv.org/abs/2305.18290", kind: "paper" },
    { label: "Wei et al. 2022 — Chain-of-Thought Prompting", url: "https://arxiv.org/abs/2201.11903", kind: "paper" },
    { label: "Wang et al. 2022 — Self-Consistency Improves Chain of Thought Reasoning", url: "https://arxiv.org/abs/2203.11171", kind: "paper" },
    { label: "Zhou et al. 2023 — LIMA: Less Is More for Alignment", url: "https://arxiv.org/abs/2305.11206", kind: "paper" },
    { label: "Min et al. 2022 — Rethinking the Role of Demonstrations", url: "https://arxiv.org/abs/2202.12837", kind: "paper" },
    { label: "Ouyang et al. 2022 — InstructGPT (RLHF)", url: "https://arxiv.org/abs/2203.02155", kind: "paper" },
    { label: "HuggingFace TRL — SFT, DPO, GRPO trainers", url: "https://huggingface.co/docs/trl/", kind: "docs" },
    { label: "HuggingFace PEFT — LoRA, DoRA, adapters", url: "https://huggingface.co/docs/peft/", kind: "docs" },
    { label: "Axolotl — YAML-configured fine-tuning", url: "https://github.com/axolotl-ai-cloud/axolotl", kind: "repo" },
    { label: "Unsloth — 2× faster, lower-memory fine-tuning", url: "https://github.com/unslothai/unsloth", kind: "repo" },
    { label: "Anthropic — Prompt engineering overview", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", kind: "docs" },
  ],
};

export default m11;
