/* Defuse, asymmetric live game. The defuser sees the device, the experts the manual.
   Rule-based, procedurally generated (no physics engine). */

export const WIRE_COLORS: Record<string, { label: string; hex: string }> = {
  rot: { label: "red", hex: "#E0524A" },
  blau: { label: "blue", hex: "#3E8EF7" },
  weiss: { label: "white", hex: "#EDEAE3" },
  gelb: { label: "yellow", hex: "#E8C24A" },
  schwarz: { label: "black", hex: "#2A2722" },
};
const WIRE_IDS = Object.keys(WIRE_COLORS);

export const SYMBOL_MAP: Record<string, string> = { "✦": "1", "❖": "2", "◈": "3", "☀": "4", "⚡": "5", "✶": "6", "✕": "7", "✜": "8" };
const SYMBOLS = Object.keys(SYMBOL_MAP);
const BTN_COLORS: Record<string, string> = { rot: "#E0524A", blau: "#3E8EF7", gruen: "#3FB57A", gelb: "#E8C24A" };

const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: T[]) => a[rnd(a.length)];
function sample<T>(a: T[], n: number): T[] { const x = [...a]; const out: T[] = []; for (let i = 0; i < n && x.length; i++) out.push(x.splice(rnd(x.length), 1)[0]); return out; }

export type Module =
  | { type: "wire"; wires: string[]; solution: number }
  | { type: "buttons"; buttons: { value: number; color: string }[]; order: number[] }
  | { type: "code"; symbols: string[]; code: string };

function genWire(): Module {
  const n = 4 + rnd(3); // 4–6
  const wires = Array.from({ length: n }, () => pick(WIRE_IDS));
  const reds = wires.map((w, i) => (w === "rot" ? i : -1)).filter((i) => i >= 0);
  let solution: number;
  if (reds.length > 1 && wires[n - 1] === "weiss") solution = reds[1];
  else if (reds.length === 0) solution = 2;
  else solution = n - 1;
  return { type: "wire", wires, solution };
}
function genButtons(): Module {
  const n = 3 + rnd(2); // 3–4
  const values = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], n);
  const buttons = values.map((v) => ({ value: v, color: pick(Object.keys(BTN_COLORS)) }));
  // at least one non-yellow button
  if (buttons.every((b) => b.color === "gelb")) buttons[0].color = "blau";
  const order = buttons.map((_, i) => i).filter((i) => buttons[i].color !== "gelb").sort((a, b) => buttons[a].value - buttons[b].value);
  return { type: "buttons", buttons, order };
}
function genCode(): Module {
  const symbols = sample(SYMBOLS, 3);
  return { type: "code", symbols, code: symbols.map((s) => SYMBOL_MAP[s]).join("") };
}

export function generateDevice(level: "einstieg" | "standard" = "standard"): Module[] {
  return level === "einstieg" ? [genWire(), genCode()] : [genWire(), genButtons(), genCode()];
}

export const btnColorHex = (c: string) => BTN_COLORS[c] ?? "#999";

/* Manual (static) for the experts */
export const MANUAL = [
  { type: "wire", title: "🔌 Wire module", rules: [
    "The defuser cuts exactly ONE wire. Ask for colors and order.",
    "If there's more than one red wire AND the last wire is white → cut the second red wire.",
    "If there's no red wire → cut the third wire.",
    "Otherwise → cut the last wire.",
  ] },
  { type: "buttons", title: "🔘 Button module", rules: [
    "Press the buttons in ascending order of their number.",
    "BUT: skip all yellow buttons entirely.",
    "Have the number + color of each button read out before you start.",
  ] },
  { type: "code", title: "🔣 Code module", rules: [
    "The defuser sees 3 symbols. Translate them into digits with this table:",
    "✦=1 · ❖=2 · ◈=3 · ☀=4 · ⚡=5 · ✶=6 · ✕=7 · ✜=8",
    "The 3-digit code is entered by the defuser.",
  ] },
];

export const DEBRIEF = [
  "Where were there misunderstandings, and why?",
  "What helped you get on the same page quickly?",
  "Who brought structure when it got hectic?",
];
