import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { useStore } from "../../lib/store";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";
import { GAMES } from "../../data/games";
import { SITUATIONS, LEVELS, ELEMENTS, ELEMENT_HELP, surfaceObservations, type Level, type Situation, type BlockKey } from "../../data/oneClearAsk";

const ACCENT = "var(--candy-yellow)";
const ACCENT_DEEP = "var(--candy-yellow-deep)";
const LIMIT = 200;
const CHANNELS = [
  { key: "slack", label: "Slack", hint: "keep it short" },
  { key: "mail", label: "Email", hint: "a bit more formal" },
  { key: "voice", label: "In person", hint: "direct & warm" },
];

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const chip = (active: boolean, disabled = false): React.CSSProperties => ({ padding: "8px 14px", borderRadius: 999, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: 14, border: active ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: active ? ACCENT : "rgba(255,255,255,0.55)", color: disabled ? "var(--text-muted)" : active ? "var(--ink-fill)" : "var(--text-secondary)", fontWeight: active ? 600 : 400, opacity: disabled ? 0.5 : 1 });

const pickIn = (lvl: Level) => { const pool = SITUATIONS.filter((s) => s.level === lvl); return pool[Math.floor(Math.random() * pool.length)]; };
const EMPTY_CHECK: Record<BlockKey, boolean> = { adressat: false, was: false, wann: false, warum: false };

type Screen = "situation" | "write" | "feedback";

export default function OneClearAsk({ onComplete, embedded = false }: { onComplete?: (r: { solved: number }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const ocaSolved = useStore((s) => s.ocaSolved);
  const incrementOca = useStore((s) => s.incrementOca);

  const [level, setLevel] = useState<Level>("leicht");
  const [sit, setSit] = useState<Situation>(() => pickIn("leicht"));
  const [channel, setChannel] = useState("slack");
  const [text, setText] = useState("");
  const [firstText, setFirstText] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [screen, setScreen] = useState<Screen>("situation");
  const [selfCheck, setSelfCheck] = useState<Record<BlockKey, boolean>>(EMPTY_CHECK);
  const [showSample, setShowSample] = useState(false);
  const counted = useRef(false);

  const observations = useMemo(() => (screen === "feedback" ? surfaceObservations(text) : []), [screen, text]);
  const mandatoryDone = selfCheck.adressat && selfCheck.was && selfCheck.wann;

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".oca-step", { y: 12, duration: 0.4, ease: "power2.out" });
  }, { dependencies: [screen], scope });

  function chooseLevel(l: Level) { setLevel(l); setSit(pickIn(l)); }
  function nextSituation() {
    if (!counted.current) { incrementOca(); counted.current = true; }
    setSit(pickIn(level)); setText(""); setFirstText(""); setAttempt(0); setShowSample(false); setSelfCheck(EMPTY_CHECK); counted.current = false; setScreen("situation");
  }
  function analyze() { if (attempt === 0) setFirstText(text); setSelfCheck(EMPTY_CHECK); setShowSample(false); setScreen("feedback"); }
  function retry() { setAttempt(1); setScreen("write"); }
  function finish() { if (!counted.current) { incrementOca(); } onComplete?.({ solved: ocaSolved + 1 }); if (!embedded) navigate("/app/module/communication"); }
  const toggleCheck = (k: BlockKey) => setSelfCheck((c) => ({ ...c, [k]: !c[k] }));

  const wrap: React.CSSProperties = embedded ? { width: "100%" } : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div ref={scope} style={wrap}>
      {!embedded && (
        <button onClick={() => (screen === "situation" ? navigate("/app/module/communication") : setScreen(screen === "feedback" ? "write" : "situation"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {screen === "situation" ? "Communication" : "Back"}
        </button>
      )}

      <div style={{ maxWidth: 580, margin: embedded ? "0" : "auto", width: "100%" }}>
        {/* ── situation ── */}
        {screen === "situation" && (
          <Glass pad={30} className="oca-step">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: ACCENT, display: "grid", placeItems: "center" }}><Icon name="target" size={22} color="var(--ink-fill)" /></span>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>One Clear Ask</h1>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>One clear request, in 2 minutes. {ocaSolved} practiced.</div>
              </div>
            </div>

            {!embedded && <div style={{ marginBottom: 20 }}><GameBrief g={GAMES.oneclearask} accent={ACCENT} /></div>}

            <div style={sectionLabel}>Level</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {LEVELS.map((l) => {
                const locked = ocaSolved < l.unlockAt;
                return <button key={l.key} disabled={locked} onClick={() => chooseLevel(l.key)} style={chip(level === l.key, locked)}>{l.label}{locked ? ` · from ${l.unlockAt}` : ""}</button>;
              })}
            </div>

            <div style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(28,26,23,0.05)", marginBottom: 16 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: 0, lineHeight: 1.5 }}>{sit.text}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", background: "rgba(255,255,255,0.6)", padding: "4px 11px", borderRadius: 999 }}>To: {sit.to}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", background: "rgba(255,255,255,0.6)", padding: "4px 11px", borderRadius: 999 }}>Due: {sit.urgency}</span>
              </div>
            </div>

            <div style={sectionLabel}>Channel</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {CHANNELS.map((c) => <button key={c.key} onClick={() => setChannel(c.key)} style={chip(channel === c.key)}>{c.label}</button>)}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setSit(pickIn(level))} style={ghostBtn}>Another</button>
              <button onClick={() => { setText(""); setAttempt(0); setScreen("write"); }} style={{ ...primaryBtn, flex: 1 }}>Go <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {/* ── write ── */}
        {screen === "write" && (
          <Glass pad={30} className="oca-step">
            <div style={sectionLabel}>The situation</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 16px", lineHeight: 1.5 }}>{sit.text}</p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={sectionLabel}>{attempt === 0 ? "Phrase your request" : "Second attempt"}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: text.length > LIMIT ? "var(--danger)" : "var(--text-muted)" }}>{text.length}/{LIMIT}</span>
            </div>
            <textarea value={text} maxLength={LIMIT + 40} onChange={(e) => setText(e.target.value)} autoFocus placeholder="As clear as possible …"
              style={{ width: "100%", minHeight: 120, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 }} />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 4px" }}>
              {ELEMENTS.map((e) => <span key={e.key} style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", background: "rgba(28,26,23,0.05)", padding: "5px 11px", borderRadius: 999 }}>{e.label}: {e.q}</span>)}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginBottom: 18 }}>{CHANNELS.find((c) => c.key === channel)?.label}: {CHANNELS.find((c) => c.key === channel)?.hint}</div>

            <button onClick={analyze} disabled={!text.trim()} style={{ ...primaryBtn, width: "100%", opacity: text.trim() ? 1 : 0.45, cursor: text.trim() ? "pointer" : "not-allowed" }}>To the self-check <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ── feedback: Selbst-Check + ehrliche Beobachtungen ── */}
        {screen === "feedback" && (
          <Glass pad={30} className="oca-step">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px" }}>Your request in the self-check</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.45 }}>Read your request again and check off what's really in there.</p>

            {/* die eigene Bitte */}
            <div style={{ padding: "13px 15px", borderRadius: 12, background: "rgba(255,255,255,0.7)", border: "1px solid var(--border-default)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.5, marginBottom: 18 }}>{text.trim() || "…"}</div>

            {/* Selbst-Check der 4 Bausteine */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {ELEMENTS.map((e) => {
                const on = selfCheck[e.key];
                const optional = e.key === "warum";
                return (
                  <button key={e.key} onClick={() => toggleCheck(e.key)} style={{ display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", padding: "11px 14px", borderRadius: 12, cursor: "pointer", border: on ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-default)", background: on ? ACCENT : "rgba(255,255,255,0.55)" }}>
                    <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1, display: "grid", placeItems: "center", background: on ? "var(--ink-fill)" : "rgba(255,255,255,0.8)", border: on ? "none" : "1.5px solid var(--border-strong)" }}>
                      {on && <Icon name="check" size={14} color="var(--text-on-ink)" />}
                    </span>
                    <span>
                      <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{e.label}{optional ? " · optional" : ""} <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, color: on ? "var(--ink-fill)" : "var(--text-secondary)" }}>{e.q}</span></span>
                      {!on && <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{ELEMENT_HELP[e.key]}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {mandatoryDone && <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: ACCENT_DEEP, fontWeight: 600, marginBottom: 16 }}>Recipient, What and When are in there. Strong. A WHY would add extra motivation.</div>}

            {/* ehrliche Oberflächen-Beobachtungen (nur wenn wirklich etwas erkannt) */}
            {observations.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={sectionLabel}>Small observations</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {observations.map((o, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 999, marginTop: 7, flexShrink: 0, background: ACCENT_DEEP }} />{o}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vergleich bei zweitem Anlauf */}
            {attempt === 1 && firstText.trim() && (
              <div style={{ marginBottom: 16 }}>
                <div style={sectionLabel}>First vs. second version</div>
                <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.45, marginBottom: 6 }}>{firstText}</div>
                <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(235,201,76,0.12)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45 }}>{text}</div>
              </div>
            )}

            {/* Muster, aufklappbar */}
            <button onClick={() => setShowSample((v) => !v)} style={{ ...ghostBtn, width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="chevronDown" size={16} style={{ transform: showSample ? "rotate(180deg)" : "none" }} /> {showSample ? "Hide" : "Show"} sample wording
            </button>
            {showSample && <div style={{ marginTop: 10, padding: "13px 15px", borderRadius: 12, background: "rgba(92,163,150,0.10)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5 }}>{sit.sample}</div>}

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {attempt === 0 && <button onClick={retry} style={ghostBtn}>Try again</button>}
              <button onClick={nextSituation} style={{ ...primaryBtn, flex: 1 }}>Next situation <Icon name="arrowRight" size={18} /></button>
            </div>
            <button onClick={finish} style={{ ...ghostBtn, width: "100%", marginTop: 10 }}>Done</button>
          </Glass>
        )}
      </div>
    </div>
  );
}
