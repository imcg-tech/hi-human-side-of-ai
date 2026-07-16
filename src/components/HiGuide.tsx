import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import HiMascot from "./HiMascot";
import { useStore } from "../lib/store";
import { useMediaQuery } from "../lib/useMediaQuery";
import { TOUR, tourClipUrl } from "../data/tour";

/* One shared voice element (module-level) so re-renders / StrictMode never spawn
   overlapping copies. Missing clips just fail to play → the tour stays silent. */
let hiVoice: HTMLAudioElement | null = null;
function getHiVoice(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (!hiVoice) hiVoice = new Audio();
  return hiVoice;
}

export default function HiGuide() {
  const privacyIntroSeen = useStore((s) => s.privacyIntroSeen);
  const tourSeen = useStore((s) => s.tourSeen);
  const setTourSeen = useStore((s) => s.setTourSeen);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const started = useRef(false);

  const step = TOUR[idx];

  // Auto-start once, after the privacy intro is acknowledged. The ref is set inside
  // the timeout (not before) so React StrictMode's double-invoke can't cancel it.
  useEffect(() => {
    if (started.current || !privacyIntroSeen || tourSeen) return;
    const t = setTimeout(() => { started.current = true; setIdx(0); setActive(true); }, 650);
    return () => clearTimeout(t);
  }, [privacyIntroSeen, tourSeen]);

  // Measure the spotlight target for the current step.
  const measure = useCallback(() => {
    const s = TOUR[idx];
    if (!s?.target) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${s.target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [idx]);

  useEffect(() => {
    if (!active) return;
    measure();
    const t = setTimeout(measure, 130);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [active, idx, measure]);

  // Voice per step (optional, graceful if the clip is missing).
  useEffect(() => {
    if (!active) return;
    const a = getHiVoice(); if (!a) return;
    a.pause();
    if (muted) return;
    a.src = tourClipUrl(TOUR[idx].clip); a.currentTime = 0; a.volume = 0.9;
    a.play().catch(() => {});
  }, [active, idx, muted]);

  useEffect(() => () => { const a = getHiVoice(); a && a.pause(); }, []);

  function stopVoice() { const a = getHiVoice(); a && a.pause(); }
  function finish() { stopVoice(); setActive(false); setTourSeen(); }
  function next() { if (idx >= TOUR.length - 1) finish(); else setIdx((i) => i + 1); }
  function replay() { setIdx(0); setActive(true); }

  // ── Parked helper button (after the tour) ──
  if (!active) {
    if (!tourSeen) return null;
    return (
      <button onClick={replay} aria-label="Replay the intro tour with Hi" title="Need a hand? Replay the tour"
        style={{ position: "fixed", right: 16, bottom: isMobile ? 90 : 22, zIndex: 45, width: 54, height: 54, borderRadius: "50%", border: "1px solid var(--border-default)", background: "var(--bg-elevated, #F7F4EF)", boxShadow: "0 8px 24px rgba(28,26,23,0.18)", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 }}>
        <HiMascot size={38} reduced={reduced} />
      </button>
    );
  }

  // ── Active tour: spotlight + speech bubble ──
  const pad = 8;
  const hx = rect ? rect.left - pad : 0;
  const hy = rect ? rect.top - pad : 0;
  const hw = rect ? rect.width + pad * 2 : 0;
  const hh = rect ? rect.height + pad * 2 : 0;

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const cardAtTop = !!rect && rect.top > vh * 0.5;
  const cardPos: React.CSSProperties = rect
    ? (cardAtTop ? { top: isMobile ? 26 : 34 } : { bottom: isMobile ? 100 : 34 })
    : { top: "50%", transform: "translateY(-42%)" };

  const isLast = idx === TOUR.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {/* dimmed backdrop with a spotlight hole */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="hi-hole">
            <rect width="100%" height="100%" fill="#fff" />
            {rect && <rect x={hx} y={hy} width={hw} height={hh} rx={16} fill="#000" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(24,21,18,0.60)" mask="url(#hi-hole)" />
        {rect && <rect x={hx} y={hy} width={hw} height={hh} rx={16} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} />}
      </svg>

      {/* speech bubble + mascot */}
      <div style={{ position: "fixed", left: 0, right: 0, margin: "0 auto", width: "calc(100% - 40px)", maxWidth: 360, ...cardPos }}>
        <div style={{ position: "relative", background: "var(--bg-elevated, #F7F4EF)", borderRadius: 24, padding: "22px 22px 20px", boxShadow: "0 20px 60px rgba(28,26,23,0.28)", border: "1px solid rgba(255,255,255,0.6)" }}>
          {/* mascot peeking on top */}
          <div style={{ position: "absolute", top: -46, left: 18 }}>
            <HiMascot size={72} waving={!!step.wave} reduced={reduced} />
          </div>

          {/* mute toggle */}
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn Hi's voice on" : "Turn Hi's voice off"} title={muted ? "Voice on" : "Voice off"}
            style={{ position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-secondary)" }}>
            <Icon name={muted ? "volumeOff" : "volume"} size={16} />
          </button>

          <div style={{ paddingTop: 30 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", marginBottom: 6 }}>{step.title}</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.5, margin: 0 }}>{step.line}</p>

            {/* progress dots */}
            <div style={{ display: "flex", gap: 6, margin: "18px 0 16px" }}>
              {TOUR.map((_, i) => <span key={i} style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 999, background: i === idx ? "var(--brand, #3B6FF6)" : "rgba(28,26,23,0.14)", transition: "all 0.25s" }} />)}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <button onClick={finish} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "8px 4px" }}>Skip</button>
              <button onClick={next} style={{ height: 46, padding: "0 22px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {isLast ? "Let's go" : "Next"} <Icon name="arrowRight" size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
