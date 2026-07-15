import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { RESET_STEPS } from "../../data/balance";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import clip1 from "../../assets/reset/reset-1.mp3";
import clip2 from "../../assets/reset/reset-2.mp3";
import clip3 from "../../assets/reset/reset-3.mp3";
import clip4 from "../../assets/reset/reset-4.mp3";
import clip5 from "../../assets/reset/reset-5.mp3";
import clip6 from "../../assets/reset/reset-6.mp3";
import outro from "../../assets/reset/reset-outro.mp3";
import bell from "../../assets/reset/bell.mp3";

const ACCENT = "var(--candy-blue)";
const CLIPS = [clip1, clip2, clip3, clip4, clip5, clip6]; // gesprochene Führung je Schritt (ElevenLabs)

export default function ResetRitual() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"intro" | "run" | "done">("intro");
  const [step, setStep] = useState(0);
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceStartRef = useRef<number | null>(null);
  const voiceTailRef = useRef<number | null>(null);
  const voiceFadeRef = useRef<number | null>(null);
  const fadingRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);
  const bellHoldRef = useRef<number | null>(null);
  const bellFadeRef = useRef<number | null>(null);
  const mutedRef = useRef(muted); mutedRef.current = muted;

  function stopBell() {
    if (bellHoldRef.current) { clearTimeout(bellHoldRef.current); bellHoldRef.current = null; }
    if (bellFadeRef.current) { clearInterval(bellFadeRef.current); bellFadeRef.current = null; }
    bellRef.current?.pause();
  }

  // Klangschale schließt jeden Abschnitt. Sie klingt kurz an und wird nach ~4s
  // sanft ausgeblendet, damit sie nicht zu lang unter der nächsten Stimme liegt.
  function playBell() {
    if (mutedRef.current) return;
    stopBell();
    const b = new Audio(bell); b.volume = 0.45; bellRef.current = b; b.play().catch(() => {});
    bellHoldRef.current = window.setTimeout(() => {
      const fadeMs = 1400, stepMs = 60, startVol = b.volume; let elapsed = 0;
      bellFadeRef.current = window.setInterval(() => {
        elapsed += stepMs;
        b.volume = Math.max(0, startVol * (1 - elapsed / fadeMs));
        if (elapsed >= fadeMs) { if (bellFadeRef.current) { clearInterval(bellFadeRef.current); bellFadeRef.current = null; } b.pause(); }
      }, stepMs);
    }, 4000);
  }
  function begin() { stopBell(); setStep(0); setPhase("run"); }

  function clearVoiceTimers() {
    if (voiceStartRef.current) { clearTimeout(voiceStartRef.current); voiceStartRef.current = null; }
    if (voiceTailRef.current) { clearTimeout(voiceTailRef.current); voiceTailRef.current = null; }
    if (voiceFadeRef.current) { clearInterval(voiceFadeRef.current); voiceFadeRef.current = null; fadingRef.current?.pause(); fadingRef.current = null; }
  }
  function fadeVoice(a: HTMLAudioElement, ms: number) {
    fadingRef.current = a;
    const stepMs = 50, startVol = a.volume; let e = 0;
    voiceFadeRef.current = window.setInterval(() => {
      e += stepMs; a.volume = Math.max(0, startVol * (1 - e / ms));
      if (e >= ms) { if (voiceFadeRef.current) { clearInterval(voiceFadeRef.current); voiceFadeRef.current = null; } fadingRef.current = null; a.pause(); }
    }, stepMs);
  }
  function stopVoice(fade: boolean) {
    const a = audioRef.current; audioRef.current = null;
    clearVoiceTimers();
    if (a && fade) fadeVoice(a, 350); else a?.pause();
  }
  // eine Stimme starten und am Ende sanft ausklingen lassen (leicht verhallen)
  function startVoice(src: string) {
    const a = new Audio(src); a.volume = 0.9; audioRef.current = a; a.play().catch(() => {});
    const scheduleTail = () => {
      const d = a.duration; if (!isFinite(d) || d <= 0) return;
      const tail = 700;
      voiceTailRef.current = window.setTimeout(() => fadeVoice(a, tail), Math.max(0, d * 1000 - tail));
    };
    if (isFinite(a.duration) && a.duration > 0) scheduleTail();
    else a.addEventListener("loadedmetadata", scheduleTail, { once: true });
  }

  // Sprach-Führung: pro Schritt ein Clip, zum Abschluss der Outro-Clip. Start leicht
  // verzögert (Schale schließt den Abschnitt), jede Zeile klingt am Ende sanft aus.
  useEffect(() => {
    stopVoice(true);
    if (muted) { stopBell(); return; }
    if (phase === "run") voiceStartRef.current = window.setTimeout(() => { voiceStartRef.current = null; startVoice(CLIPS[step]); }, 600);
    else if (phase === "done") voiceStartRef.current = window.setTimeout(() => { voiceStartRef.current = null; startVoice(outro); }, 800);
    return () => {};
  }, [phase, step, muted]);

  // beim Verlassen alles stoppen
  useEffect(() => () => { stopVoice(false); stopBell(); }, []);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".rr-step", { opacity: 0, y: 14, duration: 0.5, ease: "power2.out" }); gsap.fromTo(".rr-breath", { scale: 0.92 }, { scale: 1.08, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" }); }, { dependencies: [phase, step], scope });

  useEffect(() => {
    if (phase !== "run") return;
    setSecs(RESET_STEPS[step].secs);
    const id = setInterval(() => setSecs((s) => {
      if (s > 1) return s - 1;
      clearInterval(id);
      playBell(); // Abschnitt schließen
      if (step < RESET_STEPS.length - 1) setStep((i) => i + 1); else setPhase("done");
      return 0;
    }), 1000);
    return () => clearInterval(id);
  }, [phase, step]);

  function next() { playBell(); if (step < RESET_STEPS.length - 1) setStep((i) => i + 1); else setPhase("done"); }
  const s = RESET_STEPS[step];

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>
        <button onClick={() => setMuted((m) => !m)} title={muted ? "Voice on" : "Voice off"} aria-label={muted ? "Turn voice on" : "Turn voice off"}
          style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-secondary)", marginBottom: 18 }}>
          <Icon name={muted ? "volumeOff" : "volume"} size={18} />
        </button>
      </div>

      {phase === "intro" && (
        <div className="rr-step" style={{ maxWidth: 520, margin: "auto", width: "100%" }}>
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", fontSize: 30, margin: "0 auto" }}>🫧</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "16px 0 8px" }}>Reset Ritual</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 26px", lineHeight: 1.55 }}>A two-minute micro-break between two meetings. Just follow the steps, breathe, arrive, carry on.</p>
            <button onClick={begin} style={{ ...primaryBtn, width: "100%" }}>Start <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {phase === "run" && (
        <div style={{ maxWidth: 520, margin: "auto", width: "100%" }}>
          {/* progress dots */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 22 }}>
            {RESET_STEPS.map((_, i) => <span key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 999, background: i <= step ? ACCENT : "rgba(28,26,23,0.12)", transition: "all 0.3s" }} />)}
          </div>
          <div className="rr-step" key={step} style={{ textAlign: "center" }}>
            <div className="rr-breath" style={{ width: 150, height: 150, borderRadius: "50%", margin: "0 auto 28px", background: `radial-gradient(circle at 50% 45%, ${ACCENT}, rgba(167,199,231,0.25))`, display: "grid", placeItems: "center", boxShadow: "0 20px 50px rgba(120,150,190,0.3)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "#fff" }}>{secs}</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "0 0 10px" }}>{s.t}</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 17, color: "var(--text-body)", margin: "0 auto", maxWidth: 380, lineHeight: 1.5 }}>{s.d}</p>
            <button onClick={next} style={{ ...ghostBtn, marginTop: 28 }}>{step < RESET_STEPS.length - 1 ? "Next" : "Done"}</button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="rr-step" style={{ maxWidth: 520, margin: "auto", width: "100%" }}>
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>🌿</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 8px" }}>You've arrived</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 26px", lineHeight: 1.55 }}>You just gave yourself a calm moment. Take this feeling with you, it goes with you into the next step. See you next time.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={begin} style={primaryBtn}>Again</button>
              <button onClick={() => navigate("/app/balance")} style={ghostBtn}>Back</button>
            </div>
          </Glass>
        </div>
      )}
    </div>
  );
}
