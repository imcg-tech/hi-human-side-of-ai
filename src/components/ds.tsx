import { useState, type CSSProperties, type ReactNode } from "react";

/* HI design-system components (ported from the handoff). */

export function Glass({ children, style = {}, pad = 24, hover = false, onClick, className }:
  { children: ReactNode; style?: CSSProperties; pad?: number; hover?: boolean; onClick?: () => void; className?: string }) {
  const [h, setH] = useState(false);
  return (
    <div className={className} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "rgba(247,244,239,0.60)",
        backdropFilter: "blur(22px) saturate(1.15)", WebkitBackdropFilter: "blur(22px) saturate(1.15)",
        border: "1px solid rgba(255,255,255,0.55)", borderRadius: "var(--radius-card)",
        boxShadow: hover && h ? "var(--shadow-lg)" : "var(--shadow-md)", padding: pad,
        transform: hover && h ? "translateY(-3px)" : "none",
        transition: "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>
      {children}
    </div>
  );
}

export function Pill({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999,
      fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, letterSpacing: "0.01em", lineHeight: 1,
      whiteSpace: "nowrap", ...style }}>{children}</span>
  );
}

export function Seg({ options }: { options: string[] }) {
  const [i, setI] = useState(0);
  return (
    <div style={{ display: "inline-flex", background: "rgba(28,26,23,0.07)", borderRadius: 999, padding: 3 }}>
      {options.map((o, idx) => (
        <button key={o} onClick={() => setI(idx)} style={{ border: "none", borderRadius: 999, padding: "5px 12px",
          cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
          background: i === idx ? "var(--bg-elevated)" : "transparent",
          color: i === idx ? "var(--text-primary)" : "var(--text-muted)",
          boxShadow: i === idx ? "var(--shadow-sm)" : "none" }}>{o}</button>
      ))}
    </div>
  );
}

type BtnVariant = "primary" | "ink" | "ghost" | "accent" | "subtle";
export function Button({ children, variant = "primary", size = "md", full = false, disabled = false,
  iconLeft = null, iconRight = null, style = {}, onClick }:
  { children: ReactNode; variant?: BtnVariant; size?: "sm" | "md" | "lg"; full?: boolean; disabled?: boolean;
    iconLeft?: ReactNode; iconRight?: ReactNode; style?: CSSProperties; onClick?: () => void }) {
  const sizes: Record<string, CSSProperties> = {
    sm: { padding: "8px 16px", fontSize: 14, height: 38, borderRadius: 12 },
    md: { padding: "13px 22px", fontSize: 16, height: 52, borderRadius: "var(--radius-input)" },
    lg: { padding: "17px 28px", fontSize: 17, height: 60, borderRadius: "var(--radius-input)" },
  };
  const variants: Record<BtnVariant, CSSProperties> = {
    primary: { background: "var(--ink-fill)", color: "var(--text-on-ink)", border: "none", boxShadow: "var(--shadow-md)" },
    ink: { background: "var(--ink-fill)", color: "var(--text-on-ink)", border: "none", boxShadow: "var(--shadow-md)" },
    ghost: { background: "transparent", color: "var(--text-primary)", border: "1.5px solid var(--border-strong)", boxShadow: "none" },
    accent: { background: "var(--brand)", color: "var(--text-on-brand)", border: "none", boxShadow: "var(--shadow-brand)" },
    subtle: { background: "var(--brand-subtle)", color: "var(--brand-dark)", border: "none", boxShadow: "none" },
  };
  return (
    <button disabled={disabled} onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
        width: full ? "100%" : "auto", fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "-0.01em",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
        transition: "transform var(--dur-fast) var(--ease-out)", ...sizes[size], ...variants[variant], ...style }}>
      {iconLeft}{children}{iconRight}
    </button>
  );
}

type Tone = "neutral" | "brand" | "safe" | "warning" | "danger" | "info" | "ink";
const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--sand-200)", fg: "var(--text-secondary)" },
  brand: { bg: "var(--brand-subtle)", fg: "var(--brand-dark)" },
  safe: { bg: "var(--safe-bg)", fg: "var(--safe)" },
  warning: { bg: "var(--warning-bg)", fg: "var(--warning)" },
  danger: { bg: "var(--danger-bg)", fg: "var(--danger)" },
  info: { bg: "var(--info-bg)", fg: "var(--info)" },
  ink: { bg: "var(--ink-fill)", fg: "var(--text-on-ink)" },
};
export function Badge({ children, tone = "neutral", dot = false, style = {} }:
  { children: ReactNode; tone?: Tone; dot?: boolean; style?: CSSProperties }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: t.bg,
      color: t.fg, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
      borderRadius: "var(--radius-pill)", lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />}
      {children}
    </span>
  );
}

const DISC_COLOR: Record<string, string> = { D: "var(--disc-d)", I: "var(--disc-i)", S: "var(--disc-s)", C: "var(--disc-c)" };
const DISC_LABEL: Record<string, string> = { D: "Dominance", I: "Influence", S: "Steadiness", C: "Conscientiousness" };

export function Avatar({ name, disc, size = 38 }: { name: string; disc?: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: disc ? DISC_COLOR[disc] : "var(--brand)", display: "flex", alignItems: "center",
      justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

export function TeamMember({ name, role = "", disc, trailing = null, onClick, style = {} }:
  { name: string; role?: string; disc?: string; trailing?: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px",
      background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-input)",
      cursor: onClick ? "pointer" : "default", ...style }}>
      <Avatar name={name} disc={disc} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{name}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {role}{role && disc ? " · " : ""}{disc ? DISC_LABEL[disc] : ""}
        </div>
      </div>
      {trailing}
    </div>
  );
}

export function DISCBar({ data = [], style = {} }: { data?: { type: string; value: number }[]; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, ...style }}>
      {data.map((row) => {
        const color = DISC_COLOR[row.type] || DISC_COLOR.D;
        const pct = Math.max(0, Math.min(100, row.value));
        return (
          <div key={row.type} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: color, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{row.type}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{DISC_LABEL[row.type]}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{pct}%</span>
              </div>
              <div style={{ height: 10, background: "var(--sand-500)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "var(--radius-pill)", transition: "width var(--dur-slow) var(--ease-out)" }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
