import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { FEELING_CHIPS, FEELING_COUNTS } from "../../data/balance";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-peri)";
const ACCENT_DEEP = "#5C6BC0";
const MIN_COUNT = 4; // never show a number small enough to feel identifying

// feelings where a gentle nudge toward connection makes sense
const HEAVY = new Set(["A bit overwhelmed", "A little lonely", "Tense", "Unsure", "Tired"]);

type Phase = "pick" | "reveal" | "close";

export default function NotAlone({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("pick");
  const [feeling, setFeeling] = useState("");

  function choose(f: string) { setFeeling(f); setPhase("reveal"); }
  function finish() { onComplete?.(); if (!embedded) navigate("/app/balance"); }

  const count = FEELING_COUNTS[feeling] ?? 0;
  const enough = count >= MIN_COUNT;
  const heavy = HEAVY.has(feeling);

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div style={wrap}>
      {!embedded && <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>}

      <div style={{ maxWidth: 520, margin: embedded ? "0" : "auto", width: "100%" }}>
        {phase === "pick" && (
          <Glass pad={34} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="users" size={26} color="#fff" /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "0 0 8px", lineHeight: 1.25 }}>How are you feeling right now, honestly?</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.5 }}>Completely anonymous. No names, ever, not even behind the scenes.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {FEELING_CHIPS.map((f) => (
                <button key={f} onClick={() => choose(f)} style={{ padding: "11px 18px", borderRadius: 999, cursor: "pointer", border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)" }}>{f}</button>
              ))}
            </div>
          </Glass>
        )}

        {phase === "reveal" && (
          <Glass pad={40} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 10 }}>You felt: <strong style={{ color: "var(--text-primary)" }}>{feeling.toLowerCase()}</strong></div>
            {enough ? (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 58, color: ACCENT_DEEP, lineHeight: 1, margin: "6px 0 12px" }}>{count}</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.3 }}>others felt this way too, this week.</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 26px", lineHeight: 1.55 }}>You're not alone in it. Whatever you're carrying, quietly, others are carrying something like it too.</p>
              </>
            ) : (
              <>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "8px auto 16px" }}><Icon name="heart" size={26} color="#fff" /></div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.3 }}>You're not the only one.</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 26px", lineHeight: 1.55 }}>Feelings like this are more common than they look, most people just don't say them out loud.</p>
              </>
            )}
            <button onClick={() => setPhase("close")} style={{ ...primaryBtn, width: "100%" }}>Continue <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={34} style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.3 }}>Thanks for being honest</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.55 }}>{heavy ? "That takes something. If it'd help to feel a little more connected, here are two gentle ways in." : "Naming how you feel, even just to yourself, is a small act of care. See you next time."}</p>
            {heavy && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <button onClick={() => navigate("/app/balance/reachout")} style={{ ...primaryBtn, width: "100%" }}>Reach Out to someone</button>
                <button onClick={() => navigate("/app/balance/coffee")} style={{ ...ghostBtn, width: "100%", height: 50 }}>Try a Coffee Roulette</button>
              </div>
            )}
            <button onClick={finish} style={heavy ? { ...ghostBtn, width: "100%", height: 50 } : primaryBtn}>Back to Balance</button>
          </Glass>
        )}
      </div>
    </div>
  );
}
