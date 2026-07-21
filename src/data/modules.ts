export type Module = {
  id: string;
  title: string;
  icon: string;
  color: string;     // candy tone
  desc: string;
  route?: string;    // where its button leads (if built)
};

/* 2.5: no fake completion percent anymore, module cards show freshness
   (last played / times this week) derived from the play log instead. */
export const MODULES: Module[] = [
  { id: "onboarding", title: "Onboarding", icon: "sparkles", color: "var(--candy-blue)", desc: "Settle in from day one." },
  { id: "bonding", title: "Bonding", icon: "heart", color: "var(--candy-peri)", desc: "Shared moments, real closeness." },
  { id: "communication", title: "Communication", icon: "message", color: "var(--candy-yellow)", desc: "Listen and speak clearly." },
  { id: "leadership", title: "Leadership", icon: "compass", color: "var(--candy-lilac)", desc: "Leadership in small steps." },
  { id: "performance", title: "Performance", icon: "target", color: "var(--candy-teal)", desc: "Healthy performance, without constant pressure." },
  { id: "conflict", title: "Conflict & Repair", icon: "bridge", color: "var(--candy-pink)", desc: "Resolve tension early and fairly." },
];
// Psychological Safety was a one-game module; its game (Fail Forward) now lives
// under Bonding (trust/safety are neighbours), so it's no longer its own card.

/* Meditation lebt im Balance Hub (Unterbereich „Meditation & Achtsamkeit“),
   nicht mehr als eigenes Modul. Als Vorschlag bei niedriger Stimmung führt es
   in den Balance Hub, siehe SignalView. */
export const MOOD_SUGGESTIONS: Record<number, string[]> = {
  1: ["balance", "bonding"],
  2: ["balance", "bonding"],
  3: ["leadership", "communication"],
  4: ["communication", "bonding"],
  5: ["leadership", "bonding"],
};
