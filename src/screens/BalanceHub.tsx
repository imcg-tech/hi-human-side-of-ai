import { useNavigate } from "react-router-dom";
import { Glass } from "../components/ds";
import Icon from "../components/Icon";
import { SUBAREAS, HELP_NOTE } from "../data/balance";

export default function BalanceHub() {
  const navigate = useNavigate();
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 36, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: "0 0 4px", padding: "0 4px", textShadow: "0 2px 30px rgba(255,255,255,0.6)" }}>Balance</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 18px", padding: "0 4px", textShadow: "0 1px 16px rgba(255,255,255,0.7)" }}>A protected space for your mental wellbeing, small steps, always voluntary.</p>

      {/* Datenschutz-Versprechen, prominent */}
      <Glass pad={20} style={{ marginBottom: 22, background: "rgba(231,238,235,0.7)", border: "1px solid rgba(47,111,98,0.25)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20, marginTop: 1 }}>🔒</span>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", margin: 0, lineHeight: 1.55 }}>
            <strong>What you do here stays with you.</strong> No company, no manager, no one else sees your activity in this area. No tracking, no comparison, no ranking, ever.
          </p>
        </div>
      </Glass>

      {/* Unterbereiche */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SUBAREAS.map((s) => (
          <Glass key={s.id} pad={22}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <span style={{ width: 48, height: 48, borderRadius: 15, background: s.color, display: "grid", placeItems: "center", fontSize: 24, flexShrink: 0 }}>{s.emoji}</span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--text-primary)", lineHeight: 1.1 }}>{s.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{s.tagline}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {s.games.map((gm) => gm.status === "built" ? (
                <button key={gm.id} onClick={() => gm.route && navigate(gm.route)} title={gm.desc} style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", border: "none", borderRadius: 999, padding: "9px 15px", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5 }}>
                  {gm.title} <Icon name="arrowRight" size={14} />
                </button>
              ) : (
                <span key={gm.id} title={gm.desc} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "9px 14px", background: "rgba(28,26,23,0.05)", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: 13.5 }}>
                  {gm.title} <span style={{ fontSize: 11, opacity: 0.8 }}>· soon</span>
                </span>
              ))}
            </div>
          </Glass>
        ))}
      </div>

      {/* Safety */}
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55, margin: "22px 4px 0" }}>
        {HELP_NOTE.split("findahelpline.com").map((part, i) => (
          i === 0 ? <span key={i}>{part}<a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-dark)", fontWeight: 600 }}>findahelpline.com</a></span> : <span key={i}>{part}</span>
        ))}
      </p>
    </div>
  );
}
