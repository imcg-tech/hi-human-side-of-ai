import type { DiscType } from "../lib/store";
import { DISC_INFO } from "./disc";

/* ───────── Team Insights & Matching (Handover §2–§4) ─────────
   Insight- & Gesprächs-Layer auf dem DISC-Assessment. Bewusst KEIN harter
   Kompatibilitäts-Score, beschreibende Hinweise + Tipps. */

export type Dim = DiscType;
export const DIMS: Dim[] = ["D", "I", "S", "C"];
const BLIND_SPOT_THRESHOLD = 35;

export interface MemberProfile {
  id: string;
  name: string;
  initials: string;
  role: string;
  primary: Dim;
  secondary?: Dim;
  percent: Record<Dim, number>;
  country?: string; // ISO code (Herkunft)
  consentShared: boolean;
}

/* Mock-Team (Demo-Vorschau, bis echte Profile geteilt sind) */
export const MOCK_MEMBERS: MemberProfile[] = [
  { id: "lena", name: "Lena Brandt", initials: "LB", role: "Design Lead", primary: "S", secondary: "C", percent: { D: 25, I: 45, S: 78, C: 55 }, country: "DE", consentShared: true },
  { id: "theo", name: "Theo Voss", initials: "TV", role: "Engineering", primary: "D", secondary: "I", percent: { D: 80, I: 55, S: 25, C: 40 }, country: "US", consentShared: true },
  { id: "mara", name: "Mara Iqbal", initials: "MI", role: "Product", primary: "I", secondary: "S", percent: { D: 45, I: 82, S: 58, C: 35 }, country: "SE", consentShared: true },
  { id: "cem", name: "Cem Kraus", initials: "CK", role: "Data", primary: "C", secondary: "S", percent: { D: 30, I: 35, S: 55, C: 80 }, country: "JP", consentShared: true },
  { id: "ada", name: "Ada Roth", initials: "AR", role: "Marketing", primary: "I", secondary: "D", percent: { D: 55, I: 78, S: 40, C: 35 }, country: "BR", consentShared: true },
  { id: "jon", name: "Jon Peix", initials: "JP", role: "Sales", primary: "D", secondary: "C", percent: { D: 82, I: 48, S: 30, C: 55 }, country: "GB", consentShared: true },
];

export const discColor = (d: Dim) => DISC_INFO[d].color;

/* ───────── Team-Landkarte (§2) ───────── */

export interface TeamInsights {
  teamSize: number;
  distribution: Record<Dim, number>;
  teamProfile: Record<Dim, number>;
  dominantAxis: Dim[];
  blindSpots: Dim[];
  diversityLabel: string;
  headline: string;
  cards: { emoji: string; text: string }[];
}

export function buildTeamInsights(members: MemberProfile[]): TeamInsights | null {
  const shared = members.filter((m) => m.consentShared);
  if (shared.length < 3) return null;

  const distribution: Record<Dim, number> = { D: 0, I: 0, S: 0, C: 0 };
  const sum: Record<Dim, number> = { D: 0, I: 0, S: 0, C: 0 };
  for (const m of shared) {
    distribution[m.primary] += 1;
    for (const d of DIMS) sum[d] += m.percent[d];
  }
  const teamProfile = DIMS.reduce((acc, d) => { acc[d] = Math.round(sum[d] / shared.length); return acc; }, {} as Record<Dim, number>);

  const maxVal = Math.max(...DIMS.map((d) => teamProfile[d]));
  const dominantAxis = DIMS.filter((d) => teamProfile[d] === maxVal);
  const blindSpots = DIMS.filter((d) => distribution[d] === 0 && teamProfile[d] < BLIND_SPOT_THRESHOLD);

  const represented = DIMS.filter((d) => distribution[d] > 0).length;
  const diversityLabel =
    represented === 4 ? "richly mixed" :
    represented === 3 ? "well balanced" :
    represented === 2 ? "clear focus" : "very homogeneous";

  return { teamSize: shared.length, distribution, teamProfile, dominantAxis, blindSpots, diversityLabel, headline: teamHeadline(dominantAxis, blindSpots), cards: teamCards(dominantAxis, blindSpots, diversityLabel) };
}

const DOM_WORD: Record<Dim, string> = { D: "fast-paced", I: "energized", S: "connected", C: "thorough" };
const GAP_WORD: Record<Dim, string> = { D: "Pace", I: "Enthusiasm", S: "Cohesion", C: "Precision" };

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function teamHeadline(dominant: Dim[], blind: Dim[]): string {
  const top = cap(dominant.map((d) => DOM_WORD[d]).join(" & "));
  return blind.length ? `${top} – with a gap in ${GAP_WORD[blind[0]]}` : top;
}

const DOM_CARD: Record<Dim, { emoji: string; text: string }> = {
  D: { emoji: "🚀", text: "Your team leans strongly toward pace & results. You get into action fast, just make sure no one gets left behind in the rush." },
  I: { emoji: "✨", text: "There's a lot of energy and enthusiasm here. You carry each other along, sometimes a bit more structure helps you stay on track." },
  S: { emoji: "🪨", text: "Your team is built on cohesion and reliability. A warm foundation, don't be afraid to pick up the pace and take a risk now and then." },
  C: { emoji: "📐", text: "You're thorough and quality-minded. People can count on you, every now and then it's okay to go easy and settle for ‘good enough'." },
};
const BLIND_CARD: Record<Dim, { emoji: string; text: string }> = {
  D: { emoji: "🚀", text: "Little ‘driver' energy in the team, who makes the decisions and sets the pace when it counts?" },
  I: { emoji: "✨", text: "Little ‘spark' energy in the team, who brings the enthusiasm and the outward presence?" },
  S: { emoji: "🪨", text: "Little ‘rock' energy in the team, who watches the mood, the balance and the cohesion when things get stressful?" },
  C: { emoji: "📐", text: "Little ‘architect' energy in the team, who ensures quality, structure and an eye for detail?" },
};
const DIVERSITY_CARD: Record<string, { emoji: string; text: string }> = {
  "richly mixed": { emoji: "🌈", text: "Your team covers every style, you've got someone for almost any situation. The art: use the differences as a strength, not as friction." },
  "well balanced": { emoji: "⚖️", text: "You're well balanced, different strengths come together. Make deliberate use of that when sharing out roles." },
  "clear focus": { emoji: "🎯", text: "You have a clear focus. That gives you a profile, keep an eye on which perspectives are less often represented." },
  "very homogeneous": { emoji: "👯", text: "You tick alike, which makes it easy to agree, but watch out for blind spots. Who deliberately plays the counterpart?" },
};

function teamCards(dominant: Dim[], blind: Dim[], diversity: string): { emoji: string; text: string }[] {
  const cards = [DOM_CARD[dominant[0]]];
  if (blind.length) cards.push(BLIND_CARD[blind[0]]);
  cards.push(DIVERSITY_CARD[diversity]);
  return cards.slice(0, 3);
}

/* ───────── 1:1-Insights (§3) ───────── */

export type Constellation = "gleich" | "synergetisch" | "komplementär" | "spannungsreich";

const CONSTELLATION_MATRIX: Record<Dim, Record<Dim, Constellation>> = {
  D: { D: "gleich", I: "synergetisch", S: "spannungsreich", C: "komplementär" },
  I: { D: "synergetisch", I: "gleich", S: "komplementär", C: "spannungsreich" },
  S: { D: "spannungsreich", I: "komplementär", S: "gleich", C: "synergetisch" },
  C: { D: "komplementär", I: "spannungsreich", S: "synergetisch", C: "gleich" },
};
export const INDICATOR: Record<Constellation, string> = { gleich: "🟡", synergetisch: "🟢", komplementär: "🟡", spannungsreich: "🟠" };

interface PairText { complementarity: string; friction: string; tips: string[]; }

const PAIR_TEXTS: Record<string, PairText> = {
  CD: { complementarity: "D brings pace and decisiveness, C brings care and quality, fast and clean.", friction: "D wants to get going, C wants to check first, which can slow each other down.", tips: ["Agree upfront when ‘fast enough' is enough and when thoroughness comes first.", "D: give C time for the check.", "C: flag early what's truly critical."] },
  DS: { complementarity: "D drives things forward, S provides stability and holds the team together.", friction: "D finds S too hesitant, S finds D too abrupt.", tips: ["D: explain the ‘why' and give some lead time.", "S: actively say what you need to feel secure."] },
  IS: { complementarity: "I brings energy and outward presence, S brings calm and reliability.", friction: "I can overwhelm S with the pace; S can seem too reserved to I.", tips: ["I: actively bring S on board and add structure.", "S: dare to slow I down now and then."] },
  CI: { complementarity: "I brings enthusiasm and connects people, C brings logic and precision.", friction: "I finds C a brake, C finds I erratic.", tips: ["I: back your ideas with facts.", "C: acknowledge the energy before diving into detail."] },
  DI: { complementarity: "Two bundles of energy, together you bring a lot of drive and impact.", friction: "Both want to be out front, which can create friction over visibility.", tips: ["Share the stage deliberately.", "Make sure quieter voices get heard too."] },
  CS: { complementarity: "Both value reliability, S on the human side, C on the factual side. A stable, thorough duo.", friction: "Together you can be change-averse, new things may sit untouched.", tips: ["Deliberately set yourselves prompts for change.", "Bring in someone with pace when things get stuck."] },
};

const SAME_TYPE_TEXT: PairText = { complementarity: "You tick alike and click quickly.", friction: "You share the same blind spots.", tips: ["Think about who deliberately brings in the missing perspective."] };

const DISCLAIMER = "A rough rule of thumb to spark conversation, not a verdict on how you work together.";

export interface PairInsight {
  primaryA: Dim; primaryB: Dim;
  constellation: Constellation;
  indicator: string;
  complementarity: string;
  friction: string;
  tips: string[];
  disclaimer: string;
}

export function buildPairInsight(pa: Dim, pb: Dim): PairInsight {
  const constellation = CONSTELLATION_MATRIX[pa][pb];
  const text = pa === pb ? SAME_TYPE_TEXT : (PAIR_TEXTS[[pa, pb].sort().join("")] ?? SAME_TYPE_TEXT);
  return { primaryA: pa, primaryB: pb, constellation, indicator: INDICATOR[constellation], complementarity: text.complementarity, friction: text.friction, tips: text.tips, disclaimer: DISCLAIMER };
}
