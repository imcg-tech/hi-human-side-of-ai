import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { CONFLICT_STYLES, CS_SCENARIOS, styleById, type StyleId } from "../../data/conflictStyles";
import { GAMES } from "../../data/games";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

const ACCENT = "var(--candy-pink)";

function shuffle<T>(a: T[]): T[] { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };

type Phase = "intro" | "quiz" | "result";

function AxisBar({ value, color, left, right }: { value: number; color: string; left: string; right: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", marginBottom: 4 }}><span>{left}</span><span>{right}</span></div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(28,26,23,0.08)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${value}%`, borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

function StylePanel({ id, open, onToggle, badge }: { id: StyleId; open: boolean; onToggle: () => void; badge?: string }) {
  const s = styleById(id);
  return (
    <div style={{ borderRadius: 16, border: `1px solid var(--border-default)`, background: "rgba(255,255,255,0.6)", borderLeft: `4px solid ${s.color}`, overflow: "hidden" }}>
      <button onClick={onToggle} style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>{s.name}</span>
            {badge && <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", background: s.color, padding: "2px 9px", borderRadius: 999 }}>{badge}</span>}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>{s.tagline}</div>
        </div>
        <Icon name={open ? "arrowLeft" : "arrowRight"} size={16} color="var(--text-muted)" />
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55, margin: "0 0 12px" }}>{s.desc}</p>
          <AxisBar value={s.assert} color={s.color} left="Assertiveness" right={`${s.assert}%`} />
          <AxisBar value={s.coop} color={s.color} left="Cooperation" right={`${s.coop}%`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 16 }}>
            <div>
              <div style={{ ...label, marginBottom: 6, color: s.color }}>When it helps</div>
              {s.helps.map((h) => <div key={h} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.45, marginBottom: 5 }}><span style={{ color: s.color, fontWeight: 700 }}>+</span> {h}</div>)}
            </div>
            <div>
              <div style={{ ...label, marginBottom: 6 }}>Watch out</div>
              {s.watch.map((w) => <div key={w} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: 5 }}><span style={{ color: "var(--text-muted)", fontWeight: 700 }}>−</span> {w}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConflictStyles({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIdx, setQIdx] = useState(0);
  const [tally, setTally] = useState<Record<StyleId, number>>({ competing: 0, collaborating: 0, compromising: 0, avoiding: 0, accommodating: 0 });
  const [dominant, setDominant] = useState<StyleId | null>(null);
  const [openId, setOpenId] = useState<StyleId | null>(null);

  // options shuffled once per session so the layout doesn't telegraph the style
  const shuffled = useMemo(() => CS_SCENARIOS.map((s) => ({ ...s, options: shuffle(s.options) })), []);
  const scenario = shuffled[qIdx];

  function startQuiz() { setTally({ competing: 0, collaborating: 0, compromising: 0, avoiding: 0, accommodating: 0 }); setQIdx(0); setDominant(null); setPhase("quiz"); }
  function pick(id: StyleId) {
    const next = { ...tally, [id]: tally[id] + 1 };
    setTally(next);
    if (qIdx < shuffled.length - 1) { setQIdx(qIdx + 1); return; }
    // finish: dominant = highest, tie broken by canonical order
    let best: StyleId = CONFLICT_STYLES[0].id; let max = -1;
    for (const s of CONFLICT_STYLES) { if (next[s.id] > max) { max = next[s.id]; best = s.id; } }
    setDominant(best); setOpenId(best); setPhase("result"); onComplete?.();
  }
  function exploreOnly() { setDominant(null); setOpenId(null); setPhase("result"); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div style={wrap}>
      {!embedded && (
        <button onClick={() => (phase === "intro" ? navigate("/app/module/conflict") : setPhase("intro"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {phase === "intro" ? "Conflict & Repair" : "Back"}
        </button>
      )}

      <div style={{ maxWidth: 620, margin: embedded ? "0" : "auto", width: "100%" }}>
        {phase === "intro" && (
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: ACCENT, display: "grid", placeItems: "center", fontSize: 32 }}>⚖️</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>Conflict Styles</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>Know your default · Solo &amp; private</div>
            <GameBrief g={GAMES.conflictstyles} accent="#C77D93" />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 26px" }}>{GAMES.conflictstyles.intro}</p>
            <button onClick={startQuiz} style={{ ...primaryBtn, width: "100%" }}>Find your style <Icon name="arrowRight" size={18} /></button>
            <button onClick={exploreOnly} style={{ ...ghostBtn, width: "100%", height: 50, marginTop: 12 }}>Just explore the five</button>
          </Glass>
        )}

        {phase === "quiz" && scenario && (
          <Glass pad={30}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Moment {qIdx + 1} of {shuffled.length}</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 20px", lineHeight: 1.3 }}>{scenario.situation}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scenario.options.map((o) => (
                <button key={o.id} onClick={() => pick(o.id)} style={{ textAlign: "left", padding: "15px 16px", borderRadius: 14, cursor: "pointer", border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", lineHeight: 1.45, transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}>{o.text}</button>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "16px 0 0", lineHeight: 1.5 }}>Go with your gut, the one closest to what you'd actually do. Nothing is saved.</p>
          </Glass>
        )}

        {phase === "result" && (
          <>
            {dominant ? (
              <Glass pad={30} style={{ marginBottom: 16, borderTop: `5px solid ${styleById(dominant).color}` }}>
                <div style={label}>Your default leans toward</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 54, height: 54, borderRadius: 15, background: styleById(dominant).color, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="target" size={24} color="#fff" /></span>
                  <div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 27, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>{styleById(dominant).name}</h1>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)" }}>{styleById(dominant).tagline}</div>
                  </div>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55, margin: "16px 0 0" }}>This is a tendency, not a box. You use all five styles, the skill is choosing the one the moment actually needs. Tap any style below to see when it helps.</p>
              </Glass>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "0 0 6px", padding: "0 4px" }}>The five conflict styles</h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: 0, padding: "0 4px", lineHeight: 1.55 }}>Two axes: how much you push your own concern, and how much you meet the other's. No style is best, each fits some moments.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CONFLICT_STYLES.map((s) => (
                <StylePanel key={s.id} id={s.id} open={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} badge={dominant === s.id ? "Your default" : undefined} />
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <button onClick={startQuiz} style={primaryBtn}>{dominant ? "Retake" : "Find your style"}</button>
              {!embedded && <button onClick={() => navigate("/app/module/conflict")} style={ghostBtn}>Back to the module</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
