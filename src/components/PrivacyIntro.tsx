import { useNavigate } from "react-router-dom";
import { Glass } from "./ds";
import Icon from "./Icon";
import { useStore } from "../lib/store";

/* Level 3 of the trust layer: a single calm card shown once, before any data entry.
   Sets the core promise, then gets out of the way. Reachable later via the Trust page. */
export default function PrivacyIntro() {
  const navigate = useNavigate();
  const seen = useStore((s) => s.privacyIntroSeen);
  const setSeen = useStore((s) => s.setPrivacyIntroSeen);
  if (seen) return null;

  const points = [
    "No one but you sees your personal entries, not your manager, not the company.",
    "Team insights are always anonymous.",
    "You decide what you share. Always.",
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(20,18,15,0.45)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <Glass pad={34}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-subtle)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <Icon name="lock" size={26} color="var(--brand-dark)" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "0 0 6px", textAlign: "center" }}>Your data belongs to you</h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 20px", textAlign: "center", lineHeight: 1.5 }}>Before we start, the essentials:</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 24 }}>
            {points.map((p) => (
              <div key={p} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: "var(--brand-subtle)", display: "grid", placeItems: "center", marginTop: 1 }}>
                  <Icon name="check" size={13} color="var(--brand-dark)" />
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>

          <button onClick={setSeen} style={{ width: "100%", height: 50, borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
            Got it, let's go
          </button>
          <button onClick={() => { setSeen(); navigate("/app/privacy"); }} style={{ width: "100%", marginTop: 10, background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            Learn more <Icon name="arrowRight" size={15} />
          </button>
        </Glass>
      </div>
    </div>
  );
}
