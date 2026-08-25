const m01 = {
  id: "m01",
  week: 1,
  hours: 8,
  title: "Math & ML Foundations for GenAI",
  tag: "Foundations",
  why: "Every GenAI concept (attention, embeddings, loss functions, fine-tuning) is linear algebra + probability + calculus in a trench coat. Skipping this makes everything later feel like magic instead of mechanism.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "From text to tensors: the shape of everything",
      summary: "How a sentence becomes a block of numbers, and why every bug you will ever hit is a shape bug.",
      blocks: [
        {
          t: "p",
          text: "A neural network cannot read. It can only multiply and add. So the very first thing any language model does is convert text into numbers — and the very last thing it does is convert numbers back into text. Everything in between is arithmetic on rectangular blocks of numbers. If you internalise the *shapes* of those blocks, most of GenAI stops being mysterious.",
        },
        { t: "h", text: "The four objects you need" },
        {
          t: "list",
          items: [
            "**Scalar** — a single number. `0.42`. Shape: `()`. A loss value is a scalar.",
            "**Vector** — an ordered list of numbers. `[0.1, -0.3, 0.8]`. Shape: `(3,)`. One token's embedding is a vector.",
            "**Matrix** — a grid of numbers, rows × columns. Shape: `(4, 3)`. A sentence of 4 tokens, each a 3-dimensional vector, is a matrix.",
            "**Tensor** — the general term for an n-dimensional array. Shape `(2, 4, 3)` = two sentences, each 4 tokens, each token 3 numbers.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "A tensor is just a nested list with a promise",
          text: "The promise is that it is *rectangular*: every row has the same length, every sentence in a batch has the same number of tokens. That promise is why GPUs can process it in parallel — and it is why padding and attention masks exist, since real sentences have different lengths.",
        },
        { t: "h", text: "The canonical LLM shape: (batch, sequence, hidden)" },
        {
          t: "p",
          text: "Almost every intermediate value inside a transformer has the shape `(B, T, C)`. You will see this notation everywhere, including in Andrej Karpathy's code and in PyTorch error messages:",
        },
        {
          t: "list",
          items: [
            "`B` — **batch size**. How many independent sequences you process at once. Purely a throughput/efficiency knob; sequences in a batch never interact.",
            "`T` — **sequence length** (also called *time* or *context length*). How many tokens. This is the dimension attention operates across.",
            "`C` — **channels**, a.k.a. `d_model`, `hidden_dim`, `n_embd`. How many numbers represent each token. 768 for GPT-2 small, 4096 for Llama-7B, 12288 for GPT-3 175B.",
          ],
        },
        {
          t: "code",
          lang: "python",
          caption: "The whole input pipeline, conceptually",
          code: `text   = "The cat sat"
tokens = [464, 3797, 3332]        # tokenizer → integer IDs.      shape (3,)
batch  = [[464, 3797, 3332]]      # add batch dimension.          shape (1, 3)

# The embedding table is a learned matrix of shape (vocab_size, C).
# Indexing it with token IDs is a lookup, not a multiplication.
E = embedding_table            # shape (50257, 768)
x = E[batch]                   # shape (1, 3, 768)  ->  (B, T, C)

# Every transformer block maps (B, T, C) -> (B, T, C). Same shape in, same shape out.
# That is why you can stack 96 of them.
for block in blocks:
    x = block(x)               # still (1, 3, 768)

# Finally project to vocabulary size to get a score per possible next token.
logits = x @ W_out             # (1, 3, 768) @ (768, 50257) -> (1, 3, 50257)`,
        },
        {
          t: "p",
          text: "Read that last line carefully, because it contains an idea people often miss: the model produces logits at *every* position, not just the last one. During training that is the whole point — one forward pass over a 1024-token document gives you 1024 next-token predictions to learn from simultaneously. During generation you usually throw away all but the last position.",
        },
        { t: "h", text: "The embedding table is the model's dictionary" },
        {
          t: "p",
          text: "The embedding table is a matrix with one row per vocabulary entry. Token 3797 (`cat`) means \"go to row 3797 and take those 768 numbers\". Those numbers start as random noise and are learned by gradient descent along with everything else. Nobody hand-designs them; the model discovers that `cat` and `dog` should end up near each other because doing so lowers its prediction loss.",
        },
        {
          t: "math",
          formula: "embedding params = vocab_size × C",
          note: "For GPT-2 small: 50,257 × 768 ≈ 38.6M parameters — about 31% of the model's 124M total, spent purely on the dictionary. This is why vocabulary size is a real architectural decision and not a footnote (Module 3).",
        },
        {
          t: "note",
          tone: "warn",
          title: "The error message you will see a thousand times",
          text: "`RuntimeError: mat1 and mat2 shapes cannot be multiplied (3x768 and 512x50257)`. This always means the same thing: the inner dimensions do not agree. Get in the habit of writing the expected shape as a comment next to every line. Experienced practitioners debug shapes on paper before running anything.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Text → integer token IDs → vectors via table lookup → a `(B, T, C)` tensor.",
            "Transformer blocks preserve shape, which is exactly why depth is cheap to add.",
            "The final projection turns hidden states into one score per vocabulary token.",
            "When something breaks, it is nearly always a shape or a dtype, not your understanding of attention.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 20,
      title: "Matrix multiplication is the entire computation",
      summary: "One operation accounts for >95% of the FLOPs in every model you will ever train or serve. Learn to count them.",
      blocks: [
        {
          t: "p",
          text: "There is a slightly absurd fact at the heart of modern AI: a $40,000 GPU exists almost entirely to do one thing quickly — multiply matrices. Attention is matrix multiplication. Feed-forward layers are matrix multiplication. The output projection is matrix multiplication. If you can count matrix multiplications, you can predict cost, latency, and memory before writing a line of code.",
        },
        { t: "h", text: "The definition, and the only rule that matters" },
        {
          t: "math",
          formula: "C = A B   where   C[i,j] = Σₖ A[i,k] · B[k,j]",
          note: "Entry (i,j) of the result is the dot product of row i of A with column j of B. The rule: A must be (m × n) and B must be (n × p), giving (m × p). The inner dimensions must match and they vanish from the result.",
        },
        {
          t: "p",
          text: "Do one by hand, once, and it will stick. Take A = [[1, 2], [3, 4]] and B = [[5, 6], [7, 8]]. The top-left entry of C is row 1 of A dotted with column 1 of B: 1×5 + 2×7 = 19. Top-right: 1×6 + 2×8 = 22. Bottom-left: 3×5 + 4×7 = 43. Bottom-right: 3×6 + 4×8 = 50. So C = [[19, 22], [43, 50]].",
        },
        {
          t: "note",
          tone: "analogy",
          title: "Two useful ways to read a matmul",
          text: "**As many dot products:** every output entry measures how much one row aligns with one column. This is the reading you want for attention, where scores are literally alignments. **As a linear transformation:** B takes each row of A and re-expresses it in a new coordinate system. This is the reading you want for embeddings and projections — a matmul rotates, stretches, and mixes a vector's features.",
        },
        { t: "h", text: "A neural network layer is a matmul plus a bias" },
        {
          t: "math",
          formula: "y = x W + b   then   h = σ(y)",
          note: "x is the input of shape (B·T, C_in). W is the learned weight matrix (C_in × C_out). b is a bias vector broadcast across rows. σ is a nonlinearity such as ReLU or GELU. Remove σ and a hundred stacked layers collapse into one matrix — the nonlinearity is what makes depth meaningful.",
        },
        {
          t: "p",
          text: "That is the whole of a dense layer. A transformer's feed-forward network is two of these back-to-back: one that expands C to 4C, and one that contracts back to C. Nothing more exotic is happening.",
        },
        { t: "h", text: "Counting FLOPs: the skill that makes you sound senior" },
        {
          t: "p",
          text: "Each output entry of an (m × n) @ (n × p) matmul takes n multiplications and n−1 additions — call it 2n operations. There are m·p output entries.",
        },
        {
          t: "math",
          formula: "FLOPs(matmul) ≈ 2 · m · n · p",
          note: "The factor of 2 counts one multiply and one add per term. Memorise this; it is the basis of every capacity-planning conversation about GPUs.",
        },
        {
          t: "p",
          text: "From this single formula comes the famous rule of thumb for transformers: a forward pass costs roughly **2 FLOPs per parameter per token**, and a training step (forward + backward) costs roughly **6 FLOPs per parameter per token** — the backward pass is about twice the forward pass because it computes gradients with respect to both inputs and weights.",
        },
        {
          t: "steps",
          items: [
            {
              title: "Worked example — training compute for a 7B model",
              text: "Take N = 7×10⁹ parameters and D = 2×10¹² training tokens. Total compute ≈ 6ND = 6 × 7e9 × 2e12 ≈ 8.4×10²² FLOPs.",
            },
            {
              title: "Convert to GPU-hours",
              text: "An H100 delivers roughly 1×10¹⁵ BF16 FLOP/s at realistic utilisation (about 40–50% of its peak). 8.4e22 / 1e15 ≈ 8.4×10⁷ GPU-seconds ≈ 23,300 GPU-hours.",
            },
            {
              title: "Sanity-check against reality",
              text: "That is roughly 1,000 H100s for a day, or 100 for ten days. This is the right order of magnitude for published 7B training runs — which tells you the estimate is sound and that pretraining a frontier model from scratch is not a hobby project.",
            },
          ],
        },
        { t: "h", text: "Why GPUs win" },
        {
          t: "p",
          text: "A CPU has a handful of very clever cores optimised for branchy, sequential, unpredictable code. A GPU has tens of thousands of simple arithmetic units. A matmul is *embarrassingly parallel* — every output entry is independent of every other, so it can be computed simultaneously. Tensor Cores go further and perform a small matrix multiply-accumulate as a single hardware instruction.",
        },
        {
          t: "table",
          head: ["Property", "CPU", "GPU"],
          rows: [
            ["Cores", "8–128 complex cores", "10,000+ simple cores"],
            ["Optimised for", "Latency of one thread", "Throughput of many threads"],
            ["Peak BF16 throughput", "~1 TFLOP/s", "~1,000 TFLOP/s (H100 class)"],
            ["Best case", "Branchy sequential logic", "Dense regular arithmetic"],
            ["Worst case", "Massive parallel arithmetic", "Divergent branching, tiny ops"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The twist you will meet again in Module 14",
          text: "Raw arithmetic is rarely the real bottleneck during *inference*. Generating one token at a time means each matmul has m = 1 — a matrix-vector product. You move all the model's weights from GPU memory to do a tiny amount of arithmetic, so you are limited by memory bandwidth, not FLOPs. This single fact explains batching, KV-caching, quantisation, and most of the LLM-serving industry.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Roughly how much compute to train a 13B model on 1T tokens?\" Answer out loud: 6 × 13e9 × 1e12 ≈ 7.8×10²² FLOPs, then divide by realistic per-GPU throughput. Interviewers are testing whether you reason from first principles or recite numbers.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 18,
      title: "Similarity: dot products, norms, and cosine",
      summary: "The single geometric idea underneath attention, embeddings, semantic search, and CLIP.",
      blocks: [
        {
          t: "p",
          text: "Attention asks \"which earlier tokens are relevant to me?\". Semantic search asks \"which documents are relevant to this query?\". CLIP asks \"which caption matches this image?\". All three are the same question — *how aligned are these two vectors?* — and all three answer it with a dot product.",
        },
        { t: "h", text: "The dot product and what it geometrically means" },
        {
          t: "math",
          formula: "A · B = Σᵢ AᵢBᵢ = ‖A‖ ‖B‖ cos θ",
          note: "The left form is what a computer calculates: multiply element-wise, then sum. The right form is what it means: the product of the two lengths and the cosine of the angle between them. These are the same number, which is the most useful identity in machine learning.",
        },
        {
          t: "list",
          items: [
            "Same direction (θ = 0°) → cos θ = 1 → **large positive** dot product.",
            "Perpendicular (θ = 90°) → cos θ = 0 → **zero** dot product; the vectors share no information.",
            "Opposite (θ = 180°) → cos θ = −1 → **large negative** dot product.",
          ],
        },
        { t: "h", text: "Norms measure length" },
        {
          t: "math",
          formula: "‖A‖₂ = √(Σᵢ Aᵢ²)      ‖A‖₁ = Σᵢ |Aᵢ|",
          note: "The L2 (Euclidean) norm is ordinary straight-line length and appears in cosine similarity, weight decay, and gradient clipping. The L1 norm sums absolute values and shows up in Lasso regularisation, where it drives weights exactly to zero.",
        },
        { t: "h", text: "Cosine similarity: dot product with the magnitude removed" },
        {
          t: "math",
          formula: "cos(θ) = (A · B) / (‖A‖ ‖B‖)",
          note: "Dividing by both lengths strips out magnitude and leaves pure direction. Range is [−1, 1]. For non-negative vectors such as TF-IDF counts, range is [0, 1].",
        },
        {
          t: "steps",
          items: [
            {
              title: "Worked example — cosine of A = [1,2,3] and B = [4,5,6]",
              text: "Dot product: 1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32.",
            },
            {
              title: "Norms",
              text: "‖A‖ = √(1+4+9) = √14 ≈ 3.742. ‖B‖ = √(16+25+36) = √77 ≈ 8.775.",
            },
            {
              title: "Divide",
              text: "32 / (3.742 × 8.775) = 32 / 32.83 ≈ 0.975. Very high similarity — which makes sense, since B is close to a scaled version of A.",
            },
          ],
        },
        { t: "h", text: "Why search uses cosine and not Euclidean distance" },
        {
          t: "p",
          text: "Consider a document that says \"cats are great\" and another that repeats \"cats are great cats are great cats are great\". Their raw count vectors point in the same direction but the second is three times longer. Euclidean distance says they are far apart. Cosine says they are identical. For meaning, cosine is right — length usually encodes *how much text there is*, not *what it is about*.",
        },
        {
          t: "math",
          formula: "‖A − B‖² = ‖A‖² + ‖B‖² − 2(A · B)",
          note: "Expand the square to see it. If A and B are both L2-normalised (‖A‖ = ‖B‖ = 1), this becomes 2 − 2cos θ: Euclidean distance is then a strictly decreasing function of cosine similarity, so the two metrics rank results identically.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The practical consequence",
          text: "Normalise your embeddings once at write time and cosine similarity reduces to a plain dot product — no division at query time. This is exactly why vector databases offer a `dot` metric and why the standard advice is \"normalise your vectors\" (Module 7). It makes cosine, dot, and Euclidean ranking equivalent while being the cheapest to compute.",
        },
        { t: "h", text: "The curse of dimensionality, and why embeddings survive it" },
        {
          t: "p",
          text: "In high dimensions, randomly chosen vectors are almost always nearly orthogonal, and all pairwise distances concentrate around the same value. That sounds fatal for nearest-neighbour search, and for genuinely random data it is. Embeddings escape because they are not random: trained representations lie on a much lower-dimensional *manifold* inside the 768- or 1536-dimensional space. Real structure is what makes similarity search work at all.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The upside of near-orthogonality",
          text: "Because there is room for exponentially many nearly-orthogonal directions in high-dimensional space, a model can store far more distinguishable concepts than it has dimensions — by packing them into directions that barely interfere. This is the *superposition* hypothesis from interpretability research, and it explains how a 4096-dimensional residual stream can represent tens of thousands of features.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why cosine rather than Euclidean for sentence embeddings?\" Strong answer: magnitude tracks length and token frequency rather than meaning; and if vectors are normalised the two are monotonically equivalent anyway, so cosine is the cheaper, scale-free default.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 18,
      title: "Probability: what a language model actually models",
      summary: "The chain rule of probability is the reason next-token prediction is enough to produce something that looks like intelligence.",
      blocks: [
        {
          t: "p",
          text: "An LLM is a probability distribution. Specifically it is a function that takes a sequence of tokens and returns a distribution over what the next token could be. Everything else — chat, code, reasoning, refusals — is a behaviour that emerges from repeatedly sampling from that distribution.",
        },
        { t: "h", text: "The three rules you need" },
        {
          t: "math",
          formula: "P(A, B) = P(A | B) · P(B)",
          note: "The product rule. The probability of both A and B is the probability of B times the probability of A given B. Rearranged, P(A|B) = P(A,B)/P(B) — conditioning means restricting attention to the slice of the world where B is true, then renormalising.",
        },
        {
          t: "math",
          formula: "P(x₁, x₂, …, x_T) = Π_{t=1}^{T} P(x_t | x₁, …, x_{t−1})",
          note: "The chain rule: apply the product rule repeatedly. The probability of a whole sequence factorises exactly into a product of next-token probabilities. No approximation is involved — this is an identity.",
        },
        {
          t: "math",
          formula: "P(H | E) = P(E | H) · P(H) / P(E)",
          note: "Bayes' theorem. Posterior ∝ likelihood × prior. It appears throughout GenAI: in the probabilistic derivation of BM25 (Module 8), in classifier-free guidance, and in how you should think about retrieval as evidence updating a prior.",
        },
        {
          t: "note",
          tone: "insight",
          title: "This is the single most important idea in the module",
          text: "The chain rule says modelling a whole document is *exactly equivalent* to modelling one next token at a time. That is why a task as dumb-sounding as \"guess the next word\" is sufficient to learn grammar, facts, translation, and arithmetic — because to predict the next token well over trillions of tokens of human text, you have no choice but to learn the structure that produced it.",
        },
        { t: "h", text: "Autoregressive generation, concretely" },
        {
          t: "code",
          lang: "python",
          caption: "Text generation in nine lines",
          code: `tokens = tokenizer.encode("The capital of France is")

for _ in range(max_new_tokens):
    logits = model(tokens)[-1]         # scores for the next token only
    probs  = softmax(logits / temperature)
    next_id = sample(probs)            # or argmax, for greedy decoding
    tokens.append(next_id)
    if next_id == EOS:
        break

print(tokenizer.decode(tokens))`,
        },
        {
          t: "p",
          text: "Note what is *not* here: no memory, no state carried between calls, no plan. The entire \"mind\" of the model at each step is the token list you feed it. This is the mechanical reason an LLM has no memory of previous conversations unless you paste them back in — the foundation of both context management (Module 12) and RAG (Module 9).",
        },
        { t: "h", text: "Independence, and why the i.i.d. assumption breaks here" },
        {
          t: "p",
          text: "Classical statistics assumes samples are independent and identically distributed. Language is aggressively not: token 500 depends on token 3. That dependence is the *entire signal*. It is also why a train/test split for LLMs must be done at the document level, never at the token or chunk level — otherwise the model has already seen the neighbourhood of your test data and your evaluation is meaningless.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Data contamination is the most common evaluation mistake",
          text: "If your benchmark questions appear anywhere in pretraining data, your scores measure memorisation, not capability. Every serious eval discussion (Module 15) starts with contamination checks.",
        },
        { t: "h", text: "Expectation and variance, briefly" },
        {
          t: "math",
          formula: "E[X] = Σ x·P(x)      Var[X] = E[(X − E[X])²] = E[X²] − E[X]²",
          note: "Expectation is a probability-weighted average; variance measures spread. You need these to read loss functions (which are expectations over the data distribution), to understand why minibatch gradients are noisy estimates of the true gradient, and to interpret the bias-variance decomposition.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why is next-token prediction sufficient to learn to translate?\" Answer via the chain rule: a corpus containing \"Le chat est noir means the cat is black\" makes accurate next-token prediction *require* an internal mapping between the languages. The objective is simple; the pressure it applies at scale is not.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 16,
      title: "Softmax and temperature",
      summary: "How arbitrary real-valued scores become a probability distribution — and how one number controls creativity.",
      blocks: [
        {
          t: "p",
          text: "The final layer of an LLM outputs *logits*: one unbounded real number per vocabulary token. Logits can be negative, can be 14.7, and do not sum to anything in particular. To sample a token you need probabilities: non-negative, summing to 1. Softmax is the standard bridge.",
        },
        {
          t: "math",
          formula: "softmax(z)ᵢ = e^{zᵢ} / Σⱼ e^{zⱼ}",
          note: "Exponentiate every logit (which forces positivity and amplifies differences), then divide by the total (which forces the sum to 1). Larger logits get exponentially more probability mass.",
        },
        { t: "h", text: "Worked example" },
        {
          t: "p",
          text: "Take logits z = [2.0, 1.0, 0.1]. Exponentiate: e² ≈ 7.389, e¹ ≈ 2.718, e^0.1 ≈ 1.105. Sum = 11.212. Divide: [0.659, 0.242, 0.099]. The gap between 2.0 and 1.0 — just one unit — became a 2.7× probability ratio. Softmax is not a gentle normaliser; it strongly favours the leader.",
        },
        { t: "h", text: "Temperature" },
        {
          t: "math",
          formula: "softmax(z / T)ᵢ = e^{zᵢ/T} / Σⱼ e^{zⱼ/T}",
          note: "Divide every logit by T before exponentiating. T < 1 sharpens the distribution (more deterministic); T > 1 flattens it (more random); T → 0 becomes argmax (greedy); T → ∞ becomes uniform over the vocabulary.",
        },
        {
          t: "p",
          text: "Continue the example with T = 2. Logits become [1.0, 0.5, 0.05]. Exponentials: 2.718, 1.649, 1.051. Sum = 5.418. Probabilities: [0.502, 0.304, 0.194]. Compare with the T = 1 result [0.659, 0.242, 0.099] — the leader lost 16 points of probability and the long tail gained. That redistribution is exactly what people mean by \"turning up the creativity\", and also exactly why high temperature increases hallucination: you are deliberately sampling tokens the model considered less likely.",
        },
        {
          t: "table",
          head: ["Temperature", "Effect on distribution", "Use when"],
          rows: [
            ["0 (greedy)", "Always the top token; fully deterministic", "Extraction, classification, structured JSON, evals"],
            ["0.2 – 0.5", "Slightly sharpened", "RAG answers, factual Q&A, code"],
            ["0.7 – 1.0", "The trained distribution, roughly as-is", "General chat, drafting"],
            ["> 1.2", "Flattened; tail tokens become plausible", "Brainstorming, synthetic data diversity"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Temperature is not a confidence knob",
          text: "Lowering temperature does not make a model more correct — it makes it more *consistent*. If the model is confidently wrong, T = 0 returns the same wrong answer every time, and you have removed your only cheap signal (disagreement across samples) for detecting uncertainty. Self-consistency sampling in Module 11 exploits exactly that signal.",
        },
        { t: "h", text: "Numerical stability: the log-sum-exp trick" },
        {
          t: "p",
          text: "If a logit is 1000, then e^1000 overflows to infinity in float32 and you get NaN. The fix relies on softmax being invariant to adding a constant to every logit — subtract the maximum first.",
        },
        {
          t: "math",
          formula: "softmax(z)ᵢ = e^{zᵢ − max(z)} / Σⱼ e^{zⱼ − max(z)}",
          note: "Mathematically identical (the e^{−max(z)} factors cancel), numerically safe: the largest exponent is now e⁰ = 1. Every real implementation does this, and it is why you should use `log_softmax` and `cross_entropy` rather than composing softmax and log yourself.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Softmax is everywhere, not just at the output",
          text: "Attention weights are a softmax over similarity scores (Module 4). CLIP's contrastive loss is a softmax over image–text pairs (Module 13). Mixture-of-Experts routing is a softmax over experts (Module 5). Whenever you see \"soft selection among alternatives\", it is a softmax.",
        },
      ],
    },

    {
      id: "l6",
      level: "core",
      minutes: 18,
      title: "Cross-entropy, likelihood, and perplexity",
      summary: "The loss function that trains every LLM, and the metric that reports how well it worked.",
      blocks: [
        {
          t: "p",
          text: "Training needs a single scalar that says \"how wrong was that?\". For next-token prediction, that scalar is cross-entropy. It has a clean information-theoretic meaning, a clean probabilistic meaning, and a beautifully simple gradient.",
        },
        { t: "h", text: "The definition" },
        {
          t: "math",
          formula: "H(y, ŷ) = − Σᵢ yᵢ log ŷᵢ",
          note: "y is the true distribution, ŷ the predicted one. For next-token prediction y is one-hot — a single 1 at the correct token — so the whole sum collapses to a single term.",
        },
        {
          t: "math",
          formula: "L = − log ŷ_correct",
          note: "The practical form. Loss is just the negative log of the probability you assigned to the token that actually came next. Nothing else in the distribution matters directly.",
        },
        {
          t: "table",
          head: ["Probability on correct token", "Loss (nats)", "Reading"],
          rows: [
            ["1.00", "0.00", "Perfect; no gradient"],
            ["0.50", "0.69", "Coin flip between two options"],
            ["0.10", "2.30", "Roughly a 10-way guess"],
            ["0.01", "4.61", "Badly wrong"],
            ["0.0001", "9.21", "Confidently, expensively wrong"],
          ],
        },
        {
          t: "p",
          text: "Notice the asymmetry: the penalty for being confidently wrong grows without bound, while the reward for extra confidence when already right is tiny. Log loss punishes overconfidence hard. That is a feature — it is what forces a model to be calibrated rather than to bluff.",
        },
        { t: "h", text: "Three equivalent framings" },
        {
          t: "list",
          items: [
            "**Information theory** — cross-entropy is the average number of nats needed to encode the true text using the model's predicted distribution. A better model compresses text better. Language modelling *is* compression.",
            "**Maximum likelihood** — minimising Σ −log P(x_t | x_{<t}) is exactly maximising the log-likelihood of the training corpus under the model.",
            "**KL divergence** — H(y, ŷ) = H(y) + D_KL(y ‖ ŷ). Since H(y) is fixed by the data, minimising cross-entropy is minimising the KL divergence from the true distribution to yours.",
          ],
        },
        { t: "h", text: "The gradient that makes it all work" },
        {
          t: "math",
          formula: "∂L / ∂z = ŷ − y",
          note: "The gradient of cross-entropy with respect to the *logits*, when the logits pass through softmax, is simply predicted minus actual. If you predicted 0.7 for the right token, the gradient there is −0.3: push that logit up. Every wrong token gets pushed down in proportion to the probability you wasted on it.",
        },
        {
          t: "p",
          text: "This is the cleanest result in applied deep learning and worth deriving once yourself. It is also a practical warning: because the simplification depends on softmax and log-loss cancelling, you must use a fused `cross_entropy` that takes raw logits. Applying softmax yourself and then taking a log loses the cancellation and reintroduces numerical instability.",
        },
        { t: "h", text: "Perplexity: cross-entropy in units people quote" },
        {
          t: "math",
          formula: "PPL = exp( − (1/N) Σ_t log P(x_t | x_{<t}) ) = e^L",
          note: "The exponentiated average loss. Interpretation: the effective number of equally-likely options the model was choosing between at each step. PPL = 1 is perfect prediction; PPL = vocab_size is a model that has learned nothing.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example", text: "A model reports average loss 2.3 nats/token. PPL = e^2.3 ≈ 9.97 ≈ 10. It was effectively picking among 10 options per token." },
            { title: "Second example", text: "Average log-likelihood −0.4 means L = 0.4, so PPL = e^0.4 ≈ 1.49. Extremely strong — typical of a model on text very close to its training distribution." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Perplexity is not comparable across tokenizers",
          text: "PPL is per *token*, so a model with a larger vocabulary uses fewer tokens for the same text and gets a different number for identical underlying quality. Comparing perplexity across models with different tokenizers is meaningless unless you normalise to bits-per-byte or bits-per-character. This mistake appears in real papers.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Where this shows up later",
          text: "Cross-entropy is the pretraining loss (Module 5) and the SFT loss (Module 11). Its gradient drives backpropagation (next lesson). Perplexity is your quickest smoke test that a fine-tune is learning rather than diverging. And the compression framing is the intuition behind scaling laws.",
        },
      ],
    },

    {
      id: "l7",
      level: "core",
      minutes: 22,
      title: "Gradients, the chain rule, and backpropagation by hand",
      summary: "Learning is just the chain rule applied at industrial scale. Do one backward pass on paper and it demystifies permanently.",
      blocks: [
        {
          t: "p",
          text: "A model has billions of knobs and one number telling it how badly it did. Training is answering, for every knob simultaneously: \"if I nudged you slightly, would the loss go up or down, and by how much?\" That vector of answers is the gradient, and backpropagation is the algorithm that computes it in a single backward sweep instead of billions of separate experiments.",
        },
        { t: "h", text: "Derivative, partial derivative, gradient" },
        {
          t: "list",
          items: [
            "**Derivative** `df/dx` — how much f changes per unit change in x. The slope.",
            "**Partial derivative** `∂f/∂x` — the same, for a function of many variables, holding the others fixed.",
            "**Gradient** `∇f` — the vector of all partial derivatives. It points in the direction of steepest *increase*, which is why gradient descent moves in the opposite direction.",
          ],
        },
        {
          t: "math",
          formula: "θ ← θ − η ∇_θ L(θ)",
          note: "The update rule for all of deep learning. η is the learning rate: too large and you overshoot and diverge; too small and training crawls. Typical LLM pretraining values are 1e-4 to 3e-4; LoRA fine-tuning often uses 1e-4 to 2e-4; full fine-tuning 1e-5 to 5e-5.",
        },
        { t: "h", text: "The chain rule" },
        {
          t: "math",
          formula: "if y = f(u) and u = g(x) then dy/dx = (dy/du) · (du/dx)",
          note: "Local sensitivities multiply along a path. A neural network is a long composition f(g(h(...))), so the gradient at any layer is the product of every local derivative between that layer and the loss.",
        },
        { t: "h", text: "A complete backward pass, by hand" },
        {
          t: "p",
          text: "Take the smallest network that is still interesting: one input, two layers, squared-error loss. Forward: `u = w₁·x`, then `v = w₂·u`, then `L = (v − t)²`. Set x = 2, w₁ = 3, w₂ = 4, target t = 20.",
        },
        {
          t: "steps",
          items: [
            { title: "Forward pass", text: "u = 3 × 2 = 6.  v = 4 × 6 = 24.  L = (24 − 20)² = 16." },
            { title: "Start at the loss", text: "∂L/∂v = 2(v − t) = 2(24 − 20) = 8." },
            { title: "Back through the second layer", text: "v = w₂·u, so ∂v/∂w₂ = u = 6 and ∂v/∂u = w₂ = 4. Therefore ∂L/∂w₂ = 8 × 6 = 48, and ∂L/∂u = 8 × 4 = 32." },
            { title: "Back through the first layer", text: "u = w₁·x, so ∂u/∂w₁ = x = 2. Therefore ∂L/∂w₁ = 32 × 2 = 64." },
            { title: "Update with η = 0.001", text: "w₂ ← 4 − 0.001×48 = 3.952.  w₁ ← 3 − 0.001×64 = 2.936. New forward pass: u = 5.872, v = 23.21, L = 10.3 — down from 16. That is learning." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The pattern to notice",
          text: "Each layer takes the gradient arriving from above, multiplies by its own local derivative, and passes the result down. Nothing global is needed — every layer only ever uses local information plus one incoming number. That locality is why backprop scales to 96 layers and 400B parameters, and it is exactly what `loss.backward()` automates.",
        },
        { t: "h", text: "Why gradients vanish and explode" },
        {
          t: "p",
          text: "Gradients are *products* of many local derivatives. If each is 0.5, then after 50 layers the gradient is 0.5⁵⁰ ≈ 10⁻¹⁵ — the early layers receive nothing and never learn (**vanishing**). If each is 1.5, after 50 layers it is 1.5⁵⁰ ≈ 6×10⁸ — weights jump absurdly and the loss becomes NaN (**exploding**).",
        },
        {
          t: "table",
          head: ["Problem", "Fix", "Why it works"],
          rows: [
            ["Vanishing gradients", "Residual connections `y = x + F(x)`", "Adds a path whose local derivative is exactly 1, so gradient can flow unattenuated to any depth"],
            ["Vanishing gradients", "ReLU/GELU instead of sigmoid/tanh", "Derivative stays near 1 in the active region rather than saturating near 0"],
            ["Exploding gradients", "Gradient clipping (norm ≤ 1.0)", "Rescales the whole gradient vector if its norm exceeds a threshold, preserving direction"],
            ["Both", "LayerNorm / RMSNorm", "Keeps activation scale stable across depth, so local derivatives stay near 1"],
            ["Instability early in training", "Learning-rate warmup", "Adam's variance estimates are unreliable in the first steps; small steps until they settle"],
          ],
        },
        {
          t: "p",
          text: "Every row of that table is a design choice visible in the transformer diagram you will study in Module 4. The architecture is not arbitrary — it is a list of solutions to the gradient-flow problems in this lesson.",
        },
        { t: "h", text: "Stochastic gradient descent and batching" },
        {
          t: "p",
          text: "Computing the exact gradient over the whole dataset every step is impossible at trillion-token scale. Instead you estimate it from a minibatch. The estimate is noisy, but noise is cheap and — usefully — acts as a mild regulariser that helps escape sharp minima. Larger batches give lower-variance gradients and better hardware utilisation; smaller batches give more updates per unit compute. Gradient accumulation lets you get a large *effective* batch on small hardware by summing gradients over several micro-batches before stepping.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why do residual connections help training?\" The answer to give is about the derivative, not vibes: for y = x + F(x), ∂y/∂x = 1 + ∂F/∂x, so there is always a unit-gradient highway back to earlier layers regardless of what F does. Without it, gradient magnitude decays multiplicatively with depth.",
        },
      ],
    },

    {
      id: "l8",
      level: "advanced",
      minutes: 18,
      title: "Generalisation: bias, variance, and why LLMs break the textbook",
      summary: "Classical ML says huge models must overfit. LLMs are huge and do not. Understanding why is genuinely useful.",
      blocks: [
        {
          t: "p",
          text: "Every ML course teaches the U-shaped curve: as model capacity grows, test error falls, bottoms out, then rises as the model memorises noise. Then GPT-3 arrived with 175B parameters, trained for less than one epoch, and got *better* the bigger it got. Both stories are true, and reconciling them tells you a lot about what modern models are actually doing.",
        },
        { t: "h", text: "The classical decomposition" },
        {
          t: "math",
          formula: "E[(y − f̂(x))²] = Bias² + Variance + σ²_irreducible",
          note: "Bias is error from your model being too simple to represent the truth. Variance is error from sensitivity to the particular training sample. σ² is noise no model can remove. Classically you trade the first two against each other.",
        },
        {
          t: "table",
          head: ["Symptom", "Diagnosis", "Action"],
          rows: [
            ["Train loss high, val loss high", "Underfitting (high bias)", "Bigger model, train longer, better features, raise learning rate"],
            ["Train loss low, val loss high", "Overfitting (high variance)", "More data, regularisation, dropout, early stopping, smaller model"],
            ["Train ≈ val, both plateaued", "At capacity for this data", "More/better data is the only real lever"],
            ["Val loss jumps around", "Learning rate too high, or batch too small", "Lower LR, warmup, larger effective batch"],
          ],
        },
        { t: "h", text: "Regularisation: the classical toolkit" },
        {
          t: "math",
          formula: "L_total = L_data + λ‖w‖₂²     (L2 / weight decay)",
          note: "Penalises large weights, shrinking them all smoothly toward zero. Prefers many small weights over a few large ones, which tends to be smoother and generalise better. λ is the regularisation strength.",
        },
        {
          t: "math",
          formula: "L_total = L_data + λ‖w‖₁     (L1 / Lasso)",
          note: "Penalises absolute values. Because the gradient of |w| is a constant ±λ rather than shrinking near zero, L1 drives weights *exactly* to zero and yields sparse models — useful for feature selection, rarely used in transformers.",
        },
        {
          t: "list",
          items: [
            "**Dropout** — randomly zero a fraction of activations during training, forcing redundant representations. Standard in older architectures; often set to 0 in large-scale LLM pretraining, because there is more data than capacity and no overfitting to prevent.",
            "**Early stopping** — halt when validation loss stops improving. Cheap and effective for fine-tuning, where overfitting is a real risk.",
            "**Data augmentation** — the strongest regulariser, because it adds genuine information. For text, paraphrasing and back-translation; the GenAI-era version is synthetic data generation.",
            "**Weight decay in AdamW** — decoupled from the adaptive gradient scaling, which is why AdamW rather than Adam is the LLM standard. Typical value 0.1.",
          ],
        },
        { t: "h", text: "Why the textbook curve does not appear in LLM pretraining" },
        {
          t: "steps",
          items: [
            {
              title: "There is more data than capacity",
              text: "A Chinchilla-optimal run sees roughly 20 tokens per parameter and passes over the corpus barely once. You cannot memorise a dataset you see only once — so the classical overfitting regime is never entered.",
            },
            {
              title: "Double descent",
              text: "Test error genuinely does rise as capacity approaches the interpolation threshold — then falls again as you go far past it. The classical U-shape is the left half of a wider curve; LLMs live on the right half.",
            },
            {
              title: "Implicit regularisation from SGD",
              text: "Among the many parameter settings that fit the data, gradient descent has a bias toward flatter, simpler solutions. The optimiser is doing regularisation nobody wrote down.",
            },
            {
              title: "The objective is genuinely hard",
              text: "Predicting the next token over the whole internet is not a task you can shortcut by memorising noise. The cheapest way to do well is to learn real structure.",
            },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "But fine-tuning is firmly in the classical regime",
          text: "Fine-tune a 7B model on 500 support tickets for 10 epochs and you will overfit spectacularly and trigger catastrophic forgetting. Everything in the classical toolkit applies: hold out a validation set, watch it, stop early, keep the learning rate low, prefer LoRA with a small rank over full fine-tuning. Module 11 covers this in depth. The rule of thumb: pretraining is data-rich and capacity-poor; fine-tuning is the reverse.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The practical mental model",
          text: "Ask which side of the data/capacity ratio you are on. Billions of tokens and one epoch: scale up, do not regularise. Hundreds of examples and ten epochs: regularise hard, freeze most of the model, validate obsessively.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"A 175B-parameter model trained on 300B tokens — why doesn't it overfit?\" Good answer: with fewer than two tokens per parameter it barely completes one pass, so there is no opportunity to memorise; add double descent and SGD's implicit bias toward flat minima. Then add the sharp observation that by Chinchilla's ~20 tokens/parameter heuristic, GPT-3 was in fact badly *under-trained* for its size — the interesting failure was not overfitting but compute misallocation.",
        },
      ],
    },
  ],

  theory: [
    "Vectors, matrices, tensors — how a 'token' becomes a vector, and how a batch of tokens becomes a tensor of shape (batch, sequence_length, hidden_dim).",
    "Matrix multiplication as the core operation of every neural network layer; why GPUs are fast at this (parallel MACs).",
    "FLOP counting: 2·m·n·p per matmul, ≈2 FLOPs/param/token forward and ≈6 FLOPs/param/token for a training step.",
    "Dot product & cosine similarity as a measure of 'how aligned two vectors are' — the literal basis of attention and semantic search.",
    "Why normalised embeddings make cosine, dot product, and Euclidean ranking equivalent.",
    "Probability basics: joint/conditional probability, the chain rule of probability, Bayes' theorem, and why language modeling is 'predict the distribution over the next token'.",
    "Softmax function: converting raw scores (logits) into a probability distribution; temperature's effect on sharpness; the log-sum-exp stability trick.",
    "Cross-entropy loss, its three equivalent framings (information theory, maximum likelihood, KL divergence), and why ∂L/∂z = ŷ − y.",
    "Perplexity as exponentiated loss — and why it is not comparable across different tokenizers.",
    "Gradient descent & backpropagation: how a model 'learns' by nudging weights against the gradient; vanishing/exploding gradients as a product of local derivatives.",
    "Overfitting vs underfitting, bias-variance tradeoff, regularization (L1/L2, dropout, weight decay) — and why the classical U-curve does not appear in LLM pretraining (double descent, one-epoch training).",
  ],

  math: [
    {
      title: "Dot product & Cosine similarity",
      formula: "cos(θ) = (A · B) / (||A|| ||B||)",
      note: "A·B = Σ(Ai×Bi) = ||A||·||B||·cos θ. Cosine similarity ranges [-1,1] and is scale-invariant — this is why embeddings are compared with cosine, not raw distance.",
    },
    {
      title: "Matmul FLOPs",
      formula: "FLOPs ≈ 2 · m · n · p  →  ≈6·N·D for a training run",
      note: "One multiply + one add per term. N = parameters, D = training tokens; forward is ~2ND, backward ~4ND. This is the estimate behind every GPU budget conversation.",
    },
    {
      title: "Softmax (with temperature)",
      formula: "softmax(zi/T) = e^(zi/T) / Σj e^(zj/T)",
      note: "Turns logits into a distribution summing to 1. Low T sharpens, high T flattens, T→0 is greedy decoding. Always implemented as e^(zi − max z) for numerical stability.",
    },
    {
      title: "Cross-entropy loss",
      formula: "L = -Σ yi log(ŷi)  →  L = -log ŷ_correct",
      note: "For next-token prediction y is one-hot, so loss is just the negative log-probability of the true token. Equivalent to maximum likelihood and to minimising KL(y‖ŷ).",
    },
    {
      title: "Softmax + cross-entropy gradient",
      formula: "∂L/∂z = ŷ - y",
      note: "The gradient w.r.t. logits is predicted minus actual. The cleanest result in deep learning — and the reason to always use a fused cross_entropy on raw logits.",
    },
    {
      title: "Perplexity",
      formula: "PPL = exp(L) = exp(-(1/N) Σ log P(xi|x<i))",
      note: "The effective number of equally likely choices per token. PPL=1 is perfect. Not comparable across tokenizers without normalising to bits-per-byte.",
    },
    {
      title: "Chain rule of probability",
      formula: "P(x1..xT) = Π P(xt | x1..xt-1)",
      note: "An exact identity, not an approximation. It is why modelling a whole document reduces to next-token prediction.",
    },
    {
      title: "Gradient descent update rule",
      formula: "θ = θ - η ∇θ L(θ)",
      note: "η is the learning rate. ∇θL is computed via backpropagation (chain rule applied layer by layer, using only local information).",
    },
    {
      title: "L2 vs L1 regularisation",
      formula: "L + λ||w||₂²   vs   L + λ||w||₁",
      note: "L2 shrinks all weights smoothly (weight decay); L1 has constant-magnitude gradient so it drives weights exactly to zero, producing sparsity.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain why softmax is used at the output layer of a language model instead of just taking the raw logits." },
    { type: "theory", q: "What is the difference between L1 and L2 regularization, and how does each affect the weight distribution?" },
    { type: "theory", q: "Why is cosine similarity preferred over Euclidean distance when comparing sentence embeddings? Under what condition are the two equivalent?" },
    { type: "theory", q: "Explain, using the chain rule of probability, why next-token prediction is sufficient to learn translation." },
    { type: "theory", q: "Why must you use a fused cross_entropy on raw logits rather than applying softmax then log yourself? Give both the numerical and the gradient reason." },
    { type: "math", q: "Compute the cosine similarity between vectors A=[1,2,3] and B=[4,5,6] by hand." },
    { type: "math", q: "Given logits [2.0, 1.0, 0.1], compute the softmax output. Then recompute with temperature T=2 and explain the difference." },
    { type: "math", q: "Derive the gradient of cross-entropy loss with respect to the logits when combined with softmax (show it simplifies to ŷ - y)." },
    { type: "math", q: "If a model has a cross-entropy loss of 2.3 nats per token, what is its perplexity?" },
    { type: "math", q: "Estimate the total training FLOPs for a 13B-parameter model trained on 1 trillion tokens, then convert to H100-hours assuming 1e15 effective FLOP/s." },
    { type: "math", q: "For the network u=w1·x, v=w2·u, L=(v-t)², with x=2, w1=3, w2=4, t=20: compute the forward pass and then ∂L/∂w1 and ∂L/∂w2 by hand." },
    { type: "math", q: "An embedding table has vocab 50,257 and hidden dim 768. How many parameters is that, and what fraction of a 124M-parameter model?" },
    { type: "theory", q: "Explain the bias-variance tradeoff and then explain why a 175B-parameter model trained on 300B tokens does not overfit." },
    { type: "theory", q: "Why does gradient magnitude decay multiplicatively with depth, and how does a residual connection fix it? Give the derivative." },
  ],

  resources: [
    { label: "3Blue1Brown — Essence of Linear Algebra", url: "https://www.3blue1brown.com/topics/linear-algebra", kind: "course" },
    { label: "3Blue1Brown — Neural Networks (incl. backprop & transformers)", url: "https://www.3blue1brown.com/topics/neural-networks", kind: "course" },
    { label: "Dive into Deep Learning (d2l.ai) — Preliminaries & Linear Networks", url: "https://d2l.ai/chapter_preliminaries/index.html", kind: "book" },
    { label: "Karpathy — micrograd (build autograd from scratch, ~150 lines)", url: "https://github.com/karpathy/micrograd", kind: "repo" },
    { label: "Karpathy — 'The spelled-out intro to neural networks and backpropagation'", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", kind: "course" },
    { label: "Goodfellow, Bengio & Courville — Deep Learning, Ch. 2–5 (free online)", url: "https://www.deeplearningbook.org/", kind: "book" },
    { label: "Belkin et al. 2019 — Reconciling modern ML practice and the bias-variance trade-off (double descent)", url: "https://arxiv.org/abs/1812.11118", kind: "paper" },
  ],
};

export default m01;
