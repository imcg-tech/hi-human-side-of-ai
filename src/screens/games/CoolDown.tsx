import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { GAMES } from "../../data/games";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

const ACCENT = "var(--candy-pink)";
const ACCENT_DEEP = "#C77D93";
/* Quiet ambient loop while cooling down (starts on the first click, so
   autoplay rules are satisfied). Shares the Sound Bath asset. */
const AMBIENT_SRC = "audio/singing-bowls.mp3";
const AMBIENT_VOL = 0.22;
const BREATH_MS = 5500; // one full breath, matches the pulse animation

/* Deliberately NO writing in this game: Cool Down is the in-the-moment
   emergency brake (breathe, name it, choose). The thorough sort-out with
   fact vs. story lives in Clear the Air, which we hand over to at the end. */
type Phase = "intro" | "steady" | "feeling" | "decide" | "close";

const FEELINGS = ["Angry", "Hurt", "Ignored", "Embarrassed", "Treated unfairly", "Under pressure"];

export default function CoolDown({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [feeling, setFeeling] = useState<string | null>(null);
  const [choice, setChoice] = useState<"now" | "later" | null>(null);
  const [breaths, setBreaths] = useState(0);
  const [inhale, setInhale] = useState(true);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Ambient sound for every phase after the intro; gentle fade-in, hard stop on leave.
  const soundOn = phase !== "intro" && phase !== "close";
  useEffect(() => {
    if (!soundOn) { audioRef.current?.pause(); return; }
    if (!audioRef.current) {
      const a = new Audio(AMBIENT_SRC);
      a.loop = true; a.volume = 0;
      audioRef.current = a;
    }
    const a = audioRef.current;
    a.muted = muted;
    a.play().catch(() => {});
    const fade = setInterval(() => {
      a.volume = Math.min(AMBIENT_VOL, a.volume + 0.02);
      if (a.volume >= AMBIENT_VOL) clearInterval(fade);
    }, 90);
    return () => clearInterval(fade);
  }, [soundOn, muted]);
  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);

  // Guided breathing: count breaths, alternate in/out cue in sync with the pulse.
  useEffect(() => {
    if (phase !== "steady") return;
    setBreaths(0); setInhale(true);
    const half = setInterval(() => setInhale((v) => !v), BREATH_MS / 2);
    const full = setInterval(() => setBreaths((b) => b + 1), BREATH_MS);
    return () => { clearInterval(half); clearInterval(full); };
  }, [phase]);

  function finish() { onComplete?.(); if (!embedded) navigate("/app/module/conflict"); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  const breathsDone = breaths >= 3;

  return (
    <div style={wrap}>
      {!embedded && (
        <button onClick={() => (phase === "intro" ? navigate("/app/module/conflict") : setPhase("intro"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {phase === "intro" ? "Conflict & Repair" : "Back"}
        </button>
      )}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>
        {soundOn && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.55)", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>
              {muted ? "🔇 Sound off" : "🔊 Sound on"}
            </button>
          </div>
        )}

        {phase === "intro" && (
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: ACCENT, display: "grid", placeItems: "center", fontSize: 32 }}>🧊</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>Cool Down</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>Steady the heat · Solo &amp; private</div>
            <GameBrief g={GAMES.cooldown} accent={ACCENT_DEEP} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 26px" }}>{GAMES.cooldown.intro}</p>
            <button onClick={() => setPhase("steady")} style={{ ...primaryBtn, width: "100%" }}>I need a minute <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "steady" && (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <div style={{ height: 220, display: "grid", placeItems: "center", marginBottom: 8, position: "relative" }}>
              <div style={{ width: 170, height: 170, borderRadius: "50%", background: `radial-gradient(circle at 50% 45%, ${ACCENT}, rgba(215,150,175,0.2))`, boxShadow: "0 18px 46px rgba(190,120,150,0.28)", animation: reduce ? "none" : "cdpulse 5.5s ease-in-out infinite" }} />
              <div style={{ position: "absolute", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", textShadow: "0 1px 12px rgba(255,255,255,0.8)" }}>
                {reduce ? "Breathe slowly" : inhale ? "Breathe in …" : "… and out"}
              </div>
            </div>
            <style>{"@keyframes cdpulse{0%,100%{transform:scale(0.82)}50%{transform:scale(1.06)}}"}</style>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }} aria-label={`${Math.min(breaths, 3)} of 3 breaths`}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: breaths > i ? ACCENT_DEEP : "rgba(28,26,23,0.15)", transition: "background 0.4s" }} />
              ))}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 10px" }}>
              {breathsDone ? "Good. That's the gap." : "Three breaths with the circle"}
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 auto 24px", maxWidth: 340, lineHeight: 1.5 }}>
              {breathsDone
                ? "There's no message you have to send this second."
                : "Unclench your jaw, drop your shoulders. Follow the circle."}
            </p>
            <button onClick={() => setPhase("feeling")} style={{ ...primaryBtn, width: "100%", maxWidth: 340, opacity: breathsDone ? 1 : 0.75 }}>
              {breathsDone ? "I'm steadier" : "Skip the breaths"} <Icon name="arrowRight" size={18} />
            </button>
          </div>
        )}

        {phase === "feeling" && (
          <Glass pad={32}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Name it to tame it</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.3 }}>What's the feeling, in one word?</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>Just tap it. Putting a name on a feeling measurably turns its volume down.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
              {FEELINGS.map((f) => {
                const on = feeling === f;
                return (
                  <button key={f} onClick={() => setFeeling(on ? null : f)}
                    style={{ padding: "11px 18px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600,
                      color: on ? "#fff" : "var(--text-primary)", background: on ? ACCENT_DEEP : "rgba(255,255,255,0.6)",
                      border: on ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)" }}>
                    {f}
                  </button>
                );
              })}
            </div>
            {feeling && (
              <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(199,125,147,0.08)", border: "1px solid rgba(199,125,147,0.25)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55, marginBottom: 18 }}>
                Feeling <strong style={{ color: ACCENT_DEEP }}>{feeling.toLowerCase()}</strong> makes sense. It's information, not an instruction.
              </div>
            )}
            <button onClick={() => setPhase("decide")} disabled={!feeling} style={{ ...primaryBtn, width: "100%", opacity: feeling ? 1 : 0.45, cursor: feeling ? "pointer" : "not-allowed" }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "decide" && (
          <Glass pad={32}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Your move, on purpose</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 18px", lineHeight: 1.3 }}>Respond now, or later?</h2>
            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
              <button onClick={() => setChoice("later")} style={{ ...(choice === "later" ? primaryBtn : ghostBtn), flex: 1, height: 52, background: choice === "later" ? ACCENT_DEEP : undefined, borderColor: choice === "later" ? ACCENT_DEEP : undefined }}>Later</button>
              <button onClick={() => setChoice("now")} style={{ ...(choice === "now" ? primaryBtn : ghostBtn), flex: 1, height: 52, background: choice === "now" ? ACCENT_DEEP : undefined, borderColor: choice === "now" ? ACCENT_DEEP : undefined }}>Now</button>
            </div>
            {choice && (
              <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55, marginBottom: choice === "later" ? 14 : 0 }}>
                {choice === "later"
                  ? "Good call. Give it an hour, even a day. Things usually shrink with time. Come back when you're responding, not reacting."
                  : "Then keep it to what actually happened, name how it landed for you, and leave room for their side. A good opener: “Can I share how that landed for me?”"}
              </div>
            )}
            {choice === "later" && (
              <button onClick={() => navigate("/app/conflict/cleartheair")}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)", marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>🌬️</span>
                <span style={{ flex: 1 }}><strong>When you're calmer: Clear the Air.</strong><br /><span style={{ color: "var(--text-secondary)", fontSize: 13.5 }}>Sort the tension out properly and find a fair way to raise it.</span></span>
                <Icon name="arrowRight" size={16} />
              </button>
            )}
            <button onClick={() => setPhase("close")} disabled={!choice} style={{ ...primaryBtn, width: "100%", marginTop: 14, opacity: choice ? 1 : 0.45, cursor: choice ? "pointer" : "not-allowed" }}>Done <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="#fff" /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 10px" }}>You made a gap</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>Between the spark and the reaction, you put a gap. That gap is where your power is. Nothing here was saved.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setFeeling(null); setChoice(null); setPhase("steady"); }} style={primaryBtn}>Again</button>
              <button onClick={finish} style={ghostBtn}>Back to the module</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
