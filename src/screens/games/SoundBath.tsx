import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { SOUND_LIBRARY, DURATIONS, soundUrl, type Sound } from "../../data/soundBath";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type Phase = "library" | "setup" | "playing" | "fadeout";

export default function SoundBath({ onComplete, embedded = false }: { onComplete?: (r: { minutes: number }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("library");
  const [selId, setSelId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [duration, setDuration] = useState(10);   // minutes, 0 = endless
  const [volume, setVolume] = useState(0.7);
  const [secsLeft, setSecsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [audioMissing, setAudioMissing] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // A single persistent <audio> element that lives in the DOM (see the JSX below).
  // This is far more reliable than detached `new Audio()`, especially on iOS Safari.
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);
  const wakeRef = useRef<{ release: () => void } | null>(null);
  const endTimeRef = useRef(0);      // wall-clock end of a timed session
  const pausedLeftRef = useRef(0);   // seconds left, captured on pause
  const sound = SOUND_LIBRARY.find((s) => s.id === selId) ?? null;
  const fileName = (f: string) => f.split("/").pop() ?? f;

  // ── keep the phone awake so the bath isn't cut off by screen auto-lock ──
  async function acquireWake() {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => void }> } };
      if (nav.wakeLock) wakeRef.current = await nav.wakeLock.request("screen");
    } catch { /* unsupported or denied, harmless */ }
  }
  function releaseWake() { try { wakeRef.current?.release(); } catch { /* noop */ } wakeRef.current = null; }

  // ── audio helpers ──
  function clearFade() { if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; } }
  function stopAudio() {
    clearFade(); releaseWake();
    const a = audioRef.current;
    if (a) a.pause();
  }
  function play(file: string, vol: number) {
    const a = audioRef.current; if (!a) return;
    clearFade();
    // point the persistent element at the requested file (only reset src when it changes)
    if (!a.src.endsWith(fileName(file))) a.src = soundUrl(file);
    a.loop = true; a.volume = vol;
    a.play().then(() => { setAudioMissing(false); setAudioError(null); })
      .catch((e) => { setAudioMissing(true); setAudioError(e?.name === "NotAllowedError" ? "Tap once more to allow sound." : (e?.message || "Playback failed.")); });
  }
  function fadeTo(target: number, ms: number, onDone?: () => void) {
    const a = audioRef.current; if (!a) { onDone?.(); return; }
    clearFade();
    const start = a.volume, t0 = performance.now();
    // time-based so it still completes if background tabs throttle the interval
    fadeRef.current = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / ms);
      a.volume = Math.max(0, Math.min(1, start + (target - start) * p));
      if (p >= 1) { clearFade(); onDone?.(); }
    }, 60);
  }

  useEffect(() => () => { stopAudio(); }, []); // stop on unmount

  // ── library: tapping a card plays a soft looping preview (a taste before you commit).
  //    The session's own sound always starts fresh on Begin, so this never affects it. ──
  function previewSound(s: Sound) {
    setSelId(s.id); setPreviewId(s.id);
    play(s.file, 0.5); // play() stops any previous preview first
  }

  // ── session ──
  function begin() {
    setPaused(false);
    const total = duration * 60;
    endTimeRef.current = total ? Date.now() + total * 1000 : 0;
    setSecsLeft(total);
    setPhase("playing");
    // always start fresh on the Begin tap — the most reliable way to guarantee sound
    play(sound!.file, volume);
    acquireWake();
  }
  function togglePause() {
    const a = audioRef.current;
    if (!paused) {
      if (duration) pausedLeftRef.current = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      a?.pause(); setPaused(true); releaseWake();
    } else {
      if (duration) endTimeRef.current = Date.now() + pausedLeftRef.current * 1000;
      a?.play().catch(() => {}); setPaused(false); acquireWake();
    }
  }
  function endGently() {
    setPhase("fadeout"); releaseWake();
    fadeTo(0, 4000, () => { stopAudio(); onComplete?.({ minutes: duration }); window.setTimeout(() => { setPreviewId(null); setPhase("library"); }, 900); });
  }

  // countdown, clock-based so backgrounding can't distort it
  useEffect(() => {
    if (phase !== "playing" || paused || duration === 0) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecsLeft(left);
      if (left <= 0) endGently();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, duration]);

  // re-acquire the wake lock when returning to the tab mid-session
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "visible" && phase === "playing" && !paused) acquireWake(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused]);

  // live volume
  useEffect(() => { if (audioRef.current && phase === "playing") audioRef.current.volume = volume; }, [volume, phase]);

  // ── breathing visual ──
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduceMotion()) return;
    gsap.fromTo(".sb-orb", { scale: 0.9 }, { scale: 1.1, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.fromTo(".sb-ring", { scale: 0.95, opacity: 0.25 }, { scale: 1.18, opacity: 0.5, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { dependencies: [phase, selId], scope });

  const wrap: React.CSSProperties = embedded ? { width: "100%" } : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };
  const accent = sound?.color ?? "var(--candy-mint)";

  return (
    <div ref={scope} style={wrap}>
      {/* single persistent audio element, controlled via audioRef */}
      <audio ref={audioRef} loop playsInline preload="auto" onError={() => { setAudioMissing(true); setAudioError("The audio file could not be loaded."); }} style={{ display: "none" }} />
      {!embedded && (
        <button onClick={() => (phase === "library" ? (stopAudio(), navigate("/app/balance")) : (stopAudio(), setPhase(phase === "setup" ? "library" : "library")))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {phase === "library" ? "Balance" : "Sounds"}
        </button>
      )}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>

        {/* ───────── LIBRARY ───────── */}
        {phase === "library" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: "var(--candy-mint)", display: "grid", placeItems: "center", fontSize: 24, flexShrink: 0 }}>🎧</span>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>Sound Bath</h1>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Immersive ambient sound, no guidance. Just be with it.</div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 18px" }}>Tap a soundscape to hear a taste, then choose it.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SOUND_LIBRARY.map((s) => {
                const on = selId === s.id;
                return (
                  <button key={s.id} className={`sb-card sb-card-${s.id}`} onClick={() => previewSound(s)} style={{
                    display: "flex", alignItems: "center", gap: 15, textAlign: "left", padding: "15px 16px", borderRadius: 18, cursor: "pointer",
                    border: on ? `2px solid ${s.color}` : "1.5px solid var(--border-default)",
                    background: on ? `color-mix(in srgb, ${s.color} 14%, transparent)` : "rgba(255,255,255,0.55)", transition: "all 0.15s",
                  }}>
                    <span style={{ width: 52, height: 52, borderRadius: 15, background: s.color, display: "grid", placeItems: "center", fontSize: 26, flexShrink: 0 }}>{s.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>{s.title}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>{s.mood}</div>
                    </div>
                    {previewId === s.id ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12.5, color: s.color, fontWeight: 600 }}><Icon name="volume" size={15} /> preview</span>
                    ) : on ? (
                      <Icon name="check" size={18} color={s.color} />
                    ) : (
                      <Icon name="play" size={16} color="var(--text-muted)" />
                    )}
                  </button>
                );
              })}
            </div>

            {audioMissing && <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "14px 0 0", lineHeight: 1.5 }}>🎵 {audioError ?? "No audio yet."}</div>}

            <button className="sb-continue" onClick={() => { stopAudio(); setPreviewId(null); setPhase("setup"); }} disabled={!selId} style={{ ...primaryBtn, width: "100%", marginTop: 20, opacity: selId ? 1 : 0.45, cursor: selId ? "pointer" : "not-allowed" }}>Continue <Icon name="arrowRight" size={18} /></button>
          </div>
        )}

        {/* ───────── SETUP ───────── */}
        {phase === "setup" && sound && (
          <Glass pad={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: sound.color, display: "grid", placeItems: "center", fontSize: 24, flexShrink: 0 }}>{sound.emoji}</span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>{sound.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>{sound.mood}</div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>How long?</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
              {DURATIONS.map((d) => {
                const on = duration === d.min;
                return <button key={d.min} onClick={() => setDuration(d.min)} style={{ padding: "10px 18px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: on ? 600 : 400, border: on ? `1.5px solid ${sound.color}` : "1.5px solid var(--border-strong)", background: on ? `color-mix(in srgb, ${sound.color} 14%, transparent)` : "rgba(255,255,255,0.55)", color: "var(--text-primary)" }}>{d.label}</button>;
              })}
            </div>

            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Volume</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
              <Icon name="volume" size={18} color="var(--text-muted)" />
              <input type="range" min={0} max={100} value={Math.round(volume * 100)} onChange={(e) => setVolume(Number(e.target.value) / 100)} style={{ flex: 1, accentColor: sound.color }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", minWidth: 34, textAlign: "right" }}>{Math.round(volume * 100)}%</span>
            </div>

            <button className="sb-begin" onClick={begin} style={{ ...primaryBtn, width: "100%" }}>Begin <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ───────── PLAYING / FADEOUT ───────── */}
        {(phase === "playing" || phase === "fadeout") && sound && (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <div style={{ position: "relative", width: 260, height: 260, margin: "10px auto 24px", display: "grid", placeItems: "center" }}>
              <div className="sb-ring" style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", border: `2px solid ${accent}`, opacity: 0.3 }} />
              <div className="sb-orb" style={{ width: 190, height: 190, borderRadius: "50%", background: `radial-gradient(circle at 50% 42%, ${accent}, color-mix(in srgb, ${accent} 20%, transparent))`, boxShadow: `0 24px 60px color-mix(in srgb, ${accent} 45%, transparent)`, display: "grid", placeItems: "center" }}>
                <span style={{ fontSize: 40 }}>{sound.emoji}</span>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>{sound.title}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginTop: 3 }}>
              {phase === "fadeout" ? "Fading out…" : duration === 0 ? "Endless" : `${mmss(secsLeft)} left`}
            </div>
            {audioMissing && phase === "playing" && <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>🎵 {audioError ?? "Silent for now."} <button onClick={() => play(sound.file, volume)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 12.5, textDecoration: "underline" }}>Try again</button></div>}

            {phase === "playing" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 320, margin: "22px auto 0" }}>
                  <Icon name="volume" size={17} color="var(--text-muted)" />
                  <input type="range" min={0} max={100} value={Math.round(volume * 100)} onChange={(e) => setVolume(Number(e.target.value) / 100)} style={{ flex: 1, accentColor: accent }} />
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22 }}>
                  <button onClick={togglePause} style={{ ...ghostBtn, width: 130 }}>{paused ? "Resume" : "Pause"}</button>
                  <button onClick={endGently} style={{ ...primaryBtn, width: 130 }}>Finish</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
