/* Goalcraft (Performance-Driven Culture). Turn vague directives into clear, measurable
   and motivating goals. Framing: healthy performance culture, goals as orientation
   rather than a whip, why before how-much, never rank individual performance. */

export type CritKey = "konkret" | "messbar" | "sinnvoll" | "erreichbar";

export interface Criterion {
  key: CritKey;
  label: string;
  icon: string;
  question: string;
  weak: string;
  strong: string;
  prompt: string;      // step title ("Make it concrete")
  hint: string;        // guiding question
  placeholder: string;
}

export const CRITERIA: Criterion[] = [
  { key: "konkret", label: "Concrete", icon: "target", question: "What exactly?", weak: "“Get better”", strong: "“Halve the response time to customer requests”", prompt: "Make it concrete", hint: "What exactly do you mean? Describe the concrete change, not the feeling.", placeholder: "What exactly should change?" },
  { key: "messbar", label: "Measurable", icon: "signal", question: "How will we know it worked?", weak: "“Happier”", strong: "“From 48h to 24h”", prompt: "Make it measurable", hint: "How will you see that you've reached it? A number or a clear signal.", placeholder: "Which number or signal shows success?" },
  { key: "sinnvoll", label: "Meaningful", icon: "heart", question: "Why is it worth it?", weak: "(often missing)", strong: "“So customers feel heard”", prompt: "Give it meaning", hint: "Why is it worth it? The why behind it pulls more than any number.", placeholder: "What's it all for? What gets better?" },
  { key: "erreichbar", label: "Achievable", icon: "check", question: "Realistic & motivating?", weak: "“Everything perfect, immediately”", strong: "“By end of quarter, in steps”", prompt: "Make it achievable", hint: "Ambitious, but doable. In what timeframe, in what steps?", placeholder: "By when, in what steps?" },
];

export interface VagueGoal {
  id: string;
  category: string;
  text: string;
  pressure: string;                     // the "pressure version" (number without meaning, unrealistic)
  model: Record<CritKey, string>;       // model solution per criterion
}

export const VAGUE_GOALS: VagueGoal[] = [
  // Team / productivity
  { id: "prod", category: "Team & productivity", text: "We need to be more productive.",
    pressure: "20% more output. Effective immediately. No excuses.",
    model: { konkret: "Fewer context switches, at most three parallel projects per person.", messbar: "Focus time from 2 to 4 hours per day.", sinnvoll: "So work feels doable again instead of rushed.", erreichbar: "Step by step over the quarter, retro after four weeks." } },
  { id: "qual", category: "Team & productivity", text: "The quality has to get better.",
    pressure: "Zero defects. Always. Immediately.",
    model: { konkret: "A short review before every release.", messbar: "Bugs after release from 12 to under 5 per month.", sinnvoll: "So customers can trust us.", erreichbar: "From the next sprint, one step at a time." } },
  { id: "collab", category: "Team & productivity", text: "We should collaborate more efficiently.",
    pressure: "Half as many meetings, twice as fast. Now.",
    model: { konkret: "One clear owner per topic, less ping-pong.", messbar: "Lead time of a task from 5 to 3 days.", sinnvoll: "So less gets lost in the back-and-forth.", erreichbar: "Trial with one team over a quarter." } },

  // Customer / market
  { id: "custfocus", category: "Customer & market", text: "We need to be more customer-focused.",
    pressure: "Customer always happy. 100%. No matter what.",
    model: { konkret: "Talk to three customers every week.", messbar: "NPS from 30 to 45.", sinnvoll: "So we build what's actually needed.", erreichbar: "Start with one segment, then expand." } },
  { id: "csat", category: "Customer & market", text: "Customer satisfaction has to be high.",
    pressure: "Top rating everywhere. Immediately.",
    model: { konkret: "Reduce response time in support.", messbar: "First response from 48h to 24h.", sinnvoll: "So customers feel heard.", erreichbar: "By end of quarter, in two steps." } },
  { id: "fast", category: "Customer & market", text: "We need to deliver faster.",
    pressure: "Everything now. Just make it fast.",
    model: { konkret: "Streamline the approval process.", messbar: "Delivery time from 10 to 6 days.", sinnvoll: "So customers stay instead of leaving.", erreichbar: "Pilot with one product line." } },

  // Culture / collaboration
  { id: "feedback", category: "Culture & collaboration", text: "We want a better feedback culture.",
    pressure: "Everyone has to give feedback constantly. Mandatory.",
    model: { konkret: "Feedback as a fixed part of every retro.", messbar: "In the survey, 80% feel safe giving feedback.", sinnvoll: "So we learn from each other instead of past each other.", erreichbar: "Start with one ritual, over a quarter." } },
  { id: "comm", category: "Culture & collaboration", text: "Communication has to improve.",
    pressure: "No more misunderstandings. Starting now.",
    model: { konkret: "Capture decisions in writing, in one place.", messbar: "Noticeably fewer follow-up questions, clearer in the survey.", sinnvoll: "So no one is left in the dark.", erreichbar: "One shared channel, from next week." } },
  { id: "innov", category: "Culture & collaboration", text: "We should be more innovative.",
    pressure: "A groundbreaking idea every week. It's a must.",
    model: { konkret: "A fixed space for experiments.", messbar: "Four tested ideas per quarter.", sinnvoll: "So we keep developing instead of standing still.", erreichbar: "Two hours per week, voluntary." } },

  // Growth / development
  { id: "grow_each", category: "Growth & development", text: "Everyone should keep developing.",
    pressure: "Everyone has to prove themselves. Or out.",
    model: { konkret: "One learning goal per person per quarter.", messbar: "Everyone has set and reflected on a goal.", sinnvoll: "So growth is part of everyday life, not chance.", erreichbar: "A small goal, supported in the 1:1." } },
  { id: "data", category: "Growth & development", text: "We need to do more with our data.",
    pressure: "Everything data-driven. Immediately. Everywhere.",
    model: { konkret: "One dashboard for the key metrics.", messbar: "Three decisions per quarter made data-based.", sinnvoll: "So we learn from experience, not just gut feeling.", erreichbar: "Start with one metric." } },
  { id: "team_grow", category: "Growth & development", text: "We want to grow as a team.",
    pressure: "Twice as big, twice as fast. Now.",
    model: { konkret: "Clearer roles so more people can plug in.", messbar: "Onboarding time for new people from 6 to 4 weeks.", sinnvoll: "So growth feels good instead of chaotic.", erreichbar: "The next two hires as a test." } },
];

export const REFLECTIONS = [
  "What makes the difference between the pressure version and the pull version?",
  "Which version would motivate you more in the morning?",
  "What does the pull version give you that the pressure version doesn't?",
];

/* Short intro to the framing (pressure vs. pull). */
export const INTRO_POINTS = [
  "Pressure goals are numbers without a why: they push, but they wear you down.",
  "Pull goals are clear, measurable and have a purpose: they draw you in on their own.",
  "Here you practice turning a vague directive into a goal that pulls instead of pushes.",
];

/* Builds a readable goal sentence from the four answers (the "pull version"). */
export function assembleSog(input: Partial<Record<CritKey, string>>): string {
  const k = (input.konkret ?? "").trim();
  const m = (input.messbar ?? "").trim();
  const s = (input.sinnvoll ?? "").trim();
  const e = (input.erreichbar ?? "").trim();
  const parts: string[] = [];
  if (k) parts.push(k.replace(/[.!?]+$/, ""));
  if (m) parts.push(`Measurable: ${m.replace(/[.!?]+$/, "")}`);
  if (s) parts.push(`Purpose: ${s.replace(/[.!?]+$/, "")}`);
  if (e) parts.push(`Frame: ${e.replace(/[.!?]+$/, "")}`);
  return parts.length ? parts.join(". ") + "." : "";
}

/* Rule-based feedback per criterion (fallback without AI). */
export function critFeedback(key: CritKey, text: string): { ok: boolean; note: string } {
  const t = text.trim();
  if (key === "sinnvoll" && !t) return { ok: false, note: "Without a why it stays a chore. What drives you?" };
  if (!t || t.length < 6) {
    const nudge: Record<CritKey, string> = {
      konkret: "Still a bit abstract. What exactly changes?",
      messbar: "How will you recognize success? A number makes it tangible.",
      sinnvoll: "What's the purpose behind it?",
      erreichbar: "By when, in what steps?",
    };
    return { ok: false, note: nudge[key] };
  }
  if (key === "messbar" && !/\d/.test(t)) return { ok: false, note: "A concrete number makes success visible (e.g. “from 48h to 24h”)." };
  const good: Record<CritKey, string> = {
    konkret: "Clear and tangible.",
    messbar: "Success is measurable.",
    sinnvoll: "A strong purpose.",
    erreichbar: "Realistic frame.",
  };
  return { ok: true, note: good[key] };
}
