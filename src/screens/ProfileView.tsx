import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Glass, DISCBar } from "../components/ds";
import { DISC_INFO } from "../data/disc";
import { useStore, type DiscType } from "../lib/store";

const ORDER: DiscType[] = ["D", "I", "S", "C"];

export default function ProfileView() {
  const navigate = useNavigate();
  const discType = useStore((s) => s.discType);
  const scores = useStore((s) => s.scores);
  const profile = useStore((s) => s.profile);

  const backBtn = (
    <button onClick={() => navigate("/app")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 16 }}>
      <Icon name="arrowLeft" size={16} /> Home
    </button>
  );

  // No profile yet → invite the user to take the assessment.
  if (!discType) {
    return (
      <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px" }}>
        {backBtn}
        <div style={{ maxWidth: 560, margin: "40px auto 0" }}>
          <Glass pad={36}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", margin: 0 }}>No profile yet</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "14px 0 24px" }}>
              Take the short DISC self-assessment to unlock your personal profile. It takes about 2 minutes and stays private.
            </p>
            <button onClick={() => navigate("/app/assessment")} style={{ height: 50, padding: "0 26px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9 }}>
              Start assessment <Icon name="arrowRight" size={18} />
            </button>
          </Glass>
        </div>
      </div>
    );
  }

  const f = DISC_INFO[discType];
  const barData = scores
    ? ORDER.map((t) => ({ type: t, value: scores[t] }))
    : [{ type: "D" as DiscType, value: 22 }, { type: "I" as DiscType, value: 58 }, { type: "S" as DiscType, value: 34 }, { type: "C" as DiscType, value: 28 }];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px" }}>
      {backBtn}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18, alignItems: "start" }}>
        <Glass pad={28}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>🔒 Private, just for you</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ width: 84, height: 84, borderRadius: 22, background: f.color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 44 }}>{discType}</span>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>{f.persona} {f.emoji}</h1>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)" }}>{f.label}{profile ? ` · Code ${profile.profileCode}` : ""}</div>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "20px 0 0" }}>{f.desc}</p>
          {profile && (profile.isBalanced ? (
            <div style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)" }}>⚖️ Balanced profile, your styles sit close together.</div>
          ) : (
            <div style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)" }}>…with a good dose of <strong style={{ color: DISC_INFO[profile.secondary].color }}>{DISC_INFO[profile.secondary].persona}</strong>.</div>
          ))}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 12 }}>💪 Your strengths</div>
            {f.strengths.map((s) => (
              <div key={s} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} /> {s}
              </div>
            ))}
          </div>
        </Glass>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Glass pad={28}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 18 }}>Your DISC profile</div>
            <DISCBar data={barData} />
            {profile && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-secondary)", marginBottom: 10 }}>Your mix</div>
                <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(28,26,23,0.06)" }}>
                  {ORDER.map((t) => (<div key={t} title={`${t} ${profile.share[t]}%`} style={{ width: `${profile.share[t]}%`, background: DISC_INFO[t].color }} />))}
                </div>
              </div>
            )}
            <button onClick={() => navigate("/app/assessment")} style={{ marginTop: 22, height: 44, width: "100%", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon name="target" size={16} /> Retake the test
            </button>
          </Glass>
          <Glass pad={24} style={{ background: "rgba(221,234,251,0.7)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 8 }}>🧠 What is DISC?</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
              DISC describes four behavioral styles. No one is “just one letter”, you're a mix of all four. Your profile is a lens for orientation, not a label, and it stays private.
            </p>
          </Glass>
        </div>
      </div>
    </div>
  );
}
