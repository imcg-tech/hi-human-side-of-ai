import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";
import { GAMES } from "../../data/games";
import { SITUATION_CARDS, TYPE_INFO, FRAMING, SAFETY_NOTE, FORMULA, type ReactionType } from "../../data/ownershipCards";

const ACCENT = "var(--candy-teal)";
const ACCENT_DEEP = "var(--candy-teal-deep)";
const PER_SESSION = 3;

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 80, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };

const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

const MIRROR_NOTE: Record<ReactionType, string> = {
  ownership: "Nice. That's the action-ready stance, see your part and move forward.",
  blame: "Very human. An ownership step would be: what was your small part, and what do you do now?",
  selbst: "Don't be too hard on yourself. Ownership means seeing your part, not beating yourself up.",
};

type Screen = "framing" | "card" | "reveal" | "formula" | "close";

export default function OwnershipCards({ onComplete, embedded = false }: { onComplete?: (r: { cardsPlayed: number }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [order] = useState<number[]>(() => shuffle(SITUATION_CARDS.map((_, i) => i)).slice(0, PER_SESSION));
  const [pos, setPos] = useState(0);
  const [screen, setScreen] = useState<Screen>("framing");
  const [reaction, setReaction] = useState("");
  const [selfType, setSelfType] = useState<ReactionType | null>(null);
  const [real, setReal] = useState({ anteil: "", lernen: "", schritt: "" });

  const card = SITUATION_CARDS[order[pos]];
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".oc-step", { y: 12, duration: 0.4, ease: "power2.out" });
  }, { dependencies: [screen, pos], scope });

  function toCard() { setReaction(""); setSelfType(null); setScreen("card"); }
  function nextCard() {
    if (pos < order.length - 1) { setPos((p) => p + 1); toCard(); }
    else setScreen("formula");
  }
  function finish() { onComplete?.({ cardsPlayed: order.length }); if (!embedded) navigate("/app/module/performance"); }

  const wrap: React.CSSProperties = embedded ? { width: "100%" } : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };
  const TYPES: ReactionType[] = ["blame", "selbst", "ownership"];

  return (
    <div ref={scope} style={wrap}>
      {!embedded && (
        <button onClick={() => (screen === "framing" ? navigate("/app/module/performance") : setScreen("framing"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {screen === "framing" ? "Performance" : "Ownership Cards"}
        </button>
      )}

      <div style={{ maxWidth: 580, margin: embedded ? "0" : "auto", width: "100%" }}>
        {/* ── framing ── */}
        {screen === "framing" && (
          <Glass pad={30} className="oc-step">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: ACCENT, display: "grid", placeItems: "center" }}><Icon name="shield" size={22} color="var(--ink-fill)" /></span>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>Ownership Cards</h1>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Responsibility without blame. Mistakes as a source of learning.</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}><GameBrief g={GAMES.ownershipcards} accent={ACCENT} /></div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {FRAMING.map((f) => (
                <div key={f.type} style={{ padding: "13px 15px", borderRadius: 14, background: "rgba(255,255,255,0.6)", borderLeft: `4px solid ${TYPE_INFO[f.type].color}` }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 2 }}>{TYPE_INFO[f.type].sign} {f.title}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.45 }}>{f.line}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.04)", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 22 }}>
              <Icon name="lock" size={17} color="var(--text-secondary)" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>{SAFETY_NOTE}</span>
            </div>

            <button onClick={toCard} style={{ ...primaryBtn, width: "100%" }}>Practice solo <Icon name="arrowRight" size={18} /></button>
            <button onClick={() => navigate("/app/live/ownershipcards")} style={{ ...ghostBtn, width: "100%", marginTop: 12, height: 50 }}>Live with the team</button>
          </Glass>
        )}

        {/* ── card ── */}
        {screen === "card" && (
          <Glass pad={30} className="oc-step">
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginBottom: 10 }}>Card {pos + 1} of {order.length} · fictional</div>
            <div style={{ padding: "20px 22px", borderRadius: 16, background: "rgba(28,26,23,0.05)", marginBottom: 18 }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--text-primary)", margin: 0, lineHeight: 1.4 }}>{card.situation}</p>
            </div>
            <div style={sectionLabel}>How would you react?</div>
            <textarea value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="In your own words … (optional)" style={taArea} />
            <button onClick={() => setScreen("reveal")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>See the reactions <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ── reveal + self-mirror ── */}
        {screen === "reveal" && (
          <Glass pad={30} className="oc-step">
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.45 }}>{card.situation}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {TYPES.map((t) => {
                const info = TYPE_INFO[t];
                const hi = t === "ownership";
                return (
                  <div key={t} style={{ padding: "14px 16px", borderRadius: 14, background: hi ? "rgba(92,163,150,0.12)" : "rgba(255,255,255,0.55)", border: hi ? `1.5px solid ${ACCENT_DEEP}` : "1px solid var(--border-default)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: info.color }}>{info.sign} {info.label}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 6px", lineHeight: 1.45 }}>“{card.reactions[t]}”</p>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>{info.note}</div>
                  </div>
                );
              })}
            </div>

            <div style={sectionLabel}>Which type was your reaction closest to?</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {TYPES.map((t) => <button key={t} onClick={() => setSelfType(t)} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: selfType === t ? 600 : 400, border: selfType === t ? `1.5px solid ${TYPE_INFO[t].color}` : "1.5px solid var(--border-strong)", background: selfType === t ? "rgba(28,26,23,0.04)" : "rgba(255,255,255,0.55)", color: "var(--text-primary)" }}>{TYPE_INFO[t].label}</button>)}
            </div>
            {selfType && <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.5, marginBottom: 4 }}>{MIRROR_NOTE[selfType]}</div>}
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", textAlign: "center", margin: "8px 0 0" }}>No right or wrong. It's about raising awareness.</div>

            <button onClick={nextCard} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>{pos < order.length - 1 ? "Next card" : "To the ownership formula"} <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ── formula ── */}
        {screen === "formula" && (
          <Glass pad={30} className="oc-step">
            <div style={sectionLabel}>Takeaway</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 12px" }}>The ownership formula</h2>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(92,163,150,0.12)", border: `1.5px solid ${ACCENT}`, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 18 }}>{FORMULA.sentence}</div>

            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: 1.5 }}>Want to apply it to a real situation? Fully private, not saved.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FORMULA.parts.map((p) => (
                <div key={p.key}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 5 }}>{p.label} <span style={{ fontWeight: 400, fontSize: 12.5, color: "var(--text-muted)" }}>· {p.hint}</span></div>
                  <input value={real[p.key]} onChange={(e) => setReal((r) => ({ ...r, [p.key]: e.target.value }))} placeholder="…" style={{ ...taArea, minHeight: 0, height: 44 }} />
                </div>
              ))}
            </div>

            <button onClick={() => setScreen("close")} style={{ ...primaryBtn, width: "100%", marginTop: 20 }}>Finish <Icon name="check" size={18} /></button>
          </Glass>
        )}

        {/* ── close ── */}
        {screen === "close" && (
          <Glass pad={34} className="oc-step" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42 }}>🌱</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "10px 0 8px" }}>Well practiced</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>Ownership isn't self-reproach. It's the action-ready middle path: see your part, learn, take a step.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setPos(0); setScreen("framing"); }} style={ghostBtn}>Again</button>
              <button onClick={finish} style={primaryBtn}>Done <Icon name="check" size={18} /></button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
