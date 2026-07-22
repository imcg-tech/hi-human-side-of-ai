import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import HiMascot from "./HiMascot";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useStore } from "../lib/store";
import { ASSISTANT_INTENTS, type AssistantIntent } from "../data/assistant";

/* On-open greeting: when the app is opened, Hi says hi and immediately asks
   what's on your mind, so people are met and pointed somewhere good from the
   first second. Shows once per app session (sessionStorage), and only once the
   first-run tour is done so the two don't collide. */
export default function HiWelcome() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const tourSeen = useStore((s) => s.tourSeen);
  const displayName = useStore((s) => s.displayName);

  const [show, setShow] = useState(false);
  const [picked, setPicked] = useState<AssistantIntent | null>(null);

  useEffect(() => {
    if (!tourSeen) return; // let the first-run tour be the greeting instead
    if (pathname.includes("/assessment")) return;
    if (sessionStorage.getItem("hi-welcomed")) return;
    const t = setTimeout(() => { setShow(true); sessionStorage.setItem("hi-welcomed", "1"); }, 450);
    return () => clearTimeout(t);
  }, [tourSeen, pathname]);

  if (!show) return null;

  const hour = new Date().getHours();
  const greet = hour < 11 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = (displayName || "").split(" ")[0];
  const dismiss = () => setShow(false);
  const go = (route: string) => { setShow(false); navigate(route); };

  return (
    <div onClick={dismiss} style={{ position: "fixed", inset: 0, zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(28,26,23,0.34)", backdropFilter: "blur(5px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", background: "var(--sand-100, #F7F4EF)", borderRadius: 26, boxShadow: "0 24px 70px rgba(28,26,23,0.32)", border: "1px solid var(--border-default)", padding: "24px 22px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 60, height: 66, flexShrink: 0 }}><HiMascot size={66} pose={picked ? "point" : "wave"} reduced={reduced} /></div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", lineHeight: 1.15 }}>{greet}{name ? `, ${name}` : ""}!</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginTop: 2 }}>{picked ? "Then let's try this." : "How are you today?"}</div>
          </div>
        </div>

        {!picked ? (
          <>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.5, margin: "10px 2px 14px" }}>Pick what's on your mind and I'll point you somewhere good, a quick game or a breather.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ASSISTANT_INTENTS.map((it) => (
                <button key={it.id} onClick={() => setPicked(it)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", padding: "12px 14px", borderRadius: 14, cursor: "pointer", background: "rgba(255,255,255,0.7)", border: "1px solid var(--border-default)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.35 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{it.emoji}</span>
                  <span style={{ flex: 1 }}>{it.label}</span>
                  <Icon name="arrowRight" size={16} color="var(--text-muted)" />
                </button>
              ))}
            </div>
            <button onClick={dismiss} style={{ display: "block", width: "100%", textAlign: "center", marginTop: 14, background: "none", border: "none", padding: "6px 0", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)" }}>Just take me in →</button>
          </>
        ) : (
          <div style={{ marginTop: 8 }}>
            <button onClick={() => go(picked.rec.route)} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", border: "1.5px solid var(--brand)", background: "var(--brand-subtle)", borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--brand-dark)", marginBottom: 4 }}>Try this</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", lineHeight: 1.15 }}>{picked.rec.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "3px 0 12px", lineHeight: 1.5 }}>{picked.rec.line}</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 42, padding: "0 18px", borderRadius: 999, background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5 }}><Icon name="play" size={15} /> Start</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {picked.alt ? (
                <button onClick={() => go(picked.alt!.route)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>or try <strong style={{ color: "var(--text-primary)" }}>{picked.alt.title}</strong> →</button>
              ) : <span />}
              <button onClick={() => setPicked(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}><Icon name="arrowLeft" size={13} /> Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
