const m04 = {
  id: "m04",
  week: 4,
  hours: 10,
  title: "Transformer Architecture & Attention Mechanism",
  tag: "Core LLM",
  why: "This is the single most important module. Every technology on your list — LLMs, RAG, embeddings, VLMs — is built on top of the Transformer. If you understand attention deeply, everything downstream becomes far easier.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 14,
      title: "What came before: RNNs, LSTMs, and the two walls they hit",
      summary: "You cannot appreciate the transformer without understanding the specific problems it was designed to solve.",
      blocks: [
        {
          t: "p",
          text: "Until 2017, sequence modelling meant recurrence. A recurrent neural network reads one token at a time, maintaining a hidden state that is supposed to summarise everything seen so far. It is an intuitive design — it is roughly how reading feels — and it hit two walls that no amount of engineering could climb.",
        },
        {
          t: "math",
          formula: "h_t = tanh(W_h h_{t−1} + W_x x_t + b)     y_t = W_y h_t",
          note: "The hidden state at step t depends on the hidden state at step t−1. That single dependency is both the elegance of the design and its downfall.",
        },
        { t: "h", text: "Wall 1: no parallelism" },
        {
          t: "p",
          text: "To compute h₁₀₀ you need h₉₉, which needs h₉₈, and so on. The computation is inherently sequential — for a 1,000-token sequence you perform 1,000 dependent steps that cannot be overlapped. A GPU with 15,000 cores sits mostly idle. Training time scales with sequence length no matter how much hardware you buy, which puts a hard ceiling on how much data you can process.",
        },
        {
          t: "note",
          tone: "insight",
          title: "This was the actual motivation for the transformer",
          text: "Read the original paper's abstract and it leads with parallelism, not quality. The team wanted a model that could use a GPU fully. Better long-range modelling was a bonus. The lesson generalises: in deep learning, architectures that map well onto hardware win, and 'the bitter lesson' is that scalable-but-simple beats clever-but-sequential.",
        },
        { t: "h", text: "Wall 2: information decay over distance" },
        {
          t: "p",
          text: "Every token's information must survive by being repeatedly multiplied through W_h. From Module 1 you know what repeated multiplication does: it decays or explodes exponentially. In practice, information from 50 tokens ago is largely gone. The whole past is squeezed through one fixed-size vector — an information bottleneck that gets tighter as the sequence grows.",
        },
        {
          t: "p",
          text: "LSTMs and GRUs mitigated this with gates: a cell state with an additive update path (the same trick as a residual connection) plus learned forget/input/output gates deciding what to keep. This extended usable range from tens to low hundreds of tokens. It did not eliminate the bottleneck, and it did nothing at all about parallelism.",
        },
        { t: "h", text: "The intermediate step: attention as an add-on" },
        {
          t: "p",
          text: "In 2014–15, Bahdanau and then Luong added *attention* to encoder–decoder RNN translation models. The insight: instead of forcing the decoder to work from a single final encoder state, let it look back at *all* encoder states and compute a weighted average, with weights depending on what it currently needs. Translation quality jumped immediately, especially for long sentences.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The 2017 move, in one sentence",
          text: "Attention had been a helpful accessory bolted onto a recurrent backbone. Vaswani et al. asked what happens if you delete the recurrence and keep only the attention — hence the title, \"Attention Is All You Need\". Removing recurrence removed both walls at once: every position can attend to every other position in a single parallel operation, and any two positions are one step apart regardless of distance.",
        },
        {
          t: "table",
          head: ["Property", "RNN / LSTM", "Transformer"],
          rows: [
            ["Parallelism over sequence", "None — inherently sequential", "Full — all positions at once"],
            ["Path length between positions", "O(n)", "O(1)"],
            ["Compute per layer", "O(n · d²)", "O(n² · d + n · d²)"],
            ["Memory during training", "O(n · d)", "O(n²) for attention scores"],
            ["Long-range dependencies", "Decays with distance", "Direct, distance-independent"],
            ["Inductive bias for order", "Built in by construction", "None — must be added explicitly"],
          ],
        },
        {
          t: "p",
          text: "Look at the last two rows: the transformer's advantages are not free. Quadratic memory in sequence length is the defining constraint of the entire long-context research field, and having no built-in notion of order is why positional encoding exists. The rest of this module is largely about those two costs.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 22,
      title: "Self-attention derived from scratch",
      summary: "Build the mechanism from a plain question, and Q, K, V will stop being three arbitrary letters.",
      blocks: [
        {
          t: "p",
          text: "Most explanations start by asserting that there are three matrices called Query, Key, and Value. That is backwards. Let us instead start from a problem and let the mechanism fall out.",
        },
        { t: "h", text: "The problem" },
        {
          t: "p",
          text: "Take the sentence \"The animal didn't cross the street because it was too tired.\" To represent `it` usefully, the model needs to know that `it` refers to `animal`, not `street`. The information required is somewhere else in the sequence. So: **how does a token gather relevant information from other tokens?**",
        },
        { t: "h", text: "Attempt 1: average everything" },
        {
          t: "p",
          text: "Replace each token's vector with the average of all token vectors. Now every token has global information. But it also has *the same* information as every other token, and irrelevant tokens are weighted equally with crucial ones. Useless — but the shape is right. We need a *weighted* average where the weights depend on relevance.",
        },
        { t: "h", text: "Attempt 2: weight by similarity" },
        {
          t: "p",
          text: "From Module 1 we already have a similarity measure: the dot product. So compute the dot product of each token's vector with every other token's vector, softmax the scores into weights, and take the weighted average.",
        },
        {
          t: "math",
          formula: "output_i = Σ_j softmax_j(x_i · x_j) · x_j",
          note: "A real mechanism, and it works — this is sometimes called 'unparameterised attention'. But it has a serious limitation.",
        },
        {
          t: "note",
          tone: "warn",
          title: "The limitation: one vector cannot play three roles",
          text: "The word `it` needs to *ask about* referents. The word `animal` needs to *advertise* that it is a noun phrase available for reference. And whatever `animal` actually *contributes* — its semantic content — need not be the same as what makes it findable. A single vector x forced to serve as search query, search index, and payload simultaneously is over-constrained. Worse, x·x is always large, so every token attends mostly to itself.",
        },
        { t: "h", text: "Attempt 3: give each role its own learned projection" },
        {
          t: "p",
          text: "Learn three separate linear maps of the same input vector, one per role. That is the entire idea, and it is the whole of Q, K, V:",
        },
        {
          t: "math",
          formula: "Q = X W_Q      K = X W_K      V = X W_V",
          note: "X is (T × d_model). Each W is (d_model × d_k), learned. Q, K, V are three different views of the same tokens, specialised for three different jobs.",
        },
        {
          t: "list",
          items: [
            "**Query** — \"what am I looking for?\" Derived from the token doing the attending.",
            "**Key** — \"what do I match against?\" A token's advertisement of what it is, for retrieval purposes.",
            "**Value** — \"what do I actually contribute if selected?\" The payload that gets mixed into the output.",
          ],
        },
        {
          t: "note",
          tone: "analogy",
          title: "The library analogy, done properly",
          text: "You want a book about GPU programming. Your **query** is that request. Each book's **key** is its catalogue entry — title, subject tags, the metadata designed to be searched. Its **value** is the actual content of the book. You match your query against catalogue entries, not against full texts, and what you take away is content, not catalogue entries. Attention differs from a library in one way: rather than picking one book, you get a blended summary weighted by how well each catalogue entry matched. Attention is *soft* retrieval.",
        },
        { t: "h", text: "The mechanism, in full" },
        {
          t: "math",
          formula: "Attention(Q, K, V) = softmax( Q Kᵀ / √d_k ) V",
          note: "QKᵀ is (T×T): entry (i,j) is how much token i's query matches token j's key. Divide by √d_k (next lesson explains why). Softmax over each row turns scores into weights summing to 1. Multiply by V to get, for each token, a weighted mixture of all value vectors.",
        },
        {
          t: "code",
          lang: "python",
          caption: "Self-attention in eight lines. This is genuinely all of it.",
          code: `import torch, math

def self_attention(x, W_q, W_k, W_v, mask=None):
    # x: (B, T, d_model)
    Q = x @ W_q                      # (B, T, d_k)
    K = x @ W_k                      # (B, T, d_k)
    V = x @ W_v                      # (B, T, d_v)

    scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))   # (B, T, T)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

    weights = torch.softmax(scores, dim=-1)                    # rows sum to 1
    return weights @ V                                          # (B, T, d_v)`,
        },
        { t: "h", text: "A fully worked numeric example" },
        {
          t: "p",
          text: "Take Q = [1, 0] (a single query), K = [[1,0], [0,1]] (two keys), V = [[10,0], [0,20]], d_k = 2.",
        },
        {
          t: "steps",
          items: [
            { title: "1. Scores", text: "Q·K₁ = 1×1 + 0×0 = 1.  Q·K₂ = 1×0 + 0×1 = 0.  So raw scores = [1, 0]." },
            { title: "2. Scale", text: "Divide by √2 ≈ 1.414: [0.707, 0]." },
            { title: "3. Softmax", text: "e^0.707 ≈ 2.028, e^0 = 1, sum = 3.028. Weights = [0.670, 0.330]." },
            { title: "4. Weighted sum of values", text: "0.670 × [10,0] + 0.330 × [0,20] = [6.70, 0] + [0, 6.60] = **[6.70, 6.60]**." },
            { title: "Interpretation", text: "The query aligned with key 1, so the output leans toward value 1 — but not exclusively. Softmax is soft: even a clearly-losing key retains a third of the weight here, because the score gap was only 0.707. Larger gaps produce sharper selection." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Attention is a differentiable dictionary lookup",
          text: "A hash table takes a key and returns one value. Attention takes a query, compares it against all keys, and returns a probability-weighted blend of all values. Because every operation is differentiable, the model can *learn* what to put in keys and values via gradient descent. That is the whole trick: a learnable, soft, differentiable retrieval operation — which is also why RAG (Module 9) feels like a natural extension of attention rather than a bolt-on.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 12,
      title: "Why divide by √d_k",
      summary: "A one-symbol detail that decides whether a deep transformer trains or stalls. Worth its own lesson.",
      blocks: [
        {
          t: "p",
          text: "The scaling factor looks like an arbitrary constant. It is not — it follows from a short variance argument, and understanding it demonstrates real command of the mechanism.",
        },
        { t: "h", text: "The variance argument" },
        {
          t: "p",
          text: "Suppose the entries of q and k are independent with mean 0 and variance 1 — roughly true at initialisation, and approximately maintained by LayerNorm. The dot product is a sum of d_k products:",
        },
        {
          t: "math",
          formula: "q · k = Σ_{i=1}^{d_k} qᵢkᵢ     E[q·k] = 0     Var[q·k] = d_k",
          note: "Each term qᵢkᵢ has mean 0 and variance 1 (for independent unit-variance factors). Variances of independent terms add, so the sum has variance d_k and standard deviation √d_k.",
        },
        {
          t: "p",
          text: "So for d_k = 64, dot products are typically spread over ±8. For d_k = 128, ±11.3. The magnitude of the scores grows with the dimension purely as an artefact of summing more terms — not because the tokens are more similar.",
        },
        { t: "h", text: "Why growing scores are a problem" },
        {
          t: "p",
          text: "Feed large-magnitude scores into softmax and it saturates. Consider scores [10, 2, 1]: e¹⁰ ≈ 22,026 versus e² ≈ 7.4 — the winner takes 0.9996 of the mass. That is effectively a hard argmax, and the gradient of a saturated softmax is nearly zero.",
        },
        {
          t: "math",
          formula: "∂softmax(z)ᵢ/∂zⱼ = softmax(z)ᵢ(δᵢⱼ − softmax(z)ⱼ)",
          note: "If softmax(z)ᵢ ≈ 1 for one index and ≈ 0 for the rest, every term in this Jacobian is ≈ 0. No gradient flows back through the attention weights, so the model cannot learn to attend differently. It is frozen into whatever it happened to pick at initialisation.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The fix, and why √d_k exactly",
          text: "Dividing by √d_k — the standard deviation of the raw scores — normalises them back to unit variance regardless of head dimension. The softmax then starts in its responsive region where gradients are healthy, and the same architecture behaves consistently whether d_k is 32 or 256. It is variance normalisation, exactly analogous to the reasoning behind Xavier and He weight initialisation.",
        },
        { t: "h", text: "What happens if you omit it" },
        {
          t: "list",
          items: [
            "Attention distributions become near-one-hot at initialisation, before any learning has happened.",
            "Gradients through attention weights vanish, so attention patterns barely move during training.",
            "The effect worsens as you increase head dimension — the model gets harder to train precisely as you scale it, which is the opposite of what you want.",
            "In extreme cases logits overflow FP16 and produce NaN.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The idea recurs everywhere",
          text: "Scaled dot-product attention, weight initialisation, LayerNorm, RMSNorm, and the temperature in contrastive losses are all the same manoeuvre: keep the scale of intermediate quantities in a range where gradients are informative. Almost every stability trick in deep learning is variance control. Once you see that, a lot of architecture choices stop looking arbitrary.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why √d_k?\" Do not say \"to keep values small\". Say: dot products of d_k-dimensional unit-variance vectors have variance d_k, so standard deviation √d_k; dividing restores unit variance, keeping softmax out of its saturated, zero-gradient regime. Then note the consequence — without it, larger heads become harder to train.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 16,
      title: "Multi-head attention",
      summary: "Why one attention operation is not enough, and why splitting it costs nothing.",
      blocks: [
        {
          t: "p",
          text: "A single attention operation produces one weighted average per token. But a token typically needs several unrelated kinds of information at once: which verb governs it, what pronoun refers to it, what the overall topic is. One softmax distribution has to compromise between all of them. Multi-head attention runs several attention operations in parallel, each free to specialise.",
        },
        {
          t: "math",
          formula: "MultiHead(Q,K,V) = Concat(head₁, …, head_h) W_O\nheadᵢ = Attention(X W_Qⁱ, X W_Kⁱ, X W_Vⁱ)",
          note: "Each head has its own projection matrices and operates in a reduced dimension d_k = d_model / h. Outputs are concatenated back to d_model and passed through a final output projection W_O that lets the model mix information across heads.",
        },
        { t: "h", text: "The dimension bookkeeping" },
        {
          t: "p",
          text: "This is where people get confused, so let us be concrete. GPT-2 small: d_model = 768, h = 12 heads, so d_k = 768/12 = 64 per head.",
        },
        {
          t: "code",
          lang: "python",
          caption: "How multi-head attention is actually implemented",
          code: `# One fused projection produces Q, K, V for ALL heads at once.
qkv = x @ W_qkv                    # (B, T, 3 * d_model)
q, k, v = qkv.chunk(3, dim=-1)     # each (B, T, d_model)

# Reshape to split d_model into (n_heads, d_head), then move heads
# next to the batch dimension so the matmul treats them as independent.
q = q.view(B, T, n_heads, d_head).transpose(1, 2)   # (B, h, T, d_head)
k = k.view(B, T, n_heads, d_head).transpose(1, 2)
v = v.view(B, T, n_heads, d_head).transpose(1, 2)

scores = q @ k.transpose(-2, -1) / math.sqrt(d_head)   # (B, h, T, T)
scores = scores.masked_fill(causal_mask, float('-inf'))
out    = torch.softmax(scores, dim=-1) @ v             # (B, h, T, d_head)

# Concatenate heads back together and project.
out = out.transpose(1, 2).contiguous().view(B, T, d_model)
out = out @ W_o                                         # (B, T, d_model)`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Multi-head attention is nearly free",
          text: "Because d_k = d_model / h, twelve heads of dimension 64 do the same total arithmetic as one head of dimension 768. You get twelve specialised attention patterns for the price of one — you are subdividing a fixed compute budget rather than multiplying it. The only real cost is that each head has less dimensionality to work with, which is why very large head counts eventually hurt.",
        },
        { t: "h", text: "What heads actually learn" },
        {
          t: "p",
          text: "Interpretability research has found genuinely interpretable heads in trained models. Some documented examples:",
        },
        {
          t: "list",
          items: [
            "**Previous-token heads** — attend almost entirely to position i−1, effectively giving the model a local n-gram view.",
            "**Syntactic heads** — attend from a verb to its subject, or from a preposition to its object, tracking dependency structure nobody supervised.",
            "**Coreference heads** — attend from a pronoun to its antecedent (`it` → `animal` from the previous lesson).",
            "**Induction heads** — the famous one. They detect that the current token appeared earlier and attend to whatever followed it then, implementing pattern completion `[A][B] … [A] → [B]`. Their appearance during training coincides with a sharp jump in in-context learning ability, and they are the best-understood mechanism behind few-shot prompting.",
            "**Delimiter / attention-sink heads** — attend to the first token or to punctuation, largely as a no-op. Softmax must sum to 1, so a head with nothing useful to do parks its weight somewhere. This is a real phenomenon with a real name (attention sinks) and it matters for streaming inference and for quantisation.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Do not over-read attention weights",
          text: "It is tempting to treat attention maps as explanations. Be careful: attention weights show where information was *read from*, not what was *done with it*, and the value vector's contribution can be small even where weight is large. There is a well-known literature (\"Attention is not Explanation\", and the reply \"Attention is not not Explanation\") on exactly this. Attention maps are a hypothesis-generating tool, not proof.",
        },
        { t: "h", text: "How many heads?" },
        {
          t: "table",
          head: ["Model", "d_model", "Heads", "d_head"],
          rows: [
            ["GPT-2 small", "768", "12", "64"],
            ["GPT-2 XL", "1600", "25", "64"],
            ["Llama-2-7B", "4096", "32", "128"],
            ["Llama-2-70B", "8192", "64", "128"],
            ["GPT-3 175B", "12288", "96", "128"],
          ],
        },
        {
          t: "p",
          text: "Notice that d_head stays pinned at 64 or 128 while d_model grows. Head count scales with width, head dimension does not. 128 appears to be around the sweet spot: enough dimensionality for a head to express a rich matching function, small enough that many heads fit. It is also a convenient size for tensor-core tiling, which is not a coincidence.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 20,
      title: "The full block, causal masking, and the three architectures",
      summary: "Assemble everything into the unit that gets stacked 96 times, then see why decoder-only won.",
      blocks: [
        {
          t: "p",
          text: "You now have attention. A transformer block wraps it with three things: a normalisation, a residual connection, and a feed-forward network — every one of which you met in Modules 1 and 2 as a solution to a gradient-flow problem.",
        },
        { t: "h", text: "The block" },
        {
          t: "code",
          lang: "python",
          caption: "A modern (pre-norm) transformer block, in full",
          code: `class Block(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.ln1  = RMSNorm(d_model)
        self.attn = MultiHeadAttention(d_model, n_heads)
        self.ln2  = RMSNorm(d_model)
        self.ffn  = FeedForward(d_model)      # SwiGLU, ~4x expansion

    def forward(self, x):                     # x: (B, T, C)
        x = x + self.attn(self.ln1(x))        # communicate ACROSS positions
        x = x + self.ffn(self.ln2(x))         # compute AT each position
        return x                              # (B, T, C) — shape preserved`,
        },
        {
          t: "note",
          tone: "insight",
          title: "The cleanest one-line summary of a transformer",
          text: "**Attention moves information between positions; the feed-forward network processes information within a position.** Attention is the only operation in the entire model that lets tokens see each other — everything else is applied independently per token. Internalise this and the architecture becomes obvious rather than memorised.",
        },
        { t: "h", text: "Causal masking" },
        {
          t: "p",
          text: "For a model that predicts the next token, position 5 must not see positions 6 onward, or the task is trivial and the model learns nothing. But we also want to train on all positions in parallel. The resolution is a mask applied to the attention scores.",
        },
        {
          t: "math",
          formula: "scores[i, j] ← −∞  for all j > i,  then softmax",
          note: "Setting a score to −∞ makes e^{−∞} = 0, so that position receives exactly zero attention weight. Note that the mask is applied *before* softmax, so the remaining weights still renormalise to sum to 1 over the visible positions.",
        },
        {
          t: "code",
          lang: "text",
          caption: "The causal mask for T=5 (1 = may attend)",
          code: `           key position
            0  1  2  3  4
       0 [  1  0  0  0  0 ]   token 0 sees only itself
query  1 [  1  1  0  0  0 ]
pos    2 [  1  1  1  0  0 ]
       3 [  1  1  1  1  0 ]
       4 [  1  1  1  1  1 ]   token 4 sees everything

Built as: torch.tril(torch.ones(T, T))`,
        },
        {
          t: "p",
          text: "This is the mechanism that makes parallel training possible. One forward pass over a 4,096-token document yields 4,096 independent next-token predictions, each correctly conditioned on only its own prefix. Compare that to an RNN's 4,096 sequential steps and you can see where the training-throughput advantage comes from.",
        },
        { t: "h", text: "The three architecture families" },
        {
          t: "table",
          head: ["", "Encoder-only", "Decoder-only", "Encoder–decoder"],
          rows: [
            ["Attention", "Bidirectional", "Causal", "Bidirectional encoder + causal decoder + cross-attention"],
            ["Objective", "Masked LM (fill blanks)", "Next-token prediction", "Span corruption / seq2seq"],
            ["Examples", "BERT, RoBERTa, DeBERTa", "GPT, Llama, Mistral, Claude", "T5, BART, original Transformer"],
            ["Best at", "Classification, NER, embeddings, reranking", "Generation, everything via prompting", "Translation, structured transduction"],
            ["Can generate?", "No", "Yes", "Yes"],
          ],
        },
        { t: "h", text: "Why decoder-only won" },
        {
          t: "steps",
          items: [
            {
              title: "1. Training signal density",
              text: "BERT masks ~15% of tokens and predicts only those, so 85% of the compute produces no loss signal. A causal LM produces a prediction at every position — roughly 6× more learning per FLOP.",
            },
            {
              title: "2. One architecture, every task",
              text: "Once you can generate text you can do classification (\"is this positive? answer yes or no\"), extraction, translation, and summarisation by prompting. Encoder-only models need a new task-specific head and a fine-tune per task.",
            },
            {
              title: "3. Simplicity scales",
              text: "One stack, one objective, no cross-attention plumbing, no separate encoder to size. Fewer moving parts means fewer things that break at 1,000-GPU scale."
            },
            {
              title: "4. In-context learning emerged there",
              text: "Few-shot prompting appeared in causal decoder models and is the capability that made LLMs commercially useful. Induction heads (previous lesson) are the mechanism, and causal attention is what makes the pattern-completion structure natural.",
            },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "But encoder-only models are not obsolete",
          text: "For embeddings and reranking, bidirectional attention is genuinely better — a token benefits from seeing the whole sentence, and you are not generating anything. Nearly every top model on the MTEB embedding leaderboard is BERT-lineage, and cross-encoder rerankers (Module 8) are encoder-only. Using a 70B decoder for a task a 110M encoder does better and 500× cheaper is a real and common mistake.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why are modern LLMs decoder-only rather than encoder–decoder like the original Transformer?\" Lead with training-signal density (loss at every position, not 15%), add task generality via prompting, and finish by noting that encoder-only models remain the right choice for embeddings and reranking. That last point separates people who understand the tradeoff from people who have memorised a trend.",
        },
      ],
    },

    {
      id: "l6",
      level: "core",
      minutes: 18,
      title: "Positional encoding: sinusoidal, learned, RoPE, ALiBi",
      summary: "Attention is order-blind by construction. How position gets put back in, and why RoPE won.",
      blocks: [
        {
          t: "p",
          text: "Here is an uncomfortable fact about the mechanism you just learned: it has no idea what order the tokens are in. Permute the input rows and the output rows permute identically — the attention scores QKᵀ depend only on *which* tokens are present, never on where. \"Dog bites man\" and \"man bites dog\" are, to bare self-attention, the same bag of vectors.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Permutation equivariance is a feature and a bug",
          text: "It is precisely what allows full parallelism — no sequential dependency means no ordering constraint. It also means order information must be injected explicitly. Every positional scheme is a different answer to \"how do I tell the model where tokens are without reintroducing sequentiality?\"",
        },
        { t: "h", text: "Option 1: sinusoidal (the original)" },
        {
          t: "math",
          formula: "PE(pos, 2i)   = sin(pos / 10000^{2i/d})\nPE(pos, 2i+1) = cos(pos / 10000^{2i/d})",
          note: "A fixed pattern added to the token embeddings before layer 1. Each dimension pair oscillates at a different frequency: early dimensions cycle rapidly (fine position), later ones slowly (coarse position). Effectively a continuous binary-counter representation of position.",
        },
        {
          t: "p",
          text: "The elegance is that relative position is linearly recoverable: PE(pos+k) is a fixed linear transformation of PE(pos) for any offset k, so the model *can* learn to compute relative distances. The weakness is that it is added at the input only, so by layer 40 the positional signal has been mixed and diluted through forty rounds of attention and MLP.",
        },
        { t: "h", text: "Option 2: learned absolute (GPT-1/2/3, BERT)" },
        {
          t: "p",
          text: "Just add a trainable embedding table of shape (max_seq_len, d_model). Simple and it works well within the trained range. The fatal flaw: position 2049 in a model trained to 2048 has no embedding at all. Zero extrapolation. This is a direct cause of the hard context limits on older models.",
        },
        { t: "h", text: "Option 3: RoPE — Rotary Position Embedding" },
        {
          t: "p",
          text: "RoPE is the current standard (Llama, Mistral, Qwen, Gemma, GPT-NeoX, and essentially every new open model). Instead of *adding* anything to the embeddings, it **rotates** the query and key vectors by an angle proportional to their position, inside every attention layer.",
        },
        {
          t: "math",
          formula: "treat (q_{2i}, q_{2i+1}) as a 2-D pair, rotate by angle m·θᵢ\nθᵢ = 10000^{−2i/d},  m = position",
          note: "Each consecutive pair of dimensions is treated as a point in a plane and rotated. Different pairs use different rotation speeds θᵢ, exactly mirroring the sinusoidal frequency ladder.",
        },
        {
          t: "math",
          formula: "(R_m q) · (R_n k) = qᵀ R_{n−m} k",
          note: "The property that makes RoPE work. Rotating the query by position m and the key by position n means their dot product depends only on the *difference* n−m. Absolute rotations applied separately produce a purely relative attention score, with no extra parameters and no extra terms in the score computation.",
        },
        {
          t: "list",
          items: [
            "**Relative by construction** — the model gets distance-awareness for free rather than having to learn it.",
            "**Applied in every layer** — the positional signal cannot be diluted away with depth.",
            "**Zero parameters** — it is a fixed geometric operation.",
            "**Extends gracefully** — because the mechanism is continuous in position, you can stretch it. NTK-aware scaling, linear interpolation, and YaRN all extend a 4k-trained model to 32k+ by adjusting θ, usually with a short fine-tune. This is how nearly every long-context open model was actually produced.",
          ],
        },
        { t: "h", text: "Option 4: ALiBi" },
        {
          t: "math",
          formula: "scores[i, j] += −m_h · (i − j)",
          note: "Add a linear penalty proportional to distance directly to the attention scores, with a different slope m_h per head. No embeddings, no rotation — just a distance-decay bias. Different heads get different slopes, so some are local and some are global.",
        },
        {
          t: "p",
          text: "ALiBi extrapolates remarkably well beyond its training length with no modification, which is its headline claim. In practice RoPE plus a scaling method has won out, largely because the ecosystem, kernels, and fine-tuning recipes are all built around it — but ALiBi remains a clean idea and appears in models like BLOOM and MPT.",
        },
        {
          t: "table",
          head: ["Scheme", "Type", "Extrapolates?", "Applied where", "Used by"],
          rows: [
            ["Sinusoidal", "Absolute, fixed", "Weakly", "Input embeddings", "Original Transformer"],
            ["Learned absolute", "Absolute, learned", "No", "Input embeddings", "GPT-2/3, BERT, ViT"],
            ["RoPE", "Relative, fixed", "With scaling (YaRN/NTK)", "Q and K, every layer", "Llama, Mistral, Qwen, Gemma"],
            ["ALiBi", "Relative bias", "Yes, natively", "Attention scores", "BLOOM, MPT"],
            ["NoPE", "None at all", "Surprisingly, somewhat", "—", "Research; causal masking leaks some order info"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The NoPE curiosity",
          text: "Decoder-only models with *no* positional encoding still perform respectably. The reason is that causal masking is itself order information: token 0 attends to 1 position, token 5 to 6 positions, so the number of visible tokens implicitly encodes position. The model can learn to read that. It is a nice demonstration that architectural constraints carry information.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why does everyone use RoPE?\" Give the identity: (R_m q)·(R_n k) = qᵀR_{n−m}k, so applying absolute rotations yields relative attention scores with zero added parameters. Then add the practical clincher — because it is continuous in position, it can be interpolated to extend context length after the fact, which learned absolute embeddings simply cannot do.",
        },
      ],
    },

    {
      id: "l7",
      level: "advanced",
      minutes: 20,
      title: "Making it fast: KV-cache, GQA, FlashAttention, long context",
      summary: "The optimisations that turn the architecture into something servable. Directly relevant to Module 14.",
      blocks: [
        {
          t: "p",
          text: "The architecture as described is correct and unusably slow for generation. Four optimisations bridge the gap, and all four appear in production inference stacks.",
        },
        { t: "h", text: "1. The KV-cache" },
        {
          t: "p",
          text: "Generating token 101 requires attending over tokens 1–100. Naively you re-run the whole model over the whole prefix, recomputing keys and values you already computed for token 100. But because attention is causal, the keys and values for earlier positions **never change** — nothing in the future can affect them. So cache them.",
        },
        {
          t: "table",
          head: ["", "Without cache", "With cache"],
          rows: [
            ["Work per new token", "O(T²) — reprocess the prefix", "O(T) — one new query against T cached keys"],
            ["Total for T tokens", "O(T³)", "O(T²)"],
            ["Memory", "Minimal", "Large and growing — the new bottleneck"],
          ],
        },
        {
          t: "math",
          formula: "KV-cache bytes = 2 × L × T × H_kv × d_head × B × bytes_per_value",
          note: "2 for K and V. L = layers, T = sequence length, H_kv = number of key/value heads, B = batch size. This grows linearly with both context length and batch size and quickly dominates GPU memory.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example — Llama-2-7B", text: "L = 32, H_kv = 32, d_head = 128, T = 2048, B = 8, FP16 (2 bytes)." },
            { title: "Compute", text: "2 × 32 × 2048 × 32 × 128 × 8 × 2 bytes = 8.6 × 10¹⁰ bytes ≈ **8.6 GB**." },
            { title: "The point", text: "The model weights are 13 GB. The KV-cache for a modest batch of 8 at only 2k context is another 8.6 GB. Push to 32k context and the cache alone is ~137 GB — far beyond the weights. This is why KV-cache management, not raw arithmetic, is the central problem of LLM serving." },
          ],
        },
        { t: "h", text: "2. MQA and GQA: shrinking the cache" },
        {
          t: "p",
          text: "The cache scales with the number of key/value heads. So use fewer of them than query heads — the queries stay diverse while sharing a smaller set of keys and values.",
        },
        {
          t: "table",
          head: ["Scheme", "Query heads", "KV heads", "Cache size", "Quality"],
          rows: [
            ["MHA (multi-head)", "32", "32", "1× (baseline)", "Baseline"],
            ["GQA (grouped-query)", "32", "8", "4× smaller", "Near-identical"],
            ["MQA (multi-query)", "32", "1", "32× smaller", "Noticeable degradation"],
          ],
        },
        {
          t: "p",
          text: "GQA is the sweet spot and is now near-universal: Llama-2-70B, Llama-3 (all sizes), Mistral, and most recent models use it. It is also a good example of the general pattern in inference optimisation — find the thing that scales badly, and make it share.",
        },
        { t: "h", text: "3. FlashAttention: never materialise the T×T matrix" },
        {
          t: "p",
          text: "The naive implementation computes the full (T × T) score matrix and writes it to GPU high-bandwidth memory, then reads it back for the softmax, then again for the multiply by V. For T = 8192 that matrix is 268 MB *per head per layer*, and the traffic — not the arithmetic — is the bottleneck.",
        },
        {
          t: "list",
          items: [
            "**Tiling** — process the attention computation in blocks small enough to fit in on-chip SRAM, which is roughly an order of magnitude faster than HBM.",
            "**Online softmax** — compute softmax incrementally with a running maximum and running sum, so you never need the whole row at once. This is the mathematical trick that makes tiling possible.",
            "**Recomputation** — in the backward pass, recompute the scores from Q and K rather than storing them. Cheaper than the memory traffic would have been.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "FlashAttention changes memory, not FLOPs",
          text: "It is exact — bit-for-bit the same result, not an approximation. It performs slightly *more* arithmetic than the naive version and is 2–4× faster anyway, because attention was memory-bound rather than compute-bound. Attention memory drops from O(T²) to O(T), which is what made 128k-token context windows practical. This is the single clearest illustration of the Module 1 point that on modern GPUs the bottleneck is usually data movement.",
        },
        { t: "h", text: "4. Approaches to long context" },
        {
          t: "table",
          head: ["Technique", "Idea", "Tradeoff"],
          rows: [
            ["Sliding-window attention", "Each token attends to the last W tokens only", "O(T·W) instead of O(T²); long range only via layer stacking (Mistral)"],
            ["Sparse / strided attention", "Attend to a fixed subset of positions", "Cheap; needs careful pattern design to avoid blind spots"],
            ["Position interpolation (YaRN, NTK)", "Rescale RoPE frequencies for longer inputs", "Cheap and effective; usually needs brief fine-tuning"],
            ["Linear attention / SSMs (Mamba)", "Replace softmax attention with an O(T) recurrence", "Genuinely linear; weaker at exact recall over long spans"],
            ["Retrieval (RAG)", "Do not extend context — fetch only what matters", "Often the correct engineering answer (Module 9)"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "A long context window is not the same as using it",
          text: "\"Lost in the middle\" is a robust, reproducible finding: models attend well to the beginning and end of a long context and much less well to the middle. A 200k-token window does not mean 200k tokens of reliable recall. Test your own workload with a needle-in-a-haystack evaluation before assuming otherwise — and note that this is a strong argument for retrieving 5 good chunks rather than stuffing 200 mediocre ones (Module 9).",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"What does the KV-cache store, and why does it help?\" Say: the key and value tensors for all previous positions, which are immutable under causal masking. It turns per-token generation from reprocessing the whole prefix into one query against cached keys. Then volunteer the cost — cache size grows linearly with context and batch, often exceeding the weights — and name GQA and PagedAttention as the responses. That progression from mechanism to cost to mitigation is what a senior answer looks like.",
        },
      ],
    },
  ],

  theory: [
    "Why RNNs/LSTMs were replaced: sequential computation (no parallelism) and information decay through a fixed-size hidden state.",
    "Attention's history: an add-on to RNN encoder-decoders (Bahdanau/Luong 2014-15) before becoming the whole architecture in 2017.",
    "Self-attention derived from first principles: a similarity-weighted average, with separate learned projections because one vector cannot serve as query, index, and payload simultaneously.",
    "Query, Key, Value — Q = 'what am I looking for', K = 'what do I advertise', V = 'what do I contribute'. Attention as differentiable soft dictionary lookup.",
    "Why divide by √dk: dot products of dk-dimensional unit-variance vectors have standard deviation √dk; without scaling, softmax saturates and its gradient vanishes.",
    "Multi-head attention: dk = d_model/h means h heads cost the same as one — you subdivide a fixed budget rather than multiplying it.",
    "What heads learn: previous-token, syntactic, coreference, induction heads (the mechanism behind in-context learning), and attention sinks.",
    "Why attention maps are not explanations — they show where information was read from, not what was done with it.",
    "The transformer block: attention moves information ACROSS positions; the FFN computes WITHIN a position. Everything else is per-token.",
    "Causal masking: setting scores to -inf before softmax, which is what makes parallel training over all positions possible.",
    "Encoder-only (BERT), decoder-only (GPT/Llama), encoder-decoder (T5) — and why decoder-only won (loss at every position, task generality, simplicity, in-context learning).",
    "Why encoder-only models are still correct for embeddings and reranking.",
    "Permutation equivariance: attention is order-blind, which is exactly what enables parallelism and exactly why positional encoding is needed.",
    "Positional encoding: sinusoidal vs learned absolute vs RoPE vs ALiBi; RoPE's key identity (R_m q)·(R_n k) = qᵀR_(n-m)k and why it can be interpolated to extend context.",
    "KV-cache: what it stores, why causality makes it valid, and why its memory footprint becomes the serving bottleneck.",
    "MQA/GQA for shrinking the KV-cache; FlashAttention for eliminating O(T²) memory traffic (exact, not approximate).",
    "Long-context approaches: sliding window, sparse attention, RoPE interpolation (YaRN), linear attention/SSMs, and 'just use retrieval'.",
    "'Lost in the middle': a large context window does not imply reliable recall across it.",
  ],

  math: [
    {
      title: "Scaled Dot-Product Attention",
      formula: "Attention(Q,K,V) = softmax(QKᵀ / √dk) V",
      note: "QKᵀ gives (T×T) similarity scores between every query and key. Dividing by √dk restores unit variance so softmax stays in its responsive, non-saturated region.",
    },
    {
      title: "Why √dk (variance argument)",
      formula: "Var[q·k] = dk  →  std = √dk",
      note: "A dot product sums dk products of unit-variance terms, so variance grows with dimension. Dividing by √dk normalises it, exactly analogous to Xavier/He initialisation.",
    },
    {
      title: "Softmax Jacobian (why saturation kills learning)",
      formula: "∂softmax(z)i/∂zj = si(δij - sj)",
      note: "If one si ≈ 1 and the rest ≈ 0, every term is ≈ 0 — no gradient reaches the attention weights, so attention patterns freeze at initialisation.",
    },
    {
      title: "Multi-head attention",
      formula: "MultiHead = Concat(head1..headh) W_O ; headi = Attention(XW_Qi, XW_Ki, XW_Vi)",
      note: "Each head has its own projections and works in dk = d_model/h dimensions, so total compute is unchanged. W_O lets the model mix information across heads.",
    },
    {
      title: "Sinusoidal positional encoding",
      formula: "PE(pos,2i)=sin(pos/10000^(2i/d)) ; PE(pos,2i+1)=cos(pos/10000^(2i/d))",
      note: "A frequency ladder — early dims cycle fast (fine position), later dims slowly (coarse). PE(pos+k) is a linear function of PE(pos), so relative distance is recoverable.",
    },
    {
      title: "RoPE relative-position identity",
      formula: "(R_m q) · (R_n k) = qᵀ R_(n-m) k",
      note: "Rotate q by its position and k by its position; the resulting score depends only on the difference. Relative positioning with zero parameters, applied in every layer.",
    },
    {
      title: "ALiBi bias",
      formula: "scores[i,j] += -m_h · (i - j)",
      note: "A per-head linear distance penalty added straight to the scores. Different slopes per head give a mix of local and global heads, and it extrapolates natively.",
    },
    {
      title: "Self-attention complexity",
      formula: "time O(T²·d) ; naive memory O(T²) ; FlashAttention memory O(T)",
      note: "Quadratic time is unavoidable for full attention; quadratic MEMORY is not, which is what FlashAttention fixes via tiling and online softmax. Same exact result, 2-4× faster.",
    },
    {
      title: "KV-cache memory",
      formula: "bytes = 2 × L × T × H_kv × d_head × B × bytes_per_value",
      note: "Llama-2-7B at T=2048, B=8, FP16 → ~8.6GB, versus 13GB of weights. GQA reduces H_kv (32→8) for a 4× saving at near-identical quality.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain in your own words what Query, Key, and Value represent, using the library analogy — and explain why a single vector cannot serve all three roles." },
    { type: "theory", q: "Why do we divide by √dk in scaled dot-product attention? Give the variance argument and state what happens to the softmax gradient if you omit it." },
    { type: "theory", q: "Why is self-attention permutation-equivariant, and why is that property simultaneously the source of its parallelism and the reason positional encoding is required?" },
    { type: "theory", q: "Compare RoPE vs sinusoidal positional encoding. State RoPE's key identity and explain why it enables post-hoc context extension." },
    { type: "theory", q: "Explain causal masking, why it is applied before softmax rather than after, and why an encoder-only model like BERT does not need it." },
    { type: "theory", q: "Summarise a transformer block in one sentence that distinguishes what attention does from what the FFN does." },
    { type: "theory", q: "What is an induction head, and why is it considered the mechanism behind in-context learning?" },
    { type: "theory", q: "Why is multi-head attention roughly free compared with single-head attention of the same d_model?" },
    { type: "math", q: "Given Q=[1,0], K=[[1,0],[0,1]], V=[[10,0],[0,20]], and dk=2, manually compute the attention output through all four steps." },
    { type: "math", q: "If sequence length doubles from 1,000 to 2,000 tokens, by what factor does self-attention compute cost increase? What about FlashAttention's memory?" },
    { type: "math", q: "Compute the KV-cache size for a model with 32 layers, 32 KV heads, d_head=128, T=4096, batch=4, in FP16. Then recompute with GQA using 8 KV heads." },
    { type: "math", q: "For d_model=4096 with 32 heads, what is d_head? Why has d_head stayed at 64-128 while d_model grew from 768 to 12288?" },
    { type: "theory", q: "Explain what the KV-cache stores, why causality makes caching valid, and why its memory footprint — not compute — is the main serving constraint." },
    { type: "theory", q: "Why are almost all modern LLMs decoder-only? Then argue the other side: name two tasks where an encoder-only model is the better choice and explain why." },
    { type: "theory", q: "FlashAttention is exact, performs slightly more arithmetic than the naive implementation, and is still 2-4× faster. Explain how all three statements can be true." },
    { type: "theory", q: "Explain 'lost in the middle' and why it is an argument for retrieval quality over context-window size." },
  ],

  resources: [
    { label: "Vaswani et al. 2017 — Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", kind: "paper" },
    { label: "Jay Alammar — The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", kind: "blog" },
    { label: "The Annotated Transformer (Harvard NLP) — paper as runnable PyTorch", url: "https://nlp.seas.harvard.edu/annotated-transformer/", kind: "blog" },
    { label: "Karpathy — nanoGPT (a full, readable GPT in ~300 lines)", url: "https://github.com/karpathy/nanoGPT", kind: "repo" },
    { label: "Karpathy — Let's build GPT: from scratch, in code, spelled out", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", kind: "course" },
    { label: "Su et al. 2021 — RoFormer: Rotary Position Embedding (RoPE)", url: "https://arxiv.org/abs/2104.09864", kind: "paper" },
    { label: "Press et al. 2021 — Train Short, Test Long (ALiBi)", url: "https://arxiv.org/abs/2108.12409", kind: "paper" },
    { label: "Dao et al. 2022 — FlashAttention", url: "https://arxiv.org/abs/2205.14135", kind: "paper" },
    { label: "Ainslie et al. 2023 — GQA: Grouped-Query Attention", url: "https://arxiv.org/abs/2305.13245", kind: "paper" },
    { label: "Elhage et al. — A Mathematical Framework for Transformer Circuits", url: "https://transformer-circuits.pub/2021/framework/index.html", kind: "paper" },
    { label: "Olsson et al. — In-context Learning and Induction Heads", url: "https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html", kind: "paper" },
    { label: "Liu et al. 2023 — Lost in the Middle", url: "https://arxiv.org/abs/2307.03172", kind: "paper" },
    { label: "d2l.ai — Attention Mechanisms and Transformers", url: "https://d2l.ai/chapter_attention-mechanisms-and-transformers/index.html", kind: "book" },
  ],
};

export default m04;
