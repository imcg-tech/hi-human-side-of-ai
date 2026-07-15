/* 1:1 Companion (Leadership). Structures good one-on-ones, before, during and after.
   A good 1:1 belongs to the report, not the manager: listen more than you report,
   development before status, continuity over time. Content only, no logic here. */

export interface QuestionCategory { key: string; label: string; emoji: string; questions: string[]; }

export const QUESTION_LIBRARY: QuestionCategory[] = [
  { key: "wellbeing", label: "Wellbeing & connection", emoji: "💛", questions: [
    "How are you really doing right now, not just at work?",
    "What gave you energy this week, and what cost you energy?",
    "Do you feel more over- or under-challenged at the moment?",
  ] },
  { key: "growth", label: "Development & growth", emoji: "🌱", questions: [
    "What would you like to grow in, and are you doing enough of it right now?",
    "Which task would you like to do more often?",
    "What are you learning at the moment?",
  ] },
  { key: "collaboration", label: "Collaboration & leadership", emoji: "🤝", questions: [
    "What do you need from me that you're not getting right now?",
    "What should I, as a lead, start, stop, and keep doing?",
    "Is there anything that's been left unsaid?",
  ] },
  { key: "obstacles", label: "Obstacles & support", emoji: "🧗", questions: [
    "What's getting in your way right now?",
    "Where are you losing time on things that don't make sense?",
    "Where do you feel left on your own?",
  ] },
];

/* Flat, interleaved pool so rotating picks stay varied across categories. */
const POOL: { cat: string; q: string }[] = (() => {
  const max = Math.max(...QUESTION_LIBRARY.map((c) => c.questions.length));
  const out: { cat: string; q: string }[] = [];
  for (let i = 0; i < max; i++) for (const c of QUESTION_LIBRARY) if (c.questions[i]) out.push({ cat: c.label, q: c.questions[i] });
  return out;
})();

/* Deterministic rotating set: shifts by seed so each conversation gets fresh prompts. */
export function pickQuestions(seed: number, n = 3): { cat: string; q: string }[] {
  const start = ((seed % POOL.length) + POOL.length) % POOL.length;
  return Array.from({ length: Math.min(n, POOL.length) }, (_, i) => POOL[(start + i * 3) % POOL.length]);
}

export interface GuideStep { id: string; title: string; hint: string; }

/* Flexible conversation frame, not a rigid script. */
export const STEPS: GuideStep[] = [
  { id: "arrive", title: "Arrive", hint: "Start human, don't jump straight into tasks." },
  { id: "checkin", title: "How are you really?", hint: "Wellbeing before work." },
  { id: "their", title: "Their topics first", hint: "Their agenda takes priority." },
  { id: "yours", title: "Your topics", hint: "What you want to raise." },
  { id: "growth", title: "Development & growth", hint: "Not just current tasks." },
  { id: "obstacles", title: "Obstacles", hint: "What's in your way? How can I help?" },
  { id: "agreements", title: "Agreements", hint: "Concrete next steps, on both sides." },
];

/* Gentle seed topics a report might contribute (their agenda, optional). */
export const TOPIC_SEEDS = [
  "Something that went well",
  "A decision I'm unsure about",
  "Feedback for you",
  "Something I need help with",
  "An idea I want to bounce",
];

export const PRIVACY_NOTE =
  "This conversation stays between the two of you. Notes live only on this device, nothing is reported to HR or your employer, and the mood check-in is only ever shown if your report chooses to share it.";
