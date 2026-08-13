import { useEffect, useRef, useState } from "react";

/* Full-screen arrival moment before emotionally loaded exercises: a dark, calm
   room with a breathing circle, soft ambient sound and three guided breaths.
   Rendered after a user click (so audio autoplay is allowed). Skippable. */

const AMBIENT_SRC = "audio/singing-bowls.mp3";
const AMBIENT_VOL = 0.22;
const BREATH_MS = 5500;

export default function BreathingGate({ onDone, title = "Arrive first", line = "Three slow breaths before we sort anything out." }: { onDone: () => void; title?: string; line?: string }) {
  const [breaths, setBreaths] = useState(0);
  const [inhale, setInhale] = useState(true);
  const [muted, setMuted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const a = new Audio(AMBIENT_SRC);
    a.loop = true; a.volume = 0;
    audioRef.current = a;
    a.play().catch(() => {});
    const fade = setInterval(() => {
      a.volume = Math.min(AMBIENT_VOL, a.volume + 0.02);
      if (a.volume >= AMBIENT_VOL) clearInterval(fade);
    }, 90);
    const half = setInterval(() => setInhale((v) => !v), BREATH_MS / 2);
    const full = setInterval(() => setBreaths((b) => b + 1), BREATH_MS);
    return () => { clearInterval(fade); clearInterval(half); clearInterval(full); a.pause(); };
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted; }, [muted]);

  function leave() {
    if (leaving) return;
    setLeaving(true);
    // fade the room and the sound out together
    const a = audioRef.current;
    const fade = setInterval(() => {
      if (a) a.volume = Math.max(0, a.volume - 0.03);
      if (!a || a.volume <= 0) { clearInterval(fade); a?.pause(); }
    }, 60);
    setTimeout(onDone, 620);
  }

  const done = breaths >= 3;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center",
      background: "radial-gradient(circle at 50% 40%, #1c2438 0%, #0c101c 70%)",
      opacity: leaving ? 0 : 1, transition: "opacity 0.6s ease" }}>
      <style>{"@keyframes bg-breathe{0%,100%{transform:scale(0.72)}50%{transform:scale(1.08)}}"}</style>

      <button onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}
        style={{ position: "absolute", top: 22, right: 22, padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: "1px solid rgba(207,228,255,0.3)", background: "rgba(255,255,255,0.06)", color: "rgba(234,241,251,0.85)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>
        {muted ? "🔇 Sound off" : "🔊 Sound on"}
      </button>

      <div style={{ position: "relative", width: 230, height: 230, display: "grid", placeItems: "center", marginBottom: 26 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 50% 45%, rgba(158,201,255,0.85), rgba(158,201,255,0.08) 70%)",
          boxShadow: "0 0 90px rgba(158,201,255,0.35)",
          animation: reduce ? "none" : "bg-breathe 5.5s ease-in-out infinite" }} />
        <div style={{ position: "relative", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "#eaf1fb" }}>
          {reduce ? "Breathe slowly" : inhale ? "Breathe in …" : "… and out"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, marginBottom: 22 }} aria-label={`${Math.min(breaths, 3)} of 3 breaths`}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: breaths > i ? "#9ec9ff" : "rgba(234,241,251,0.18)", transition: "background 0.4s" }} />
        ))}
      </div>

      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#eaf1fb", margin: "0 0 8px" }}>
        {done ? "Good. You're here." : title}
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "rgba(234,241,251,0.75)", margin: "0 0 26px", maxWidth: 360, lineHeight: 1.55 }}>
        {done ? "Whatever it is, it can be sorted calmly now." : line}
      </p>

      <button onClick={leave}
        style={{ padding: "14px 30px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5,
          background: done ? "#cfe4ff" : "rgba(255,255,255,0.1)", color: done ? "#0c101c" : "rgba(234,241,251,0.8)",
          transition: "all 0.3s" }}>
        {done ? "Continue" : "Skip the breaths"}
      </button>
    </div>
  );
}
