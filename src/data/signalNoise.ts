/* Solo adaptation: pure word description (no geometry terms) + original figure as SVG.
   You draw what you understand, then compare with the original. */
export interface SNFigure { level: string; desc: string; svg: string; }

const C = "var(--ink-fill)";

export const SN_FIGURES: SNFigure[] = [
  {
    level: "Easy",
    desc: "Picture a wave that swings gently from the bottom left up to the top right. Just above it, slightly right of center, a small blob floats. At the very bottom left sits a thick, heavy dot, like an anchor.",
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 160 C 90 110, 150 150, 280 50" fill="none" stroke="${C}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="195" cy="70" r="12" fill="${C}"/>
      <circle cx="40" cy="150" r="20" fill="${C}"/>
    </svg>`,
  },
  {
    level: "Medium",
    desc: "Two bands cross like a tilted X. Right where they meet sits a ring. In the top right a short spike sticks out, and at the bottom left everything frays into three fine lines.",
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="50" x2="250" y2="160" stroke="${C}" stroke-width="6" stroke-linecap="round"/>
      <line x1="60" y1="160" x2="250" y2="40" stroke="${C}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="153" cy="103" r="16" fill="none" stroke="${C}" stroke-width="5"/>
      <path d="M250 40 l14 -14 M250 40 l4 18" stroke="${C}" stroke-width="5" stroke-linecap="round"/>
      <path d="M55 160 l-16 6 M55 160 l-14 -2 M55 160 l-10 14" stroke="${C}" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
];
