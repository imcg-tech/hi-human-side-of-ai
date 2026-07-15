import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";
import { GAMES } from "../../data/games";
import {
  CRITERIA, VAGUE_GOALS, REFLECTIONS, assembleSog, critFeedback,
  type CritKey, type VagueGoal,
} from "../../data/goalcraft";

const ACCENT = "var(--candy-teal)";
const ACCENT_DEEP = "var(--candy-teal-deep)";

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 72, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };

type Screen = "intro" | "vague" | "craft" | "compare" | "reflect" | "close";

export default function GoalcraftSolo({ onComplete, embedded = false }: { onComplete?: (r: { crafted: boolean }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("intro");
  const [goal, setGoal] = useState<VagueGoal>(() => VAGUE_GOALS[Math.floor(Math.random() * VAGUE_GOALS.length)]);
  const [unclear, setUnclear] = useState("");
  const [input, setInput] = useState<Record<CritKey, string>>({ konkret: "", messbar: "", sinnvoll: "", erreichbar: "" });
  const [step, setStep] = useState(0);
  const [showFb, setShowFb] = useState(false);
  const [poll, setPoll] = useState<"druck" | "sog" | null>(null);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".gc-step", { y: 12, duration: 0.4, ease: "power2.out" });
  }, { dependencies: [screen, step], scope });

  const sog = useMemo(() => assembleSog(input), [input]);
  const crit = CRITERIA[step];
  const fb = critFeedback(crit.key, input[crit.key]);

  function newGoal() {
    setGoal(VAGUE_GOALS[Math.floor(Math.random() * VAGUE_GOALS.length)]);
    setUnclear(""); setInput({ konkret: "", messbar: "", sinnvoll: "", erreichbar: "" }); setStep(0); setShowFb(false); setPoll(null);
  }
  function craftNext() {
    if (!showFb) { setShowFb(true); return; }
    setShowFb(false);
    if (step < CRITERIA.length - 1) setStep((s) => s + 1);
    else setScreen("compare");
  }
  function craftBack() {
    setShowFb(false);
    if (step > 0) setStep((s) => s - 1);
    else setScreen("vague");
  }
  function finish() { onComplete?.({ crafted: sog.trim().length > 0 }); if (!embedded) navigate("/app/module/performance"); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div ref={scope} style={wrap}>
      {!embedded && (
        <button onClick={() => (screen === "intro" ? navigate("/app/module/performance") : setScreen("intro"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {screen === "intro" ? "Performance" : "Goalcraft"}
        </button>
      )}

      <div style={{ maxWidth: 580, margin: embedded ? "0" : "auto", width: "100%" }}>
        {/* ───── intro ───── */}
        {screen === "intro" && (
          <Glass pad={32} className="gc-step">
            <div style={{ width: 56, height: 56, borderRadius: 16, background: ACCENT, display: "grid", placeItems: "center" }}>
              <Icon name="target" size={28} color="var(--ink-fill)" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "16px 0 6px" }}>Goalcraft</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 4px", lineHeight: 1.5 }}>Turn a vague directive into a goal that pulls instead of pushes.</p>
            <div style={{ marginBottom: 22 }}><GameBrief g={GAMES.goalcraft} accent={ACCENT_DEEP} /></div>
            <button onClick={() => { newGoal(); setScreen("vague"); }} style={{ ...primaryBtn, width: "100%" }}>Practice solo <Icon name="arrowRight" size={18} /></button>
            <button onClick={() => navigate("/app/live/goalcraft")} style={{ ...ghostBtn, width: "100%", marginTop: 12, height: 50 }}>Live with the team</button>
          </Glass>
        )}

        {/* ───── vague goal ───── */}
        {screen === "vague" && (
          <Glass pad={32} className="gc-step">
            <div style={sectionLabel}>The vague directive</div>
            <div style={{ padding: "20px 22px", borderRadius: 16, background: "rgba(28,26,23,0.05)", marginBottom: 18 }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>“{goal.text}”</p>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>{goal.category}</div>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 8px", lineHeight: 1.5 }}>What's unclear about it? What would it mean in practice?</p>
            <textarea value={unclear} onChange={(e) => setUnclear(e.target.value)} placeholder="First thoughts, freely …" style={taArea} />
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={newGoal} style={ghostBtn}>Another goal</button>
              <button onClick={() => setScreen("craft")} style={{ ...primaryBtn, flex: 1 }}>Sharpen the goal <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {/* ───── crafting (4 criteria) ───── */}
        {screen === "craft" && (
          <Glass pad={30} className="gc-step">
            {/* progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              {CRITERIA.map((c, i) => (
                <div key={c.key} style={{ flex: 1, height: 6, borderRadius: 999, background: i < step || (i === step && showFb) ? ACCENT_DEEP : i === step ? ACCENT : "rgba(28,26,23,0.1)" }} />
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: ACCENT, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={crit.icon} size={20} color="var(--ink-fill)" />
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>{crit.prompt}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{crit.question}</div>
              </div>
            </div>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", margin: "16px 0 10px", lineHeight: 1.5 }}>{crit.hint}</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--danger)", background: "rgba(229,72,77,0.08)", padding: "5px 11px", borderRadius: 999 }}>weak: {crit.weak}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: ACCENT_DEEP, background: "rgba(92,163,150,0.12)", padding: "5px 11px", borderRadius: 999 }}>strong: {crit.strong}</span>
            </div>

            <textarea value={input[crit.key]} onChange={(e) => { setInput((p) => ({ ...p, [crit.key]: e.target.value })); if (showFb) setShowFb(false); }} placeholder={crit.placeholder} style={taArea} autoFocus />

            {crit.key === "erreichbar" && <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>Would you want to reach it yourself, or does it put you off?</div>}

            {showFb && (
              <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start", background: fb.ok ? "rgba(92,163,150,0.12)" : "rgba(28,26,23,0.05)" }}>
                <Icon name={fb.ok ? "check" : "compass"} size={18} color={fb.ok ? ACCENT_DEEP : "var(--text-muted)"} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45 }}>{fb.note}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button onClick={craftBack} style={ghostBtn}>Back</button>
              <button onClick={craftNext} style={{ ...primaryBtn, flex: 1 }}>
                {!showFb ? "Check" : step < CRITERIA.length - 1 ? "Next" : "Compare"} <Icon name="arrowRight" size={18} />
              </button>
            </div>
          </Glass>
        )}

        {/* ───── compare: Druck vs Sog + poll ───── */}
        {screen === "compare" && (
          <Glass pad={30} className="gc-step">
            <div style={sectionLabel}>Pressure vs. pull</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 18px" }}>Two versions of the same goal</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setPoll("druck")} style={{ textAlign: "left", padding: "16px 18px", borderRadius: 16, cursor: "pointer", border: `1.5px solid ${poll === "druck" ? "var(--danger)" : "var(--border-default)"}`, background: poll === "druck" ? "rgba(229,72,77,0.06)" : "rgba(255,255,255,0.6)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--danger)", marginBottom: 6 }}>Pressure version</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.4 }}>“{goal.pressure}”</div>
              </button>
              <button onClick={() => setPoll("sog")} style={{ textAlign: "left", padding: "16px 18px", borderRadius: 16, cursor: "pointer", border: `1.5px solid ${poll === "sog" ? ACCENT_DEEP : "var(--border-default)"}`, background: poll === "sog" ? "rgba(92,163,150,0.10)" : "rgba(255,255,255,0.6)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: ACCENT_DEEP, marginBottom: 6 }}>Your pull version</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.4 }}>{sog ? sog : "…"}</div>
              </button>
            </div>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "20px 0 0", textAlign: "center", lineHeight: 1.5 }}>Which one would motivate you in the morning?</p>
            {poll && <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", textAlign: "center", marginTop: 8 }}>{poll === "sog" ? "Exactly. Clarity and a purpose pull, rather than push." : "Interesting that it tempts you briefly. Over time, though, it wears you down."}</div>}

            <button onClick={() => setScreen("reflect")} style={{ ...primaryBtn, width: "100%", marginTop: 22 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ───── reflect: Muster-Lösung ───── */}
        {screen === "reflect" && (
          <Glass pad={30} className="gc-step">
            <div style={sectionLabel}>Compare with the model answer</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>{REFLECTIONS[0]}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CRITERIA.map((c) => (
                <div key={c.key}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
                    <Icon name={c.icon} size={15} color={ACCENT_DEEP} /> {c.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ padding: "9px 13px", borderRadius: 11, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45 }}>
                      <span style={{ color: "var(--text-muted)", fontSize: 11.5 }}>Yours: </span>{input[c.key].trim() || "…"}
                    </div>
                    <div style={{ padding: "9px 13px", borderRadius: 11, background: "rgba(92,163,150,0.10)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45 }}>
                      <span style={{ color: ACCENT_DEEP, fontSize: 11.5 }}>Model: </span>{goal.model[c.key]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              There's no “right”. The model answer is just a comparison, not the truth.
            </div>
            <button onClick={() => setScreen("close")} style={{ ...primaryBtn, width: "100%", marginTop: 20 }}>Finish <Icon name="check" size={18} /></button>
          </Glass>
        )}

        {/* ───── close ───── */}
        {screen === "close" && (
          <Glass pad={34} className="gc-step" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42 }}>🎯</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "10px 0 8px" }}>Your sharpened goal</h2>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(92,163,150,0.10)", border: `1.5px solid ${ACCENT}`, fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.55, textAlign: "left", margin: "0 0 18px" }}>
              {sog || "No goal formulated. No problem, you can try again anytime."}
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>Feel free to take it into your next OKRs or quarterly goals. Totally optional.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { newGoal(); setScreen("vague"); }} style={ghostBtn}>Next goal</button>
              <button onClick={finish} style={primaryBtn}>Done <Icon name="check" size={18} /></button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
