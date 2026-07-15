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
export interface Path { title: string; insight: string; scenario: string; options: PathOption[]; takeaway: string; practice: Practice; }

export const PATHS: Record<string, Path> = {
  harmony: {
    title: `Harmony ≠ silence`,
    insight: `Withholding feedback protects the relationship short-term, but damages it long-term: expectations stay unspoken, frustration builds up, and the blow-up comes later and harder.`,
    scenario: `A valued team member has been delivering reports with the same careless errors for 3 weeks. You like the person. What do you do?`,
    options: [
      { text: `Quietly fix it yourself to avoid hurting anyone.`, ok: false, fb: `Robs the person of growth, creates ongoing work for you. Silence isn't proof of kindness.` },
      { text: `Address it promptly, calmly and concretely, as support, not as an accusation.`, ok: true, fb: `Early, matter-of-fact feedback signals respect.` },
      { text: `Wait for the next review.`, ok: false, fb: `The pattern hardens, and the review feels like an ambush.` },
    ],
    takeaway: `"I noticed X. My impression is Y. What matters to me is …". Observation before judgment.`,
    practice: {
      scenario: `The same colleague again delivers a report with transposed numbers. Phrase your feedback promptly and as support.`,
      sample: `I noticed in the last few reports that transposed numbers keep slipping in. It matters to me that the reports hold up. Shall we take a quick look together at what's causing it?`,
    },
  },
  time: {
    title: `The moment doesn't come, you make it`,
    insight: `Feedback that waits for the perfect moment usually never comes. The bigger the gap from the event, the fuzzier and more contestable it gets.`,
    scenario: `In a meeting you notice something you want to raise. When?`,
    options: [
      { text: `Note it and block 10 min for it today.`, ok: true, fb: `Timeliness + a fixed slot beats any "good moment" that never comes.` },
      { text: `Sometime, when things are calm.`, ok: false, fb: `"Sometime" is the graveyard of good feedback.` },
      { text: `At the next 1:1 in two weeks.`, ok: false, fb: `Too long for something fresh; 1:1s are for patterns, not current events.` },
    ],
    takeaway: `24-hour rule: address observed behavior within a day, briefly and in person.`,
    practice: {
      scenario: `In the meeting just now you noticed something. Write your note to yourself + the first sentence for today's conversation.`,
      sample: `Note: block 10 min with X today. Opener: "Something came up for me in the standup earlier. Do you have a moment?"`,
    },
  },
  reaction: {
    title: `Defuse defensiveness before it arises`,
    insight: `Defensiveness is usually protection, not stubbornness. It arises when feedback sounds like a verdict on the person instead of an observation about behavior.`,
    scenario: `You expect resistance. How do you open?`,
    options: [
      { text: `"You always …"`, ok: false, fb: `Generalizations trigger defense instantly.` },
      { text: `"I noticed in situation X … How do you see it?"`, ok: true, fb: `"I" message + a concrete situation + a real question = dialogue instead of a tribunal.` },
      { text: `"Don't take this personally, but …"`, ok: false, fb: `Almost guarantees it'll be taken personally.` },
    ],
    takeaway: `Observation (fact) → impact (your experience) → request (your ask), then openly ask for their perspective.`,
    practice: {
      scenario: `You expect resistance. Phrase your opening sentence so it invites instead of attacks.`,
      sample: `I noticed in the demo yesterday that the client's question was left open. How did you experience the situation?`,
    },
  },
  words: {
    title: `Constructive means: concrete + forward-looking`,
    insight: `"Constructive" is substance, not packaging: concrete behavior instead of a character judgment, plus a clear way forward.`,
    scenario: `Which wording is constructive?`,
    options: [
      { text: `"Your presentation was unprofessional."`, ok: false, fb: `A blanket judgment, nothing to act on.` },
      { text: `"Slide 4 had three key figures without a source. Next time add where they're from, then the point really lands."`, ok: true, fb: `Concrete, verifiable, solution-oriented.` },
      { text: `"It was okay, but there's more in you."`, ok: false, fb: `Unspecific, ineffective.` },
    ],
    takeaway: `Pattern: situation → behavior → impact → suggestion. No character labels.`,
    practice: {
      scenario: `A colleague ran a meeting and drifted off topic three times. The meeting ran over. Phrase your feedback.`,
      sample: `I noticed we drifted off the agenda item three times and ran 15 min over. For next time: shall we use a visible agenda with timeboxes? Then more of it sticks.`,
    },
  },
  fairness: {
    title: `Make your perception hold up`,
    insight: `You don't have to be objectively right. Fair feedback makes clear what it's based on and leaves room for the other view.`,
    scenario: `You're unsure whether your impression is fair. What helps most?`,
    options: [
      { text: `Gather 1–2 concrete examples, name it as your own perception.`, ok: true, fb: `Examples + "my impression" = fair and checkable.` },
      { text: `Wait until I'm 100% sure.`, ok: false, fb: `That certainty rarely comes; feedback needs evidence, not certainty.` },
      { text: `Ask others in the team first.`, ok: false, fb: `Slides quickly into gossip. Get context directly from the person.` },
    ],
    takeaway: `Phrase it as a hypothesis: "My impression is … Does that match how you see it?"`,
    practice: {
      scenario: `You have the impression someone is pulling back from teamwork, but you're not sure. Phrase it as a checkable hypothesis.`,
      sample: `My impression over the last two weeks is that you're quieter in the syncs than usual. I might be over-reading it. How do you see it?`,
    },
  },
  culture: {
    title: `Feedback is culturally coded`,
    insight: `Directness that counts as respect in the Netherlands can land as loss of face in Japan. It's not the message that changes, but its packaging.`,
    scenario: `A team member from a more indirect context seems closed off after your direct feedback. What do you do?`,
    options: [
      { text: `Get even more direct.`, ok: false, fb: `Deepens the rift.` },
      { text: `Frame the criticism in appreciation + more context and check whether it landed.`, ok: true, fb: `Same content, adapted form.` },
      { text: `Stop giving any critical feedback from now on.`, ok: false, fb: `Patronizing. Robs the person of development.` },
    ],
    takeaway: `Ask beforehand: how much context / indirectness / appreciation does the other person expect?`,
    practice: {
      scenario: `A colleague from a more indirect context seems closed off after your feedback. Write a message that appreciates and gives context.`,
      sample: `I really value your work on the project. One more thought on the presentation: … Do let me know how you see it.`,
    },
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
