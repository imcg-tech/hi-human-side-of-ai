import type { CSSProperties, ReactNode } from "react";

/* HI shared icon set, Lucide-style 2px stroke icons (from the design system). */
const PATHS: Record<string, ReactNode> = {
  home: (<><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /></>),
  users: (<><circle cx="9" cy="8" r="3" /><path d="M15.5 6.2a3 3 0 0 1 0 5.6" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 14.5A6 6 0 0 1 21 20" /></>),
  signal: (<><path d="M12 20v-7" /><path d="M6 20v-4" /><path d="M18 20v-10" /></>),
  heart: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" />,
  compass: (<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></>),
  arrowRight: (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
  arrowLeft: (<><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  shield: (<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>),
  target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></>),
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>),
  bell: (<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>),
  message: <path d="M4 5.5h16v11H9l-4 3.5v-3.5H4v-11Z" />,
  leaf: (<><path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14" /><path d="M5 19c3-3 6-5 9-6" /></>),
  lock: (<><rect x="5" y="10" width="14" height="10" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  bridge: (<><path d="M3 16h18" /><path d="M7 16V6" /><path d="M17 16V6" /><path d="M3 14q0-5 4-8q5 8 10 0q4 3 4 8" /><path d="M3 16v3" /><path d="M21 16v3" /></>),
  sparkles: (<><path d="M12 3l1.7 4.8L18 9.5l-4.3 1.7L12 16l-1.7-4.8L6 9.5l4.3-1.7L12 3Z" /><path d="M18 14l.9 2.4L21 17l-2.1.6L18 20l-.9-2.4L15 17l2.1-.6L18 14Z" /></>),
  idcard: (<><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="8.5" cy="11" r="2" /><path d="M5.8 16a2.8 2.8 0 0 1 5.4 0" /><path d="M14.5 10h3.5" /><path d="M14.5 13.5h3.5" /></>),
  monitor: (<><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M9 20h6" /><path d="M12 16.5V20" /></>),
  messageDots: (<><path d="M4 5.5h16v11H9l-4 3.5v-3.5H4v-11Z" /><circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" /></>),
  network: (<><circle cx="12" cy="5" r="2.5" /><circle cx="6" cy="18.5" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="M12 7.5V12" /><path d="M6 16V13h12v3" /></>),
  repeat: (<><path d="M3 12a9 9 0 0 1 15-6.6L21 8" /><path d="M21 3.5V8h-4.5" /><path d="M21 12a9 9 0 0 1-15 6.6L3 16" /><path d="M3 20.5V16h4.5" /></>),
  eye: (<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>),
  music: (<><path d="M9 17.5V6l11-2v11.5" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17" cy="15.5" r="2.5" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" /></>),
  grid: (<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>),
  volume: (<><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 8.5a4 4 0 0 1 0 7" /><path d="M18.5 6a7 7 0 0 1 0 12" /></>),
  volumeOff: (<><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m16 9.5 5 5" /><path d="m21 9.5-5 5" /></>),
  chevronDown: <path d="m6 9 6 6 6-6" />,
};

export default function Icon({
  name, size = 22, stroke = 2, color = "currentColor", style,
}: { name: string; size?: number; stroke?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {PATHS[name] || null}
    </svg>
  );
}
