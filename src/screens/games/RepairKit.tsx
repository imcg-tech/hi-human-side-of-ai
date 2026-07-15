import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { GAMES } from "../../data/games";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

const ACCENT = "var(--candy-pink)";
const ACCENT_DEEP = "#C77D93";

type Phase = "intro" | "situation" | "theirside" | "yourpart" | "reset" | "close";

const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 84, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };

function compose(part: string, impact: string, forward: string) {
  const lines = [
    part.trim() && `I've been sitting with what happened, and I want to own my part: ${part.trim()}.`,
    impact.trim() && `I can imagine it may have landed like this for you: ${impact.trim()}.`,
    forward.trim() ? `Going forward, I'd like ${forward.trim()}.` : "I'd really like to find a good way forward together.",
    "This matters to me more than being right.",
  ].filter(Boolean);
  return lines.join(" ");
}

export default function RepairKit({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [situation, setSituation] = useState("");
  const [impact, setImpact] = useState("");
  const [part, setPart] = useState("");
  const [forward, setForward] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  function toReset() { setDraft(compose(part, impact, forward)); setPhase("reset"); }
  function copy() { navigator.clipboard?.writeText(draft).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {}); }
  function finish() { onComplete?.(); if (!embedded) navigate("/app/module/conflict"); }

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

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>
        {phase === "intro" && (
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: ACCENT, display: "grid", placeItems: "center", fontSize: 32 }}>🧰</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>Repair Kit</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>Mend after a rupture · Solo &amp; private</div>
            <GameBrief g={GAMES.repairkit} accent={ACCENT_DEEP} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 26px" }}>{GAMES.repairkit.intro}</p>
            <button onClick={() => setPhase("situation")} style={{ ...primaryBtn, width: "100%" }}>Start a repair <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "situation" && (
          <Glass pad={32}>
            <div style={label}>What happened</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.3 }}>Briefly, what was the friction?</h2>
            <textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Just for you, a sentence or two …" autoFocus style={taArea} />
            <button onClick={() => setPhase("theirside")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "theirside" && (
          <Glass pad={32}>
            <div style={label}>Their side</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 8px", lineHeight: 1.3 }}>What might it have felt like from their side?</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>Impact, not intent. You don't have to agree with it to see it.</p>
            <textarea value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="“Maybe it felt dismissive / rushed / unfair …”" autoFocus style={taArea} />
            <button onClick={() => setPhase("yourpart")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "yourpart" && (
          <Glass pad={32}>
            <div style={label}>Your part</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>What's your part in it, even a small one?</div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.45 }}>Owning 10% often unlocks the other 90%. No grovelling needed.</p>
              <textarea value={part} onChange={(e) => setPart(e.target.value)} placeholder="“I was short with you”, “I didn't loop you in” …" autoFocus style={taArea} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>What would you like going forward?</div>
              <textarea value={forward} onChange={(e) => setForward(e.target.value)} placeholder="“to reset and talk it through”, “to agree how we handle this next time” …" style={{ ...taArea, minHeight: 64 }} />
            </div>
            <button onClick={toReset} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Shape the message <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "reset" && (
          <Glass pad={32}>
            <div style={label}>Your repair message</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>A warm, non-blaming draft from your pieces. Make it sound like you, then send it in your own channel when it feels right.</p>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} style={{ ...taArea, minHeight: 160 }} />
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={copy} disabled={!draft.trim()} style={{ ...ghostBtn, opacity: draft.trim() ? 1 : 0.45, cursor: draft.trim() ? "pointer" : "not-allowed" }}>{copied ? "Copied" : "Copy"}</button>
              <button onClick={() => setPhase("close")} style={{ ...primaryBtn, flex: 1 }}>Done <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="heart" size={26} color="#fff" /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 10px" }}>Reaching out is the brave part</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>Repair doesn't erase what happened, it says the relationship matters more. Send it when you're ready. Nothing here was saved.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setPhase("reset")} style={primaryBtn}>Back to my message</button>
              <button onClick={finish} style={ghostBtn}>Back to the module</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
