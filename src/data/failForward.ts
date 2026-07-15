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
