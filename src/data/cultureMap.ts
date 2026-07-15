/* Culture Map, angelehnt an Erin Meyer „The Culture Map" / Hofstede.
   Positionen 0–100 sind illustrative Tendenzen, kein Stereotyp, als Gesprächsöffner.
   Keys = ISO-Ländercodes (siehe data/countries.ts). Fehlt ein Land, gilt 50 (neutral). */

export interface CultureDim {
  key: string;
  title: string;
  left: string;
  right: string;
  pos: Record<string, number>;
}

export const CULTURE_DIMS: CultureDim[] = [
  { key: "komm", title: "Communicating", left: "explicit / direct", right: "implicit / between the lines",
    pos: { US: 8, AU: 15, NL: 14, DE: 12, AT: 15, CH: 14, GB: 18, SE: 22, FR: 50, ES: 45, BR: 55, IT: 60, MX: 62, NG: 65, IN: 75, KR: 85, CN: 88, JP: 95 } },
  { key: "krit", title: "Giving feedback", left: "direct", right: "indirect / softened",
    pos: { DE: 10, AT: 15, CH: 18, NL: 15, SE: 25, FR: 28, GB: 30, IT: 38, NG: 42, AU: 45, US: 50, ES: 40, BR: 55, IN: 70, KR: 78, CN: 80, JP: 90, MX: 58 } },
  { key: "zeit", title: "Time & planning", left: "linear / strictly on time", right: "flexible",
    pos: { CH: 8, DE: 5, AT: 10, JP: 12, NL: 18, SE: 22, GB: 20, AU: 28, US: 30, CN: 40, KR: 35, FR: 45, IT: 60, ES: 62, MX: 70, BR: 75, IN: 80, NG: 85 } },
  { key: "entsch", title: "Deciding", left: "top-down (the boss decides)", right: "by consensus",
    pos: { NG: 18, IN: 25, MX: 30, BR: 35, US: 42, ES: 45, IT: 48, GB: 50, AU: 55, FR: 60, AT: 65, DE: 70, CH: 70, CN: 75, KR: 80, NL: 85, JP: 88, SE: 95 } },
  { key: "vertr", title: "Building trust", left: "through the task", right: "through the relationship",
    pos: { US: 10, AU: 15, GB: 18, SE: 20, NL: 22, DE: 25, AT: 28, CH: 30, FR: 45, JP: 55, ES: 62, IT: 65, KR: 70, IN: 70, MX: 75, CN: 78, BR: 80, NG: 88 } },
];

export const culturePos = (dim: CultureDim, code: string | null): number => (code && dim.pos[code] != null ? dim.pos[code] : 50);
export const hasCultureData = (code: string | null): boolean => !!code && CULTURE_DIMS.some((d) => d.pos[code] != null);
