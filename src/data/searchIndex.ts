/* Such-Index für die globale Suche (Autocomplete). Aus vorhandenen Daten
   aufgebaut: Spiele, Module/Bereiche, Balance-Unterbereiche, Schnellziele. */

import { GAME_LIST } from "./games";
import { MODULES } from "./modules";
import { SUBAREAS } from "./balance";

export interface SearchEntry { label: string; sub: string; route: string; kind: string; icon: string; }

export const SEARCH_INDEX: SearchEntry[] = [
  ...MODULES.map((m) => ({ label: m.title, sub: m.desc, route: m.route ?? `/app/module/${m.id}`, kind: "Area", icon: m.icon })),
  ...GAME_LIST.map((g) => ({ label: g.title, sub: g.skill, route: g.route ?? `/app/game/${g.key}`, kind: "Game", icon: "play" })),
  ...SUBAREAS.map((s) => ({ label: s.title, sub: s.tagline, route: "/app/balance", kind: "Balance", icon: "heart" })),
  { label: "Choose your mood", sub: "How are you today?", route: "/app/signal", kind: "Mood", icon: "signal" },
  { label: "Meditation", sub: "Breathe and unwind", route: "/meditation", kind: "Balance", icon: "leaf" },
  { label: "Star Map", sub: "The company's shared world", route: "/network", kind: "Universe", icon: "sparkles" },
];

const norm = (s: string) => s.toLowerCase();

export function searchAll(query: string, limit = 8): SearchEntry[] {
  const q = norm(query.trim());
  if (!q) return [];
  const scored = SEARCH_INDEX.map((e) => {
    const label = norm(e.label), sub = norm(e.sub);
    let score = 0;
    if (label.startsWith(q)) score = 3;
    else if (label.includes(q)) score = 2;
    else if (sub.includes(q)) score = 1;
    return { e, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || a.e.label.localeCompare(b.e.label));
  return scored.slice(0, limit).map((x) => x.e);
}
