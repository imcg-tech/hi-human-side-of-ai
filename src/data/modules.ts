export type Module = {
  id: string;
  title: string;
  icon: string;
  color: string;     // candy tone
  desc: string;
  pct: number;
  route?: string;    // where its button leads (if built)
};

export const MODULES: Module[] = [
  { id: "onboarding", title: "Onboarding", icon: "sparkles", color: "var(--candy-blue)", desc: "Settle in from day one.", pct: 0 },
  { id: "bonding", title: "Bonding", icon: "heart", color: "var(--candy-peri)", desc: "Shared moments, real closeness.", pct: 80 },
  { id: "communication", title: "Communication", icon: "message", color: "var(--candy-yellow)", desc: "Listen and speak clearly.", pct: 62 },
  { id: "leadership", title: "Leadership", icon: "compass", color: "var(--candy-lilac)", desc: "Leadership in small steps.", pct: 45 },
  { id: "performance", title: "Performance", icon: "target", color: "var(--candy-teal)", desc: "Healthy performance, without constant pressure.", pct: 0 },
  { id: "safety", title: "Psychological Safety", icon: "shield", color: "var(--candy-mint)", desc: "Mistakes are okay.", pct: 20 },
  { id: "conflict", title: "Conflict & Repair", icon: "bridge", color: "var(--candy-pink)", desc: "Resolve tension early and fairly.", pct: 0 },
];

/* Meditation lebt im Balance Hub (Unterbereich „Meditation & Achtsamkeit“),
   nicht mehr als eigenes Modul. Als Vorschlag bei niedriger Stimmung führt es
   in den Balance Hub, siehe SignalView. */
export const MOOD_SUGGESTIONS: Record<number, string[]> = {
  1: ["balance", "safety"],
  2: ["balance", "bonding"],
  3: ["leadership", "communication"],
  4: ["communication", "bonding"],
  5: ["leadership", "bonding"],
};
