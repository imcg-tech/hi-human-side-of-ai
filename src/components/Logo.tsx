import type { CSSProperties } from "react";

/* HI brand logo, composable. Use <LogoIcon/>, <LogoHI/> or <Logo/> (lockup). */

/** The friendly "HI" face icon (rounded anthracite square). Can stand alone. */
export function LogoIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" role="img" aria-label="HI">
      <rect x="0" y="0" width="160" height="160" rx="46" fill="#2A2722" />
      <circle cx="80" cy="31" r="9.7" fill="#2A6FDB" />
      <ellipse cx="57" cy="78" rx="19" ry="23" fill="#F4F1EB" />
      <ellipse cx="103" cy="78" rx="19" ry="23" fill="#F4F1EB" />
      <circle cx="59" cy="80" r="9" fill="#2A2722" />
      <circle cx="105" cy="80" r="9" fill="#2A2722" />
      <path d="M63 114 Q80 126 97 114" stroke="#F4F1EB" strokeWidth="7.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** The "HI" wordmark with the brand dot. Can stand alone. */
export function LogoHI({ size = 40, color = "var(--text-primary)" }: { size?: number; color?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-start", gap: size * 0.07, lineHeight: 1 }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1, color }}>HI</span>
      <span style={{ width: size * 0.15, height: size * 0.15, borderRadius: "50%", background: "var(--brand)", marginTop: size * 0.1 }} />
    </span>
  );
}

/**
 * Full lockup, centered vertical stack: ICON, then HI, then HUMAN INTELLIGENCE.
 */
export default function Logo({
  iconSize = 64, hiSize = 30, style = {},
}: { iconSize?: number; hiSize?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...style }}>
      <LogoIcon size={iconSize} />
      <LogoHI size={hiSize} />
      <span style={{ fontFamily: "var(--font-body)", fontSize: hiSize * 0.3, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: 1, textAlign: "center" }}>
        Human Intelligence
      </span>
    </div>
  );
}
