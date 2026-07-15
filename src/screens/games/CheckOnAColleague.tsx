import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { STARTER_LINES, HELP_NOTE } from "../../data/balance";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-peri)";
const ACCENT_DEEP = "#5C6BC0";

type Phase = "prompt" | "why" | "how" | "starters" | "close";

const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 90, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };

const HOW = [
  { t: "Ask specifically, not “you okay?”", d: "“You've seemed a bit quiet lately, how are you really doing?” opens a door that a throwaway question doesn't." },
  { t: "Give it space", d: "Ask, then listen. You don't need to fix anything, being heard is often the point." },
  { t: "Pick a private, unhurried moment", d: "A direct message or a quiet 1:1, not in front of the whole team, not between two meetings." },
];

export default function CheckOnAColleague({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("prompt");
  const [who, setWho] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  function finish() { onComplete?.(); if (!embedded) navigate("/app/balance"); }
  function copy() { navigator.clipboard?.writeText(draft).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {}); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  const firstName = who.trim().split(" ")[0];

  return (
    <div style={wrap}>
      {!embedded && <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>
        {phase === "prompt" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="heart" size={26} color="#fff" /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 27, color: "var(--text-primary)", margin: "16px 0 10px" }}>Check on a Colleague</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 20px", lineHeight: 1.55 }}>Has someone seemed quiet or withdrawn lately? Bring them to mind.</p>
            <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="A name, just for you (optional)" style={{ width: "100%", height: 48, padding: "0 16px", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", marginBottom: 20, textAlign: "center" }} />
            <button onClick={() => setPhase("why")} style={{ ...primaryBtn, width: "100%" }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "why" && (
          <Glass pad={34}>
            <div style={label}>Why it matters</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 17, color: "var(--text-primary)", margin: "0 0 14px", lineHeight: 1.5 }}>Most people notice when someone seems off, and then hesitate. “I don't want to intrude.” “Maybe it's nothing.”</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 26px", lineHeight: 1.55 }}>But a genuine “how are you really?” is one of the simplest, highest-impact things you can do. It can matter far more than you'd think, especially from a distance.</p>
            <button onClick={() => setPhase("how")} style={{ ...primaryBtn, width: "100%" }}>How to ask well <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "how" && (
          <Glass pad={32}>
            <div style={label}>How to ask well</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {HOW.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: ACCENT_DEEP, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 2 }}>{h.t}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{h.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("starters")} style={{ ...primaryBtn, width: "100%" }}>Give me a line <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "starters" && (
          <Glass pad={32}>
            <div style={label}>Starter lines</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>Tap one to borrow it, then make it yours{firstName ? ` for ${firstName}` : ""}.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {STARTER_LINES.map((line) => (
                <button key={line} onClick={() => setDraft(line)} style={{ textAlign: "left", padding: "13px 15px", borderRadius: 14, cursor: "pointer", border: draft === line ? `1.5px solid ${ACCENT_DEEP}` : "1px solid var(--border-default)", background: draft === line ? "rgba(92,107,192,0.10)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.45 }}>{line}</button>
              ))}
            </div>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="… or write your own" style={taArea} />
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={copy} disabled={!draft.trim()} style={{ ...ghostBtn, opacity: draft.trim() ? 1 : 0.45, cursor: draft.trim() ? "pointer" : "not-allowed" }}>{copied ? "Copied" : "Copy"}</button>
              <button onClick={() => setPhase("close")} style={{ ...primaryBtn, flex: 1 }}>Done <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={34} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="message" size={26} color="#fff" /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 10px" }}>Now it's over to you</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.55 }}>Send it in your own channel whenever feels right, or just carry it with you. Reaching out at all already makes a difference.</p>
            <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 22 }}>If a colleague seems to be in real crisis, checking in is care, not a substitute for help, involve a manager, HR or professional support. {HELP_NOTE}</div>
            <button onClick={finish} style={primaryBtn}>Back to Balance</button>
          </Glass>
        )}
      </div>
    </div>
  );
}
