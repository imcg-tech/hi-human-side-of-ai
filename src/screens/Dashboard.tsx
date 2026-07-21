import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Pill } from "../components/ds";
import MoodFace, { MOODS } from "../components/MoodFace";
import MeditationFace from "../components/MeditationFace";
import { MomentumCard, ManagerNudge } from "../components/engagement";
import { MODULES } from "../data/modules";
import { DISC_INFO } from "../data/disc";
import { teamActiveThisWeek, currentTheme } from "../data/engagement";
import { gamesFor } from "../data/games";
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

  // Team: only an anonymous company-wide activity share, never individual profiles.
  const { active, total } = teamActiveThisWeek();
  const activePct = Math.round((active / total) * 100);

  // One dominant action for today: this week's theme + a matching short exercise.
  const theme = currentTheme();
  const themeAccent = MODULES.find((mm) => mm.id === theme.moduleId)?.color ?? "var(--candy-blue)";
  const recGame = gamesFor(theme.moduleId)[0];
  const recRoute = recGame ? (recGame.route ?? `/app/game/${recGame.key}`) : theme.route;
  const recMin = recGame?.estMinutes ?? 3;
  const recTitle = recGame?.title ?? "Today's moment";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto", padding: "4px 4px 30px" }}>
      {/* ── One dominant action for today: this week's theme + a matching exercise ── */}
      <button onClick={() => navigate(recRoute)} style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none", borderRadius: 26, padding: "24px 26px", background: themeAccent, marginBottom: 14, display: "flex", flexDirection: "column", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(28,26,23,0.55)" }}>Your moment today</span>
          <Pill style={{ background: "rgba(28,26,23,0.10)", color: "var(--text-primary)" }}>{theme.title}</Pill>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 27, color: "var(--text-primary)", lineHeight: 1.12 }}>{recTitle}</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(28,26,23,0.66)", margin: "3px 0 0", lineHeight: 1.5 }}>{theme.line}</p>
        <span style={{ alignSelf: "flex-start", marginTop: 18, height: 46, padding: "0 22px", borderRadius: 999, background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 9 }}>
          <Icon name="play" size={16} /> Start · {recMin} min
        </span>
      </button>
      <ManagerNudge />

      {/* ── Explore: everything below is secondary ── */}
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", margin: "22px 4px 12px" }}>Explore</div>

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
            <Pill style={{ background: "rgba(255,255,255,0.12)", color: "#F4F1EB" }}>Star Map</Pill>
          </div>
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, lineHeight: 1.15 }}>Company<br />Star Map</span>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center" }}><Icon name="arrowRight" size={18} color="#fff" /></span>
          </div>
        </button>

        {/* Stimmung, the face fills the whole card */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, minHeight: 200, display: "flex", flexDirection: "column",
          background: mood ? MOODS[mood].color : "var(--bg-elevated)", border: mood ? "none" : "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}>
          <Pill style={{ position: "absolute", top: 16, left: 16, zIndex: 1, background: "rgba(28,26,23,0.10)", color: "var(--text-primary)" }}>Check-in</Pill>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {mood
              ? <div style={{ position: "absolute", inset: 0 }}><MoodFace mood={mood} bleed /></div>
              : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><MoodFace mood={3} size={72} /></div>}
          </div>
          <div style={{ padding: 14, position: "relative" }}>
            {mood && <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", textAlign: "center", marginBottom: 8 }}>Checked in today · {MOODS[mood].label}</div>}
            <button onClick={() => navigate("/app/signal")} style={{ width: "100%", height: 40, borderRadius: 999, border: "none", cursor: "pointer", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              {mood ? "Update check-in" : "How are you today?"} <Icon name="arrowRight" size={15} />
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

      {/* ── Team: anonymous company-wide activity, never individual profiles ── */}
      <div style={{ marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
          <Pill style={{ background: "rgba(28,26,23,0.06)", color: "var(--text-primary)" }}>Team</Pill>
          <button onClick={() => navigate("/app/team")} aria-label="Open team view" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 34, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600 }}>View team <Icon name="arrowRight" size={15} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, borderTop: "1px solid var(--border-default)", paddingTop: 22 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 66, lineHeight: 1, letterSpacing: "-0.01em", color: "var(--text-primary)", textShadow: "0 1px 14px rgba(255,255,255,0.55)" }}>{activePct}%</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", marginBottom: 10, lineHeight: 1.4 }}>of the company was active this week</div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(28,26,23,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${activePct}%`, height: "100%", background: "var(--candy-blue)", borderRadius: 999 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)" }}>
              <Icon name="users" size={14} color="var(--text-muted)" stroke={1.75} />
              <span>{active} of {total} people · always anonymous, never individual profiles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
