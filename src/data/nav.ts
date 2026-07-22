/* Navigations-Struktur (Informationsarchitektur). Verspielte Hauptwörter +
   erdende Untertitel. Icons/Farbwelten konsistent mit den Panel-Kacheln.
   Reine Struktur, kein neues visuelles System. */

import { MODULES } from "./modules";
import { SUBAREAS } from "./balance";

export interface NavChild { label: string; route: string; icon?: string; color?: string; }
export interface NavItem {
  id: string;            // Segment nach /app/ (Home = "")
  label: string;
  subtitle?: string;
  icon: string;
  route: string;
  color: string;         // dezenter Akzent (Punkt/Balken), aus der Palette
  match: string[];       // Segmente, die diesen Bereich aktiv machen
  children?: NavChild[];
}

/* Module als Unterpunkte, gleiche Icons + Farben wie die Kacheln. */
const moduleChildren: NavChild[] = MODULES.map((m) => ({
  label: m.title, route: m.route ?? `/app/module/${m.id}`, icon: m.icon, color: m.color,
}));

/* Balance-Unterbereiche (Sektionen des Hub, führen in den Hub). */
const balanceChildren: NavChild[] = SUBAREAS.map((s) => ({
  label: s.title.split(" & ")[0], route: "/app/balance", color: s.color,
}));

export const NAV_ITEMS: NavItem[] = [
  { id: "", label: "Home", subtitle: "Your week at a glance", icon: "home", route: "/app", color: "var(--text-secondary)", match: [""] },
  {
    id: "team", label: "Team", subtitle: "People & company", icon: "users", route: "/app/team", color: "var(--candy-peri)",
    match: ["team", "culture"],
    children: [
      { label: "Team", route: "/app/team", icon: "users", color: "var(--candy-peri)" },
      { label: "Culture Map", route: "/app/culture", icon: "compass", color: "var(--candy-lilac)" },
      { label: "Star Map", route: "/network", icon: "sparkles", color: "var(--candy-blue)" },
    ],
  },
  {
    id: "modules", label: "Modules", subtitle: "Play & Grow", icon: "grid", route: "/app/modules", color: "var(--candy-lilac)",
    match: ["modules", "module", "game", "live", "performance", "onboarding", "conflict", "communication"],
    children: moduleChildren,
  },
  {
    id: "balance", label: "Balance", subtitle: "Your Space", icon: "heart", route: "/app/balance", color: "var(--candy-mint)",
    match: ["balance"],
    children: balanceChildren,
  },
  { id: "signal", label: "Mood", subtitle: "Check-in & trends", icon: "signal", route: "/app/signal", color: "var(--candy-blue)", match: ["signal", "pulse"] },
];

/* Welcher Bereich ist zum aktuellen Segment aktiv? */
export function activeNavId(seg: string): string {
  const first = seg.split("/")[0];
  if (seg === "") return "";
  const hit = NAV_ITEMS.find((n) => n.id !== "" && n.match.includes(first));
  return hit?.id ?? "";
}
