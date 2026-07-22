import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Icon from "../../components/Icon";
import { Glass } from "../../components/ds";
import { HiEmoji, type HiEmojiName } from "../../components/MoodFace";
import { MODULES } from "../../data/modules";
import type { Game } from "../../data/games";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

export default function QuizGame({ game: g }: { game: Game }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"intro" | "play" | "end">("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".gm-stage", { y: 20, duration: 0.38, ease: "power2.out" }); }, { dependencies: [phase, round], scope });

  const accent = MODULES.find((m) => m.id === g.category)?.color ?? "var(--brand)";
  const total = g.rounds.length;
  const r = g.rounds[round];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (r.options[i].ok) setScore((s) => s + 1);
  }
  function next() {
    if (round < total - 1) { setRound(round + 1); setPicked(null); }
    else setPhase("end");
  }
  function restart() { setRound(0); setScore(0); setPicked(null); setPhase("intro"); }

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate(`/app/module/${g.category}`)} style={backBtn}>
        <Icon name="arrowLeft" size={16} /> {MODULES.find((m) => m.id === g.category)?.title ?? "Module"}
      </button>

      {phase === "intro" && (
        <div className="gm-stage" style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: accent, display: "grid", placeItems: "center", fontSize: 32 }}>{g.emoji}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>{g.title}</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>{g.skill}</div>
            <GameBrief g={g} accent={accent} rounds={total} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 26px" }}>{g.intro}</p>
            <button onClick={() => setPhase("play")} style={primaryBtn}>Let's go <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {phase === "play" && (
        <div style={{ maxWidth: 640, margin: "auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{g.title}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(28,26,23,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${(round / total) * 100}%`, height: "100%", borderRadius: 999, background: accent, transition: "width 0.35s var(--ease-out)" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-secondary)", minWidth: 78, textAlign: "right" }}>Round {round + 1} / {total}</span>
          </div>

          <div className="gm-stage" key={round}>
            <Glass pad={26}>
              {r.dim && <div style={{ display: "inline-block", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", background: "rgba(28,26,23,0.05)", padding: "5px 11px", borderRadius: 999, marginBottom: 14 }}>{r.dim}</div>}
              {r.speaker ? (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 44, height: 44, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 }}>{r.speaker.flag ?? "💬"}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", marginBottom: 3 }}>{r.speaker.name}</div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 16.5, color: "var(--text-primary)", lineHeight: 1.45, margin: 0 }}>“{r.msg}”</p>
                  </div>
                </div>
              ) : (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 17, color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>{r.msg}</p>
              )}
            </Glass>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {r.options.map((o, i) => {
                const revealed = picked !== null;
                const isPicked = picked === i;
                const tone = revealed && (o.ok ? "ok" : isPicked ? "no" : "dim");
                return (
                  <div key={i}>
                    <button onClick={() => choose(i)} disabled={revealed} style={optionBtn(tone)}>
                      <span style={{ flex: 1 }}>{o.t}</span>
                      {revealed && o.ok && <Icon name="check" size={18} color="#1B7A4B" />}
                      {revealed && isPicked && !o.ok && <span style={{ color: "#C0392B", fontWeight: 700 }}>✕</span>}
                    </button>
                    {revealed && (isPicked || o.ok) && (
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.45, padding: "8px 14px 2px" }}>{o.fb}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {picked !== null && (
              <button onClick={next} style={{ ...primaryBtn, marginTop: 18, width: "100%" }}>
                {round < total - 1 ? "Next round" : "See result"} <Icon name="arrowRight" size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "end" && (
        <div className="gm-stage" style={{ maxWidth: 560, margin: "auto", width: "100%" }}>
          <Glass pad={34}>
            <div style={{ width: 92, height: 92, margin: "0 auto 6px" }}><HiEmoji name={resultEmoji(total ? score / total : 0)} size={92} /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", margin: "8px 0 4px" }}>
              {score} / {total} {g.scoreNoun ?? "on-point answers"}
            </h1>
            {score === total && g.proLabel && <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: accent }}>{g.proLabel}</div>}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "16px 0 26px" }}>{g.closing}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={restart} style={primaryBtn}>Play again</button>
              <button onClick={() => navigate(`/app/module/${g.category}`)} style={ghostBtn}>Back to the module</button>
            </div>
          </Glass>
        </div>
      )}
    </div>
  );
}

/* Reaction face for the result screen, warmer the better you did.
   Even a zero lands on an encouraging "keep thinking", never a sad face. */
function resultEmoji(ratio: number): HiEmojiName {
  if (ratio >= 1) return "party";
  if (ratio >= 0.6) return "win";
  if (ratio > 0) return "cool";
  return "think";
}

function optionBtn(tone: false | "ok" | "no" | "dim"): React.CSSProperties {
  const base: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "15px 18px", borderRadius: 14, cursor: tone ? "default" : "pointer", fontFamily: "var(--font-body)", fontSize: 15.5, lineHeight: 1.4, color: "var(--text-primary)", background: "rgba(255,255,255,0.62)", border: "1.5px solid var(--border-default)", transition: "all 0.15s", backdropFilter: "blur(8px)" };
  if (tone === "ok") return { ...base, background: "rgba(27,122,75,0.12)", border: "1.5px solid #1B7A4B" };
  if (tone === "no") return { ...base, background: "rgba(192,57,43,0.10)", border: "1.5px solid rgba(192,57,43,0.5)" };
  if (tone === "dim") return { ...base, opacity: 0.55 };
  return base;
}
