/* Search index for the global search (autocomplete). Built from existing data:
   games, modules/areas, balance sub-areas + their built games, quick targets.
   Each entry can carry `keywords` so the "topic" facet (feedback, trust, stress …)
   resolves even when the word isn't in the visible label. */

import { GAME_LIST } from "./games";
import { MODULES } from "./modules";
import { SUBAREAS } from "./balance";

export interface SearchEntry { label: string; sub: string; route: string; kind: string; icon: string; keywords?: string[] }

// Topical keywords per module, so searching a theme lands somewhere sensible.
const MODULE_TOPICS: Record<string, string[]> = {
  onboarding: ["onboarding", "first week", "new hire", "settling in", "start"],
  bonding: ["bonding", "connection", "trust", "closeness", "team building", "icebreaker"],
  communication: ["communication", "feedback", "listening", "asking", "clarity", "conversation"],
  leadership: ["leadership", "coaching", "delegation", "1:1", "managing", "feedback"],
  performance: ["performance", "goals", "focus", "pressure", "productivity", "burnout"],
  safety: ["psychological safety", "mistakes", "openness", "speaking up", "trust"],
  conflict: ["conflict", "repair", "tension", "disagreement", "de-escalation", "apology"],
};

// Extra topic aliases for balance exercises where the search term differs from the title.
const BALANCE_ALIASES: Record<string, string[]> = {
  boundary: ["boundaries", "saying no", "overwork", "work life balance"],
  recovery: ["recharge", "rest", "recovery"],
  reset: ["break", "reset", "between meetings"],
  valve: ["stress", "overwhelm", "panic", "acute"],
  gratitude: ["gratitude", "thankful", "appreciation"],
  reachout: ["loneliness", "isolation", "reach out"],
  notalone: ["loneliness", "not alone", "shared feelings"],
  coffee: ["coffee", "random chat", "virtual coffee"],
};

export const SEARCH_INDEX: SearchEntry[] = [
  ...MODULES.map((m) => ({ label: m.title, sub: m.desc, route: m.route ?? `/app/module/${m.id}`, kind: "Area", icon: m.icon, keywords: MODULE_TOPICS[m.id] })),
  ...GAME_LIST.map((g) => ({ label: g.title, sub: g.skill, route: g.route ?? `/app/game/${g.key}`, kind: "Game", icon: "play", keywords: g.concepts })),
  // Individual built balance exercises (Pressure Valve, Boundary Builder, …), not just the sub-area.
  ...SUBAREAS.flatMap((s) => s.games.filter((g) => g.status === "built" && g.route).map((g) => ({ label: g.title, sub: g.desc, route: g.route!, kind: "Balance", icon: "leaf", keywords: [s.title.toLowerCase(), s.tagline.toLowerCase(), ...(BALANCE_ALIASES[g.id] ?? [])] }))),
  ...SUBAREAS.map((s) => ({ label: s.title, sub: s.tagline, route: "/app/balance", kind: "Balance", icon: "heart" })),
  { label: "Check-in", sub: "How are you today?", route: "/app/signal", kind: "Mood", icon: "signal", keywords: ["mood", "feeling", "check in", "how am i", "wellbeing"] },
  { label: "Team Pulse", sub: "The team's anonymous mood", route: "/app/signal", kind: "Mood", icon: "signal", keywords: ["pulse", "team mood", "morale"] },
  { label: "Meditation", sub: "Breathe and unwind", route: "/meditation", kind: "Balance", icon: "leaf", keywords: ["breathe", "calm", "mindfulness", "relax", "stress"] },
  { label: "Star Map", sub: "The company's shared world", route: "/network", kind: "Universe", icon: "sparkles", keywords: ["company", "team", "people", "colleagues"] },
];

const norm = (s: string) => s.toLowerCase();

export function searchAll(query: string, limit = 8): SearchEntry[] {
  const q = norm(query.trim());
  if (!q) return [];
  const scored = SEARCH_INDEX.map((e) => {
    const label = norm(e.label), sub = norm(e.sub);
    let score = 0;
    if (label.startsWith(q)) score = 4;
    else if (label.includes(q)) score = 3;
    else if (sub.includes(q)) score = 2;
    else if (e.keywords?.some((k) => k.includes(q) || q.includes(k))) score = 1; // topic match
    return { e, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || a.e.label.localeCompare(b.e.label));
  return scored.slice(0, limit).map((x) => x.e);
}
