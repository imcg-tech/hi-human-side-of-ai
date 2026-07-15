/* First Week Quest (Onboarding). Quest pool, staggered by days relative to the
   start date. Tone: especially warm, encouraging, never sounding like an obligation.
   Free texts stay local, only completion is saved in the store. */

import { MOCK_MEMBERS, discColor, type MemberProfile } from "./teamInsights";

export type QuestType = "profile" | "share" | "buddy" | "people" | "match" | "info" | "task" | "play";

export interface QuestField { key: string; label: string; placeholder: string; }
export interface InfoCard { t: string; d: string; }

export interface Quest {
  id: string;
  phase: 1 | 2 | 3 | 4;
  unlockDay: number;     // 1 = start day, 2 = next day, 4, 8 (week 2)
  type: QuestType;
  icon: string;          // uniform line icon (see components/Icon)
  title: string;
  desc: string;
  connects: number;      // how many people this quest connects (for milestones)
  optional?: boolean;
  fields?: QuestField[];
  placeholder?: string;
  suggestedQuestions?: string[];
  cards?: InfoCard[];
  items?: string[];
  cta?: { label: string; route: string };
}

export interface Phase { n: 1 | 2 | 3 | 4; label: string; sub: string; line: string; }

export const PHASES: Phase[] = [
  { n: 1, label: "Arriving", sub: "Day 1", line: "Get oriented and become visible." },
  { n: 2, label: "Connecting", sub: "Day 2–3", line: "First real contacts." },
  { n: 3, label: "Understanding", sub: "Day 4–5", line: "Team, rituals, ways of working." },
  { n: 4, label: "Contributing", sub: "Week 2", line: "Add your own, settle in." },
];

export const QUESTS: Quest[] = [
  // ── Phase 1, Arriving (day 1) ──
  {
    id: "q_steckbrief", phase: 1, unlockDay: 1, type: "profile", icon: "idcard", connects: 0,
    title: "Quick intro",
    desc: "Not a CV. A few things about you so the team can get to know you.",
    fields: [
      { key: "snack", label: "Favorite snack", placeholder: "e.g. dark chocolate" },
      { key: "hobby", label: "A hobby", placeholder: "e.g. bouldering" },
      { key: "funfact", label: "A fun fact about you", placeholder: "e.g. I once lived in Iceland" },
    ],
  },
  {
    id: "q_hallo", phase: 1, unlockDay: 1, type: "share", icon: "message", connects: 0,
    title: "Intro in the team feed",
    desc: "Two or three sentences for the team feed are plenty.",
    placeholder: "Hi everyone, I'm … and I'm looking forward to …",
  },
  {
    id: "q_setup", phase: 1, unlockDay: 1, type: "share", icon: "monitor", connects: 0, optional: true,
    title: "Your setup",
    desc: "Want to show your setup? An emoji or a sentence is enough. Totally optional.",
    placeholder: "☕ 🖥️ 🪴 … or describe your favorite spot",
  },

  // ── Phase 2, Connecting (day 2–3) ──
  {
    id: "q_buddy", phase: 2, unlockDay: 2, type: "buddy", icon: "users", connects: 1,
    title: "Your onboarding buddy",
    desc: "We've paired you with someone who's there for your questions.",
  },
  {
    id: "q_threepeople", phase: 2, unlockDay: 2, type: "people", icon: "messageDots", connects: 3,
    title: "Three quick questions",
    desc: "Ask three colleagues one small question each. Async, no pressure at all.",
    suggestedQuestions: [
      "What are you looking forward to this week?",
      "What helps you start your day well?",
      "Which team ritual should I definitely know about?",
    ],
  },
  {
    id: "q_whoswho", phase: 2, unlockDay: 3, type: "match", icon: "network", connects: 0,
    title: "Who does what?",
    desc: "Learn a few names and roles the playful way. No points, no pressure.",
  },

  // ── Phase 3, Understanding (day 4–5) ──
  {
    id: "q_rituals", phase: 3, unlockDay: 4, type: "info", icon: "repeat", connects: 0,
    title: "Discover team rituals",
    desc: "The little routines that hold you together.",
    cards: [
      { t: "Daily standup", d: "Short and relaxed, every morning at 9:30. Camera is optional." },
      { t: "Game session", d: "A round together on Fridays, simply to connect." },
      { t: "Focus Wednesday", d: "Wednesdays are deliberately kept free of meetings." },
    ],
  },
  {
    id: "q_rules", phase: 3, unlockDay: 4, type: "info", icon: "compass", connects: 0,
    title: "The unwritten rules",
    desc: "How we work together here, so you feel at ease.",
    cards: [
      { t: "Response times", d: "Async is normal. You never have to reply instantly." },
      { t: "Asking is welcome", d: "Better to ask one time too many. No one expects you to know everything." },
      { t: "Camera", d: "Always optional. Pick whatever feels good." },
    ],
  },
  {
    id: "q_firstwin", phase: 3, unlockDay: 5, type: "task", icon: "target", connects: 0,
    title: "Your first win",
    desc: "A small, doable task. Deliberately easy, for a good first sense of achievement.",
    items: [
      "Set up your profile picture",
      "Write a comment in the team feed",
      "Join a channel that interests you",
    ],
  },

  // ── Phase 4, Contributing (week 2) ──
  {
    id: "q_fresh_eyes", phase: 4, unlockDay: 8, type: "share", icon: "eye", connects: 0,
    title: "Fresh eyes",
    desc: "Share an observation as a newcomer. Exactly that perspective is valuable to the team.",
    placeholder: "What I noticed as a newcomer …",
  },
  {
    id: "q_teamplay", phase: 4, unlockDay: 8, type: "play", icon: "play", connects: 1,
    title: "Play with the team",
    desc: "Join your first live team game. The nicest way to settle in.",
    cta: { label: "To the team games", route: "/app/modules" },
  },
  {
    id: "q_soundtrack", phase: 4, unlockDay: 9, type: "share", icon: "music", connects: 0,
    title: "Your soundtrack",
    desc: "Add a song to the team playlist. Your first little footprint.",
    placeholder: "Song title & artist …",
  },
];

export const TOTAL_QUESTS = QUESTS.length;

/* Day offset (0-based) since the start. */
export function dayOffset(start: string | null): number {
  if (!start) return 0;
  const ms = Date.now() - new Date(start + "T00:00:00").getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

export const isUnlocked = (q: Quest, start: string | null): boolean => dayOffset(start) >= q.unlockDay - 1;

/* Buddy matching, placeholder logic: prefers a warm, calm point of contact
   (S type) from the team, excludes the new person themselves. */
export function buddyFor(displayName: string | null): MemberProfile {
  const others = MOCK_MEMBERS.filter((m) => m.name !== displayName);
  return others.find((m) => m.primary === "S") ?? others[0];
}
export const buddyColor = (m: MemberProfile) => discColor(m.primary);

/* Colleagues for "Who does what?" and "Three questions", without the new person. */
export const teamPool = (displayName: string | null): MemberProfile[] =>
  MOCK_MEMBERS.filter((m) => m.name !== displayName);

/* People met, derived from the completed connection quests. */
export const connectionsFor = (done: string[]): number =>
  QUESTS.filter((q) => done.includes(q.id)).reduce((sum, q) => sum + q.connects, 0);
