/* Coffee Roulette (Connection & Loneliness + Bonding). Random, low-stakes coffee dates
   against remote isolation. Weak ties reduce loneliness and open new perspectives.
   The real match runs server-side, periodically; this file simulates it client-side. */

import { MOCK_MEMBERS, type MemberProfile } from "./teamInsights";
import type { CoffeeCadence, CoffeePref } from "../lib/store";

export const CADENCES: { key: CoffeeCadence; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Every two weeks" },
  { key: "monthly", label: "Monthly" },
];

export const PREFS: { key: CoffeePref; label: string; hint: string }[] = [
  { key: "same", label: "My team", hint: "People close to my work" },
  { key: "other", label: "Other teams", hint: "Break the silos" },
  { key: "any", label: "Anyone", hint: "Surprise me" },
];

export const CONVERSATION_STARTERS = [
  "What do you do when you're not working?",
  "Where would you love to live one day?",
  "What was your very first job?",
  "What are you looking forward to this week?",
  "Coffee, tea, or something else entirely?",
  "What's a small thing that made you smile recently?",
  "Any hidden talents?",
  "What's your go-to comfort food?",
];

/* A few friendly time-slot suggestions (the simple "when works?" fallback, no calendar needed). */
export const SLOTS = ["Tomorrow, 10:00", "Tomorrow, 15:30", "Thursday, 11:00", "Friday, 14:00"];

export interface Match { members: MemberProfile[]; trio: boolean; }

/* Client-side stand-in for the periodic server match. Prefers people you've had little or
   no contact with, honours the team preference, and forms a trio when the pool is odd so
   nobody is left out. */
export function makeMatch(met: string[], pref: CoffeePref, myTeam: string | null, excludeId?: string): Match | null {
  const pool = MOCK_MEMBERS.filter((m) => m.id !== excludeId);
  if (!pool.length) return null;

  const unmet = pool.filter((m) => !met.includes(m.id));
  const base = unmet.length ? unmet : pool; // once you've met everyone, repeats are allowed

  const sameTeam = (m: MemberProfile) => !!myTeam && m.role.toLowerCase() === myTeam.toLowerCase();
  let filtered = base;
  if (pref === "same") { const f = base.filter(sameTeam); filtered = f.length ? f : base; }
  else if (pref === "other") { const f = base.filter((m) => !sameTeam(m)); filtered = f.length ? f : base; }

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  // odd pool → make it a trio so no one sits out this round
  const trio = filtered.length % 2 === 1 && shuffled.length >= 2;
  const members = trio ? shuffled.slice(0, 2) : shuffled.slice(0, 1);
  return { members, trio };
}

const PALETTE = ["#5F7BFF", "#E0603D", "#3FB57A", "#E8C24A", "#9B6BD6", "#48A0C9"];
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
/* Neutral avatar colour, deliberately NOT derived from DISC, so it never hints at a type. */
export const avatarColor = (id: string) => PALETTE[hash(id) % PALETTE.length];
export const memberById = (id: string) => MOCK_MEMBERS.find((m) => m.id === id) ?? null;
