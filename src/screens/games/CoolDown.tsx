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

type Phase = "intro" | "steady" | "split" | "need" | "decide" | "close";

const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const exampleBox: React.CSSProperties = { padding: "12px 14px", borderRadius: 12, background: "rgba(199,125,147,0.08)", border: "1px solid rgba(199,125,147,0.25)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 18 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 74, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };

export default function CoolDown({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [fact, setFact] = useState("");
  const [story, setStory] = useState("");
  const [need, setNeed] = useState("");
  const [generous, setGenerous] = useState("");
  const [choice, setChoice] = useState<"now" | "later" | null>(null);
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

  function finish() { onComplete?.(); if (!embedded) navigate("/app/module/conflict"); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

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
            <div style={{ height: 220, display: "grid", placeItems: "center", marginBottom: 8 }}>
              <div style={{ width: 170, height: 170, borderRadius: "50%", background: `radial-gradient(circle at 50% 45%, ${ACCENT}, rgba(215,150,175,0.2))`, boxShadow: "0 18px 46px rgba(190,120,150,0.28)", animation: reduce ? "none" : "cdpulse 5.5s ease-in-out infinite" }} />
            </div>
            <style>{"@keyframes cdpulse{0%,100%{transform:scale(0.82)}50%{transform:scale(1.06)}}"}</style>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 10px" }}>Let the heat drop a notch</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-secondary)", margin: "0 auto 12px", maxWidth: 340, lineHeight: 1.5 }}>Unclench your jaw. One slow breath out. There's no message you have to send this second.</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", margin: "0 auto 28px", maxWidth: 340, lineHeight: 1.5 }}>Keep the moment that stung in mind, a message, a comment, a look. We'll take it apart together in the next step.</p>
            <button onClick={() => setPhase("split")} style={{ ...primaryBtn, width: "100%", maxWidth: 340 }}>I'm a bit steadier <Icon name="arrowRight" size={18} /></button>
          </div>
        )}

        {phase === "split" && (
          <Glass pad={32}>
            <div style={label}>Fact vs. story</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.3 }}>Split what happened from the story about it.</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>The heat usually lives in the story, not the fact. Naming both takes the edge off.</p>
            <div style={exampleBox}>
              <strong>Example:</strong> Sam replied to your proposal with just "ok."<br />
              <strong>The fact:</strong> Sam wrote "ok." <strong style={{ color: ACCENT_DEEP }}>The story:</strong> "Sam doesn't value my work."
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>The fact, just what was said or done</div>
              <textarea value={fact} onChange={(e) => setFact(e.target.value)} placeholder="What a camera would have recorded …" autoFocus style={taArea} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: ACCENT_DEEP, marginBottom: 6 }}>The story, what I'm making it mean</div>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="What you're reading into it, e.g. “they don't respect me” …" style={taArea} />
            </div>
            <button onClick={() => setPhase("need")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "need" && (
          <Glass pad={32}>
            <div style={label}>Underneath the heat</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.3 }}>Two quick questions.</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>Anger usually guards something you need. And the other person usually has a less dramatic reason than your story says.</p>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>What do you actually need here?</div>
              <textarea value={need} onChange={(e) => setNeed(e.target.value)} placeholder="e.g. to be heard, an apology, clarity, a change …" autoFocus style={taArea} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>A more generous read of them</div>
              <textarea value={generous} onChange={(e) => setGenerous(e.target.value)} placeholder="e.g. maybe Sam was in a rush and it wasn't about me …" style={taArea} />
            </div>
            <button onClick={() => setPhase("decide")} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>Next <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "decide" && (
          <Glass pad={32}>
            <div style={label}>Your move, on purpose</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 18px", lineHeight: 1.3 }}>Respond now, or later?</h2>
            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
              <button onClick={() => setChoice("later")} style={{ ...(choice === "later" ? primaryBtn : ghostBtn), flex: 1, height: 52, background: choice === "later" ? ACCENT_DEEP : undefined, borderColor: choice === "later" ? ACCENT_DEEP : undefined }}>Later</button>
              <button onClick={() => setChoice("now")} style={{ ...(choice === "now" ? primaryBtn : ghostBtn), flex: 1, height: 52, background: choice === "now" ? ACCENT_DEEP : undefined, borderColor: choice === "now" ? ACCENT_DEEP : undefined }}>Now</button>
            </div>
            {choice && (
              <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55 }}>
                {choice === "later"
                  ? "Good call. Give it an hour, even a day. The story usually shrinks with time. Come back when you're responding, not reacting."
                  : "Then speak from the fact, not the story. Name the impact on you, ask a real question, and leave room for their side. You can always start with, “Can I share how that landed for me?”"}
              </div>
            )}
            <button onClick={() => setPhase("close")} disabled={!choice} style={{ ...primaryBtn, width: "100%", marginTop: 18, opacity: choice ? 1 : 0.45, cursor: choice ? "pointer" : "not-allowed" }}>Done <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {phase === "close" && (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="#fff" /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 10px" }}>You made a gap</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>Between the spark and the reaction, you put a gap. That gap is where your power is. Nothing here was saved.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setFact(""); setStory(""); setNeed(""); setGenerous(""); setChoice(null); setPhase("steady"); }} style={primaryBtn}>Again</button>
              <button onClick={finish} style={ghostBtn}>Back to the module</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
