import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { SETBACK_QUESTIONS, HELP_NOTE } from "../../data/balance";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-lilac)";
const ACCENT_DEEP = "#6C5CE0";

type Phase = "intro" | "recall" | "questions" | "resource" | "close";

const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 90, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };

export default function SetbackStories({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [recall, setRecall] = useState("");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [resource, setResource] = useState("");

  function finish() { onComplete?.(); if (!embedded) navigate("/app/balance"); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div style={wrap}>
      {!embedded && <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>
        {phase === "intro" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="sparkles" size={28} color="#fff" /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "16px 0 10px" }}>Setback Stories</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 26px", lineHeight: 1.55 }}>You've already come through hard things. That, right there, is your strength. Let's find the proof.</p>
            <button onClick={() => setPhase("recall")} style={{ ...primaryBtn, width: "100%" }}>Begin <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "recall" && (
          <Glass pad={32}>
            <div style={label}>Recall</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.3 }}>Think of a situation that once felt really hard, and that you came through.</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>If one memory feels too heavy, pick a smaller one, this works at any size. Nothing here is saved.</p>
            <textarea value={recall} onChange={(e) => setRecall(e.target.value)} placeholder="A few words, just for you (optional) …" autoFocus style={taArea} />
            <button onClick={() => setPhase("questions")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "questions" && (
          <Glass pad={32}>
            <div style={label}>What got you through</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {SETBACK_QUESTIONS.map((q, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", marginBottom: 8, lineHeight: 1.4 }}>{q}</div>
                  <textarea value={answers[i]} onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))} placeholder="…" style={{ ...taArea, minHeight: 64 }} />
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("resource")} style={{ ...primaryBtn, width: "100%", marginTop: 20 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "resource" && (
          <Glass pad={32}>
            <div style={label}>The strength it reveals</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 16px", lineHeight: 1.3 }}>Name one strength this shows about you.</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", border: "1.5px solid var(--border-strong)", borderRadius: 14, padding: "0 14px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: ACCENT_DEEP, whiteSpace: "nowrap" }}>I'm someone who</span>
              <input value={resource} onChange={(e) => setResource(e.target.value)} placeholder="… doesn't give up easily" style={{ flex: 1, height: 52, border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none" }} />
            </div>
            <button onClick={() => setPhase("close")} style={{ ...primaryBtn, width: "100%", marginTop: 20 }}>See it <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 18px" }}><Icon name="heart" size={26} color="#fff" /></div>
            {resource.trim() && <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.3 }}>“I'm someone who {resource.trim()}.”</div>}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.55 }}>This strength is already in you. It's shown up before, and it will again when you need it.</p>
            <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 22 }}>{HELP_NOTE}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setRecall(""); setAnswers(["", "", ""]); setResource(""); setPhase("intro"); }} style={primaryBtn}>Again</button>
              <button onClick={finish} style={ghostBtn}>Back to Balance</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
