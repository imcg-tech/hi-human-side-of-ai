/* One Clear Ask (Communication). Precisely phrasing requests.
   4 building blocks: recipient, what, when, why (optional). Rule-based evaluation
   (fallback without AI), language-independent on the blocks, no grading system. */

export type Level = "leicht" | "mittel" | "schwer" | "wild";

export const LEVELS: { key: Level; label: string; unlockAt: number }[] = [
  { key: "leicht", label: "Easy", unlockAt: 0 },
  { key: "mittel", label: "Medium", unlockAt: 2 },
  { key: "schwer", label: "Hard", unlockAt: 4 },
  { key: "wild", label: "Wild", unlockAt: 6 },
];

export interface Situation { id: string; level: Level; text: string; to: string; urgency: string; sample: string; }

export const SITUATIONS: Situation[] = [
  // Easy
  { id: "A01", level: "leicht", to: "Colleague", urgency: "by tomorrow morning", text: "You need the updated Q3 numbers from a colleague for a presentation tomorrow morning. He's currently tied up in another project.",
    sample: "Hi Tom, can you send me the updated Q3 numbers by 9am tomorrow? I need them for the presentation in the board meeting. If it gets tight, just let me know." },
  { id: "A02", level: "leicht", to: "Colleague", urgency: "before it goes out", text: "You want someone to proofread your document before you send it.",
    sample: "Hi Mara, would you mind proofreading the proposal by 3pm? I mainly care about clarity before it goes out to the client." },
  { id: "A03", level: "leicht", to: "IT", urgency: "this week", text: "You need access to a tool that only IT can enable.",
    sample: "Hi IT team, could you enable Figma access for me by Friday? I'm starting on the design project next week and need it to get going." },
  { id: "A04", level: "leicht", to: "Colleague", urgency: "tomorrow 9:30", text: "You'd like a colleague to run the next standup for you.",
    sample: "Hey Jon, can you run the 9:30 standup for me tomorrow? I'm in the client presentation. Thanks a lot." },
  { id: "A05", level: "leicht", to: "Colleague", urgency: "by Friday", text: "You need a short written summary of a meeting you missed.",
    sample: "Hi Petra, could you send me three bullet points on what was decided in yesterday's roadmap meeting, by Friday? I was out sick and want to plan Monday properly." },
  { id: "A06", level: "leicht", to: "Facilities / Office", urgency: "before Thursday", text: "You need the big meeting room instead of the small one for a workshop.",
    sample: "Hi Chris, could you switch our Thursday 2pm booking to the big room? We'll be 9 people with sticky notes, the small one won't fit us." },

  // Medium
  { id: "B01", level: "mittel", to: "Colleague", urgency: "next time", text: "A colleague regularly delivers things to you late. You want it on time next time.",
    sample: "Hi Ben, it matters to me that your part arrives by Wednesday next time, so I can finish mine on time. Does that work for you, or do you need something from me?" },
  { id: "B02", level: "mittel", to: "another team", urgency: "this week", text: "You need help from someone on another team who owes you nothing.",
    sample: "Hi Sara, I know you've got a lot on. Would you have 20 minutes this week to help me with the API integration? It would really help me out." },
  { id: "B03", level: "mittel", to: "one person in a group chat", urgency: "today", text: "In a crowded group chat you want a concrete answer from ONE person.",
    sample: "@Lena, specifically for you: can you tell me by this afternoon whether the contract is final? Everyone else can ignore this." },
  { id: "B04", level: "mittel", to: "Team", urgency: "from the next meeting on", text: "You'd like your team to keep a meeting shorter without seeming rude.",
    sample: "Suggestion for next time: let's cap the weekly at 30 minutes and start with a clear agenda. I think we'll get through it more focused that way." },
  { id: "B05", level: "mittel", to: "Manager", urgency: "by Thursday", text: "You need a decision from your manager that they keep putting off.",
    sample: "Hi Anna, I need a decision on the budget by Thursday, otherwise the launch slips. Are last week's numbers enough for you, or is something still missing?" },
  { id: "B06", level: "mittel", to: "Colleague", urgency: "by end of day", text: "A colleague keeps answering your written questions with 'let's hop on a call'. This time you need it in writing.",
    sample: "Hi Deniz, this one I need in writing for the audit trail: can you confirm by end of day that the export uses the new schema? One sentence in the thread is enough." },

  // Hard
  { id: "C01", level: "schwer", to: "Manager", urgency: "in the next 1:1", text: "You want to ask your manager for more responsibility without sounding demanding.",
    sample: "Hi Anna, in the next 1:1 I'd like to talk about more responsibility. I feel ready to lead the onboarding project and would love to show you why. Does that work?" },
  { id: "C02", level: "schwer", to: "Client", urgency: "before the deadline", text: "You need to ask a client for a deadline extension without seeming unprofessional.",
    sample: "Hello Mr. Weber, to safeguard the quality I'd like to move delivery by two days to Friday. That way you get a cleanly tested result. Would that be feasible for you?" },
  { id: "C03", level: "schwer", to: "Colleague", urgency: "before the next meeting", text: "You want to ask a colleague to stop constantly interrupting in the meeting.",
    sample: "Hey Max, quick word between us before the meeting: it'd be important to me to finish my points before we discuss. Would you leave me the space for that? I'll do the same for you." },
  { id: "C04", level: "schwer", to: "a very busy person", urgency: "this week", text: "You need 30 minutes of a very busy person's time this week.",
    sample: "Hi Kim, I need a one-off 30 minutes from you this week to align on the architecture. Does Thursday 2pm work? I'll come prepared so it really stays at 30 minutes." },
  { id: "C05", level: "schwer", to: "Lead", urgency: "before resource planning", text: "You want to step off a project and need your lead's sign-off for it.",
    sample: "Hi Ravi, I'd like to talk to you before resource planning: I want to step off project X to focus on Y. I've prepared a clean handover. When do you have 15 minutes?" },
  { id: "C06", level: "schwer", to: "Team", urgency: "starting this sprint", text: "You keep getting pinged outside your working hours and want that to stop, without sounding difficult.",
    sample: "Quick ask to everyone: I'm offline after 6pm and won't see pings until morning. If something's truly urgent, call me. Everything else I'll happily pick up next day, starting this sprint." },

  // Wild
  { id: "D01", level: "wild", to: "Colleague", urgency: "right now", text: "You made a mistake and need help to fix it now, fast.",
    sample: "Hi Nora, I accidentally overwrote the live config and need you for 15 minutes now to reset it. Can you do it right away? It's time-critical." },
  { id: "D02", level: "wild", to: "two people", urgency: "today", text: "Two people gave you contradictory instructions. You need clarification from both.",
    sample: "Hi Tom and Anna, you gave me different specs for the report (weekly vs. monthly). Could you agree on one version by 4pm today? Then I'll implement it right away." },
  { id: "D03", level: "wild", to: "Manager", urgency: "in the next 1:1", text: "You want feedback on your work, but only ever get “it's fine”.",
    sample: "Hi Anna, “it's fine” unfortunately doesn't help me much. In the next 1:1, could you name one concrete thing that's going well and one I can improve? I'd like to work on that specifically." },
  { id: "D04", level: "wild", to: "Presenter in a live meeting", urgency: "right now, mid-meeting", text: "A live demo to a client is going off the rails and you need the presenter to skip to the working part, without embarrassing them.",
    sample: "Quick DM: the login part is eating our time. Jump straight to the dashboard demo, that's where it shines. I'll cover the login questions afterwards." },
  { id: "D05", level: "wild", to: "Colleague", urgency: "before 4pm today", text: "A colleague announced 'someone should tell the client' about a delay. You need them to own it, today.",
    sample: "Milan, you're closest to the client on this: can you tell them about the delay before 4pm today? Keep it short, new date plus one sentence on why. Ping me if you want a second pair of eyes." },
];

export const ELEMENTS = [
  { key: "adressat", label: "Recipient", q: "To whom exactly?" },
  { key: "was", label: "What", q: "What exactly do you need?" },
  { key: "wann", label: "When", q: "By when?" },
  { key: "warum", label: "Why", q: "Why does it matter? (optional)" },
] as const;

export type BlockKey = "adressat" | "was" | "wann" | "warum";

/* Why, when a block is missing (help for the self-check). */
export const ELEMENT_HELP: Record<BlockKey, string> = {
  adressat: "“Can someone …” and no one feels responsible.",
  was: "A vague task leads to the wrong result.",
  wann: "“Soon” or “when you have time” gets no priority.",
  warum: "Without context, motivation is lower.",
};

/* Deliberately only surface patterns that can be recognized literally, so they're
   honest. NO judgment about whether the request is substantively "clear",
   the person decides that themselves in the self-check. */
const RE = {
  vagueTime: /\b(soon|asap|shortly|sometime|at some point|whenever|when you have time|if possible|when you get a chance)\b/i,
  hiddenPolite: /\bit would be (maybe )?(really )?(nice|lovely|great|super)\b|maybe you could|would it (maybe )?be possible|if it'?s not too much|i (don'?t|wouldn'?t) want to (bother|disturb) you|sorry to bother/i,
};

export function surfaceObservations(textRaw: string): string[] {
  const text = textRaw.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const out: string[] = [];
  if (RE.vagueTime.test(text)) out.push("Vague timing spotted (“soon”, “asap”, “when you have time”). A concrete time makes it more binding.");
  if (RE.hiddenPolite.test(text)) out.push("The request might be hiding inside politeness. Dare to say it directly.");
  if ((text.match(/\?/g)?.length ?? 0) >= 3) out.push("That reads like several requests. Which one is the most important?");
  if (words > 0 && words < 5) out.push("Pretty short. Is everything necessary really in there?");
  return out;
}
