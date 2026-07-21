/* Feedback training (mini-class for leads), content. Nothing requires free text.
   Content strings as backticks (quotes/dashes safe).
   Rev: positive framing (strength over obstacle), corrected culture map, "Now you" exercise. */

export const LEITMOTIV = `High performance doesn't come from pressure, but from clarity and trust. Good feedback is both: it creates clarity and it proves trust.`;

export const HOOK = `Nobody wakes up in the morning thinking: "Today I hope for criticism." And yet the strongest teams in the world are exactly the ones who give each other the most feedback. Why? Because good feedback isn't an attack, it's an investment in the other person.`;

export interface Stat { big: string; text: string; source: string; }
export const STATS: Stat[] = [
  { big: "#1", text: `Google's "Project Aristotle" studied over 180 teams. The most important success factor wasn't talent, experience or intelligence, but psychological safety: being able to admit mistakes and speak openly, without fear.`, source: `Google · Project Aristotle` },
  { big: "+19%", text: `Teams with high psychological safety are more productive, more innovative (+31%) and have less turnover (−27%). Safety isn't a feel-good factor, it's a performance amplifier.`, source: `Analyses of the Aristotle data` },
  { big: "70%", text: `70% of the differences in team engagement trace back to the manager, above all to whether they give feedback and recognition regularly. As a lead, you have the biggest lever.`, source: `Gallup · State of the Global Workplace` },
  { big: "21%", text: `Worldwide, only around 21% of employees feel truly engaged. Missing or too-rare feedback is a main driver, an estimated $438 bn in lost productivity per year.`, source: `Gallup 2024` },
];

export const SOURCES = [
  "Psychological safety as the most important factor (180+ teams), Google, Project Aristotle (re:Work)",
  "+19% productivity, +31% innovation, −27% turnover, analyses of the Project Aristotle data",
  "70% of engagement variance driven by the manager, Gallup, State of the Global Workplace",
  "~21% global engagement, $438 bn loss, Gallup, State of the Global Workplace 2024",
];

export const INTRO_POINTS = [
  `Feedback is a gift, not an attack. Whoever gives feedback invests in the other person.`,
  `In strong teams, feedback is normal, frequent and mutual, not rare and feared.`,
  `The best teams in the world give each other MORE feedback, not less.`,
  `Goal: give feedback that lands and strengthens relationships instead of straining them.`,
];

export const CLOSING_STATEMENT = `Feedback isn't a risk to your team. It's what makes strong teams strong. Every piece of good feedback is a show of trust.`;

export const MAP_DISCLAIMER = `These are cultural average tendencies, not statements about individual people. Everyone is unique. Use it as awareness, not as a pigeonhole.`;

/* Self-check for the "Now you" exercise (purely client-side, no grading) */
export const SELF_CHECKS = [
  `Does your wording describe concrete behavior (instead of judging the person)?`,
  `Is there an impact or a suggestion in it?`,
  `Would you take it well yourself?`,
];

export interface Barrier { id: string; label: string; }
export const BARRIERS: Barrier[] = [
  { id: "harmony", label: `Give feedback without straining the relationship` },
  { id: "time", label: `Find and use the right moment` },
  { id: "reaction", label: `Handle reactions with confidence` },
  { id: "words", label: `Find the right words, concrete & appreciative` },
  { id: "fairness", label: `Make my feedback fair and understandable` },
  { id: "culture", label: `Adapt feedback in a culturally sensitive way` },
];

export interface PathOption { text: string; ok: boolean; fb: string; }
export interface Practice { scenario: string; sample: string; }
/* Each path teaches ONE idea (title/insight/takeaway) through a pool of scenario
   variants. One variant is served per day (rotation), so returning users see
   fresh situations and distractors instead of re-clicking a memorized answer. */
export interface PathVariant { scenario: string; options: PathOption[]; practice: Practice; }
export interface Path { title: string; insight: string; takeaway: string; variants: PathVariant[]; }

/** Today's variant of a path (rotates daily, same for the whole day). */
export const pathVariant = (p: Path): PathVariant => p.variants[Math.floor(Date.now() / 86400000) % p.variants.length];

export const PATHS: Record<string, Path> = {
  harmony: {
    title: `Harmony ≠ silence`,
    insight: `Withholding feedback protects the relationship short-term, but damages it long-term: expectations stay unspoken, frustration builds up, and the blow-up comes later and harder.`,
    takeaway: `"I noticed X. My impression is Y. What matters to me is …". Observation before judgment.`,
    variants: [
      {
        scenario: `A valued team member has been delivering reports with the same careless errors for 3 weeks. You like the person. What do you do?`,
        options: [
          { text: `Quietly fix it yourself to avoid hurting anyone.`, ok: false, fb: `Robs the person of growth, creates ongoing work for you. Silence isn't proof of kindness.` },
          { text: `Address it promptly, calmly and concretely, as support, not as an accusation.`, ok: true, fb: `Early, matter-of-fact feedback signals respect.` },
          { text: `Wait for the next review.`, ok: false, fb: `The pattern hardens, and the review feels like an ambush.` },
        ],
        practice: {
          scenario: `The same colleague again delivers a report with transposed numbers. Phrase your feedback promptly and as support.`,
          sample: `I noticed in the last few reports that transposed numbers keep slipping in. It matters to me that the reports hold up. Shall we take a quick look together at what's causing it?`,
        },
      },
      {
        scenario: `Your closest friend on the team keeps missing standup, and others are starting to comment on it. What do you do?`,
        options: [
          { text: `Make a light joke about it in the channel so it doesn't get heavy.`, ok: false, fb: `Public jokes are criticism in disguise. They sting and clarify nothing.` },
          { text: `Tell them privately and concretely, and offer to help figure out what's in the way.`, ok: true, fb: `Private, concrete and supportive. Friendship is a reason to speak up, not to stay silent.` },
          { text: `Stay out of it and hope the lead notices soon.`, ok: false, fb: `Outsourcing the conversation makes it bigger and colder than it needs to be.` },
        ],
        practice: {
          scenario: `Your friend missed standup for the third time this week. Write the private message you'd send.`,
          sample: `Hey, you've missed the last three standups and people are starting to notice. I'd rather tell you than have it come from someone else. Is something getting in the way? Happy to help.`,
        },
      },
      {
        scenario: `Your pairing partner pushes commits without tests, and you quietly add them afterwards. It's becoming routine. What do you do?`,
        options: [
          { text: `Keep quietly adding the tests, it keeps the peace.`, ok: false, fb: `You're building silent resentment and they don't even know there's a problem.` },
          { text: `Raise it in the next retro so the whole team can align on it.`, ok: false, fb: `Tempting, but a public first mention ambushes them. Retro works AFTER a private word.` },
          { text: `Say it directly with a concrete example and an offer to pair on the tests.`, ok: true, fb: `Direct, concrete, supportive. That's feedback as an investment.` },
        ],
        practice: {
          scenario: `You just added tests to their commit again. Phrase what you'd say in your next pairing session.`,
          sample: `I noticed I've been adding tests after your commits, like yesterday on the export fix. I'd rather we build them in together. Want to make it part of our pairing?`,
        },
      },
    ],
  },
  time: {
    title: `The moment doesn't come, you make it`,
    insight: `Feedback that waits for the perfect moment usually never comes. The bigger the gap from the event, the fuzzier and more contestable it gets.`,
    takeaway: `24-hour rule: address observed behavior within a day, briefly and in person.`,
    variants: [
      {
        scenario: `In a meeting you notice something you want to raise. When?`,
        options: [
          { text: `Note it and block 10 min for it today.`, ok: true, fb: `Timeliness + a fixed slot beats any "good moment" that never comes.` },
          { text: `Sometime, when things are calm.`, ok: false, fb: `"Sometime" is the graveyard of good feedback.` },
          { text: `At the next 1:1 in two weeks.`, ok: false, fb: `Too long for something fresh; 1:1s are for patterns, not current events.` },
        ],
        practice: {
          scenario: `In the meeting just now you noticed something. Write your note to yourself + the first sentence for today's conversation.`,
          sample: `Note: block 10 min with X today. Opener: "Something came up for me in the standup earlier. Do you have a moment?"`,
        },
      },
      {
        scenario: `Friday, 5pm: you spot a risky decision in a thread. Everyone's logging off. What do you do?`,
        options: [
          { text: `Reply now with a full analysis of everything that's wrong with it.`, ok: false, fb: `Prompt, yes, but a 5pm Friday essay lands on empty batteries. Timing includes the receiver's state.` },
          { text: `Send a short flag now: "I see a risk here, can we take 15 min Monday 10am?"`, ok: true, fb: `Timely AND humane: the concern is on record, the conversation gets a real slot.` },
          { text: `Let it rest, if it really is a problem it'll come up by itself.`, ok: false, fb: `Risks are cheapest when they're addressed before they happen.` },
        ],
        practice: {
          scenario: `Write the short Friday message that flags the risk and books the Monday slot.`,
          sample: `Quick flag before the weekend: I see a risk in the rollout decision (data migration). Nothing for tonight, but can we take 15 minutes Monday at 10? I'll bring a concrete suggestion.`,
        },
      },
      {
        scenario: `A colleague did something great on Tuesday. It's Thursday and you still haven't said anything. What now?`,
        options: [
          { text: `Save it for the next review, that makes it official and it counts more.`, ok: false, fb: `Close, but no: praise loses power with distance too. The review can repeat it, not replace it.` },
          { text: `Say it now, concretely, even if it's just a two-line message.`, ok: true, fb: `The 24-hour rule applies to praise as well. Late is still better than never.` },
          { text: `React with a 👍 on the original message and leave it at that.`, ok: false, fb: `An emoji says "seen", not "valued". Concrete words are the difference.` },
        ],
        practice: {
          scenario: `Write the two-line praise message you'd send today, concretely naming what they did.`,
          sample: `Still thinking about how you handled the client's pushback on Tuesday: you stayed calm and turned it into a requirements list. That changed the whole meeting. Wanted you to know.`,
        },
      },
    ],
  },
  reaction: {
    title: `Defuse defensiveness before it arises`,
    insight: `Defensiveness is usually protection, not stubbornness. It arises when feedback sounds like a verdict on the person instead of an observation about behavior.`,
    takeaway: `Observation (fact) → impact (your experience) → request (your ask), then openly ask for their perspective.`,
    variants: [
      {
        scenario: `You expect resistance. How do you open?`,
        options: [
          { text: `"You always …"`, ok: false, fb: `Generalizations trigger defense instantly.` },
          { text: `"I noticed in situation X … How do you see it?"`, ok: true, fb: `"I" message + a concrete situation + a real question = dialogue instead of a tribunal.` },
          { text: `"Don't take this personally, but …"`, ok: false, fb: `Almost guarantees it'll be taken personally.` },
        ],
        practice: {
          scenario: `You expect resistance. Phrase your opening sentence so it invites instead of attacks.`,
          sample: `I noticed in the demo yesterday that the client's question was left open. How did you experience the situation?`,
        },
      },
      {
        scenario: `Mid-conversation the person snaps: "So everything I do is wrong?" What now?`,
        options: [
          { text: `Back off: "No no, forget it, it's not a big deal."`, ok: false, fb: `Retreating teaches both of you that feedback isn't safe to give or get.` },
          { text: `Calmly narrow it down: "No. One concrete thing in the report, the rest is solid. Can we look at that one thing?"`, ok: true, fb: `Naming the real size of the issue is the fastest way out of catastrophizing.` },
          { text: `Repeat the criticism more firmly so it finally gets through.`, ok: false, fb: `Volume doesn't fix framing. More pressure means more armor.` },
        ],
        practice: {
          scenario: `Write the sentence that shrinks the feedback back to its real size after "so everything is wrong?".`,
          sample: `No, really not. Ninety percent of the report is strong. I'm talking about one thing, the missing sources on page 3. Can we look at just that?`,
        },
      },
      {
        scenario: `After your feedback the person goes completely silent. What do you do?`,
        options: [
          { text: `Soften it immediately: "It's honestly not that important, sorry."`, ok: false, fb: `Understandable, but taking it back confuses the message. Silence isn't automatically damage.` },
          { text: `Allow the pause, then ask openly: "How does that land with you?"`, ok: true, fb: `Silence is often processing. An open question makes room for their side without pressure.` },
          { text: `Fill the silence by moving quickly to the next agenda point.`, ok: false, fb: `Skipping past it leaves the feedback hanging awkwardly between you.` },
        ],
        practice: {
          scenario: `The pause has lasted ten seconds. Write what you say next.`,
          sample: `Take your time. I'm curious how that lands with you, and if I've got something wrong in there, I want to know.`,
        },
      },
    ],
  },
  words: {
    title: `Constructive means: concrete + forward-looking`,
    insight: `"Constructive" is substance, not packaging: concrete behavior instead of a character judgment, plus a clear way forward.`,
    takeaway: `Pattern: situation → behavior → impact → suggestion. No character labels.`,
    variants: [
      {
        scenario: `Which wording is constructive?`,
        options: [
          { text: `"Your presentation was unprofessional."`, ok: false, fb: `A blanket judgment, nothing to act on.` },
          { text: `"Slide 4 had three key figures without a source. Next time add where they're from, then the point really lands."`, ok: true, fb: `Concrete, verifiable, solution-oriented.` },
          { text: `"It was okay, but there's more in you."`, ok: false, fb: `Unspecific, ineffective.` },
        ],
        practice: {
          scenario: `A colleague ran a meeting and drifted off topic three times. The meeting ran over. Phrase your feedback.`,
          sample: `I noticed we drifted off the agenda item three times and ran 15 min over. For next time: shall we use a visible agenda with timeboxes? Then more of it sticks.`,
        },
      },
      {
        scenario: `A peer's code works, but it's hard to read and slows every review down. Which comment do you leave?`,
        options: [
          { text: `"This code is pretty messy, please clean it up."`, ok: false, fb: `"Messy" is a verdict, not a direction. What exactly should change?` },
          { text: `"Works! We can always refactor later if it becomes a problem."`, ok: false, fb: `Sounds generous, but postpones the feedback forever. "Later" rarely comes.` },
          { text: `"processOrder does three things at once, which makes the review slow. Splitting it into validate/save/notify would help a lot. Want me to sketch it?"`, ok: true, fb: `Concrete behavior, named impact, actionable suggestion, offered support.` },
        ],
        practice: {
          scenario: `Write the review comment for a function that mixes validation, saving and notification.`,
          sample: `processOrder currently validates, saves and notifies in one go, which makes it hard to test. Suggestion: split it into three small functions. Happy to pair on it if you like.`,
        },
      },
      {
        scenario: `You want to praise a colleague who saved a chaotic client call. Which wording works best?`,
        options: [
          { text: `"You're an absolute genius!"`, ok: false, fb: `Feels good for a second, but person-praise isn't repeatable. WHAT was genius?` },
          { text: `"Your summary at the end turned a messy discussion into three clear next steps. That saved the call."`, ok: true, fb: `Concrete behavior + named impact. Now they know exactly what to do again.` },
          { text: `"Thanks for everything you do!"`, ok: false, fb: `Warm but generic. It could be about anything, so it teaches nothing.` },
        ],
        practice: {
          scenario: `Think of something a colleague actually did well recently. Phrase the praise: behavior + impact.`,
          sample: `Your decision to demo the unfinished feature anyway gave the client confidence we're on track. That took guts and it worked.`,
        },
      },
    ],
  },
  fairness: {
    title: `Make your perception hold up`,
    insight: `You don't have to be objectively right. Fair feedback makes clear what it's based on and leaves room for the other view.`,
    takeaway: `Phrase it as a hypothesis: "My impression is … Does that match how you see it?"`,
    variants: [
      {
        scenario: `You're unsure whether your impression is fair. What helps most?`,
        options: [
          { text: `Gather 1–2 concrete examples, name it as your own perception.`, ok: true, fb: `Examples + "my impression" = fair and checkable.` },
          { text: `Wait until I'm 100% sure.`, ok: false, fb: `That certainty rarely comes; feedback needs evidence, not certainty.` },
          { text: `Ask others in the team first.`, ok: false, fb: `Slides quickly into gossip. Get context directly from the person.` },
        ],
        practice: {
          scenario: `You have the impression someone is pulling back from teamwork, but you're not sure. Phrase it as a checkable hypothesis.`,
          sample: `My impression over the last two weeks is that you're quieter in the syncs than usual. I might be over-reading it. How do you see it?`,
        },
      },
      {
        scenario: `A colleague missed one deadline, once. You're annoyed. What's fair?`,
        options: [
          { text: `Address the pattern: "You've become unreliable lately."`, ok: false, fb: `One event is not a pattern. Inflating it makes the feedback false and unfair.` },
          { text: `Name the single event and ask about context before concluding anything.`, ok: true, fb: `One observation, held as an observation. Context first, judgment maybe never.` },
          { text: `Keep a private tally for a month so you have solid evidence before speaking.`, ok: false, fb: `Feels rigorous, but a secret file betrays trust and delays the conversation. Evidence yes, surveillance no.` },
        ],
        practice: {
          scenario: `The handover arrived a day late, first time ever. Write the message that names it without inflating it.`,
          sample: `The handover came in Thursday instead of Wednesday, which squeezed my part. First time that's happened, so mainly checking: was it a one-off or is something changing on your side?`,
        },
      },
      {
        scenario: `Someone complains to you about a colleague's behavior and asks you to "maybe say something". What do you do?`,
        options: [
          { text: `Pass it on: "Some people are saying that you …"`, ok: false, fb: `Anonymous "some people" feedback is unanswerable and corrosive. Nobody can respond to a rumor.` },
          { text: `Check what YOU have actually observed, speak only to that, and encourage the colleague to speak directly.`, ok: true, fb: `You can only stand behind your own observations. Everything else belongs to its owner.` },
          { text: `Stay out of it entirely, not your business.`, ok: false, fb: `Half right: it's not yours to deliver, but helping the person speak up themselves is.` },
        ],
        practice: {
          scenario: `Write your reply to the person who asked you to pass on their criticism.`,
          sample: `I get why that bothers you, but coming from me second-hand it would just be a rumor. Tell them directly, and if it helps, I can be there or we can practice the wording together.`,
        },
      },
    ],
  },
  culture: {
    title: `Feedback is culturally coded`,
    insight: `Directness that counts as respect in the Netherlands can land as loss of face in Japan. It's not the message that changes, but its packaging.`,
    takeaway: `Ask beforehand: how much context / indirectness / appreciation does the other person expect?`,
    variants: [
      {
        scenario: `A team member from a more indirect context seems closed off after your direct feedback. What do you do?`,
        options: [
          { text: `Get even more direct.`, ok: false, fb: `Deepens the rift.` },
          { text: `Frame the criticism in appreciation + more context and check whether it landed.`, ok: true, fb: `Same content, adapted form.` },
          { text: `Stop giving any critical feedback from now on.`, ok: false, fb: `Patronizing. Robs the person of development.` },
        ],
        practice: {
          scenario: `A colleague from a more indirect context seems closed off after your feedback. Write a message that appreciates and gives context.`,
          sample: `I really value your work on the project. One more thought on the presentation: … Do let me know how you see it.`,
        },
      },
      {
        scenario: `A new team member from a very direct culture gives blunt feedback that ruffles the team. What do you do?`,
        options: [
          { text: `Ask them to hold back on feedback until they've settled in.`, ok: false, fb: `You'd be muting exactly the openness the team needs, and they'd learn feedback is unwelcome here.` },
          { text: `Privately appreciate the substance and agree on packaging that works for this team.`, ok: true, fb: `Substance stays, form adapts. That's the culture takeaway in both directions.` },
          { text: `Correct them in the meeting when it happens so everyone sees the norm.`, ok: false, fb: `A public correction about tone IS harsh tone. It models the opposite of what you want.` },
        ],
        practice: {
          scenario: `Write the private message to the new colleague: value the substance, propose the packaging.`,
          sample: `Your point in the review was spot on, and I want your directness on this team. One thing about here: leading with one appreciation before the criticism makes people actually hear it. Deal?`,
        },
      },
      {
        scenario: `In your remote team, your written feedback keeps landing harsher than you mean it. What helps most?`,
        options: [
          { text: `Add smileys and exclamation marks to soften the text.`, ok: false, fb: `Close, but emojis paper over tone instead of adding the missing context. The ambiguity stays.` },
          { text: `Move criticism-heavy topics to a quick call and check how it landed.`, ok: true, fb: `Voice carries the warmth text drops. And "how does that land?" catches what's left.` },
          { text: `Keep it written but CC the lead so everything is transparent.`, ok: false, fb: `A CC turns feedback into a filing. Now it's about protection, not development.` },
        ],
        practice: {
          scenario: `Your last written comment landed badly. Write the message that moves it to a call, without drama.`,
          sample: `I think my comment yesterday read harsher than I meant it. Do you have 10 minutes for a quick call? Easier to sort tone out with voices than with text.`,
        },
      },
    ],
  },
};

export interface CultureCountry { code: string; name: string; flag: string; target: number; }
/* Axis: 0 = indirect / diplomatic → 100 = direct / frank (Erin Meyer, "Evaluating") */
export const CULTURE_COUNTRIES: CultureCountry[] = [
  { code: "NL", name: "Netherlands", flag: "🇳🇱", target: 95 },
  { code: "DE", name: "Germany", flag: "🇩🇪", target: 88 },
  { code: "FR", name: "France", flag: "🇫🇷", target: 62 },
  { code: "US", name: "USA", flag: "🇺🇸", target: 35 },
  { code: "GB", name: "UK", flag: "🇬🇧", target: 28 },
  { code: "JP", name: "Japan", flag: "🇯🇵", target: 8 },
];

export const PRINCIPLES = [
  { emoji: "⏱️", t: `Timely over perfect`, d: `The good moment comes from a fixed slot, not from waiting.` },
  { emoji: "🎯", t: `Behavior over person`, d: `Concrete observation + impact + suggestion, never a character judgment.` },
  { emoji: "🌍", t: `Form follows culture`, d: `The message stays, the packaging adapts.` },
];
