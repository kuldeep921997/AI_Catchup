// Senior Frontend Interview Prep — 14 modules across a 28-day sprint.
//
// Same schema as the GenAI curriculum (see ../blocks.js for the block spec), so
// every component renders both tracks unchanged. Each module exports:
//   id, week (phase number), hours, title, tag, why
//   lessons[]   — book-style reading content
//   theory[]    — concepts you must be able to explain out loud, unprompted
//   math[]      — { title, formula, note }; here `formula` carries a signature,
//                 pattern skeleton or complexity budget rather than mathematics
//   practice[]  — { type, q }; type "math" renders as a timed build drill,
//                 "theory" as an explain-it-out-loud question
//   resources[] — { label, url, kind } pointing at the best material available
//
// Ordering is deliberate: fundamentals first (they underpin every later round),
// then the rounds that actually decide senior frontend offers in India —
// machine coding and frontend system design — then narrative and strategy.

import p01 from "./p01";
import p02 from "./p02";
import p03 from "./p03";
import p04 from "./p04";
import p05 from "./p05";
import p06 from "./p06";
import p07 from "./p07";
import p08 from "./p08";
import p09 from "./p09";
import p10 from "./p10";
import p11 from "./p11";
import p12 from "./p12";
import p13 from "./p13";
import p14 from "./p14";

const prep = [
  p01, p02, p03, p04, p05, p06, p07,
  p08, p09, p10, p11, p12, p13, p14,
];

export default prep;
