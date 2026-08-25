const m02 = {
  id: "m02",
  week: 2,
  hours: 8,
  title: "Deep Learning Core: Neural Nets, Backprop & Optimization",
  tag: "Foundations",
  why: "Transformers are still neural networks. You need to be fluent in how they're trained before you can reason about why LLMs behave the way they do (hallucination, overfitting, scaling laws).",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "From perceptron to MLP: why depth and nonlinearity",
      summary: "Build up the network that sits inside every transformer block, and understand the one thing that makes depth worth having.",
      blocks: [
        {
          t: "p",
          text: "The perceptron, from 1958, is a weighted sum followed by a threshold. Take inputs, multiply each by a weight, add them up, add a bias, and fire if the total clears zero. It is a straight line drawn through your data. Everything since has been an answer to the question: what if the boundary you need is not a straight line?",
        },
        {
          t: "math",
          formula: "y = σ(Σᵢ wᵢxᵢ + b) = σ(w·x + b)",
          note: "w·x is the dot product from Module 1. b shifts the decision boundary away from the origin. σ is the activation function. This is one neuron; a layer is many of these stacked, which is exactly the matmul y = xW + b.",
        },
        { t: "h", text: "The XOR problem, and why it mattered" },
        {
          t: "p",
          text: "A single perceptron cannot learn XOR. Plot the four points — (0,0)→0, (0,1)→1, (1,0)→1, (1,1)→0 — and try to separate the 1s from the 0s with one straight line. It is impossible. Minsky and Papert proved this in 1969 and the field's funding collapsed for a decade. The fix is to stack layers: a hidden layer can transform the input space until the classes *become* linearly separable, then a final linear layer separates them.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The key realisation: depth is only useful with nonlinearity",
          text: "Stack two linear layers: y = (xW₁)W₂ = x(W₁W₂). The product W₁W₂ is just another matrix, so two linear layers are exactly equivalent to one. A hundred are equivalent to one. Without a nonlinear σ between them, depth buys you literally nothing. Every activation function exists to break that collapse.",
        },
        { t: "h", text: "The universal approximation theorem, and its catch" },
        {
          t: "p",
          text: "A network with a single hidden layer, given enough neurons, can approximate any continuous function to arbitrary precision. That sounds like it ends the discussion — but the theorem says nothing about *how many* neurons, or whether gradient descent can find the right weights. In practice, deep-and-narrow beats shallow-and-wide dramatically, because depth lets the network compose features hierarchically: edges → shapes → objects, or characters → words → syntax → semantics. Composition is exponentially more parameter-efficient than enumeration.",
        },
        { t: "h", text: "The MLP inside a transformer" },
        {
          t: "p",
          text: "Every transformer block contains one of these, and it is where most of the model's parameters live:",
        },
        {
          t: "code",
          lang: "python",
          caption: "The feed-forward network of a transformer block",
          code: `class FeedForward(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.up   = nn.Linear(d_model, 4 * d_model)   # expand
        self.down = nn.Linear(4 * d_model, d_model)   # contract
        self.act  = nn.GELU()

    def forward(self, x):                    # x: (B, T, d_model)
        return self.down(self.act(self.up(x)))

# Parameter count for d_model = 4096:
#   up:   4096 × 16384 = 67.1M
#   down: 16384 × 4096 = 67.1M
#   → 134M parameters per block, in the MLP alone.
# Attention in the same block is ~67M. So roughly two-thirds of a
# transformer's parameters are in these plain MLPs, not in attention.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Why 4× expansion?",
          text: "Empirical. The 4× ratio came from the original Transformer paper and stuck because it works. Modern models tweak it: Llama uses SwiGLU with a ~2.7× ratio but three matrices instead of two, landing at a similar parameter count with better measured quality. The wide middle layer is where the model does much of its factual lookup — interpretability work suggests these layers behave like key–value memories.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Where are most of an LLM's parameters?\" Many candidates say attention. The answer is the feed-forward layers — roughly 2/3 of non-embedding parameters. Follow it with the reason MoE (Module 5) replaces the FFN rather than attention: that is where the parameters, and therefore the sparsity opportunity, actually are.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "Activation functions: ReLU, GELU, SiLU and the gates",
      summary: "Small functions with outsized consequences for whether a deep network trains at all.",
      blocks: [
        {
          t: "p",
          text: "An activation function has one job — break linearity — but its exact shape controls gradient flow, and gradient flow controls whether a 96-layer model trains or produces NaN. The history of activations is a history of fixing the previous one's gradient problem.",
        },
        { t: "h", text: "Sigmoid and tanh: the ones that failed" },
        {
          t: "math",
          formula: "σ(x) = 1/(1 + e^{−x})     σ'(x) = σ(x)(1 − σ(x))",
          note: "Squashes to (0,1). The derivative peaks at 0.25 when x = 0 and collapses toward 0 for |x| > 4. Multiply many of these together during backprop and gradients vanish exponentially with depth — the reason deep networks were considered untrainable before 2010.",
        },
        {
          t: "p",
          text: "tanh is a rescaled sigmoid with range (−1, 1) and a maximum derivative of 1, which is better because it is zero-centred, but it still saturates. Both survive today only in specific roles: sigmoid for binary outputs and for gates (LSTM, SwiGLU), tanh inside some normalisation and GELU approximations.",
        },
        { t: "h", text: "ReLU: the one that unlocked depth" },
        {
          t: "math",
          formula: "ReLU(x) = max(0, x)     ReLU'(x) = 1 if x > 0 else 0",
          note: "For positive inputs the derivative is exactly 1 — gradients pass through completely unattenuated, no matter the depth. It is also almost free to compute (a comparison) and produces sparse activations, since roughly half of units output zero.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Dying ReLU",
          text: "If a unit's pre-activation goes negative for every input in the dataset, its gradient is exactly zero forever and the unit is permanently dead. A large learning-rate spike can kill a substantial fraction of a layer. Leaky ReLU (`max(0.01x, x)`) and GELU both address this by keeping a small nonzero gradient on the negative side.",
        },
        { t: "h", text: "GELU: what transformers actually use" },
        {
          t: "math",
          formula: "GELU(x) = x · Φ(x)     where Φ is the standard normal CDF",
          note: "Read it as a soft, probabilistic gate: rather than a hard on/off at zero, each input is scaled by the probability that a standard normal draw is below it. Φ(2) ≈ 0.98 passes almost everything through; Φ(−2) ≈ 0.02 suppresses almost everything; Φ(0) = 0.5 halves it.",
        },
        {
          t: "p",
          text: "GELU is smooth everywhere, non-monotonic near the origin (it dips slightly below zero around x ≈ −0.7), and has nonzero gradient for negative inputs. BERT, GPT-2, and GPT-3 all use it. In practice implementations use a tanh approximation because it is cheaper than an exact erf:",
        },
        {
          t: "math",
          formula: "GELU(x) ≈ 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))",
          note: "The `gelu_tanh` variant. Differences from exact GELU are negligible in practice, but note that switching between the two mid-training can perturb a fine-tune — match whatever the base checkpoint used.",
        },
        { t: "h", text: "SiLU/Swish and the gated variants" },
        {
          t: "math",
          formula: "SiLU(x) = x · σ(x)        SwiGLU(x) = (xW₁ ⊙ SiLU(xW₂))W₃",
          note: "SiLU (also called Swish) is GELU's simpler cousin, using the sigmoid instead of the normal CDF. SwiGLU multiplies two separate projections element-wise, one gating the other. Llama, Mistral, Qwen, and PaLM all use SwiGLU; it costs a third matrix but reliably improves quality per parameter.",
        },
        {
          t: "table",
          head: ["Activation", "Gradient at x < 0", "Used by", "Notes"],
          rows: [
            ["Sigmoid", "→ 0 (saturates)", "Gates, binary outputs", "Not for hidden layers; vanishing gradients"],
            ["tanh", "→ 0 (saturates)", "Legacy RNNs, GELU approximation", "Zero-centred but still saturates"],
            ["ReLU", "Exactly 0", "CNNs, older MLPs", "Fast, sparse, can die"],
            ["GELU", "Small, nonzero", "BERT, GPT-2/3", "Smooth; the transformer default"],
            ["SiLU / Swish", "Small, nonzero", "Component of SwiGLU", "Similar to GELU, cheaper"],
            ["SwiGLU", "Small, nonzero", "Llama, Mistral, PaLM, Qwen", "Best measured quality; 3 matrices"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The pattern across all of them",
          text: "Every improvement moves in the same direction: keep the gradient near 1 for the inputs you want to pass, and keep it small-but-nonzero for the rest. Nothing here is deep theory — these are engineering fixes for the multiplicative gradient decay you derived in Module 1.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 18,
      title: "Normalization: LayerNorm, RMSNorm, and pre-norm vs post-norm",
      summary: "Three architectural details that decide whether your deep model trains stably. They appear in every transformer diagram.",
      blocks: [
        {
          t: "p",
          text: "As a signal passes through many layers, its scale drifts — activations creep up or shrink, and once they do, gradients follow. Normalisation forcibly resets the scale at every layer. It is the least glamorous part of a transformer and among the most load-bearing.",
        },
        { t: "h", text: "BatchNorm and why transformers cannot use it" },
        {
          t: "math",
          formula: "BN(x) = γ · (x − μ_batch) / √(σ²_batch + ε) + β",
          note: "Normalises each feature across the batch dimension: μ and σ are computed over all examples in the batch for that feature. γ and β are learned scale and shift.",
        },
        {
          t: "list",
          items: [
            "**Depends on batch size** — statistics from a batch of 2 are noise. LLM training often uses tiny per-device batches with gradient accumulation.",
            "**Depends on sequence length** — text sequences have different lengths and padding, so per-feature statistics across a batch are contaminated by padding tokens.",
            "**Train/inference mismatch** — it must keep running averages for inference, an extra piece of state that misbehaves under distribution shift.",
            "**Breaks with variable-length autoregressive generation** — batch composition changes at every decoding step as sequences finish.",
          ],
        },
        { t: "h", text: "LayerNorm: normalise across features, per token" },
        {
          t: "math",
          formula: "LN(x) = γ · (x − μ) / √(σ² + ε) + β     with μ, σ² over the C feature dims",
          note: "For each token independently, compute the mean and variance across its own C hidden dimensions and standardise. Completely independent of batch size and of other tokens — which is exactly why it suits transformers.",
        },
        {
          t: "code",
          lang: "python",
          caption: "LayerNorm, fully explicit",
          code: `def layer_norm(x, gamma, beta, eps=1e-5):
    # x: (B, T, C) — normalise over the LAST dim only.
    mu  = x.mean(dim=-1, keepdim=True)         # (B, T, 1)
    var = x.var(dim=-1, keepdim=True, unbiased=False)
    return gamma * (x - mu) / (var + eps).sqrt() + beta

# Each token's 4096 features get mean 0 and variance 1, then are
# rescaled by learned per-feature gamma/beta. Token 5 in sequence 2
# is normalised using only its own 4096 numbers.`,
        },
        { t: "h", text: "RMSNorm: LayerNorm minus the mean subtraction" },
        {
          t: "math",
          formula: "RMSNorm(x) = γ · x / √( (1/C)Σᵢxᵢ² + ε )",
          note: "Drops the mean-centring and the β shift, keeping only the root-mean-square rescaling. Roughly 10–15% faster and one less reduction over the feature dimension, with no measured quality loss. Llama, Mistral, Gemma, and Qwen all use it; assume RMSNorm in any model designed after 2022.",
        },
        { t: "h", text: "Pre-norm vs post-norm: a small change with large consequences" },
        {
          t: "math",
          formula: "post-norm:  x ← LN(x + Attn(x))          pre-norm:  x ← x + Attn(LN(x))",
          note: "In post-norm (the 2017 original), normalisation sits on the residual path. In pre-norm, normalisation happens inside the branch and the residual path stays a clean identity from input to output.",
        },
        {
          t: "p",
          text: "That distinction is why pre-norm won. In post-norm the gradient must pass through a LayerNorm at every one of N layers, and its Jacobian scales gradients down; deep post-norm transformers need a long, carefully tuned warmup and still frequently diverge. In pre-norm there is an unbroken identity path from the loss to layer 1 — the residual highway of Module 1 with nothing standing in it. Every large model since GPT-2 is pre-norm.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The residual stream picture",
          text: "Pre-norm makes the residual path a shared communication bus that every block reads from and writes to additively. Attention writes information moved between positions; the MLP writes information computed at a position. This 'residual stream' framing is now the standard way to think about what happens inside a transformer, and it is the basis of most mechanistic interpretability work.",
        },
        {
          t: "table",
          head: ["Choice", "2017 Transformer", "Modern (Llama-class)"],
          rows: [
            ["Norm type", "LayerNorm", "RMSNorm"],
            ["Norm placement", "Post-norm", "Pre-norm (+ a final norm before the output head)"],
            ["Activation", "ReLU", "SwiGLU"],
            ["Positional info", "Sinusoidal, added to embeddings", "RoPE, applied inside attention"],
            ["Attention bias terms", "Present", "Usually removed"],
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why LayerNorm rather than BatchNorm in transformers?\" Lead with batch-size independence and variable sequence length; then add that LayerNorm needs no running statistics, so training and inference behave identically — which matters when batch composition changes at every decoding step.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 20,
      title: "Optimizers: SGD, momentum, Adam, AdamW",
      summary: "Why nobody trains an LLM with plain gradient descent, and why the W in AdamW is not cosmetic.",
      blocks: [
        {
          t: "p",
          text: "Plain gradient descent takes a step proportional to the gradient. That is a poor idea in practice for two reasons: gradients are noisy (you compute them from a minibatch), and different parameters need wildly different step sizes (an embedding for a rare token sees gradient almost never; a LayerNorm gain sees it constantly). Every real optimiser addresses one or both.",
        },
        { t: "h", text: "SGD with momentum" },
        {
          t: "math",
          formula: "v_t = βv_{t−1} + g_t      θ_t = θ_{t−1} − η·v_t",
          note: "Accumulate an exponentially-weighted moving average of past gradients and step along that instead of the raw gradient. β = 0.9 gives an effective average over roughly the last ten gradients.",
        },
        {
          t: "note",
          tone: "analogy",
          title: "Why momentum helps",
          text: "A ball rolling downhill does not stop and re-evaluate at every centimetre. In a long narrow valley — a very common loss landscape shape — the raw gradient points mostly across the valley, so plain SGD zigzags. Momentum cancels the oscillating across-valley components and accumulates the consistent along-valley component. You go faster in the direction that has been consistently useful.",
        },
        { t: "h", text: "Adam: per-parameter adaptive step sizes" },
        {
          t: "math",
          formula: "m_t = β₁m_{t−1} + (1−β₁)g_t\nv_t = β₂v_{t−1} + (1−β₂)g_t²\nm̂_t = m_t/(1−β₁ᵗ),  v̂_t = v_t/(1−β₂ᵗ)\nθ_t = θ_{t−1} − η · m̂_t/(√v̂_t + ε)",
          note: "m is the first moment (mean of gradients — momentum). v is the second moment (mean of squared gradients — a per-parameter scale estimate). Dividing by √v̂ means parameters with historically large gradients take smaller steps and vice versa. The hats are bias correction, needed because m and v start at zero and are otherwise badly underestimated for the first few hundred steps.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example — first two steps", text: "With β₁ = 0.9, g₁ = 0.5: m₁ = 0.9(0) + 0.1(0.5) = 0.05. Then g₂ = 0.3: m₂ = 0.9(0.05) + 0.1(0.3) = 0.075." },
            { title: "Note how small those are", text: "The true gradient scale is ~0.4 but m is 0.075 — a 5× underestimate. This is exactly the bias the correction term fixes: m̂₂ = 0.075/(1 − 0.9²) = 0.075/0.19 ≈ 0.395. Now it matches." },
            { title: "Why it matters", text: "Without bias correction the first steps would be tiny and then abruptly grow, which destabilises early training. It is also part of why warmup exists — v̂ is still a poor variance estimate for the first hundreds of steps." },
          ],
        },
        { t: "h", text: "AdamW: decoupled weight decay" },
        {
          t: "p",
          text: "The natural way to add L2 regularisation is to add λw to the gradient. Under Adam, that added term then gets divided by √v̂ along with everything else — so parameters with large gradient history get *less* weight decay, which is precisely backwards from what you want. AdamW fixes it by applying decay directly to the weights, outside the adaptive machinery.",
        },
        {
          t: "math",
          formula: "θ_t = θ_{t−1} − η·m̂_t/(√v̂_t + ε) − η·λ·θ_{t−1}",
          note: "The final term is the decoupled decay: a straight pull toward zero, unscaled by v̂. This is the standard optimiser for LLM training. Typical settings: β₁ = 0.9, β₂ = 0.95 for LLMs (lower than the 0.999 default, which responds too slowly), λ = 0.1, ε = 1e-8.",
        },
        {
          t: "note",
          tone: "warn",
          title: "The memory cost nobody mentions until the OOM",
          text: "Adam stores m and v for every parameter. In FP32 that is 8 bytes of optimiser state per parameter, on top of 4 bytes of weights and 4 of gradients — 16 bytes/parameter. A 7B model therefore needs ~112 GB before activations, which is why full fine-tuning a 7B model does not fit on a 80GB A100 and why LoRA (Module 11) exists. Mixed precision, 8-bit optimisers, and ZeRO sharding all attack this same number.",
        },
        {
          t: "table",
          head: ["Optimizer", "State/param", "Typical use"],
          rows: [
            ["SGD", "0 bytes", "Classic vision models; rarely LLMs"],
            ["SGD + momentum", "4 bytes", "ResNets, some vision transformers"],
            ["Adam / AdamW", "8 bytes", "LLM pretraining and fine-tuning — the default"],
            ["8-bit AdamW (bitsandbytes)", "2 bytes", "Fine-tuning on constrained GPUs; QLoRA"],
            ["Adafactor", "≈ √-scaled", "Very large models where optimiser memory dominates (T5)"],
          ],
        },
        { t: "h", text: "Learning-rate schedules" },
        {
          t: "p",
          text: "The learning rate is not a constant. Nearly every LLM run uses linear warmup followed by cosine decay:",
        },
        {
          t: "math",
          formula: "warmup: η_t = η_max · t/t_warm\ncosine: η_t = η_min + ½(η_max − η_min)(1 + cos(π·t/T))",
          note: "Warmup typically covers the first 1–2% of steps (a few hundred to a few thousand). Cosine then decays smoothly, usually to about 10% of the peak.",
        },
        {
          t: "list",
          items: [
            "**Why warmup?** Adam's v̂ estimate is unreliable at the start, so full-size steps in a badly-estimated direction can wreck the model in the first hundred updates. Warmup also protects against the large gradients from randomly-initialised layers.",
            "**Why decay?** Early on you want to travel far; later you want to settle into a minimum rather than bounce around it. Decaying is the difference between converging and orbiting.",
            "**Why cosine specifically?** Largely empirical, but its slow start and slow finish behave well. Note that cosine bakes in a fixed total step count, so you cannot cleanly extend a run afterwards — one reason some labs prefer WSD (warmup–stable–decay) schedules.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"What does the W in AdamW change?\" Answer: it decouples weight decay from the adaptive step. In Adam, L2 added to the gradient gets divided by √v̂, so heavily-updated parameters receive weaker regularisation — the opposite of the intent. AdamW applies decay directly to the weights.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 18,
      title: "Training mechanics: precision, batching, and memory",
      summary: "The practical knobs that decide whether your run fits on the hardware you actually have.",
      blocks: [
        {
          t: "p",
          text: "Everything so far has been mathematics. This lesson is engineering — and it is what separates people who have trained models from people who have read about training models.",
        },
        { t: "h", text: "Mixed precision: FP32, FP16, BF16, FP8" },
        {
          t: "table",
          head: ["Format", "Bits", "Exponent / Mantissa", "Character"],
          rows: [
            ["FP32", "32", "8 / 23", "Wide range, high precision, 4 bytes. The baseline."],
            ["FP16", "16", "5 / 10", "Half the memory but a narrow range — overflows above ~65,504, underflows below ~6e-5. Needs loss scaling."],
            ["BF16", "16", "8 / 7", "Same exponent range as FP32, less mantissa precision. No loss scaling needed. The modern default."],
            ["FP8 (E4M3/E5M2)", "8", "4/3 or 5/2", "Hopper/Blackwell-class hardware; mostly inference and some training. Needs per-tensor scaling."],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why BF16 beat FP16 for training",
          text: "Deep learning turns out to need dynamic *range* far more than it needs mantissa *precision*. Gradients span many orders of magnitude; getting each one accurate to seven digits does not matter, but silently flushing small ones to zero does. BF16 sacrifices precision to keep FP32's range, which removes the entire fragile machinery of dynamic loss scaling. If your hardware supports BF16, use it.",
        },
        {
          t: "p",
          text: "\"Mixed\" precision means the weights and activations are BF16 while a master copy of the weights and the optimiser state stay FP32, and reductions such as the loss and the softmax are computed in FP32. You get roughly 2× throughput and halved activation memory without the numerical degradation of running everything at 16 bits.",
        },
        { t: "h", text: "Where GPU memory actually goes" },
        {
          t: "math",
          formula: "mem ≈ params·(2 + 4) + grads·2 + optimizer·8 + activations + KV-cache",
          note: "For BF16 mixed-precision AdamW: 2 bytes BF16 weights + 4 bytes FP32 master copy + 2 bytes gradients + 8 bytes Adam state ≈ 16 bytes/parameter, before activations. A 7B model needs ~112 GB of static state — more than a single 80 GB A100 or H100.",
        },
        {
          t: "steps",
          items: [
            { title: "Activation memory is the variable part", text: "Activations scale with batch_size × seq_len × hidden × layers. They dominate at long context, and they are the reason a run that fits at 2k context OOMs at 8k." },
            { title: "Gradient checkpointing trades compute for memory", text: "Discard intermediate activations during the forward pass and recompute them during the backward pass. Costs roughly 30% extra time, saves a large multiple in activation memory. Almost always worth enabling for fine-tuning." },
            { title: "Then reduce the static part", text: "LoRA removes optimiser state for the frozen base (Module 11). 8-bit optimisers cut Adam state from 8 to 2 bytes. ZeRO/FSDP shards weights, gradients, and optimiser state across GPUs." },
          ],
        },
        { t: "h", text: "Batch size and gradient accumulation" },
        {
          t: "math",
          formula: "effective_batch = micro_batch × grad_accum_steps × num_gpus",
          note: "Gradient accumulation runs several micro-batches, summing gradients without stepping, then applies one optimiser step. Mathematically near-identical to one large batch (exactly identical if there are no batch-dependent ops), but with the memory footprint of the micro-batch.",
        },
        {
          t: "p",
          text: "So micro_batch = 8, grad_accum = 4, on 8 GPUs gives an effective batch of 256. This is the standard trick for reproducing a published recipe's batch size on hardware you can afford. Note that learning rate should be tuned against the *effective* batch, not the micro-batch — a common and expensive mistake when adapting a config.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Two things that silently break gradient accumulation",
          text: "First, loss must be divided by the number of accumulation steps, or your gradients are N× too large. Most frameworks handle this; verify rather than assume. Second, if your loss is a mean over tokens and micro-batches have different token counts, naive averaging over-weights short batches — you need token-count-weighted normalisation. This bug has quietly degraded many public fine-tunes.",
        },
        { t: "h", text: "Multi-GPU parallelism, briefly" },
        {
          t: "table",
          head: ["Strategy", "What is split", "Communication", "Use when"],
          rows: [
            ["Data parallel (DDP)", "The batch", "All-reduce gradients once per step", "Model fits on one GPU"],
            ["ZeRO / FSDP", "Optimizer state, gradients, weights", "Gather/scatter parameters per layer", "Model does not fit but a layer does"],
            ["Tensor parallel", "Individual matrices", "All-reduce twice per layer — needs NVLink", "A single layer is too large; low-latency inference"],
            ["Pipeline parallel", "Layers across GPUs", "Activations at stage boundaries only", "Very deep models across nodes; tolerate bubbles"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The ordering heuristic",
          text: "Reach for them in this order: DDP → gradient checkpointing → ZeRO/FSDP → tensor parallel → pipeline parallel. Communication cost rises steeply down the list. Module 14 revisits tensor and pipeline parallelism from the inference side, where the tradeoffs invert because latency, not throughput, is what you are optimising.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 18,
      title: "Scaling laws: Kaplan, Chinchilla, and the modern deviation",
      summary: "The empirical relationships that turned model design from craft into budgeting — and why current practice deliberately ignores them.",
      blocks: [
        {
          t: "p",
          text: "In 2020 OpenAI published something unusual for deep learning: a clean, predictive power law. Loss falls smoothly and predictably as you increase parameters, data, or compute. That single result changed the field's economics — you could now forecast the capability of a model you had not trained, and justify a nine-figure training budget in advance.",
        },
        { t: "h", text: "The functional form" },
        {
          t: "math",
          formula: "L(N, D) ≈ E + A/N^α + B/D^β",
          note: "N = parameters, D = training tokens. E is irreducible loss (the entropy of language itself — no model gets below it). The other two terms are the penalties for finite model size and finite data. Chinchilla's fitted exponents are α ≈ 0.34 and β ≈ 0.28.",
        },
        {
          t: "p",
          text: "Because these are power laws, they are straight lines on a log-log plot, over many orders of magnitude. That regularity is what makes them useful: train a handful of small models, fit the curve, extrapolate.",
        },
        { t: "h", text: "Kaplan (2020) vs Chinchilla (2022)" },
        {
          t: "p",
          text: "Kaplan et al. concluded that when compute increases, most of it should go into parameters and comparatively little into data. The field built GPT-3 (175B parameters, 300B tokens) on that basis. Two years later, Hoffmann et al. re-ran the experiment with a properly tuned learning-rate schedule for each model size and found Kaplan's analysis had been distorted by a schedule artefact.",
        },
        {
          t: "math",
          formula: "compute-optimal:  D ≈ 20 · N     (given C ≈ 6ND)",
          note: "Chinchilla's headline result: for a fixed compute budget, parameters and tokens should scale in roughly equal proportion, at about 20 training tokens per parameter. Chinchilla itself was 70B parameters on 1.4T tokens and outperformed the 175B GPT-3 while being less than half the size.",
        },
        {
          t: "table",
          head: ["Model", "Params", "Tokens", "Tokens/param", "Verdict"],
          rows: [
            ["GPT-3 (2020)", "175B", "300B", "1.7", "Severely under-trained"],
            ["Chinchilla (2022)", "70B", "1.4T", "20", "Compute-optimal by construction"],
            ["Llama-2-7B (2023)", "7B", "2T", "286", "Deliberately over-trained"],
            ["Llama-3-8B (2024)", "8B", "15T", "1,875", "Extremely over-trained"],
          ],
        },
        { t: "h", text: "Why everyone now ignores Chinchilla on purpose" },
        {
          t: "p",
          text: "Chinchilla answers \"what minimises loss for a fixed *training* budget?\". That is often the wrong question. If you will serve a model to millions of users, inference cost dwarfs training cost, and inference cost scales with parameter count, not with how many tokens you trained on. So it pays to spend far more on training a *smaller* model than Chinchilla would recommend — you pay once at training time and save forever at serving time.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The real objective is total lifetime cost",
          text: "Chinchilla-optimal minimises training FLOPs for a target loss. Production wants to minimise training + (inference × expected request volume). For a widely-deployed model that second term dominates, which is exactly why Llama-3-8B was trained on 15T tokens — nearly 100× past the Chinchilla point. The returns are diminishing but they are not zero, and the inference savings are permanent."
        },
        {
          t: "steps",
          items: [
            { title: "Applying the heuristic — which run is closer to optimal?", text: "7B on 1T tokens is 143 tokens/param. 70B on 300B tokens is 4.3 tokens/param." },
            { title: "Answer", text: "Neither is at 20, but the 70B/300B run is closer in ratio terms while being the more badly misallocated in practice: it is under-trained, meaning those 70B parameters are not being used to their potential. The 7B run is over-trained, which wastes some training compute but produces a genuinely strong, cheap-to-serve model. Over-training is the benign error; under-training is the expensive one." },
          ],
        },
        { t: "h", text: "Where scaling laws stop being reliable" },
        {
          t: "list",
          items: [
            "**Data quality is not in the equation.** D counts tokens, not information. Deduplication, filtering, and curriculum choices move loss more than a modest change in N — and the laws are silent on all of it.",
            "**Repeated data breaks the fit.** Beyond roughly 4 epochs on the same tokens, additional repeats contribute almost nothing, so 'more tokens' must mean *distinct* tokens. This is the data-wall argument.",
            "**Loss is not capability.** The laws predict cross-entropy smoothly, yet downstream benchmark performance can jump sharply at particular scales. Whether such 'emergence' is real or an artefact of discontinuous metrics is still argued.",
            "**Post-training is outside the framework.** Instruction tuning, RLHF, and inference-time reasoning (extended chain-of-thought) all buy large capability gains at fixed N and D. Test-time compute scaling is now its own scaling axis.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"If your compute budget doubles, do you scale model or data?\" Say: Chinchilla says both, roughly equally, at ~20 tokens/param. Then show the judgement that gets you hired — if the model will be served at scale, deliberately under-scale parameters and over-train on data, because inference cost tracks N and you pay it on every request forever.",
        },
      ],
    },
  ],

  theory: [
    "Perceptron → Multi-Layer Perceptron (MLP): layers, weights, biases, and why stacked linear layers collapse into one without a nonlinearity.",
    "Activation functions (ReLU, GELU, SiLU/Swish, SwiGLU) — GELU/SwiGLU are what modern transformers use, and every improvement is about gradient flow.",
    "The transformer's FFN holds ~2/3 of non-embedding parameters — which is why MoE replaces the FFN, not attention.",
    "Forward pass vs backward pass; computational graphs and automatic differentiation (autograd).",
    "Vanishing/exploding gradients and why they motivated residual connections and normalization layers.",
    "Layer Normalization vs Batch Normalization — why transformers use LayerNorm (batch-size and sequence-length independence, no running stats).",
    "RMSNorm as the modern simplification of LayerNorm, and pre-norm vs post-norm (why pre-norm won: an unbroken identity residual path).",
    "Optimizers: SGD with momentum, Adam (first/second moments + bias correction), AdamW (decoupled weight decay) — AdamW is the de facto LLM standard.",
    "Optimizer memory: ~16 bytes/param for BF16 mixed-precision AdamW, and why that number forces LoRA, 8-bit optimizers, and ZeRO/FSDP.",
    "Learning rate schedules: warmup + cosine decay, and why warmup matters for Adam's variance estimates.",
    "Batch size, gradient accumulation, effective batch size, and the loss-normalisation bugs that silently break accumulation.",
    "Mixed-precision training: FP32 vs FP16 vs BF16 vs FP8, and why range beats precision for deep learning.",
    "Multi-GPU parallelism: DDP → gradient checkpointing → ZeRO/FSDP → tensor parallel → pipeline parallel, in order of communication cost.",
    "Scaling laws (Kaplan vs Chinchilla): L(N,D) ≈ E + A/N^α + B/D^β, the ~20 tokens/param rule, and why production deliberately over-trains small models.",
  ],

  math: [
    {
      title: "ReLU, GELU & SwiGLU",
      formula: "ReLU(x)=max(0,x) | GELU(x)=x·Φ(x) | SwiGLU(x)=(xW1 ⊙ SiLU(xW2))W3",
      note: "Φ(x) is the standard normal CDF, so GELU is a soft probabilistic gate. SwiGLU adds a learned multiplicative gate and is used by Llama/Mistral/PaLM.",
    },
    {
      title: "LayerNorm vs RMSNorm",
      formula: "LN: γ(x-μ)/√(σ²+ε)+β    RMS: γ·x/√(mean(x²)+ε)",
      note: "Both normalise across the feature dimension per token (never across the batch). RMSNorm drops mean-centring and the shift: ~10-15% faster, no measured quality loss.",
    },
    {
      title: "Pre-norm vs post-norm",
      formula: "post: x←LN(x+F(x))    pre: x←x+F(LN(x))",
      note: "Pre-norm keeps an unbroken identity path from loss to layer 1, which is why every model since GPT-2 uses it. Post-norm deep stacks diverge without careful warmup.",
    },
    {
      title: "Adam / AdamW update",
      formula: "mt=β1mt-1+(1-β1)gt ; vt=β2vt-1+(1-β2)gt² ; m̂=mt/(1-β1^t) ; θt=θt-1-η·m̂t/(√v̂t+ε) - η·λ·θt-1",
      note: "m and v are running first and second moment estimates. Bias correction (the hats) is needed because both start at zero. The final term is AdamW's decoupled weight decay.",
    },
    {
      title: "Residual connection",
      formula: "y = x + F(x)  →  ∂y/∂x = 1 + ∂F/∂x",
      note: "The unit term is a gradient highway: it lets gradients flow to any depth unattenuated, which is why 96-layer transformers train at all.",
    },
    {
      title: "Warmup + cosine schedule",
      formula: "warmup: η·t/t_warm ; cosine: η_min + ½(η_max-η_min)(1+cos(πt/T))",
      note: "Warmup covers the first 1-2% of steps while Adam's variance estimates settle. Cosine decays to ~10% of peak so the model settles into a minimum instead of orbiting it.",
    },
    {
      title: "Effective batch size",
      formula: "effective = micro_batch × grad_accum × num_gpus",
      note: "Tune the learning rate against the effective batch, not the micro-batch. Remember to divide the loss by grad_accum, or gradients are N× too large.",
    },
    {
      title: "Training memory footprint",
      formula: "≈16 bytes/param (BF16 weights 2 + FP32 master 4 + grads 2 + Adam 8) + activations",
      note: "A 7B model needs ~112GB of static state before activations — more than one 80GB GPU. This single number motivates LoRA, 8-bit optimizers, and FSDP.",
    },
    {
      title: "Scaling law",
      formula: "L(N,D) ≈ E + A/N^α + B/D^β ; compute-optimal D ≈ 20N ; C ≈ 6ND",
      note: "E is the irreducible entropy of language. Chinchilla fitted α≈0.34, β≈0.28 and found parameters and tokens should scale roughly together.",
    },
  ],

  practice: [
    { type: "theory", q: "Why do transformers use LayerNorm instead of BatchNorm? Give at least three distinct reasons." },
    { type: "theory", q: "Explain why residual ('skip') connections solve the vanishing gradient problem in deep networks — state the derivative." },
    { type: "theory", q: "Explain why stacking two linear layers with no activation between them is equivalent to a single linear layer." },
    { type: "theory", q: "What problem does a learning-rate warmup phase solve at the start of transformer training?" },
    { type: "theory", q: "Explain the difference between pre-norm and post-norm placement, and why every model after GPT-2 uses pre-norm." },
    { type: "theory", q: "Why did BF16 replace FP16 as the default training precision, despite having fewer mantissa bits?" },
    { type: "theory", q: "Where do most of an LLM's parameters live — attention or the feed-forward layers? Give approximate proportions and explain the consequence for MoE design." },
    { type: "math", q: "Given gradients g1=0.5, g2=0.3 across two Adam steps with β1=0.9, compute m1 and m2 by hand, then apply bias correction to m2." },
    { type: "math", q: "A model trains at micro-batch 8 with gradient accumulation of 4 steps on 8 GPUs. What is the effective batch size?" },
    { type: "math", q: "Estimate the static GPU memory (weights + gradients + Adam state) for full fine-tuning a 7B model in BF16 mixed precision. Then estimate it for LoRA with 20M trainable parameters." },
    { type: "math", q: "For a transformer block with d_model=4096 and a 4× FFN expansion, compute the parameter count of the two FFN matrices." },
    { type: "math", q: "For ReLU(x), what is the derivative when x>0 and when x<0? Why does this cause the 'dying ReLU' problem?" },
    { type: "math", q: "Using the ~20 tokens/param Chinchilla heuristic, is a 7B model on 1T tokens or a 70B model on 300B tokens closer to compute-optimal? Which error is more costly in production, and why?" },
    { type: "theory", q: "According to Chinchilla scaling laws, if you double your compute budget, should you scale model size or data size more? Then explain why a company serving millions of users would deliberately deviate from that answer." },
    { type: "theory", q: "Name three limitations of scaling laws — things the formula L(N,D) does not capture." },
  ],

  resources: [
    { label: "Dive into Deep Learning — MLPs, Optimization, Computational Performance", url: "https://d2l.ai/chapter_multilayer-perceptrons/index.html", kind: "book" },
    { label: "Karpathy — Let's build GPT: from scratch, in code, spelled out", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", kind: "course" },
    { label: "Loshchilov & Hutter 2017 — Decoupled Weight Decay Regularization (AdamW)", url: "https://arxiv.org/abs/1711.05101", kind: "paper" },
    { label: "Ba et al. 2016 — Layer Normalization", url: "https://arxiv.org/abs/1607.06450", kind: "paper" },
    { label: "Zhang & Sennrich 2019 — Root Mean Square Layer Normalization", url: "https://arxiv.org/abs/1910.07467", kind: "paper" },
    { label: "Xiong et al. 2020 — On Layer Normalization in the Transformer Architecture (pre- vs post-norm)", url: "https://arxiv.org/abs/2002.04745", kind: "paper" },
    { label: "Shazeer 2020 — GLU Variants Improve Transformer (SwiGLU)", url: "https://arxiv.org/abs/2002.05202", kind: "paper" },
    { label: "Kaplan et al. 2020 — Scaling Laws for Neural Language Models", url: "https://arxiv.org/abs/2001.08361", kind: "paper" },
    { label: "Hoffmann et al. 2022 — Training Compute-Optimal LLMs (Chinchilla)", url: "https://arxiv.org/abs/2203.15556", kind: "paper" },
    { label: "HuggingFace — Ultra-Scale Playbook (parallelism, memory, throughput)", url: "https://huggingface.co/spaces/nanotron/ultrascale-playbook", kind: "docs" },
  ],
};

export default m02;
