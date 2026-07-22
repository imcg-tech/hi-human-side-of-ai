import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import { Glass } from "../../components/ds";
import { HiEmoji } from "../../components/MoodFace";
import { MODULES } from "../../data/modules";
import type { Game } from "../../data/games";
import { SN_FIGURES } from "../../data/signalNoise";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";

export default function SignalNoiseGame({ game: g }: { game: Game }) {
  const navigate = useNavigate();
  const accent = MODULES.find((m) => m.id === g.category)?.color ?? "var(--brand)";

  const [phase, setPhase] = useState<"intro" | "draw" | "reveal" | "end">("intro");
  const [round, setRound] = useState(0);
  const fig = SN_FIGURES[round];
  const withHint = round >= 1; // Round 2: "with feedback", original visible as a help

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function ctx() {
    const c = canvasRef.current!;
    const x = c.getContext("2d")!;
    x.lineWidth = 4; x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "#2A2722";
    return x;
  }
  function clear() { const c = canvasRef.current; if (c) c.getContext("2d")!.clearRect(0, 0, c.width, c.height); }
  useEffect(() => { if (phase === "draw") clear(); }, [round, phase]);

  function point(e: React.PointerEvent) {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  }
  const down = (e: React.PointerEvent) => { drawing.current = true; const x = ctx(); const p = point(e); x.beginPath(); x.moveTo(p.x, p.y); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const x = ctx(); const p = point(e); x.lineTo(p.x, p.y); x.stroke(); };
  const up = () => { drawing.current = false; };

  function nextRound() {
    if (round < SN_FIGURES.length - 1) { setRound(round + 1); setPhase("draw"); }
    else setPhase("end");
  }
  function restart() { setRound(0); setPhase("intro"); }

  const Original = ({ small }: { small?: boolean }) => (
    <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.7)", border: "1px solid var(--border-default)", padding: 10 }} dangerouslySetInnerHTML={{ __html: fig.svg }} aria-label="Original" />
  );

  const CanvasBox = () => (
    <div style={{ position: "relative", borderRadius: 14, background: "rgba(255,255,255,0.9)", border: "1px solid var(--border-default)", overflow: "hidden", aspectRatio: "3 / 2" }}>
      <canvas key="cv" ref={canvasRef} width={600} height={400} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} style={{ width: "100%", height: "100%", touchAction: "none", cursor: "crosshair", display: "block" }} />
    </div>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate(`/app/module/${g.category}`)} style={backBtn}>
        <Icon name="arrowLeft" size={16} /> {MODULES.find((m) => m.id === g.category)?.title ?? "Module"}
      </button>

      {phase === "intro" && (
        <div style={{ maxWidth: 600, margin: "auto", width: "100%" }}>
          <Glass pad={36}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: accent, display: "grid", placeItems: "center", fontSize: 32 }}>{g.emoji}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--text-primary)", margin: "16px 0 2px" }}>{g.title}</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>{g.skill}</div>
            <GameBrief g={g} accent={accent} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 26px" }}>{g.intro}</p>
            <button onClick={() => setPhase("draw")} style={primaryBtn}>Let's go <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {(phase === "draw" || phase === "reveal") && (
        <div style={{ maxWidth: 760, margin: "auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{g.emoji} Round {round + 1} / {SN_FIGURES.length}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{withHint ? "🔓 with hint (feedback allowed)" : "🔒 words only"}</span>
          </div>

          <Glass pad={22} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Description</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16.5, color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>{fig.desc}</p>
          </Glass>

          {phase === "draw" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: withHint ? "repeat(auto-fit, minmax(240px, 1fr))" : "1fr", gap: 14 }}>
                {withHint && (
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>Original (hint)</div>
                    <Original />
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>Your drawing</div>
                  <CanvasBox />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <button onClick={() => setPhase("reveal")} style={primaryBtn}>Done, compare <Icon name="arrowRight" size={18} /></button>
                <button onClick={clear} style={ghostBtn}>Clear</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>Original</div>
                  <Original />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>Your drawing</div>
                  <CanvasBox />
                </div>
              </div>
              <button onClick={nextRound} style={{ ...primaryBtn, marginTop: 16, width: "100%" }}>{round < SN_FIGURES.length - 1 ? "Next round (with hint)" : "Wrap up"} <Icon name="arrowRight" size={18} /></button>
            </>
          )}
        </div>
      )}

      {phase === "end" && (
        <div style={{ maxWidth: 560, margin: "auto", width: "100%" }}>
          <Glass pad={34}>
            <div style={{ width: 76, height: 76, marginBottom: 4 }}><HiEmoji name="win" size={76} /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "8px 0 4px" }}>Signal sent!</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "12px 0 26px" }}>{g.closing}</p>
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
