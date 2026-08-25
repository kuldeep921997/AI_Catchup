const m03 = {
  id: "m03",
  week: 3,
  hours: 6,
  title: "NLP Fundamentals & Tokenization",
  tag: "NLP",
  why: "Before a model 'reads' text, text must become numbers. How you split text into tokens directly affects model quality, cost, and multilingual performance — a frequently underestimated topic.",

  lessons: [
    {
      id: "l1",
      level: "beginner",
      minutes: 14,
      title: "The pre-neural era: bag-of-words, n-grams, TF-IDF",
      summary: "Twenty years of NLP in one lesson — and why two of these techniques are still in your production stack.",
      blocks: [
        {
          t: "p",
          text: "It is tempting to skip the history. Do not: BM25, the direct descendant of TF-IDF, still beats dense embeddings on a meaningful fraction of real queries, and every production retrieval system worth its salt runs both (Module 8). Understanding why these methods work — and precisely where they fail — is what lets you diagnose a bad RAG pipeline.",
        },
        { t: "h", text: "Bag-of-words" },
        {
          t: "p",
          text: "Represent a document as a vector over the vocabulary, where entry i is the count of word i. \"the cat sat on the mat\" becomes {the: 2, cat: 1, sat: 1, on: 1, mat: 1} and zeros everywhere else. The name is literal: you have thrown the words in a bag and lost the order entirely. \"Dog bites man\" and \"man bites dog\" are identical vectors.",
        },
        {
          t: "list",
          items: [
            "**Sparse** — a 50,000-word vocabulary gives 50,000 dimensions, of which a short document uses maybe 30.",
            "**Order-blind** — all syntax is discarded.",
            "**No notion of similarity between words** — `car` and `automobile` are as unrelated as `car` and `xylophone`, because they are different dimensions. This is the fatal flaw and the reason embeddings exist.",
          ],
        },
        { t: "h", text: "N-grams: order, partially recovered" },
        {
          t: "p",
          text: "Count pairs or triples of adjacent words instead of single words. Bigrams turn \"New York\" into a unit and recover local word order. This gave the classical n-gram language model:",
        },
        {
          t: "math",
          formula: "P(w_t | w_{t−n+1}, …, w_{t−1}) = count(w_{t−n+1}…w_t) / count(w_{t−n+1}…w_{t−1})",
          note: "A Markov approximation to the chain rule from Module 1: assume the next word depends only on the previous n−1 words. Estimate the probability by counting occurrences in a corpus.",
        },
        {
          t: "p",
          text: "This is a real, working language model — Google's 2007 machine translation system used 5-grams over two trillion tokens. Two problems killed it. First, **combinatorial explosion**: a 50k vocabulary has 50k⁵ ≈ 3×10²² possible 5-grams, so almost every one you encounter at test time has count zero (hence an entire literature on smoothing). Second, **no generalisation**: having seen \"the cat sat on the mat\" a thousand times tells the model nothing about \"the dog sat on the rug\", because those are different strings.",
        },
        {
          t: "note",
          tone: "insight",
          title: "This is exactly the gap neural LMs closed",
          text: "A neural model represents words as dense vectors, so `cat` and `dog` are nearby points rather than distinct symbols. Evidence about one automatically informs the other. Everything from Word2Vec to GPT-5 is an elaboration of that single move from discrete symbols to continuous vectors.",
        },
        { t: "h", text: "TF-IDF: weighting words by how informative they are" },
        {
          t: "p",
          text: "Raw counts over-weight words like \"the\", which appear everywhere and distinguish nothing. TF-IDF multiplies a word's frequency in a document by how rare it is across the corpus.",
        },
        {
          t: "math",
          formula: "TF-IDF(t, d) = tf(t, d) × log(N / df(t))",
          note: "tf = how often term t appears in document d. N = total documents. df = how many documents contain t. If a term appears in every document, log(N/N) = 0 and it is weighted out entirely. If it appears in one document out of a million, log(10⁶) ≈ 13.8 — a very strong signal.",
        },
        {
          t: "steps",
          items: [
            { title: "Worked example", text: "'model' appears 4 times in a 100-word document, and in 10 of 1,000 corpus documents." },
            { title: "TF", text: "Using normalised term frequency: 4/100 = 0.04. (Raw count 4 also works; pick a convention and stay consistent.)" },
            { title: "IDF", text: "log(1000/10) = log(100) = 4.605 with natural log, or 2.0 with log base 10." },
            { title: "Product", text: "0.04 × 4.605 ≈ 0.184. Compare with the word 'the', appearing 8 times but in all 1,000 documents: IDF = log(1) = 0, so TF-IDF = 0 regardless of frequency." },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why this still matters in 2026",
          text: "TF-IDF's successor BM25 remains the strongest single baseline for keyword-shaped queries: product SKUs, error codes, person names, legal citations. Dense embeddings compress meaning and in doing so throw away exact tokens. Hybrid retrieval (Module 8) exists precisely because the two failure modes are complementary — and skipping the lexical half is the most common self-inflicted wound in production RAG.",
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 16,
      title: "Why subword tokenization won",
      summary: "Word-level and character-level tokenization each fail in an instructive way. Subwords are the compromise everything uses.",
      blocks: [
        {
          t: "p",
          text: "A tokenizer maps a string to a sequence of integers. This sounds trivial and is not: the choice determines your sequence lengths, your API costs, how well the model handles typos and code, and how badly it disadvantages non-English languages. Get it wrong and no amount of model scale fully compensates.",
        },
        { t: "h", text: "Option 1: split on words" },
        {
          t: "list",
          items: [
            "**Vocabulary explosion.** English has hundreds of thousands of word forms once you include inflections, names, and typos. Every one needs a row in the embedding matrix — 500k × 4096 = 2 billion parameters just for the dictionary.",
            "**Out-of-vocabulary is fatal.** Anything unseen becomes `<UNK>` and its identity is destroyed. New product names, misspellings, and rare technical terms all collapse to the same meaningless symbol.",
            "**No morphological sharing.** `run`, `running`, `runner`, and `reran` are four unrelated IDs. The model must learn each independently.",
            "**'Word' is not well-defined.** Chinese and Japanese have no spaces. German compounds arbitrarily (`Donaudampfschifffahrtsgesellschaft`). Turkish is agglutinative and can express a whole clause in one word.",
          ],
        },
        { t: "h", text: "Option 2: split on characters" },
        {
          t: "list",
          items: [
            "**Tiny vocabulary, zero OOV.** Every string is representable. Attractive properties.",
            "**Sequences become brutally long.** A 1,000-word document is ~5,000 characters. Since attention is O(T²), that is a 25× increase in attention cost versus a 1,000-token representation.",
            "**Very little meaning per token.** The letter `c` carries almost no information; the model must spend layers reconstructing words before it can reason about them.",
            "**Long-range dependencies get further apart.** A reference across 50 words is a 250-character span.",
          ],
        },
        { t: "h", text: "The subword compromise" },
        {
          t: "p",
          text: "Keep frequent words whole; split rare words into meaningful pieces. `the` is one token. `tokenization` might be `token` + `ization`. An unseen word like `Kuldeepization` still decomposes into known pieces rather than becoming `<UNK>`.",
        },
        {
          t: "table",
          head: ["Approach", "Vocab size", "Sequence length", "OOV", "Verdict"],
          rows: [
            ["Character", "~100–256", "Very long (5× words)", "None", "Too slow, too little signal per token"],
            ["Word", "500k+", "Shortest", "Severe", "Unusable vocabulary and OOV problems"],
            ["Subword", "32k–256k", "~1.3× words", "None (byte fallback)", "The universal choice"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The rule of thumb worth memorising",
          text: "For English, **1 token ≈ 4 characters ≈ 0.75 words**. So 1,000 tokens is roughly 750 words, or about 1.5 pages. Use this constantly when sizing context windows, estimating API cost, and choosing chunk sizes for RAG (Module 9).",
        },
        { t: "h", text: "What a tokenizer actually contains" },
        {
          t: "code",
          lang: "python",
          caption: "The three pieces of any modern tokenizer",
          code: `# 1. A vocabulary: string piece -> integer id
vocab = {"<|endoftext|>": 50256, "the": 464, " cat": 3797, "ization": 1634, ...}

# 2. Merge rules (BPE) or scores (Unigram) that decide HOW to split
merges = [("t", "h"), ("th", "e"), ("Ġc", "at"), ...]   # in priority order

# 3. Pre-tokenization and normalization rules
#    - split on whitespace/punctuation using a regex
#    - 'Ġ' (or '▁') marks a leading space so decoding is lossless
#    - optionally lowercase, strip accents, normalize Unicode (NFKC)

tok.encode("The cat")     # -> [464, 3797]
tok.decode([464, 3797])   # -> "The cat"   (exactly round-trips)`,
        },
        {
          t: "note",
          tone: "warn",
          title: "The leading-space detail that causes real bugs",
          text: "In GPT-style tokenizers, `\"cat\"` and `\" cat\"` are *different tokens* with different IDs. This is why few-shot prompts are sensitive to trailing whitespace: ending your prompt with `\"Answer: \"` leaves the model choosing among space-prefixed tokens that it may rarely have seen in that position. Ending with `\"Answer:\"` and letting the model produce the space is usually more reliable.",
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 18,
      title: "Byte-Pair Encoding, step by step",
      summary: "The algorithm behind GPT, Llama, and most open models. Run it by hand once and you own it.",
      blocks: [
        {
          t: "p",
          text: "BPE started life in 1994 as a data-compression algorithm. Sennrich et al. repurposed it for machine translation in 2016, and it has been the dominant tokenization method ever since. The idea is greedy and almost embarrassingly simple: repeatedly merge the most frequent adjacent pair of symbols.",
        },
        { t: "h", text: "Training the tokenizer" },
        {
          t: "steps",
          items: [
            { title: "1. Start from characters", text: "Split every word in the corpus into individual characters. The initial vocabulary is the set of characters present (or all 256 bytes, for byte-level BPE)." },
            { title: "2. Count adjacent pairs", text: "Across the whole corpus, count how often each adjacent symbol pair occurs, weighted by word frequency." },
            { title: "3. Merge the most frequent pair", text: "Replace every occurrence of that pair with a new single symbol, and add the merge rule to an ordered list." },
            { title: "4. Repeat", text: "Go back to step 2. Continue until the vocabulary reaches the target size (e.g. 50,257 for GPT-2, 128,256 for Llama-3)." },
          ],
        },
        { t: "h", text: "Worked example" },
        {
          t: "p",
          text: "Corpus: `low` ×5, `lower` ×2, `newest` ×6, `widest` ×3. Split into characters, with `_` marking a word boundary:",
        },
        {
          t: "code",
          lang: "text",
          caption: "BPE training, two iterations",
          code: `Initial:
  l o w _        ×5
  l o w e r _    ×2
  n e w e s t _  ×6
  w i d e s t _  ×3

Pair counts:
  (l,o) = 5+2 = 7
  (o,w) = 5+2 = 7
  (e,s) = 6+3 = 9      <-- highest
  (s,t) = 6+3 = 9      <-- tie; break by first-seen or by frequency order
  (w,e) = 6
  (e,r) = 2
  ...

Merge 1: (e,s) -> "es"
  l o w _        ×5
  l o w e r _    ×2
  n e w es t _   ×6
  w i d es t _   ×3

Pair counts now:
  (es,t) = 6+3 = 9     <-- highest
  (l,o)  = 7
  (o,w)  = 7

Merge 2: (es,t) -> "est"
  l o w _        ×5
  l o w e r _    ×2
  n e w est _    ×6
  w i d est _    ×3

Merge 3 would be (l,o) -> "lo", then (lo,w) -> "low", and so on.

Learned merge list (ORDERED — order is part of the tokenizer):
  1. e + s   -> es
  2. es + t  -> est
  3. l + o   -> lo
  4. lo + w  -> low
  ...`,
        },
        {
          t: "note",
          tone: "insight",
          title: "Notice what BPE discovered",
          text: "Nobody told it that `est` is an English superlative suffix. It fell out of frequency statistics alone. This is BPE's charm and its limitation: it finds statistically useful pieces, which often coincide with morphemes but sometimes cut across them in ways that look bizarre to a linguist.",
        },
        { t: "h", text: "Applying the tokenizer at inference" },
        {
          t: "p",
          text: "Encoding is not a search for the optimal split. You split the input into characters and then apply the learned merges **in the order they were learned**, greedily, until no more apply. This determinism is why the merge list must ship with the model and why two tokenizers with the same vocabulary but different merge orders are incompatible.",
        },
        { t: "h", text: "Byte-level BPE: the trick that removed `<UNK>` forever" },
        {
          t: "p",
          text: "GPT-2 introduced a refinement. Rather than starting from Unicode characters (of which there are ~150,000, an awkward base vocabulary), start from the 256 possible **bytes**. Any text in any language, plus emoji, plus arbitrary binary, is a sequence of bytes — so every possible input is representable and `<UNK>` is structurally impossible.",
        },
        {
          t: "list",
          items: [
            "Base vocabulary is exactly 256 — small and complete.",
            "Rare characters cost several tokens each (an uncommon CJK character may be 2–3 bytes and therefore 2–3 tokens), which is a real cost but never a failure.",
            "Used by GPT-2/3/4, Llama, Mistral, and most modern open models.",
            "The `Ġ` you see in GPT-2 token dumps is the printable stand-in for byte 0x20 (space), remapped so that whitespace bytes stay visible in the vocabulary file.",
          ],
        },
        {
          t: "code",
          lang: "python",
          caption: "Seeing it for yourself — worth actually running",
          code: `from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("gpt2")

for s in ["hello", "Hello", " hello", "tokenization", "1234567", "  \\n"]:
    ids = tok.encode(s)
    print(f"{s!r:20} -> {ids}  {[tok.decode([i]) for i in ids]}")

# Instructive results:
#   'hello'  and ' hello'   -> different single tokens
#   'Hello'  and 'hello'    -> different tokens (case is not normalised)
#   'tokenization'          -> ['token', 'ization']  — clean morphology
#   '1234567'               -> ['123', '45', '67']   — arbitrary digit grouping`,
        },
        {
          t: "note",
          tone: "interview",
          title: "Likely question",
          text: "\"Walk me through BPE.\" Give the four training steps, then add the two details that show real familiarity: merges are applied greedily in learned order at encode time, and byte-level BPE makes `<UNK>` impossible by starting from 256 bytes rather than Unicode characters.",
        },
      ],
    },

    {
      id: "l4",
      level: "core",
      minutes: 14,
      title: "WordPiece, Unigram, and SentencePiece",
      summary: "The three alternatives to plain BPE, what each optimises, and which models use them.",
      blocks: [
        {
          t: "p",
          text: "BPE is not the only option, and the differences show up in real behaviour. Three variants matter.",
        },
        { t: "h", text: "WordPiece (BERT, DistilBERT, ELECTRA)" },
        {
          t: "p",
          text: "Structurally identical to BPE, but it changes the merge criterion. BPE merges the most *frequent* pair. WordPiece merges the pair that most increases the likelihood of the training corpus under a unigram language model:",
        },
        {
          t: "math",
          formula: "score(a, b) = count(ab) / (count(a) × count(b))",
          note: "Normalising by the individual frequencies means a pair is only merged if it occurs together more often than chance would predict. Frequent-but-independent pairs are not merged; genuinely collocated pairs are.",
        },
        {
          t: "p",
          text: "WordPiece marks continuation pieces with `##`: `tokenization` becomes `token` + `##ization`, where `##` means \"this attaches to the previous piece with no space\". Cosmetically different from BPE's leading-space convention, functionally equivalent.",
        },
        { t: "h", text: "Unigram LM (T5, ALBERT, XLNet, mT5)" },
        {
          t: "p",
          text: "Unigram works in the opposite direction. Rather than building up from characters, it starts with a deliberately oversized candidate vocabulary and **prunes**. Each token has a probability; the score of a segmentation is the product of its token probabilities. At each round, the algorithm computes how much removing each token would hurt the total corpus likelihood, and discards the least useful ~10–20%.",
        },
        {
          t: "math",
          formula: "P(segmentation) = Π P(tokenᵢ)     choose argmax over all valid segmentations",
          note: "Unlike BPE's greedy application, Unigram uses the Viterbi algorithm to find the globally most probable segmentation of the input. It also supports *subword regularization*: sampling different valid segmentations during training as a data-augmentation technique, which measurably improves robustness.",
        },
        { t: "h", text: "SentencePiece — a library, not an algorithm" },
        {
          t: "note",
          tone: "warn",
          title: "The most common terminology confusion in this area",
          text: "SentencePiece is not a tokenization algorithm. It is Google's *library*, which can train either BPE or Unigram. Saying \"we used SentencePiece instead of BPE\" is a category error and interviewers notice. Say \"SentencePiece with the Unigram model\" or \"SentencePiece BPE\".",
        },
        {
          t: "p",
          text: "What SentencePiece contributes is language-agnostic preprocessing. Earlier tokenizers assumed you could split on whitespace before tokenizing — which fails immediately for Chinese, Japanese, and Thai. SentencePiece treats the raw input as a stream of Unicode characters including spaces, encoding space as the visible marker `▁`. The result is fully reversible decoding with no language-specific rules, which is why it dominates multilingual models.",
        },
        {
          t: "table",
          head: ["Method", "Merge/selection criterion", "Direction", "Models"],
          rows: [
            ["BPE", "Most frequent adjacent pair", "Bottom-up (merge)", "GPT-2/3/4, Llama, Mistral, Qwen"],
            ["WordPiece", "Max likelihood gain, count(ab)/(count(a)count(b))", "Bottom-up (merge)", "BERT, DistilBERT, ELECTRA"],
            ["Unigram LM", "Min likelihood loss when removed", "Top-down (prune)", "T5, mT5, ALBERT, XLNet"],
            ["SentencePiece", "(library — runs BPE or Unigram)", "—", "T5, Llama-1/2, Gemma, most multilingual"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Does the choice matter in practice?",
          text: "Less than you would hope. Head-to-head studies find modest quality differences, generally favouring Unigram slightly on morphologically rich languages. What matters far more is vocabulary *size* and the *training data mix* used to fit the tokenizer. A tokenizer trained on 95% English will tax every other language regardless of algorithm — the next lesson quantifies that.",
        },
      ],
    },

    {
      id: "l5",
      level: "advanced",
      minutes: 18,
      title: "Tokenization pathologies: numbers, code, languages, and glitch tokens",
      summary: "Where tokenization silently degrades your model, and what to do about it.",
      blocks: [
        {
          t: "p",
          text: "Many surprising LLM failures are not reasoning failures at all — they are tokenization artefacts. Once you can spot them, a whole class of confusing model behaviour becomes obvious.",
        },
        { t: "h", text: "Why LLMs are bad at arithmetic" },
        {
          t: "p",
          text: "GPT-2's tokenizer splits `1234567` into `123`, `45`, `67`. The grouping depends on which digit strings happened to be frequent in the training corpus, so `1000` may be one token while `1001` is two. Column alignment — the basis of every arithmetic algorithm a human uses — is destroyed before the model sees the number.",
        },
        {
          t: "list",
          items: [
            "Llama and several other modern models split numbers into **individual digits** deliberately, which measurably improves arithmetic.",
            "GPT-4 and later group digits in consistent chunks of up to three, which also helps versus GPT-2's arbitrary grouping.",
            "This is why chain-of-thought helps arithmetic so much (Module 11): writing out intermediate steps re-tokenizes small numbers into stable, well-represented tokens.",
            "The practical rule: for anything numerically important, use a calculator tool rather than the model's own arithmetic (Module 16).",
          ],
        },
        { t: "h", text: "Why LLMs cannot count letters" },
        {
          t: "p",
          text: "The famous \"how many r's in strawberry\" failure is a tokenization consequence. The model sees something like `str` + `aw` + `berry` — three opaque integers. It never sees individual letters, so counting them requires having memorised the spelling of the word as a fact rather than inspecting the input. Similarly, reversing a string, pig latin, and acrostics are all disproportionately hard for reasons that have nothing to do with intelligence.",
        },
        { t: "h", text: "The multilingual tax" },
        {
          t: "p",
          text: "Tokenizers are trained on a corpus. If that corpus is mostly English, English gets efficient tokens and everything else is spelled out in fragments. The effect is large and directly financial:",
        },
        {
          t: "table",
          head: ["Language", "Approx. tokens per word", "Relative cost"],
          rows: [
            ["English", "~1.3", "1.0×"],
            ["Spanish / French / German", "~1.5–2.0", "~1.2–1.5×"],
            ["Russian (Cyrillic)", "~2–3", "~2×"],
            ["Hindi (Devanagari)", "~3–5", "~3×"],
            ["Thai / Burmese", "~4–8", "~4×+"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Three compounding penalties, not one",
          text: "A Hindi speaker pays roughly 3× more per API call, fits roughly a third as much text into the same context window, and gets worse quality because each token carries less linguistic information and the model has seen fewer well-formed examples of these tokens. Newer tokenizers with 128k–256k vocabularies (Llama-3, GPT-4o) substantially narrowed this gap, and that was a major motivation for enlarging vocabularies.",
        },
        { t: "h", text: "Code tokenization" },
        {
          t: "p",
          text: "Indentation is semantic in Python, and older tokenizers spent one token per space. GPT-3 burned four tokens on a single indentation level. Code-aware tokenizers add explicit multi-space tokens (2, 4, 8, 16 spaces), which shortens Python files considerably and improves generation quality. Similarly, common identifiers (`self`, `def`, `return`, `const`) become single tokens in models trained with code in the tokenizer corpus.",
        },
        { t: "h", text: "Glitch tokens" },
        {
          t: "p",
          text: "The strangest failure mode. The tokenizer is trained on a different (usually larger, messier) corpus than the model. Strings that appeared often enough to earn a token — Reddit usernames such as `SolidGoldMagikarp`, scraped forum artefacts, subreddit names — then get filtered out of the model's actual training data. The result is a token whose embedding was initialised randomly and never meaningfully updated.",
        },
        {
          t: "list",
          items: [
            "Feeding such a token produces bizarre behaviour: evasion, hallucination, insults, or repeating unrelated words.",
            "The mechanism is mundane — an untrained embedding is effectively random noise injected into the residual stream.",
            "The lesson generalises: **train your tokenizer on the same distribution as your model**, and audit for tokens with near-initialisation embedding norms.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The practical diagnostic checklist",
          text: "When a model behaves inexplicably on some input, tokenize it and look at the pieces before assuming a reasoning failure. Check for: split numbers, unexpected whitespace tokens, a non-English string exploding into fragments, and trailing-space sensitivity in your prompt template. This costs thirty seconds and resolves a surprising share of bugs.",
        },
      ],
    },

    {
      id: "l6",
      level: "advanced",
      minutes: 14,
      title: "Vocabulary size, and the case against tokenizers",
      summary: "The real tradeoff behind vocabulary choice, and the research trying to eliminate the whole layer.",
      blocks: [
        {
          t: "p",
          text: "Vocabulary size is one of the few genuinely architectural decisions you make before training, and it cannot be changed afterwards without retraining. It trades three things against each other.",
        },
        { t: "h", text: "The three-way tradeoff" },
        {
          t: "math",
          formula: "embedding params = V × d     output projection = d × V     softmax cost ∝ V",
          note: "V = vocabulary size, d = hidden dimension. The embedding table and the output head both scale linearly in V, and the final softmax must normalise over all V logits at every generated token.",
        },
        {
          t: "list",
          items: [
            "**Larger V → shorter sequences.** Attention is O(T²), so shortening sequences is a superlinear win on compute and lets more real text fit in a fixed context window.",
            "**Larger V → more parameters and a more expensive softmax.** For a small model this can be crippling: with V = 256k and d = 768, the embedding plus output head is ~393M parameters, dwarfing a 124M-parameter body.",
            "**Larger V → fewer examples per token.** Rare tokens get less gradient signal, so their embeddings are trained more weakly. There is a point of diminishing returns set by corpus size.",
          ],
        },
        {
          t: "table",
          head: ["Model", "Vocab", "Notes"],
          rows: [
            ["GPT-2 (2019)", "50,257", "Byte-level BPE; English-centric"],
            ["Llama-1/2 (2023)", "32,000", "SentencePiece BPE; small vocab, heavy multilingual tax"],
            ["Mistral (2023)", "32,768", "Same lineage"],
            ["Llama-3 (2024)", "128,256", "4× larger; a major driver of its efficiency and multilingual gains"],
            ["GPT-4o (2024)", "~200,000", "Roughly halved token counts for many non-English languages"],
            ["Gemma / Qwen", "256,000 / ~152,000", "Large vocabularies as the current default"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why the trend is unambiguously upward",
          text: "As models get bigger, the fixed cost of a large embedding table becomes a smaller fraction of the total, while the benefit — shorter sequences, cheaper attention, fairer multilingual treatment — stays constant or grows. For a 70B model, a 256k vocabulary costs ~2% of parameters. For a 124M model it would cost 75%. Large vocabularies are a luxury that scale makes affordable.",
        },
        { t: "h", text: "Extending a tokenizer for a new domain" },
        {
          t: "p",
          text: "A practical task you may actually face: adapting a model to a language or domain its tokenizer handles badly. You can add tokens, but there are rules.",
        },
        {
          t: "steps",
          items: [
            { title: "1. Train a small tokenizer on your domain corpus", text: "Identify frequent pieces the base tokenizer fragments — medical terms, a non-Latin script, a code dialect." },
            { title: "2. Add the new tokens and resize the embedding matrix", text: "`model.resize_token_embeddings(len(tokenizer))`. Both the input embedding and the output head grow." },
            { title: "3. Initialise the new rows intelligently", text: "Do NOT leave them random. Initialise each new token's embedding as the mean of the embeddings of the pieces it used to be split into. This starts the new token near the right place in representation space and converges far faster." },
            { title: "4. Continue pretraining on domain data", text: "The new embeddings need real gradient signal. Skipping this step gives you exactly the glitch-token problem from the previous lesson, self-inflicted." },
          ],
        },
        { t: "h", text: "Getting rid of tokenizers altogether" },
        {
          t: "p",
          text: "Tokenization is widely regarded as an ugly, brittle preprocessing layer that causes the pathologies in the previous lesson. Several research directions try to remove it:",
        },
        {
          t: "list",
          items: [
            "**ByT5** operates directly on UTF-8 bytes. No OOV, no multilingual tax, robust to noise and typos — but sequences are ~5× longer and it is markedly slower.",
            "**MegaByte** and similar hierarchical models use a local model over bytes inside patches plus a global model over patches, amortising the length penalty.",
            "**Byte Latent Transformer (BLT)** allocates compute dynamically by grouping bytes into entropy-based patches: predictable regions get large patches, surprising regions get small ones. Reported to match tokenizer-based models at scale.",
            "**Character-aware hybrids** keep subword tokens but add character-level features so the model can still see spelling.",
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "A good closing observation",
          text: "Tokenization is the last significant hand-engineered component in an otherwise end-to-end learned system. Deep learning's history is the history of such components being replaced by learned ones — hand-crafted vision features, HMM phoneme models, parse trees. It would be consistent with that history for tokenizers to disappear, and there is active, credible work in that direction. Being able to say that shows you understand the field's trajectory, not just its current state.",
        },
      ],
    },
  ],

  theory: [
    "Text preprocessing evolution: bag-of-words → n-grams → TF-IDF → word embeddings → subword tokenization.",
    "Why classical n-gram LMs failed: combinatorial explosion of counts and zero generalisation between similar strings.",
    "TF-IDF math and its continued relevance for hybrid/sparse retrieval (BM25) alongside dense embeddings.",
    "Why word-level tokenization fails (vocabulary explosion, OOV, no morphological sharing) and why character-level fails (long sequences, weak per-token signal).",
    "Byte-Pair Encoding (BPE): iterative merging of the most frequent adjacent pair; merges are applied greedily in learned order at encode time.",
    "Byte-level BPE (GPT-2 onward): starting from 256 bytes makes <UNK> structurally impossible.",
    "WordPiece (BERT) merges by likelihood gain count(ab)/(count(a)count(b)) rather than raw frequency; marks continuations with ##.",
    "Unigram LM (T5) prunes an oversized vocabulary top-down and uses Viterbi to find the globally optimal segmentation; supports subword regularization.",
    "SentencePiece is a library (running BPE or Unigram), not an algorithm — its contribution is language-agnostic whitespace handling via ▁.",
    "Vocabulary size tradeoffs: larger vocab = shorter sequences but a bigger embedding matrix, more expensive softmax, and weaker signal per rare token.",
    "Tokenization pitfalls: arbitrary digit grouping breaks arithmetic; subwords hide letters (the 'strawberry' problem); non-English scripts pay a 2-4× token tax.",
    "Glitch tokens: what happens when the tokenizer corpus and the model corpus differ, leaving embeddings at their random initialisation.",
    "Extending a tokenizer: resize embeddings and initialise new rows as the mean of their constituent pieces, then continue pretraining.",
    "Tokenizer-free directions: ByT5, MegaByte, Byte Latent Transformer — removing the last hand-engineered component.",
  ],

  math: [
    {
      title: "TF-IDF",
      formula: "TF-IDF(t,d) = tf(t,d) × log(N / df(t))",
      note: "tf = term frequency in document d, N = total documents, df = documents containing t. A term in every document gets IDF = log(1) = 0 and is weighted out entirely.",
    },
    {
      title: "N-gram language model",
      formula: "P(wt | wt-n+1..wt-1) = count(wt-n+1..wt) / count(wt-n+1..wt-1)",
      note: "A Markov approximation to the chain rule. Fails because a 50k vocab has 50k^5 possible 5-grams, so almost all test n-grams have count zero.",
    },
    {
      title: "BPE merge step",
      formula: "pair* = argmax_(a,b) count(a,b) in corpus",
      note: "Repeatedly merge the most frequent adjacent symbol pair until the target vocab size is reached. The ordered merge list IS the tokenizer.",
    },
    {
      title: "WordPiece merge criterion",
      formula: "score(a,b) = count(ab) / (count(a) × count(b))",
      note: "Normalising by individual frequencies means a pair is only merged if it co-occurs more than chance predicts — unlike BPE's raw frequency.",
    },
    {
      title: "Unigram segmentation",
      formula: "P(segmentation) = Π P(token_i) ; choose argmax via Viterbi",
      note: "Top-down pruning from an oversized vocabulary. Unlike BPE's greedy encode, Unigram finds the globally most probable split, and can sample alternatives for regularization.",
    },
    {
      title: "Vocabulary cost",
      formula: "embedding + output head = 2 × V × d ; softmax cost ∝ V per token",
      note: "V=256k, d=768 gives ~393M parameters of pure dictionary — larger than a 124M model's body. At 70B scale the same vocab costs ~2%.",
    },
    {
      title: "Token estimation rule of thumb",
      formula: "1 token ≈ 4 chars ≈ 0.75 English words",
      note: "Use constantly for context sizing, cost estimation, and RAG chunk planning. Multiply by 2-4× for non-Latin scripts.",
    },
  ],

  practice: [
    { type: "theory", q: "Explain the three main tokenization strategies (word, character, subword) and the tradeoff each makes." },
    { type: "theory", q: "Why did classical n-gram language models fail to generalise, and what specifically did neural embeddings fix?" },
    { type: "theory", q: "Why does GPT-4 'see' the same English sentence as fewer tokens than the equivalent sentence in Hindi or Thai, and what are the three separate penalties that follow?" },
    { type: "theory", q: "What is the difference between BPE and WordPiece merge criteria? Why might normalising by individual token frequencies be better than raw counts?" },
    { type: "theory", q: "Why is 'we used SentencePiece instead of BPE' a category error?" },
    { type: "theory", q: "Why can LLMs struggle with character-level tasks like reversing a string or counting letters, given subword tokenization?" },
    { type: "theory", q: "Explain what a glitch token is, the mechanism that creates one, and how to prevent it when extending a tokenizer." },
    { type: "math", q: "Manually run 2 iterations of BPE on the toy corpus low×5, lower×2, newest×6, widest×3 (character-split). Show the pair counts and the merges chosen." },
    { type: "math", q: "Compute TF-IDF for the word 'model' if it appears 4 times in a 100-word document, and appears in 10 out of 1,000 documents in the corpus." },
    { type: "math", q: "A model has vocab 256,000 and hidden dim 768. Compute the combined parameter count of the embedding table and output projection. What fraction of a 124M-parameter model is that?" },
    { type: "math", q: "You are budgeting a RAG system for 500-word chunks. Estimate the token count per chunk in English, then in Hindi." },
    { type: "theory", q: "Why is the trend in vocabulary size upward (32k → 128k → 256k), and why would that same choice be a mistake for a 124M-parameter model?" },
    { type: "theory", q: "Describe the four steps for extending a tokenizer to a new domain, and explain what goes wrong if you skip the embedding-initialisation step." },
  ],

  resources: [
    { label: "Hugging Face NLP Course — Chapter 6: The Tokenizers library", url: "https://huggingface.co/learn/nlp-course/chapter6/1", kind: "course" },
    { label: "Karpathy — Let's build the GPT Tokenizer (build BPE from scratch)", url: "https://www.youtube.com/watch?v=zduSFxRajkE", kind: "course" },
    { label: "Karpathy — minbpe (minimal, readable BPE implementation)", url: "https://github.com/karpathy/minbpe", kind: "repo" },
    { label: "Sennrich et al. 2016 — Neural MT of Rare Words with Subword Units (BPE)", url: "https://arxiv.org/abs/1508.07909", kind: "paper" },
    { label: "Kudo 2018 — Subword Regularization (Unigram LM)", url: "https://arxiv.org/abs/1804.10959", kind: "paper" },
    { label: "Kudo & Richardson 2018 — SentencePiece", url: "https://arxiv.org/abs/1808.06226", kind: "paper" },
    { label: "OpenAI Tokenizer playground (see splits interactively)", url: "https://platform.openai.com/tokenizer", kind: "docs" },
    { label: "tiktoken — OpenAI's BPE tokenizer", url: "https://github.com/openai/tiktoken", kind: "repo" },
    { label: "Pagnoni et al. 2024 — Byte Latent Transformer (tokenizer-free)", url: "https://arxiv.org/abs/2412.09871", kind: "paper" },
  ],
};

export default m03;
