/* Translate This (Communication). Active listening through paraphrasing.
   A talks, B summarizes ("What I hear is…"), A confirms, then swap. */

export interface TopicLevel { key: string; label: string; prompts: string[]; }

export const TOPIC_LEVELS: TopicLevel[] = [
  { key: "leicht", label: "Easy", prompts: [
    "A tool or method I love at work, and why.",
    "What my ideal workday looks like.",
    "One thing I appreciate or miss about remote work.",
  ] },
  { key: "mittel", label: "Medium", prompts: [
    "Something in our meetings I'd like to be different.",
    "A work habit I want to break.",
    "A decision I'm currently unsure about.",
  ] },
  { key: "tiefer", label: "Deeper", prompts: [
    "A challenge in my current project.",
    "Something I'm proud of but rarely mention.",
    "A change I'd wish for our team.",
  ] },
];

export const RULES = {
  speaker: "Talk for a minute or two. Feel free to pause.",
  listener: "Don't answer. Don't solve. Summarize first.",
};

export const SPECTATOR_TASK = "Watch for where meaning gets lost, between what's said and what's understood.";

export const REFLECTIONS = [
  "How hard was it NOT to answer right away?",
  "Was your point understood correctly the first time?",
  "What helped you feel understood?",
  "Where in your workday would more mirroring help?",
];
