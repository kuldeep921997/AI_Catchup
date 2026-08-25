// Block schema for lesson content.
//
// A lesson is a chapter of a book. Its `blocks` array is the prose, in order.
// Every block is a plain object with a short `t` (type) discriminator so that the
// 16 module files stay readable.
//
//   { t: "p",     text }                        paragraph. Inline markup: **bold**, *italic*, `code`.
//   { t: "h",     text }                        section heading inside a lesson
//   { t: "list",  items: [], ordered?: bool }   bullet or numbered list (items support inline markup)
//   { t: "steps", items: [{ title, text }] }    numbered walk-through with titled steps
//   { t: "math",  formula, note? }              display formula + plain-English gloss of each term
//   { t: "code",  lang, code, caption? }        code listing
//   { t: "table", head: [], rows: [[]] }        comparison table
//   { t: "note",  tone, title?, text }          callout. tone: insight | warn | analogy | interview
//   { t: "hr" }                                 section break
//
// Levels describe reading depth, not difficulty of the module:
//   beginner  — no prerequisites beyond the previous module
//   core      — the load-bearing material; this is the level to be fluent at
//   advanced  — production concerns, edge cases, research context
export const LEVELS = ["beginner", "core", "advanced"];

export const LEVEL_LABEL = {
  beginner: "Beginner",
  core: "Core",
  advanced: "Advanced",
};

export const RESOURCE_KIND_LABEL = {
  paper: "PAPER",
  docs: "DOCS",
  repo: "REPO",
  course: "COURSE",
  blog: "ARTICLE",
  book: "BOOK",
};
