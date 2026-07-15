import Icon from "./Icon";

/* Trust signal used everywhere data is created: one consistent lock icon + one warm
   sentence. Positive framing (what's protected), never legalistic. Keep the wording
   in the shared vocabulary: "only you", "anonymous", "you decide". */
export default function PrivacyHint({ text, boxed = false, style }: { text: string; boxed?: boolean; style?: React.CSSProperties }) {
  const row = (
    <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 7 }}>
      <Icon name="lock" size={13} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{text}</span>
    </span>
  );
  if (boxed) return <div style={{ padding: "10px 13px", borderRadius: 12, background: "rgba(28,26,23,0.04)", ...style }}>{row}</div>;
  return <div style={style}>{row}</div>;
}
