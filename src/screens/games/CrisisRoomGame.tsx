import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Icon from "../../components/Icon";
import { Glass } from "../../components/ds";
import { HiEmoji } from "../../components/MoodFace";
import { MODULES } from "../../data/modules";
import type { Game } from "../../data/games";
import { CR_SCENARIOS, CR_REFLECTIONS, CR_ROLES } from "../../data/crisisRoom";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

const TIME = 300; // 5 min
const COMP_AT = [45, 120]; // seconds when complications drop

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function CrisisRoomGame({ game: g }: { game: Game }) {
  const navigate = useNavigate();
  const accent = MODULES.find((m) => m.id === g.category)?.color ?? "var(--brand)";
  const scenario = useMemo(() => CR_SCENARIOS[Math.floor(Math.random() * CR_SCENARIOS.length)], []);

  const [phase, setPhase] = useState<"intro" | "briefing" | "active" | "capture" | "reflection" | "close">("intro");
  const [elapsed, setElapsed] = useState(0);
  const [comps, setComps] = useState<string[]>([]);
  const [plan, setPlan] = useState(""); const [roles, setRoles] = useState(""); const [planB, setPlanB] = useState("");
  const [role, setRole] = useState<number | null>(null);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".cr-stage", { y: 18, duration: 0.4, ease: "power2.out" }); }, { dependencies: [phase], scope });

  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "active") return;
    COMP_AT.forEach((t, i) => { if (elapsed === t && scenario.complications[i]) setComps((c) => (c.includes(scenario.complications[i]) ? c : [...c, scenario.complications[i]])); });
    if (elapsed >= TIME) setPhase("capture");
  }, [elapsed, phase, scenario]);

  const remaining = Math.max(0, TIME - elapsed);

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate(`/app/module/${g.category}`)} style={backBtn}>
        <Icon name="arrowLeft" size={16} /> {MODULES.find((m) => m.id === g.category)?.title ?? "Module"}
      </button>

      {phase === "intro" && (
        <div className="cr-stage" style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: accent, display: "grid", placeItems: "center", fontSize: 32 }}>{g.emoji}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>{g.title}</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>{g.skill}</div>
            <GameBrief g={g} accent={accent} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 26px" }}>{g.intro}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/app/live/crisisroom")} style={primaryBtn}>Live with the team <Icon name="arrowRight" size={18} /></button>
              <button onClick={() => setPhase("briefing")} style={ghostBtn}>Solo</button>
            </div>
          </Glass>
        </div>
      )}

      {phase === "briefing" && (
        <div className="cr-stage" style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <Glass pad={32} style={{ borderTop: `5px solid var(--danger)` }}>
            <span style={{ display: "inline-block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "var(--danger)", padding: "5px 13px", borderRadius: 999, marginBottom: 16 }}>🚨 Crisis · {scenario.tension}</span>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, color: "var(--text-primary)", lineHeight: 1.4, margin: 0 }}>{scenario.crisis}</p>
            <div style={{ marginTop: 20, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)" }}>⏱️ You have <strong>5 minutes</strong>. There's no named leader, get going.</div>
            <button onClick={() => { setElapsed(0); setComps([]); setPhase("active"); }} style={{ ...primaryBtn, marginTop: 22 }}>Start timer <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {phase === "active" && (
        <div style={{ maxWidth: 640, margin: "auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-secondary)" }}>{scenario.tension}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: remaining <= 30 ? "var(--danger)" : "var(--text-primary)" }}>⏱️ {mmss(remaining)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(28,26,23,0.08)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ width: `${(remaining / TIME) * 100}%`, height: "100%", background: remaining <= 30 ? "var(--danger)" : accent, borderRadius: 999, transition: "width 1s linear" }} />
          </div>

          <div className="cr-stage">
            <Glass pad={24}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>{scenario.crisis}</p>
            </Glass>

            {comps.map((c) => (
              <div key={c} style={{ marginTop: 12, padding: "13px 16px", borderRadius: 14, background: "rgba(229,72,77,0.10)", border: "1px solid rgba(192,57,43,0.4)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)" }}>⚡ {c}</div>
            ))}

            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Your notes area</div>
              <textarea value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Think out loud: first steps, who does what, weighing options …" style={ta(120)} />
            </div>

            <button onClick={() => setPhase("capture")} style={{ ...primaryBtn, marginTop: 16, width: "100%" }}>Capture the plan <Icon name="arrowRight" size={18} /></button>
          </div>
        </div>
      )}

      {phase === "capture" && (
        <div className="cr-stage" style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <Glass pad={30}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 18px" }}>Your decision</h2>
            <Field label="Your plan in one sentence" v={plan} set={setPlan} ph="First we'll …" />
            <Field label="Who does what" v={roles} set={setRoles} ph="I'll handle …, X takes on …" />
            <Field label="Plan B, if it goes wrong" v={planB} set={setPlanB} ph="If that doesn't work, then …" />
            <button onClick={() => setPhase("reflection")} style={{ ...primaryBtn, marginTop: 18, width: "100%" }}>On to reflection <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {phase === "reflection" && (
        <div className="cr-stage" style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <Glass pad={30}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 6px" }}>Reflection</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 16px" }}>The heart of it, take a moment for each question.</p>
            {CR_REFLECTIONS.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.45 }}>
                <span style={{ color: accent, fontWeight: 700 }}>{i + 1}.</span> {q}
              </div>
            ))}
            <div style={{ marginTop: 18, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>Which role did you take on? <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, color: "var(--text-muted)" }}>(private)</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {CR_ROLES.map((r, i) => (
                <button key={i} onClick={() => setRole(i)} style={{ textAlign: "left", padding: "12px 16px", borderRadius: 14, cursor: "pointer", background: role === i ? "rgba(95,123,255,0.10)" : "rgba(255,255,255,0.62)", border: `1.5px solid ${role === i ? "var(--brand)" : "var(--border-default)"}`, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)" }}>
                  <strong>{r.label}</strong>, <span style={{ color: "var(--text-secondary)" }}>{r.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setPhase("close")} disabled={role === null} style={{ ...primaryBtn, marginTop: 20, width: "100%", opacity: role === null ? 0.45 : 1, cursor: role === null ? "not-allowed" : "pointer" }}>Wrap up <Icon name="arrowRight" size={18} /></button>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, margin: "16px 0 0" }}>In the team version, the app makes visible how you worked together (share of talking, who structured things), just for you in the reflection, never as a rating.</p>
          </Glass>
        </div>
      )}

      {phase === "close" && (
        <div className="cr-stage" style={{ maxWidth: 580, margin: "auto", width: "100%" }}>
          <Glass pad={32}>
            <div style={{ width: 72, height: 72, marginBottom: 4 }}><HiEmoji name="cool" size={72} /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 4px" }}>Crisis handled</h2>
            {role !== null && <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)" }}>Your role today: <strong style={{ color: "var(--text-primary)" }}>{CR_ROLES[role].label}</strong></div>}
            {plan.trim() && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)" }}>“{plan.trim()}”</div>}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "16px 0 24px" }}>{g.closing}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => { setPhase("intro"); setPlan(""); setRoles(""); setPlanB(""); setRole(null); setElapsed(0); setComps([]); }} style={primaryBtn}>New crisis</button>
              <button onClick={() => navigate(`/app/module/${g.category}`)} style={ghostBtn}>Back to the module</button>
            </div>
          </Glass>
        </div>
      )}
    </div>
  );
}

function ta(min: number): React.CSSProperties {
  return { width: "100%", minHeight: min, resize: "vertical", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", lineHeight: 1.5 };
}
function Field({ label, v, set, ph }: { label: string; v: string; set: (s: string) => void; ph: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>{label}</div>
      <textarea value={v} onChange={(e) => set(e.target.value)} placeholder={ph} style={ta(56)} />
    </div>
  );
}
