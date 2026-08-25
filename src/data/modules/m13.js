const m13 = {
  id: "m13",
  week: 13,
  hours: 8,
  title: "Vision-Language Models (VLM): Multimodal Architecture",
  tag: "Multimodal",
  why: "VLMs are the fastest-growing frontier beyond text-only LLMs — critical since your team is explicitly working on Nvidia VLM pipelines. You need the architecture fundamentals before the deployment layer.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "Vision Transformers: images as sequences",
      summary: "The move that let the transformer eat computer vision, and why it works despite discarding convolutional priors.",
      blocks: [
        {
          t: "p",
          text: "By 2020 the transformer had taken over NLP, and vision was still convolutional. The Vision Transformer paper asked a blunt question: what if you just cut the image into squares, treat each square as a token, and run a standard transformer? The title says it all — \"An Image is Worth 16×16 Words\".",
        },
        { t: "h", text: "Patchification" },
        {
          t: "math",
          formula: "num_patches = (H/P) × (W/P)",
          note: "An H×W image cut into P×P patches. 224×224 with P=16 gives 14×14 = 196 patches. Each patch is flattened (16×16×3 = 768 values) and linearly projected to d_model. That linear projection is literally implemented as a stride-P convolution.",
        },
        {
          t: "steps",
          items: [
            { title: "1. Cut into patches", text: "Non-overlapping P×P squares. Patch size is the central efficiency knob: halving it quadruples the token count." },
            { title: "2. Flatten and project", text: "Each patch becomes a vector of length P²·C, then a learned linear layer maps it to d_model. This is the visual equivalent of an embedding table lookup." },
            { title: "3. Add positional embeddings", text: "Self-attention is permutation-equivariant (Module 4), so without this the model cannot tell top-left from bottom-right. ViT uses learned 1-D positional embeddings — 2-D ones were tried and gave no benefit." },
            { title: "4. Prepend a [CLS] token", text: "A learned token whose final hidden state is used as the whole-image representation for classification. Modern usage often mean-pools patch tokens instead." },
            { title: "5. Run a standard transformer encoder", text: "Bidirectional attention — every patch attends to every other patch. No causal masking; an image has no temporal order." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "ViT throws away everything CNNs were designed around",
          text: "A CNN has strong built-in priors: locality (nearby pixels are related), translation equivariance (a cat is a cat anywhere in the frame), and hierarchy (edges → shapes → objects). ViT has none of these. It must *learn* that adjacent patches are related, from data. On ImageNet-sized datasets it loses to CNNs for exactly this reason. On 300M-image datasets it wins. This is the bitter lesson in miniature: given enough data, learned structure beats hand-designed structure — but 'enough' can be very large.",
        },
        { t: "h", text: "The cost profile" },
        {
          t: "table",
          head: ["Resolution", "Patch size", "Tokens", "Relative attention cost"],
          rows: [
            ["224×224", "16", "196", "1×"],
            ["224×224", "14", "256", "1.7×"],
            ["336×336", "14", "576", "8.6×"],
            ["448×448", "14", "1,024", "27×"],
            ["1024×1024", "14", "5,329", "740×"],
          ],
        },
        {
          t: "p",
          text: "Attention is quadratic in token count, so resolution is brutally expensive. This single table explains most VLM design decisions: why models default to modest resolutions, why high-resolution support arrived late, and why tiling schemes (lesson 4) exist rather than simply feeding bigger images.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Patches lose fine detail permanently",
          text: "A 16×16 patch is projected to a single vector. Whatever detail existed inside it — small text, thin lines, a distant face — is compressed into that one vector, and no later layer can recover it. This is the root cause of VLMs struggling with small text, precise counting, and fine spatial relations. It is a representational limit set at step 2, not a reasoning failure.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "CLIP: aligning images and text in one space",
      summary: "The model that underpins nearly every VLM, every text-to-image system, and multimodal search.",
      blocks: [
        {
          t: "p",
          text: "CLIP's contribution is not an architecture — it uses a standard ViT and a standard text transformer. It is a *training objective* and a dataset: 400 million image–caption pairs scraped from the web, trained so that matching pairs land near each other in a shared embedding space.",
        },
        { t: "h", text: "The contrastive objective" },
        {
          t: "math",
          formula: "L = −(1/N) Σᵢ log [ e^{sim(Iᵢ,Tᵢ)/τ} / Σⱼ e^{sim(Iᵢ,Tⱼ)/τ} ]     (symmetric: image→text and text→image)",
          note: "For a batch of N pairs, compute an N×N similarity matrix between all image and text embeddings. The correct pairings are the diagonal. Cross-entropy pushes the diagonal up and everything off-diagonal down. τ is a learned temperature.",
        },
        {
          t: "note",
          tone: "insight",
          title: "This is exactly the InfoNCE loss from Module 6",
          text: "Same mathematics as text embedding training, with images on one side. The classification is 'which of these N captions goes with this image?', where the class set changes every batch. That is why enormous batch sizes matter so much — CLIP used 32,768, giving 32,767 negatives per positive. More negatives means a harder task and a sharper embedding space.",
        },
        {
          t: "code",
          lang: "python",
          caption: "CLIP training, essentially complete",
          code: `image_features = image_encoder(images)          # (N, d)
text_features  = text_encoder(texts)            # (N, d)

image_features = normalize(image_features, dim=-1)   # L2 normalise
text_features  = normalize(text_features,  dim=-1)   # -> cosine == dot

logits = image_features @ text_features.T * exp(temperature)   # (N, N)

labels = arange(N)                # the correct pairing is the diagonal
loss = (cross_entropy(logits, labels) +
        cross_entropy(logits.T, labels)) / 2       # symmetric`,
        },
        { t: "h", text: "Zero-shot classification" },
        {
          t: "p",
          text: "The result that made CLIP famous. It was never trained to classify anything, yet it can classify into arbitrary categories defined at inference time.",
        },
        {
          t: "steps",
          items: [
            { title: "1. Turn labels into sentences", text: "For classes [cat, dog, car], build \"a photo of a cat\", \"a photo of a dog\", \"a photo of a car\". The prompt template matters — this is prompt engineering for vision, and CLIP's paper reports meaningful gains from ensembling templates." },
            { title: "2. Embed the sentences", text: "One text embedding per class. Precompute once." },
            { title: "3. Embed the image", text: "One image embedding." },
            { title: "4. Take the argmax cosine similarity", text: "The nearest class sentence is the prediction. You have built a classifier for classes that did not exist when the model was trained." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why zero-shot works at all",
          text: "Because the training data was the open web, the text encoder has seen essentially every visual concept people write about. Classification becomes retrieval in a shared space — and retrieval generalises to any query you can phrase. This is the same conceptual move as RAG (Module 9): replace a closed-set memorisation problem with an open-set matching problem.",
        },
        { t: "h", text: "What CLIP enables" },
        {
          t: "list",
          items: [
            "**Multimodal search** — search images with text and vice versa, using one shared index. Directly reuses everything from Modules 6 and 7.",
            "**The vision encoder for most VLMs** — CLIP's ViT (or its successors SigLIP and EVA-CLIP) is the standard image tower in LLaVA-style architectures, because it already produces language-aligned features.",
            "**Text-to-image guidance** — CLIP scores drove early diffusion guidance and remain a common evaluation metric.",
            "**Data filtering at scale** — CLIP similarity is used to filter noisy web image–text data for training larger models. LAION and DataComp are built on this.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "CLIP's known weaknesses",
          text: "**Compositionality** — it behaves substantially like a bag of concepts. \"A red cube on a blue sphere\" and \"a blue cube on a red sphere\" get near-identical embeddings, a failure documented in the ARO and Winoground benchmarks. **Counting** — 'three dogs' is barely distinguished from 'dogs'. **Text rendering** — it partially reads text in images, sometimes leading it to classify by the caption written in the picture rather than the content. **Bias** — trained on unfiltered web data, with the demographic biases that implies. SigLIP replaced the softmax with a pairwise sigmoid loss, which removes the need for huge batches and improves several of these.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 18,
      title: "Connecting vision to a language model",
      summary: "Three architectural families for turning image features into something an LLM can read.",
      blocks: [
        {
          t: "p",
          text: "You have a vision encoder producing patch features and an LLM expecting token embeddings. Something must bridge them. The design of that bridge is the main axis along which VLM architectures differ.",
        },
        { t: "h", text: "Approach 1: linear projection (LLaVA)" },
        {
          t: "p",
          text: "The simplest thing that could possibly work, and it works remarkably well. Take the ViT's patch features, project them into the LLM's embedding dimension with a small MLP, and splice them into the token sequence as if they were words.",
        },
        {
          t: "code",
          lang: "text",
          caption: "LLaVA's architecture in one diagram",
          code: `Image ──▶ CLIP ViT-L/14 ──▶ 576 patch features (1024-dim)
                                        │
                                   2-layer MLP        <- the ONLY new
                                        │                 component in
                                        ▼                 stage 1
                              576 visual tokens (4096-dim)
                                        │
Text ──▶ tokenizer ──▶ text tokens ─────┤
                                        ▼
                        [visual tokens][text tokens] ──▶ LLM ──▶ output

Training:
  Stage 1 — freeze ViT and LLM, train ONLY the projector on
            ~558k image-caption pairs. Teaches the projector to
            speak the LLM's embedding language.
  Stage 2 — freeze ViT, train projector + LLM on ~665k
            instruction-following examples.

Total training: hours on 8 A100s. LLaVA-1.5's headline point was
that a very simple connector plus good data beats architectural
complexity.`,
        },
        {
          t: "list",
          items: [
            "**Pros** — trivially simple, cheap to train, preserves all spatial information (one token per patch), and the LLM's full attention operates over image and text jointly.",
            "**Cons** — image tokens consume context linearly. 576 tokens per image at 336×336; a high-resolution tiled image can be several thousand.",
            "**Used by** — LLaVA and its many descendants, Qwen-VL, InternVL, and most open VLMs. This is the dominant design.",
          ],
        },
        { t: "h", text: "Approach 2: resampler / Q-Former (BLIP-2, Flamingo)" },
        {
          t: "p",
          text: "Compress the patch features into a small fixed number of tokens using a set of learned query vectors that cross-attend to the image features.",
        },
        {
          t: "math",
          formula: "Q_learned (32 × d) cross-attends to image_features (576 × d) → 32 output tokens",
          note: "The 32 query embeddings are learned parameters, not derived from the image. They act as a fixed-size information bottleneck: whatever the image contains must be squeezed into 32 vectors. Flamingo's Perceiver Resampler is the same idea with 64 queries.",
        },
        {
          t: "list",
          items: [
            "**Pros** — a constant, small number of tokens regardless of image size. Vastly cheaper for multi-image and video, where token count is the binding constraint.",
            "**Cons** — the bottleneck genuinely loses information, particularly fine detail and text. BLIP-2's Q-Former also needs its own multi-stage pretraining.",
            "**Verdict** — the field largely moved to linear projection for single images, because compute got cheaper faster than the information loss got acceptable. Resamplers remain important for video (lesson 6).",
          ],
        },
        { t: "h", text: "Approach 3: cross-attention layers (Flamingo, Llama-3.2-Vision)" },
        {
          t: "p",
          text: "Leave the token sequence alone. Instead, insert new cross-attention layers into the LLM at intervals, where text tokens attend to image features as an external memory.",
        },
        {
          t: "list",
          items: [
            "**Pros** — image features never occupy context window. The original LLM weights stay entirely frozen, so text-only capability is provably preserved. Gated cross-attention (initialised at zero with a learned tanh gate) means the model starts as the exact original LLM and gradually opens the visual pathway — a very clean training strategy.",
            "**Cons** — architectural surgery on the LLM, more new parameters, and interleaved image–text reasoning is less natural than when everything shares one sequence.",
            "**Used by** — Flamingo, IDEFICS, Llama-3.2-Vision.",
          ],
        },
        {
          t: "table",
          head: ["", "Linear projection", "Resampler", "Cross-attention"],
          rows: [
            ["Tokens per image", "256 – 2,000+", "32 – 64 (fixed)", "0 (external)"],
            ["Spatial detail", "Full", "Compressed", "Full (in the KV)"],
            ["Training cost", "Lowest", "Medium", "Highest"],
            ["Preserves text-only ability", "Degrades slightly", "Degrades slightly", "Provably preserved"],
            ["Interleaved reasoning", "Natural", "Natural", "Less natural"],
            ["Examples", "LLaVA, Qwen-VL, InternVL", "BLIP-2, Flamingo resampler", "Flamingo, Llama-3.2-Vision"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The lesson the field learned",
          text: "BLIP-2's Q-Former was motivated by compute scarcity — it let you connect a frozen encoder to a frozen LLM cheaply. LLaVA then showed that a two-layer MLP plus good instruction data beat it. The generalisable point: **when compute is not the binding constraint, prefer the simplest connector and spend your effort on data**. That pattern — simple architecture, better data — recurs throughout this curriculum.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 14,
      title: "Resolution, tiling, and the token budget",
      summary: "The practical constraint that shapes every VLM deployment decision.",
      blocks: [
        {
          t: "p",
          text: "Early VLMs were fixed at 224×224 or 336×336. That is fine for \"is there a dog in this photo?\" and useless for reading a document, inspecting a chart, or examining a defect on a circuit board. Raising resolution naively is quadratically expensive, so the field developed tiling.",
        },
        { t: "h", text: "Dynamic tiling" },
        {
          t: "code",
          lang: "text",
          caption: "How high resolution is actually achieved",
          code: `Input: 1344 × 1344 document scan

Naive: resize to 336×336
  -> 576 tokens, and the text is unreadable

Tiled (AnyRes / dynamic resolution):
  1. Split into a 4×4 grid of 336×336 tiles      -> 16 tiles
  2. Encode each tile independently              -> 16 × 576 tokens
  3. ALSO encode a downscaled full image         -> 576 tokens
     (the "thumbnail" gives global context)
  4. Concatenate                                 -> 9,792 visual tokens

Result: local detail from the tiles, global layout from the
thumbnail — at ~17× the token cost of a single low-res image.

Refinements used in practice:
  * choose the grid to match the image aspect ratio, avoiding
    distortion and wasted tiles
  * pixel-shuffle or pooling to reduce tokens per tile
  * cap the number of tiles to bound worst-case cost`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Do the token arithmetic before you design the product",
          text: "Ten pages of a tiled document is easily 50,000–100,000 visual tokens. That may exceed your context window, will dominate your latency, and will dominate your bill. Vision requests are frequently 10–50× the cost of the equivalent text request, and teams discover this after building the feature. Estimate first.",
        },
        { t: "h", text: "Budgeting" },
        {
          t: "math",
          formula: "total_tokens = num_image_tokens + text_tokens ;  cost ∝ total_tokens",
          note: "Visual tokens are ordinary tokens in every respect — they consume context, they are billed, and they contribute to the quadratic attention cost during prefill.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example", text: "A VLM uses 576 tokens per image with an 8k context window. Two images are included in one request." },
            { title: "Image cost", text: "2 × 576 = 1,152 tokens." },
            { title: "Remaining", text: "8,192 − 1,152 = 7,040 tokens for the system prompt, question, and answer combined." },
            { title: "Now try it with tiling", text: "At 5 tiles plus a thumbnail per image, that is 2 × 6 × 576 = 6,912 tokens — leaving 1,280. Two high-resolution images have nearly filled an 8k window." },
          ],
        },
        { t: "h", text: "Practical controls" },
        {
          t: "list",
          items: [
            "**Choose resolution per task.** \"Is this a receipt?\" needs low resolution. \"What is the total?\" needs high. Route accordingly rather than defaulting to maximum.",
            "**Crop before sending.** If you know the region of interest — a table, a form field, a defect — crop to it. Enormously cheaper and usually more accurate, because you have removed distractors.",
            "**Downscale sensibly.** Sending a 4000×3000 phone photo when the model tiles to 1344 wastes upload bandwidth and gains nothing.",
            "**Cache per image.** Hash the image bytes; if the same image is asked about repeatedly, the encoder output can be reused. Provider prompt caching covers this on some APIs.",
            "**Consider a specialist model.** For pure OCR, a dedicated OCR engine is faster, cheaper, and often more accurate than a general VLM. Use the VLM for what needs *understanding*, not for what needs transcription.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Native-resolution encoders",
          text: "Newer designs (Qwen2-VL's NaViT-style encoder, and similar) process images at their native resolution and aspect ratio, producing a variable number of tokens, rather than forcing everything through a fixed grid. This avoids distortion from resizing and wasted tokens on padding, and it is the direction the field is moving. It also makes token count harder to predict, which matters for capacity planning.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 14,
      title: "Capabilities, benchmarks, and honest limitations",
      summary: "What VLMs are genuinely good at, where they reliably fail, and why the benchmarks are hard to trust.",
      blocks: [
        {
          t: "p",
          text: "VLMs are impressive and unevenly capable. Knowing the specific failure modes — and their causes — lets you design around them instead of being surprised in production.",
        },
        { t: "h", text: "The task landscape" },
        {
          t: "table",
          head: ["Task", "Reliability", "Notes"],
          rows: [
            ["Image captioning", "Strong", "Effectively solved for general photographs"],
            ["Visual question answering", "Strong on the obvious", "Degrades sharply on fine detail"],
            ["Document understanding / OCR", "Strong and improving fast", "The highest-value commercial application"],
            ["Chart and diagram reading", "Moderate", "Reads labels well; extracting precise values is unreliable"],
            ["Grounding / localisation", "Moderate", "Coarse boxes yes; pixel-precise no"],
            ["Counting", "Weak", "Reliable below ~5 objects, degrades quickly beyond"],
            ["Spatial relations", "Weak", "Left/right, above/below are surprisingly error-prone"],
            ["Fine text in images", "Weak at low resolution", "A patch-size limitation (lesson 1), not a reasoning one"],
            ["Video understanding", "Emerging", "Frame sampling loses temporal detail"],
          ],
        },
        { t: "h", text: "Why counting and spatial reasoning fail" },
        {
          t: "steps",
          items: [
            { title: "Patchification destroys instance boundaries", text: "An object may span several patches, or several objects may share one. Nothing in the representation says 'this is one distinct thing'." },
            { title: "The training objective never required it", text: "CLIP-style contrastive learning matches whole images to whole captions. Captions rarely specify exact counts or precise arrangements, so there was no pressure to encode them." },
            { title: "Attention pooling blurs positions", text: "Global attention mixes patch features. Precise spatial relations are diluted by the very mechanism that provides global understanding." },
            { title: "The practical response", text: "For counting or localisation that must be right, use a detection model (YOLO, DETR, Grounding DINO) and give the VLM its structured output. Use the VLM for interpretation, not for measurement — the same division of labour as using a calculator for arithmetic (Module 11)." },
          ],
        },
        { t: "h", text: "Object hallucination" },
        {
          t: "p",
          text: "VLMs confidently describe objects that are not in the image. The mechanism is the language prior overwhelming weak visual evidence: shown a kitchen, the LLM's knowledge that kitchens contain refrigerators can outweigh the fact that no refrigerator is visible.",
        },
        {
          t: "list",
          items: [
            "**Measured by POPE**, which asks yes/no questions about object presence, including deliberately absent objects. Models often say yes to objects that plausibly *belong* in the scene.",
            "**Worse with longer outputs** — the further generation proceeds, the more the language model drifts from the image and the more it fills in from priors.",
            "**Mitigations** — ask for shorter, more targeted descriptions; ask explicitly \"is X present? answer only from what is visible\"; use higher resolution; and cross-check critical claims with a second question."
          ],
        },
        { t: "h", text: "Reading benchmarks sceptically" },
        {
          t: "table",
          head: ["Benchmark", "Tests", "Caveat"],
          rows: [
            ["VQAv2", "General visual QA", "Largely saturated; strong language priors let models guess"],
            ["MMMU", "College-level multi-discipline reasoning", "The current headline benchmark; many items solvable from text alone"],
            ["DocVQA / ChartQA", "Document and chart understanding", "Genuinely useful and commercially relevant"],
            ["POPE", "Object hallucination", "Narrow but honest and diagnostic"],
            ["MMBench / SEED-Bench", "Broad capability suites", "Multiple choice; susceptible to option-position bias"],
            ["TextVQA / OCRBench", "Reading text in images", "Correlates well with real document performance"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The 'blind' baseline problem",
          text: "For several popular VLM benchmarks, a language model given only the question and no image scores far above chance — sometimes competitively. That means the benchmark is measuring text priors as much as vision. Whenever you evaluate a VLM, run the blind baseline: same questions, no image. The difference is the part that is actually about seeing. This is a genuinely useful and rarely-performed check.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why do VLMs struggle with counting?\" Give the representational answer — patchification does not preserve object instances, and the contrastive training objective never demanded counts — then the engineering answer: use a detection model and pass its structured output to the VLM. Explaining both the cause and the workaround is what makes it a strong answer.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 14,
      title: "VLMs in production: documents, video, and multimodal RAG",
      summary: "Where VLMs are actually deployed today and the patterns that work.",
      blocks: [
        {
          t: "p",
          text: "Setting demos aside, three application areas are producing real value. Each has a characteristic architecture worth knowing.",
        },
        { t: "h", text: "1. Document AI — the biggest commercial use" },
        {
          t: "p",
          text: "Invoices, forms, contracts, insurance claims, medical records. The traditional pipeline was OCR → layout analysis → template matching → extraction, brittle at every stage. A VLM collapses it into one step: show the page, ask for structured output.",
        },
        {
          t: "code",
          lang: "python",
          caption: "The pattern that works",
          code: `class Invoice(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: str          # ISO 8601
    line_items: list[LineItem]
    total: float
    currency: str

response = vlm.generate(
    image=page_image,
    schema=Invoice,                       # structured output (Module 10)
    prompt=("Extract the invoice fields. Use only values visible in "
            "the document. If a field is absent, return null — do not "
            "infer it. Copy numbers exactly as printed.")
)

# The three instructions doing real work:
#   "only values visible"   -> suppresses the language prior
#   "return null if absent" -> permission to abstain (Module 9)
#   "copy exactly"          -> discourages helpful reformatting of
#                              numbers, which corrupts totals`,
        },
        {
          t: "list",
          items: [
            "**Validate structurally, not just semantically.** Do the line items sum to the total? Is the date plausible? Cheap arithmetic checks catch a large share of extraction errors deterministically.",
            "**Return confidence and route low-confidence items to humans.** Full automation on documents is rarely the right target; 85% automated with clean escalation usually beats 95% with silent errors.",
            "**Consider hybrid.** Run a traditional OCR engine and give the VLM both the image and the OCR text. The VLM handles layout and semantics; OCR handles character accuracy. This consistently outperforms either alone.",
          ],
        },
        { t: "h", text: "2. Multimodal RAG" },
        {
          t: "p",
          text: "Your corpus is not just text. Slide decks, engineering diagrams, screenshots, and charts carry information that vanishes when you extract text. Three approaches, in increasing sophistication:",
        },
        {
          t: "table",
          head: ["Approach", "How", "Tradeoff"],
          rows: [
            ["Caption and index", "VLM writes a description; embed the text", "Simple; reuses your whole text pipeline; loses detail not in the caption"],
            ["Shared embedding space", "Embed images and text with CLIP into one index", "True cross-modal search; CLIP embeddings are weaker than text embeddings for fine retrieval"],
            ["Page-image retrieval (ColPali)", "Embed page screenshots directly with a VLM, using late interaction", "No parsing at all; strong on visually complex documents; larger index"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "ColPali is the interesting recent development",
          text: "Rather than parsing a PDF into text — losing tables, layout, and figures in the process — screenshot each page and embed the image directly using a VLM with ColBERT-style late interaction (Module 8). Retrieval then returns page images, which you feed straight to a VLM to answer. It eliminates the parsing stage that Module 9 identified as the biggest source of RAG failures. The costs are a larger index and higher generation cost from image tokens, but for visually complex documents it is a genuinely different and often better architecture.",
        },
        { t: "h", text: "3. Video" },
        {
          t: "p",
          text: "Video is the frontier and the hardest token-budget problem in the module. One minute at 30fps is 1,800 frames; at 576 tokens each that is over a million tokens.",
        },
        {
          t: "list",
          items: [
            "**Uniform frame sampling** — take N frames evenly. Simple and standard; misses anything between samples.",
            "**Keyframe selection** — sample on scene changes or motion. Better coverage per token; needs a preprocessing step.",
            "**Token pooling across frames** — merge similar adjacent-frame tokens, since consecutive frames are highly redundant. This is where resamplers (lesson 3) come back into their own.",
            "**Hierarchical processing** — caption short segments, then reason over the captions. Trades visual fidelity for scalability; often the pragmatic answer for long video.",
            "**Do not forget audio** — for most real video, the transcript carries more information per token than the frames. Transcribe first, sample frames second."
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The temporal reasoning gap",
          text: "Sampled frames give a slideshow, not a video. Questions about ordering, causation, speed, or brief events are unreliable because the evidence may fall between samples and because the architecture has no explicit temporal modelling beyond positional encoding over frames. Test your specific temporal questions before assuming they work — 'the model can watch video' is doing a lot of load-bearing work in most marketing claims.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Where this connects to Module 14",
          text: "Everything here is a serving problem. A VLM pipeline has two very different stages — a vision encoder (compute-bound, batches well, fixed cost per image) and an LLM decoder (memory-bandwidth-bound, variable length). They have different optimal batch sizes and different hardware profiles, which is precisely why production deployments run them as separate optimised engines behind a single service. That is the subject of the next module.",
        },
      ],
    },
  ],

  theory: [
    "What makes a model multimodal: aligning more than one modality into a shared representation space.",
    "Vision Transformers: patchify an image into P×P squares, linearly project each, add positional embeddings, run a standard bidirectional transformer.",
    "ViT discards CNN priors (locality, translation equivariance, hierarchy) and must learn them — which is why it needs 300M-image datasets to win.",
    "Why resolution is quadratically expensive, and why patchification permanently destroys sub-patch detail.",
    "CLIP: contrastive training over 400M web image-caption pairs, using the same InfoNCE loss as text embedding models.",
    "Why CLIP needs enormous batch sizes: in-batch negatives, 32,768 batch giving 32,767 negatives per positive.",
    "Zero-shot classification via text prompts, and why it works — classification becomes retrieval in a shared space.",
    "CLIP's weaknesses: compositionality (bag-of-concepts behaviour), counting, text-in-image confusion, and web-data bias. SigLIP's pairwise sigmoid loss as a fix.",
    "Three vision-to-LLM connectors: linear projection (LLaVA), resampler/Q-Former (BLIP-2, Flamingo), and gated cross-attention (Flamingo, Llama-3.2-Vision).",
    "LLaVA's two-stage training: freeze everything and train only the projector, then unfreeze the LLM for instruction tuning.",
    "Why linear projection won for single images: when compute is not the constraint, prefer the simplest connector and spend effort on data.",
    "Why cross-attention provably preserves text-only capability (frozen LLM weights, zero-initialised gates).",
    "Dynamic tiling / AnyRes: split into tiles plus a downscaled thumbnail for global context, at a large token cost.",
    "Token budgeting for images: visual tokens are ordinary tokens — billed, context-consuming, and quadratic in prefill.",
    "Practical controls: task-appropriate resolution, cropping to the region of interest, image caching, and using specialist OCR where transcription is all you need.",
    "Native-resolution encoders (NaViT-style) as the current direction.",
    "The capability landscape: strong at captioning, VQA, and document understanding; weak at counting, precise spatial relations, and fine text.",
    "Why counting fails: patchification does not preserve object instances, and contrastive training never demanded counts.",
    "Object hallucination and POPE; why longer outputs drift further from the image as language priors take over.",
    "Reading VLM benchmarks sceptically, and the 'blind baseline' check — score the same questions with no image.",
    "Document AI as the highest-value application: structured output schemas, abstention instructions, arithmetic validation, confidence routing, and OCR+VLM hybrids.",
    "Multimodal RAG: caption-and-index, shared CLIP space, and ColPali-style page-image retrieval that eliminates parsing entirely.",
    "Video: frame sampling strategies, token pooling, hierarchical captioning, the primacy of audio transcripts, and the temporal reasoning gap.",
    "Why VLM serving splits into two engines: a compute-bound vision encoder and a memory-bound LLM decoder.",
  ],

  math: [
    {
      title: "ViT patch count",
      formula: "num_patches = (H/P) × (W/P)",
      note: "224×224 with P=16 → 196 patches; 336×336 with P=14 → 576. Attention is quadratic in this number, so halving patch size quadruples cost.",
    },
    {
      title: "Patch embedding dimension",
      formula: "flattened patch = P × P × C  →  linear projection → d_model",
      note: "A 16×16 RGB patch is 768 values projected to d_model. Implemented as a stride-P convolution. Detail inside the patch is compressed irrecoverably.",
    },
    {
      title: "CLIP contrastive loss",
      formula: "L = -(1/N) Σ log( e^(sim(Ii,Ti)/τ) / Σj e^(sim(Ii,Tj)/τ) ), symmetric",
      note: "An N×N similarity matrix with the correct pairs on the diagonal. Identical in form to InfoNCE (Module 6). τ is learned. Large N means more negatives and a sharper space.",
    },
    {
      title: "Multimodal sequence length",
      formula: "total_tokens = num_image_tokens + num_text_tokens",
      note: "576 tokens per image at 336×336. Two images in an 8k window leave 7,040 tokens; with 6-tile AnyRes they leave 1,280.",
    },
    {
      title: "Tiled image token count",
      formula: "tokens = (n_tiles + 1) × tokens_per_tile",
      note: "The +1 is the global thumbnail. A 4×4 grid at 576 tokens/tile is 9,792 visual tokens for one page — do this arithmetic before designing the product.",
    },
    {
      title: "Video token explosion",
      formula: "tokens = n_frames × tokens_per_frame",
      note: "One minute at 30fps × 576 tokens = 1,036,800 tokens. Every video technique (sampling, pooling, hierarchical captioning) exists to attack this number.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain how a Vision Transformer converts an image into a sequence a standard transformer can process. What does it give up compared with a CNN, and why does it win anyway at scale?" },
    { type: "theory", q: "Why does patchification permanently limit a VLM's ability to read small text? Explain why this is a representational and not a reasoning limitation." },
    { type: "theory", q: "Describe CLIP's training objective and explain why it enables zero-shot classification into categories never seen during training." },
    { type: "theory", q: "Why does CLIP training require very large batch sizes? Connect this to Module 6's discussion of negatives." },
    { type: "theory", q: "Name three documented weaknesses of CLIP and explain what causes each." },
    { type: "theory", q: "Compare the three vision-to-LLM connectors (linear projection, resampler, cross-attention) across token cost, spatial detail, training cost, and preservation of text-only ability." },
    { type: "theory", q: "Why does gated cross-attention provably preserve the base LLM's text-only capability while linear projection does not?" },
    { type: "theory", q: "Explain why BLIP-2's Q-Former approach was more compute-efficient than training LLaVA-style end-to-end, and why the field moved to linear projection anyway." },
    { type: "theory", q: "Explain dynamic tiling / AnyRes, including why a downscaled thumbnail is included alongside the tiles." },
    { type: "theory", q: "Why do VLMs struggle with counting and spatial relations? Give the representational cause and the engineering workaround." },
    { type: "theory", q: "What is object hallucination in a VLM, what benchmark measures it, and why does it get worse with longer outputs?" },
    { type: "theory", q: "What is the 'blind baseline' check for VLM benchmarks, and what does a small gap tell you?" },
    { type: "theory", q: "Describe the ColPali approach to multimodal RAG and explain which RAG failure mode it eliminates entirely." },
    { type: "theory", q: "Why is the audio transcript often more information-dense per token than sampled frames for video understanding?" },
    { type: "theory", q: "What does 'grounding' mean in a VLM context, and why is it harder than captioning?" },
    { type: "math", q: "For a 336×336 image split into 14×14 pixel patches, how many patch tokens does the ViT produce? Now do the same for 448×448." },
    { type: "math", q: "A VLM uses 576 tokens per image with an 8k context window. How much budget remains for text when 2 images are included? Recompute assuming AnyRes tiling with 5 tiles plus a thumbnail per image." },
    { type: "math", q: "Estimate the visual token count for a 10-page document scanned at 1344×1344 and processed with 4×4 tiling at 576 tokens per tile plus a thumbnail per page. What does that imply about context window and cost?" },
    { type: "math", q: "Compute the total tokens for 1 minute of video at 30fps with 576 tokens per frame. Then compute it for 1 frame per second, and for 1 frame per second with 64-token pooling." },
  ],

  resources: [
    { label: "Dosovitskiy et al. 2020 — An Image is Worth 16x16 Words (ViT)", url: "https://arxiv.org/abs/2010.11929", kind: "paper" },
    { label: "Radford et al. 2021 — Learning Transferable Visual Models (CLIP)", url: "https://arxiv.org/abs/2103.00020", kind: "paper" },
    { label: "Zhai et al. 2023 — Sigmoid Loss for Language-Image Pre-Training (SigLIP)", url: "https://arxiv.org/abs/2303.15343", kind: "paper" },
    { label: "Li et al. 2023 — BLIP-2 (Q-Former)", url: "https://arxiv.org/abs/2301.12597", kind: "paper" },
    { label: "Liu et al. 2023 — Visual Instruction Tuning (LLaVA)", url: "https://arxiv.org/abs/2304.08485", kind: "paper" },
    { label: "Liu et al. 2023 — Improved Baselines with Visual Instruction Tuning (LLaVA-1.5)", url: "https://arxiv.org/abs/2310.03744", kind: "paper" },
    { label: "Alayrac et al. 2022 — Flamingo (gated cross-attention)", url: "https://arxiv.org/abs/2204.14198", kind: "paper" },
    { label: "Li et al. 2023 — Evaluating Object Hallucination (POPE)", url: "https://arxiv.org/abs/2305.10355", kind: "paper" },
    { label: "Faysse et al. 2024 — ColPali: efficient document retrieval with VLMs", url: "https://arxiv.org/abs/2407.01449", kind: "paper" },
    { label: "Wang et al. 2024 — Qwen2-VL (native dynamic resolution)", url: "https://arxiv.org/abs/2409.12191", kind: "paper" },
    { label: "HuggingFace — Vision Language Models explained", url: "https://huggingface.co/blog/vlms", kind: "blog" },
    { label: "open_clip — reproducible CLIP training", url: "https://github.com/mlfoundations/open_clip", kind: "repo" },
  ],
};

export default m13;
