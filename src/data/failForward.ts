export type FFLevel = "leicht" | "mittel" | "wild";
export interface FFCard { level: FFLevel; text: string; }

export const FF_LEVEL: Record<FFLevel, { label: string; color: string }> = {
  leicht: { label: "Easy", color: "var(--candy-blue)" },
  mittel: { label: "Medium", color: "var(--candy-yellow)" },
  wild: { label: "Wild", color: "var(--danger)" },
};

export const FF_REFLECTIONS = [
  "What would your first step be?",
  "What would you learn from it?",
  "How would you explain it to the team?",
];

/* One micro-lesson per reflection question (same index), revealed after the
   player has formed their own answer, so the learning lands on top of thinking,
   not instead of it. */
export const FF_TAKEAWAYS: Array<{ lesson: string; steal: string }> = [
  {
    lesson: "People rarely remember the mistake, they remember the recovery. Teams read psychological safety off the first five minutes after a slip: own it fast, fix it visibly, skip the excuses. Speed of repair beats elegance of excuse, every time.",
    steal: "Quick heads-up: I got X wrong. Here's the fix, and here's what I'm changing so it doesn't repeat.",
  },
  {
    lesson: "Good teams treat mistakes as data about the system, not verdicts about the person. Instead of “who messed up?”, ask “what made this mistake easy to make?”. That question finds the loose railing instead of blaming the person who slipped.",
    steal: "What made this mistake easy to make, and what would make it hard to repeat?",
  },
  {
    lesson: "When someone admits a slip out loud and the sky doesn't fall, everyone's honesty gets cheaper. That's how psychological safety is actually built: someone goes first. Bonus: teams that share small fails early almost never get surprised by big ones.",
    steal: "I'll go first: my fail of the week was X, and what I took from it is Y. Who tops it?",
  },
];

export const FF_CARDS: FFCard[] = [
  { level: "leicht", text: "You presented the wrong deck in an all-hands, and only notice after slide 5." },
  { level: "leicht", text: "Your mic was on the whole time. The team heard you grumbling about the meeting." },
  { level: "leicht", text: "You sent an email to “everyone” that was only meant for one person." },
  { level: "leicht", text: "You forgot to mute your mic on a call. No one interrupted you." },
  { level: "mittel", text: "Your most important project deliverable vanishes from the cloud three hours before the deadline." },
  { level: "mittel", text: "You take over a meeting at short notice and only realize live that you prepared the wrong topic." },
  { level: "mittel", text: "A client escalates publicly on LinkedIn. And mentions your name." },
  { level: "mittel", text: "You accidentally sent the wrong project status to management." },
  { level: "wild", text: "You're the only one who knows the password to the production system, and you've forgotten it." },
  { level: "wild", text: "Your laptop catches fire right before an investor demo. Literally." },
  { level: "wild", text: "You get locked out of the system during a live webinar with 500 viewers." },
  { level: "wild", text: "Your competitor stole your entire pitch. And presented it better." },
];
