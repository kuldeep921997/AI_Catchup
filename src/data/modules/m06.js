const m06 = {
  id: "m06",
  week: 6,
  hours: 6,
  title: "Embeddings: From Word2Vec to Contextual Embeddings",
  tag: "Embeddings",
  why: "Embeddings are the numeric backbone of semantic search, RAG, and vector databases. You need to understand not just 'what' they are but why they encode meaning geometrically.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 14,
      title: "The distributional hypothesis",
      summary: "The single linguistic idea that makes learning meaning from raw text possible at all.",
      blocks: [
        {
          t: "p",
          text: "How can a machine learn what a word means, given only text and no dictionary, no grounding in the physical world, and no human explanation? The answer is a claim from 1950s linguistics that turned out to be computationally exploitable.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The distributional hypothesis",
          text: "\"You shall know a word by the company it keeps\" (Firth, 1957). Words that appear in similar contexts have similar meanings. It is not a claim that context *is* meaning — it is the claim that context is a sufficiently good proxy that you can learn from it.",
        },
        {
          t: "p",
          text: "Test it on yourself. You have never seen the word *tesgüino*. Now read: \"A bottle of tesgüino is on the table.\" \"Everybody likes tesgüino.\" \"Tesgüino makes you drunk.\" \"We make tesgüino out of corn.\" You now know it is an alcoholic beverage made from corn — purely from distributional evidence. No definition was given.",
        },
        { t: "h", text: "From hypothesis to vectors" },
        {
          t: "p",
          text: "If meaning is context, then a word can be represented by a summary of its contexts. The naive version: build a co-occurrence matrix where entry (i, j) counts how often word i appears near word j.",
        },
        {
          t: "code",
          lang: "text",
          caption: "A toy co-occurrence matrix (window = 1)",
          code: `Corpus: "I like deep learning. I like NLP. I enjoy flying."

           I  like  enjoy  deep  learning  NLP  flying
    I      0    2      1     0      0       0     0
    like   2    0      0     1      0       1     0
    enjoy  1    0      0     0      0       0     1
    deep   0    1      0     0      1       0     0
    ...

Read the rows as vectors. 'like' and 'enjoy' have similar rows
(both follow 'I', both precede an activity) — so they land near
each other in this space. That is the distributional hypothesis,
made numeric.`,
        },
        {
          t: "list",
          items: [
            "**It works** — cosine similarity over these rows genuinely captures relatedness.",
            "**It is unusable at scale** — a 50,000-word vocabulary gives a 50,000-dimensional vector per word, almost entirely zeros.",
            "**Raw counts are the wrong scale** — 'the' co-occurs with everything and dominates. PMI (pointwise mutual information) fixes this by measuring co-occurrence against chance.",
          ],
        },
        {
          t: "math",
          formula: "PMI(w, c) = log( P(w, c) / (P(w)·P(c)) )     PPMI = max(PMI, 0)",
          note: "How much more often do w and c occur together than if they were independent? Positive PMI clips negatives, which are unreliable estimates from sparse counts. This is the classical fix and, as the next lesson shows, it is secretly what Word2Vec computes.",
        },
        { t: "h", text: "Sparse to dense" },
        {
          t: "p",
          text: "You can compress the co-occurrence matrix with SVD to get dense low-dimensional vectors — this is Latent Semantic Analysis, from 1988, and it works. But SVD on a huge matrix is expensive and cannot be updated incrementally. In 2013 Word2Vec showed you could learn the dense vectors directly with a tiny neural network and streaming updates, and the field moved.",
        },
        {
          t: "table",
          head: ["", "Sparse (count-based)", "Dense (learned)"],
          rows: [
            ["Dimensions", "|V| (50k+)", "50 – 1536"],
            ["Interpretability", "Each dim is a context word", "Dimensions have no individual meaning"],
            ["Similarity", "Only exact context overlap", "Generalises across related contexts"],
            ["Storage for 1M words", "Huge and sparse", "~3 GB at 768 dims float32"],
            ["Still used for", "BM25, lexical retrieval (Module 8)", "Everything semantic"],
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 18,
      title: "Word2Vec, GloVe, and the geometry of meaning",
      summary: "How a two-layer network learns vectors where king − man + woman lands near queen.",
      blocks: [
        {
          t: "p",
          text: "Word2Vec (Mikolov et al., 2013) is a shallow network trained on a fake task. The task itself is throwaway — what you keep is the weight matrix, which turns out to be a superb set of word vectors. That pattern (train on a proxy objective, harvest the internal representations) is now everywhere in ML.",
        },
        { t: "h", text: "Two architectures" },
        {
          t: "list",
          items: [
            "**CBOW** (Continuous Bag of Words) — given the surrounding context, predict the centre word. Faster; better for frequent words.",
            "**Skip-gram** — given the centre word, predict each surrounding word. Slower but better for rare words and small corpora, because each occurrence generates several training examples. Skip-gram with negative sampling is the version people mean by \"Word2Vec\".",
          ],
        },
        {
          t: "math",
          formula: "maximise (1/T) Σ_t Σ_{−c ≤ j ≤ c, j≠0} log P(w_{t+j} | w_t)",
          note: "For each position t, maximise the probability of each context word within a window of size c. The window size matters: small windows (2) capture syntactic/functional similarity; large windows (10) capture topical relatedness.",
        },
        { t: "h", text: "The problem with the softmax, and negative sampling" },
        {
          t: "p",
          text: "Written naively, P(context | centre) is a softmax over the entire vocabulary — a 50,000-way normalisation for every single training example. That is computationally hopeless. Negative sampling replaces it with a much cheaper binary problem.",
        },
        {
          t: "math",
          formula: "L = log σ(v'_c · v_w) + Σ_{i=1}^{k} E_{n∼P_n} [ log σ(−v'_n · v_w) ]",
          note: "Instead of normalising over the vocabulary, train a binary classifier: is this (word, context) pair real or fabricated? Push the real pair's dot product up, and push k sampled fake pairs' dot products down. k is typically 5–20. This turns an O(|V|) update into an O(k) update.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The 3/4 power detail",
          text: "Negatives are sampled from the unigram distribution raised to the power 0.75, not from the raw frequency. This dampens the dominance of very frequent words while still sampling them more than rare ones. It is a hack found by experiment, it measurably matters, and it is the kind of unglamorous detail that separates papers that reproduce from papers that do not.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Word2Vec is implicitly factorising a PMI matrix",
          text: "Levy & Goldberg (2014) proved that skip-gram with negative sampling is implicitly factorising a shifted PPMI matrix — the very thing from the previous lesson. So the neural method and the count-based method are computing the same thing; the neural version is just streamable and cheaper. A satisfying result, and a good reminder that 'neural' and 'statistical' are often the same mathematics wearing different clothes.",
        },
        { t: "h", text: "GloVe: fitting the counts directly" },
        {
          t: "math",
          formula: "J = Σ_{i,j} f(X_ij) ( wᵢᵀw̃ⱼ + bᵢ + b̃ⱼ − log X_ij )²",
          note: "X_ij is the global co-occurrence count. The model directly fits dot products to log co-occurrence, weighted by f(X_ij), which downweights very rare pairs and caps the influence of very frequent ones. Where Word2Vec streams local windows, GloVe uses global statistics in one pass.",
        },
        {
          t: "p",
          text: "In practice the two perform comparably, with GloVe sometimes slightly better on analogy tasks and Word2Vec being easier to train incrementally. Both are historically important and neither is what you would deploy today.",
        },
        { t: "h", text: "Why analogies work" },
        {
          t: "p",
          text: "The famous result: `king − man + woman ≈ queen`. It is not magic, and understanding it clarifies what these vectors are.",
        },
        {
          t: "steps",
          items: [
            { title: "Meaning decomposes into directions", text: "Because the objective is built entirely from dot products, and dot products are linear, consistent semantic contrasts end up as consistent vector offsets." },
            { title: "'Male → female' becomes a direction", text: "The vector man − woman is approximately parallel to king − queen, uncle − aunt, actor − actress. The same relation, repeated across many pairs, produces a shared displacement." },
            { title: "So arithmetic works", text: "king − man + woman removes the male component and adds the female one, landing near queen." },
            { title: "But be sceptical", text: "Standard analogy evaluations exclude the input words from the candidate answers. Without that exclusion, the nearest vector to `king − man + woman` is very often `king` itself. The effect is real but weaker and more brittle than the popular framing suggests." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The same geometry encodes bias",
          text: "If `man − woman` is a direction, so is `doctor − nurse`, and Bolukbasi et al. showed embeddings trained on web text produce `man:computer_programmer :: woman:homemaker`. The vectors faithfully reproduce the statistical regularities of their corpus, including the prejudiced ones. This is not a bug in the algorithm — it is the distributional hypothesis working exactly as designed on biased data, and it propagates into every downstream system.",
        },
        { t: "h", text: "The fatal limitation: one vector per word" },
        {
          t: "p",
          text: "Word2Vec gives `bank` exactly one vector, which must simultaneously represent the financial institution and the side of a river. It ends up as an average of the two — a point in space that is not a good representation of either sense. Every polysemous word is blurred, and polysemy is pervasive. Fixing this required contextual embeddings.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 16,
      title: "Contextual embeddings and pooling",
      summary: "Same word, different vector depending on the sentence — and how to turn many token vectors into one.",
      blocks: [
        {
          t: "p",
          text: "The fix for polysemy is obvious in hindsight: do not assign a vector to a word type, assign one to a word *occurrence*. Run the sentence through a transformer and read out the hidden state at each position. That hidden state has, by construction, attended to the whole sentence.",
        },
        {
          t: "code",
          lang: "text",
          caption: "Contextual embeddings in action",
          code: `"I sat on the river bank."          -> bank = [0.21, -0.44, ...]
"I deposited cash at the bank."     -> bank = [0.83,  0.12, ...]

cosine similarity between the two 'bank' vectors ≈ 0.4

Word2Vec would give exactly one vector for 'bank', with cosine
similarity to itself of 1.0 — it cannot tell the two apart at all.`,
        },
        { t: "h", text: "The lineage" },
        {
          t: "list",
          items: [
            "**ELMo (2018)** — deep bidirectional LSTM; the first widely-used contextual embeddings. Historically pivotal, now superseded.",
            "**BERT (2018)** — bidirectional transformer trained with masked language modelling. Every token attends to the full sentence in both directions, which is exactly what you want for representation.",
            "**Sentence-BERT (2019)** — the crucial practical step. Fine-tunes BERT with a siamese architecture so that *cosine similarity between the output vectors is directly meaningful*.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Raw BERT embeddings are bad at similarity — this surprises people",
          text: "Pretrained BERT's [CLS] token was trained for next-sentence prediction, not similarity, and its mean-pooled outputs occupy a narrow anisotropic cone where almost every pair has cosine similarity above 0.7. Reimers & Gurevych found raw BERT embeddings performed *worse* than averaged GloVe vectors on semantic textual similarity. The lesson: a model produces useful similarity geometry only if it was trained with a similarity objective. Never use `bert-base-uncased` directly as an embedding model.",
        },
        { t: "h", text: "Pooling: many token vectors, one sentence vector" },
        {
          t: "table",
          head: ["Strategy", "How", "Notes"],
          rows: [
            ["Mean pooling", "Average all token vectors (masking padding)", "The reliable default; used by most Sentence-Transformers models"],
            ["[CLS] token", "Take the first special token's vector", "Only works if the model was trained to put a summary there"],
            ["Last-token pooling", "Take the final token's hidden state", "The standard for decoder-only embedding models, since only the last token has seen everything"],
            ["Max pooling", "Element-wise maximum", "Occasionally better for keyword-ish matching; rare"],
            ["Weighted mean", "Weight by position or IDF", "Marginal gains; more moving parts"],
          ],
        },
        {
          t: "code",
          lang: "python",
          caption: "Mean pooling done correctly — the mask is not optional",
          code: `def mean_pool(hidden_states, attention_mask):
    # hidden_states: (B, T, C).  attention_mask: (B, T), 1 for real tokens.
    mask = attention_mask.unsqueeze(-1).float()      # (B, T, 1)
    summed = (hidden_states * mask).sum(dim=1)       # (B, C)
    counts = mask.sum(dim=1).clamp(min=1e-9)         # (B, 1)
    return summed / counts

# Forgetting the mask averages in the padding tokens, so a short
# sentence in a long batch gets a different vector than the same
# sentence in a short batch. Silent, batch-dependent corruption —
# a genuinely nasty bug because nothing errors.`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Always L2-normalise afterwards",
          text: "Normalising to unit length makes cosine similarity equal the dot product (Module 1), which is faster and is what most vector databases assume. It also removes magnitude effects — longer texts tend to produce larger-norm vectors, and you do not want length driving your rankings. `embeddings / embeddings.norm(dim=-1, keepdim=True)`.",
        },
        { t: "h", text: "Do not use the last layer blindly" },
        {
          t: "p",
          text: "The final layer of a pretrained model is specialised for its pretraining objective — predicting masked tokens or next tokens — which is not the same as representing meaning. Empirically, the second-to-last layer, or an average of the last four, often gives better similarity performance from a raw pretrained model. This is moot for purpose-trained embedding models, where the training already optimised the output layer for exactly this.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 18,
      title: "How modern embedding models are trained",
      summary: "Contrastive learning, InfoNCE, hard negatives — the recipe behind every model on the MTEB leaderboard.",
      blocks: [
        {
          t: "p",
          text: "Every strong embedding model — BGE, E5, GTE, Nomic, the OpenAI and Cohere embedding APIs — is trained with essentially the same recipe: contrastive learning. The goal is stated directly in the geometry: pull things that should match together, push everything else apart.",
        },
        { t: "h", text: "The InfoNCE loss" },
        {
          t: "math",
          formula: "L = − log[ e^{sim(q, p⁺)/τ} / ( e^{sim(q, p⁺)/τ} + Σᵢ e^{sim(q, pᵢ⁻)/τ} ) ]",
          note: "q is the query, p⁺ the correct match, pᵢ⁻ the negatives, sim is cosine similarity, τ is a temperature (typically 0.02–0.05). Look at the shape: it is exactly a softmax cross-entropy over 'which of these candidates is the right one'.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Contrastive learning is classification in disguise",
          text: "The loss is cross-entropy over candidates, so everything you learned in Module 1 transfers directly. The 'classes' change every batch, which is exactly why it scales: you never need a fixed label set, only pairs that belong together. That is also why the same loss trains CLIP for images and text (Module 13).",
        },
        { t: "h", text: "Where positive pairs come from" },
        {
          t: "list",
          items: [
            "**Naturally occurring pairs** — (question, accepted answer) from StackExchange, (title, body), (citation, abstract), (query, clicked document) from search logs. Cheap and abundant.",
            "**Translation pairs** — the same sentence in two languages, which is how multilingual embedding models align their spaces.",
            "**Curated supervised data** — NLI datasets, where entailment pairs are positives and contradictions are hard negatives.",
            "**Synthetic** — prompt an LLM to write a query that a given document would answer. Now standard practice, and the reason embedding quality has jumped since 2023.",
          ],
        },
        { t: "h", text: "Negatives: where the real difficulty lives" },
        {
          t: "steps",
          items: [
            {
              title: "In-batch negatives (free)",
              text: "Every other document in the batch is a negative for this query. Costs nothing extra, which is why embedding training uses enormous batch sizes — often 16k–32k, sometimes with GradCache to fit them. More negatives means a harder, more informative task.",
            },
            {
              title: "The problem with random negatives",
              text: "A random document is trivially distinguishable from the correct one. The model learns to separate 'about cooking' from 'about astrophysics' and stops there. It never learns fine distinctions, which is exactly what retrieval needs.",
            },
            {
              title: "Hard negative mining",
              text: "Use the current model to retrieve top-k for each query, discard known positives, and use the rest as negatives. These are documents that *look* relevant but are not — precisely the discriminations that matter. This step typically produces the largest single quality jump in the whole recipe.",
            },
            {
              title: "The false-negative trap",
              text: "Mined 'negatives' are often unlabelled positives. Training on them teaches the model that correct answers are wrong, and quality collapses. Mitigate by filtering with a stronger cross-encoder, or by skipping the very top-ranked candidates and mining from ranks 30–100.",
            },
          ],
        },
        { t: "h", text: "Matryoshka Representation Learning" },
        {
          t: "p",
          text: "A genuinely elegant idea. Normally an embedding's dimensions are entangled — truncating a 1536-dim vector to 256 dims destroys it. MRL trains with the loss applied at multiple truncation lengths simultaneously, forcing the most important information into the earliest dimensions.",
        },
        {
          t: "math",
          formula: "L_MRL = Σ_{d ∈ {64,128,256,512,1024,1536}} w_d · L_contrastive(embedding[:d])",
          note: "One model, many usable sizes. Truncate to 256 dims and you keep most of the quality at a sixth of the storage and search cost — no retraining, no separate model. OpenAI's text-embedding-3 exposes this directly via the `dimensions` parameter.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The practical pattern this enables",
          text: "Two-stage retrieval on a single model: search over 256-dim truncated vectors to get 1,000 candidates fast and cheaply, then rerank those with the full 1536-dim vectors. You get large-vector accuracy at small-vector search cost. This composes neatly with the reranking pipeline in Module 8.",
        },
        {
          t: "note",
          tone: "warn",
          title: "The asymmetry most people miss",
          text: "In search, queries and documents are different kinds of text — a five-word question versus a 500-word passage. Many models are trained with asymmetric prefixes for exactly this reason: E5 requires `query:` and `passage:`, BGE requires an instruction prefix on queries only. Omitting them, or applying the wrong one to the wrong side, silently costs several points of recall. Read the model card. This is the most common embedding misconfiguration in production RAG.",
        },
      ],
    },

    {
      id: "l5",
      level: "advanced",
      minutes: 16,
      title: "Choosing and operating an embedding model",
      summary: "The decision that quietly determines your RAG system's ceiling — and how to change it later without breaking everything.",
      blocks: [
        {
          t: "p",
          text: "Your embedding model sets an upper bound on retrieval quality. No amount of prompt engineering downstream recovers a document that was never retrieved. This is also the most annoying component to change, because changing it means re-embedding your entire corpus.",
        },
        { t: "h", text: "Reading MTEB properly" },
        {
          t: "p",
          text: "MTEB (Massive Text Embedding Benchmark) is the standard leaderboard, covering retrieval, clustering, classification, reranking, and semantic similarity across many languages. It is genuinely useful and routinely misused.",
        },
        {
          t: "list",
          items: [
            "**Look at the retrieval column, not the average.** If you are building RAG, clustering and classification scores are noise that inflates the average.",
            "**Assume some contamination.** Models are now trained partly on MTEB's training splits. Top-of-leaderboard differences of one point mean nothing.",
            "**Check the language and domain.** A model tuned for English web text will underperform on Hindi, on legal contracts, or on log lines, regardless of its average.",
            "**Check the max sequence length.** A 512-token limit silently truncates your 800-token chunks — the tail of every chunk is simply not embedded, and nothing warns you.",
            "**Always run your own eval.** 50 real queries with known-relevant documents beats any leaderboard. This takes an afternoon and is the highest-value afternoon in the project.",
          ],
        },
        { t: "h", text: "The dimension tradeoff" },
        {
          t: "table",
          head: ["Dims", "Storage / 1M vectors (fp32)", "Character"],
          rows: [
            ["384", "1.5 GB", "Fast, cheap, surprisingly competitive (all-MiniLM, bge-small)"],
            ["768", "3.1 GB", "The standard sweet spot (bge-base, e5-base, nomic)"],
            ["1024", "4.1 GB", "Strong quality (bge-large, e5-large)"],
            ["1536 – 4096", "6.1 – 16 GB", "API models and LLM-based embedders; diminishing returns"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Bigger is not proportionally better",
          text: "Going from 384 to 1536 dimensions typically buys a few points of NDCG for 4× the storage, 4× the memory, and slower search. For most applications a good 768-dim model plus a reranker (Module 8) beats a 1536-dim model without one — and costs less. Spend your budget on reranking before you spend it on dimensions.",
        },
        { t: "h", text: "Quantisation" },
        {
          t: "list",
          items: [
            "**float32 → float16** — 2× smaller, essentially free in quality. Do this by default.",
            "**int8** — 4× smaller, typically ~1% quality loss with proper calibration. Very good deal.",
            "**binary (1 bit/dim)** — 32× smaller, uses Hamming distance which is extremely fast. Loses meaningful accuracy alone, but excellent as a first-stage filter before rescoring the top candidates with full-precision vectors.",
          ],
        },
        { t: "h", text: "Migrating embedding models without an outage" },
        {
          t: "note",
          tone: "warn",
          title: "Embedding spaces are not compatible",
          text: "A vector from model A means nothing to model B. There is no conversion. Changing models requires re-embedding every document — for 10M chunks that is real time and real money. Plan for it before you pick your first model, not after.",
        },
        {
          t: "steps",
          items: [
            { title: "1. Keep the source text", text: "Store the original chunk text alongside every vector. If you only stored vectors you cannot re-embed and you are rebuilding the pipeline from scratch. This is the most important line in this lesson." },
            { title: "2. Build the new index alongside the old", text: "A separate collection or namespace. Never mutate in place." },
            { title: "3. Evaluate on the same query set", text: "Compare recall@k and NDCG on your own golden queries, not on MTEB." },
            { title: "4. Shadow, then cut over", text: "Run both, log the differences, then switch reads. Keep the old index until you are confident, then delete." },
          ],
        },
        { t: "h", text: "Operational realities" },
        {
          t: "list",
          items: [
            "**Version everything.** Store the model name and version in each vector's metadata. Mixed-model indexes produce garbage rankings and are miserable to debug.",
            "**Batch your embedding calls.** Embedding one document at a time wastes most of your GPU. Batches of 32–256 are typically 10–50× faster in total.",
            "**Cache aggressively.** Hash the text; skip re-embedding unchanged content. Most corpora change slowly.",
            "**Normalise once, at write time.** Then use dot product at query time.",
            "**Watch for drift.** If user queries shift over time — new products, new jargon — retrieval degrades quietly with no error. Sample and evaluate periodically (Module 15).",
          ],
        },
      ],
    },
  ],

  theory: [
    "The distributional hypothesis: 'a word is characterized by the company it keeps' — the theoretical basis for all embedding models.",
    "Co-occurrence matrices, PMI/PPMI weighting, and LSA/SVD as the pre-neural approach to dense vectors.",
    "Word2Vec (CBOW & Skip-gram): shallow networks trained on a proxy task; the weight matrix is what you actually keep.",
    "Negative sampling: replacing a |V|-way softmax with k binary discriminations, and the 3/4-power sampling distribution.",
    "Levy & Goldberg's result: skip-gram with negative sampling implicitly factorises a shifted PPMI matrix — neural and count-based methods compute the same thing.",
    "GloVe: fitting dot products to log global co-occurrence counts, weighted to control the influence of very rare and very frequent pairs.",
    "Why analogies work geometrically (consistent semantic contrasts become consistent vector offsets) — and why the standard evaluation overstates the effect.",
    "Embedding bias: the same geometry that encodes king-man+woman≈queen encodes occupational and gender stereotypes from the corpus.",
    "The fatal limitation of static embeddings: one vector per word type cannot represent polysemy.",
    "Contextual embeddings (ELMo → BERT → Sentence-BERT): a vector per word OCCURRENCE, produced by attending over the whole sentence.",
    "Why raw pretrained BERT embeddings are poor at similarity (anisotropy, wrong training objective) and why SBERT-style contrastive fine-tuning is required.",
    "Pooling strategies: mean (with attention mask), [CLS], last-token for decoder models, and why L2 normalisation should always follow.",
    "Contrastive training with InfoNCE — structurally identical to softmax cross-entropy over candidates.",
    "In-batch negatives, hard negative mining (the largest single quality lever), and the false-negative trap.",
    "Matryoshka Representation Learning: applying the loss at multiple truncation lengths so embeddings can be truncated without retraining.",
    "Query/document asymmetry: instruction prefixes like 'query:' and 'passage:' are functional, and omitting them silently costs recall.",
    "Choosing a model with MTEB (read the retrieval column, assume contamination, check max_seq_length, run your own eval).",
    "Dimension and quantisation tradeoffs; why a 768-dim model plus a reranker usually beats a 1536-dim model alone.",
    "Migrating embedding models: spaces are incompatible, so always store source text and build the new index alongside the old.",
  ],

  math: [
    {
      title: "PMI / PPMI",
      formula: "PMI(w,c) = log( P(w,c) / (P(w)P(c)) ) ; PPMI = max(PMI, 0)",
      note: "Measures co-occurrence against chance, correcting for the fact that frequent words co-occur with everything. The classical fix to raw count vectors.",
    },
    {
      title: "Skip-gram objective",
      formula: "maximize (1/T) Σt Σ(-c≤j≤c, j≠0) log P(w(t+j) | w(t))",
      note: "For each word, maximise the probability of its context words within window c. Small windows capture syntactic similarity; large windows capture topical relatedness.",
    },
    {
      title: "Negative sampling",
      formula: "L = log σ(v'c · vw) + Σ(i=1..k) E[log σ(-v'ni · vw)]",
      note: "Replaces the |V|-way softmax with k+1 binary decisions. k=5-20. Negatives are sampled from the unigram distribution raised to the power 0.75.",
    },
    {
      title: "GloVe objective",
      formula: "J = Σij f(Xij) (wi·w̃j + bi + b̃j - log Xij)²",
      note: "Fits dot products directly to log global co-occurrence counts. f() downweights rare pairs and caps the influence of very frequent ones.",
    },
    {
      title: "InfoNCE / contrastive loss",
      formula: "L = -log( e^(sim(q,p+)/τ) / Σi e^(sim(q,pi)/τ) )",
      note: "Softmax cross-entropy over candidates. τ ≈ 0.02-0.05. Pull the query toward its positive, push it away from negatives. The same loss trains CLIP.",
    },
    {
      title: "Matryoshka loss",
      formula: "L_MRL = Σ(d ∈ {64,128,...,1536}) w_d · L_contrastive(emb[:d])",
      note: "Applying the loss at multiple truncations forces the most important information into the earliest dimensions, making the vector safely truncatable.",
    },
    {
      title: "Euclidean vs cosine distance",
      formula: "d_euclid = ||A-B||₂  vs  d_cos = 1 - cos(θ) ; if normalised, ||A-B||² = 2 - 2cos(θ)",
      note: "For L2-normalised vectors the two rank results identically, so normalise once at write time and use the cheaper dot product at query time.",
    },
    {
      title: "Storage estimate",
      formula: "bytes = n_vectors × dims × bytes_per_value",
      note: "1M vectors at 768 dims float32 = 3.1GB. float16 halves it, int8 quarters it at ~1% quality loss, binary is 32× smaller as a first-stage filter.",
    },
  ],

  practice: [
    { type: "theory", q: "State the distributional hypothesis and explain why it makes learning meaning from unlabelled text possible." },
    { type: "theory", q: "Explain why Word2Vec embeddings are 'static' and why that is a limitation compared with BERT-style contextual embeddings. Give a concrete polysemy example." },
    { type: "theory", q: "Why does negative sampling exist, and what does it replace? What is the significance of the 0.75 power?" },
    { type: "theory", q: "Explain Levy & Goldberg's result connecting skip-gram with negative sampling to PMI matrix factorisation. Why is it conceptually satisfying?" },
    { type: "theory", q: "Why do raw pretrained BERT embeddings perform poorly on semantic similarity — worse than averaged GloVe vectors in some evaluations?" },
    { type: "theory", q: "Describe three pooling strategies for turning token embeddings into a sentence embedding, and say which is standard for decoder-only embedding models and why." },
    { type: "theory", q: "Explain hard negative mining, why it produces the largest quality jump in contrastive training, and the false-negative trap it introduces." },
    { type: "theory", q: "What is Matryoshka Representation Learning, and what two-stage retrieval pattern does it enable?" },
    { type: "theory", q: "Why do models like E5 and BGE require 'query:' / 'passage:' prefixes, and what happens if you omit them?" },
    { type: "math", q: "Two words 'king' and 'queen' satisfy king - man + woman ≈ queen. Explain geometrically why vector arithmetic captures analogies, then explain why the standard evaluation overstates the effect." },
    { type: "math", q: "Given embedding A=[0.2,0.4,0.1] and B=[0.1,0.2,0.05] (B = 0.5×A), compute their cosine similarity, and explain what that reveals about cosine vs Euclidean distance." },
    { type: "math", q: "Compute the storage for 5 million chunks embedded at 1536 dimensions in float32, then in int8. What is the saving?" },
    { type: "math", q: "Compute PMI for a word pair that co-occurs with probability 0.001, where P(w)=0.01 and P(c)=0.05. Is the pair more or less associated than chance?" },
    { type: "theory", q: "You need to migrate from a 768-dim model to a 1024-dim model on a 10M-chunk index. Describe the full procedure, and name the one thing that makes it impossible if you did not plan ahead." },
    { type: "theory", q: "Why would you choose a 384-dim embedding model over a 1536-dim one in a production RAG system? Where would you spend the saved budget instead?" },
  ],

  resources: [
    { label: "Mikolov et al. 2013 — Efficient Estimation of Word Representations (Word2Vec)", url: "https://arxiv.org/abs/1301.3781", kind: "paper" },
    { label: "Mikolov et al. 2013 — Distributed Representations (negative sampling)", url: "https://arxiv.org/abs/1310.4546", kind: "paper" },
    { label: "Pennington et al. 2014 — GloVe", url: "https://nlp.stanford.edu/pubs/glove.pdf", kind: "paper" },
    { label: "Levy & Goldberg 2014 — Neural Word Embedding as Implicit Matrix Factorization", url: "https://papers.nips.cc/paper/5477-neural-word-embedding-as-implicit-matrix-factorization", kind: "paper" },
    { label: "Reimers & Gurevych 2019 — Sentence-BERT", url: "https://arxiv.org/abs/1908.10084", kind: "paper" },
    { label: "Sentence-Transformers documentation (training, losses, pooling)", url: "https://sbert.net/", kind: "docs" },
    { label: "MTEB Leaderboard", url: "https://huggingface.co/spaces/mteb/leaderboard", kind: "docs" },
    { label: "Kusupati et al. 2022 — Matryoshka Representation Learning", url: "https://arxiv.org/abs/2205.13147", kind: "paper" },
    { label: "Wang et al. 2022 — Text Embeddings by Weakly-Supervised Contrastive Pre-training (E5)", url: "https://arxiv.org/abs/2212.03533", kind: "paper" },
    { label: "Bolukbasi et al. 2016 — Man is to Computer Programmer as Woman is to Homemaker?", url: "https://arxiv.org/abs/1607.06520", kind: "paper" },
    { label: "Jay Alammar — The Illustrated Word2vec", url: "https://jalammar.github.io/illustrated-word2vec/", kind: "blog" },
  ],
};

export default m06;
