import type { DiscType } from "../lib/store";

export interface DiscInfo {
  persona: string; // playful name, e.g. "The Achiever"
  emoji: string;
  label: string; // formal dimension name
  core: string; // one-line core
  color: string;
  desc: string; // result short text (§6 handover)
  strengths: string[];
  watchOuts: string[];       // growth edges / blind spots
  communication: string;     // how you communicate & like to be met
  underPressure: string;     // behaviour under stress
  energizedBy: string;       // what gives you energy
  bestWith: string;          // how others get the best from working with you
}

/** Shared DISC descriptions, used by the assessment result, the profile and the team page.
    Everything here describes a style, never a person, profiles stay private per user. */
export const DISC_INFO: Record<DiscType, DiscInfo> = {
  D: {
    persona: "The Achiever",
    emoji: "🚀",
    label: "Dominance",
    core: "Results, pace, control",
    color: "var(--disc-d)",
    desc: "You push forward, make decisions and see things through. On the team you're the engine, just watch that you don't leave the others behind.",
    strengths: ["Decides quickly", "Drives the team forward", "Stays effective under pressure"],
    watchOuts: ["Can move faster than the team", "May cut discussion short", "Impatience when things stall"],
    communication: "Be direct and get to the point. Lead with the outcome, then the detail.",
    underPressure: "You speed up and push for a decision, sometimes over others' input.",
    energizedBy: "Clear goals, momentum and visible wins.",
    bestWith: "Give them the goal and room to run, then check in on outcomes, not every step.",
  },
  I: {
    persona: "The Energizer",
    emoji: "✨",
    label: "Influence",
    core: "People, enthusiasm, impact",
    color: "var(--disc-i)",
    desc: "You get everyone going, bringing energy and ideas. You turn meetings into moments, and clear structure sometimes helps you stay on track.",
    strengths: ["Motivates & connects", "Communicates openly", "Brings creative ideas"],
    watchOuts: ["Can lose the thread of detail", "May over-commit in the moment", "Long solo focus drains you"],
    communication: "Keep it warm and interactive. Acknowledge the energy before diving into specifics.",
    underPressure: "You talk it out and stay upbeat, sometimes glossing over the hard parts.",
    energizedBy: "People, recognition and bringing ideas to life.",
    bestWith: "Bring them in early, then help anchor the ideas with a little structure.",
  },
  S: {
    persona: "The Anchor",
    emoji: "🪨",
    label: "Steadiness",
    core: "Harmony, reliability, calm",
    color: "var(--disc-s)",
    desc: "You're the calm anchor of the team, reliable and a real listener. You like change in moderation, and your feel for people is worth its weight in gold.",
    strengths: ["Listens actively", "Creates stability", "Reliable & balancing"],
    watchOuts: ["Change needs a run-up", "May hold your own needs back", "Tends to avoid open conflict"],
    communication: "Be calm and give context. Flag change early and allow time to adjust.",
    underPressure: "You withdraw and need quiet to reset, and may keep frustration to yourself.",
    energizedBy: "Steady rhythms, trust and a harmonious team.",
    bestWith: "Give steady context and reassurance, and actively invite their view, it's often unspoken.",
  },
  C: {
    persona: "The Analyst",
    emoji: "📐",
    label: "Conscientiousness",
    core: "Precision, logic, quality",
    color: "var(--disc-c)",
    desc: "You love precision, logic and quality. People count on you when it needs to be clean, and every now and then ‘good enough' is allowed too.",
    strengths: ["Works precisely", "Spots risks early", "Ensures quality"],
    watchOuts: ["Perfectionism can slow things down", "May over-analyse", "Wary of unstructured change"],
    communication: "Be precise and bring the reasoning. Facts and clear criteria land best.",
    underPressure: "You retreat into lists and structure, and can get stuck seeking certainty.",
    energizedBy: "Quality, logic and getting things right.",
    bestWith: "Give them the full picture and the criteria, then let them make it solid.",
  },
};
