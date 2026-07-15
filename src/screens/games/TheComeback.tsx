import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { useStore } from "../../lib/store";
import { COMEBACK_SCENARIOS, COMEBACK_OPTIONS } from "../../data/balance";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-lilac)";
const ACCENT_DEEP = "#6C5CE0";

type Phase = "intro" | "scenarios" | "pattern" | "kit" | "close";

const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };
const inputStyle: React.CSSProperties = { flex: 1, height: 46, padding: "0 14px", boxSizing: "border-box", borderRadius: 12, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none" };

function chip(active: boolean): React.CSSProperties {
  return { padding: "10px 16px", borderRadius: 999, cursor: "pointer", border: active ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: active ? "rgba(108,92,224,0.12)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)" };
}

export default function TheComeback({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const savedKit = useStore((s) => s.comebackKit);
  const setComebackKit = useStore((s) => s.setComebackKit);

  const [phase, setPhase] = useState<Phase>("intro");
  const [sIdx, setSIdx] = useState(0);
  const [picks, setPicks] = useState<string[]>(Array(COMEBACK_SCENARIOS.length).fill(""));
  const [own, setOwn] = useState("");
  const [kit, setKit] = useState<string[]>(savedKit);
  const [kitInput, setKitInput] = useState("");

  const pick = picks[sIdx];
  function choose(v: string) { setPicks((p) => p.map((x, i) => (i === sIdx ? v : x))); }
  function nextScenario() {
    const v = (own.trim() || pick);
    if (v) choose(v);
    setOwn("");
    if (sIdx < COMEBACK_SCENARIOS.length - 1) setSIdx(sIdx + 1);
    else setPhase("pattern");
  }

  // surface the most frequent recovery choice
  const tally = picks.filter(Boolean).reduce<Record<string, number>>((m, p) => { m[p] = (m[p] || 0) + 1; return m; }, {});
  const topPattern = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  function startKit() {
    const seed = Array.from(new Set(picks.filter(Boolean)));
    setKit(seed.length ? seed.slice(0, 5) : savedKit);
    setPhase("kit");
  }
  function addKit(v: string) { const t = v.trim(); if (!t || kit.includes(t) || kit.length >= 5) return; setKit((k) => [...k, t]); setKitInput(""); }
  function removeKit(v: string) { setKit((k) => k.filter((x) => x !== v)); }
  function saveAndClose() { setComebackKit(kit); onComplete?.(); setPhase("close"); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div style={wrap}>
      {!embedded && <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>
        {phase === "intro" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="target" size={28} color="#fff" /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "16px 0 10px" }}>The Comeback</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 26px", lineHeight: 1.55 }}>Setbacks come. The real question is what helps <em>you</em> get back up. Let's build your kit before you need it.</p>
            <button onClick={() => { setSIdx(0); setPicks(Array(COMEBACK_SCENARIOS.length).fill("")); setPhase("scenarios"); }} style={{ ...primaryBtn, width: "100%" }}>Start <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "scenarios" && (
          <Glass pad={30}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Situation {sIdx + 1} of {COMEBACK_SCENARIOS.length}</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 18px", lineHeight: 1.3 }}>{COMEBACK_SCENARIOS[sIdx].situation}</h2>
            <div style={label}>What would help you most?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {COMEBACK_OPTIONS.map((o) => <button key={o} onClick={() => { choose(o); setOwn(""); }} style={chip((own.trim() || pick) === o)}>{o}</button>)}
            </div>
            <input value={own} onChange={(e) => { setOwn(e.target.value); }} placeholder="… or something else that helps you" style={{ ...inputStyle, width: "100%" }} />
            <button onClick={nextScenario} disabled={!(own.trim() || pick)} style={{ ...primaryBtn, width: "100%", marginTop: 18, opacity: (own.trim() || pick) ? 1 : 0.45, cursor: (own.trim() || pick) ? "pointer" : "not-allowed" }}>{sIdx < COMEBACK_SCENARIOS.length - 1 ? "Next" : "See your pattern"} <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "pattern" && (
          <Glass pad={34} style={{ textAlign: "center" }}>
            <div style={label}>Your recovery style</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.3 }}>You tend to come back through <span style={{ color: ACCENT_DEEP }}>{topPattern.toLowerCase()}</span>.</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>There's no right way, only yours. Let's turn what helps you into a kit you can reach for.</p>
            <button onClick={startKit} style={{ ...primaryBtn, width: "100%" }}>Build my comeback kit <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "kit" && (
          <Glass pad={30}>
            <div style={label}>Your comeback kit</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>Keep 3 to 5 things that genuinely help you. Tap to remove, or add your own.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {kit.map((k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.7)", border: `1px solid var(--border-default)` }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT_DEEP, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)" }}>{k}</span>
                  <button onClick={() => removeKit(k)} aria-label="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "grid", placeItems: "center" }}><Icon name="x" size={16} /></button>
                </div>
              ))}
              {kit.length === 0 && <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Add a few things that help you bounce back.</div>}
            </div>
            {kit.length < 5 && (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {COMEBACK_OPTIONS.filter((o) => !kit.includes(o)).map((o) => <button key={o} onClick={() => addKit(o)} style={chip(false)}>+ {o}</button>)}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input value={kitInput} onChange={(e) => setKitInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKit(kitInput)} placeholder="Add your own …" style={inputStyle} />
                  <button onClick={() => addKit(kitInput)} disabled={!kitInput.trim()} style={{ ...ghostBtn, opacity: kitInput.trim() ? 1 : 0.45 }}>Add</button>
                </div>
              </>
            )}
            <button onClick={saveAndClose} disabled={kit.length === 0} style={{ ...primaryBtn, width: "100%", marginTop: 20, opacity: kit.length ? 1 : 0.45, cursor: kit.length ? "pointer" : "not-allowed" }}>Save my kit <Icon name="check" size={18} /></button>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={34} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="#fff" /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 10px" }}>This is your comeback kit</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.55 }}>When it gets hard, it's here waiting. You can come back and edit it anytime.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
              {kit.map((k) => <span key={k} style={{ padding: "8px 14px", borderRadius: 999, background: "rgba(108,92,224,0.12)", border: `1px solid ${ACCENT_DEEP}`, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>{k}</span>)}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setPhase("kit")} style={primaryBtn}>Edit kit</button>
              <button onClick={() => { if (!embedded) navigate("/app/balance"); }} style={ghostBtn}>Back to Balance</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
