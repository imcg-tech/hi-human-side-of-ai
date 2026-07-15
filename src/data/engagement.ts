/* Engagement-System: sanfter Sog statt Druck. Verzeihendes Momentum,
   rotierendes Wochen-Thema, anonyme Team-Signale. Keine harten Streaks,
   kein Einzel-Ranking, keine Schuld bei Nicht-Teilnahme. */

import { MOCK_MEMBERS } from "./teamInsights";

/* Deterministische Kalenderwoche, damit Thema & Team-Signal pro Woche stabil sind. */
export function weekOfYear(d: Date = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return Math.floor((days + start.getDay()) / 7);
}

/* ── Säule 1: rotierendes Wochen-Thema (Frische gegen Neuheits-Abfall) ── */
export interface WeeklyTheme { title: string; line: string; moduleId: string; route: string; }
export const WEEKLY_THEMES: WeeklyTheme[] = [
  { title: "Week of clarity", line: "Small exercises for clear, fair communication.", moduleId: "communication", route: "/app/module/communication" },
  { title: "Week of connection", line: "Closer together, with no effort.", moduleId: "bonding", route: "/app/module/bonding" },
  { title: "Week of calm", line: "Take a breath and recharge.", moduleId: "meditation", route: "/meditation" },
  { title: "Week of goals", line: "Goals that pull rather than push.", moduleId: "performance", route: "/app/module/performance" },
  { title: "Week of trust", line: "Mistakes are okay, and here you practice that.", moduleId: "safety", route: "/app/module/safety" },
  { title: "Week of arriving", line: "Good to have you here, a warm start.", moduleId: "onboarding", route: "/app/module/onboarding" },
];
export const currentTheme = (d: Date = new Date()): WeeklyTheme => WEEKLY_THEMES[weekOfYear(d) % WEEKLY_THEMES.length];

/* ── Säule 2: verzeihendes Momentum ── */
export function momentumLabel(momentum: number, justReturned: boolean): { title: string; line: string } {
  if (justReturned) return { title: "Good to have you back", line: "No day lost. Your momentum picks right back up." };
  if (momentum >= 65) return { title: "You're in a nice flow", line: "A good rhythm, with no pressure." };
  if (momentum >= 35) return { title: "A calm rhythm", line: "Dropping by now and then is plenty." };
  if (momentum > 0) return { title: "Nice and easy", line: "No must. A small moment is enough." };
  return { title: "Welcome", line: "Have a look around. There's no quota." };
}

/* Aktive Tage im wohlwollenden 7-Tage-Fenster (3 von 7 „reicht“ für die Woche). */
export function weeklyActive(activeDays: string[], now: Date = new Date()): number {
  const t = now.getTime();
  return activeDays.filter((d) => t - Date.parse(d) < 7 * 86400000).length;
}

/* Sanfte Welle statt Kette: Amplitude wächst mit dem Momentum. */
export function wavePath(momentum: number, w = 280, h = 56): string {
  const amp = 3 + (Math.max(0, Math.min(100, momentum)) / 100) * (h * 0.34);
  const mid = h * 0.58;
  const steps = 48;
  let d = `M0 ${mid.toFixed(1)}`;
  for (let i = 1; i <= steps; i++) {
    const x = (w * i) / steps;
    const y = mid - Math.sin((i / steps) * Math.PI * 2.4) * amp;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ` L ${w} ${h} L 0 ${h} Z`;
}

/* ── Säule 4: anonymes Team-Signal (keine Namen, keine Bloßstellung) ── */
export function teamActiveThisWeek(d: Date = new Date()): { active: number; total: number } {
  const total = MOCK_MEMBERS.length;
  const active = Math.min(total, 3 + (weekOfYear(d) % Math.max(1, total - 2))); // 3..total, stabil pro Woche
  return { active, total };
}
