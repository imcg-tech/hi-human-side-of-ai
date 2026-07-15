import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Pill } from "../components/ds";
import MoodFace, { MOODS } from "../components/MoodFace";
import MeditationFace from "../components/MeditationFace";
import { WeeklyThemeBanner, MomentumCard, TeamSignal, ManagerNudge } from "../components/engagement";
import { MODULES } from "../data/modules";
import { DISC_INFO } from "../data/disc";
import { useStore } from "../lib/store";

export default function Dashboard() {
  const navigate = useNavigate();
  const mood = useStore((s) => s.mood);
  const discType = useStore((s) => s.discType);
  const recordVisit = useStore((s) => s.recordVisit);
  const disc = discType ?? "I";
  const di = DISC_INFO[disc];

  // verzeihendes Momentum: einmal pro Tag beim Öffnen, ohne Druck
  useEffect(() => { recordVisit(); }, [recordVisit]);

  const team = [
    { name: "Lena Brandt", meta: "S · Design Lead", score: "94%", tone: "var(--disc-s)" },
    { name: "Theo Voss", meta: "D · Engineering", score: "61%", tone: "var(--disc-d)" },
    { name: "Mara Iqbal", meta: "I · Product", score: "88%", tone: "var(--disc-i)" },
    { name: "Cem Kraus", meta: "C · Data", score: "73%", tone: "var(--disc-c)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto", padding: "4px 4px 30px" }}>
      {/* ── Wochen-Thema + Manager-Impuls (dezent, oben) ── */}
      <WeeklyThemeBanner />
      <ManagerNudge />

      {/* ── Row 1: three small cards (collapses to 1 column on phones) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {/* Universum → 3D network */}
        <button onClick={() => navigate("/network")} style={{ position: "relative", border: "none", textAlign: "left", cursor: "pointer", borderRadius: 22, minHeight: 200, padding: 20, overflow: "hidden", color: "#F4F1EB", background: "radial-gradient(120% 120% at 70% 20%, #1b2733, #0a0f16)" }}>
          <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85 }}>
            {[[20, 30], [70, 22], [82, 60], [38, 70], [55, 45], [12, 64]].map(([x, y], i) => (
              <g key={i}>
                {i > 0 && <line x1="50" y1="50" x2={x} y2={y} stroke="#8AAAC4" strokeWidth="0.5" opacity="0.5" />}
                <circle cx={x} cy={y} r={i === 4 ? 2.4 : 1.5} fill="#9ec9ff" />
              </g>
            ))}
            <circle cx="50" cy="50" r="3.2" fill="#fff" />
          </svg>
          <div style={{ position: "relative" }}>
            <Pill style={{ background: "rgba(255,255,255,0.12)", color: "#F4F1EB" }}>Universe</Pill>
          </div>
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, lineHeight: 1.15 }}>Company<br />Star Map</span>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center" }}><Icon name="arrowRight" size={18} color="#fff" /></span>
          </div>
        </button>

        {/* Stimmung, the face fills the whole card */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, minHeight: 200, display: "flex", flexDirection: "column",
          background: mood ? MOODS[mood].color : "var(--bg-elevated)", border: mood ? "none" : "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}>
          <Pill style={{ position: "absolute", top: 16, left: 16, zIndex: 1, background: "rgba(28,26,23,0.10)", color: "var(--text-primary)" }}>Your mood</Pill>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {mood
              ? <div style={{ position: "absolute", inset: 0 }}><MoodFace mood={mood} bleed /></div>
              : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><MoodFace mood={3} size={72} /></div>}
          </div>
          <div style={{ padding: 14, position: "relative" }}>
            <button onClick={() => navigate("/app/signal")} style={{ width: "100%", height: 40, borderRadius: 999, border: "none", cursor: "pointer", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              {mood ? "Change your mood" : "Choose your mood"} <Icon name="arrowRight" size={15} />
            </button>
          </div>
        </div>

        {/* Meditation, face fills the card */}
        <button onClick={() => navigate("/meditation")} style={{ position: "relative", border: "none", cursor: "pointer", borderRadius: 22, minHeight: 200, overflow: "hidden", background: "var(--candy-green)", display: "grid", placeItems: "center" }}>
          <div style={{ position: "absolute", top: 16, left: 16 }}>
            <Pill style={{ background: "rgba(28,26,23,0.10)", color: "var(--text-primary)" }}>Meditation</Pill>
          </div>
          <div style={{ transform: "translateY(8px)" }}><MeditationFace size={150} color="var(--candy-green-deep)" /></div>
        </button>
      </div>

      {/* ── Row 2: assessment / engagement / modules (collapses to 1 column on phones) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {/* Assessment result */}
        <div style={{ background: "var(--candy-lilac)", borderRadius: 26, padding: 24, minHeight: 300, display: "flex", flexDirection: "column" }}>
          <Pill style={{ background: "rgba(28,26,23,0.08)", color: "var(--text-primary)", alignSelf: "flex-start" }}>Your profile</Pill>
          {discType ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 0 6px" }}>
                <span style={{ width: 64, height: 64, borderRadius: 18, background: di.color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34 }}>{disc}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", lineHeight: 1.1 }}>{di.persona}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>{di.label}</div>
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>Your personality profile, private, just for you. It shapes your games and team matching.</p>
              <button onClick={() => navigate("/app/profile")} style={{ marginTop: "auto", height: 46, borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Full result & info <Icon name="arrowRight" size={17} />
              </button>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "16px 0 6px", lineHeight: 1.15 }}>Discover your profile</div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "2px 0 0", lineHeight: 1.5 }}>Take the short DISC self-assessment (about 2 min). It unlocks your personalized games, private, just for you.</p>
              <button onClick={() => navigate("/app/assessment")} style={{ marginTop: "auto", height: 46, borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Start assessment <Icon name="arrowRight" size={17} />
              </button>
            </>
          )}
        </div>

        {/* Momentum, verzeihend statt Einzel-Score */}
        <MomentumCard />

        {/* Modules */}
        <div style={{ background: "var(--surface-dark)", borderRadius: 26, padding: 24, minHeight: 300, color: "#F4F1EB", display: "flex", flexDirection: "column" }}>
          <Pill style={{ background: "rgba(255,255,255,0.10)", color: "#F4F1EB", alignSelf: "flex-start", marginBottom: 14 }}>Modules</Pill>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {MODULES.slice(0, 4).map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "7px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16.5 }}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: m.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name={m.icon} size={17} color="var(--ink-fill)" />
                </span>{m.title}
              </div>
            ))}
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(244,241,235,0.6)", paddingLeft: 45, marginTop: 2 }}>+ {MODULES.length - 4} more</div>
          </div>
          <button onClick={() => navigate("/app/modules")} style={{ marginTop: 12, height: 44, borderRadius: 999, border: "none", background: "var(--bg-elevated)", color: "var(--ink-fill)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>All modules</button>
        </div>
      </div>

      {/* ── Team list ── */}
      <div style={{ marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 4px", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Pill style={{ background: "rgba(28,26,23,0.06)", color: "var(--text-primary)" }}>Team</Pill>
            <TeamSignal />
          </div>
          <button onClick={() => navigate("/app/team")} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", cursor: "pointer", color: "var(--text-primary)", fontSize: 18, lineHeight: 1 }}>+</button>
        </div>
        {team.map((m) => (
          <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 4px", borderTop: "1px solid var(--border-default)" }}>
            <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, letterSpacing: "-0.008em", color: "var(--text-primary)", textShadow: "0 1px 14px rgba(255,255,255,0.55)" }}>{m.name}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, justifyContent: "center" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: m.tone }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{m.meta}</span>
            </span>
            <span style={{ flex: 1, textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28, letterSpacing: "-0.005em", color: "var(--text-primary)" }}>{m.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
