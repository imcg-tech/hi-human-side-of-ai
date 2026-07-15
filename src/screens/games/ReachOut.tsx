import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { INTRO_POINTS, GAP_OPTIONS, GAP_REVEAL, IMPULSE_QUESTIONS, MESSAGE_STARTERS, MESSAGE_CHECKS, TAKEAWAYS, SAFETY } from "../../data/reachOut";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-peri)";
type Screen = "intro" | "gap" | "who" | "message" | "outro";

export default function ReachOut() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // optionaler Einstieg aus der Sternenwarte: Name + geteiltes Thema als Anlass
  const seedName = params.get("name") || "";
  const seedTopic = params.get("topic") || "";
  const fromStar = !!seedName;

  const [screen, setScreen] = useState<Screen>(fromStar ? "message" : "intro");
  const [gapGuess, setGapGuess] = useState<string | null>(null);
  const [name, setName] = useState(seedName);
  const [text, setText] = useState(fromStar ? MESSAGE_STARTERS[1].replace("[Name]", seedName).replace("[shared thing]", seedTopic || "our shared thing") : "");
  const [showCheck, setShowCheck] = useState(false);
  const [copied, setCopied] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".ro-stage", { y: 20, duration: 0.38, ease: "power2.out" }); }, { dependencies: [screen], scope });

  const withName = (s: string) => s.replace("[Name]", name.trim() || "[Name]").replace("[shared thing]", seedTopic || "[shared thing]");
  function copy() { if (!text.trim()) return; navigator.clipboard?.writeText(text.trim()).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  function restart() { setScreen("intro"); setGapGuess(null); setName(""); setText(""); setShowCheck(false); setCopied(false); }

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>

      {/* 1, Intro */}
      {screen === "intro" && (
        <div className="ro-stage" style={{ maxWidth: 580, margin: "auto", width: "100%" }}>
          <Glass pad={36}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: ACCENT, display: "grid", placeItems: "center", fontSize: 30 }}>🤝</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "14px 0 12px", lineHeight: 1.12 }}>Reach Out</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {INTRO_POINTS.map((t) => (
                <div key={t} style={{ display: "flex", gap: 10, fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.5 }}><span style={{ color: "var(--brand)", fontWeight: 700 }}>›</span> {t}</div>
              ))}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>🔒 What you think here, and about whom, stays with you.</div>
            <button onClick={() => setScreen("gap")} style={primaryBtn}>Let's go <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {/* 2, Liking-Gap */}
      {screen === "gap" && (
        <div className="ro-stage" style={{ maxWidth: 580, margin: "auto", width: "100%" }}>
          <Glass pad={32}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 16px", lineHeight: 1.3 }}>How much do you think someone enjoys an unexpected, kind message from you?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GAP_OPTIONS.map((o) => {
                const on = gapGuess === o.value;
                return (
                  <button key={o.value} onClick={() => gapGuess === null && setGapGuess(o.value)} disabled={gapGuess !== null}
                    style={{ textAlign: "left", padding: "15px 18px", borderRadius: 14, cursor: gapGuess ? "default" : "pointer", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", background: on ? "rgba(95,123,255,0.10)" : "rgba(255,255,255,0.62)", border: `1.5px solid ${on ? "var(--brand)" : "var(--border-default)"}`, opacity: gapGuess && !on ? 0.55 : 1, transition: "all 0.15s" }}>{o.label}</button>
                );
              })}
            </div>
            {gapGuess && (
              <div style={{ marginTop: 18, padding: "16px 18px", borderRadius: 16, background: "var(--brand-subtle)", border: "1px solid var(--brand-light)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>✨ Almost everyone underestimates it.</div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55, margin: 0 }}>{GAP_REVEAL}</p>
              </div>
            )}
            {gapGuess && <button onClick={() => setScreen("who")} style={{ ...primaryBtn, marginTop: 16, width: "100%" }}>Next <Icon name="arrowRight" size={18} /></button>}
          </Glass>
        </div>
      )}

      {/* 3, An wen denkst du? */}
      {screen === "who" && (
        <div className="ro-stage" style={{ maxWidth: 580, margin: "auto", width: "100%" }}>
          <Glass pad={32}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 4px" }}>Who are you thinking of?</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", margin: "0 0 16px" }}>Pick a question, or just think of someone. No pressure.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {IMPULSE_QUESTIONS.map((q) => (
                <div key={q} style={{ display: "flex", gap: 10, padding: "13px 16px", borderRadius: 14, background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.45 }}><span style={{ color: "var(--brand)" }}>›</span> {q}</div>
              ))}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7 }}>Name (optional · just for you)</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam" style={{ width: "100%", height: 48, padding: "0 16px", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => setScreen("message")} style={{ ...primaryBtn, marginTop: 18, width: "100%" }}>Find a message <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {/* 4, Nachricht leicht gemacht */}
      {screen === "message" && (
        <div className="ro-stage" style={{ maxWidth: 580, margin: "auto", width: "100%" }}>
          <Glass pad={32}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px" }}>A message made easy</h2>
            {fromStar && (
              <div style={{ padding: "12px 15px", borderRadius: 14, background: "var(--brand-subtle)", border: "1px solid var(--brand-light)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.5, margin: "0 0 14px" }}>
                🌟 From your Star Map: you share <strong>“{seedTopic}”</strong>, a nice reason to reach out to {seedName}.
              </div>
            )}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>A good reach-out message is small, honest, without expectation. Tap one and make it yours.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
              {MESSAGE_STARTERS.map((s) => (
                <button key={s} onClick={() => setText(withName(s))} style={{ textAlign: "left", padding: "12px 15px", borderRadius: 13, cursor: "pointer", background: "rgba(255,255,255,0.62)", border: "1.5px solid var(--border-default)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.45 }}>{withName(s)}</button>
              ))}
            </div>

            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7 }}>Now you · optional</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your own version … (stays local)" style={{ width: "100%", minHeight: 90, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "13px 15px", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 }} />

            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => setShowCheck((v) => !v)} style={linkBtn}>{showCheck ? "Hide self-check" : "Self-check"}</button>
              <button onClick={copy} disabled={!text.trim()} style={{ ...ghostBtn, height: 40, padding: "0 16px", fontSize: 14, opacity: text.trim() ? 1 : 0.5, cursor: text.trim() ? "pointer" : "not-allowed" }}>{copied ? "Copied ✓" : "Copy"}</button>
            </div>
            {showCheck && (
              <ul style={{ margin: "12px 0 0", padding: "0 0 0 2px", listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {MESSAGE_CHECKS.map((c) => <li key={c} style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)" }}><span style={{ color: "var(--disc-s)" }}>✓</span> {c}</li>)}
              </ul>
            )}

            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "16px 0 0" }}>You can copy it now and send it in your chat, or just take it with you for when it feels right. There's deliberately no send button here.</p>
            <button onClick={() => setScreen("outro")} style={{ ...primaryBtn, marginTop: 16, width: "100%" }}>Finish <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {/* 5, Outro */}
      {screen === "outro" && (
        <div className="ro-stage" style={{ maxWidth: 580, margin: "auto", width: "100%" }}>
          <Glass pad={30}>
            <div style={{ fontSize: 40 }}>🤝</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 18px" }}>Takeaways</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {TAKEAWAYS.map((t) => (
                <div key={t.t} style={{ display: "flex", gap: 13, padding: "14px 16px", borderRadius: 14, background: "rgba(28,26,23,0.04)" }}>
                  <span style={{ fontSize: 24 }}>{t.emoji}</span>
                  <div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{t.t}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.45 }}>{t.d}</div></div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 14px" }}>{SAFETY}</p>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>Want to make this a habit? Try <strong>Coffee Roulette</strong> in Balance, a random coffee date on the team. ☕</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/app/balance")} style={primaryBtn}>Done <Icon name="check" size={18} /></button>
              <button onClick={restart} style={ghostBtn}>Again</button>
            </div>
          </Glass>
        </div>
      )}
    </div>
  );
}

const linkBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--brand-dark)", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, padding: 0 };
