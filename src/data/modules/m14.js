const m14 = {
  id: "m14",
  week: 14,
  hours: 10,
  title: "Nvidia VLM Pipelines: NeMo, TensorRT-LLM, Triton & GPU Inference",
  tag: "Deployment",
  why: "This directly matches your former team's stack. Model architecture knowledge (Module 13) means little without knowing how these models are actually optimized and served at scale on Nvidia hardware.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "GPU fundamentals and the roofline model",
      summary: "One diagram explains why LLM inference is slow, and why almost every optimisation targets memory rather than arithmetic.",
      blocks: [
        {
          t: "p",
          text: "There is a single fact that, once understood, makes the entire LLM-serving industry make sense: **generating a token is limited by memory bandwidth, not by arithmetic**. Everything from batching to quantisation to speculative decoding is a response to that.",
        },
        { t: "h", text: "The hardware" },
        {
          t: "table",
          head: ["Component", "H100 SXM (approx.)", "Role"],
          rows: [
            ["BF16 Tensor Core throughput", "~990 TFLOP/s", "Matrix multiply-accumulate — the arithmetic"],
            ["FP8 Tensor Core throughput", "~1,980 TFLOP/s", "Double rate at half precision"],
            ["HBM3 capacity", "80 GB", "Where weights and KV-cache live"],
            ["HBM3 bandwidth", "~3.35 TB/s", "How fast data reaches the compute units"],
            ["L2 cache", "50 MB", "On-chip; much faster than HBM"],
            ["SRAM per SM", "~228 KB", "On-chip scratchpad — what FlashAttention exploits"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Look at the ratio",
          text: "990 TFLOP/s of compute against 3.35 TB/s of bandwidth. That is roughly **295 FLOPs of capacity for every byte you can move**. To keep the arithmetic units busy, every byte fetched from memory must be used in ~295 operations. If your workload does less arithmetic per byte than that, you are waiting on memory and the expensive tensor cores are idle.",
        },
        { t: "h", text: "Arithmetic intensity and the roofline" },
        {
          t: "math",
          formula: "AI = FLOPs / bytes_moved     compute-bound if AI > peak_FLOPS / peak_bandwidth",
          note: "For an H100 the crossover is around 295 FLOPs/byte. Below it, performance is bandwidth × AI. Above it, performance is capped at peak FLOPs. Plotting achievable performance against AI gives the characteristic 'roofline' shape: a diagonal memory-bound ramp meeting a flat compute-bound ceiling.",
        },
        {
          t: "steps",
          items: [
            {
              title: "Prefill: processing the prompt",
              text: "A 2,000-token prompt goes through the model as a (2000 × d) matrix. Each weight matrix is loaded once and used for 2,000 rows of arithmetic. AI is high — hundreds of FLOPs per byte. **Compute-bound**, and the GPU is well utilised.",
            },
            {
              title: "Decode: generating one token",
              text: "A single token is a (1 × d) vector. You load the *entire* model's weights from HBM to perform one matrix-vector product per layer. AI ≈ 2 FLOPs per byte — roughly 150× below the crossover. **Memory-bound**, and the tensor cores are almost entirely idle.",
            },
            {
              title: "The arithmetic",
              text: "A 7B model in FP16 is 14 GB. At 3.35 TB/s you can read it about 240 times per second, so an absolute upper bound of ~240 tokens/second for a single sequence — regardless of how much compute the GPU has. Adding FLOPs does nothing.",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Every serving optimisation follows from this",
          text: "**Batching** — process 32 sequences with one weight load, so AI rises 32× and you approach compute-bound. **Quantisation** — INT4 weights are a quarter of the bytes, so you read them 4× faster; this is why quantisation speeds up decoding even when the arithmetic is unchanged. **Speculative decoding** — verify k tokens in one pass, because a batch of k costs nearly the same as a batch of 1 when memory-bound. **KV-cache management** — the cache is the other thing you read every step, and it grows. Four apparently unrelated techniques, one underlying cause.",
        },
        { t: "h", text: "CUDA cores and Tensor Cores" },
        {
          t: "list",
          items: [
            "**CUDA cores** — general-purpose scalar/vector ALUs. Handle elementwise operations: activations, normalisation, residual adds, softmax.",
            "**Tensor Cores** — dedicated units performing a small matrix multiply-accumulate as one instruction. An order of magnitude faster for matmuls, and the reason a GPU is worth its price for deep learning.",
            "**Consequence** — matmuls run on tensor cores and everything else runs on CUDA cores, which is why *kernel fusion* matters: merging elementwise operations into the matmul kernel avoids extra round-trips to HBM for operations that do almost no arithmetic.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why is LLM inference slow even on a fast GPU?\" Do not say \"the model is big\". Say: decoding is a matrix-*vector* product, so arithmetic intensity is ~2 FLOPs/byte against a crossover near 295, making it memory-bandwidth-bound; the GPU spends most of its time waiting on HBM. Then note that this is exactly why batching, quantisation, and speculative decoding all help.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 18,
      title: "Prefill, decode, and continuous batching",
      summary: "The two phases have opposite characteristics, and serving well means treating them differently.",
      blocks: [
        {
          t: "p",
          text: "An LLM request is two distinct computational workloads glued together. Confusing them is the source of most bad capacity planning.",
        },
        {
          t: "table",
          head: ["", "Prefill", "Decode"],
          rows: [
            ["Input", "The whole prompt at once", "One token at a time"],
            ["Parallelism", "All positions simultaneously", "Strictly sequential"],
            ["Bottleneck", "Compute", "Memory bandwidth"],
            ["Cost scales with", "Prompt length (quadratically for attention)", "Output length (linearly)"],
            ["User-visible metric", "TTFT", "ITL / tokens per second"],
            ["Batching benefit", "Modest — already compute-bound", "Enormous — amortises weight loading"],
            ["GPU utilisation", "High", "Very low without batching"],
          ],
        },
        {
          t: "math",
          formula: "TTFT ≈ prefill_time      total = TTFT + n_output × ITL",
          note: "A 4,000-token prompt might take 400ms to prefill; a 500-token response at 30ms/token takes 15s. Optimising the two requires different techniques, and streaming (Module 12) exists because TTFT is what the user feels.",
        },
        { t: "h", text: "Static batching and why it wastes the GPU" },
        {
          t: "p",
          text: "The naive approach: collect N requests, run them together, return all results, repeat. It fails badly for generation because sequences finish at different times.",
        },
        {
          t: "code",
          lang: "text",
          caption: "Static batching — the wasted slots are the problem",
          code: `Batch of 4. Output lengths: 20, 200, 50, 180 tokens.

req1  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  done at 20, idle for 180
req2  ████████████████████████████████████████  done at 200
req3  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  done at 50, idle for 150
req4  ████████████████████████████████░░░░░░░░  done at 180, idle for 20

The batch runs until the LONGEST sequence finishes. Slots that
finished early sit padded and idle. Here 550 of 800 slot-steps are
wasted — under 50% utilisation. And no new request can start until
the whole batch completes, so queued requests wait behind req2.`,
        },
        { t: "h", text: "Continuous (in-flight) batching" },
        {
          t: "p",
          text: "The fix, and one of the most important ideas in LLM serving. Rather than batching at the request level, batch at the *iteration* level: after every decoding step, evict finished sequences and admit waiting ones.",
        },
        {
          t: "code",
          lang: "text",
          caption: "Continuous batching — the slot is refilled immediately",
          code: `step 0:   [req1, req2, req3, req4]
step 20:  req1 finishes -> [req5, req2, req3, req4]     req5 admitted
step 50:  req3 finishes -> [req5, req2, req6, req4]     req6 admitted
step 180: req4 finishes -> [req5, req2, req6, req7]
...

The batch is always full. Throughput improvements of 10-20× over
static batching are routinely reported, and it also reduces queueing
latency because a new request does not wait for a whole batch.

This is what vLLM popularised and what TensorRT-LLM calls
"in-flight batching". Every serious serving stack now does it.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Why this matters more for LLMs than for image classifiers",
          text: "A ResNet processes a fixed-size input in a fixed number of steps — every item in a batch finishes together, so static batching is optimal. LLM generation has data-dependent, unpredictable length, varying by an order of magnitude within the same batch. Continuous batching exists because *variable-length autoregressive generation* is a fundamentally different serving problem, and applying classical ML serving wisdom to it leaves most of your GPU idle.",
        },
        { t: "h", text: "Chunked prefill and the interference problem" },
        {
          t: "p",
          text: "A subtlety continuous batching creates: a long prefill blocks decoding. If a 8,000-token prompt arrives while 30 sequences are decoding, that one prefill step takes far longer than a decode step, and every other user sees a latency spike.",
        },
        {
          t: "list",
          items: [
            "**Chunked prefill** — split a long prefill into fixed-size chunks and interleave them with decode steps. Slightly worse TTFT for the new request, much smoother ITL for everyone else.",
            "**Prefill/decode disaggregation** — run prefill and decode on *separate* GPU pools, transferring the KV-cache between them. Each pool can then be sized, batched, and even hardware-matched independently. This is the architecture behind NVIDIA Dynamo and similar recent systems, and it is where high-scale serving is heading.",
            "**Priority scheduling** — admit short requests ahead of long ones to keep p95 latency down, at some cost in fairness.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Throughput and latency trade against each other",
          text: "Larger batches mean higher total tokens/second and *worse* per-user latency, because each sequence advances one token per (now slower) iteration. There is no configuration that optimises both. Decide explicitly which you are serving: an interactive chat product optimises p95 latency; a nightly document-processing job optimises throughput. Then set your maximum batch size accordingly, and state the SLO you are targeting.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 16,
      title: "KV-cache management and PagedAttention",
      summary: "The memory problem that limits how many users you can serve, and the operating-systems idea that fixed it.",
      blocks: [
        {
          t: "p",
          text: "From Module 4: the KV-cache stores keys and values for every previous token so you do not recompute them. It is what makes generation tractable. It is also, at scale, the single largest consumer of GPU memory and the hard limit on concurrency.",
        },
        {
          t: "math",
          formula: "KV bytes = 2 × L × T × H_kv × d_head × B × bytes_per_value",
          note: "2 for K and V; L layers; T sequence length; H_kv key/value heads; B batch size. Linear in both context length and concurrency — which is why long context and high concurrency are in direct competition for the same resource.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example — Llama-2-7B", text: "L=32, H_kv=32, d_head=128, FP16. Per token per sequence: 2 × 32 × 32 × 128 × 2 = 524,288 bytes ≈ 0.5 MB." },
            { title: "One sequence at 4k context", text: "4,096 × 0.5 MB ≈ 2 GB." },
            { title: "On an 80 GB A100", text: "Weights take 14 GB, leaving ~66 GB. At 2 GB per sequence you fit about 33 concurrent 4k-context requests. That is your concurrency ceiling — set entirely by memory, not by compute." },
            { title: "Now apply GQA (8 KV heads instead of 32)", text: "0.125 MB per token, 0.5 GB per 4k sequence, ~130 concurrent requests. A 4× concurrency increase from one architectural choice." },
          ],
        },
        { t: "h", text: "The fragmentation problem" },
        {
          t: "p",
          text: "Before PagedAttention, servers allocated a contiguous KV-cache block per sequence, sized for the *maximum* possible output length because you cannot know in advance how long the response will be.",
        },
        {
          t: "list",
          items: [
            "**Internal fragmentation** — reserve 2,048 tokens, generate 100, and 95% of that block is wasted for the sequence's whole lifetime.",
            "**External fragmentation** — freed blocks of varying sizes leave gaps too small to reuse.",
            "**Reservation waste** — memory reserved for future tokens that have not been generated yet.",
            "**Measured impact** — the vLLM paper found existing systems wasted 60–80% of KV-cache memory. Since memory sets concurrency, that is a direct 3–4× loss in serving capacity.",
          ],
        },
        { t: "h", text: "PagedAttention" },
        {
          t: "note",
          tone: "analogy",
          title: "It is virtual memory, applied to the KV-cache",
          text: "Operating systems solved exactly this problem in the 1960s. Do not allocate contiguous physical memory; allocate fixed-size *pages* and maintain a table mapping logical positions to physical pages. A sequence's KV-cache becomes a list of page numbers that need not be adjacent. Waste drops to at most one partially-filled page per sequence — reported under 4%.",
        },
        {
          t: "code",
          lang: "text",
          caption: "Paged KV-cache layout",
          code: `Physical KV blocks (16 tokens each):
  [B0][B1][B2][B3][B4][B5][B6][B7][B8][B9]...

Sequence A (37 tokens):  block table -> [B0, B4, B7]
                                          ^ B7 is 5/16 full: the only waste
Sequence B (20 tokens):  block table -> [B1, B3]
Sequence C (52 tokens):  block table -> [B2, B5, B6, B9]

Blocks are allocated on demand as sequences grow, and freed when
they finish. No contiguity requirement, no over-reservation,
no external fragmentation.`,
        },
        { t: "h", text: "The bonus: copy-on-write sharing" },
        {
          t: "p",
          text: "Once you have page tables, sharing becomes almost free — and this is where paging pays a second dividend.",
        },
        {
          t: "list",
          items: [
            "**Shared system prompts.** A hundred concurrent requests with the same 2,000-token system prompt store those KV pages *once* instead of a hundred times. In a RAG system with a long stable prefix, this is a very large saving.",
            "**Parallel sampling.** Generating 5 completions from one prompt shares the prompt's pages and only diverges where the outputs differ.",
            "**Beam search and tree search.** Branches share their common prefix naturally.",
            "**Prefix caching across requests.** Persist popular prefixes so a repeat request skips its prefill entirely — the server-side counterpart to provider prompt caching (Module 12).",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "TensorRT-LLM implements the same idea",
          text: "vLLM introduced PagedAttention; TensorRT-LLM provides paged KV-cache with block reuse, and SGLang's RadixAttention generalises prefix sharing to a radix tree over all active prefixes. The technique is now table stakes. Understanding the concept — virtual memory for the KV-cache — transfers across all of them, which is what you want to demonstrate rather than knowing one product's flag names.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Preemption and swapping",
          text: "When memory runs out, the scheduler must evict a running sequence — either swapping its KV-cache to CPU memory or recomputing it later. Both are expensive and show up as latency spikes under load. If you see unexplained p99 latency in a saturated server, check the preemption counter before you look anywhere else.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 16,
      title: "Quantisation for inference",
      summary: "Fewer bits means fewer bytes to move, which — given lesson 1 — means faster decoding. The tradeoffs are subtler than the headline numbers suggest.",
      blocks: [
        {
          t: "p",
          text: "Quantisation for *inference* is not the same problem as for training. There is no backward pass, no optimiser state, and no gradient flow to preserve. You need the forward pass to produce sufficiently similar outputs, which permits far more aggressive compression.",
        },
        {
          t: "math",
          formula: "q = round(x / s)      s = max|x| / (2^{b−1} − 1)      x̂ = q · s",
          note: "Symmetric linear quantisation to b bits. The scale s can be per-tensor (cheap, coarse), per-channel (better), or per-group of e.g. 128 weights (best quality, small overhead for storing the scales).",
        },
        {
          t: "note",
          tone: "insight",
          title: "Why quantisation speeds up decoding",
          text: "It is tempting to think INT4 helps because integer arithmetic is faster. That is largely not the point. Decoding is memory-bound (lesson 1), so a 4-bit weight is 4× fewer bytes to move than FP16, giving up to a 4× speedup on the dominant cost — even if the kernel dequantises to FP16 and does the arithmetic in floating point, which many do. Bandwidth, not ALUs.",
        },
        { t: "h", text: "The methods" },
        {
          t: "table",
          head: ["Method", "Bits", "Approach", "Character"],
          rows: [
            ["FP16 / BF16", "16", "Baseline", "Reference quality"],
            ["FP8 (E4M3)", "8", "Hardware-native on Hopper/Blackwell", "Near-lossless, ~2× faster; the current default for new deployments"],
            ["INT8 SmoothQuant", "8", "Migrate activation outliers into weights", "Weight+activation quantisation; good throughput gains"],
            ["GPTQ", "4", "Layer-wise, second-order error compensation", "Strong quality; calibration data required"],
            ["AWQ", "4", "Protect the ~1% salient weights identified by activation magnitude", "Similar quality to GPTQ, faster to produce, popular"],
            ["GGUF (k-quants)", "2–8", "Mixed per-tensor bit widths", "The llama.cpp/CPU ecosystem standard"],
          ],
        },
        { t: "h", text: "Weights, activations, and the KV-cache" },
        {
          t: "steps",
          items: [
            { title: "Weight-only quantisation (W4A16)", text: "Compress weights to 4 bits, dequantise on the fly, compute in FP16. Excellent for low batch sizes where you are memory-bound. This is what GPTQ and AWQ do." },
            { title: "Weight + activation (W8A8)", text: "Quantise both, so the matmul itself runs in INT8/FP8 on tensor cores. Needed to get *compute* speedups, which matter at large batch sizes when you become compute-bound. Harder, because activations have outliers." },
            { title: "KV-cache quantisation", text: "Often overlooked and frequently the highest-value option. FP8 or INT8 KV-cache halves the memory from lesson 3, directly doubling your concurrency ceiling. Quality impact is typically small." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Activation outliers are why activation quantisation is hard",
          text: "Weights are roughly normally distributed and quantise cleanly. Activations in large transformers contain systematic outliers — a small number of channels with magnitudes 10–100× the rest, concentrated in consistent dimensions. Naive per-tensor quantisation lets those outliers dominate the scale factor and crushes everything else to a few levels. LLM.int8() handles them in a separate FP16 path; SmoothQuant migrates the difficulty from activations into weights by rescaling. Any activation-quantisation scheme must address them explicitly.",
        },
        { t: "h", text: "Choosing" },
        {
          t: "table",
          head: ["Situation", "Recommendation"],
          rows: [
            ["Hopper/Blackwell GPU, quality-critical", "FP8 — hardware-native, near-lossless, ~2× faster"],
            ["Model does not fit in memory", "4-bit AWQ or GPTQ — the point is fitting, not speed"],
            ["Maximising concurrency", "FP8 weights + FP8 KV-cache — attack both memory consumers"],
            ["Large-batch throughput", "W8A8 (SmoothQuant / FP8) to become compute-bound"],
            ["CPU or consumer hardware", "GGUF k-quants via llama.cpp"],
            ["Regulated or high-stakes output", "Stay at BF16 until you have measured the quality delta on your own task"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Perplexity is not enough to validate a quantisation",
          text: "A quantised model can show a negligible perplexity change while degrading measurably on long-context recall, multi-step reasoning, code generation, non-English languages, and structured-output validity. Perplexity averages over easy tokens and hides tail failures. Always evaluate on *your* task before shipping a quantised model, and pay particular attention to the hardest 10% of your traffic — that is where the loss concentrates.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 18,
      title: "The NVIDIA stack: NeMo, TensorRT-LLM, Triton, NIM",
      summary: "What each layer does, where it sits, and how a model flows from training to a served endpoint.",
      blocks: [
        {
          t: "p",
          text: "NVIDIA's software is a layered stack, and the layers are frequently confused in interviews. Knowing which does what — and where the boundaries are — is worth memorising precisely.",
        },
        {
          t: "code",
          lang: "text",
          caption: "The pipeline, end to end",
          code: `  TRAIN / CUSTOMISE          OPTIMISE                SERVE
  ┌──────────────┐      ┌──────────────────┐    ┌───────────────────┐
  │  NeMo        │─────▶│  TensorRT-LLM    │───▶│  Triton Inference │
  │  Framework   │ ckpt │  (build engine)  │ .  │  Server           │
  └──────────────┘      └──────────────────┘engine└───────────────────┘
   pretraining,          kernel fusion,          model repository,
   SFT, PEFT/LoRA,       quantisation,           dynamic batching,
   alignment,            in-flight batching,     multi-model,
   multi-node            paged KV-cache          HTTP/gRPC, metrics
                                                        │
                              NIM  ────────────────────┘
                    (all of the above, pre-packaged as a
                     container with an OpenAI-compatible API)

  NeMo Guardrails sits alongside at the application layer (Module 12).
  NVIDIA Dynamo is the newer distributed layer: disaggregated
  prefill/decode, KV-aware routing, multi-node scheduling.`,
        },
        { t: "h", text: "NeMo Framework — the training side" },
        {
          t: "list",
          items: [
            "End-to-end framework for pretraining, SFT, PEFT (LoRA, p-tuning), and alignment (RLHF, DPO, SteerLM) of LLMs and multimodal models.",
            "Built for scale: tensor, pipeline, sequence, and expert parallelism across multi-node clusters, with Megatron-Core underneath.",
            "Handles the unglamorous distributed-training work — checkpointing, resumption, fault tolerance across thousands of GPUs.",
            "Also covers speech (ASR/TTS) and multimodal (VLM, diffusion) model families, which is why it appears in vision pipelines and not only LLM ones.",
            "Exports `.nemo` checkpoints for conversion into TensorRT-LLM engines, or serves them in-framework via Triton for quick iteration.",
          ],
        },
        { t: "h", text: "TensorRT-LLM — the optimiser and runtime" },
        {
          t: "p",
          text: "This is a *compiler*, not a server. It takes model weights and produces an optimised engine specialised for a particular model, precision, batch profile, and GPU architecture.",
        },
        {
          t: "table",
          head: ["Optimisation", "What it does"],
          rows: [
            ["Kernel fusion", "Merges elementwise ops into matmul kernels, avoiding HBM round-trips for cheap operations"],
            ["Custom attention kernels", "FlashAttention-class fused attention with paged KV-cache support"],
            ["In-flight batching", "Continuous batching at the runtime level (lesson 2)"],
            ["Paged KV-cache + block reuse", "PagedAttention-equivalent memory management and prefix sharing (lesson 3)"],
            ["Quantisation", "FP8, INT8 SmoothQuant, INT4 AWQ/GPTQ, and FP8 KV-cache"],
            ["Multi-GPU parallelism", "Tensor and pipeline parallel built into the engine"],
            ["Speculative decoding", "Draft models, Medusa, EAGLE, lookahead decoding"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Engines are not portable",
          text: "A TensorRT-LLM engine is compiled for a specific GPU architecture, tensor-parallel degree, precision, and maximum batch/sequence configuration. An engine built for A100 TP=2 will not run on H100 TP=4. This is the main operational friction versus vLLM, which loads weights at runtime — you need a build step in your deployment pipeline and an engine artefact per target configuration. Budget for it; it surprises teams.",
        },
        { t: "h", text: "Triton Inference Server — the serving layer" },
        {
          t: "list",
          items: [
            "**Multi-framework** — serves TensorRT, TensorRT-LLM, PyTorch, ONNX, TensorFlow, Python, and custom C++ backends behind one endpoint. This is its defining feature.",
            "**Model repository** — a directory convention with versioning, so you can hot-load and roll back model versions without restarting.",
            "**Dynamic batching** — server-level request batching for models that do not manage their own (a classifier, a vision encoder).",
            "**Concurrent model execution** — multiple models, or multiple instances of one model, on the same GPU.",
            "**Business Logic Scripting / ensembles** — chain models with Python glue inside the server, so a multi-stage pipeline is one client call. This is how VLM pipelines are typically wired.",
            "**Production essentials** — HTTP and gRPC, Prometheus metrics, health checks, Kubernetes-friendly.",
          ],
        },
        { t: "h", text: "NIM — the packaged option" },
        {
          t: "p",
          text: "NVIDIA Inference Microservices are prebuilt containers containing a model plus TensorRT-LLM plus Triton plus an OpenAI-compatible API, with the engine already tuned for common GPU configurations. You run one container and get an endpoint.",
        },
        {
          t: "table",
          head: ["", "NIM", "Build it yourself"],
          rows: [
            ["Time to first token served", "Minutes", "Days to weeks"],
            ["Engine tuning", "Pre-optimised per GPU", "Yours to do"],
            ["Model choice", "The NIM catalogue", "Anything"],
            ["Customisation", "Limited", "Total"],
            ["Licensing", "Requires NVIDIA AI Enterprise for production", "Open source"],
            ["Best for", "Standard models, fast deployment, enterprise support", "Custom models, unusual configurations, cost control"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "How this compares to the open alternatives",
          text: "**vLLM** is the open-source default: excellent throughput, trivially easy to run (no build step), huge model coverage, and PagedAttention originated there. **SGLang** is strong on structured output and prefix-heavy workloads via RadixAttention. **TensorRT-LLM** typically wins on raw latency and on NVIDIA-specific features like FP8, at the cost of the build step and more configuration. An honest summary: start with vLLM, move to TensorRT-LLM when you have measured that the last 20–30% of latency matters commercially. Saying that shows judgement rather than vendor loyalty.",
        },
      ],
    },

    {
      id: "l6",
      level: "core",
      minutes: 14,
      title: "Multi-GPU parallelism for inference",
      summary: "The same strategies as training, but the tradeoffs invert because you are optimising latency rather than throughput.",
      blocks: [
        {
          t: "p",
          text: "Module 2 covered parallelism for training, where the goal is throughput on a fixed job. Inference has a different objective — low latency on individual requests, with memory as the binding constraint — and that changes which strategy wins.",
        },
        { t: "h", text: "Tensor parallelism" },
        {
          t: "p",
          text: "Split individual weight matrices across GPUs. Each GPU computes a slice of every layer, and the results are combined with an all-reduce.",
        },
        {
          t: "math",
          formula: "2 all-reduce operations per transformer layer (one after attention, one after the MLP)",
          note: "For a 32-layer model at TP=4, that is 64 all-reduce collectives per forward pass. Each one is a synchronisation point. This is why tensor parallelism requires NVLink — over PCIe or Ethernet the communication dominates and you can end up slower than a single GPU.",
        },
        {
          t: "list",
          items: [
            "**Reduces latency** — each GPU does 1/N of the work per layer, so a single request completes faster. This is the key inference property.",
            "**Splits memory** — both weights and KV-cache divide across GPUs, which is often the actual reason you need it.",
            "**Communication-heavy** — practical within a node (NVLink), painful across nodes.",
            "**Standard choice** — TP within a node is the default for any model too large for one GPU.",
          ],
        },
        { t: "h", text: "Pipeline parallelism" },
        {
          t: "p",
          text: "Split *layers* across GPUs: GPU 0 holds layers 1–8, GPU 1 holds 9–16, and so on. Activations pass between stages.",
        },
        {
          t: "list",
          items: [
            "**Very little communication** — only activations at stage boundaries, so it works across nodes over slower interconnects.",
            "**Does not reduce single-request latency** — a request still passes through every layer sequentially; you have merely spread them out, and added transfer hops.",
            "**Bubbles** — with one request in flight, only one stage is busy at a time. Utilisation requires many concurrent requests to keep every stage fed.",
            "**Use when** — the model does not fit even with tensor parallelism within a node, and you must span nodes.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The inversion versus training",
          text: "In training, pipeline parallelism is attractive because micro-batches fill the bubbles and communication is cheap relative to compute. In inference with low concurrency, pipeline parallelism adds latency and leaves stages idle, while tensor parallelism directly reduces time-to-answer. The rule of thumb: **tensor-parallel within a node, pipeline-parallel across nodes, and only when you must.**",
        },
        { t: "h", text: "Expert parallelism" },
        {
          t: "p",
          text: "For MoE models (Module 5), distribute experts across GPUs. Routing becomes an all-to-all communication where tokens are dispatched to whichever GPU holds their chosen expert and the results are gathered back. Efficient at large batch sizes where each expert receives enough tokens to be worth the round-trip; awkward at low concurrency where experts sit idle.",
        },
        { t: "h", text: "Sizing a deployment" },
        {
          t: "steps",
          items: [
            { title: "1. Compute weight memory", text: "params × bytes_per_param. A 70B model in FP8 is ~70 GB; in FP16 it is ~140 GB." },
            { title: "2. Add KV-cache for your target concurrency", text: "Using the formula from lesson 3. This is usually the term people forget, and it frequently exceeds the weights." },
            { title: "3. Add ~10-20% overhead", text: "Activations, workspace, fragmentation, CUDA context." },
            { title: "4. Divide by GPU memory to get the minimum TP degree", text: "Round up to a power of 2 — TP degree must divide the head count evenly." },
            { title: "5. Verify against attention heads", text: "TP degree must divide the number of KV heads. A GQA model with 8 KV heads cannot use TP=16 without replication." },
          ],
        },
        {
          t: "steps",
          items: [
            { title: "Worked example — Llama-3-70B, FP8, 64 concurrent 8k-context requests", text: "Weights ≈ 70 GB." },
            { title: "KV-cache", text: "80 layers, 8 KV heads, d_head 128, FP8 (1 byte): per token 2 × 80 × 8 × 128 × 1 = 163,840 bytes ≈ 0.16 MB. At 8,192 tokens × 64 sequences: 0.16 MB × 8192 × 64 ≈ 86 GB." },
            { title: "Total", text: "70 + 86 + ~15% overhead ≈ 180 GB. Three H100s minimum, so TP=4 (the next power of two). Note the KV-cache exceeded the model weights — as it usually does at real concurrency." },
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Tensor or pipeline parallelism — which has more communication overhead, and which would you pick for inference?\" Tensor parallelism, by a wide margin: two all-reduces per layer versus one activation transfer per stage boundary. But you still pick tensor parallelism for inference within a node, because it is the one that reduces single-request latency and NVLink makes the communication affordable. Getting the apparent contradiction right is the point of the question.",
        },
      ],
    },

    {
      id: "l7",
      level: "advanced",
      minutes: 16,
      title: "Serving a VLM pipeline, and benchmarking honestly",
      summary: "Putting Modules 13 and 14 together, plus how to measure what you have built.",
      blocks: [
        {
          t: "p",
          text: "A VLM request has two computationally dissimilar stages. Treating them as one monolith is the most common architectural mistake in multimodal serving.",
        },
        { t: "h", text: "Why to split the pipeline" },
        {
          t: "table",
          head: ["", "Vision encoder", "LLM decoder"],
          rows: [
            ["Workload", "Fixed-size ViT forward pass", "Variable-length autoregressive generation"],
            ["Bottleneck", "Compute", "Memory bandwidth"],
            ["Batching", "Static batching is optimal", "Continuous batching required"],
            ["Cost per request", "Fixed per image", "Proportional to output length"],
            ["Scaling driver", "Images per second", "Concurrent sequences"],
            ["Ideal hardware", "Can run on cheaper GPUs", "Wants bandwidth and capacity"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Different bottlenecks mean different services",
          text: "Fusing them forces one batching strategy and one scaling unit onto two workloads that want opposite things — and it means you scale expensive decoder GPUs to handle a surge of image encoding. Splitting lets you scale each independently, cache encoder outputs by image hash, and place the encoder on cheaper hardware. This is exactly what Triton's ensemble/BLS support is for.",
        },
        {
          t: "code",
          lang: "text",
          caption: "A production VLM pipeline in Triton",
          code: `Client ──▶ Triton ensemble
              │
              ├─ 1. preprocess  (DALI backend, GPU-accelerated)
              │      decode JPEG, resize, tile, normalise
              │      -> keeps image decoding off the CPU, which is a
              │         real bottleneck at high image throughput
              │
              ├─ 2. vision_encoder  (TensorRT engine)
              │      ViT forward pass -> patch features
              │      static batching; cache keyed by image hash
              │
              ├─ 3. projector  (TensorRT engine, tiny)
              │      MLP -> visual tokens in the LLM's embedding space
              │
              └─ 4. llm  (TensorRT-LLM backend)
                     in-flight batching, paged KV-cache, streaming

Each stage is independently versioned, scaled, and monitored.
Stage 2's output is deterministic for a given image, so caching it
removes the entire vision cost for repeated images — common in
document workflows where users ask several questions about one page.`,
        },
        { t: "h", text: "Benchmarking" },
        {
          t: "p",
          text: "Most published LLM benchmarks are close to useless because they measure a single request on an idle GPU. Real serving is about behaviour under concurrency.",
        },
        {
          t: "table",
          head: ["Metric", "Definition", "Why it matters"],
          rows: [
            ["TTFT (p50/p95/p99)", "Time to first token", "Perceived responsiveness; dominated by prefill"],
            ["ITL / TPOT", "Time per output token after the first", "Reading speed; dominated by decode"],
            ["Throughput", "Total output tokens/second across all requests", "Cost efficiency"],
            ["Goodput", "Requests/second meeting your SLO", "The metric that actually matters"],
            ["Concurrency at SLO", "Max simultaneous users within latency targets", "Determines how many GPUs you need"],
            ["Cost per 1M tokens", "GPU-hour cost / tokens produced", "The number finance asks for"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Goodput is the metric to optimise",
          text: "Raw throughput is easy to inflate: crank the batch size until per-user latency is dreadful and total tokens/second looks wonderful. Goodput counts only requests that met your latency SLO, so it captures the actual tradeoff. Report throughput *and* p95 latency together, or report goodput — a throughput number without a latency constraint is marketing.",
        },
        {
          t: "steps",
          items: [
            { title: "1. Use a realistic request distribution", text: "Real prompt and output length distributions, not a fixed 128-in/128-out. Length variance is precisely what continuous batching exists to handle, so a fixed-length benchmark hides its benefit and its failure modes." },
            { title: "2. Sweep concurrency", text: "Run at 1, 2, 4, 8, ... concurrent requests and plot latency against throughput. The knee of that curve is your operating point." },
            { title: "3. Measure at steady state", text: "Discard warm-up. First requests pay engine loading, CUDA graph capture, and cold caches." },
            { title: "4. Report percentiles, not means", text: "Mean latency hides the preemption spikes from lesson 3. p95 and p99 are what users experience as reliability." },
            { title: "5. Validate quality at the same configuration", text: "A quantised, aggressively-batched engine must be evaluated for output quality, not just speed. Benchmark and eval together or you will ship a fast, worse model." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Watch for benchmark artefacts",
          text: "Beware: measuring with an unrealistically short output length (hides decode cost), reusing the same prompt (prefix caching makes prefill free), forgetting that the tokenizer differs between models being compared (tokens/second is not comparable across tokenizers — the same trap as perplexity in Module 1), and quoting peak throughput at a batch size no real workload would tolerate.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"How would you deploy a VLM at scale on NVIDIA hardware?\" Structure the answer as: split the vision encoder from the LLM decoder because they have opposite bottlenecks; optimise the encoder as a TensorRT engine with static batching and hash-based caching; serve the LLM with TensorRT-LLM using in-flight batching, paged KV-cache, and FP8; wire them as a Triton ensemble with DALI preprocessing; size TP from weights plus KV-cache at target concurrency; and benchmark on goodput against a realistic length distribution. That sequence demonstrates the whole module.",
        },
      ],
    },
  ],

  theory: [
    "GPU fundamentals: CUDA cores vs Tensor Cores, HBM bandwidth vs compute throughput, and the ~295 FLOPs-per-byte crossover on an H100.",
    "Arithmetic intensity and the roofline model: AI = FLOPs / bytes_moved determines whether you are compute- or memory-bound.",
    "Why prefill is compute-bound (matrix-matrix) and decode is memory-bound (matrix-vector at ~2 FLOPs/byte).",
    "Why batching, quantisation, speculative decoding, and KV-cache management all follow from the same memory-bandwidth cause.",
    "Kernel fusion: merging elementwise ops into matmul kernels to avoid HBM round-trips for operations with almost no arithmetic.",
    "TTFT vs ITL, and why the two phases need different optimisations.",
    "Static batching wastes GPU on variable-length generation; continuous (in-flight) batching refills slots every iteration for 10-20× throughput.",
    "Why continuous batching matters more for LLMs than for fixed-size models like image classifiers.",
    "Chunked prefill and prefill/decode disaggregation (NVIDIA Dynamo) as responses to long prefills blocking decode.",
    "Throughput and latency trade against each other — you must choose which SLO you are serving.",
    "KV-cache memory formula, and why it usually exceeds model weights at realistic concurrency.",
    "GQA as a 4× concurrency multiplier by reducing H_kv.",
    "KV-cache fragmentation: internal, external, and reservation waste totalling 60-80% in pre-PagedAttention systems.",
    "PagedAttention as virtual memory for the KV-cache: fixed-size blocks plus a block table, reducing waste to under 4%.",
    "Copy-on-write sharing: shared system prompts, parallel sampling, beam search, and cross-request prefix caching.",
    "Preemption and swapping as the cause of p99 latency spikes under memory pressure.",
    "Quantisation for inference: symmetric linear quantisation with per-tensor/channel/group scales.",
    "Why quantisation speeds up DECODING via bandwidth, not via faster arithmetic.",
    "Quantisation methods: FP8, INT8 SmoothQuant, GPTQ, AWQ, GGUF k-quants.",
    "Weight-only (W4A16) vs weight+activation (W8A8) vs KV-cache quantisation, and when each matters.",
    "Activation outliers and why they make activation quantisation hard (LLM.int8(), SmoothQuant).",
    "Why perplexity is insufficient to validate a quantisation — losses concentrate in long context, reasoning, code, and non-English.",
    "The NVIDIA stack: NeMo (train/customise) → TensorRT-LLM (compile/optimise) → Triton (serve) → NIM (packaged), with Dynamo for distributed serving.",
    "TensorRT-LLM is a compiler, not a server; engines are non-portable across GPU architecture, TP degree, and precision.",
    "Triton features: multi-framework backends, model repository versioning, dynamic batching, concurrent execution, ensembles/BLS.",
    "Honest comparison with vLLM and SGLang, and when the extra TensorRT-LLM complexity is justified.",
    "Tensor parallelism reduces single-request latency but needs NVLink (2 all-reduces per layer); pipeline parallelism is cheap on communication but adds latency and bubbles.",
    "The inference/training inversion: TP within a node, PP across nodes and only when necessary.",
    "Sizing a deployment: weights + KV-cache at target concurrency + overhead, with TP degree constrained to divide the KV head count.",
    "VLM serving: split the compute-bound vision encoder from the memory-bound LLM decoder into separately scaled, separately batched services.",
    "GPU-accelerated preprocessing (DALI) and hash-based caching of deterministic encoder output.",
    "Benchmarking: TTFT/ITL percentiles, throughput, goodput, concurrency at SLO, cost per 1M tokens.",
    "Why goodput is the honest metric, and the common benchmark artefacts that inflate results.",
  ],

  math: [
    {
      title: "Arithmetic intensity (roofline)",
      formula: "AI = FLOPs / bytes_moved ; compute-bound if AI > peak_FLOPS/peak_BW",
      note: "H100 crossover ≈ 990 TFLOP/s ÷ 3.35 TB/s ≈ 295 FLOPs/byte. Decode sits near 2 — roughly 150× below — which is why it is memory-bound.",
    },
    {
      title: "Single-sequence decode ceiling",
      formula: "max_tokens_per_sec ≈ memory_bandwidth / model_bytes",
      note: "A 7B FP16 model is 14GB; at 3.35 TB/s that is ~240 tokens/s maximum for one sequence, no matter how much compute the GPU has.",
    },
    {
      title: "KV-cache memory",
      formula: "bytes = 2 × L × T × H_kv × d_head × B × bytes_per_value",
      note: "Llama-2-7B FP16: ~0.5MB per token per sequence. At 4k context that is 2GB per request, so ~33 concurrent requests on an 80GB A100 after weights.",
    },
    {
      title: "Quantisation scale",
      formula: "q = round(x/s), s = max|x| / (2^(b-1) - 1), x̂ = q·s",
      note: "Per-tensor is cheap and coarse; per-group (e.g. 128 weights) gives the best quality for a small scale-storage overhead.",
    },
    {
      title: "Throughput vs batch size",
      formula: "throughput ≈ batch_size / time_per_iteration",
      note: "Larger batches amortise weight loading and raise total tokens/s, but each sequence advances one token per slower iteration — so per-user latency worsens.",
    },
    {
      title: "Tensor-parallel communication",
      formula: "2 all-reduce per layer × L layers per forward pass",
      note: "32 layers at TP=4 means 64 synchronisation points. Requires NVLink; over PCIe the communication can exceed the compute saving.",
    },
    {
      title: "Deployment sizing",
      formula: "mem = weights + KV(concurrency, context) + ~15% overhead ; TP = ceil(mem / gpu_mem)",
      note: "Llama-3-70B FP8 at 64×8k concurrency: 70GB + 86GB + overhead ≈ 180GB → TP=4. The KV-cache exceeded the weights, as it usually does.",
    },
    {
      title: "Cost per million tokens",
      formula: "cost = (gpu_hourly_rate × num_gpus) / (tokens_per_sec × 3600) × 1e6",
      note: "The number to compare against API pricing. Remember to use realistic utilisation, not peak throughput — idle GPUs cost the same as busy ones.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain why LLM token-by-token decoding is memory-bandwidth-bound rather than compute-bound. Give the arithmetic intensity and the H100 crossover." },
    { type: "theory", q: "Name four serving optimisations that all follow from the memory-bandwidth bottleneck, and explain the mechanism for each." },
    { type: "theory", q: "Contrast prefill and decode across bottleneck, parallelism, cost scaling, and the user-visible metric each affects." },
    { type: "theory", q: "Explain continuous (in-flight) batching vs static batching, and why it matters far more for LLMs than for an image classifier." },
    { type: "theory", q: "What problem does chunked prefill solve, and what does prefill/decode disaggregation add beyond it?" },
    { type: "theory", q: "Explain why throughput and per-user latency trade against each other, and how you would decide the operating point for an interactive chat product." },
    { type: "theory", q: "What is PagedAttention trying to solve? Describe the three kinds of waste it eliminates and the operating-systems idea it borrows." },
    { type: "theory", q: "Beyond reducing fragmentation, what second benefit does a paged KV-cache enable? Give three concrete cases." },
    { type: "theory", q: "Why does quantising weights to INT4 speed up decoding even when the arithmetic is still performed in FP16?" },
    { type: "theory", q: "Explain why activation quantisation is harder than weight quantisation, and name two techniques that address it." },
    { type: "theory", q: "Why is a small perplexity change insufficient evidence that a quantised model is safe to deploy? Where do the losses concentrate?" },
    { type: "theory", q: "Describe the role of each layer in NVIDIA's stack: NeMo, TensorRT-LLM, Triton, NIM, Dynamo. Which of these is a compiler rather than a server?" },
    { type: "theory", q: "Why is a TensorRT-LLM engine not portable, and what operational consequence does that have for your deployment pipeline?" },
    { type: "theory", q: "Compare tensor and pipeline parallelism for inference: which has more communication overhead, and which would you choose within a single node? Explain the apparent contradiction." },
    { type: "theory", q: "In a VLM serving pipeline, why run the vision encoder and LLM decoder as separate engines? Give at least three reasons rooted in their different bottlenecks." },
    { type: "theory", q: "Explain the difference between throughput and goodput, and why reporting throughput alone is misleading." },
    { type: "theory", q: "Name four ways an LLM serving benchmark can be misleading, and how you would avoid each." },
    { type: "math", q: "For a model with 32 layers, 32 KV heads, d_head=128, sequence length 2048, batch size 8, FP16 — estimate the KV-cache footprint in GB. Recompute with GQA at 8 KV heads and with FP8." },
    { type: "math", q: "A 7B model in FP16 on a GPU with 3.35 TB/s bandwidth. What is the theoretical maximum single-sequence decode rate? What if you quantise to INT4?" },
    { type: "math", q: "Size a deployment for Llama-3-70B in FP8 (80 layers, 8 KV heads, d_head=128) serving 32 concurrent requests at 16k context. How many H100s, and what TP degree?" },
    { type: "math", q: "If quantising weights from FP16 to INT4, what is the theoretical memory reduction factor and the theoretical decode speedup? What precision risk does it introduce?" },
    { type: "math", q: "An 8×H100 node costs $28/hour and sustains 4,000 output tokens/second at your SLO. Compute the cost per 1M output tokens. Compare against an API at $3/1M and state the break-even utilisation." },
    { type: "theory", q: "Explain the difference between TTFT and ITL, and describe a scenario where you would deliberately worsen one to improve the other." },
  ],

  resources: [
    { label: "NVIDIA TensorRT-LLM — documentation", url: "https://nvidia.github.io/TensorRT-LLM/", kind: "docs" },
    { label: "NVIDIA TensorRT-LLM — GitHub", url: "https://github.com/NVIDIA/TensorRT-LLM", kind: "repo" },
    { label: "NVIDIA Triton Inference Server — documentation", url: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html", kind: "docs" },
    { label: "NVIDIA NeMo Framework — user guide", url: "https://docs.nvidia.com/nemo-framework/user-guide/latest/overview.html", kind: "docs" },
    { label: "NVIDIA NIM — documentation", url: "https://docs.nvidia.com/nim/index.html", kind: "docs" },
    { label: "Kwon et al. 2023 — Efficient Memory Management for LLM Serving with PagedAttention (vLLM)", url: "https://arxiv.org/abs/2309.06180", kind: "paper" },
    { label: "vLLM — documentation", url: "https://docs.vllm.ai/", kind: "docs" },
    { label: "Yu et al. 2022 — Orca: continuous batching for transformer serving", url: "https://www.usenix.org/conference/osdi22/presentation/yu", kind: "paper" },
    { label: "Xiao et al. 2022 — SmoothQuant", url: "https://arxiv.org/abs/2211.10438", kind: "paper" },
    { label: "Lin et al. 2023 — AWQ: Activation-aware Weight Quantization", url: "https://arxiv.org/abs/2306.00978", kind: "paper" },
    { label: "Frantar et al. 2022 — GPTQ", url: "https://arxiv.org/abs/2210.17323", kind: "paper" },
    { label: "Dao et al. 2022 — FlashAttention", url: "https://arxiv.org/abs/2205.14135", kind: "paper" },
    { label: "NVIDIA DALI — GPU-accelerated data preprocessing", url: "https://docs.nvidia.com/deeplearning/dali/user-guide/docs/index.html", kind: "docs" },
    { label: "Williams et al. — Roofline: an insightful visual performance model", url: "https://dl.acm.org/doi/10.1145/1498765.1498785", kind: "paper" },
  ],
};

export default m14;
