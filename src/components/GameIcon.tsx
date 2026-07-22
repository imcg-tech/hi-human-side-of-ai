import type { ReactNode } from "react";
import type { Game } from "../data/games";

/* Custom game glyphs in the HI visual language: filled Ink + Cream duotone,
   meant to sit on the module-coloured tile (the tile supplies the colour, the
   motif stays neutral, like the module header and the Hi mascot). Keyed by the
   game key; unknown keys fall back to the game's unicode emoji. */

const INK = "#1C1A17";
const CREAM = "#F4F1EB";

const MOTIFS: Record<string, ReactNode> = {
  // Communication
  listen: (<>
    <path d="M6 17a10 10 0 0 1 20 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <rect x="4" y="16" width="6.5" height="10.5" rx="3.25" fill={INK} />
    <rect x="21.5" y="16" width="6.5" height="10.5" rx="3.25" fill={INK} />
    <rect x="5.8" y="18" width="2.9" height="6.5" rx="1.45" fill={CREAM} />
    <rect x="23.3" y="18" width="2.9" height="6.5" rx="1.45" fill={CREAM} />
  </>),
  ask: (<>
    <circle cx="14" cy="14" r="8.5" fill={CREAM} stroke={INK} strokeWidth="3" />
    <path d="M20.5 20.5 26.5 26.5" stroke={INK} strokeWidth="4" strokeLinecap="round" />
  </>),
  feedback: (<>
    <path d="M5 7h22v15H12l-5 5v-5H5V7Z" fill={INK} />
    <circle cx="12" cy="14.5" r="1.8" fill={CREAM} />
    <circle cx="16" cy="14.5" r="1.8" fill={CREAM} />
    <circle cx="20" cy="14.5" r="1.8" fill={CREAM} />
  </>),
  culture: (<>
    <circle cx="16" cy="16" r="11" fill={INK} />
    <path d="M6 12.5c6 3 14 3 20 0M6 19.5c6-3 14-3 20 0M16 5a19 19 0 0 1 0 22M16 5a19 19 0 0 0 0 22M5 16h22" stroke={CREAM} strokeWidth="1.5" fill="none" />
  </>),
  signalnoise: (<>
    <circle cx="16" cy="18" r="3.2" fill={INK} />
    <path d="M11 13a7 7 0 0 0 0 10M21 13a7 7 0 0 1 0 10" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M7.5 9a12 12 0 0 0 0 18M24.5 9a12 12 0 0 1 0 18" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
  </>),
  oneclearask: (<>
    <circle cx="16" cy="16" r="12" fill={INK} />
    <circle cx="16" cy="16" r="8" fill={CREAM} />
    <circle cx="16" cy="16" r="4" fill={INK} />
    <circle cx="16" cy="16" r="1.6" fill={CREAM} />
  </>),
  translatethis: (<>
    <rect x="3" y="6" width="14" height="10" rx="3" fill={INK} />
    <path d="M7 16h4l-4 4z" fill={INK} />
    <rect x="15" y="15" width="14" height="10" rx="3" fill={CREAM} stroke={INK} strokeWidth="1.8" />
    <path d="M25 25h-4l4 4z" fill={CREAM} stroke={INK} strokeWidth="1.8" />
  </>),

  // Bonding
  commonground: (<>
    <circle cx="12.5" cy="16" r="8" fill="none" stroke={INK} strokeWidth="2.6" />
    <circle cx="19.5" cy="16" r="8" fill="none" stroke={INK} strokeWidth="2.6" />
  </>),
  failforward: (<>
    <circle cx="16" cy="16" r="11" fill={INK} />
    <circle cx="16" cy="16" r="4.5" fill={CREAM} />
    <path d="M16 5v5M16 22v5M5 16h5M22 16h5" stroke={CREAM} strokeWidth="2.6" strokeLinecap="round" />
  </>),
  heist: (<>
    <circle cx="11" cy="13" r="6" fill={INK} />
    <circle cx="11" cy="13" r="2.4" fill={CREAM} />
    <path d="M15 16.5 25 26.5" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M21 22.5 23.5 20M24 25.5 26.5 23" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
  </>),

  // Leadership
  leadership: (<>
    <rect x="6" y="6" width="20" height="20" rx="5" fill={INK} />
    <circle cx="12" cy="12" r="1.8" fill={CREAM} />
    <circle cx="20" cy="12" r="1.8" fill={CREAM} />
    <circle cx="16" cy="16" r="1.8" fill={CREAM} />
    <circle cx="12" cy="20" r="1.8" fill={CREAM} />
    <circle cx="20" cy="20" r="1.8" fill={CREAM} />
  </>),
  crisisroom: (<>
    <path d="M16 5 28 26H4L16 5Z" fill={INK} />
    <rect x="14.6" y="12" width="2.8" height="7" rx="1.4" fill={CREAM} />
    <circle cx="16" cy="22" r="1.6" fill={CREAM} />
  </>),
  feedbackclass: (<>
    <path d="M16 8 3 13l13 5 13-5-13-5Z" fill={INK} />
    <path d="M16 10.8 9.5 13l6.5 2.5L22.5 13 16 10.8Z" fill={CREAM} />
    <path d="M9 16.5v4.5c0 1.8 3.1 3 7 3s7-1.2 7-3v-4.5" fill="none" stroke={INK} strokeWidth="2.4" />
    <path d="M28 13.5v5.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="20.5" r="1.6" fill={INK} />
  </>),
  oneonone: (<>
    <circle cx="16" cy="16" r="11" fill={INK} />
    <path d="m20 12-2.5 6.5L11 21l2.5-6.5L20 12Z" fill={CREAM} />
    <circle cx="16" cy="16" r="1.6" fill={INK} />
  </>),

  // Performance
  performance: (<>
    <circle cx="16" cy="16" r="12" fill={INK} />
    <circle cx="16" cy="16" r="8" fill={CREAM} />
    <circle cx="16" cy="16" r="4" fill={INK} />
    <circle cx="16" cy="16" r="1.6" fill={CREAM} />
  </>),
  ownershipcards: (<>
    <path d="M16 4 6 8v6c0 6 4 10.5 10 13 6-2.5 10-7 10-13V8L16 4Z" fill={INK} />
    <path d="m12 16 3 3 5-5.5" fill="none" stroke={CREAM} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  thetradeoff: (<>
    <path d="M16 5.5v19" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="16" cy="5.5" r="1.8" fill={INK} />
    <path d="M7 9h18" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M7 9 4 16M7 9 10 16M25 9 22 16M25 9 28 16" stroke={INK} strokeWidth="1.5" />
    <path d="M3 16a4 4 0 0 0 8 0Z" fill={INK} />
    <path d="M21 16a4 4 0 0 0 8 0Z" fill={INK} />
    <path d="M11 25h10" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
  </>),
  goalcraft: (<>
    <rect x="10" y="4" width="12" height="24" rx="2.5" fill={INK} />
    <path d="M10 9h4M10 14h6M10 19h4M10 24h6" stroke={CREAM} strokeWidth="1.8" strokeLinecap="round" />
  </>),

  // Onboarding
  onboarding: (<>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" fill={INK} />
    <path d="M23 15l1 2.8L27 19l-2.9 1L23 23l-1-3L19 19l2.9-1.2L23 15Z" fill={INK} />
  </>),
  firstweek: (<>
    <path d="M4 22h24" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M9 22a7 7 0 0 1 14 0Z" fill={INK} />
    <path d="M16 6v3M7 11l2 2M25 11l-2 2M4 18h3M25 18h3" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
  </>),

  // Conflict & Repair
  cleartheair: (<>
    <path d="M4 12h13a3 3 0 1 0-3-3" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 18h18a3.5 3.5 0 1 1-3.5 3.5" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 24h9" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
  </>),
  conflictstyles: (<>
    <path d="M4 7c5-1.5 9-1.5 9 0 0 10-2.5 13-4.5 13S4 17 4 7Z" fill={INK} />
    <circle cx="6.7" cy="11" r="1" fill={CREAM} />
    <circle cx="10.3" cy="11" r="1" fill={CREAM} />
    <path d="M6.5 15c1 1.4 3 1.4 4 0" fill="none" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M19 12c5-1.5 9-1.5 9 0 0 10-2.5 13-4.5 13S19 22 19 12Z" fill={CREAM} stroke={INK} strokeWidth="1.6" />
    <circle cx="21.7" cy="16" r="1" fill={INK} />
    <circle cx="25.3" cy="16" r="1" fill={INK} />
    <path d="M21.5 21c1-1.4 3-1.4 4 0" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
  </>),
  cooldown: (<>
    <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
      <path d="M16 5v22M6.5 10.5 25.5 21.5M25.5 10.5 6.5 21.5" />
      <path d="M16 9l-3-2.5M16 9l3-2.5M16 23l-3 2.5M16 23l3 2.5M9.7 12.6 8 9M22.3 19.4 24 23M22.3 12.6 24 9M9.7 19.4 8 23" />
    </g>
    <circle cx="16" cy="16" r="2" fill={CREAM} stroke={INK} strokeWidth="1.5" />
  </>),
  repairkit: (<>
    <rect x="5" y="12" width="22" height="14" rx="2.5" fill={INK} />
    <path d="M12 12v-2.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V12" fill="none" stroke={INK} strokeWidth="2.4" />
    <rect x="13.5" y="16.5" width="5" height="4" rx="1" fill={CREAM} />
    <path d="M5 18h22" stroke={CREAM} strokeWidth="1.6" />
  </>),

  defuse: (<>
    <circle cx="14" cy="19" r="9" fill={INK} />
    <circle cx="11" cy="16" r="2.4" fill={CREAM} />
    <path d="M20 12l3-3" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M22.5 9c0-1.6 1-2.2 2.6-2.2" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <circle cx="25.8" cy="6.4" r="1.9" fill={CREAM} stroke={INK} strokeWidth="1.2" />
  </>),
};

export default function GameIcon({ game, size = 28 }: { game: Game; size?: number }) {
  const motif = MOTIFS[game.key];
  if (!motif) return <span style={{ fontSize: Math.round(size * 0.86), lineHeight: 1 }}>{game.emoji}</span>;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" role="img" aria-label={game.title}>
      {motif}
    </svg>
  );
}
