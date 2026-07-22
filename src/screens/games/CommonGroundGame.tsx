import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Icon from "../../components/Icon";
import { Glass } from "../../components/ds";
import { HiEmoji } from "../../components/MoodFace";
import { MODULES } from "../../data/modules";
import type { Game } from "../../data/games";
import { CG_QUESTIONS, CG_TAKEAWAYS, type CGQuestion } from "../../data/commonGround";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

const NUM = 3;
function shuffle<T>(a: T[]): T[] { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
// deterministic, plausibly spread team positions per question
function teamDots(q: CGQuestion): number[] {
  return ["lena", "theo", "mara", "cem", "ada", "jon"].map((id) => 8 + (hash(id + "|" + q.q) % 85));
}

export default function CommonGroundGame({ game: g }: { game: Game }) {
  const navigate = useNavigate();
  const accent = MODULES.find((m) => m.id === g.category)?.color ?? "var(--brand)";
  const questions = useMemo(() => shuffle(CG_QUESTIONS).slice(0, NUM), []);

  const [phase, setPhase] = useState<"intro" | "place" | "reveal" | "takeaway" | "summary">("intro");
  const [qNum, setQNum] = useState(0);
  const [myPos, setMyPos] = useState<number | null>(null);
  const [history, setHistory] = useState<{ q: CGQuestion; me: number; dots: number[] }[]>([]);
  const [take, setTake] = useState<number | null>(null);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".cg-stage", { y: 18, duration: 0.38, ease: "power2.out" }); }, { dependencies: [phase, qNum], scope });

  const q = questions[qNum];
  const dots = useMemo(() => (q ? teamDots(q) : []), [q]);

  function setFromClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setMyPos(Math.round(pct));
  }
  function reveal() {
    if (myPos === null) return;
    setHistory((h) => [...h, { q, me: myPos, dots }]);
    setPhase("reveal");
  }
  function nextQuestion() {
    if (qNum < NUM - 1) { setQNum(qNum + 1); setMyPos(null); setPhase("place"); }
    else setPhase("takeaway");
  }
  function restart() { setQNum(0); setMyPos(null); setHistory([]); setTake(null); setPhase("intro"); }

  const all = myPos !== null ? [...dots, myPos] : dots;
  const spread = Math.max(...all) - Math.min(...all);
  const comment = spread < 28 ? "You're close together, or does no one dare to go to the other end? 👀" : spread > 60 ? "Big spread! This is exactly where the team conversation pays off." : "There are clear differences, who's sitting at the edges?";

  const Scale = ({ q: qq, me, teamPositions, interactive }: { q: CGQuestion; me: number | null; teamPositions: number[]; interactive: boolean }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
        <span style={{ maxWidth: "45%" }}>◀ {qq.left}</span>
        <span style={{ maxWidth: "45%", textAlign: "right" }}>{qq.right} ▶</span>
      </div>
      <div style={{ position: "relative", height: 56, borderRadius: 16, background: "rgba(28,26,23,0.05)", border: "1px solid var(--border-default)" }}>
        {/* inner track inset 16px on each side; dots positioned by plain percentage */}
        <div onClick={interactive ? setFromClick : undefined} style={{ position: "absolute", left: 16, right: 16, top: 0, bottom: 0, cursor: interactive ? "pointer" : "default" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: "rgba(28,26,23,0.14)", borderRadius: 2 }} />
          {!interactive && teamPositions.map((p, i) => (
            <span key={i} style={{ position: "absolute", top: "50%", left: `${p}%`, transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "rgba(60,55,48,0.45)", border: "2px solid rgba(255,255,255,0.7)" }} />
          ))}
          {me !== null && (
            <span style={{ position: "absolute", top: "50%", left: `${me}%`, transform: "translate(-50%,-50%)", width: 26, height: 26, borderRadius: "50%", background: accent, border: "2.5px solid #fff", boxShadow: "var(--shadow-sm)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9, color: "var(--ink-fill)", zIndex: 2 }}>You</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate(`/app/module/${g.category}`)} style={backBtn}>
        <Icon name="arrowLeft" size={16} /> {MODULES.find((m) => m.id === g.category)?.title ?? "Module"}
      </button>

      {phase === "intro" && (
        <div className="cg-stage" style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: accent, display: "grid", placeItems: "center", fontSize: 32 }}>{g.emoji}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>{g.title}</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>{g.skill}</div>
            <GameBrief g={g} accent={accent} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 18px" }}>{g.intro}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/app/live/commonground")} style={primaryBtn}>Live with the team <Icon name="arrowRight" size={18} /></button>
              <button onClick={() => setPhase("place")} style={ghostBtn}>Solo demo</button>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "14px 0 0", lineHeight: 1.5 }}>
              Common Ground thrives on real people, play it <strong>live with your team</strong>. The solo demo shows the mechanic with <em>simulated</em> answers.
            </p>
          </Glass>
        </div>
      )}

      {(phase === "place" || phase === "reveal") && q && (
        <div className="cg-stage" style={{ maxWidth: 640, margin: "auto", width: "100%" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{q.theme} · Question {qNum + 1} / {NUM}</div>
          <Glass pad={28}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", lineHeight: 1.25, margin: "0 0 22px" }}>{q.q}</h2>
            <Scale q={q} me={myPos} teamPositions={dots} interactive={phase === "place"} />
            {phase === "place" ? (
              <>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "14px 0 0" }}>{myPos === null ? "Tap on the scale to position yourself." : "Adjustable, or reveal how your team leans."}</p>
                <button onClick={reveal} disabled={myPos === null} style={{ ...primaryBtn, marginTop: 18, width: "100%", opacity: myPos === null ? 0.45 : 1, cursor: myPos === null ? "not-allowed" : "pointer" }}>Reveal <Icon name="arrowRight" size={18} /></button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 0", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)" }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(60,55,48,0.45)", flexShrink: 0 }} /> your team (anonymous) · <span style={{ width: 14, height: 14, borderRadius: "50%", background: accent, flexShrink: 0 }} /> you
                </div>
                <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 14, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.5 }}>{comment}</div>
                <button onClick={nextQuestion} style={{ ...primaryBtn, marginTop: 18, width: "100%" }}>{qNum < NUM - 1 ? "Next question" : "Wrap up"} <Icon name="arrowRight" size={18} /></button>
              </>
            )}
          </Glass>
        </div>
      )}

      {phase === "takeaway" && (
        <div className="cg-stage" style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <Glass pad={30}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 18px" }}>What do you take away?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CG_TAKEAWAYS.map((t, i) => (
                <button key={i} onClick={() => { setTake(i); setPhase("summary"); }} style={{ textAlign: "left", padding: "15px 18px", borderRadius: 14, cursor: "pointer", background: "rgba(255,255,255,0.62)", border: "1.5px solid var(--border-default)", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)" }}>{t}</button>
              ))}
            </div>
          </Glass>
        </div>
      )}

      {phase === "summary" && (
        <div className="cg-stage" style={{ maxWidth: 640, margin: "auto", width: "100%" }}>
          <Glass pad={30}>
            <div style={{ width: 72, height: 72, marginBottom: 4 }}><HiEmoji name="wow" size={72} /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "6px 0 4px" }}>Your common ground</h2>
            {take !== null && <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", marginBottom: 16 }}>Your takeaway: “{CG_TAKEAWAYS[take]}”</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, margin: "10px 0 22px" }}>
              {history.map((h, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>{h.q.q}</div>
                  <Scale q={h.q} me={h.me} teamPositions={h.dots} interactive={false} />
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55, margin: "0 0 22px" }}>{g.closing}</p>
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
