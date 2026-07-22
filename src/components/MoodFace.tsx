/* Geometric mood faces, flat, friendly, one per mood. Elements carry classes
   (mf-eye, mf-mouth, mf-extra) so the Signal screen can animate them with GSAP. */

export type MoodFaceDef = {
  label: string;
  color: string;
  mouth?: string;        // stroked mouth path
  openMouth?: boolean;   // filled grin instead
  lids?: number;         // 0..1 eyelid coverage (sleepy)
  pupilY?: number;       // pupil vertical offset
  drop?: boolean;        // sweat drop
  cheeks?: boolean;      // rosy cheeks
  sparkle?: boolean;     // energy sparkles
};

export const MOODS: Record<number, MoodFaceDef> = {
  1: { label: "Drained", color: "var(--danger)", mouth: "M64,142 Q100,120 136,142", lids: 0.5, pupilY: 4, drop: true },
  2: { label: "Tired", color: "var(--warning)", mouth: "M70,135 Q100,128 130,135", lids: 0.38, pupilY: 2 },
  3: { label: "Okay", color: "var(--candy-blue)", mouth: "M72,133 L128,133", lids: 0, pupilY: 0 },
  4: { label: "Good", color: "var(--disc-s)", mouth: "M66,126 Q100,150 134,126", lids: 0, pupilY: -1, cheeks: true },
  5: { label: "Energized", color: "var(--brand)", openMouth: true, lids: 0, pupilY: -2, sparkle: true },
};

function Eye({ cx, f }: { cx: number; f: MoodFaceDef }) {
  const cy = 96, r = 22;
  return (
    <g className="mf-eye">
      <circle cx={cx} cy={cy} r={r} fill="#FAF8F4" />
      <circle cx={cx} cy={cy + (f.pupilY ?? 0)} r={11} fill="#1C1A17" />
      <circle cx={cx + 4} cy={cy + (f.pupilY ?? 0) - 4} r={3.4} fill="#FAF8F4" />
      {f.lids ? <circle cx={cx} cy={cy - r * (1 - f.lids)} r={r} fill={f.color} /> : null}
    </g>
  );
}

export default function MoodFace({ mood = 3, size = 168, bleed = false }: { mood?: number; size?: number; bleed?: boolean }) {
  const f = MOODS[mood] || MOODS[3];
  return (
    <svg className="mood-svg" width={bleed ? "100%" : size} height={bleed ? "100%" : size}
      viewBox={bleed ? "26 30 148 132" : "0 0 200 200"}
      preserveAspectRatio="xMidYMid meet" role="img" aria-label={f.label}>
      {/* head, omitted in bleed mode so the parent card provides the colour */}
      {!bleed && <rect className="mf-head" x="18" y="18" width="164" height="164" rx="58" fill={f.color} />}

      {/* sparkles (energetic) */}
      {f.sparkle && (
        <g className="mf-extra" fill="#FAF8F4">
          <path d="M40 44 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" opacity="0.95" />
          <path d="M166 60 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5 z" opacity="0.9" />
        </g>
      )}

      {/* cheeks (gut) */}
      {f.cheeks && (
        <g className="mf-extra" fill="#FF2E7E" opacity="0.35">
          <circle cx="58" cy="124" r="11" />
          <circle cx="142" cy="124" r="11" />
        </g>
      )}

      <Eye cx={72} f={f} />
      <Eye cx={128} f={f} />

      {/* mouth */}
      {f.openMouth ? (
        <path className="mf-mouth" d="M64,120 Q100,172 136,120 Q100,140 64,120 Z" fill="#1C1A17" />
      ) : (
        <path className="mf-mouth" d={f.mouth} stroke="#1C1A17" strokeWidth="8" fill="none" strokeLinecap="round" />
      )}

      {/* sweat drop (erschöpft) */}
      {f.drop && (
        <path className="mf-extra" d="M150 58 C150 70 158 74 158 82 a8 8 0 0 1 -16 0 c0 -8 8 -12 8 -24 z" fill="#3E8EF7" />
      )}
    </svg>
  );
}

/* ── Reaction emoji ─────────────────────────────────────────────────────
   Same visual language as the mood faces above (round head, big cream eyes,
   ink mouth) but keyed by name for use across games, reactions and feedback.
   Independent of the 1..5 mood scale, so it doesn't touch Signal / Dashboard. */

const INK = "#1C1A17";
const CREAM = "#FAF8F4";
const RED = "#F2415A";
const EYE_LX = 72, EYE_RX = 128, EYE_Y = 96;

export type HiEmojiName =
  | "win" | "laugh" | "wow" | "love" | "cool"
  | "think" | "party" | "focus" | "sad" | "mindblown";

export const HI_EMOJI: { name: HiEmojiName; label: string; color: string }[] = [
  { name: "win", label: "Win", color: "var(--brand)" },
  { name: "laugh", label: "Laughing", color: "var(--candy-yellow)" },
  { name: "wow", label: "Wow", color: "var(--candy-peri)" },
  { name: "love", label: "Love", color: "var(--candy-pink)" },
  { name: "cool", label: "Cool", color: "var(--candy-teal)" },
  { name: "think", label: "Thinking", color: "var(--candy-blue)" },
  { name: "party", label: "Party", color: "var(--candy-lilac)" },
  { name: "focus", label: "Focus", color: "var(--warning)" },
  { name: "sad", label: "Sad", color: "var(--info)" },
  { name: "mindblown", label: "Mind blown", color: "var(--candy-green)" },
];

const EMOJI_COLOR = Object.fromEntries(HI_EMOJI.map((e) => [e.name, e.color])) as Record<HiEmojiName, string>;

function star(cx: number, cy: number, outer: number, inner: number) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return d + "Z";
}

function heart(cx: number, cy: number, s: number) {
  return `M${cx} ${cy + s * 0.85} C ${cx - s * 1.45} ${cy - s * 0.35}, ${cx - s * 0.85} ${cy - s * 1.1}, ${cx} ${cy - s * 0.3} C ${cx + s * 0.85} ${cy - s * 1.1}, ${cx + s * 1.45} ${cy - s * 0.35}, ${cx} ${cy + s * 0.85} Z`;
}

function REye({ cx, dx = 0, dy = 0, r = 22, pr = 11 }: { cx: number; dx?: number; dy?: number; r?: number; pr?: number }) {
  return (
    <g>
      <circle cx={cx} cy={EYE_Y} r={r} fill={CREAM} />
      <circle cx={cx + dx} cy={EYE_Y + dy} r={pr} fill={INK} />
      <circle cx={cx + dx + 4} cy={EYE_Y + dy - 4} r={3.4} fill={CREAM} />
    </g>
  );
}

const GRIN = <path d="M64,120 Q100,172 136,120 Q100,140 64,120 Z" fill={INK} />;

function emojiFace(name: HiEmojiName) {
  switch (name) {
    case "win":
      return (<>
        <g fill={CREAM}>
          <path d="M40 46 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" />
          <path d="M162 60 l2.6 5.6 5.6 2.6 -5.6 2.6 -2.6 5.6 -2.6 -5.6 -5.6 -2.6 5.6 -2.6 z" />
        </g>
        <path d={star(EYE_LX, EYE_Y, 21, 9)} fill={INK} />
        <path d={star(EYE_RX, EYE_Y, 21, 9)} fill={INK} />
        {GRIN}
      </>);
    case "laugh":
      return (<>
        <path d="M54,100 Q72,82 90,100" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M110,100 Q128,82 146,100" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
        {GRIN}
        <path d="M84,140 Q100,158 116,140 Z" fill={RED} />
      </>);
    case "wow":
      return (<>
        <path d="M52,64 Q72,56 92,64" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M108,64 Q128,56 148,64" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <REye cx={EYE_LX} r={24} pr={10} />
        <REye cx={EYE_RX} r={24} pr={10} />
        <ellipse cx={100} cy={142} rx={15} ry={19} fill={INK} />
      </>);
    case "love":
      return (<>
        <path d={heart(EYE_LX, EYE_Y, 17)} fill={RED} />
        <path d={heart(EYE_RX, EYE_Y, 17)} fill={RED} />
        {GRIN}
      </>);
    case "cool":
      return (<>
        <path d="M46,86 L44,80" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <path d="M154,86 L156,80" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <path d="M48,84 L92,84 L92,100 Q71,120 48,100 Z" fill={INK} />
        <path d="M108,84 L152,84 L152,100 Q129,120 108,100 Z" fill={INK} />
        <rect x={92} y={86} width={16} height={6} fill={INK} />
        <path d="M74,134 Q100,150 128,130" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
      </>);
    case "think":
      return (<>
        <path d="M52,66 Q72,58 90,64" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <REye cx={EYE_LX} dx={4} dy={-6} />
        <REye cx={EYE_RX} dx={4} dy={-6} />
        <path d="M92,141 Q104,135 118,141" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      </>);
    case "party":
      return (<>
        <path d="M24,54 L68,30 L58,70 Z" fill={RED} />
        <path d="M24,54 L44,62 L68,30 Z" fill="#5B7BF2" />
        <circle cx={68} cy={28} r={5} fill={CREAM} />
        <REye cx={EYE_LX} />
        <REye cx={EYE_RX} />
        {GRIN}
        <circle cx={150} cy={48} r={4} fill={RED} />
        <circle cx={162} cy={84} r={4} fill="#5B8BFF" />
        <circle cx={146} cy={122} r={3.5} fill="#3CC08A" />
        <circle cx={44} cy={150} r={3.5} fill="#F2C14E" />
      </>);
    case "focus":
      return (<>
        <path d="M50,72 L88,82" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M150,72 L112,82" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        <ellipse cx={EYE_LX} cy={EYE_Y} rx={20} ry={13} fill={CREAM} />
        <ellipse cx={EYE_RX} cy={EYE_Y} rx={20} ry={13} fill={CREAM} />
        <circle cx={EYE_LX} cy={EYE_Y + 1} r={9} fill={INK} />
        <circle cx={EYE_RX} cy={EYE_Y + 1} r={9} fill={INK} />
        <circle cx={EYE_LX + 3} cy={EYE_Y - 3} r={2.8} fill={CREAM} />
        <circle cx={EYE_RX + 3} cy={EYE_Y - 3} r={2.8} fill={CREAM} />
        <path d="M74,134 L126,134" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      </>);
    case "sad":
      return (<>
        <path d="M54,74 L88,66" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M146,74 L112,66" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <REye cx={EYE_LX} dy={5} />
        <REye cx={EYE_RX} dy={5} />
        <path d="M70,144 Q100,122 130,144" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M58,120 C58,131 66,134 66,142 a8 8 0 0 1 -16 0 c0 -8 8 -11 8 -22 z" fill="#3E8EF7" />
      </>);
    case "mindblown":
      return (<>
        <g fill="#F2C14E">
          <path d="M34 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" />
          <path d="M164 44 l2.6 5.6 5.6 2.6 -5.6 2.6 -2.6 5.6 -2.6 -5.6 -5.6 -2.6 5.6 -2.6 z" />
        </g>
        <path d="M52,66 L92,66" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <path d="M108,66 L148,66" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <REye cx={EYE_LX} r={22} pr={10} />
        <REye cx={EYE_RX} r={22} pr={10} />
        <ellipse cx={100} cy={144} rx={16} ry={20} fill={INK} />
      </>);
  }
}

export function HiEmoji({ name, size = 88, bleed = false, style }: { name: HiEmojiName; size?: number; bleed?: boolean; style?: React.CSSProperties }) {
  return (
    <svg className="hi-emoji" width={bleed ? "100%" : size} height={bleed ? "100%" : size}
      viewBox={bleed ? "26 30 148 132" : "0 0 200 200"}
      preserveAspectRatio="xMidYMid meet" role="img" aria-label={HI_EMOJI.find((e) => e.name === name)?.label} style={style}>
      {!bleed && <rect x="18" y="18" width="164" height="164" rx="58" fill={EMOJI_COLOR[name]} />}
      {emojiFace(name)}
    </svg>
  );
}
