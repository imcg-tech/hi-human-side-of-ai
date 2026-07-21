import { useState } from "react";
import Icon from "./Icon";

/**
 * 2.2 Team fill-state + invite loop. Shown wherever team data is aggregated, so
 * thin data is honest ("5 of 8") instead of looking finished, and inviting the
 * missing colleagues is one tap away. Repeats the anonymity promise right where
 * team data is displayed.
 */
export default function TeamFillState({ participated, total, noun = "shared their profile", accent = "var(--candy-blue)", style }: {
  participated: number;
  total?: number; // omit when the full team size is unknown (live mode)
  noun?: string;
  accent?: string;
  style?: React.CSSProperties;
}) {
  const [copied, setCopied] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const inviteUrl = window.location.origin + window.location.pathname;

  async function invite() {
    const text = `Join our team on HI, the human side of work: ${inviteUrl}`;
    try {
      if (navigator.share) { await navigator.share({ title: "HI", text, url: inviteUrl }); return; }
    } catch { /* user dismissed the share sheet, fall through to copy */ }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShowLink(true); // clipboard blocked, show the link for manual copying
    }
  }

  const pct = total ? Math.min(100, Math.round((participated / total) * 100)) : null;

  return (
    <div style={{ borderRadius: 14, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", padding: "14px 16px", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>
            {total ? `${participated} of ${total} have ${noun}` : `${participated} ${participated === 1 ? "person has" : "people have"} ${noun} so far`}
          </div>
          {pct !== null && (
            <div style={{ height: 6, borderRadius: 999, background: "rgba(28,26,23,0.08)", overflow: "hidden", marginTop: 7 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 999 }} />
            </div>
          )}
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>The more join in, the truer the picture.</div>
        </div>
        <button onClick={invite} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", flexShrink: 0 }}>
          {copied ? <><Icon name="check" size={15} /> Link copied</> : <><Icon name="users" size={15} /> Invite colleagues</>}
        </button>
      </div>
      {showLink && (
        <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-body)", userSelect: "all", wordBreak: "break-all" }}>{inviteUrl}</div>
      )}
      <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 10, fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        <Icon name="lock" size={12} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>Team views only ever show anonymous aggregates. Nobody, including managers, sees individual answers or who is which type.</span>
      </div>
    </div>
  );
}
