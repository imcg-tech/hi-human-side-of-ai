import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import v1 from "../../assets/valve/valve-1.mp3";
import v2 from "../../assets/valve/valve-2.mp3";
import v3 from "../../assets/valve/valve-3.mp3";
import v4 from "../../assets/valve/valve-4.mp3";
import v5 from "../../assets/valve/valve-5.mp3";
import v6 from "../../assets/valve/valve-6.mp3";

const ACCENT = "var(--candy-blue)";

/* The physiological sigh: two inhales through the nose, one long exhale through
   the mouth. Fastest evidence-based way to down-regulate acute stress. */
const SIGH = [
  { key: "in1", label: "Breathe in through your nose", ms: 1600, scale: 0.72 },
  { key: "in2", label: "A second short breath in, all the way to the top", ms: 1100, scale: 1.0 },
  { key: "out", label: "Now let it go slowly through your mouth. Long, and easy.", ms: 5200, scale: 0.34 },
];
const CYCLES = 5;
const CYCLE_FALLBACK_MS = 9000; // muted pacing per cycle (voice off)

// One shared voice element for the whole app. Because React StrictMode mounts a
// component twice in dev, a per-instance Audio would briefly overlap itself (that
// comb-filter "robotic" sound). A module-level singleton can never overlap.
let sharedVoice: HTMLAudioElement | null = null;
function getVoice(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (!sharedVoice) sharedVoice = new Audio();
  return sharedVoice;
}

type Phase = "arrive" | "breathing" | "name" | "step" | "close";

export default function PressureValve({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("arrive");
  const [cycle, setCycle] = useState(0);
  const [sub, setSub] = useState(0); // which part of the sigh: 0 in, 1 in, 2 out
  const [breathDone, setBreathDone] = useState(false);
  const [stressor, setStressor] = useState("");
  const [step, setStep] = useState("");
  const [muted, setMuted] = useState(false);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Optional guided voice. ONE persistent element so nothing ever double-plays
  // (React StrictMode / re-renders can't spawn overlapping copies → no robotic flange).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) audioRef.current = getVoice();
  const fadeRef = useRef<number | null>(null);
  function clearFade() { if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; } }
  function stopVoice() {
    clearFade();
    const a = audioRef.current; if (!a) return;
    const s = a.volume; let e = 0;
    fadeRef.current = window.setInterval(() => { e += 40; a.volume = Math.max(0, s * (1 - e / 240)); if (e >= 240) { clearFade(); a.pause(); } }, 40);
  }
  function playVoice(src: string) {
    const a = audioRef.current; if (!a) return;
    clearFade(); a.pause();
    if (muted) return;
    a.src = src; a.currentTime = 0; a.volume = 0.9; a.play().catch(() => {});
  }

  const stage = SIGH[sub];

  // Breathing: guide every cycle. The spoken sigh (valve-2) plays each cycle on the
  // same element and its end advances to the next; muted falls back to a timer.
  useEffect(() => {
    if (phase !== "breathing" || breathDone) return;
    setSub(0);
    const t1 = window.setTimeout(() => setSub(1), SIGH[0].ms);
    const t2 = window.setTimeout(() => setSub(2), SIGH[0].ms + SIGH[1].ms);
    let adv: number | undefined;
    const goNext = () => { if (cycle >= CYCLES - 1) setBreathDone(true); else setCycle((c) => c + 1); };
    const a = audioRef.current;
    if (!muted && a) {
      clearFade(); a.pause(); a.src = v2; a.currentTime = 0; a.volume = 0.9;
      a.addEventListener("ended", goNext, { once: true });
      a.play().catch(() => { adv = window.setTimeout(goNext, CYCLE_FALLBACK_MS); });
    } else {
      adv = window.setTimeout(goNext, CYCLE_FALLBACK_MS);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); if (adv) clearTimeout(adv); if (a) a.removeEventListener("ended", goNext); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cycle, breathDone, muted]);

  // Voice for the non-breathing phases (plus the closing line once the breaths finish).
  useEffect(() => {
    if (muted) { stopVoice(); return; }
    if (phase === "arrive") playVoice(v1);
    else if (phase === "breathing") { if (breathDone) playVoice(v3); }
    else if (phase === "name") playVoice(v4);
    else if (phase === "step") playVoice(v5);
    else if (phase === "close") playVoice(v6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, breathDone, muted]);

  useEffect(() => () => stopVoice(), []);

  function startBreathing() { setCycle(0); setSub(0); setBreathDone(false); setPhase("breathing"); }
  function finish() { stopVoice(); onComplete?.(); if (!embedded) navigate("/app/balance"); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  // When the voice is on it carries the guidance, so the on-screen prose is hidden.
  // With voice muted, the text shows so the exercise still works silently.
  const showText = muted;

  return (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: embedded ? "flex-end" : "space-between" }}>
        {!embedded && <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>}
        <button onClick={() => setMuted((m) => !m)} title={muted ? "Voice on" : "Voice off"} aria-label={muted ? "Turn voice on" : "Turn voice off"}
          style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-secondary)", marginBottom: 18 }}>
          <Icon name={muted ? "volumeOff" : "volume"} size={18} />
        </button>
      </div>

      <div style={{ maxWidth: 520, margin: embedded ? "0" : "auto", width: "100%" }}>
        {phase === "arrive" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="leaf" size={28} color="#fff" /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "16px 0 10px" }}>Pressure Valve</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 8px", lineHeight: 1.55 }}>You're under pressure right now. That's okay. Take two minutes for yourself.</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 26px", lineHeight: 1.55 }}>We'll slow the body down, name what's going on, and find one small next step.</p>
            <button onClick={startBreathing} style={{ ...primaryBtn, width: "100%" }}>Start <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "breathing" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 26 }}>
              {Array.from({ length: CYCLES }).map((_, c) => <span key={c} style={{ width: c === cycle && !breathDone ? 22 : 8, height: 8, borderRadius: 999, background: c < cycle || breathDone ? ACCENT : "rgba(28,26,23,0.12)", transition: "all 0.3s" }} />)}
            </div>

            <div style={{ height: 240, display: "grid", placeItems: "center", marginBottom: 8 }}>
              <div style={{ width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle at 50% 45%, ${ACCENT}, rgba(167,199,231,0.25))`, boxShadow: "0 20px 50px rgba(120,150,190,0.3)", display: "grid", placeItems: "center", transform: reduce ? "scale(0.8)" : `scale(${breathDone ? 0.8 : stage.scale})`, transition: reduce ? "none" : `transform ${breathDone ? 600 : stage.ms}ms ease-in-out` }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "#fff" }}>{breathDone ? "done" : cycle + 1}</span>
              </div>
            </div>

            {showText ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "var(--text-primary)", margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.5, minHeight: 54 }}>
                {breathDone ? "Notice how your body feels now. A little steadier. A little more room." : stage.label}
              </p>
            ) : <div style={{ height: 28 }} />}

            {breathDone ? (
              <button onClick={() => setPhase("name")} style={{ ...primaryBtn, width: "100%", maxWidth: 360 }}>Continue <Icon name="arrowRight" size={18} /></button>
            ) : (
              <button onClick={() => setPhase("name")} style={{ ...ghostBtn }}>Skip ahead</button>
            )}
          </div>
        )}

        {phase === "name" && (
          <Glass pad={32}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: showText ? 8 : 14 }}>Name it</div>
            {showText && <>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.25 }}>What's putting you under pressure right now?</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>Name it, quietly, to yourself. Just putting words to it takes some of the charge out.</p>
            </>}
            <textarea value={stressor} onChange={(e) => setStressor(e.target.value)} placeholder="Put it into words, or just think it …" autoFocus style={taArea} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>Stays with you, nothing is saved.</p>
            <button onClick={() => setPhase("step")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "step" && (
          <Glass pad={32}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: showText ? 8 : 14 }}>One small step</div>
            {showText && <>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.25 }}>What's the smallest next step that makes this a little lighter?</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>Not the whole thing. Just the next small move that's yours to make.</p>
            </>}
            <textarea value={step} onChange={(e) => setStep(e.target.value)} placeholder="One small thing …" style={taArea} />
            <button onClick={() => setPhase("close")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Done <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 26px" }}><Icon name="check" size={28} color="#fff" /></div>
            {showText && <>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "-10px 0 8px" }}>You shifted down a gear</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 26px", lineHeight: 1.55 }}>You just took a deliberate pause under pressure. That's strength. Carry this calmer breath with you into what comes next.</p>
            </>}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setStressor(""); setStep(""); setPhase("arrive"); }} style={primaryBtn}>Again</button>
              <button onClick={finish} style={ghostBtn}>Back to Balance</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}

const taArea: React.CSSProperties = { width: "100%", minHeight: 84, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
