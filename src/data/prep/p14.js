const p14 = {
  id: "p14",
  week: 14,
  hours: 7,
  title: "Company Tracks and Offer Strategy",
  tag: "Strategy",
  why: "Preparation without a campaign is wasted. Which companies you apply to, in what order, through what channel, and how you time the offers determines your final number at least as much as how well you interview. This module is the campaign: three tracks with their real processes and real 2026 bands, and the operational discipline that gets multiple offers landing in the same fortnight.",

  lessons: [
    {
      id: "l1",
      level: "core",
      minutes: 18,
      title: "Track 1 — GCCs, and why this is your strongest lane",
      summary:
        "Walmart Global Tech, Target, Lowe's, Wayfair, Tesco, Amex, Albertsons. 28-42 LPA, a five-stage process where machine coding is the filter, and a retail domain match that almost no other candidate has.",
      blocks: [
        {
          t: "p",
          text: "Global capability centres are your strongest lane **by a distance**, and the reason is specific rather than generic. Walmart, Target, Lowe's, Tesco and Albertsons all run engineering centres in Bengaluru and Hyderabad whose entire purpose is retail systems: inventory, store operations, supply chain, point of sale, fulfilment. You have shipped exactly that. An inventory platform across 1,900 stores and six brands with INR 1,000 Cr of stock, an RFID accuracy programme, self-checkout portals, store-operations tooling. That is not a transferable-skills argument — it is the same problem domain, at real scale, in production.",
        },
        {
          t: "p",
          text: "This matters more than it should because most senior frontend candidates applying to Walmart have built consumer apps, dashboards or fintech screens. You can talk about cycle counts, shrinkage, SKU-level stock accuracy and multi-brand theming with a hiring manager who lives in those problems daily. Domain fluency is unusually cheap leverage: it costs you nothing to have and it materially changes how the hiring manager round goes.",
        },
        { t: "h", text: "Who to target, and what each is like" },
        {
          t: "table",
          head: ["Company", "Locations", "Fixed band (~7 yrs)", "Notes"],
          rows: [
            ["**Walmart Global Tech**", "Bengaluru, Chennai", "32-42 LPA", "Largest and best-paying GCC. Strong frontend org. Your single best target"],
            ["**Target**", "Bengaluru", "30-40 LPA", "Excellent engineering culture, genuinely good WLB, strong React presence"],
            ["**Lowe's**", "Bengaluru", "28-38 LPA", "Home improvement retail. Very close domain match to your work"],
            ["Wayfair", "Bengaluru", "30-40 LPA", "E-commerce, strong frontend focus, smaller India footprint"],
            ["Tesco Technology", "Bengaluru", "26-36 LPA", "Grocery retail. Calmer pace, slightly lower band"],
            ["American Express", "Bengaluru, Gurugram", "30-40 LPA", "Fintech not retail, but stable and pays well for senior frontend"],
            ["Albertsons", "Bengaluru", "28-36 LPA", "Grocery. Less competition, so a good early application"],
          ],
        },
        { t: "h", text: "The process, stage by stage" },
        {
          t: "steps",
          items: [
            {
              title: "1. Online assessment — DSA, 2 problems, 60-90 minutes",
              text: "HackerRank or CodeSignal, usually two easy-to-medium problems. Arrays, strings, hash maps, occasionally a simple BFS. This is a pure filter and your Blind 150 work already clears it. Do not over-prepare for this stage; do sit it in a quiet room with a stable connection, because a timeout is the most avoidable rejection in the whole campaign.",
            },
            {
              title: "2. Machine coding — 90-120 minutes, and this is the real filter",
              text: "Build a working component or small app in the browser: a data table with sorting, filtering and pagination; a multi-step form; an autocomplete with debounce and cancellation; a kanban board. Judged on working functionality first, then component decomposition, state design, edge cases and code cleanliness. This is where most rejections happen, and it is exactly where your remaining preparation hours should go.",
            },
            {
              title: "3. Frontend system design and deep React — 60 minutes",
              text: "Design a feature end to end: a real-time inventory dashboard, an infinite feed, a design-system architecture. They want component hierarchy, state ownership and boundaries, data-fetching and caching strategy, performance budget, error and loading states, and accessibility. Then deep React: reconciliation, keys, effects and cleanup, memoisation costs, Suspense, concurrent rendering. Your 8-to-3-second dashboard story belongs here.",
            },
            {
              title: "4. Hiring manager — 45-60 minutes",
              text: "Behavioural and scope. Ownership, leading your four engineers, cross-team disagreement, the failure story. This is also where the domain match pays: expect real conversation about inventory and store systems. Come with the panel questions from the previous module.",
            },
            {
              title: "5. HR and compensation — 30 minutes",
              text: "Band confirmation, notice period, relocation, documentation. Bring the anchor script. GCC negotiations are calmer and more formulaic than product-company ones — the band is usually genuinely fixed by level, which means the highest-leverage move is arguing the *level*, not the number.",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Slower, but more predictable",
          text: "GCC loops run 4 to 6 weeks end to end, sometimes longer, with real gaps between rounds because panels are shared across US and India time zones. That is frustrating but it is also the reason you start applying in week 1 of the sprint rather than week 4 — the calendar, not your readiness, is the binding constraint. The upside of the slowness is predictability: the process rarely changes shape mid-way, feedback is structured, and offers come out close to the published band without theatrics.",
        },
        { t: "h", text: "What they screen for specifically" },
        {
          t: "list",
          items: [
            "**Working code over clever code.** In machine coding a GCC panel will reward a plain, complete, working solution over an elegant half-finished abstraction. Ship the feature, then refactor if time remains.",
            "**Stability.** GCCs care about tenure more than product companies do, and this is a real advantage for you: 2 years 9 months at Jio plus 2 years at Algonauts plus 2 years at Ugam reads as someone who stays and finishes things. Do not apologise for the Mobile Programming to Jio transition — the conversion *to* payroll is the story, and it reads as retention, not churn.",
            "**Process maturity.** Jest, React Testing Library, Playwright, Docker, Azure DevOps CI/CD, thirty reviews a sprint, multiple production deploys per week. GCCs value this vocabulary highly because they run large, long-lived codebases with many contributors.",
            "**Accessibility and internationalisation.** Retail GCCs serve global consumers and are subject to real accessibility obligations. Semantic HTML, ARIA where necessary, keyboard navigation and focus management should appear in your design answers unprompted. Very few candidates raise them, which makes it a cheap differentiator.",
            "**Collaboration over brilliance.** \"Would this person work well across ten teams and three time zones\" is genuinely a scoring criterion. Your cross-team API contract story is built for this.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The one thing that will fail you here",
          text: "Running out of time in machine coding with nothing that works. GCC panels use a functionality checklist, and a beautifully structured application that does not render a filtered table scores below a scruffy one that does. Build the vertical slice first — render, then interact, then edge cases, then polish — and commit to that order before you write a line.",
        },
        { t: "h", text: "How to play this track" },
        {
          t: "list",
          items: [
            "**Apply first, on day 8.** These are your highest-probability offers and the slowest processes, so they need the longest runway.",
            "**Lead with retail in every touchpoint.** Your CV summary, your LinkedIn headline, your first thirty seconds in the recruiter screen. \"Senior frontend engineer, enterprise retail inventory systems at scale\" is a much stronger opening than \"React developer with 7 years experience\".",
            "**Apply to three or four of them, not one.** Their processes are similar enough that preparation transfers completely, and offers arriving in the same window is exactly the leverage the previous module described.",
            "**Negotiate the level, then the number.** At a GCC, level determines band. Argue senior or IC3 equivalent on the strength of architecture ownership and team leadership *before* the HR conversation.",
            "**Use referrals.** Walmart, Target and Lowe's referral pipelines move materially faster than the careers portal.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "GCCs are your best lane because retail domain experience is a direct, uncommon match — not a transferable-skills story.",
            "Five stages; machine coding is the filter that decides. Prioritise it accordingly.",
            "4-6 weeks means apply on day 8, not day 29.",
            "Working code beats clever code. Build the vertical slice first.",
            "Argue level before number. Raise accessibility unprompted. Lead with retail everywhere.",
          ],
        },
      ],
    },

    {
      id: "l2",
      level: "core",
      minutes: 18,
      title: "Track 2 — Product companies, and why not in week 1",
      summary:
        "Flipkart, Swiggy, Razorpay, PhonePe, Zeta, Navi, CRED, Meesho, Groww. 32-50 LPA, a six-stage process with a bar raiser, one shot per company for 6-12 months, and why your Kafka and SSE work plays unusually well here.",
      blocks: [
        {
          t: "p",
          text: "This is where the money is and where the bar is highest. Indian product companies pay 32 to 50 LPA fixed for a strong senior frontend engineer, often with meaningful equity on top, and they hire hard: harder DSA than GCCs, more demanding machine coding, a genuine frontend system design round, deep JavaScript internals, and a bar raiser whose job is explicitly to say no.",
        },
        {
          t: "table",
          head: ["Company", "Locations", "Fixed band (~7 yrs)", "Notes"],
          rows: [
            ["**Flipkart**", "Bengaluru", "36-50 LPA", "Hardest bar of the group. Strong frontend org. SDE-3 is your target level"],
            ["**Swiggy**", "Bengaluru", "34-48 LPA", "Excellent frontend engineering, real-time systems focus — your SSE work fits"],
            ["**Razorpay**", "Bengaluru", "34-46 LPA", "Very strong frontend culture, heavy design-system and dashboard work"],
            ["**PhonePe**", "Bengaluru", "34-48 LPA", "Scale-obsessed. Expect performance questions at depth"],
            ["Zeta", "Bengaluru, Hyderabad", "32-45 LPA", "Banking tech, complex enterprise UI. Underrated and less competitive"],
            ["Navi", "Bengaluru", "32-44 LPA", "Fast-moving, high ownership expectation"],
            ["CRED", "Bengaluru", "35-50 LPA", "High bar, strong craft focus. Design sensibility is genuinely assessed"],
            ["Meesho", "Bengaluru", "32-46 LPA", "E-commerce; your retail domain transfers directly"],
            ["Groww", "Bengaluru", "32-44 LPA", "Fintech dashboards, real-time data — your Algonauts trading work fits well"],
          ],
        },
        { t: "h", text: "The process" },
        {
          t: "steps",
          items: [
            {
              title: "1. DSA screen — 60 minutes, live, harder than GCC",
              text: "One or two mediums, occasionally a medium-hard, with a live interviewer rather than an automated assessment. Flipkart and PhonePe are the strictest. This is where the four-phase narration protocol matters — the interviewer is scoring your reasoning, not just the final code.",
            },
            {
              title: "2. Machine coding — 90-120 minutes",
              text: "Harder and more open-ended than GCC. Expect a substantial component or mini-app with explicit extensibility expectations: a virtualised table, a form engine driven by a JSON schema, a real-time dashboard, an infinite feed with optimistic updates. They will ask you to extend it in the last ten minutes to test whether your abstraction actually holds.",
            },
            {
              title: "3. Frontend system design — 60 minutes",
              text: "Design a real product surface: the Swiggy order-tracking screen, a Flipkart product listing page, a live payment dashboard. State management, data fetching and caching, real-time transport, offline behaviour, performance budgets, error boundaries, feature flags, monitoring. They want trade-offs, and they will push on the ones you did not name.",
            },
            {
              title: "4. Deep React and JavaScript internals — 60 minutes",
              text: "Event loop, closures, prototypes, reconciliation, batching, concurrent rendering, Suspense, hydration, the difference between useMemo and useCallback and what each actually costs. This is the module 1 material at full depth. Expect to be asked to implement a hook or a small utility live.",
            },
            {
              title: "5. Bar raiser — 45-60 minutes",
              text: "A senior engineer or manager from outside the hiring team, empowered to reject regardless of the other rounds. Mostly behavioural and judgement: architectural decisions you have made and why, disagreements, failure, what you would build differently. Your story bank is the entire preparation for this round.",
            },
            {
              title: "6. HR and compensation",
              text: "Product-company negotiation is more flexible than GCC negotiation and more responsive to competing offers. This is the track where the material in the previous module earns the most.",
            },
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "Do not apply here in week 1",
          text: "Most of these companies enforce a **6 to 12 month cooling-off period** after a rejection. You get one attempt per company, and burning Flipkart in week 1 with unsharpened machine coding costs you that company for a year. Sequence deliberately: GCCs and less competitive product companies first, your top two or three product targets **last**, once machine coding is genuinely sharp and you have been through four or five real loops. Interview reps are not transferable from mock sessions; the first two real loops are always worse than the ones after.",
        },
        { t: "h", text: "What they screen for that GCCs do not" },
        {
          t: "list",
          items: [
            "**Depth over breadth.** A GCC panel is satisfied that you know React works. A Flipkart panel wants to know why your fix worked at the reconciler level. Be able to go two questions deeper than you think necessary on anything on your CV.",
            "**Real-time and scale.** This is where your Jio work is unusually strong. Replacing a 15-minute batch with **Kafka plus SSE at under 5 seconds** is exactly the kind of production experience these teams value, and very few frontend candidates have it. Know why SSE over WebSockets — one-directional server push, plain HTTP so it survives corporate proxies, native auto-reconnect, cheaper to operate — and how you handled reconnection, missed events and backpressure on the client.",
            "**Product sense.** They will ask what you would change about the feature you just designed, or what you would cut to ship in half the time. Having an opinion, and a reason, is scored.",
            "**Extensibility under time pressure.** The last-ten-minutes extension in machine coding is the real test. Design your component boundaries so that adding a column type or a new filter is a small change, and say out loud where you left the seams.",
            "**Ownership at senior scope.** Your four-engineer team and your architecture ownership map straight onto their SDE-3 expectations.",
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Levelling: their SDE-2 is roughly your current scope",
          text: "This is the most consequential single fact in this lesson. At Flipkart, Swiggy and PhonePe, SDE-2 is a strong individual contributor executing well-scoped features — approximately what you do minus the architecture ownership and the team. **SDE-3 is your target**, and it is the level where 40-plus LPA lives. Say it explicitly to the recruiter in the first call: \"I am interviewing for SDE-3 or the senior equivalent — I own frontend architecture and lead a team of four, so SDE-2 would be a lateral move on scope.\" Level is set at the start of a process and is very hard to move later.",
        },
        { t: "h", text: "How to play this track" },
        {
          t: "list",
          items: [
            "**Sequence them last.** Apply to Zeta, Groww, Navi and Meesho earlier as calibration; save Flipkart, Swiggy, Razorpay and CRED for after you have real loops behind you.",
            "**Get a referral or do not bother.** Product-company inbound volume is enormous and the careers portal is close to a black hole at senior level. A referral from a current employee is the difference between a reply and silence.",
            "**Lead with real-time and scale, not retail.** Different pitch from the GCC one: 12,000 daily users, 50,000-row views, Kafka and SSE under 5 seconds, 8 seconds to 3. Retail is the context here, not the headline.",
            "**Over-prepare the JS internals round.** It is the most mechanically predictable round in the whole campaign and therefore the cheapest to win.",
            "**Expect to fail one.** Getting a no from Flipkart is not a verdict on your ability; the bar is genuinely high and the process is noisy. It is a reason to have five processes running, not a reason to lower your number.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Best comp, hardest bar. 32-50 LPA fixed, six stages, and a bar raiser whose job is to reject.",
            "One shot per company for 6-12 months. Sequence your top targets last, deliberately.",
            "Target SDE-3, and say so in the first recruiter call. Their SDE-2 is roughly your current scope.",
            "Your Kafka and SSE production experience is rare in frontend candidates. Lead with it here.",
            "Referral or nothing. The portal does not work at this level.",
          ],
        },
      ],
    },

    {
      id: "l3",
      level: "core",
      minutes: 16,
      title: "Track 3 — Late-stage and funded startups",
      summary:
        "30-45 LPA plus equity, fewer rounds, faster decisions, and a real due-diligence checklist: funding stage and recency, runway, the reaction to the runway question, and why you negotiate on cash.",
      blocks: [
        {
          t: "p",
          text: "Startups are the fastest track and the one where your capstone project matters most. Fewer rounds, more practical assessment, decisions in days rather than weeks. Bands run roughly **30 to 45 LPA fixed plus equity**, and the equity is where the distribution gets very wide — occasionally life-changing, frequently worth nothing. You are not looking for a lottery ticket; you are looking for scope and a good number, from a company that will still exist in three years.",
        },
        { t: "h", text: "The process, which is shorter and more practical" },
        {
          t: "steps",
          items: [
            {
              title: "1. Founder or engineering-lead call — 30-45 minutes",
              text: "Often the very first round, and unusually it is a two-way sell. They will pitch you. Come with real questions; this is the round where your due diligence happens naturally rather than awkwardly.",
            },
            {
              title: "2. Take-home or live build — 2-4 hours",
              text: "More common here than anywhere else, and it is where your capstone project pays for itself. If a take-home is offered and you already have a strong, deployed, well-README'd project, ask whether it can substitute. Many will accept, and it saves you a weekend while showing more than a scoped exercise would.",
            },
            {
              title: "3. Technical deep dive — 60-90 minutes",
              text: "Usually with the person who will be your peer or lead. Practical and architecture-focused rather than algorithmic: how you would structure their frontend, what you would change about their current stack, how you have handled a specific problem they have right now.",
            },
            {
              title: "4. Culture and founder round, then offer",
              text: "Fast. Offers frequently arrive within 48 hours of the last round, which is a scheduling problem for your leverage strategy — a fast startup offer with a 5-day expiry while GCC loops are still in round three is the classic squeeze. Manage it by asking for time and by getting your other processes moving early.",
            },
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "Your capstone is the differentiator here",
          text: "GCC and product panels barely look at side projects — they have structured rounds for everything. Startups genuinely do look, because they are hiring for immediate practical output. A deployed capstone with a clean README, a stated architecture decision log, tests, and a live URL is worth more in this track than any credential. Make sure it is linked at the top of your CV, not buried at the bottom.",
        },
        { t: "h", text: "Due diligence — this is the part candidates skip" },
        {
          t: "p",
          text: "You want the stable ones. \"Startup\" spans a Series D company with four years of runway and a Series A company that will run out of money in seven months, and the interview process feels identical from the outside. Do the checks before the final round, not after the offer.",
        },
        {
          t: "table",
          head: ["Check", "Where to find it", "The bar"],
          rows: [
            ["Funding stage", "Crunchbase, Tracxn, press coverage", "**Series C or later** for a reasonable risk profile"],
            ["Last round amount and date", "Crunchbase, Entrackr, TechCrunch", "**Within the last 18 months.** Anything older needs explaining"],
            ["Headcount trend", "LinkedIn company page, 6- and 12-month change", "Growing or flat. A visible contraction is a real signal"],
            ["Recent layoffs", "Layoffs.fyi, news search, Blind", "None in 12 months, or a credible explanation"],
            ["Revenue and unit economics", "Ask directly in the founder round", "They should be able to answer specifically"],
            ["Attrition in engineering", "LinkedIn: who left in the last year and after how long", "Several senior exits inside 18 months is a warning"],
            ["Who is on the cap table", "Crunchbase", "Tier-one investors reduce, but do not remove, the risk"],
          ],
        },
        { t: "h", text: "Ask about runway directly — and watch the reaction" },
        {
          t: "p",
          text: "Candidates are squeamish about this and should not be. You are being asked to take career risk; asking about the risk is proportionate, and any founder worth working for expects it from a senior hire. Phrase it as a professional question rather than an accusation.",
        },
        {
          t: "note",
          tone: "interview",
          title: "The script, and what to listen for",
          text: "\"Since I would be joining as a senior hire, I want to understand the business the way you do. Could you tell me about the current runway and the path to profitability?\" A good answer is specific: \"We raised 40 million in the Series C fourteen months ago, we have about 28 months of runway at current burn, and we expect to be contribution-margin positive by Q3.\" A bad answer is a deflection — \"we are very well funded\", \"that is a bit above your level\", or visible irritation. **The reaction tells you as much as the content.** A founder who is annoyed by a proportionate question from a senior candidate is showing you how disagreement will go once you have joined.",
        },
        { t: "h", text: "Equity — treat it as upside, negotiate on cash" },
        {
          t: "list",
          items: [
            "**Never trade fixed cash for equity.** A 3 lakh reduction in base to get more ESOPs is a bad trade on expected value at almost every startup, and it permanently lowers the anchor for your next role.",
            "**Get the numbers that make equity legible:** how many units, the current fair market value or preferred price, total shares outstanding (so you can compute your actual percentage), the strike price, and the last round's valuation. If they will not share the denominator, the grant is unquantifiable and you should treat it as worth zero for decision purposes.",
            "**Understand the vesting schedule.** Four years with a one-year cliff is standard. Anything longer, or back-weighted vesting, or a cliff over a year, is worse than it looks.",
            "**Ask about liquidity.** Has there been a buyback? Is there a secondary market? Indian ESOPs at private companies are frequently illiquid for many years, and the tax treatment at exercise can be genuinely painful.",
            "**ESOP versus RSU.** RSUs at a listed company are near-cash. Private-company ESOPs are an option to buy something you cannot sell. Do not let a recruiter present them as equivalent.",
          ],
        },
        { t: "h", text: "How to play this track" },
        {
          t: "list",
          items: [
            "**Use them as calibration early, and as leverage later.** Their speed is the feature: a startup offer in week 3 is exactly the credible alternative that moves a GCC or product number in week 5.",
            "**Ask for the same level of scope you already have,** in writing. Titles at startups are cheap and inconsistent; \"you will own the frontend architecture and the hiring of two engineers\" in an email is worth more than a Staff title.",
            "**Be honest with yourself about risk appetite.** You have a stable 24 LPA job. A 33 LPA offer from a Series B company with 11 months of runway is not a 9 lakh raise, it is a bet. If the answer is no, decline early and stop spending rounds on it.",
            "**Watch for the fast-offer squeeze** and ask for time explicitly: \"I have processes concluding on the 14th and I want to give this a proper decision — can we agree the 15th?\" This is a normal request and is usually granted.",
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "30-45 LPA plus equity, fewer rounds, decisions in days. Your capstone matters most in this track.",
            "Series C or later, funded within 18 months, headcount flat or growing. That is the stability bar.",
            "Ask about runway and profitability directly. The reaction is as informative as the answer.",
            "Negotiate on fixed cash. Get the share denominator or treat the equity as zero.",
            "Their speed is your leverage — a week-3 startup offer improves your week-5 GCC number.",
          ],
        },
      ],
    },

    {
      id: "l4",
      level: "advanced",
      minutes: 22,
      title: "Running the campaign",
      summary:
        "Sequencing across the 28-day sprint, referrals as the highest-conversion channel, a pipeline discipline, recruiter-screen scripts including current CTC, running parallel processes so offers land together, evaluating an offer beyond the number, and the resignation conversation.",
      blocks: [
        {
          t: "p",
          text: "Everything so far has been preparation. This lesson is operations, and it is where most well-prepared candidates lose money — not by interviewing badly but by starting late, applying through the wrong channel, and receiving three offers three weeks apart so that none of them can be used against the others.",
        },
        { t: "h", text: "Start applying on day 8, not day 29" },
        {
          t: "p",
          text: "The instinct is to prepare fully and then apply. That instinct will cost you weeks and lakhs. A first screen takes **2 to 3 weeks** to convert into a later round, and a GCC loop runs 4 to 6 weeks end to end. If you apply on day 29 of a 28-day sprint, your first onsite is in mid-November and you have spent a month of readiness sitting on the shelf. Applications and preparation must run **concurrently**, with the sequencing doing the risk management instead.",
        },
        {
          t: "table",
          head: ["Days", "Apply to", "Why now"],
          rows: [
            ["**1-7**", "Nothing. Sharpen machine coding. Ask for referrals", "Referral requests take a week to convert into a recruiter call anyway"],
            ["**8-12**", "3-4 GCCs (Walmart, Target, Lowe's, Albertsons)", "Slowest processes, highest probability. They need the longest runway"],
            ["**8-12**", "2-3 startups", "Fast processes give you real interview reps and early leverage"],
            ["**13-18**", "Mid-tier product (Zeta, Groww, Navi, Meesho, Tesco)", "Calibration against the product-company bar with less at stake"],
            ["**19-24**", "Top product (Flipkart, Swiggy, Razorpay, PhonePe, CRED)", "By now you have 4-5 real loops behind you and machine coding is sharp"],
            ["**25-28+**", "Backfill anything that went quiet, and re-sequence", "Pipelines leak. Assume 40-50% of applications never produce a screen"],
          ],
        },
        {
          t: "note",
          tone: "insight",
          title: "The sequencing rule in one line",
          text: "**Apply in increasing order of how much you want the job.** Your first two real loops will be your worst regardless of how much you have practised, because live interviewing is a distinct skill from solving problems. Spend those two on companies you can afford to lose, and remember that the top product companies lock you out for 6-12 months after a no.",
        },
        { t: "h", text: "Referrals — by far the highest-conversion channel" },
        {
          t: "p",
          text: "A cold portal application at senior frontend level converts to a recruiter screen at something like 5 to 10 percent. A referral converts at 40 to 60 percent. That is not a marginal improvement, it is a different game, and it means an hour spent finding referrers is worth more than a day spent filling in application forms.",
        },
        {
          t: "steps",
          items: [
            {
              title: "Find the right person",
              text: "LinkedIn search: your target company, filter to frontend or SDE roles, and prioritise second-degree connections, Vidyalankar alumni, ex-Jio or ex-Ugam or ex-Algonauts colleagues, and anyone from your Mumbai frontend circles. A weak tie in the right team beats a strong tie in an unrelated one.",
            },
            {
              title: "Make the ask small and specific",
              text: "Never \"can you refer me\" as an opening. Ask for the smallest thing that helps: the job ID, whether the team is actually hiring, or a fifteen-minute call. People say yes to small asks and go quiet on large ones.",
            },
            {
              title: "Give them everything they need in one message",
              text: "Referral forms ask for a role link, your CV and a two-line reason. Supply all three unprompted so that referring you takes them ninety seconds. Making it effortless is most of the skill.",
            },
            {
              title: "Make it easy to say no",
              text: "\"If you would rather not refer someone you have not worked with directly, that is completely fine — even just confirming the team is hiring would help.\" This removes the social cost and paradoxically increases the yes rate.",
            },
            {
              title: "Follow up once, then stop",
              text: "One nudge after five days. Never a second. Then thank them regardless of the outcome, and tell them how it went — that is what makes the second referral, eighteen months from now, easy to ask for.",
            },
          ],
        },
        {
          t: "note",
          tone: "interview",
          title: "The referral message — copy this shape",
          text: "\"Hi [Name] — I am a senior frontend engineer at Reliance Jio, currently owning the frontend architecture of an enterprise inventory platform serving 12,000 daily users across 1,900 stores. I noticed [Company] has an opening for [Role] on the [Team] team (JR-12345). Given your retail systems work I thought it might be a genuine fit. Would you be open to referring me? My CV is attached, and here is the two-line summary for the form: [two lines]. Completely understand if you would rather not refer someone you have not worked with — even confirming whether the team is actively hiring would be a real help. Thanks either way.\" Short, specific, effortless to action, easy to decline.",
        },
        { t: "h", text: "Pipeline discipline" },
        {
          t: "p",
          text: "Running eight to twelve processes concurrently without a tracker means missed follow-ups, forgotten recruiter names and — the expensive one — no visibility into when offers will land. A single spreadsheet, updated the same day as every interaction, is the whole discipline.",
        },
        {
          t: "table",
          head: ["Column", "Why it earns its place"],
          rows: [
            ["Company, role, level applied for", "Level is the thing you will need to defend later. Record what you asked for"],
            ["Channel (referral name / portal / recruiter inbound)", "Tells you which channel is actually working, so you can double down"],
            ["Date applied, date of each round", "Lets you forecast the offer window — the core purpose of the tracker"],
            ["Current stage and next action **with a date**", "A stage without a dated next action is a stalled process you have not noticed"],
            ["Recruiter name, email, phone", "You will be juggling ten of them. Names matter"],
            ["Stated band, if disclosed", "Your negotiation input, and your evidence for the market rate"],
            ["Predicted offer date", "**The most important column.** This is how you engineer offers into one window"],
            ["Notes: who you met, what they pushed on", "Panel questions repeat across rounds. Also makes thank-you notes specific"],
          ],
        },
        { t: "h", text: "The recruiter screen — the 20 minutes that gates everything" },
        {
          t: "p",
          text: "A recruiter screen is short, scripted and easy to underestimate. Three things get decided in it: whether you proceed, at **what level**, and what band you are slotted into. Getting the level wrong here is very expensive and nearly impossible to correct later.",
        },
        {
          t: "steps",
          items: [
            {
              title: "The 30-second pitch, and lead with the right thing",
              text: "\"I am a senior frontend engineer with 7 years experience, currently SDE-2 at Reliance Jio where I own the frontend architecture of an enterprise inventory platform — 12,000 daily users, 1,900 stores, six retail brands. I lead a team of four engineers. Before Jio I built a trading simulator end to end at Algonauts and grew that team from one to three.\" For a GCC, put retail scale first. For a product company, put real-time and performance first.",
            },
            {
              title: "State the level you are interviewing for, unprompted",
              text: "\"I am looking at senior frontend or SDE-3 level roles — I own architecture and lead a team, so an SDE-2 role would be a lateral move on scope.\" Say this in the first call, every time. Levels are assigned early and defended stubbornly.",
            },
            {
              title: "Handle \"what is your current CTC\"",
              text: "\"My current fixed is 24 lakh. That reflects an SDE-2 band at my current employer rather than the scope I am carrying, so my expectation is based on the role rather than a percentage over my current.\" Truthful — it gets verified at offer stage — but it breaks the current-plus-30-percent anchor immediately.",
            },
            {
              title: "Handle \"what are your expectations\"",
              text: "Deflect once: \"I would rather understand the role and level first, and I am sure you have a band — if you can share it, I can tell you straight away whether we are aligned.\" If pushed, the anchor script: 35 lakh fixed, stated as a fact, then stop talking.",
            },
            {
              title: "Raise the notice period yourself",
              text: "\"One thing to flag early: my notice is up to 90 days and I will push for a buyout or earlier release. Better we know now than in four weeks.\" Early it is logistics; late it looks concealed.",
            },
            {
              title: "Close with logistics",
              text: "Ask the process shape, how many rounds, the expected timeline, and whether they can send the machine-coding format in advance. Then confirm the next step in writing the same day. Recruiters manage forty candidates; the one who is easy to schedule moves faster.",
            },
          ],
        },
        { t: "h", text: "Running processes in parallel so offers land together" },
        {
          t: "p",
          text: "This is the mechanism that converts good interviewing into a good number, and it is almost entirely a scheduling exercise. The target is **three or more offers inside a two-week window**. Two levers get you there: staggering the start dates by process length, and actively managing pace once loops are running.",
        },
        {
          t: "list",
          items: [
            "**Stagger by expected duration.** GCCs take 4-6 weeks, product companies 3-5, startups 1-2. Starting them all on day 8 produces offers spread across a month. Start GCCs first, product companies a week later, startups last — that is the reverse of the calibration ordering, so balance the two by using *mid-tier* product companies and *early* startups for calibration and holding your top targets back.",
            "**Slow a fast process politely.** \"I am mid-process with a couple of other companies and would like to give this a proper decision — could we schedule the final round for the week of the 12th?\" Nobody minds. Recruiters do this constantly themselves.",
            "**Accelerate a slow one with a real reason.** \"I have another process concluding on the 14th and [Company] is genuinely my preference — is there any way to compress the remaining rounds?\" Companies do compress. They will not if you do not ask.",
            "**Never accept an offer while a preferred process is live** without first telling the preferred company you have an offer in hand. That single message is the highest-value thing you will send in the whole campaign, and it frequently produces both an accelerated loop and a better number.",
            "**Ask for time in writing.** A 48-hour expiry is a pressure tactic in the great majority of cases. \"I want to make a considered decision and I have a process concluding on the 14th — can we extend to the 15th?\" is a normal, professional request.",
          ],
        },
        {
          t: "note",
          tone: "warn",
          title: "The most common expensive mistake",
          text: "Accepting the first offer because the process was exhausting and the number felt like a relief. A single offer at 31 LPA with no alternatives is worth roughly 31 LPA. The same offer with two competing offers in hand is worth 34 to 36. The difference is three to five lakh a year, every year, compounding into every future negotiation — for perhaps two weeks of holding your nerve. Decide now that you will not accept the first offer without at least one other in hand, and write that decision down before you are tired.",
        },
        { t: "h", text: "Evaluating an offer beyond the number" },
        {
          t: "table",
          head: ["Dimension", "What to actually ask", "Weight"],
          rows: [
            ["**Manager**", "Who they are, their background, how long in the role. Ask for a call with them if you have not met", "**Highest.** The single largest determinant of the next two years"],
            ["**Scope**", "Architecture ownership? Team? Who decides what gets built?", "High — this is what you are moving for"],
            ["Team quality", "Who are the senior frontend engineers, how long have they stayed", "High. You improve fastest next to people better than you"],
            ["Tech and codebase", "TypeScript coverage, test setup, deploy cadence, tech debt honesty", "Medium-high. Ask about the debt; the candour is the signal"],
            ["Growth path", "Who was promoted from this level recently, and how", "Medium-high. Your next level matters more than this offer"],
            ["Compensation", "Fixed, variable and its real payout, equity, bonus", "High but not sole. Fixed is what compounds"],
            ["Stability", "Funding or parent-company health, recent layoffs", "Medium for GCCs, high for startups"],
            ["Location and mode", "Bengaluru or Hyderabad relocation, days in office, relocation support", "Practical, and easy to forget until it is a problem"],
          ],
        },
        {
          t: "p",
          text: "If two offers are within about 3 lakh of each other, take the one with the better manager and the wider scope. That gap closes at your next negotiation; a bad manager or a narrowed scope costs you two years of progression, which is worth far more than 3 lakh.",
        },
        { t: "h", text: "Resignation and the notice period" },
        {
          t: "steps",
          items: [
            {
              title: "Signed letter first. Always",
              text: "Do not resign on a verbal offer, a phone call, or an email saying they are excited to proceed. Background verification should ideally be underway too. This rule has no exceptions.",
            },
            {
              title: "Tell your manager before anyone else, in a call",
              text: "Not on a group thread, not by letter first, not after HR knows. \"I wanted to tell you directly before it goes anywhere else: I have accepted a senior frontend role at another company. I have genuinely valued working with you and I want to hand over properly.\" Short, warm, decided.",
            },
            {
              title: "Handle the counter-offer with a decision, not a debate",
              text: "Jio may counter, especially since you lead a team. Know your answer beforehand: if you are leaving for scope and for frontend as a first-class discipline, money does not solve it, and saying so respectfully is the cleanest exit. If a counter would genuinely change your mind, be honest with yourself about that now rather than mid-conversation.",
            },
            {
              title: "Push the buyout and release date in parallel",
              text: "Ask Jio HR about the shortest release they will accept and what a buyout costs. Ask your new employer about buyout reimbursement or a bridging joining bonus. Run both conversations at once — sequentially it takes twice as long and you may miss the start date.",
            },
            {
              title: "Hand over properly. Your reputation follows you",
              text: "Documentation, a handover doc per portal, walkthroughs for your four engineers, and a clean list of open threads. Indian frontend hiring is a small world and your Jio colleagues will be your referrers, your peers and possibly your interviewers within five years. A good last month is a genuinely valuable asset.",
            },
          ],
        },
        { t: "h", text: "What to take away" },
        {
          t: "list",
          items: [
            "Apply from day 8. Screens take 2-3 weeks to convert and GCC loops take 4-6. Preparation and applications run concurrently.",
            "Apply in increasing order of desire. Your first two real loops are your worst, and top product companies lock you out for 6-12 months.",
            "Referrals convert at 40-60 percent versus 5-10 for the portal. Make the ask small, complete and easy to decline.",
            "Track predicted offer dates. Actively slow the fast processes and accelerate the slow ones.",
            "Never accept the first offer without another in hand. That nerve is worth 3-5 lakh a year, forever.",
            "Within 3 lakh, take the better manager and the wider scope.",
            "Signed letter before resignation. Manager first. Run buyout and release in parallel. Hand over well.",
          ],
        },
      ],
    },
  ],

  theory: [
    "Explain why GCCs are your strongest track using a specific domain argument rather than a generic skills one.",
    "Name the five GCC process stages in order and identify which one actually decides the offer.",
    "Explain why working code beats clever code in a GCC machine coding round.",
    "Explain why you should not apply to Flipkart, Swiggy or Razorpay in week 1.",
    "Explain how a product company's SDE-2 maps to your current scope and why SDE-3 is the correct target.",
    "Explain why SSE rather than WebSockets for the Jio real-time layer, and how you handled reconnection and missed events.",
    "State the stability bar for a startup: funding stage, recency, headcount trend and layoff history.",
    "Deliver the runway question in a way a founder will respect, and describe what a bad answer looks like.",
    "Explain why you never trade fixed cash for equity, and what numbers make an ESOP grant quantifiable.",
    "Explain why applications must start on day 8 rather than day 29, with the specific timings.",
    "State the sequencing rule and justify it in terms of interview reps and cooling-off periods.",
    "Give the referral conversion rate against portal conversion, and describe the five-step referral ask.",
    "Answer \"what is your current CTC\" truthfully while breaking the current-plus-30-percent anchor.",
    "Describe the two levers that get three offers into the same two-week window.",
    "Explain what an offer is worth with no alternatives versus with two competing offers, in rupees.",
    "Rank the eight offer-evaluation dimensions and justify putting manager first.",
    "Walk through the resignation conversation, including how you would handle a Jio counter-offer.",
  ],

  math: [
    {
      title: "Track comparison",
      formula: "GCC 28-42 LPA / 4-6 wks / predictable · Product 32-50 LPA / 3-5 wks / hardest bar · Startup 30-45 + equity / 1-2 wks / fastest",
      note: "Apply to all three. GCC is your highest-probability offer, product is your highest number, startup is your fastest source of leverage. The three are complementary, not alternatives.",
    },
    {
      title: "GCC process shape",
      formula: "OA (DSA, 2 problems) → machine coding [THE FILTER] → frontend system design + deep React → hiring manager → HR",
      note: "Walmart Global Tech, Target, Lowe's, Wayfair, Tesco, Amex, Albertsons. Screens for working code, stability, process maturity, accessibility and collaboration. Argue level before number — at a GCC the band follows the level mechanically.",
    },
    {
      title: "Product process shape",
      formula: "DSA screen (live, harder) → machine coding (open-ended + extension) → frontend system design → deep React/JS internals → bar raiser → HR",
      note: "Flipkart, Swiggy, Razorpay, PhonePe, Zeta, Navi, CRED, Meesho, Groww. One shot per company for 6-12 months. The bar raiser is empowered to reject regardless of everything else, and your story bank is the entire preparation for it.",
    },
    {
      title: "Startup due-diligence bar",
      formula: "Series C+ · last round within 18 months · headcount flat or growing · no layoffs in 12 months · specific answer on runway",
      note: "Crunchbase and Tracxn for funding, LinkedIn headcount trend for momentum, layoffs.fyi for the obvious. Ask about runway and profitability directly; the founder's reaction to a proportionate question is data about how disagreement will go later.",
    },
    {
      title: "Application sequencing across 28 days",
      formula: "d1-7 sharpen + request referrals · d8-12 GCCs + startups · d13-18 mid-tier product · d19-24 top product · d25+ backfill",
      note: "Apply in increasing order of how much you want the job. First screens take 2-3 weeks to convert and GCC loops run 4-6 weeks, so day 29 is a month too late. Assume 40-50% of applications never produce a screen.",
    },
    {
      title: "Referral conversion",
      formula: "portal ~5-10% to a screen · referral ~40-60% — find person → small specific ask → supply everything → make no easy → one follow-up",
      note: "An hour finding referrers beats a day filling forms. Second-degree connections, Vidyalankar alumni, ex-Jio, ex-Ugam, ex-Algonauts. A weak tie on the right team beats a strong tie elsewhere.",
    },
    {
      title: "The referral message",
      formula: "\"I am a senior frontend engineer at Reliance Jio owning frontend architecture for a platform with 12,000 daily users across 1,900 stores. I noticed [Company] has an opening for [Role] (JR-12345). Would you be open to referring me? CV attached, two-line summary below. Completely understand if you would rather not refer someone you have not worked with — even confirming the team is hiring would help.\"",
      note: "Short, specific, effortless to action, easy to decline. Never open with \"can you refer me\" and no context. One follow-up after five days, never two.",
    },
    {
      title: "Recruiter-screen pitch",
      formula: "\"Senior frontend engineer, 7 years, currently SDE-2 at Reliance Jio owning the frontend architecture of an enterprise inventory platform — 12,000 daily users, 1,900 stores, six retail brands. I lead a team of four.\" → \"I am interviewing at senior / SDE-3 level; SDE-2 would be a lateral move on scope.\"",
      note: "Lead with retail scale for GCCs, with real-time and performance for product companies. State the level unprompted in the first call — levels are assigned early and moved almost never.",
    },
    {
      title: "Current-CTC de-anchor",
      formula: "\"My current fixed is 24 lakh. That reflects an SDE-2 band at my current employer rather than the scope I am carrying, so my expectation is based on the role rather than a percentage over my current.\"",
      note: "Always truthful — payslips are verified at offer stage. But say the second sentence in the same breath, or the whole negotiation gets framed as current + 30%.",
    },
    {
      title: "Parallel-process management",
      formula: "target 3+ offers in one 2-week window · slow the fast: \"could we schedule the final round for the week of the 12th?\" · speed the slow: \"I have a process concluding on the 14th and you are my preference — can we compress?\"",
      note: "Track a predicted offer date per company; it is the most valuable column in the tracker. An offer with no alternative is worth its face value; the same offer against two others is worth 3-5 lakh more.",
    },
    {
      title: "Offer evaluation weights",
      formula: "manager > scope ≈ team quality > comp (fixed) ≈ growth path > tech/codebase > stability > location — within 3 lakh, take manager + scope",
      note: "Comp gaps close at the next negotiation; a bad manager or narrowed scope costs two years of progression. Ask for a call with the manager before signing if you have not already met them.",
    },
    {
      title: "Resignation sequence",
      formula: "signed letter (+ BGV underway) → manager first, by call → counter-offer answered with a decision not a debate → buyout and release negotiated in parallel with the new employer → documented handover",
      note: "Never resign on a verbal offer. Run the Jio release conversation and the new employer's buyout reimbursement conversation simultaneously, or you lose weeks. Indian frontend hiring is small — your last month is a long-lived asset.",
    },
  ],

  practice: [
    { type: "theory", q: "Build the pipeline tracker today, with all eight columns including predicted offer date. Then fill in your twelve target companies." },
    { type: "theory", q: "Write two versions of your 30-second recruiter pitch: retail-scale-first for GCCs, real-time-and-performance-first for product companies." },
    { type: "theory", q: "List every second-degree LinkedIn connection at Walmart, Target, Lowe's, Flipkart, Swiggy, Razorpay and PhonePe. Rank by team relevance." },
    { type: "theory", q: "Send five referral messages using the template. Log the date and set a single five-day follow-up reminder for each." },
    { type: "theory", q: "Write your 28-day application calendar with specific companies against specific days, then commit to the day-8 start." },
    { type: "theory", q: "Run the full due-diligence checklist on three startups you would consider. Reject any that fail the Series C plus 18-month bar." },
    { type: "theory", q: "Roleplay the recruiter screen end to end with a friend, including current CTC, expectations, level and notice period. Twenty minutes, twice." },
    { type: "theory", q: "Rehearse the runway question aloud until it sounds like professional curiosity rather than an accusation." },
    { type: "theory", q: "Write your capstone README as if a startup CTO is the only reader: problem, architecture decisions, trade-offs, live URL, how to run it." },
    { type: "theory", q: "Rewrite your LinkedIn headline and CV summary to lead with enterprise retail frontend architecture at scale. Two versions if needed." },
    { type: "theory", q: "For each of your twelve targets, note the level you will ask for and the band you expect from Levels.fyi and AmbitionBox." },
    { type: "theory", q: "Draft the \"I have another offer in hand and you are my first choice\" email now, before you need it under time pressure." },
    { type: "theory", q: "Write the request-for-time email for a 48-hour offer expiry. Keep it to three sentences." },
    { type: "theory", q: "Build your offer-comparison sheet with the eight dimensions and explicit weights, before any offer exists." },
    { type: "theory", q: "Write your resignation script, including exactly what you will say if Jio counter-offers on money." },
    { type: "theory", q: "Decide and write down your walk-away number and your minimum acceptable level. Do not revisit either at 11pm after a rejection." },
  ],

  resources: [
    { label: "Levels.fyi India — levelled comp data for Flipkart, Swiggy, Walmart Global Tech, PhonePe and Razorpay. Check every target before its recruiter call.", url: "https://www.levels.fyi/t/software-engineer/locations/india", kind: "docs" },
    { label: "AmbitionBox — Indian salary and interview data by company, plus candidate write-ups of actual round structures. The best free source for process shape.", url: "https://www.ambitionbox.com/", kind: "docs" },
    { label: "Walmart Global Tech careers — apply directly and use it to find the exact team and job ID for a referral request.", url: "https://tech.walmart.com/content/walmart-global-tech/en_us/careers.html", kind: "docs" },
    { label: "Flipkart careers — read the frontend job descriptions closely; their SDE-2 and SDE-3 expectations are unusually explicit and tell you which level to ask for.", url: "https://www.flipkartcareers.com/", kind: "docs" },
    { label: "Crunchbase — funding stage, round size and date. Your first stop for the Series C plus 18-month stability check on any startup.", url: "https://www.crunchbase.com/", kind: "docs" },
    { label: "Tracxn — better Indian coverage than Crunchbase for domestic startups, including funding history and investor lists.", url: "https://tracxn.com/", kind: "docs" },
    { label: "Layoffs.fyi — check every startup and GCC before your final round. A layoff inside 12 months changes the negotiation entirely.", url: "https://layoffs.fyi/", kind: "docs" },
    { label: "Blind (teamblind) — unfiltered levelling equivalence and offer discussion for Indian tech. Use it for band ranges, not for individual claims.", url: "https://www.teamblind.com/", kind: "blog" },
    { label: "Entrackr — Indian startup funding and financials reporting. Useful for the revenue and burn questions you will ask a founder.", url: "https://entrackr.com/", kind: "blog" },
    { label: "GreatFrontEnd company guides — round-by-round breakdowns of frontend loops at specific companies. Read your target's guide the week before.", url: "https://www.greatfrontend.com/interviews", kind: "course" },
    { label: "Kalzumeus — \"Salary Negotiation\" by Patrick McKenzie. Re-read the section on competing offers before your first offer call, not after.", url: "https://www.kalzumeus.com/2012/01/23/salary-negotiation/", kind: "blog" },
  ],
};

export default p14;
