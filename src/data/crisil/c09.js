const c09 = {
  id: "c09",
  week: 9,
  hours: 2,
  title: "Your Story: A Frontend-Heavy Resume for a Backend Trading Role",
  tag: "Interview Narrative",
  why: "The recruiter already asked you to surface Python and algo-trading language on your resume — that means they see the gap too, and someone on their side will ask about it directly. Walking in with an honest, confident answer prepared beats hoping the question doesn't come up.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 12,
      title: "Answering 'you're mostly a frontend engineer — why this role?' before it derails the interview",
      summary:
        "A true, specific narrative connecting your real backend and trading-domain work into a coherent case for this role, plus the two questions most likely to follow it.",
      blocks: [
        {
          t: "p",
          text: "Your resume, read literally, says Senior Frontend Engineer. This JD says Python Backend Engineer with trading exposure. That gap is real, and pretending it isn't there is the wrong strategy — the stronger move is naming it yourself, on your terms, before it gets framed as a red flag.",
        },
        { t: "h", text: "The honest version of your story" },
        {
          t: "p",
          text: "You are not a backend engineer pretending to be a frontend engineer, and you are not a frontend engineer pretending to be a backend one. You are a full-stack engineer whose most senior, most visible work happened to be frontend-led — and your one genuinely backend-and-domain-heavy chapter, Algonauts, is also your only chapter in capital markets. That is not a weakness to explain away; it is a specific, three-year-old, still-relevant qualification that most frontend-track candidates simply do not have.",
        },
        {
          t: "note",
          tone: "interview",
          title: "A version of the answer worth rehearsing out loud, not reading from a script",
          text: "“My last three years at Jio have been frontend-led — I own the architecture of a large React/TypeScript platform. But before that, at Algonauts, I was the founding engineer on an algorithmic trading simulator, and that was full-stack: I built the Python/Django order-execution and portfolio APIs, not just the UI. So the backend and trading-domain experience isn't new to me, it's just three years old rather than three months old — and this role is a chance to go back to that side of the stack, with a much stronger engineering foundation than I had then.”",
        },
        { t: "h", text: "The two follow-ups to expect, and how to hold your ground honestly" },
        {
          t: "list",
          items: [
            "**\"Your recent hands-on Python is limited — how do you close that?\"** Answer with specifics, not reassurance: name what you have used recently (data/reporting pipelines at Jio, if that's accurate to you) and what you have deliberately studied for this interview (asyncio, FastAPI, Redis messaging patterns) — a candidate who prepared concretely reads very differently from one who says 'I'm a fast learner.'",
            "**\"Have you worked with FIX / OMS / RMS directly?\"** Do not claim more than you have. The strong answer is precise: you designed the data model behind order execution and position keeping — the domain model an OMS/RMS sits on top of — but you have not operated a live FIX session or a production RMS. Offer the concrete plan (a FIX engine library, days not weeks) rather than an implicit promise that you already know it.",
          ],
        },
        { t: "h", text: "What not to do" },
        {
          t: "list",
          items: [
            "Don't lead with an apology (\"I know I'm not a typical fit for this...\") — it invites the interviewer to agree with you.",
            "Don't inflate the Algonauts backend work beyond what you can defend under a follow-up question — the whole strength of this narrative is that it is checkable and true.",
            "Don't answer the domain-gap question with enthusiasm alone (\"I'm really excited about fintech!\") — pair enthusiasm with the one concrete thing you have already done to close the gap this week.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Name the frontend/backend gap yourself, early and matter-of-factly — it removes the interviewer's need to probe for it suspiciously.",
            "Anchor the whole narrative on one true fact: Algonauts was full-stack, backend-and-domain-heavy, and directly in capital markets.",
            "For anything you genuinely have not touched (live FIX, production RMS), say so precisely and pair it with a concrete closing plan — precision reads as seniority; vague confidence does not.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Deliver your 90-second answer to 'why this role, given your resume is frontend-led' out loud, unscripted, twice.",
    "Prepare a specific, honest answer to 'what's your recent hands-on Python experience' that names real work, not intentions.",
    "Prepare a precise, non-inflated answer to 'have you worked with FIX or a production OMS/RMS directly'.",
    "Identify one question you would ask the interviewer about the team's actual Python/trading stack — a good question here signals genuine interest, not just interview performance.",
  ],

  math: [],

  practice: [
    { type: "theory", q: "Record yourself (audio is fine) giving the 90-second narrative answer, then listen back and cut anything that sounds like an apology or an unearned claim." },
    { type: "theory", q: "Write down, in your own words, the single true sentence connecting Algonauts to this JD's trading-domain bullets. Memorise it." },
  ],

  resources: [],
};

export default c09;
