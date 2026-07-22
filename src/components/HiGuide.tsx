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
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.82"; e.currentTarget.style.transform = "none"; }}
        style={{ position: "fixed", right: 12, bottom: isMobile ? 84 : 18, zIndex: 45, width: 50, height: 56, borderRadius: 18, border: "1px solid var(--border-default)", background: "var(--bg-elevated, #F7F4EF)", boxShadow: "0 8px 24px rgba(28,26,23,0.18)", cursor: "pointer", display: "grid", placeItems: "end center", paddingBottom: 3, opacity: 0.82, transition: "opacity 0.2s, transform 0.2s" }}>
        <HiMascot size={44} pose="wave" reduced={reduced} />
      </button>
    );
  }

  // ── Active tour: spotlight + speech bubble ──
  const pad = 8;
  const hx = rect ? rect.left - pad : 0;
  const hy = rect ? rect.top - pad : 0;
  const hw = rect ? rect.width + pad * 2 : 0;
  const hh = rect ? rect.height + pad * 2 : 0;

  // Position the whole unit next to the highlighted nav item: on desktop the
  // sidebar sits on the left, so the bubble goes to its right; on mobile the tab
  // bar is at the bottom, so the bubble floats just above it. No target → centered.
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const UNIT_W = Math.min(384, vw - 24);
  const EST_H = 250;
  let unitPos: React.CSSProperties;
  if (!rect) {
    unitPos = { left: clamp((vw - UNIT_W) / 2, 12, vw - UNIT_W - 12), top: clamp(vh * 0.5 - EST_H / 2, 16, vh - EST_H - 16) };
  } else if (!isMobile) {
    unitPos = { left: clamp(rect.right + 18, 12, vw - UNIT_W - 12), top: clamp(rect.top + rect.height / 2 - 100, 14, vh - EST_H - 14) };
  } else {
    const above = rect.top > vh * 0.5;
    unitPos = { left: clamp(rect.left + rect.width / 2 - UNIT_W / 2, 12, vw - UNIT_W - 12), top: above ? clamp(rect.top - EST_H - 12, 12, vh - EST_H - 12) : clamp(rect.bottom + 12, 12, vh - EST_H - 12) };
  }

  const isLast = idx === TOUR.length - 1;
  const pose: "wave" | "point" | "idle" = step.wave ? "wave" : step.target ? "point" : "idle";
  const bubbleBg = "var(--bg-elevated, #F7F4EF)";
  const bLine = "1px solid rgba(28,26,23,0.10)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <style>{"@keyframes hi-pop{0%{opacity:0;transform:translateY(10px) scale(0.97)}100%{opacity:1;transform:none}}"}</style>
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

      {/* Hi as a standing figure, with a comic speech bubble pointing at it */}
      <div style={{ position: "fixed", width: UNIT_W, ...unitPos }}>
        <div style={{ display: "flex", alignItems: "center", animation: reduced ? "none" : "hi-pop 0.42s cubic-bezier(0.22,1,0.36,1)" }}>
          <div style={{ flex: "0 0 auto", marginRight: -10, marginBottom: -6, zIndex: 2 }}>
            <HiMascot size={122} pose={pose} reduced={reduced} />
          </div>

          <div style={{ position: "relative", flex: 1, minWidth: 0, background: bubbleBg, border: bLine, borderRadius: 22, padding: "18px 18px 15px", boxShadow: "0 18px 50px rgba(28,26,23,0.24)" }}>
            <span style={{ position: "absolute", left: -8, top: 30, width: 16, height: 16, background: bubbleBg, borderLeft: bLine, borderBottom: bLine, transform: "rotate(45deg)" }} />

            <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn Hi's voice on" : "Turn Hi's voice off"} title={muted ? "Voice on" : "Voice off"}
              style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 10, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-secondary)" }}>
              <Icon name={muted ? "volumeOff" : "volume"} size={15} />
            </button>

            <div style={{ paddingRight: 30 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 5 }}>{step.title}</div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.45, margin: 0 }}>{step.line}</p>
            </div>

            <div style={{ display: "flex", gap: 5, margin: "14px 0 12px" }}>
              {TOUR.map((_, i) => <span key={i} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 999, background: i === idx ? "var(--brand, #3B6FF6)" : "rgba(28,26,23,0.14)", transition: "all 0.25s" }} />)}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <button onClick={finish} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", padding: "6px 2px" }}>Skip</button>
              <button onClick={next} style={{ height: 42, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
                {isLast ? "Let's go" : "Next"} <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
