const m07 = {
  id: "m07",
  week: 7,
  hours: 8,
  title: "Vector Databases: Indexing, ANN Search & Architecture",
  tag: "Vector DB",
  why: "Storing millions of embeddings and finding the nearest ones in milliseconds is a systems + algorithms problem, not just 'call an API'. Interviewers will probe how ANN indexes actually work.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 14,
      title: "The problem: why brute force stops working",
      summary: "Do the arithmetic on exact search, and every technique in this module becomes obviously necessary.",
      blocks: [
        {
          t: "p",
          text: "You have a query vector. You want the k most similar vectors from your collection. The exact algorithm is trivial: compute the similarity to every stored vector, sort, take the top k. It is also correct, simple, and — past a certain scale — completely unusable.",
        },
        {
          t: "math",
          formula: "brute-force cost = O(n · d) per query",
          note: "n vectors, each of dimension d. One dot product is d multiply-adds, and you need n of them. There is no way around it if you insist on exact answers.",
        },
        {
          t: "steps",
          items: [
            { title: "Small corpus", text: "100k vectors × 768 dims = 7.7×10⁷ multiply-adds. On a modern CPU with SIMD, a few milliseconds. Genuinely fine — just use NumPy." },
            { title: "Medium corpus", text: "10M vectors × 1536 dims = 1.5×10¹⁰ operations. Roughly 1–3 seconds per query single-threaded. Already too slow for interactive use, and that is *one* query." },
            { title: "Large corpus", text: "1B vectors × 1536 dims = 1.5×10¹² operations per query. Minutes. And at 100 queries/second you would need thousands of cores doing nothing else." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The memory problem arrives before the compute problem",
          text: "1B vectors at 1536 dims in float32 is 6.1 TB. That does not fit in the RAM of any single machine, let alone GPU memory. So you are forced into either compression (quantisation) or disk-based indexes — before you have even thought about search speed. Memory, not FLOPs, is usually what forces the design.",
        },
        { t: "h", text: "The bargain: approximate nearest neighbours" },
        {
          t: "p",
          text: "ANN search gives up exactness. Instead of guaranteeing the true top-k, it returns *probably most of* the true top-k, thousands of times faster. The quality measure is recall:",
        },
        {
          t: "math",
          formula: "recall@k = |returned_top_k ∩ true_top_k| / k",
          note: "If the true top-10 contains documents {1..10} and you return 9 of them plus one wrong one, recall@10 = 0.9. Production systems typically target 0.95–0.99.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Why losing 5% of recall is usually fine",
          text: "Your embedding model is itself approximate — the difference between the 9th and 11th nearest vector is often semantically meaningless. And in RAG you feed the LLM 5–10 chunks, so missing one marginal result rarely changes the answer. You are trading a small amount of *already-noisy* ranking precision for a 100–1000× speedup. That is an excellent trade, and it is the trade the entire vector database industry is built on.",
        },
        {
          t: "note",
          tone: "warn",
          title: "When it is not fine",
          text: "Deduplication, plagiarism detection, exact-match compliance lookups, and evaluating your own retriever all need exact results. If a missed neighbour is a correctness bug rather than a ranking nuance, use a flat (exact) index — and note you *must* use exact search to measure your ANN index's recall in the first place.",
        },
        { t: "h", text: "The three-way tradeoff every index navigates" },
        {
          t: "table",
          head: ["Axis", "What you want", "What it costs"],
          rows: [
            ["Recall", "High (0.95+)", "More candidates examined → higher latency"],
            ["Latency", "Low (< 50ms)", "Fewer candidates examined → lower recall"],
            ["Memory", "Small", "Compression → lower recall"],
            ["Build time", "Fast", "Cheaper indexes (IVF) have worse recall/latency curves"],
            ["Update speed", "Real-time inserts", "Graph indexes degrade under heavy churn; IVF centroids go stale"],
          ],
        },
        {
          t: "p",
          text: "You cannot optimise all of these. Every algorithm in this module is a different point on that surface, and choosing one means deciding which axis you can afford to lose on. Knowing *which* axis your application cares about is more valuable than memorising algorithm names.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "IVF: partition the space, search a slice",
      summary: "The simplest useful ANN index, built on k-means. Understand it and HNSW becomes easier.",
      blocks: [
        {
          t: "p",
          text: "The core intuition of every ANN method is the same: avoid looking at most of the data. IVF (Inverted File index) does it in the most direct way imaginable — divide the vector space into regions, then only search the regions near the query.",
        },
        { t: "h", text: "Building the index" },
        {
          t: "steps",
          items: [
            { title: "1. Cluster", text: "Run k-means on a sample of your vectors to find `nlist` centroids. Typical: nlist ≈ 4·√n, so about 4,000 clusters for 1M vectors." },
            { title: "2. Assign", text: "Each vector is assigned to its nearest centroid. You now have `nlist` inverted lists, each holding the IDs of the vectors in that cell." },
            { title: "3. Store", text: "Keep the centroids (small) plus the lists (the whole dataset, just partitioned)." },
          ],
        },
        { t: "h", text: "Searching" },
        {
          t: "steps",
          items: [
            { title: "1. Compare against centroids", text: "Compute the distance from the query to all `nlist` centroids. Cheap — 4,000 dot products." },
            { title: "2. Pick the closest `nprobe` cells", text: "nprobe is the tuning knob. nprobe=1 searches only the nearest cell; nprobe=nlist degenerates to brute force." },
            { title: "3. Exhaustively search inside those cells only", text: "Compute exact distances to the vectors in the selected lists and return the top k." },
          ],
        },
        {
          t: "math",
          formula: "cost ≈ nlist·d  +  (n/nlist)·nprobe·d",
          note: "The first term is the centroid comparison, the second the in-cell search. The fraction of the dataset examined is roughly nprobe/nlist — so nlist=1000, nprobe=10 searches about 1% of your data, a ~100× speedup.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example", text: "1M vectors, nlist = 1000, so ~1000 vectors per cell." },
            { title: "nprobe = 1", text: "Search 1,000 vectors instead of 1,000,000 — a 1000× speedup, but recall might be only 0.6–0.7." },
            { title: "nprobe = 10", text: "Search ~10,000 vectors (1%). Recall typically 0.90–0.95. This is the usual operating point." },
            { title: "nprobe = 50", text: "Search ~50,000 vectors (5%). Recall 0.98+. Still a 20× speedup over brute force." },
          ],
        },
        { t: "h", text: "The edge problem, and why nprobe > 1 is mandatory" },
        {
          t: "note",
          tone: "warn",
          title: "The failure mode you should be able to draw",
          text: "A query lands near the boundary between two cells. Its true nearest neighbour is just across the border, in a cell whose *centroid* is further away than the one the query fell into. With nprobe=1 that neighbour is invisible — not ranked low, but never examined. Searching several neighbouring cells is the only fix. This is the fundamental weakness of partition-based indexes and the reason graph-based methods generally win on the recall/latency curve.",
        },
        { t: "h", text: "Tuning and operating IVF" },
        {
          t: "list",
          items: [
            "**nlist too small** → cells are huge, so each probe is expensive and you lose the speedup.",
            "**nlist too large** → cells are tiny, boundary effects dominate, and you need a large nprobe to recover recall.",
            "**Training data matters** — k-means must see a representative sample. FAISS wants at least ~39×nlist training vectors and will warn you otherwise.",
            "**Centroids go stale** — if your data distribution shifts (new product categories, new languages), the original clusters stop fitting and recall silently degrades. IVF indexes need periodic retraining; graph indexes do not.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why IVF is still worth knowing",
          text: "HNSW usually beats it on recall-per-millisecond, so why care? Three reasons: IVF has dramatically lower memory overhead (no graph edges to store), it builds much faster, and it composes beautifully with quantisation — `IVF4096,PQ64` is a standard FAISS recipe for billion-scale corpora that simply will not fit as an HNSW graph. IVF is what you use when memory, not latency, is the binding constraint.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 20,
      title: "HNSW: the algorithm that won",
      summary: "Hierarchical Navigable Small World graphs — the default index in Qdrant, Weaviate, Milvus, Elasticsearch, and pgvector.",
      blocks: [
        {
          t: "p",
          text: "HNSW is the most important ANN algorithm to understand, because it is what you will almost certainly be using. It is built from two ideas that are individually simple: greedy graph traversal, and a hierarchy of decreasing density.",
        },
        { t: "h", text: "Idea 1: navigable small-world graphs" },
        {
          t: "p",
          text: "Connect each vector to its approximate nearest neighbours, forming a graph. To search, start anywhere and repeatedly move to whichever neighbour is closer to the query. Stop when no neighbour improves. This is greedy hill-climbing, and on a well-constructed graph it converges to something very close to the true nearest neighbour.",
        },
        {
          t: "p",
          text: "The catch: a graph containing only short local links is slow to traverse — you shuffle across the space one small step at a time. A *small-world* graph adds some long-range links, so you can cross the space in a few hops. The classic \"six degrees of separation\" property, applied deliberately.",
        },
        { t: "h", text: "Idea 2: the hierarchy" },
        {
          t: "note",
          tone: "analogy",
          title: "It is a skip list in high dimensions",
          text: "A skip list accelerates a linked list by adding sparse express lanes above it: the top layer has a handful of nodes with huge jumps, each layer below is denser with smaller jumps, and the bottom layer has everything. You descend the express lanes to get roughly to the right place, then walk locally. HNSW is exactly this, with 'closer in vector space' replacing 'smaller key'. If you can explain the skip list, you can explain HNSW.",
        },
        {
          t: "code",
          lang: "text",
          caption: "The layered structure",
          code: `Layer 2 (sparsest)    A ---------------------- F
                       |                        |
Layer 1               A ------ C ------ D ----- F
                       |       |        |       |
Layer 0 (all nodes)   A - B -  C -  D - E - F - G - H ...

Search for a query near G:
  1. Enter at A on layer 2. Greedily move toward the query -> F.
  2. Drop to layer 1 at F. Greedily move -> still F (local optimum here).
  3. Drop to layer 0 at F. Greedily move -> G. Done.

Three layers, a handful of distance computations, out of millions
of nodes. The upper layers did the coarse navigation; the bottom
layer did the fine-grained refinement.`,
        },
        {
          t: "math",
          formula: "layer(v) = ⌊ −ln(uniform(0,1)) · m_L ⌋     search ≈ O(log n)",
          note: "Each inserted node's maximum layer is drawn from an exponential distribution, so layer 0 has everything, layer 1 about 1/M of it, and so on. This gives a logarithmic number of layers and therefore logarithmic search — provided the graph is well connected.",
        },
        { t: "h", text: "The parameters, and what each one buys" },
        {
          t: "table",
          head: ["Parameter", "Meaning", "Typical", "Effect of increasing"],
          rows: [
            ["M", "Max neighbours per node per layer", "16 – 48", "Better recall, more memory (linear), slower build"],
            ["ef_construction", "Candidate list size while building", "100 – 500", "Better graph quality, much slower build; no query cost"],
            ["ef_search", "Candidate list size at query time", "50 – 500", "Better recall, higher latency. Tunable per query."],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The most useful operational fact about HNSW",
          text: "`ef_search` is a **query-time** parameter. You can raise it for high-stakes queries and lower it for cheap ones without touching the index. `M` and `ef_construction` are baked in at build time and changing them means a full rebuild. So: be generous with `ef_construction` when you build (you pay once), and tune `ef_search` in production (you pay per query).",
        },
        { t: "h", text: "Memory: the real cost of HNSW" },
        {
          t: "math",
          formula: "graph bytes ≈ n × M × 2 × 4      (bidirectional links, 4-byte IDs)",
          note: "Layer 0 typically allows 2M connections per node, upper layers M. For n = 10M and M = 16 the graph overhead is roughly 1.3 GB — on top of the vectors themselves.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked total for 10M × 768-dim vectors", text: "Vectors in float32: 10M × 768 × 4 = 30.7 GB." },
            { title: "Plus the HNSW graph at M=16", text: "≈ 1.3 GB." },
            { title: "Total", text: "≈ 32 GB, which must be resident in RAM for good latency. This is why the next lesson on quantisation is not optional at scale — and why 'just use HNSW' stops being an answer somewhere around 100M vectors on commodity hardware." },
          ],
        },
        { t: "h", text: "Weaknesses worth knowing" },
        {
          t: "list",
          items: [
            "**Deletes are hard.** Removing a node can disconnect the graph, so implementations mark tombstones and only truly remove during compaction. A workload with heavy deletion needs periodic reindexing or recall quietly decays.",
            "**Build time is significant.** Constructing a graph over 100M vectors takes hours and is hard to parallelise perfectly.",
            "**Memory-resident by design.** Random graph traversal is exactly the access pattern that destroys disk and SSD performance — which is what DiskANN was invented to fix.",
            "**Filtering interacts badly.** Restricting to a metadata subset can disconnect the graph you are traversing. This is important enough to get its own lesson."
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"How does HNSW achieve logarithmic search?\" Use the skip-list analogy, then be precise: node layers are sampled from an exponential distribution giving O(log n) layers; greedy traversal on each layer takes roughly constant work because the candidate list is bounded by ef. Then volunteer the cost — the graph adds n·M·8 bytes and must stay in RAM.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 18,
      title: "Compression: scalar quantisation, PQ, and binary",
      summary: "How to fit a billion vectors in memory, and what it costs you in recall.",
      blocks: [
        {
          t: "p",
          text: "float32 is almost always more precision than an embedding needs. Embeddings are noisy approximations of meaning; storing each dimension to seven significant figures is spurious accuracy. Compression exploits this, and at scale it is the difference between a feasible system and an impossible one.",
        },
        { t: "h", text: "Scalar quantisation: the easy 4× win" },
        {
          t: "math",
          formula: "q = round( (x − min) / (max − min) × 255 )     x̂ = min + q/255 × (max − min)",
          note: "Map each dimension's float32 value into one of 256 buckets, stored as a single byte. Keep the per-dimension min and max to decode. 4× smaller, and typically under 1% recall loss.",
        },
        {
          t: "p",
          text: "This is the highest-value-per-effort optimisation in the whole module. Most vector databases offer it as a one-line configuration change. If you are not using at least int8 scalar quantisation at scale, you are paying 4× more for RAM than you need to.",
        },
        { t: "h", text: "Product Quantisation: the 32–64× win" },
        {
          t: "p",
          text: "PQ is cleverer and it is worth understanding properly, because it is what makes billion-scale search possible on affordable hardware.",
        },
        {
          t: "steps",
          items: [
            { title: "1. Split the vector into m sub-vectors", text: "A 768-dim vector split into m=96 sub-vectors of 8 dimensions each." },
            { title: "2. Learn a codebook per sub-space", text: "Run k-means with k=256 centroids on each 8-dimensional sub-space, independently. You now have 96 codebooks of 256 entries." },
            { title: "3. Encode", text: "Replace each sub-vector with the ID of its nearest centroid — a single byte, since 256 fits in 8 bits. The whole 768-dim vector becomes 96 bytes." },
            { title: "4. Search with a lookup table", text: "For a query, precompute the distance from each query sub-vector to all 256 centroids in that sub-space: a 96×256 table. Now the approximate distance to any stored vector is 96 table lookups and adds — no multiplications at all." },
          ],
        },
        {
          t: "math",
          formula: "compression = (d × 32) / (m × log₂k)     e.g. (768×32)/(96×8) = 32×",
          note: "3,072 bytes becomes 96 bytes. And critically, distance computation becomes table lookup plus addition — often faster than the full-precision dot product, not just smaller.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The asymmetric distance trick",
          text: "Note that PQ does *not* quantise the query. Distances are computed between the full-precision query and the quantised database vectors — 'asymmetric distance computation'. Quantising both sides would roughly double the error for no benefit. Small detail, meaningful accuracy difference, and a good thing to know when someone asks how PQ keeps accuracy up.",
        },
        { t: "h", text: "Binary quantisation: the 32× win with a rescoring step" },
        {
          t: "p",
          text: "The most aggressive option: keep one bit per dimension (typically the sign). A 1536-dim vector becomes 192 bytes, and distance becomes Hamming distance — an XOR and a popcount, which modern CPUs do absurdly fast.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Binary works far better than it sounds — with rescoring",
          text: "Used alone, binary quantisation loses meaningful accuracy. Used as a first-stage filter it is excellent: retrieve 1,000 candidates using binary Hamming distance (extremely fast, tiny memory), then rescore just those 1,000 with full-precision vectors fetched from disk. Reported results recover 95%+ of full-precision recall at ~1/32 the memory. This oversampling-and-rescoring pattern is the standard modern recipe and is worth internalising — it recurs in Modules 6 and 8.",
        },
        {
          t: "table",
          head: ["Method", "Size (768-dim)", "Compression", "Typical recall impact"],
          rows: [
            ["float32", "3,072 B", "1×", "Baseline"],
            ["float16", "1,536 B", "2×", "Negligible"],
            ["int8 scalar", "768 B", "4×", "~1%"],
            ["PQ (m=96, k=256)", "96 B", "32×", "5–15% without rescoring"],
            ["Binary", "96 B", "32×", "Large alone; ~5% with rescoring"],
          ],
        },
        { t: "h", text: "Composite indexes" },
        {
          t: "p",
          text: "Real billion-scale systems combine techniques. FAISS's index factory syntax describes them compactly:",
        },
        {
          t: "code",
          lang: "text",
          caption: "Reading FAISS index strings",
          code: `"Flat"                exact brute force. Baseline; use to measure recall.
"IVF4096,Flat"        4096 clusters, uncompressed vectors inside.
"IVF4096,PQ64"        4096 clusters + PQ to 64 bytes. The billion-scale workhorse.
"HNSW32"              HNSW graph with M=32, full-precision vectors.
"IVF65536_HNSW32,PQ64"  HNSW over the CENTROIDS (fast coarse routing)
                        + IVF cells + PQ inside. State of the art for huge corpora.
"OPQ64_256,IVF4096,PQ64"  OPQ rotates the space first so sub-spaces are
                          better decorrelated, improving PQ accuracy.`,
        },
        {
          t: "note",
          tone: "warn",
          title: "Always measure recall against a Flat index",
          text: "Build a Flat index over a sample, run your query set through both, and compute actual recall@k. Without this you have no idea whether your index is returning 0.98 or 0.62 — and there is no error message for low recall. It just quietly gives worse answers, which downstream looks like an LLM problem. This is the single most skipped step in vector-search deployments.",
        },
      ],
    },

    {
      id: "l5",
      level: "core",
      minutes: 14,
      title: "Metadata filtering: the part that breaks in production",
      summary: "\"Find similar documents, but only from 2024, only for tenant 42\" is much harder than it looks.",
      blocks: [
        {
          t: "p",
          text: "Almost every real query has filters. Multi-tenant isolation, date ranges, document type, access-control lists, language. Combining a filter with an ANN search is genuinely difficult, and the naive approaches fail in ways that produce wrong results without any error.",
        },
        { t: "h", text: "Approach 1: post-filtering (the trap)" },
        {
          t: "p",
          text: "Run the ANN search, then discard results that fail the filter.",
        },
        {
          t: "note",
          tone: "warn",
          title: "The silent failure everyone hits once",
          text: "Retrieve top-100 by similarity, then filter to `tenant_id = 42`. If tenant 42 holds 0.1% of your corpus, the expected number of surviving results is *0.1*. You will frequently return **zero results** for a query that has thousands of perfectly good matches. The system does not error — it returns an empty list, and your RAG pipeline confidently answers \"I could not find any information about that.\" The bug looks like a retrieval-quality problem and is actually an architecture problem.",
        },
        { t: "h", text: "Approach 2: pre-filtering" },
        {
          t: "p",
          text: "Identify the matching subset first, then search only within it. Correct by construction — but if the subset is large you have destroyed your index. Exhaustively scanning 5M vectors that passed the filter is brute force with extra steps. Pre-filtering only works when the filter is highly selective.",
        },
        { t: "h", text: "Approach 3: filtered graph traversal (what good systems do)" },
        {
          t: "p",
          text: "Apply the filter *during* HNSW traversal: walk the graph, but only count nodes that satisfy the predicate as valid results, while still traversing *through* non-matching nodes to stay connected.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Why you must traverse through non-matching nodes",
          text: "If you refuse to visit nodes that fail the filter, you sever the graph. The matching nodes may only be reachable via non-matching intermediaries, so greedy search hits a dead end and recall collapses — worse, it collapses more for more selective filters, which is exactly backwards from what you want. Correct implementations traverse the full graph and filter only the *result* set. Qdrant additionally builds extra graph links for high-cardinality payload values so filtered subgraphs stay connected on their own.",
        },
        {
          t: "table",
          head: ["Strategy", "Correctness", "Speed", "Best when"],
          rows: [
            ["Post-filter", "Broken for selective filters", "Fast", "Filter matches > ~50% of corpus"],
            ["Pre-filter (exact scan)", "Exact", "Slow on large subsets", "Filter leaves < ~10k vectors"],
            ["Filtered traversal", "Good", "Good", "The general answer; what mature engines implement"],
            ["Partitioned indexes", "Exact within partition", "Fast", "Multi-tenant, where the tenant is always known"],
          ],
        },
        { t: "h", text: "Partitioning: the pragmatic answer for multi-tenancy" },
        {
          t: "p",
          text: "If every query is scoped to a single tenant, do not filter — *separate*. Give each tenant its own collection, namespace, or partition. The filter becomes routing, which is free, and you get hard isolation as a bonus, which matters for compliance.",
        },
        {
          t: "list",
          items: [
            "**Upside** — no filtering cost, no cross-tenant leakage risk, per-tenant deletes are trivial (drop the collection), and one tenant's load cannot degrade another's.",
            "**Downside** — thousands of tiny indexes have per-index overhead, and cross-tenant analytics become awkward.",
            "**Common hybrid** — a shared index for small tenants with filtered search, dedicated collections for large ones. Most managed vector databases now document this pattern explicitly.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Access control must not be a metadata filter you hope works",
          text: "If a filter is the only thing preventing user A from seeing user B's documents, a filtering bug is a data breach. Treat ACL enforcement as a hard boundary — partition by tenant, and re-verify permissions on retrieved IDs before they enter the prompt. Defence in depth, because 'the vector database returned it' is not an acceptable incident explanation.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 16,
      title: "Choosing and operating a vector store",
      summary: "The landscape, the honest recommendation, and the operational concerns nobody mentions in the quickstart.",
      blocks: [
        {
          t: "p",
          text: "There are dozens of options and the marketing is uniformly enthusiastic. The decision is usually determined by two questions: how many vectors, and what does your team already run in production?",
        },
        { t: "h", text: "The landscape" },
        {
          t: "table",
          head: ["Option", "What it is", "Scale sweet spot", "Consider when"],
          rows: [
            ["NumPy / scikit-learn", "Brute force in a process", "< 100k", "Prototypes, evaluation, exact search"],
            ["FAISS", "A library, not a database. No server, no persistence, no filtering.", "1M – 1B+", "You want maximum control and will build the service around it"],
            ["pgvector / pgvectorscale", "Postgres extension", "< 10M – 50M", "You already run Postgres. Usually the right first answer."],
            ["Qdrant", "Purpose-built, Rust, strong filtering", "1M – 1B", "Complex metadata filters matter"],
            ["Weaviate", "Purpose-built, integrated modules and hybrid search", "1M – 1B", "You want built-in hybrid and vectorisation"],
            ["Milvus", "Distributed, disaggregated storage/compute", "100M – 10B+", "Genuinely huge scale, dedicated ops capacity"],
            ["Pinecone", "Fully managed, serverless", "1M – 1B", "You do not want to operate anything"],
            ["Chroma / LanceDB", "Embedded / file-based", "< 5M", "Local development, notebooks, single-node apps"],
            ["Elasticsearch / OpenSearch", "Search engine with HNSW added", "1M – 100M", "You already run it and need BM25 in the same query"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The recommendation that saves the most time",
          text: "**Start with pgvector if you already run Postgres.** Up to roughly 10M vectors it is fast enough, and you get transactions, joins, backups, replication, existing monitoring, existing access control, and a team that already knows how to operate it. A dedicated vector database is a new stateful system to run — a real cost that quickstart guides never mention. Migrate when you have measured a specific problem, not preemptively.",
        },
        { t: "h", text: "FAISS is not a database" },
        {
          t: "note",
          tone: "warn",
          title: "A distinction that trips people up in interviews",
          text: "FAISS is a similarity-search *library*. It has no server, no persistence beyond writing a file, no metadata filtering, no concurrency control, no replication, no auth. Many vector databases use it (or ideas from it) internally. Saying \"we'll use FAISS\" when you mean \"we'll build a vector service\" hides roughly 80% of the work — auth, persistence, updates, backups, sharding, monitoring.",
        },
        { t: "h", text: "Operational concerns" },
        {
          t: "list",
          items: [
            "**Updates and deletes.** How does your engine handle churn? HNSW tombstones accumulate; IVF centroids drift. Both need periodic compaction or reindexing. Ask this before you pick, because it is invisible on day one and painful in month six.",
            "**Backups and disaster recovery.** Can you snapshot? How long is a restore? If your only recovery path is re-embedding 50M documents, your RTO is measured in days — and you should know that before you need it.",
            "**Cost model.** Managed services often price on stored vectors plus queries. Model your actual volume; the difference between providers at 100M vectors can be an order of magnitude.",
            "**Monitoring.** Track recall (against a periodic Flat-index sample), p95 latency, index size, and queries returning zero results. That last one is your canary for the filtering bug from the previous lesson.",
            "**Consistency.** Is a freshly written vector immediately searchable? Many systems are eventually consistent, which produces genuinely confusing bugs when a user uploads a document and cannot find it.",
          ],
        },
        { t: "h", text: "DiskANN: when RAM runs out" },
        {
          t: "p",
          text: "HNSW requires everything in memory because graph traversal is random access. DiskANN redesigns for SSDs: keep compressed (PQ) vectors in RAM for routing, keep full-precision vectors and adjacency lists on disk, and structure the graph so a search needs only a few hundred sequential-ish disk reads.",
        },
        {
          t: "list",
          items: [
            "Serves billions of vectors from a single machine — orders of magnitude cheaper than the equivalent RAM.",
            "Higher latency than in-memory HNSW (single-digit to tens of milliseconds versus sub-millisecond), which is usually irrelevant next to an LLM call taking seconds.",
            "Available via `pgvectorscale` (StreamingDiskANN) and in Milvus, among others. Worth knowing by name — it is the standard answer to \"our index does not fit in RAM\"."
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"When would you choose pgvector over a dedicated vector database?\" Strong answer: below ~10M vectors, when you already run Postgres, because operational simplicity, transactional consistency with your source data, and joins against existing tables usually outweigh raw index performance. Then name the trigger for migrating — measured p95 latency or recall regression at your target scale, not a blog post.",
        },
      ],
    },
  ],

  theory: [
    "Why exact nearest-neighbour search does not scale: O(n·d) per query, and why memory (6.1TB for 1B×1536 float32) binds before compute does.",
    "Approximate Nearest Neighbour search: trading a few percent of recall for 100-1000× speedup, and why that trade is acceptable when the embedding is itself approximate.",
    "When ANN is NOT acceptable: deduplication, plagiarism detection, compliance lookups, and measuring your own retriever's recall.",
    "recall@k as the quality metric, and the five-way tradeoff between recall, latency, memory, build time, and update speed.",
    "IVF: k-means partitioning into nlist cells, searching nprobe of them; cost ≈ nlist·d + (n/nlist)·nprobe·d.",
    "The IVF edge problem: a query near a cell boundary can never see its true nearest neighbour with nprobe=1.",
    "Why IVF centroids go stale under distribution shift, and why IVF still wins when memory is the binding constraint.",
    "HNSW: greedy graph traversal plus a skip-list-style hierarchy; layers sampled from an exponential distribution give O(log n) search.",
    "HNSW parameters: M and ef_construction are build-time (require rebuild), ef_search is query-time (tunable per request).",
    "HNSW memory overhead ≈ n·M·8 bytes on top of the vectors, and why the index must be RAM-resident.",
    "HNSW weaknesses: deletes leave tombstones, long build times, poor disk locality, and filtering can disconnect the graph.",
    "Scalar quantisation (int8): 4× smaller for ~1% recall loss — the highest value-per-effort optimisation available.",
    "Product Quantisation: split into m sub-vectors, k-means a codebook per sub-space, store centroid IDs; distance becomes table lookup + add.",
    "Asymmetric distance computation: PQ quantises the database but NOT the query, halving the error for free.",
    "Binary quantisation with rescoring: 32× smaller, Hamming distance, recovers most recall via the oversample-then-rescore pattern.",
    "Composite indexes and FAISS index-factory strings (IVF4096,PQ64 / OPQ / IVF_HNSW), and why you must always measure recall against a Flat index.",
    "Metadata filtering: post-filtering silently returns zero results for selective filters; pre-filtering degenerates to brute force; filtered graph traversal is the general answer.",
    "Why filtered traversal must walk THROUGH non-matching nodes, and why partitioning is the pragmatic multi-tenant answer.",
    "Why access control must be a hard partition boundary and re-verified, not a metadata filter you trust.",
    "The vector store landscape, why FAISS is a library and not a database, and why pgvector is usually the right first answer.",
    "DiskANN: PQ vectors in RAM for routing plus full vectors on SSD, serving billions of vectors from one machine.",
    "Operational concerns: churn and compaction, backup/restore RTO, cost models, monitoring recall and zero-result rates, and read-after-write consistency.",
  ],

  math: [
    {
      title: "Brute-force kNN complexity",
      formula: "O(n · d) per query",
      note: "For n=10M and d=1536, ~1.5×10^10 multiply-adds per single query — seconds, not milliseconds. And 1B×1536 float32 is 6.1TB, which fits nowhere.",
    },
    {
      title: "Recall@k",
      formula: "recall@k = |returned_top_k ∩ true_top_k| / k",
      note: "The only honest quality metric for an ANN index. Measure it against an exact Flat index on a sample; there is no error message for low recall.",
    },
    {
      title: "IVF search cost",
      formula: "cost ≈ nlist·d + (n/nlist)·nprobe·d ; fraction searched ≈ nprobe/nlist",
      note: "nlist=1000, nprobe=10 searches ~1% of the data. Rule of thumb: nlist ≈ 4√n. Raising nprobe raises recall and latency together.",
    },
    {
      title: "HNSW layer assignment & complexity",
      formula: "layer(v) = floor(-ln(U(0,1)) · mL) ; search ≈ O(log n)",
      note: "Exponentially decaying layer occupancy gives O(log n) layers. Greedy traversal per layer is bounded by ef, so total work is logarithmic.",
    },
    {
      title: "HNSW memory overhead",
      formula: "graph bytes ≈ n × M × 2 × 4",
      note: "Bidirectional links with 4-byte IDs; layer 0 typically allows 2M connections. 10M vectors at M=16 ≈ 1.3GB on top of 30.7GB of float32 vectors.",
    },
    {
      title: "Scalar quantisation",
      formula: "q = round((x - min)/(max - min) × 255)",
      note: "One byte per dimension with per-dimension min/max for decoding. 4× compression, typically under 1% recall loss.",
    },
    {
      title: "Product Quantisation compression",
      formula: "ratio = (d × 32) / (m × log2 k) ; e.g. (768×32)/(96×8) = 32×",
      note: "d-dim vector split into m sub-vectors, each quantised to one of k centroids. Distance becomes m table lookups and adds — often faster, not just smaller.",
    },
    {
      title: "Vector storage estimate",
      formula: "bytes = n × d × bytes_per_value",
      note: "50M × 768 × 4 = 153.6GB in float32; 38.4GB in int8; 4.8GB with PQ at 96 bytes/vector. Do this arithmetic before choosing an index.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain why brute-force nearest neighbour search fails to scale, and identify which resource (memory or compute) usually binds first at billion scale." },
    { type: "theory", q: "Name three applications where approximate search is NOT acceptable and you must use exact search." },
    { type: "theory", q: "Describe how HNSW's layered graph enables logarithmic search time, using the skip-list analogy. Then state its memory cost." },
    { type: "theory", q: "Which HNSW parameters are fixed at build time and which can be tuned per query? What is the practical strategy that follows?" },
    { type: "theory", q: "Explain the IVF edge problem and why nprobe=1 is almost never acceptable." },
    { type: "theory", q: "Why do IVF centroids need periodic retraining while HNSW graphs do not? What symptom would you observe if you neglected it?" },
    { type: "theory", q: "Explain asymmetric distance computation in Product Quantisation and why it improves accuracy for free." },
    { type: "theory", q: "Why is naive metadata post-filtering dangerous? Give a concrete example where it returns zero results for a query with thousands of good matches." },
    { type: "theory", q: "Why must filtered graph traversal walk through non-matching nodes rather than skipping them?" },
    { type: "theory", q: "Why should tenant isolation be a partition rather than a metadata filter?" },
    { type: "theory", q: "Explain why FAISS is not a vector database, and list four things you would have to build around it." },
    { type: "theory", q: "Explain the oversample-then-rescore pattern with binary quantisation, and identify where else in this curriculum the same pattern appears." },
    { type: "math", q: "For 50 million 768-dim float32 vectors, estimate the raw memory footprint. Then recompute with int8 scalar quantisation and with PQ at 96 bytes per vector." },
    { type: "math", q: "If PQ compresses each 768-dim float32 vector to 96 sub-vectors of 8 bits each, what is the compression ratio?" },
    { type: "math", q: "In an IVF index with nlist=1000 and nprobe=10 over 1M vectors, roughly how many vectors are examined per query, and what speedup is that over brute force?" },
    { type: "math", q: "Compute the total memory for an HNSW index over 10M 768-dim float32 vectors with M=32. Break out vectors versus graph overhead." },
    { type: "math", q: "You have 200M vectors at 1024 dims. Calculate float32 memory, then decide between HNSW+int8 and IVF+PQ, justifying with numbers." },
    { type: "theory", q: "Compare Pinecone, Milvus, and pgvector across hosting model, scale ceiling, and operational complexity. When would you choose pgvector, and what measured signal would trigger migrating away from it?" },
    { type: "theory", q: "What is DiskANN trying to solve, and what does it trade away?" },
  ],

  resources: [
    { label: "Malkov & Yashunin 2016 — Efficient and robust ANN search using HNSW", url: "https://arxiv.org/abs/1603.09320", kind: "paper" },
    { label: "Jégou et al. 2011 — Product Quantization for Nearest Neighbor Search", url: "https://inria.hal.science/inria-00514462/document", kind: "paper" },
    { label: "Pinecone — Faiss: The Missing Manual (full series)", url: "https://www.pinecone.io/learn/series/faiss/", kind: "blog" },
    { label: "Pinecone — Hierarchical Navigable Small Worlds (HNSW) explained", url: "https://www.pinecone.io/learn/series/faiss/hnsw/", kind: "blog" },
    { label: "Pinecone — Product Quantization: compressing vectors by 97%", url: "https://www.pinecone.io/learn/series/faiss/product-quantization/", kind: "blog" },
    { label: "FAISS wiki — guidelines for choosing an index", url: "https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index", kind: "docs" },
    { label: "FAISS — The index factory", url: "https://github.com/facebookresearch/faiss/wiki/The-index-factory", kind: "docs" },
    { label: "Subramanya et al. 2019 — DiskANN", url: "https://papers.nips.cc/paper/2019/hash/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Abstract.html", kind: "paper" },
    { label: "Qdrant — filtrable HNSW and filtering internals", url: "https://qdrant.tech/articles/filtrable-hnsw/", kind: "blog" },
    { label: "pgvector — README and index tuning", url: "https://github.com/pgvector/pgvector", kind: "repo" },
    { label: "ANN-Benchmarks — reproducible recall/latency comparisons", url: "https://ann-benchmarks.com/", kind: "docs" },
  ],
};

export default m07;
