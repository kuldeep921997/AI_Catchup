# GenAI Catch-Up — Learning Tracker

A local React app for a 16-week, in-depth GenAI curriculum: GenAI foundations, deep learning math,
transformers/attention, LLMs, embeddings, vector databases, semantic search, RAG, LangChain/LangGraph,
fine-tuning (LoRA/QLoRA/RLHF/DPO), AI chatbots, VLMs, and Nvidia's VLM/inference stack (NeMo, TensorRT-LLM,
Triton) — plus evaluation/LLMOps and agentic AI, which weren't on the original list but are essential
for the current GenAI job market.

**This is not a checklist of topics to google.** Every module contains 6–8 written lessons — roughly a
book chapter each — with explanations, derivations, worked numerical examples, annotated code, comparison
tables, and callouts for the non-obvious points and the questions interviewers actually ask. Progress is
tracked per lesson and per item, and saved locally in your browser.

## Running it locally

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install
```

```bash
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

To build a static production version:

```bash
npm run build
```

```bash
npm run preview
```

## How it works

- **Dashboard** — overall progress, reading progress in hours, per-track breakdown, and a
  "continue where you left off" card.
- **Timetable** — a 16-week schedule computed from the day you first opened the app, with per-week
  status (upcoming / this week / overdue / done).
- **Sidebar** — a connected node rail across all 16 weeks. A filled node is complete, a partially-lit
  node is in progress, and the node for the current scheduled week pulses.
- **Module pages** — each of the 16 modules has 6 tabs:
  - **Read** — the lessons. Each is tagged `Beginner`, `Core`, or `Advanced` with an estimated reading
    time, and can be filtered by level. Open one to read it, mark it read, and move to the next.
  - **Recall** — a checklist of concepts. Check one off once you can explain it out loud, without notes.
  - **Math** — the key formulas for that topic, each with a plain-English gloss of every term.
  - **Practice** — theoretical and numerical questions to work out on paper.
  - **Notes** — a free-text area for your own notes and derivations, saved automatically.
  - **Resources** — clickable links to the papers, docs, repos, and courses behind that module.

### Reading levels

Levels describe *depth*, not difficulty of the module:

| Level | Meaning |
| --- | --- |
| **Beginner** | No prerequisites beyond the previous module |
| **Core** | The load-bearing material — this is the level to be fluent at |
| **Advanced** | Production concerns, edge cases, and research context |

A reasonable first pass is Beginner + Core across all 16 modules, then Advanced on a second pass.

## Your data

All progress is stored **only in your browser's `localStorage`** — nothing is sent anywhere. That means:

- Progress is per-browser/per-device. Use **Export progress (.json)** on the Dashboard to back it up or
  move it to another machine, and **Import progress** to load it back in. Import validates the file
  shape, so an unrelated JSON file is rejected rather than wiping your progress.
- Clearing your browser's site data for this app will erase your progress unless you've exported it.

## Editing the curriculum

Each module is a standalone file: `src/data/modules/m01.js` … `m16.js`, re-exported from
`src/data/curriculum.js`. Add, remove, or edit `lessons`, `theory`, `math`, `practice`, or `resources`
entries freely — the UI and progress tracking adapt automatically, since progress is computed from array
lengths rather than hardcoded counts.

Lesson content is a list of typed blocks. The full schema is documented at the top of
`src/data/blocks.js`; the short version:

```js
{ t: "h",     text }                          // section heading
{ t: "p",     text }                          // paragraph — supports **bold**, *italic*, `code`
{ t: "list",  items: [], ordered?: bool }     // bullet or numbered list
{ t: "steps", items: [{ title, text }] }      // numbered walk-through
{ t: "math",  formula, note }                 // display formula + gloss
{ t: "code",  lang, code, caption }           // code listing
{ t: "table", head: [], rows: [[]] }          // comparison table
{ t: "note",  tone, title, text }             // tone: insight | warn | analogy | interview
{ t: "hr" }                                   // section break
```

Resources are `{ label, url, kind }`, where `kind` is one of `paper`, `docs`, `repo`, `course`, `blog`,
`book`. Plain strings still render, without a link.

## Tech stack

React 18 + Vite 5 + Tailwind CSS 3. No backend, no external API calls, no runtime dependencies beyond
React — everything runs fully offline once `npm install` has completed. The only network requests are the
Google Fonts stylesheet in `index.html` and whatever resource links you click.
