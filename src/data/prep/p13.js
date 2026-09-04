const p13 = {
  id: "p13",
  week: 13,
  hours: 8,
  title: "Narrative, Behavioural and Negotiation",
  tag: "Strategy",
  why: "This is the module almost every engineer skips, and it is where several lakh of annual compensation is won or lost. At 35 LPA a company is not buying your ability to write a reducer — it is buying judgement, ownership and the confidence that you will not need managing. Behavioural rounds are where that gets assessed, and the negotiation call is where the number gets set.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 20,
      title: "Why narrative decides the band, and STAR done properly",
      summary:
        "What a panel is actually buying at 35 LPA, the 150-word 90-second STAR shape with a long Action section, and the second layer of detail you must prepare because senior interviewers always probe twice.",
      blocks: [
        {
          t: "p",
          text: "At 18 LPA a company is buying execution: give this person a ticket, get working code back. At 35 LPA they are buying **judgement and ownership** — the ability to decide what to build, say no to the wrong thing, and carry a problem to done without supervision. Nothing in a coding round measures that. The behavioural and hiring-manager rounds exist precisely to measure it, which is why they are not a formality you get through on charm.",
        },
        {
          t: "p",
          text: "You have unusually strong raw material here. You own the frontend architecture of a platform with 12,000 daily users across 1,900 stores and INR 1,000 Cr of stock. You lead four engineers. You took a dashboard from 8 seconds to 3 on 50,000-row views. You grew a team from one to three at Algonauts. Most SDE-2 candidates have none of that. The problem is that raw material is not a narrative, and an unstructured answer wastes it.",
        },
        { t: "h", text: "What the panel is scoring, whether they say so or not" },
        {
          t: "table",
          head: ["Signal", "What they listen for", "What kills it"],
          rows: [
            ["Ownership", "\"I decided\", \"I owned\", \"I was accountable for\"", "\"We were told to\", \"the team decided\" with no visible you"],
            ["Judgement", "A trade-off named, with the option you rejected", "Only the option you picked, presented as obvious"],
            ["Impact", "A number, and how it was measured", "\"It improved performance significantly\""],
            ["Influence", "Changing an outcome without authority", "Escalating to a manager as the first move"],
            ["Self-awareness", "A real mistake, owned, with the lesson applied later", "A humble-brag failure, or blaming context"],
            ["Scope", "Cross-team, multi-quarter, architectural decisions", "Ticket-level work described in detail"],
          ],
        },
        { t: "h", text: "STAR, with the proportions that actually matter" },
        {
          t: "p",
          text: "Everyone knows the acronym. Almost nobody gets the **proportions** right, and the proportions are the entire technique. Target roughly 150 words, which is about 90 seconds spoken. Situation and Task together should be no more than 25 percent — enough context to make the stakes legible and nothing more. **Action is the longest section**, because Action is where every signal in the table above lives. Result must contain a number.",
        },
        {
          t: "table",
          head: ["Section", "Share of the answer", "Purpose", "Length guide"],
          rows: [
            ["**Situation**", "15%", "Stakes and constraints, not company history", "1-2 sentences"],
            ["**Task**", "10%", "What *you* specifically were accountable for", "1 sentence"],
            ["**Action**", "**55%**", "Decisions, trade-offs, the option you rejected", "4-6 sentences"],
            ["**Result**", "20%", "A measured number, plus what changed permanently", "2 sentences"],
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The two failure modes, both fatal, both common",
          text: "First: five minutes of Situation. You describe the org chart, the product, the history, and the interviewer's attention is gone before you reach a decision. Second: \"we\" throughout. If your answer never contains a sentence starting with \"I decided\", the panel cannot tell what you did, and the safe assumption they will make is that you did the least senior part. Both are fixed by writing the answers down once and reading them back with a timer.",
        },
        { t: "h", text: "The second layer — this is the senior-specific part" },
        {
          t: "p",
          text: "At mid level, one good STAR answer ends the topic. At senior level the interviewer will probe **twice**, and the probes are predictable. Prepare a second layer for every story: the alternative you rejected and why, the thing that went wrong mid-way, the person who disagreed with you, how you measured the result, and what you would do differently now. If your story collapses under the second question, the first answer retroactively reads as rehearsed rather than lived.",
        },
        {
          t: "list",
          items: [
            "\"What alternative did you consider and why did you reject it?\" — have a real second option with a real reason.",
            "\"Who disagreed with you?\" — every genuine decision had a dissenter. Name their argument fairly; do not make them a straw man.",
            "\"How did you know it worked?\" — the measurement, the baseline, and who else saw the number.",
            "\"What did you get wrong?\" — one honest thing per story. This is the highest-trust answer available to you.",
            "\"What would you do differently now?\" — shows the learning outlived the project.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Write them down. Actually write them down.",
          text: "You will resist this because it feels like homework and you can \"just talk about your work\". You cannot — not in 90 seconds, not under pressure, not with a number to hand. Writing forces you to find the trade-off and the metric. Ten stories at 150 words is 1,500 words, an evening's work, and it is the highest return-per-hour activity in this entire fourteen-week plan.",
        },
        { t: "h", text: "Delivery mechanics" },
        {
          t: "list",
          items: [
            "**Ninety seconds, then stop.** Silence after your answer is the interviewer's turn, not a gap you need to fill. Rambling past the Result dilutes everything before it.",
            "**Lead with the headline when the question is broad.** \"Tell me about a hard technical problem\" → \"The one I'd pick is a dashboard that took 8 seconds to become interactive.\" Now they know where you are going.",
            "**Numbers early in the Result, not buried.** \"Time to interactive went from 8 seconds to 3\" is stronger as the first clause than as a trailing subordinate.",
            "**Never rehearse to word-perfect.** Rehearse the beats. A memorised recital sounds worse than a slightly rough answer, and it falls apart on the follow-up.",
            "**Have one story you can tell in 30 seconds** for the rapid-fire HR screen, and the 90-second version for the hiring manager.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "At 35 LPA they are buying judgement and ownership. Behavioural rounds are where those are measured, not inferred.",
            "150 words, 90 seconds, Action is 55 percent of it, Result contains a number.",
            "\"I decided\" must appear. \"We\" without a visible you reads as junior.",
            "Prepare a second layer for every story — rejected alternative, dissenter, measurement, mistake.",
            "Write ten stories down this week. It is one evening and it moves the number more than any other single task.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 22,
      title: "Your story bank, worked",
      summary:
        "Four of your real stories written out in full STAR with their second layers, then the rest as prompts. Every one maps to something verifiable on your resume, which is the whole reason they will hold up.",
      blocks: [
        {
          t: "p",
          text: "The strength of your narrative is that all of it is true and all of it is checkable. Nothing below inflates anything — the numbers are your numbers. What follows is the four highest-value stories in full, with the second layer attached, then eleven prompts to write yourself in the same shape.",
        },
        { t: "h", text: "Story 1 — Leading four engineers and changing a mind in review" },
        {
          t: "steps",
          items: [
            {
              title: "Situation",
              text: "\"I lead a four-engineer frontend team at Jio building an enterprise inventory platform — 12,000 daily users across 1,900 stores. We run about thirty code reviews a sprint and deploy to production several times a week, so review quality is what keeps our defect rate survivable.\"",
            },
            {
              title: "Task",
              text: "\"One of my engineers raised a PR that solved a real problem the wrong way — a local state cache inside a component to avoid a refetch. It worked, and he had good reasons. My job was to get to the right architecture without shutting him down, because he was the strongest person on the team and I needed him to keep pushing back on me.\"",
            },
            {
              title: "Action",
              text: "\"I did not reject it. I asked him to walk me through what happens when a second portal updates the same SKU — because we have Store, Cluster and Self-Checkout portals hitting the same stock. He worked out himself that his cache would serve stale quantities on a shared record, which in our domain means a store shows stock it does not have. Then I put two options on the PR: lift it into the shared query layer, or keep the local cache and add explicit invalidation on the SSE event. I said I preferred the first but would take either if he could show the invalidation was complete. He picked the first and generalised it into the shared library so the next module got it free.\"",
            },
            {
              title: "Result",
              text: "\"That pattern is now used by every module in the platform and it is in our onboarding docs. More importantly, he kept raising ambitious PRs — which is what I actually wanted. My rule since then is that in review I ask questions until either they change their mind or I do, and I have to genuinely mean the second half.\"",
            },
            {
              title: "Second layer — \"what if he had been right?\"",
              text: "\"Then I would have merged it. That has happened: he was right about not adopting a component library, which is a separate story. The reason I ask rather than assert is that I am wrong often enough for it to matter, and if I assert, I never find out.\"",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Why this story works",
          text: "It demonstrates influence without authority even though you *had* the authority — that is the senior move and interviewers notice it. It shows domain reasoning (stale stock is a business problem, not a cache problem). And it ends with a durable change, not a one-off fix. Every strong story ends with something that outlived the incident.",
        },
        { t: "h", text: "Story 2 — The component library: build versus adopt, and driving adoption" },
        {
          t: "steps",
          items: [
            {
              title: "Situation",
              text: "\"Six retail brands, three portals, and every new module was rebuilding the same table, filter panel and modal slightly differently. UI code duplication was the biggest drag on our delivery speed — a new module took about five days to scaffold.\"",
            },
            {
              title: "Task",
              text: "\"I owned the decision: adopt an existing design system or build our own shared library. And then the harder half, which is getting four engineers plus adjacent teams to actually use it.\"",
            },
            {
              title: "Action",
              text: "\"I evaluated adopting off the shelf first and I wanted that answer, because building is expensive. It failed on two specifics: our enterprise data grids needed virtualisation over 50,000-row views, which none of the candidates handled well at the time, and our brand theming across six retail brands would have meant fighting the library's token system rather than using it. So I built, but scoped it hard — 50-odd components, no exotic abstractions, and I deliberately did not build anything until it had appeared in two modules already. On adoption, I did not mandate it. I migrated one real screen myself, showed the diff, and then made the new-module scaffold generate against the library so the path of least resistance was the right one.\"",
            },
            {
              title: "Result",
              text: "\"Around 30 percent less duplicated UI code, and new-module scaffolding went from five days to two. The adoption mechanism mattered more than the library: making it the default in the generator did more than any amount of advocacy.\"",
            },
            {
              title: "Second layer — \"what would you do differently?\"",
              text: "\"I would version and document it properly from day one. I treated it as internal so I skipped a changelog, and about four months in a breaking change to the table props broke two teams' builds. That was avoidable and it was my fault. We added semantic versioning and a migration note per release after that.\"",
            },
          ],
        },
        { t: "h", text: "Story 3 — The dashboard performance investigation, including what did not work" },
        {
          t: "steps",
          items: [
            {
              title: "Situation",
              text: "\"Our cluster dashboard took about 8 seconds to become interactive on the views that matter most — 50,000-plus rows. Store managers were opening it at shift start, so 8 seconds of blank screen was the first thing 12,000 users saw every morning.\"",
            },
            {
              title: "Task",
              text: "\"I owned it end to end: find the actual cause, not the plausible one, and fix it without a rewrite we had no time for.\"",
            },
            {
              title: "Action",
              text: "\"My first instinct was wrong and I want to be specific about it, because it is the useful part. I assumed React re-render cost and spent most of a day on memoisation — useMemo on the row projections, React.memo on the cells. It bought almost nothing, maybe 300 milliseconds, because the component tree was not the bottleneck. So I stopped guessing and profiled properly: a Performance trace plus the network waterfall. Two real causes. One, we were fetching the entire dataset and computing aggregates client-side, so there was a multi-second gap before anything could paint. Two, we mounted all 50,000 rows. I moved the aggregation into PostgreSQL stored procedures, paginated the row fetch, and virtualised the grid so we mounted the visible window plus an overscan buffer. I also split the bundle so the dashboard route stopped pulling the charting library on first load.\"",
            },
            {
              title: "Result",
              text: "\"Time to interactive went from 8 seconds to 3. Separately the slowest report went from 10 seconds to 2 once the aggregation moved server-side. The lasting change is that we now profile before optimising as a team norm — the memoisation day is the story I tell new joiners about why.\"",
            },
            {
              title: "Second layer — \"why did memoisation not help?\"",
              text: "\"Because memoisation reduces the cost of re-rendering, and our problem was the cost of the first render plus the time before data arrived. There was nothing to re-render yet. Memoisation also is not free — every useMemo adds a comparison and retains a reference, so applying it broadly can make things slightly worse. It was the right tool for the wrong diagnosis.\"",
            },
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "The failed attempt is the load-bearing detail",
          text: "Leave the memoisation day in. A performance story where everything worked first time sounds invented, because real investigations do not go that way. Including a wrong hypothesis you abandoned on evidence demonstrates exactly the thing the panel is trying to assess — that you update on data rather than defend a guess. Candidates cut this detail because it feels like admitting weakness. It is the opposite.",
        },
        { t: "h", text: "Story 4 — Disagreeing with backend on an API contract, resolved with data" },
        {
          t: "steps",
          items: [
            {
              title: "Situation",
              text: "\"I authored the REST contracts for the inventory platform jointly with the backend team. On the store stock endpoint they wanted a normalised response — separate calls for stock, product metadata and store config — which is cleaner server-side.\"",
            },
            {
              title: "Task",
              text: "\"I thought it would be slow for our real usage and I had no authority over their design. I needed the contract changed on merit, not by escalating.\"",
            },
            {
              title: "Action",
              text: "\"I did not argue in the abstract. I built both against a mock for one screen and measured on the actual store network conditions, which are not office wifi — some of these are 1,900 retail locations on patchy links. Three sequential round trips landed around 1.4 seconds of pure latency before render; the composed response was one trip. I brought the trace, not an opinion. Then I gave ground where they were right: I agreed the composition should live behind an explicit endpoint rather than me chaining calls or them denormalising their tables, and I accepted their versioning scheme without argument because it was better than mine.\"",
            },
            {
              title: "Result",
              text: "\"We shipped a composed endpoint for the read path and kept normalised writes. The broader outcome is that the frontend team is now involved when contracts are drafted rather than after — because I showed up with a measurement once instead of a complaint repeatedly.\"",
            },
            {
              title: "Second layer — \"what if the numbers had gone the other way?\"",
              text: "\"Then I would have taken the normalised version and said so on the thread. That is the point of measuring — I did not know the answer when I started, I had a suspicion. If you only measure when you are confident of the result, you are not measuring, you are building a case.\"",
            },
          ],
        },
        { t: "h", text: "The rest of the bank — write these yourself, same shape" },
        {
          t: "list",
          ordered: true,
          items: [
            "**Contract to FTE conversion.** Mobile Programming deputed you to Jio in Dec 2023; you established the React and TypeScript foundation the product still runs on and converted to Jio payroll as SDE-2 in six months. The story is not \"I got hired\" — it is what you built in six months that made keeping you the obvious decision. Have the specific technical foundations to hand: the TypeScript setup, the module boundaries, the testing baseline.",
            "**Scaling Algonauts from one to three engineers.** You built the algorithmic trading simulator end to end — Svelte frontend, Node order-execution and portfolio APIs, market-data ingestion — from prototype to the firm's core commercial product, then grew the team and introduced code review, standards and onboarding docs. Emphasise that you wrote the process *because* you had felt its absence, and the ML-driven portfolio recommendation module that lifted engagement 25 percent.",
            "**The real-time layer.** Replacing a 15-minute batch with Kafka plus SSE, under 5 seconds end to end. The interesting content is why SSE and not WebSockets — one-directional server push, works over plain HTTP, survives corporate proxies, auto-reconnects natively — and how you handled reconnection and missed events. This story plays exceptionally well at product companies.",
            "**A cross-brand requirement conflict.** Six retail brands with different needs on one platform. A time you said no to a brand-specific request, or found the abstraction that served both. Product sense plus the ability to refuse.",
            "**A production incident you owned.** Multiple deploys a week across three portals means you have one. Detection, decision under pressure, rollback or fix-forward, and the postmortem change.",
            "**AnyTrac RFID.** Inventory accuracy 75 to 98 percent, shrinkage down 40 percent, 1,900-plus locations. Use this when asked about business impact rather than technical depth — it is the clearest line you have from code to money.",
            "**JVA video analytics.** NVIDIA pipelines, ROI configuration tooling, 100-plus camera streams. Use it for \"a time you worked outside your comfort zone\" or unfamiliar-domain questions.",
            "**Reliance Foundation Scholarship Portal.** K2 to MERN migration, 50,000 annual applications, AI document parsing. A legacy-migration and stakeholder story with a hard annual deadline you could not move.",
            "**The analytics-to-engineering move.** Ugam, 15 enterprise analytics products for CDC, University of Chicago, Google Screenwise and IPSOS, report generation down 40 percent — then a deliberate move into product engineering. This is the answer to \"tell me about your career\" and it sets up the SDE-2 question in lesson 3 before they ask it.",
            "**Mentoring a struggling engineer.** Thirty reviews a sprint means you have seen someone plateau. What you changed in how you worked with them, and what happened.",
            "**Testing culture.** Introducing Jest, React Testing Library and Playwright alongside Docker and Azure DevOps CI/CD, with multiple production deploys a week. Frame it as risk management enabling velocity, not as tests for their own sake.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "One number per story, and know where it came from",
          text: "Every figure you quote — 8 seconds to 3, 30 percent duplication, 5 days to 2, 75 to 98 percent accuracy, 25 percent engagement — must survive \"how did you measure that?\" Know the instrument: a Lighthouse or Performance trace, a code-duplication tool, sprint timings, an inventory audit, a product analytics event. If a number came from someone else's dashboard, say so plainly. A confidently quoted figure you cannot source is worse than no figure at all.",
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Four stories fully written, eleven prompts to write. All of them map to verifiable resume lines.",
            "The failed memoisation attempt stays in. It is what makes the performance story credible.",
            "Resolve disagreements with measurement, and say honestly that you would have accepted the other answer.",
            "Every story needs a durable change at the end — a norm, a doc, a default in the generator.",
            "One sourced number per story. Know the instrument that produced it.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 20,
      title: "The failure story and the two hard questions",
      summary:
        "A genuine owned failure that is not a disguised brag, plus scripted, unapologetic answers to \"why are you still SDE-2 after 7 years\" and \"why are you leaving Reliance Jio\".",
      blocks: [
        {
          t: "p",
          text: "Three questions in this loop can cost you the offer outright. All three are predictable. All three should be scripted, said once, calmly, and left behind. This lesson is those three.",
        },
        { t: "h", text: "The failure story — mandatory, and it must be real" },
        {
          t: "p",
          text: "You will be asked for a failure, a mistake, or something you would do differently, in nearly every hiring-manager round. The default candidate response is a humble-brag: \"I took on too much because I care too deeply\", \"I pushed the team too hard to ship\", \"I was too much of a perfectionist\". Interviewers hear these several times a week. They recognise the shape within one sentence, and the cost is not just a zero on that question — it puts a discount on **everything you say for the rest of the loop**, because you have just demonstrated that under mild pressure you manage impressions rather than tell the truth. That is exactly the trait that makes someone dangerous to trust with a production incident.",
        },
        {
          t: "table",
          head: ["Answer", "What they hear", "Verdict"],
          rows: [
            ["\"I care too much and take on too much\"", "Deflection dressed as virtue", "Fails, and taints the loop"],
            ["\"My team missed a deadline\"", "Blame outsourced", "Fails on ownership"],
            ["\"I once merged a bug that reached production\"", "Too small to be a real failure", "Reads as evasive"],
            ["\"I made a call that cost the team weeks, here is why I made it\"", "Genuine, owned, analysed", "Strong"],
          ],
        },
        {
          t: "p",
          text: "A usable failure needs four properties: **you** caused it, it had **real cost** (time, money, trust, a rollback), you can explain the reasoning that seemed sound at the time, and something **changed permanently** as a result. That last part is what stops it being a confession and makes it a competence signal.",
        },
        {
          t: "note",
          tone: "insight",
          title: "Two real candidates from your own history",
          text: "The component library without versioning is a good one: you shipped it as \"internal\" so you skipped a changelog and semantic versioning, and a breaking change to the table props broke two other teams' builds four months later. Real cost, clearly yours, and the fix outlived it. The memoisation day is a second option but it is weaker as a *failure* because you recovered it the same day — use that one for \"a wrong hypothesis\", and keep the versioning one for \"a failure\". Whichever you pick, do not soften the cost. \"It broke two teams' builds and they lost most of a day\" is the sentence that makes it credible.",
        },
        {
          t: "steps",
          items: [
            {
              title: "Name it in one sentence, no preamble",
              text: "\"I shipped a shared component library without versioning or a changelog, and four months later a breaking change I made to the table props broke two other teams' builds.\" No warm-up, no framing. The directness is itself the signal.",
            },
            {
              title: "Explain the reasoning that seemed right",
              text: "\"I treated it as internal tooling, so versioning felt like ceremony for a library with four consumers. I was optimising for shipping speed and I did not think about the library having consumers I would not be talking to daily.\"",
            },
            {
              title: "State the cost honestly",
              text: "\"Two teams lost most of a day, and I had to hotfix a compatibility shim under time pressure, which is exactly the kind of code you do not want in a shared library.\"",
            },
            {
              title: "What changed, and evidence it stuck",
              text: "\"We moved to semantic versioning with a migration note per release, and I now treat anything with a consumer outside my team as a public API regardless of how internal it feels. That is why the real-time SSE contract went out with a documented event schema from the first release.\"",
            },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Do not over-apologise either",
          text: "The failure answer has a second, quieter failure mode: excessive contrition. Three sentences of \"I felt terrible, I let the team down, I still think about it\" reads as fragile. Tell it the way you would tell a peer over coffee — matter-of-fact, analysed, done. Own it fully, once, and move to what changed.",
        },
        { t: "hr" },
        { t: "h", text: "Hard question 1 — \"Why are you still SDE-2 after 7 years?\"" },
        {
          t: "p",
          text: "You will get this, probably in the first recruiter screen and again from the hiring manager. It is not hostile; it is a genuine calibration question, because on paper 7 years at SDE-2 can mean stalled. Yours does not, and the true explanation is strong. The single most important thing is **tone**: this gets answered in about 30 seconds, factually, without a trace of defensiveness, and then you move on. If you sound like you are justifying yourself, you have confirmed the concern that the question was testing for.",
        },
        {
          t: "note",
          tone: "interview",
          title: "The script — say it roughly like this",
          text: "\"Fair question, and the honest answer is that the title lags the path. The first two of those seven years were in data engineering and analytics at Ugam, not product engineering — I moved into engineering deliberately after that, so my engineering clock is closer to five years. Then I joined Jio through a contract route in late 2023, which resets the ladder regardless of what you were doing before; I converted to Jio payroll as SDE-2 within six months, which was the fastest route available. What I would point at instead of the label is the scope: I own the frontend architecture of a platform serving 12,000 daily users across 1,900 stores, I lead a team of four, and I authored the API contracts and the real-time layer. That is senior scope, and the level I am interviewing for reflects the work rather than the history. Happy to go deeper on any of it.\"",
        },
        {
          t: "list",
          items: [
            "**Three facts, in order:** two years were analytics, the contract route reset the ladder, the current scope is senior regardless of the label.",
            "**Say \"fair question\" and mean it.** It signals you have thought about this rather than been ambushed by it.",
            "**Never say \"my manager wouldn't promote me\" or anything resembling it,** even if there is truth in it. It shifts you from explaining to complaining in one clause.",
            "**Redirect to scope, then offer depth and stop.** \"Happy to go deeper\" hands control back and shows you are not desperate to move off the topic.",
            "**Do not raise it unprompted** in a round where it has not come up. Answering an unasked question about your own weakness is a self-inflicted wound.",
          ],
        },
        {
          t: "p",
          text: "One useful reframe to have ready if they push: your career progression is real, it just crosses company boundaries rather than climbing one ladder. Analyst → Senior Software Developer (where you grew a team from one to three and owned a commercial product end to end) → Software Developer on deputation → SDE-2 with team leadership. The dip in title at the Jio entry point is an artefact of the contract route, not of your trajectory, and you should say exactly that if asked.",
        },
        { t: "hr" },
        { t: "h", text: "Hard question 2 — \"Why are you leaving Reliance Jio?\"" },
        {
          t: "p",
          text: "There is one rule and it is absolute: **never criticise Reliance**. Not the process, not the bureaucracy, not the pay, not a manager. Every interviewer's instinctive translation of a candidate criticising their current employer is \"this is what they will say about us in two years\", and it does not matter whether the criticism is fair. Frame forward, towards what you are moving *to*.",
        },
        {
          t: "note",
          tone: "interview",
          title: "The script",
          text: "\"Jio has been a genuinely good place to grow — I have had more ownership there than most SDE-2 roles offer, and going from establishing the React foundation to owning the frontend architecture and leading a team in under two years is not a small thing. The reason I am looking is scope of engineering challenge. Our platform is large in users and data, but the frontend problems are converging: the architecture is set, the library exists, the real-time layer is shipped. I want to be somewhere frontend is a first-class engineering discipline rather than a layer over a backend roadmap — where there is a frontend platform function, other senior frontend engineers to be argued with, and problems at a scale I have not solved before. That is a change of environment, not an escape from one.\"",
        },
        {
          t: "list",
          items: [
            "**Credit where it is due, briefly.** One sentence acknowledging what Jio gave you buys enormous credibility for the rest of the answer.",
            "**\"Frontend as a first-class discipline\"** is your strongest true framing, and it is specific enough to sound like a real reason rather than a script.",
            "**Do not mention money as the driver,** even though it partly is. Money belongs in the negotiation conversation, not the motivation one. If pushed directly — \"is compensation a factor?\" — say \"it is a factor and I expect the market rate for the scope, but it is not the reason I started looking.\"",
            "**Have a location answer ready.** You are Mumbai-based and open to Bengaluru or Hyderabad. Say so proactively for a Bengaluru role; unprompted relocation clarity removes a real objection.",
            "**Never say \"no growth\" or \"no learning\".** Both read as passive. \"Converging problem space\" says the same thing and puts you in the active voice.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "The failure must be genuinely yours, genuinely costly, and end in a permanent change. Panels see through brags in one sentence and discount everything after.",
            "The SDE-2 question gets three facts in thirty seconds, calmly, then a redirect to scope. Defensiveness is the only way to lose it.",
            "Never criticise Reliance. Credit them once, then frame forward to scope and to frontend as a first-class discipline.",
            "Money is a negotiation topic, never a motivation topic.",
            "Say each of these once. Repeating or circling back signals that you are still worried about it.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 22,
      title: "Compensation negotiation",
      summary:
        "Getting from 24 LPA fixed to 35 LPA fixed: why that jump needs two justifications, never anchoring first, the silence after your number, structuring fixed against variable and equity, competing offers as the only real leverage, and the notice period you must raise early.",
      blocks: [
        {
          t: "p",
          text: "You are at 24 LPA fixed and targeting 35 LPA fixed. That is a **46 percent jump**, which is above the ordinary market band for a lateral move and therefore needs justifying — with two things at once, not one. First a **level jump**: you are not moving as an SDE-2, you are moving as a Senior Frontend Engineer or SDE-3, and the scope you already own supports that. Second a **company-tier jump**: 35 LPA is not the Jio band for your title, it is the product-company or good-GCC band. Get both right and 35 is achievable. Ask for 35 as an SDE-2 at a company with the same band as your current one and you will simply be told no.",
        },
        {
          t: "table",
          head: ["Track", "Fixed band (2026, ~7 yrs)", "Your realistic ask", "Notes"],
          rows: [
            ["GCC (Walmart, Target, Lowe's)", "28-42 LPA", "**34-38 fixed**", "Predictable, calmer negotiation, retail domain match"],
            ["Product (Flipkart, Swiggy, Razorpay)", "32-50 LPA", "**36-44 fixed + RSUs**", "Best comp, hardest bar, target SDE-3 not SDE-2"],
            ["Late-stage startup", "30-45 LPA + equity", "**33-40 fixed**", "Negotiate on cash, treat equity as upside"],
            ["Staying at Jio", "24 LPA", "—", "Your BATNA. Know it, and know it is weak leverage alone"],
          ],
        },
        { t: "h", text: "Rule 1 — never anchor first if you can avoid it" },
        {
          t: "p",
          text: "Whoever names a number first gives up information. The recruiter will ask for your expectation in the first screen because it is efficient for them, and the correct first response is to deflect once, politely, and try to get their band instead.",
        },
        {
          t: "note",
          tone: "interview",
          title: "Deflection script — use this on the first ask",
          text: "\"I would rather understand the role and level first, and I am sure you have a band for this position — if you can share it, I can tell you straight away whether we are in the same range and we both save time.\" Said warmly, this works about half the time. If they share a band, you now know everything and have given nothing.",
        },
        {
          t: "p",
          text: "The other question in that same screen is **\"what is your current CTC?\"**. In India this is asked routinely and you will often have to answer it eventually — payslips get verified at offer stage, so do not misstate it, ever. But you can decouple it from your expectation: \"My current fixed is 24 lakh. That reflects an SDE-2 band at my current employer rather than the scope I am carrying, so my expectation is set on the role I am interviewing for, not on a percentage over my current.\" That sentence does the essential work of breaking the \"current plus 30 percent\" anchor before it forms.",
        },
        { t: "h", text: "Rule 2 — if pushed, state the target as a fact and then stop talking" },
        {
          t: "p",
          text: "Sometimes they will not move: \"I do need a number to take this forward.\" Fine. Give it once, cleanly, as a statement of fact, with a brief scope-based reason, and then **stop**.",
        },
        {
          t: "note",
          tone: "interview",
          title: "The anchor script — memorise this one verbatim",
          text: "\"Based on the scope I am carrying — frontend architecture for a platform with 12,000 daily users, leading four engineers — and where the market sits for senior frontend at this level, I am targeting 35 lakh fixed. I am flexible on how the rest of the package is structured.\" Then stop. Do not add \"but I can be flexible\", do not add \"is that in range?\", do not laugh. Say the number and let the sentence end.",
        },
        {
          t: "note",
          tone: "insight",
          title: "The silence after your number IS the negotiation",
          text: "There will be a pause. It will feel much longer than it is, and every instinct will push you to fill it — with a justification, a softener, or worse, a lower number. Do not. That pause is either them doing arithmetic or a deliberate technique, and in both cases the person who speaks next concedes. Count to ten in your head. If the silence genuinely persists, the only acceptable thing to say is a question: \"Does that work with the band for this role?\" — which puts the ball back on their side rather than moving your own number.",
        },
        { t: "h", text: "Rule 3 — know what you are actually negotiating over" },
        {
          t: "table",
          head: ["Component", "How real is it?", "How negotiable?", "How to treat it"],
          rows: [
            ["**Fixed base**", "Fully real, compounds into every future offer", "Hardest to move, most worth moving", "This is the number. Negotiate here first"],
            ["Variable / bonus", "Usually 10-15% of fixed, often prorated year one", "Moderate — ask about historical payout %", "Ask \"what did this pay out last year?\" Discount if the answer is vague"],
            ["Equity / RSUs", "Real at listed companies, speculative at startups", "Often the most flexible lever", "Ask about vesting schedule and cliff. Do not trade fixed for it"],
            ["Joining bonus", "One-time, real cash", "**Easiest yes they can give**", "Ask for it when base is capped — use it to bridge a notice-period gap"],
            ["Relocation", "Real cash if you move to Bengaluru or Hyderabad", "Usually a fixed policy", "Ask explicitly; it is often forgotten rather than refused"],
            ["Level / title", "Determines every future negotiation", "Negotiable **before** the offer, rarely after", "The highest-leverage item and the one people forget to negotiate"],
          ],
        },
        {
          t: "p",
          text: "The critical asymmetry: **fixed base compounds and everything else does not**. Your next employer will anchor on your fixed, not on last year's variable payout. A 3 lakh joining bonus is worth taking when base is genuinely capped, but never trade 2 lakh of base for 4 lakh of one-time cash — that trade loses you money from year two onwards and it damages every subsequent negotiation.",
        },
        { t: "h", text: "Rule 4 — competing offers are the only real leverage" },
        {
          t: "p",
          text: "Being good is not leverage. Interviewing well is not leverage. Wanting more money is not leverage. The only thing that reliably moves a number is a **credible alternative**, and this has direct consequences for how you run your campaign: you must sequence applications so that offers land in the same two-week window. That is why the sequencing material in the next module is a negotiation topic disguised as a scheduling one.",
        },
        {
          t: "list",
          items: [
            "**Be truthful and be vague.** Never invent an offer — it is checkable, and being caught ends the process. \"I am in final rounds with two other companies and expect to have written offers by the end of next week\" is both true and sufficient.",
            "**Do not name the competing number unless it helps you.** If their offer is higher, say the number. If it is lower, say \"I have another offer in hand and I am weighing them on more than compensation\" and leave it there.",
            "**Name your preference honestly if you have one.** \"You are my first choice and I would rather not decide on money — can you close the gap to X and I will sign today?\" is disproportionately effective, because it gives the recruiter something concrete to take to their approver.",
            "**Deadlines are usually soft.** An offer with a 48-hour expiry is applying pressure. \"I want to give this a proper decision and I have a process concluding on the 14th — can we extend to the 15th?\" is a normal request and is usually granted.",
            "**One number, one ask.** Come back once with a specific, justified figure. Iterating three times reads as bad faith and burns goodwill you may want later.",
          ],
        },
        { t: "h", text: "Rule 5 — raise the notice period early, not late" },
        {
          t: "p",
          text: "Reliance notice periods commonly run **60 to 90 days**. This is a real negotiation drag and a real reason offers get withdrawn, and the mistake almost everyone makes is mentioning it at the offer stage, which is exactly when it looks like a problem you were hiding. Raise it in the **first recruiter screen**, unprompted, as a logistics item.",
        },
        {
          t: "note",
          tone: "interview",
          title: "The notice-period script — first screen, not the offer call",
          text: "\"One thing worth flagging early so it does not surprise anyone: my notice period is up to 90 days, and I will push for a buyout or an earlier release. If your timeline is tighter than that, better we know now than in four weeks.\" Then at offer stage: \"Can we look at either a buyout reimbursement or a joining bonus that covers the gap?\" Companies pay buyouts routinely for senior hires. They do not offer them unless you ask.",
        },
        { t: "h", text: "Rule 6 — everything in writing, before you resign" },
        {
          t: "list",
          items: [
            "**Do not resign on a verbal offer.** Ever. Not on a phone call, not on an email saying \"we are excited to move forward\". You need the signed letter.",
            "**Check the letter line by line:** fixed base, variable percentage *and* its payout conditions, equity units with the vesting schedule and cliff, joining bonus with any clawback period, title, level, reporting manager, location, and start date.",
            "**Clawbacks matter.** A joining bonus repayable if you leave within 12 months is common and fine; one with a 24-month clawback is a genuine constraint on your next move.",
            "**Get verbal promises written down.** \"We will review your level after six months\" is worth nothing unless it is in the letter or at minimum in an email from the hiring manager.",
            "**Verify the entity and the band on paper.** GCCs sometimes hire through a subsidiary entity with different policies. Ask which legal entity is employing you.",
          ],
        },
        { t: "h", text: "Declining without burning the relationship" },
        {
          t: "note",
          tone: "interview",
          title: "The decline script",
          text: "\"Thank you for the offer and for how the process was run — I genuinely enjoyed the conversations with the team. I have decided to accept another role that is a closer fit on scope. I would like to stay in touch, and if things look different in a year or two I would be glad to talk again.\" Send it by email, keep it under six lines, do not explain that the other offer paid more, and connect with the hiring manager on LinkedIn. Indian frontend hiring is a small world and the recruiter you decline politely today is the one who calls you with a better role in eighteen months.",
        },
        { t: "h", text: "Questions you should ask the panel" },
        {
          t: "p",
          text: "\"Any questions for me?\" is a scored part of the round, not a courtesy. Informed questions land disproportionately well because they demonstrate you are evaluating them, which is exactly what a senior candidate should be doing. Have four or five ready, tailored to who is in front of you.",
        },
        {
          t: "table",
          head: ["Ask this", "To whom", "What it signals / reveals"],
          rows: [
            ["\"How is frontend organised — a platform team, or embedded per product?\"", "Hiring manager", "You care about architecture ownership"],
            ["\"What does the path from senior to staff look like here, and who has done it recently?\"", "Hiring manager", "Growth intent, and whether the ladder is real"],
            ["\"What is the biggest piece of frontend tech debt you would want me to look at first?\"", "Engineer / HM", "Strongest single question available. Their candour tells you a lot"],
            ["\"How do you decide what gets built — who writes the roadmap?\"", "Hiring manager", "Whether engineers have product input"],
            ["\"What is the deploy cadence and who owns on-call for frontend?\"", "Engineer", "Operational maturity"],
            ["\"What happened to the last person in this role?\"", "Recruiter / HM", "Backfill vs growth. A hesitant answer is a real signal"],
            ["\"How much of the codebase is TypeScript, and how is testing set up?\"", "Engineer", "You have opinions and standards"],
          ],
        },
        { t: "h", text: "Reading the room when a loop is going badly" },
        {
          t: "list",
          items: [
            "**Rounds get shorter.** A 60-minute slot ending at 35 minutes with no follow-up questions is usually a decision already made.",
            "**They stop selling.** Interested panels talk about the team, the roadmap, what you would work on. Uninterested ones just finish the script.",
            "**No forward-looking logistics.** No mention of next steps, timelines or who you will meet next is a soft signal.",
            "**Recruiter goes quiet past their stated timeline.** Chase once, politely, then keep your pipeline moving. Do not chase twice.",
            "**The recovery, if you can see it happening live:** ask directly. \"I want to make sure I have addressed what matters most for this role — is there anything you would like me to go deeper on?\" It occasionally rescues a round, and it costs nothing.",
            "**Do not let one bad loop change your number.** The most expensive negotiation mistake is lowering your ask after a rejection from an unrelated company.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "24 to 35 needs a level jump *and* a tier jump. Argue both, or the number will not clear.",
            "Deflect the first ask. If pushed, state 35 lakh fixed as a fact and then say nothing.",
            "The silence after your number is the negotiation. Whoever speaks first concedes.",
            "Fixed base compounds; nothing else does. Never trade base for one-time cash.",
            "Competing offers are the only real leverage — which makes sequencing a negotiation skill.",
            "Raise the 60-90 day notice in the first screen. Ask for a buyout or a bridging joining bonus.",
            "Nothing is real until it is in the signed letter. Decline gracefully; the market is small.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain what a company is buying at 35 LPA that it is not buying at 18 LPA, and which round assesses it.",
    "State the STAR proportions and justify why Action must be the longest section.",
    "Deliver any story from your bank in 90 seconds with a sourced number in the Result, on demand.",
    "For each story, name the alternative you rejected, the person who disagreed, and how you measured the outcome.",
    "Explain why a humble-brag failure story damages the entire remainder of the loop, not just that answer.",
    "State the four properties a usable failure story must have.",
    "Answer \"why are you still SDE-2 after 7 years\" in under 40 seconds with no defensiveness.",
    "Answer \"why are you leaving Reliance Jio\" without a single critical word about Reliance.",
    "Explain why 24 to 35 LPA requires both a level jump and a company-tier jump.",
    "Explain why fixed base is worth more than an equivalent amount of variable or joining bonus.",
    "Explain why competing offers are the only reliable leverage, and what that implies for application sequencing.",
    "Explain what to do in the silence after you state your number, and why.",
    "Answer \"what is your current CTC\" truthfully while breaking the current-plus-30-percent anchor.",
    "Explain why the notice period must be raised in the first screen rather than at offer stage.",
    "List the eight items to verify line by line in an offer letter.",
    "Name five questions to ask a hiring manager and what each one reveals about the company.",
    "List four signals that a loop is going badly and the one recovery move available mid-round.",
  ],

  math: [
    {
      title: "STAR proportions",
      formula: "Situation 15% · Task 10% · Action 55% · Result 20% — 150 words, ~90 seconds, Result contains a number",
      note: "The proportions are the technique. Action is where ownership, judgement and influence all live, so it gets more than half. If you are still on Situation at 30 seconds, you have already lost the answer.",
    },
    {
      title: "Second-layer probe set",
      formula: "rejected alternative → who disagreed → how you measured → what you got wrong → what you would change now",
      note: "Senior interviewers probe twice. Prepare all five for every story. A story that collapses on the second question makes the first answer read as rehearsed rather than lived.",
    },
    {
      title: "Failure story template",
      formula: "name it in one sentence → reasoning that seemed sound → honest cost → permanent change + evidence it stuck",
      note: "Four properties required: you caused it, real cost, defensible reasoning at the time, durable change after. Your component-library-without-versioning story satisfies all four. Do not soften the cost and do not over-apologise.",
    },
    {
      title: "\"Why still SDE-2?\" — the 30-second answer",
      formula: "\"Fair question. Two of those years were analytics at Ugam. I joined Jio on a contract route which resets the ladder, and converted to SDE-2 in six months. What I would point at is the scope: frontend architecture for 12,000 daily users across 1,900 stores, leading four engineers. Happy to go deeper.\"",
      note: "Three facts, calm tone, redirect to scope, offer depth, stop. Defensiveness is the only way to fail this. Never mention a manager who would not promote you. Never raise it unprompted.",
    },
    {
      title: "\"Why leaving Jio?\" — forward framing",
      formula: "credit Jio in one sentence → \"the reason I am looking is scope of engineering challenge\" → \"somewhere frontend is a first-class discipline\" → concrete: frontend platform function, senior frontend peers, unfamiliar scale",
      note: "Never a critical word about Reliance — the panel hears it as what you will say about them. Money is a negotiation topic, never a motivation topic. Volunteer Bengaluru/Hyderabad relocation openness for non-Mumbai roles.",
    },
    {
      title: "Deflect the first compensation ask",
      formula: "\"I would rather understand the role and level first, and I am sure you have a band for this position — if you can share it, I can tell you straight away whether we are in the same range and we both save time.\"",
      note: "Works roughly half the time. If they share the band you have gained everything and given nothing. Whoever names a number first gives up information.",
    },
    {
      title: "The anchor script",
      formula: "\"Based on the scope I am carrying — frontend architecture for 12,000 daily users, leading four engineers — and where the market sits for senior frontend, I am targeting 35 lakh fixed. I am flexible on how the rest of the package is structured.\" [STOP]",
      note: "State it as fact, once, then silence. Do not append a softener, a question or a laugh. The pause that follows is the negotiation; whoever speaks next concedes. If it persists, ask \"does that work with the band for this role?\" — never lower your own number.",
    },
    {
      title: "Current CTC — de-anchoring",
      formula: "\"My current fixed is 24 lakh. That reflects an SDE-2 band at my current employer rather than the scope I am carrying, so my expectation is set on the role I am interviewing for, not on a percentage over my current.\"",
      note: "Never misstate the figure — payslips are verified at offer stage. But break the 'current + 30%' framing in the same breath, before it becomes the shape of the whole negotiation.",
    },
    {
      title: "Component priority",
      formula: "fixed base > level/title > equity (listed) > joining bonus > variable > equity (startup)",
      note: "Fixed compounds into every future offer; nothing else does. Level is negotiable before the offer and almost never after — it is the most-forgotten high-leverage item. Never trade base for one-time cash.",
    },
    {
      title: "Competing-offer leverage",
      formula: "\"I am in final rounds with two other companies and expect written offers by the end of next week.\" · \"You are my first choice — can you close the gap to X and I will sign today?\"",
      note: "Truthful and vague. Never invent an offer. Name the competing number only when it is higher than theirs. One counter, one specific figure, justified — iterating three times reads as bad faith.",
    },
    {
      title: "Notice-period pre-emption",
      formula: "First screen: \"My notice is up to 90 days and I will push for a buyout or earlier release — better we know now than in four weeks.\" · Offer stage: \"Can we look at a buyout reimbursement or a joining bonus covering the gap?\"",
      note: "Reliance notice runs 60-90 days. Raised early it is logistics; raised at offer stage it looks like something you concealed. Buyouts are routine for senior hires but are never offered unprompted.",
    },
  ],

  practice: [
    { type: "theory", q: "Write all ten stories at 150 words each in full STAR. One evening, no shortcuts. This is the highest-return task in the plan." },
    { type: "theory", q: "Record yourself delivering four stories. Time each one. Anything over 110 seconds gets cut, and cut from Situation first." },
    { type: "theory", q: "For every story, write the five second-layer answers: rejected alternative, dissenter, measurement, mistake, what you would change." },
    { type: "theory", q: "For every number you quote, write down the instrument that produced it. If you cannot name the instrument, drop the number." },
    { type: "theory", q: "Write your failure story. Then read it back and delete every sentence that makes you look better. If nothing is left, pick a different failure." },
    { type: "theory", q: "Say the \"why still SDE-2\" answer out loud ten times until the defensiveness is gone. Record it and listen for a rising or apologetic tone." },
    { type: "theory", q: "Write the \"why leaving Jio\" answer, then scan it for any implied criticism of Reliance — including tone, hedges and pauses. Remove all of it." },
    { type: "theory", q: "Say the anchor script aloud and then stay silent for a full ten seconds. Repeat until the silence is comfortable. This is a physical skill, not a knowledge one." },
    { type: "theory", q: "Have a friend play a recruiter pushing for a number three times in a row. Practise deflecting twice and anchoring once at 35." },
    { type: "theory", q: "Roleplay the counter-offer call: they come back at 30, you need 35. Practise the one-ask, one-number response with a scope justification." },
    { type: "theory", q: "Write out the notice-period disclosure and rehearse it as an opening logistics item, not an apology." },
    { type: "theory", q: "Build an offer-letter checklist covering base, variable and its payout conditions, equity with vesting and cliff, joining bonus and clawback, title, level, entity, location and start date." },
    { type: "theory", q: "Prepare seven panel questions and tag each with who to ask it of — recruiter, engineer or hiring manager." },
    { type: "theory", q: "Write your decline email template now, before you need it under time pressure. Six lines maximum." },
    { type: "theory", q: "Run a full 45-minute mock behavioural round with a peer: career walkthrough, three stories with follow-ups, the failure, and both hard questions." },
    { type: "theory", q: "Write your resignation conversation script for your Jio manager, including what you will say if they counter-offer." },
    { type: "theory", q: "Decide your walk-away number now, in writing, before any offer exists. Then do not renegotiate it with yourself at 11pm after a rejection." },
  ],

  resources: [
    { label: "Levels.fyi India — the only free source with reliable levelled comp data for Flipkart, Swiggy, Walmart and PhonePe. Check your target companies before any recruiter call.", url: "https://www.levels.fyi/t/software-engineer/locations/india", kind: "docs" },
    { label: "Kalzumeus — \"Salary Negotiation: Make More Money, Be More Valued\". Patrick McKenzie's essay is still the single best thing written on this. Read it twice.", url: "https://www.kalzumeus.com/2012/01/23/salary-negotiation/", kind: "blog" },
    { label: "Fearless Salary Negotiation (Josh Doody) — free chapters plus concrete counter-offer scripts. Use it for the wording of the counter, not the US numbers.", url: "https://fearlesssalarynegotiation.com/salary-negotiation-guide/", kind: "book" },
    { label: "\"Ten Rules for Negotiating a Job Offer\" — Haseeb Qureshi. The section on never giving the first number is worth memorising.", url: "https://haseebq.com/my-ten-rules-for-negotiating-a-job-offer/", kind: "blog" },
    { label: "Amazon's Leadership Principles — the clearest public taxonomy of what behavioural rounds score. Map your stories against Ownership, Dive Deep and Earn Trust even for non-Amazon loops.", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", kind: "docs" },
    { label: "The STAR method, plainly explained with worked examples. Use it to check your proportions, not to learn the acronym.", url: "https://www.themuse.com/advice/star-interview-method", kind: "blog" },
    { label: "AmbitionBox — Indian salary and interview data by company and role, plus real interview experience write-ups. Noisy, but the interview reports are useful for process shape.", url: "https://www.ambitionbox.com/", kind: "docs" },
    { label: "Glassdoor India — cross-check comp bands and read the negotiation notes in recent reviews for your target companies.", url: "https://www.glassdoor.co.in/", kind: "docs" },
    { label: "Blind (teamblind) — unfiltered levelling and offer discussion for Indian tech. Treat individual posts sceptically; use it for band ranges and levelling equivalence.", url: "https://www.teamblind.com/", kind: "blog" },
    { label: "\"Never Split the Difference\" — Chris Voss. Read the chapters on calibrated questions and tactical silence; they are exactly the skills in lesson 4.", url: "https://www.blackswanltd.com/never-split-the-difference", kind: "book" },
    { label: "interviewing.io behavioural interview guide — free, and unusually specific about what senior-level follow-up probes are looking for.", url: "https://interviewing.io/behavioral-interview-questions", kind: "course" },
  ],
};

export default p13;
