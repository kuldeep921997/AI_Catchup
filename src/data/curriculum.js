// AI / GenAI Curriculum — 16 modules, structured as a 16-week catch-up plan.
//
// Each module lives in its own file under ./modules and exports:
//   id, week, hours, title, tag, why
//   lessons[]   — book-style reading content (see ./blocks.js for the block schema)
//   theory[]    — checklist of concepts to be able to explain
//   math[]      — key formulas with a plain-English gloss of every term
//   practice[]  — theory + numerical questions
//   resources[] — { label, url, kind } pointers to papers, docs, repos, courses
//
// Progress tracking is computed from array lengths, so adding or removing
// entries anywhere requires no other changes.

import m01 from "./modules/m01";
import m02 from "./modules/m02";
import m03 from "./modules/m03";
import m04 from "./modules/m04";
import m05 from "./modules/m05";
import m06 from "./modules/m06";
import m07 from "./modules/m07";
import m08 from "./modules/m08";
import m09 from "./modules/m09";
import m10 from "./modules/m10";
import m11 from "./modules/m11";
import m12 from "./modules/m12";
import m13 from "./modules/m13";
import m14 from "./modules/m14";
import m15 from "./modules/m15";
import m16 from "./modules/m16";

const curriculum = [
  m01, m02, m03, m04, m05, m06, m07, m08,
  m09, m10, m11, m12, m13, m14, m15, m16,
];

export default curriculum;
