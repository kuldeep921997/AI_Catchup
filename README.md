# GenAI Catch-Up — Learning Tracker

A local React app for your 16-week, in-depth GenAI curriculum: GenAI foundations, deep learning math,
transformers/attention, LLMs, embeddings, vector databases, semantic search, RAG, LangChain/LangGraph,
fine-tuning (LoRA/QLoRA/RLHF/DPO), AI chatbots, VLMs, and Nvidia's VLM/inference stack (NeMo, TensorRT-LLM,
Triton) — plus evaluation/LLMOps and agentic AI, which weren't on the original list but are essential
for the current GenAI job market.

Every module has: **why it matters**, **in-depth theory** (not just an overview), **math/formulas with
explanations**, and **practice questions** (both theoretical and numerical/mathematical). Progress is
tracked per item and saved locally in your browser.

## Running it locally

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
# 1. Unzip the project, then from inside the folder:
npm install

# 2. Start the dev server
npm run dev

# 3. Open the URL it prints (usually http://localhost:5173)
```

To build a static production version (e.g. to deploy or open without a dev server):

```bash
npm run build
npm run preview   # serves the built /dist folder locally
```

## How it works

- **Dashboard** — overall progress, progress-by-track breakdown, and a "continue where you left off" card.
- **Timetable** — a 16-week schedule computed from the day you first open the app, with per-week status
  (upcoming / this week / overdue / done).
- **Module pages** — each of the 16 modules has 5 tabs:
  - **Theory** — checklist of in-depth concepts to actually understand, not just skim.
  - **Math** — key formulas for that topic with a plain-English explanation of each term.
  - **Practice** — a mix of theoretical and mathematical/numerical questions to test real understanding.
  - **Notes** — a free-text area for your own notes/derivations, saved automatically.
  - **Resources** — the papers/docs referenced for that module.
- **Sidebar** — the connected node-rail shows your position across all 16 weeks; a filled node = fully
  complete, a partially-lit node = in progress.

## Your data

All progress is stored **only in your browser's `localStorage`** — nothing is sent anywhere. That means:

- Progress is per-browser/per-device. Use **Export progress (.json)** on the Dashboard to back it up or
  move it to another machine, and **Import progress** to load it back in.
- Clearing your browser's site data for this app will erase your progress unless you've exported it.

## Editing the curriculum

All content lives in one file: `src/data/curriculum.js`. Each module is a plain JS object — add, remove,
or edit `theory`, `math`, or `practice` entries freely; the UI and progress tracking adapt automatically
since progress is computed from the array lengths, not hardcoded counts.

## Tech stack

React 19 + Vite + Tailwind CSS. No backend, no external API calls — everything runs fully offline once
`npm install` has completed.
