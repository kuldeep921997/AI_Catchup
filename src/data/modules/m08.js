const m08 = {
  id: "m08",
  week: 8,
  hours: 6,
  title: "Semantic Search & Information Retrieval",
  tag: "Search",
  why: "Semantic search is the applied layer on top of embeddings + vector DBs. Understanding classical IR (BM25) alongside dense retrieval is what separates a real search engineer from someone who just calls an embedding API.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 16,
      title: "Sparse retrieval and BM25",
      summary: "A 1994 algorithm that still beats neural retrieval on a large class of real queries. Understand every term.",
      blocks: [
        {
          t: "p",
          text: "Information retrieval predates deep learning by forty years, and its central algorithm is still competitive. If you build a semantic search system without a lexical component you will lose queries you did not know you were losing — silently, because there is no error, just a slightly worse answer.",
        },
        { t: "h", text: "From TF-IDF to BM25" },
        {
          t: "p",
          text: "TF-IDF (Module 3) scores a document by term frequency times inverse document frequency. It works, but it has two defects that BM25 fixes with a saturating function and a length correction.",
        },
        {
          t: "math",
          formula: "score(D, Q) = Σ_{qᵢ ∈ Q} IDF(qᵢ) · [ f(qᵢ,D)·(k₁+1) ] / [ f(qᵢ,D) + k₁·(1 − b + b·|D|/avgdl) ]",
          note: "f(qᵢ,D) = frequency of query term qᵢ in document D. |D| = document length in words. avgdl = average document length in the corpus. k₁ ≈ 1.2–2.0 controls term-frequency saturation. b ≈ 0.75 controls how strongly length is penalised.",
        },
        {
          t: "p",
          text: "Do not memorise this — understand each piece, and it reconstructs itself.",
        },
        {
          t: "steps",
          items: [
            {
              title: "IDF: rare terms matter more",
              text: "IDF(q) = ln( (N − df + 0.5)/(df + 0.5) + 1 ). A term in 5 of 1M documents gets a huge weight; a term in 900k documents gets almost none. Same idea as TF-IDF, with smoothing to avoid negative values for very common terms.",
            },
            {
              title: "Saturation: the tenth occurrence adds almost nothing",
              text: "TF-IDF is linear in term frequency, so a document repeating a word 100 times scores 100× a document mentioning it once. That is wrong — the second mention confirms relevance, the fiftieth does not. The k₁ denominator makes the contribution asymptote: as f → ∞ the term approaches k₁+1. This alone is a major improvement, and it is why BM25 resists keyword-stuffing spam.",
            },
            {
              title: "Length normalisation: long documents should not win by default",
              text: "A long document contains more of every word by chance. The b·|D|/avgdl term penalises documents longer than average and rewards shorter ones. b = 0 disables it; b = 1 normalises fully; 0.75 is the standard compromise.",
            },
          ],
        },
        {
          t: "steps",
          items: [
            { title: "Worked example", text: "f(q,D) = 3, |D| = 100, avgdl = 120, k₁ = 1.5, b = 0.75, IDF = 2.0." },
            { title: "Length factor", text: "1 − b + b·(|D|/avgdl) = 1 − 0.75 + 0.75×(100/120) = 0.25 + 0.625 = 0.875." },
            { title: "Denominator", text: "f + k₁ × 0.875 = 3 + 1.5×0.875 = 3 + 1.3125 = 4.3125." },
            { title: "Numerator", text: "f × (k₁+1) = 3 × 2.5 = 7.5." },
            { title: "Score", text: "2.0 × (7.5 / 4.3125) = 2.0 × 1.739 = **3.48**. Note the document is shorter than average, so the length factor below 1 slightly boosted its score." },
          ],
        },
        { t: "h", text: "What BM25 is genuinely good at" },
        {
          t: "list",
          items: [
            "**Exact identifiers** — SKUs, error codes, CVE numbers, part numbers, legal citations. An embedding compresses `ERR_CONN_4021` into a fuzzy region of semantic space; BM25 matches the literal string.",
            "**Rare proper nouns** — a person or product name the embedding model never saw during training has no meaningful vector, but it is a perfectly good keyword.",
            "**Out-of-domain text** — BM25 has no training distribution, so it cannot be out of domain. A dense model trained on web text degrades on medical notes or log lines; BM25 does not care.",
            "**Explainability and cheapness** — you can point at the matched terms, there is no GPU, and indexing is fast.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "BM25 has one fatal weakness: vocabulary mismatch",
          text: "A query for \"car\" scores zero against a document that only says \"automobile\". No amount of tuning fixes this, because BM25 operates on exact tokens. Stemming and synonym lists help a little and are brittle. This single failure is why dense retrieval exists — and the fact that each method's weakness is the other's strength is the whole argument for hybrid search.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Sparse learned retrieval: the middle ground",
          text: "SPLADE and similar models use a transformer to produce a *sparse* vector over the vocabulary, where the model can assign weight to terms that do not literally appear — effectively learned query and document expansion. You keep the inverted index and exact-match strength while gaining semantic matching. Worth knowing by name; it consistently performs well on BEIR and is supported by several vector engines.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 14,
      title: "Dense retrieval and the bi-encoder",
      summary: "Why semantic search scales, what it buys you, and the failures it hides.",
      blocks: [
        {
          t: "p",
          text: "Dense retrieval embeds queries and documents into the same vector space and retrieves by similarity (Modules 6 and 7). The architectural detail that makes it practical is that the two encodings happen *independently*.",
        },
        { t: "h", text: "The bi-encoder" },
        {
          t: "math",
          formula: "score(q, d) = cos( Encoder(q), Encoder(d) )",
          note: "The document encoding does not depend on the query. This is the entire reason dense retrieval scales: you embed your corpus once, offline, and at query time you only embed the query and do an ANN lookup.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The independence is the whole trick — and the whole limitation",
          text: "Precomputability is what makes searching 100M documents in 20ms possible. But it also means the document vector was produced with no knowledge of the query. All the interaction between query and document is compressed into a single dot product between two fixed vectors. That is a severe information bottleneck, and it is exactly what reranking (lesson 4) exists to relieve.",
        },
        { t: "h", text: "Where dense retrieval fails" },
        {
          t: "table",
          head: ["Failure", "Example", "Why"],
          rows: [
            ["Exact identifiers", "\"error TS2345\"", "Compressed into a fuzzy neighbourhood; near-identical codes collide"],
            ["Numbers and dates", "\"revenue in Q3 2023\"", "Embeddings encode numbers poorly; 2023 and 2024 are near-identical vectors"],
            ["Rare entities", "\"Zylotronic Corp\"", "Out of the encoder's training distribution; effectively a random vector"],
            ["Negation", "\"drugs that are NOT NSAIDs\"", "Embeddings of X and not-X are highly similar; negation barely moves the vector"],
            ["Domain shift", "Legal or clinical text with a web-trained encoder", "The similarity geometry was never fitted to this vocabulary"],
            ["Long documents", "A 50-page PDF as one vector", "Averaging destroys specificity — this is why chunking exists (Module 9)"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Dense retrieval always returns something",
          text: "There is no notion of 'no match'. Ask about a topic entirely absent from your corpus and you still get the top 10 nearest vectors, with respectable-looking similarity scores. Feed those to an LLM and it will dutifully answer from irrelevant context. BM25 at least returns nothing when no term matches. Always apply a score threshold *and* instruct the model that it may answer \"not found\" — this is one of the most common causes of confident nonsense in production RAG.",
        },
        { t: "h", text: "Why scores are not comparable" },
        {
          t: "p",
          text: "A cosine similarity of 0.82 means nothing in isolation. Different embedding models have wildly different score distributions — some cluster everything between 0.7 and 0.9, others spread across 0.2 to 0.95. A threshold tuned for one model is meaningless for another, and thresholds also drift with query length and language.",
        },
        {
          t: "list",
          items: [
            "Calibrate thresholds empirically on *your* data and *your* model, and re-calibrate when either changes.",
            "Prefer relative signals: the gap between the top result and the tenth is more informative than the absolute top score.",
            "Do not surface raw similarity scores to users as \"confidence\". They are not probabilities and they do not mean what users will assume.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 14,
      title: "Hybrid search and rank fusion",
      summary: "Combining lexical and semantic retrieval — and why you should fuse ranks rather than scores.",
      blocks: [
        {
          t: "p",
          text: "BM25 fails on vocabulary mismatch. Dense fails on exact identifiers, numbers, and rare entities. The failure modes are close to complementary, which makes combining them one of the highest-return changes you can make to a retrieval system. Published BEIR results and practical experience both put the gain in the range of several points of NDCG.",
        },
        { t: "h", text: "The problem: scores are on incomparable scales" },
        {
          t: "p",
          text: "BM25 produces unbounded positive scores that depend on corpus statistics — 3.48 in the earlier example, but easily 40 for a different query. Cosine similarity lives in [−1, 1]. You cannot add them. You can normalise them, but min-max normalisation is unstable because it depends on the particular result set, and a single outlier compresses everything else.",
        },
        { t: "h", text: "Reciprocal Rank Fusion: ignore the scores entirely" },
        {
          t: "math",
          formula: "RRF(d) = Σ_{r ∈ retrievers} 1 / (k + rank_r(d))",
          note: "Use only each document's *rank* in each list, never its score. k is a constant, conventionally 60, which damps the influence of the very top positions and makes the method robust. A document absent from a list simply contributes nothing.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example", text: "A document ranks 2nd in BM25 and 5th in dense retrieval. k = 60." },
            { title: "Compute", text: "1/(60+2) + 1/(60+5) = 1/62 + 1/65 = 0.016129 + 0.015385 = **0.031514**." },
            { title: "Compare with a document ranked 1st in dense only", text: "1/(60+1) = 0.016393. It loses — appearing respectably in *both* lists beats topping one." },
            { title: "Why that is the right behaviour", text: "Agreement across independent retrievers is strong evidence. RRF rewards consensus, which is precisely what you want when combining methods with different, partly-independent failure modes." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why k = 60",
          text: "It comes from the original Cormack et al. paper and has proven remarkably robust across datasets. Intuitively, a large k flattens the differences between top ranks so that a single retriever cannot dominate on the strength of one confident hit. Small k (say 1) makes rank 1 worth 0.5 and rank 2 worth 0.33 — a huge gap that lets one noisy retriever win. It is worth tuning, but 60 is a genuinely good default.",
        },
        { t: "h", text: "The alternatives, and when to use them" },
        {
          t: "table",
          head: ["Method", "How", "Use when"],
          rows: [
            ["RRF", "Sum reciprocal ranks", "Default. Robust, no tuning, no calibration needed"],
            ["Weighted score fusion", "α·norm(dense) + (1−α)·norm(sparse)", "You want to tilt toward one retriever and have data to tune α"],
            ["Distribution-based normalisation", "Standardise each score list before combining", "Better than min-max; still model-dependent"],
            ["Rerank the union", "Merge both candidate lists, then cross-encode", "Best quality. The reranker makes fusion weights nearly irrelevant"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The practical shortcut",
          text: "If you are going to rerank anyway (next lesson), fusion barely matters. Take the top ~50 from each retriever, deduplicate, and hand the union to the cross-encoder. The reranker re-scores everything on a single consistent scale, which is exactly the problem fusion was trying to solve. Use RRF when you cannot afford a reranker; use union-plus-rerank when you can.",
        },
        {
          t: "note",
          tone: "warn",
          title: "Do not skip the lexical half",
          text: "The most common RAG architecture in the wild is dense-only, because that is what the quickstart tutorials show. It is also the most common reason a system mysteriously fails on product codes, version numbers, and internal acronyms. Adding BM25 is usually a day of work — Postgres full-text search, Elasticsearch, or a built-in hybrid mode — and it fixes an entire class of complaints.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 16,
      title: "Reranking: the highest-leverage component in RAG",
      summary: "Cross-encoders, late interaction, and why two stages beat one.",
      blocks: [
        {
          t: "p",
          text: "If you improve one thing in a retrieval pipeline, make it this. A reranker routinely adds 10–20 points of NDCG@10 over bi-encoder retrieval alone, for a few tens of milliseconds. Very little else in this curriculum offers that ratio.",
        },
        { t: "h", text: "Bi-encoder versus cross-encoder" },
        {
          t: "table",
          head: ["", "Bi-encoder (retriever)", "Cross-encoder (reranker)"],
          rows: [
            ["Input", "Query and document, separately", "Query and document, concatenated"],
            ["Output", "Two vectors, compared by cosine", "A single relevance score"],
            ["Precomputable?", "Yes — embed the corpus offline", "No — must run per (query, document) pair"],
            ["Cost per query", "One encode + ANN lookup", "N full forward passes"],
            ["Interaction", "One dot product between fixed vectors", "Full token-level attention across both"],
            ["Scales to", "100M+ documents", "~10–100 documents"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why the cross-encoder is so much better",
          text: "In a bi-encoder, the document is encoded before the query is known — so the encoder had to guess what might matter. A cross-encoder sees `[CLS] query [SEP] document [SEP]` and every query token attends to every document token. It can notice that the query asks about the *2023* figure while the passage discusses 2022. That distinction is invisible to a cosine similarity between two pre-computed vectors.",
        },
        { t: "h", text: "The two-stage pipeline" },
        {
          t: "code",
          lang: "python",
          caption: "Retrieve wide, rerank narrow",
          code: `# Stage 1 — recall-oriented. Cheap, over-fetch deliberately.
candidates = hybrid_search(query, top_k=50)      # BM25 + dense, fused

# Stage 2 — precision-oriented. Expensive, applied to 50 items only.
pairs  = [(query, c.text) for c in candidates]
scores = cross_encoder.predict(pairs)            # ~50 forward passes

top = [c for _, c in sorted(zip(scores, candidates), reverse=True)][:5]

# Stage 1 optimises RECALL: get the right document into the 50.
# Stage 2 optimises PRECISION: get the right document into the top 5.
# A document missed in stage 1 can never be recovered in stage 2 —
# which is why stage 1's k should be generous.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The one asymmetry that matters",
          text: "Reranking cannot recover a document that retrieval missed. So stage 1 should be tuned for recall@50 or recall@100, *not* for precision. Teams often tune their retriever to return the best top-5 and then bolt on a reranker, which is backwards — widen the net first, then let the reranker be picky.",
        },
        { t: "h", text: "Late interaction: ColBERT" },
        {
          t: "p",
          text: "A middle point between the two. ColBERT stores a vector *per token* rather than one per document, and scores with MaxSim: for each query token, find its best-matching document token, and sum those maxima.",
        },
        {
          t: "math",
          formula: "score(q, d) = Σ_{i ∈ q} max_{j ∈ d} ( Eqᵢ · Edⱼ )",
          note: "Document token embeddings are still precomputed, so it scales far better than a cross-encoder, while retaining token-level interaction. The cost is storage — one vector per token instead of per document, though ColBERTv2 compresses this heavily with residual quantisation.",
        },
        {
          t: "table",
          head: ["Approach", "Interaction", "Precompute", "Quality", "Scale"],
          rows: [
            ["Bi-encoder", "None until scoring", "Full", "Baseline", "100M+"],
            ["ColBERT (late)", "Token-level MaxSim", "Document tokens", "Strong", "1M–100M"],
            ["Cross-encoder", "Full attention", "None", "Best", "10–100 per query"],
          ],
        },
        { t: "h", text: "Practical reranker choices" },
        {
          t: "list",
          items: [
            "**Small open cross-encoders** (bge-reranker-base/large, mxbai-rerank, Jina reranker) — run on your own GPU, tens of milliseconds for 50 documents, no data leaves your network.",
            "**Hosted reranking APIs** (Cohere Rerank and similar) — excellent quality, no infrastructure, per-call cost and a network hop.",
            "**LLM-as-reranker** — prompt a model to score or order passages. Highest quality on nuanced relevance, but slow and expensive; reasonable for the final 5–10 in a low-volume, high-stakes system.",
            "**Rule-based reordering** — recency boosts, authority weighting, deduplication by source. Unglamorous and often the difference between a demo and a product.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Why not use a cross-encoder for retrieval directly?\" Because it cannot precompute anything: scoring a query against 10M documents means 10M forward passes, which is minutes to hours. The bi-encoder's independence assumption is what allows offline indexing and millisecond ANN search. The two-stage design exists precisely to spend cheap compute on many candidates and expensive compute on few.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 16,
      title: "Measuring retrieval quality",
      summary: "You cannot improve what you do not measure, and most teams measure the wrong thing.",
      blocks: [
        {
          t: "p",
          text: "\"The retrieval seems better\" is not an engineering statement. You need a small labelled query set and a handful of metrics. Building this costs an afternoon and is the highest-leverage afternoon in a RAG project — without it, every subsequent decision is guesswork.",
        },
        { t: "h", text: "Precision and recall at k" },
        {
          t: "math",
          formula: "P@k = (relevant in top k) / k        R@k = (relevant in top k) / (total relevant)",
          note: "Precision asks: of what I showed, how much was good? Recall asks: of what was good, how much did I show? Both ignore ordering *within* the top k, which is their main limitation.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Which one matters depends on the stage",
          text: "For **stage-1 retrieval** you care about recall@50 or recall@100 — anything missed here is lost forever. For **what you put in the prompt** you care about precision@5, because irrelevant chunks actively harm the answer (they consume context and invite the model to use them). Optimising your retriever for precision@5 and then wondering why the reranker cannot help is the classic mistake.",
        },
        { t: "h", text: "MRR: how quickly do you find the first good result?" },
        {
          t: "math",
          formula: "MRR = (1/|Q|) Σ_q 1 / rank_of_first_relevant",
          note: "First relevant at rank 1 → 1.0. Rank 2 → 0.5. Rank 3 → 0.333. Rank 10 → 0.1. No relevant result at all → 0. Average across queries.",
        },
        {
          t: "p",
          text: "MRR fits questions with a single right answer — a known-item lookup, a specific fact. It is a poor fit when several documents are legitimately relevant, because it ignores everything after the first hit.",
        },
        { t: "h", text: "nDCG: the metric to default to" },
        {
          t: "math",
          formula: "DCG@k = Σ_{i=1}^{k} (2^{relᵢ} − 1) / log₂(i + 1)        nDCG@k = DCG@k / IDCG@k",
          note: "relᵢ is a graded relevance judgement (0 = irrelevant, 1 = related, 2 = relevant, 3 = perfect). The exponential numerator makes highly-relevant results count disproportionately; the logarithmic denominator discounts lower positions. IDCG is the DCG of the ideal ordering, so nDCG lands in [0, 1] and is comparable across queries.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example", text: "Retrieved relevance grades in order: [3, 0, 2, 1]." },
            { title: "DCG", text: "(2³−1)/log₂2 + (2⁰−1)/log₂3 + (2²−1)/log₂4 + (2¹−1)/log₂5 = 7/1 + 0/1.585 + 3/2 + 1/2.322 = 7 + 0 + 1.5 + 0.431 = 8.931." },
            { title: "IDCG (ideal order [3,2,1,0])", text: "7/1 + 3/1.585 + 1/2 + 0/2.322 = 7 + 1.893 + 0.5 + 0 = 9.393." },
            { title: "nDCG", text: "8.931 / 9.393 = **0.951**. Close to ideal — the only loss came from ranking a 0 above a 2." },
          ],
        },
        {
          t: "table",
          head: ["Metric", "Handles graded relevance?", "Position-aware?", "Best for"],
          rows: [
            ["Precision@k", "No", "No", "What goes into the prompt"],
            ["Recall@k", "No", "No", "Stage-1 candidate generation"],
            ["MRR", "No", "Yes", "Single-answer, known-item search"],
            ["MAP", "No", "Yes", "Multiple relevant docs, binary judgements"],
            ["nDCG@k", "Yes", "Yes", "The general default; what BEIR reports"],
          ],
        },
        { t: "h", text: "Building your evaluation set" },
        {
          t: "steps",
          items: [
            { title: "1. Collect 50–200 real queries", text: "From logs if you have them, from stakeholders if you do not. Real queries, including the ugly and ambiguous ones — not queries you invented to make the system look good." },
            { title: "2. Label relevant documents", text: "Graded 0–3 if you can afford it, binary if you cannot. Two annotators on a sample to check agreement." },
            { title: "3. Bootstrap with an LLM, verify by hand", text: "Have a strong model propose relevance judgements, then human-review them. Roughly 5× faster than labelling from scratch, and the verification step is what keeps it honest." },
            { title: "4. Automate the run", text: "One command that prints recall@50, nDCG@10, and p95 latency. If it is not one command, it will not get run." },
            { title: "5. Freeze it and re-run on every change", text: "Chunk size, embedding model, k, reranker, fusion weights — every one of these is now a measurable decision instead of an argument." },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "BEIR is a sanity check, not your answer",
          text: "BEIR is the standard zero-shot retrieval benchmark and is genuinely useful for ruling models out. But your corpus, your query distribution, and your notion of relevance are not BEIR's. A model that is third on BEIR may be first on your data. The leaderboard narrows the shortlist; your eval set makes the decision.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 14,
      title: "Query understanding: rewriting, expansion, HyDE",
      summary: "Fixing the query is often cheaper and more effective than fixing the index.",
      blocks: [
        {
          t: "p",
          text: "Retrieval quality is limited by the query as much as by the index. Real user queries are short, ambiguous, full of pronouns, and phrased nothing like the documents that answer them. Transforming the query before searching is often the cheapest available improvement.",
        },
        { t: "h", text: "Query rewriting for conversation" },
        {
          t: "p",
          text: "In a multi-turn chat, \"what about the second one?\" is meaningless as a standalone search query. It must be rewritten into a self-contained question using the conversation history.",
        },
        {
          t: "code",
          lang: "text",
          caption: "Contextual query rewriting — mandatory for any conversational RAG",
          code: `History:
  User: What are the main types of vector index?
  Assistant: The main types are Flat, IVF, HNSW, and PQ-based...
  User: How much memory does the second one use?

Naive search query:  "How much memory does the second one use?"
  -> retrieves nothing useful; 'second one' has no referent in the corpus

Rewritten query:     "How much memory does an IVF vector index use?"
  -> retrieves correctly

Implementation: one cheap LLM call with the last 2-3 turns and an
instruction to produce a standalone question. Use a small fast model —
this is the highest ROI LLM call in a conversational RAG system.`,
        },
        { t: "h", text: "Multi-query retrieval" },
        {
          t: "p",
          text: "Generate several paraphrases of the query, retrieve for each, and fuse the results with RRF. This hedges against the query happening to be phrased unlike the relevant document. It costs one extra LLM call and n× the retrieval (which is cheap), and it reliably improves recall on ambiguous questions.",
        },
        { t: "h", text: "HyDE: Hypothetical Document Embeddings" },
        {
          t: "p",
          text: "A counterintuitive technique that works. Instead of embedding the question, ask an LLM to *write a plausible answer* — hallucinations and all — and embed that instead.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Why fabricating an answer helps",
          text: "Embedding spaces measure similarity between texts. A short question and a long expository passage are different *kinds* of text, so their vectors are further apart than their topical relatedness warrants. A hypothetical answer looks like a document, so it lands in the region of space where real documents live. You are correcting a query/document distribution mismatch. The fabricated facts do not matter — you never show the hypothetical answer to anyone; it is discarded after embedding.",
        },
        {
          t: "list",
          items: [
            "**Works best** on zero-shot or out-of-domain retrieval, where the embedding model has not been trained on your query/document pairing.",
            "**Adds latency** — one LLM call before you can even start retrieving.",
            "**Can hurt** on highly specific factual queries, where the hypothetical answer drifts toward generic content and pulls retrieval with it.",
            "**Largely unnecessary** with a well-fine-tuned asymmetric embedding model (Module 6), which was trained to bridge exactly this gap. Try the cheap fix first."
          ],
        },
        { t: "h", text: "Other transformations worth knowing" },
        {
          t: "table",
          head: ["Technique", "What it does", "Cost"],
          rows: [
            ["Query decomposition", "Split a multi-hop question into sub-questions, retrieve for each", "N LLM calls; needed for compositional questions"],
            ["Step-back prompting", "Ask a more general version first to retrieve background", "One LLM call; helps on 'why' and conceptual questions"],
            ["Metadata extraction", "Parse filters out of natural language ('papers after 2022')", "One small LLM call; enables structured filtering"],
            ["Acronym / synonym expansion", "Expand domain jargon from a maintained dictionary", "Nearly free; underrated in enterprise settings"],
            ["Spelling correction", "Fix typos before lexical matching", "Cheap; matters a lot for BM25, little for dense"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Every transformation is another failure point and another 200ms",
          text: "It is easy to build a pipeline with query rewriting, HyDE, multi-query, decomposition, and step-back — and end up with something that takes four seconds, costs five LLM calls, and is impossible to debug. Add one transformation at a time and measure it on your eval set. Keep it only if the number moves. The ordering that usually wins: fix chunking → add hybrid → add reranking → *then* consider query transformations.",
        },
      ],
    },
  ],

  theory: [
    "Sparse (lexical) retrieval: TF-IDF and BM25 — exact keyword matching with statistical weighting, still an extremely strong baseline.",
    "BM25's three components: IDF weighting, term-frequency saturation via k1 (why the 50th mention adds nothing), and length normalisation via b.",
    "What BM25 is genuinely best at: exact identifiers, rare proper nouns, out-of-domain text, explainability, and cost.",
    "BM25's fatal weakness: vocabulary mismatch — 'car' scores zero against 'automobile'.",
    "Learned sparse retrieval (SPLADE): transformer-produced sparse vectors that add semantic expansion while keeping an inverted index.",
    "Dense retrieval and the bi-encoder: score(q,d) = cos(Enc(q), Enc(d)); independence of encoding is what makes offline indexing possible.",
    "Where dense retrieval fails: identifiers, numbers/dates, rare entities, negation, domain shift, long documents.",
    "Dense retrieval always returns something — there is no 'no match', which is a major source of confident nonsense in RAG.",
    "Why similarity scores are not comparable across models and why they should not be shown to users as confidence.",
    "Hybrid search: combining BM25 and dense retrieval because their failure modes are close to complementary.",
    "Reciprocal Rank Fusion: fuse ranks rather than scores, avoiding the score-normalisation problem entirely; why k=60.",
    "Bi-encoder vs cross-encoder: precomputability vs full token-level interaction, and why production uses each at a different stage.",
    "The two-stage pipeline: stage 1 optimises recall@50-100, stage 2 optimises precision@5; reranking cannot recover what retrieval missed.",
    "ColBERT and late interaction: a per-token vector with MaxSim scoring, sitting between bi-encoders and cross-encoders.",
    "Evaluation: Precision@k, Recall@k, MRR, MAP, nDCG — which to use at which stage and why nDCG is the general default.",
    "Building an evaluation set: 50-200 real queries, graded judgements, LLM-bootstrapped and human-verified, automated to one command.",
    "Why BEIR is a shortlist tool and not a decision procedure.",
    "Query understanding: conversational rewriting (mandatory for multi-turn), multi-query retrieval, HyDE, decomposition, step-back, metadata extraction.",
    "Why HyDE works: it fixes a query/document distribution mismatch, and the fabricated content is discarded after embedding.",
    "The ordering that usually wins: fix chunking → add hybrid → add reranking → then consider query transformations.",
  ],

  math: [
    {
      title: "BM25",
      formula: "score(D,Q) = Σ IDF(qi) · (f(qi,D)·(k1+1)) / (f(qi,D) + k1·(1-b+b·|D|/avgdl))",
      note: "k1≈1.2-2.0 controls term-frequency saturation; b≈0.75 controls length normalisation. The saturating denominator is what makes BM25 resistant to keyword stuffing.",
    },
    {
      title: "BM25 IDF",
      formula: "IDF(q) = ln( (N - df + 0.5)/(df + 0.5) + 1 )",
      note: "Smoothed inverse document frequency. The +1 inside the log prevents negative weights for terms appearing in more than half the corpus.",
    },
    {
      title: "Bi-encoder score",
      formula: "score(q,d) = cos( Encoder(q), Encoder(d) )",
      note: "Document encoding is independent of the query — the property that allows offline indexing and millisecond ANN search, and the bottleneck that reranking relieves.",
    },
    {
      title: "Reciprocal Rank Fusion",
      formula: "RRF(d) = Σ_r 1/(k + rank_r(d)) , k = 60",
      note: "Uses ranks only, so no score normalisation is needed. A doc at rank 2 and rank 5 scores 1/62 + 1/65 = 0.0315, beating a doc at rank 1 in a single list (0.0164).",
    },
    {
      title: "ColBERT MaxSim",
      formula: "score(q,d) = Σ(i∈q) max(j∈d) ( Eqi · Edj )",
      note: "Per-token embeddings with late interaction. For each query token take its best matching document token, then sum. Document tokens remain precomputable.",
    },
    {
      title: "Precision@k and Recall@k",
      formula: "P@k = relevant_in_topk / k ; R@k = relevant_in_topk / total_relevant",
      note: "Optimise recall@50-100 for stage-1 retrieval and precision@5 for what enters the prompt. Confusing the two is the classic pipeline-tuning error.",
    },
    {
      title: "Mean Reciprocal Rank",
      formula: "MRR = (1/|Q|) Σ 1/rank_of_first_relevant",
      note: "First relevant at rank 3 contributes 1/3 = 0.333. Good for single-answer lookup, poor when many documents are legitimately relevant.",
    },
    {
      title: "nDCG",
      formula: "DCG@k = Σ (2^reli - 1)/log2(i+1) ; nDCG = DCG/IDCG",
      note: "Exponential numerator rewards highly relevant results; logarithmic denominator discounts position. Normalising by the ideal ranking makes it comparable across queries.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain each of BM25's three components (IDF, k1 saturation, b length normalisation) and what problem each one fixes relative to plain TF-IDF." },
    { type: "theory", q: "Explain why a hybrid (BM25 + dense) system typically outperforms either alone, with a concrete example involving a product SKU code." },
    { type: "theory", q: "What is BM25's fatal weakness, and why can no amount of parameter tuning fix it?" },
    { type: "theory", q: "Why does dense retrieval always return results even when nothing relevant exists, and what two mitigations should every RAG system implement?" },
    { type: "theory", q: "What is the difference between a bi-encoder and a cross-encoder, and why do production systems use bi-encoders for retrieval but cross-encoders for reranking rather than the reverse?" },
    { type: "theory", q: "Why should stage-1 retrieval be tuned for recall rather than precision? What goes wrong if you tune it for precision@5?" },
    { type: "theory", q: "Explain ColBERT's late interaction and where it sits between bi-encoders and cross-encoders on the quality/scale tradeoff." },
    { type: "theory", q: "Describe HyDE and explain why generating a hypothetical (possibly false) answer before embedding improves retrieval. When would you not bother?" },
    { type: "theory", q: "Why does RRF fuse ranks rather than scores? What problem does that avoid, and what is the significance of k=60?" },
    { type: "theory", q: "Explain Precision@k vs Recall@k and describe a scenario in RAG where you would prioritise each." },
    { type: "math", q: "Compute the BM25 score contribution for a single query term with f(qi,D)=3, |D|=100, avgdl=120, k1=1.5, b=0.75, IDF=2.0. Show the length factor separately." },
    { type: "math", q: "Apply Reciprocal Rank Fusion (k=60) to a document ranked 2nd by BM25 and 5th by dense search. Compare it against a document ranked 1st by dense only, and explain the outcome." },
    { type: "math", q: "For a query with the first relevant result at rank 3, what is the reciprocal rank contribution to MRR?" },
    { type: "math", q: "Compute nDCG@4 for retrieved relevance grades [3, 0, 2, 1]. Show DCG, IDCG, and the ratio." },
    { type: "math", q: "Your reranker processes 50 documents in 40ms. Retrieval takes 15ms and the LLM call takes 2s. What fraction of end-to-end latency is reranking, and what does that imply about whether to add it?" },
    { type: "theory", q: "Describe how you would build a retrieval evaluation set from scratch in one afternoon, and name the five decisions it would then let you make empirically." },
    { type: "theory", q: "Why is a conversational query rewriter mandatory for multi-turn RAG? Give an example query that fails without it." },
  ],

  resources: [
    { label: "Robertson & Zaragoza — The Probabilistic Relevance Framework: BM25 and Beyond", url: "https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf", kind: "paper" },
    { label: "Karpukhin et al. 2020 — Dense Passage Retrieval (DPR)", url: "https://arxiv.org/abs/2004.04906", kind: "paper" },
    { label: "Khattab & Zaharia 2020 — ColBERT: late interaction", url: "https://arxiv.org/abs/2004.12832", kind: "paper" },
    { label: "Cormack et al. 2009 — Reciprocal Rank Fusion", url: "https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf", kind: "paper" },
    { label: "Gao et al. 2022 — Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE)", url: "https://arxiv.org/abs/2212.10496", kind: "paper" },
    { label: "Formal et al. 2021 — SPLADE: sparse lexical and expansion model", url: "https://arxiv.org/abs/2107.05720", kind: "paper" },
    { label: "Thakur et al. 2021 — BEIR: heterogeneous zero-shot IR benchmark", url: "https://arxiv.org/abs/2104.08663", kind: "paper" },
    { label: "Pinecone — Hybrid search learning guide", url: "https://www.pinecone.io/learn/hybrid-search-intro/", kind: "blog" },
    { label: "Manning, Raghavan & Schütze — Introduction to Information Retrieval (free)", url: "https://nlp.stanford.edu/IR-book/", kind: "book" },
    { label: "Sentence-Transformers — Cross-Encoders / reranking guide", url: "https://sbert.net/examples/applications/cross-encoder/README.html", kind: "docs" },
  ],
};

export default m08;
