import type { DiscType } from "../lib/store";

/* ───────────────────────── Item set (§3) ─────────────────────────
   7 blocks × 4 statements, one per dimension, balanced (each dim 7×).
   Stable ids drive the scoring; display order is shuffled at runtime. */

export interface Item {
  id: string;
  dim: DiscType;
  text: string;
}
export interface Block {
  id: string;
  prompt: string;
  items: Item[];
}

export const BLOCKS: Block[] = [
  {
    id: "b1",
    prompt: "When a new project kicks off, …",
    items: [
      { id: "b1_d", dim: "D", text: "…I like to take the wheel right away." },
      { id: "b1_i", dim: "I", text: "…I get everyone fired up with my energy." },
      { id: "b1_s", dim: "S", text: "…I make sure the team feels included." },
      { id: "b1_c", dim: "C", text: "…I first want to check the plan and the facts." },
    ],
  },
  {
    id: "b2",
    prompt: "Under stress …",
    items: [
      { id: "b2_d", dim: "D", text: "…I get impatient and want to pick up the pace." },
      { id: "b2_i", dim: "I", text: "…I talk it out with others and stay optimistic." },
      { id: "b2_s", dim: "S", text: "…I withdraw and need some quiet." },
      { id: "b2_c", dim: "C", text: "…I fall back on lists and structure." },
    ],
  },
  {
    id: "b3",
    prompt: "In a discussion, I'm won over by …",
    items: [
      { id: "b3_d", dim: "D", text: "…whoever gets to the point quickly." },
      { id: "b3_i", dim: "I", text: "…whoever brings energy and sparks enthusiasm." },
      { id: "b3_s", dim: "S", text: "…whoever stays fair and includes everyone." },
      { id: "b3_c", dim: "C", text: "…whoever argues with data and logic." },
    ],
  },
  {
    id: "b4",
    prompt: "My ideal workday …",
    items: [
      { id: "b4_d", dim: "D", text: "…is packed with challenges and wins." },
      { id: "b4_i", dim: "I", text: "…is full of people, exchange and good vibes." },
      { id: "b4_s", dim: "S", text: "…runs calmly, predictably and without surprises." },
      { id: "b4_c", dim: "C", text: "…has clear tasks that I work through cleanly." },
    ],
  },
  {
    id: "b5",
    prompt: "Others would say I'm …",
    items: [
      { id: "b5_d", dim: "D", text: "…direct and assertive." },
      { id: "b5_i", dim: "I", text: "…sociable and infectiously upbeat." },
      { id: "b5_s", dim: "S", text: "…patient and a good listener." },
      { id: "b5_c", dim: "C", text: "…thorough and detail-loving." },
    ],
  },
  {
    id: "b6",
    prompt: "When making a decision …",
    items: [
      { id: "b6_d", dim: "D", text: "…I decide quickly and stand by it." },
      { id: "b6_i", dim: "I", text: "…I go with my gut and the mood." },
      { id: "b6_s", dim: "S", text: "…I take my time so I don't step on anyone's toes." },
      { id: "b6_c", dim: "C", text: "…I weigh all the options carefully." },
    ],
  },
  {
    id: "b7",
    prompt: "What annoys me most: …",
    items: [
      { id: "b7_d", dim: "D", text: "…hesitation and endless loops." },
      { id: "b7_i", dim: "I", text: "…routine with no human contact." },
      { id: "b7_s", dim: "S", text: "…chaos, pressure and constant changes of course." },
      { id: "b7_c", dim: "C", text: "…sloppiness and a lack of precision." },
    ],
  },
  {
    id: "b8",
    prompt: "In a team, I'm most likely the one who …",
    items: [
      { id: "b8_d", dim: "D", text: "…calls the shots when no one else decides." },
      { id: "b8_i", dim: "I", text: "…keeps the mood up and connects everyone." },
      { id: "b8_s", dim: "S", text: "…mediates when things get tense." },
      { id: "b8_c", dim: "C", text: "…makes sure everything's right in the end." },
    ],
  },
  {
    id: "b9",
    prompt: "New changes …",
    items: [
      { id: "b9_d", dim: "D", text: "…I see as a chance to be out in front." },
      { id: "b9_i", dim: "I", text: "…I find exciting, as long as something's happening." },
      { id: "b9_s", dim: "S", text: "…need a bit of a run-up and reassurance for me." },
      { id: "b9_c", dim: "C", text: "…I check thoroughly before I go along." },
    ],
  },
  {
    id: "b10",
    prompt: "My biggest contribution to the team is …",
    items: [
      { id: "b10_d", dim: "D", text: "…that things get moving and get delivered." },
      { id: "b10_i", dim: "I", text: "…that the energy and the sense of unity are there." },
      { id: "b10_s", dim: "S", text: "…that everyone feels heard and safe." },
      { id: "b10_c", dim: "C", text: "…that the quality really holds up in the end." },
    ],
  },
];

/* itemId → dimension (single source of truth, derived from BLOCKS) */
const ITEM_DIMENSION: Record<string, DiscType> = Object.fromEntries(
  BLOCKS.flatMap((b) => b.items.map((it) => [it.id, it.dim]))
);

const TIE_ORDER: DiscType[] = ["D", "I", "S", "C"];

/* ───────────────────────── Scoring (§4 / §7) ───────────────────────── */

export interface BlockResponse {
  block: string;
  most: string; // itemId
  least: string; // itemId
}

export interface DiscResult {
  raw: Record<DiscType, number>;
  percent: Record<DiscType, number>;
  share: Record<DiscType, number>;
  mostCounts: Record<DiscType, number>;
  primary: DiscType;
  secondary: DiscType;
  profileCode: string;
  isBalanced: boolean;
}

function mapDims(fn: (d: DiscType) => number): Record<DiscType, number> {
  return { D: fn("D"), I: fn("I"), S: fn("S"), C: fn("C") };
}

// distribute rounding error onto the strongest dimension so the sum is exactly 100
function fixRoundingTo100(share: Record<DiscType, number>): Record<DiscType, number> {
  const diff = 100 - (share.D + share.I + share.S + share.C);
  if (diff !== 0) {
    const top = TIE_ORDER.reduce((a, b) => (share[a] >= share[b] ? a : b));
    share[top] += diff;
  }
  return share;
}

export function scoreDisc(responses: BlockResponse[]): DiscResult {
  if (responses.length !== BLOCKS.length) {
    throw new Error(`Exactly ${BLOCKS.length} blocks must be answered.`);
  }

  const raw = mapDims(() => 0);
  const mostCounts = mapDims(() => 0);

  for (const r of responses) {
    if (r.most === r.least) throw new Error(`Block ${r.block}: most and least must not be the same.`);
    const mostDim = ITEM_DIMENSION[r.most];
    const leastDim = ITEM_DIMENSION[r.least];
    if (!mostDim || !leastDim) throw new Error(`Invalid itemId in block ${r.block}.`);
    raw[mostDim] += 2; // "most" is the stronger signal
    raw[leastDim] -= 1;
    mostCounts[mostDim] += 1;
  }

  // Normalisation: raw ∈ [-7, +14] → shift by 7 → [0, 21]
  const SHIFT = BLOCKS.length; // 7
  const RANGE = BLOCKS.length * 3; // 21
  const shifted = mapDims((d) => raw[d] + SHIFT);
  const sumShifted = shifted.D + shifted.I + shifted.S + shifted.C;

  const percent = mapDims((d) => Math.round((shifted[d] / RANGE) * 100));
  const share = fixRoundingTo100(mapDims((d) => Math.round((shifted[d] / sumShifted) * 100)));

  // Primary / secondary: raw desc → most-votes → fixed D>I>S>C order
  const sorted = (TIE_ORDER.slice() as DiscType[]).sort((a, b) => {
    if (raw[b] !== raw[a]) return raw[b] - raw[a];
    if (mostCounts[b] !== mostCounts[a]) return mostCounts[b] - mostCounts[a];
    return TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b);
  });

  const rawValues = TIE_ORDER.map((d) => raw[d]);
  // threshold scales with block count (v1: 7 blocks → 3, v2: 10 blocks → 4)
  const BALANCED_THRESHOLD = BLOCKS.length >= 10 ? 4 : 3;
  const isBalanced = Math.max(...rawValues) - Math.min(...rawValues) <= BALANCED_THRESHOLD;

  return {
    raw,
    percent,
    share,
    mostCounts,
    primary: sorted[0],
    secondary: sorted[1],
    profileCode: sorted.join(""),
    isBalanced,
  };
}

/* Fisher–Yates shuffle (runtime option-order randomisation) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
