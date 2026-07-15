/* Ownership Cards (Performance-Driven Culture). Responsibility without blame:
   mistakes as a source of learning. Separates blame / self-blame / ownership.
   Only fictional cards, no real mistakes of anyone present. Tone: encouraging, never moralizing. */

export type ReactionType = "blame" | "selbst" | "ownership";

export interface SituationCard {
  id: string;
  situation: string;
  reactions: Record<ReactionType, string>;
}

export const SITUATION_CARDS: SituationCard[] = [
  { id: "doc", situation: "An important document went to the client with errors. Several people had seen it, no one caught the mistakes.",
    reactions: {
      blame: "The review team should have caught that.",
      selbst: "I'm just not careful enough, typical.",
      ownership: "I was one of the reviewers. I'll suggest a short check step so this doesn't happen to us again.",
    } },
  { id: "delay", situation: "A project is behind schedule. The dependency on another team was communicated too late.",
    reactions: {
      blame: "The other team always delivers late.",
      selbst: "I should have done everything myself.",
      ownership: "I could have made the dependency visible earlier. Next time I'll flag it at the kickoff.",
    } },
  { id: "decision", situation: "A decision was made that turned out to be wrong. Everyone had agreed.",
    reactions: {
      blame: "The idea originally came from Alex.",
      selbst: "I should have seen it coming.",
      ownership: "We decided it together. What can we learn from how it unfolded for the next decision?",
    } },
  { id: "req", situation: "A client is unhappy because a feature works differently than expected. The requirement was documented unclearly.",
    reactions: {
      blame: "The client never clearly said what they wanted.",
      selbst: "I should have questioned everything, I'm too naive.",
      ownership: "I didn't confirm the requirement back. Next time I'll summarize it in writing and have it confirmed.",
    } },
  { id: "meeting", situation: "A meeting was missed by two people, so it didn't happen.",
    reactions: {
      blame: "The calendar sync just never works here.",
      selbst: "I constantly forget meetings, how unprofessional.",
      ownership: "I didn't confirm the invite. From now on I'll set myself a reminder just before.",
    } },
];

export const TYPE_INFO: Record<ReactionType, { label: string; sign: string; color: string; note: string }> = {
  blame: { label: "Blame", sign: "✗", color: "var(--danger)", note: "Blame directed outward. Human, but it leads to fear, cover-ups, standstill." },
  selbst: { label: "Self-blame", sign: "✗", color: "var(--candy-yellow-deep)", note: "Blame directed destructively inward. Paralyzes instead of enabling action." },
  ownership: { label: "Ownership", sign: "✓", color: "var(--candy-teal-deep)", note: "My part and my next step. Gets you furthest, without putting anyone else down." },
};

/* Framing: the three stances briefly explained. */
export const FRAMING = [
  { type: "blame" as ReactionType, title: "Blame", line: "“Who's at fault?” The gaze goes outward. Understandable, but it creates fear instead of learning." },
  { type: "selbst" as ReactionType, title: "Self-blame", line: "“I'm a failure.” The gaze goes destructively inward. That paralyzes." },
  { type: "ownership" as ReactionType, title: "Ownership", line: "“What was my part, and what do I do now?” Honest and action-ready, the middle path." },
];

export const SAFETY_NOTE = "This is never about real mistakes of anyone present. Just fictional cards, no confessions, only practicing together.";

/* The ownership formula to take with you. */
export const FORMULA = {
  sentence: "My part was X. What I learn from it: Y. My next step: Z.",
  parts: [
    { key: "anteil", label: "Part", hint: "Honest, but without self-flagellation." },
    { key: "lernen", label: "Learning", hint: "What do you take away?" },
    { key: "schritt", label: "Step", hint: "Concretely forward. That enables action instead of paralysis." },
  ] as const,
};

export const REFLECTIONS = [
  "Where in real daily life are we most likely to slip into blame?",
  "How would more ownership change the way we work together?",
];
