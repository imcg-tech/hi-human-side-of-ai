/* Calm meditating face, closed peaceful eyes, soft smile, a headband.
   Used full-size on the Meditation screen (breathes) and as a card filler.
   `breathing` swaps the static smile for an animatable mouth (.med-mouth)
   that the Meditation screen morphs with the breath (line ↔ open "o"). */
export default function MeditationFace({ size = 200, color = "var(--candy-mint)", breathing = false }: { size?: number; color?: string; breathing?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Meditation">
      <defs>
        <clipPath id="medHead"><rect x="18" y="18" width="164" height="164" rx="58" /></clipPath>
      </defs>
      {/* head */}
      <rect x="18" y="18" width="164" height="164" rx="58" fill={color} />
      {/* headband */}
      <g clipPath="url(#medHead)">
        <rect x="10" y="52" width="180" height="20" fill="var(--brand)" />
        <rect x="10" y="58" width="180" height="4" fill="#FAF8F4" />
        <rect x="10" y="64" width="180" height="3" fill="var(--danger)" />
      </g>
      {/* closed, peaceful eyes */}
      <path d="M56,100 Q72,112 88,100" stroke="#1C1A17" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M112,100 Q128,112 144,100" stroke="#1C1A17" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* mouth */}
      {breathing ? (
        <ellipse className="med-mouth" cx="100" cy="134" rx="15" ry="7" fill="#1C1A17" />
      ) : (
        <path d="M80,132 Q100,146 120,132" stroke="#1C1A17" strokeWidth="7.5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
