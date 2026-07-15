import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import MeditationFace from "../components/MeditationFace";
import Icon from "../components/Icon";
import bgm from "../assets/audio/still-water-drift.mp3";

export default function MeditationView() {
  const navigate = useNavigate();
  const scope = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState("Breathe in …");

  // Meditation music, fades in slowly on open, loops, and stops on leave.
  useEffect(() => {
    const audio = new Audio(bgm);
    audio.loop = true;
    audio.volume = 0;
    let left = false;
    // if play() resolves only after we've already left, pause it right away
    audio.play().then(() => { if (left) audio.pause(); }).catch(() => {});
    const fadeIn = gsap.to(audio, { volume: 0.45, duration: 7, ease: "power1.inOut" });
    return () => {
      left = true;
      fadeIn.kill();
      gsap.killTweensOf(audio);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.set(".med-breath", { opacity: 0, scale: 0.3, y: 0 })
        .set(".med-mouth", { attr: { rx: 15, ry: 7 } })
        // inhale, face grows, mouth opens in place to draw air in
        .to(".med-face", { scale: 1.12, duration: 4, ease: "sine.inOut", onStart: () => setPhase("Breathe in …") })
        .to(".med-ring", { scale: 1.28, opacity: 0.5, duration: 4, ease: "sine.inOut" }, "<")
        .to(".med-mouth", { attr: { rx: 13, ry: 17 }, duration: 4, ease: "sine.inOut" }, "<")
        // exhale, face relaxes, mouth purses (stays in place) and a puff of breath leaves it
        .addLabel("ex")
        .to(".med-face", { scale: 1.0, duration: 5, ease: "sine.inOut", onStart: () => setPhase("… and out") }, "ex")
        .to(".med-ring", { scale: 1.0, opacity: 0.2, duration: 5, ease: "sine.inOut" }, "ex")
        .to(".med-mouth", { attr: { rx: 18, ry: 9 }, duration: 2.6, ease: "power1.out" }, "ex+=0.1")
        .fromTo(".med-breath", { scale: 0.3, opacity: 0, y: 0 }, { scale: 1.7, opacity: 0.6, y: 58, duration: 2.6, ease: "power1.out" }, "ex+=0.2")
        .to(".med-breath", { opacity: 0, duration: 2.2, ease: "power1.in" }, "ex+=1.7");

      gsap.to(".med-float", { y: -14, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    },
    { scope }
  );

  return (
    <div ref={scope} style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 24, left: 24, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.55)", background: "rgba(247,244,239,0.6)", backdropFilter: "blur(12px)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>
        <Icon name="arrowLeft" size={16} /> back
      </button>

      <div style={{ position: "relative", display: "grid", placeItems: "center", marginBottom: 40 }}>
        <div className="med-ring" style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: "2px solid var(--brand-light)", opacity: 0.2 }} />
        <div className="med-float" style={{ position: "relative", display: "grid", placeItems: "center" }}>
          <div className="med-face" style={{ filter: "drop-shadow(0 22px 40px rgba(60,55,48,0.22))" }}>
            <MeditationFace size={260} color="var(--candy-mint)" breathing />
          </div>
          {/* exhaled breath */}
          <div className="med-breath" style={{ position: "absolute", left: "50%", top: "64%", transform: "translateX(-50%)", width: 70, height: 70, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0))", filter: "blur(6px)", pointerEvents: "none" }} />
        </div>
      </div>

      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, letterSpacing: "-0.01em", color: "var(--text-primary)", margin: 0, textShadow: "0 2px 30px rgba(255,255,255,0.7)" }}>{phase}</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-secondary)", margin: "10px 0 0", textShadow: "0 1px 16px rgba(255,255,255,0.7)" }}>Follow the rhythm, breathe for 1 minute.</p>
    </div>
  );
}
