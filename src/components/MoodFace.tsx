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
