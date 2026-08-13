import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Icon from "../../components/Icon";
import GameIcon from "../../components/GameIcon";
import { Glass } from "../../components/ds";
import { MODULES } from "../../data/modules";
import type { Game } from "../../data/games";
import { FF_CARDS, FF_LEVEL } from "../../data/failForward";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

const TURN = 60; // seconds per card (visual, no penalty)

export default function FailForwardGame({ game: g }: { game: Game }) {
  const navigate = useNavigate();
  const accent = MODULES.find((m) => m.id === g.category)?.color ?? "var(--brand)";

  const [phase, setPhase] = useState<"intro" | "card" | "end">("intro");
  const [seen, setSeen] = useState<number[]>([]);
  const [cardIdx, setCardIdx] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [secs, setSecs] = useState(TURN);
  const [revealed, setRevealed] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".ff-card", { y: 18, scale: 0.96, duration: 0.4, ease: "back.out(1.6)" }); }, { dependencies: [cardIdx], scope });

  // per-card countdown
  useEffect(() => {
    if (phase !== "card") return;
    setSecs(TURN);
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cardIdx, phase]);

  function draw(replacePass = false) {
    let pool = FF_CARDS.map((_, i) => i).filter((i) => !seen.includes(i));
    if (pool.length === 0) { setSeen([]); pool = FF_CARDS.map((_, i) => i); }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCardIdx(pick);
    setSeen((s) => [...s, pick]);
    if (!replacePass) setCount((c) => c + 1);
    setRevealed(false);
    setPhase("card");
  }

  const card = cardIdx !== null ? FF_CARDS[cardIdx] : null;
  const lvl = card ? FF_LEVEL[card.level] : null;

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate(`/app/module/${g.category}`)} style={backBtn}>
        <Icon name="arrowLeft" size={16} /> {MODULES.find((m) => m.id === g.category)?.title ?? "Module"}
      </button>

      {phase === "intro" ? (
        <div style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: accent, display: "grid", placeItems: "center" }}><GameIcon game={g} size={36} /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>{g.title}</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>Fictional · Spontaneous · No wrong answer</div>
            <GameBrief g={g} accent={accent} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 26px" }}>{g.intro}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/app/live/failforward")} style={primaryBtn}>Live with the team <Icon name="arrowRight" size={18} /></button>
              <button onClick={() => draw()} style={ghostBtn}>Solo</button>
            </div>
          </Glass>
        </div>
      ) : (
        <div style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-secondary)" }}>🃏 {count} {count === 1 ? "card" : "cards"} drawn</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: secs <= 10 ? "var(--danger)" : "var(--text-secondary)" }}>{secs}s</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(28,26,23,0.08)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ width: `${(secs / TURN) * 100}%`, height: "100%", background: accent, borderRadius: 999, transition: "width 1s linear" }} />
          </div>

          <div className="ff-card">
            <Glass pad={30} style={{ borderTop: `5px solid ${lvl!.color}` }}>
              <span style={{ display: "inline-block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff", background: lvl!.color, padding: "4px 12px", borderRadius: 999, marginBottom: 16 }}>{lvl!.label}</span>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, color: "var(--text-primary)", lineHeight: 1.35, margin: 0 }}>{card!.text}</p>
              <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 14, background: "rgba(28,26,23,0.05)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Reflection</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>{card!.reflection}</div>
              </div>
              <textarea placeholder="Your spontaneous reaction (optional, just for you) …" style={{ width: "100%", marginTop: 14, minHeight: 70, resize: "vertical", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />

              {!revealed ? (
                <button onClick={() => setRevealed(true)} style={{ ...ghostBtn, marginTop: 14, width: "100%" }}>💡 Show the takeaway</button>
              ) : (
                <div style={{ marginTop: 14, padding: "16px 18px", borderRadius: 14, background: `color-mix(in srgb, ${accent} 12%, rgba(255,255,255,0.7))` }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>💡 Take this with you</div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.6, margin: 0 }}>{card!.lesson}</p>
                  <div style={{ marginTop: 10, padding: "10px 13px", borderRadius: 11, background: "rgba(255,255,255,0.75)", borderLeft: `3px solid ${accent}` }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 3 }}>Steal this sentence</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontStyle: "italic", color: "var(--text-primary)", lineHeight: 1.5 }}>“{card!.steal}”</div>
                  </div>
                </div>
              )}
            </Glass>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            {count >= 3 ? (
              <button onClick={() => setPhase("end")} style={primaryBtn}>Wrap up <Icon name="arrowRight" size={18} /></button>
            ) : (
              <button onClick={() => draw()} style={primaryBtn}>Next card <Icon name="arrowRight" size={18} /></button>
            )}
            {count >= 3 && <button onClick={() => draw()} style={ghostBtn}>One more card</button>}
            {count < 3 && <button onClick={() => draw(true)} style={ghostBtn}>Pass, new card</button>}
          </div>
        </div>
      )}

      {phase === "end" && (
        <div style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <Glass pad={34}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🛟</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "0 0 10px" }}>That's the muscle</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 16px" }}>
              You just practiced reacting to failure with curiosity instead of shame, three times. That reflex is what makes real slips smaller: own it fast, mine it for the lesson, say it out loud.
            </p>
            <div style={{ padding: "14px 16px", borderRadius: 14, background: `color-mix(in srgb, ${accent} 12%, rgba(255,255,255,0.7))`, fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.6, marginBottom: 22 }}>
              <strong>Try it with your team:</strong> a 5-minute “fail of the week” round in your next team call. One person goes first (that could be you), everyone tops it, nobody fixes anything. Watch what it does to honesty over a month.
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => { setCount(0); draw(); }} style={primaryBtn}>Play again</button>
              <button onClick={() => navigate("/app/live/failforward")} style={ghostBtn}>Live with the team</button>
              <button onClick={() => navigate(`/app/module/${g.category}`)} style={ghostBtn}>Back to the module</button>
            </div>
          </Glass>
        </div>
      )}
    </div>
  );
}
