export interface CGQuestion { theme: string; q: string; left: string; right: string; }

/* Neutrally worded poles, never judgmental. From the game-design sheet (selection). */
export const CG_QUESTIONS: CGQuestion[] = [
  { theme: "Feedback", q: "How directly do you give feedback?", left: "Always softened & indirect", right: "Always plain & direct" },
  { theme: "Feedback", q: "Giving feedback in front of others is…", left: "Totally fine", right: "An absolute taboo" },
  { theme: "Time", q: "How punctual is “on time”?", left: "To the minute", right: "±15 min is normal" },
  { theme: "Time", q: "Deadlines are, for me…", left: "An absolute limit", right: "A strong guideline" },
  { theme: "Hierarchy", q: "Do I disagree with my manager?", left: "Only one-on-one", right: "Openly in the meeting too" },
  { theme: "Hierarchy", q: "Decisions should…", left: "Come quickly from the top", right: "Emerge together in the team" },
  { theme: "Communication", q: "Silence in a meeting means…", left: "Agreement", right: "Disagreement or thinking" },
  { theme: "Communication", q: "How much small talk before business?", left: "None, straight to the point", right: "10+ min, relationship first" },
  { theme: "Quality", q: "When is a project “done”?", left: "80% is enough to show", right: "100% or it doesn't ship" },
  { theme: "Quality", q: "Improvising on the job is…", left: "A sign of competence", right: "A sign of poor planning" },
];

export const CG_TAKEAWAYS = [
  "I was surprised by the spread",
  "I already knew about these differences",
  "This explains a misunderstanding in our team",
  "I want to know more about it",
];
