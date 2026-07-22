import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Icon from "../../components/Icon";
import GameIcon from "../../components/GameIcon";
import { Glass } from "../../components/ds";
import { MODULES } from "../../data/modules";
import type { Game } from "../../data/games";
import { FF_CARDS, FF_REFLECTIONS, FF_LEVEL } from "../../data/failForward";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

const TURN = 60; // seconds per card (visual, no penalty)

export default function FailForwardGame({ game: g }: { game: Game }) {
  const navigate = useNavigate();
  const accent = MODULES.find((m) => m.id === g.category)?.color ?? "var(--brand)";

  const [phase, setPhase] = useState<"intro" | "card">("intro");
  const [seen, setSeen] = useState<number[]>([]);
  const [cardIdx, setCardIdx] = useState<number | null>(null);
  const [refIdx, setRefIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [secs, setSecs] = useState(TURN);

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
    setRefIdx(Math.floor(Math.random() * FF_REFLECTIONS.length));
    setSeen((s) => [...s, pick]);
    if (!replacePass) setCount((c) => c + 1);
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
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>{FF_REFLECTIONS[refIdx]}</div>
              </div>
              <textarea placeholder="Your spontaneous reaction (optional, just for you) …" style={{ width: "100%", marginTop: 14, minHeight: 70, resize: "vertical", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            </Glass>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <button onClick={() => draw()} style={primaryBtn}>Next card <Icon name="arrowRight" size={18} /></button>
            <button onClick={() => draw(true)} style={ghostBtn}>Pass, new card</button>
          </div>
        </div>
      )}
    </div>
  );
}
