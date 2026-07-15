import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { useStore } from "../../lib/store";
import { BOUNDARY_SUGGESTIONS } from "../../data/balance";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-blue)";
const ACCENT_DEEP = "#4E7CB0";

function ymd(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(start: string, n: number) { const d = new Date(start + "T00:00:00"); d.setDate(d.getDate() + n); return ymd(d); }
function daysBetween(a: string, b: string) { return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000); }

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };

export default function BoundaryBuilder({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const boundary = useStore((s) => s.boundary);
  const commit = useStore((s) => s.boundaryCommit);
  const mark = useStore((s) => s.boundaryMark);
  const end = useStore((s) => s.boundaryEnd);

  const [input, setInput] = useState("");
  const [reflecting, setReflecting] = useState(false);

  const today = ymd(new Date());
  const dayIndex = boundary ? daysBetween(boundary.start, today) : 0; // 0-based
  const weekComplete = dayIndex >= 6;
  const todayInWindow = dayIndex >= 0 && dayIndex <= 6;
  const todayMark = boundary ? boundary.log[today] : undefined;

  function start(text: string) { const t = text.trim(); if (!t) return; commit(t); setInput(""); setReflecting(false); }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div style={wrap}>
      {!embedded && (
        <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>
      )}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>

        {/* ── choose ── */}
        {!boundary && (
          <Glass pad={32}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: ACCENT, display: "grid", placeItems: "center", marginBottom: 16 }}><Icon name="shield" size={28} color="#fff" /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "0 0 8px" }}>Boundary Builder</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", margin: "0 0 22px", lineHeight: 1.55 }}>Pick one boundary and hold it for a week. Recovery needs clear lines between work and rest, and a boundary is a skill, not selfishness.</p>

            <div style={sectionLabel}>Choose one</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {BOUNDARY_SUGGESTIONS.map((b) => (
                <button key={b.text} onClick={() => start(b.text)} style={{ textAlign: "left", padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  {b.text}<Icon name="arrowRight" size={16} color="var(--text-muted)" />
                </button>
              ))}
            </div>

            <div style={sectionLabel}>Or set your own</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start(input)} placeholder="Your boundary for the week …" style={{ flex: 1, height: 48, padding: "0 16px", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
              <button onClick={() => start(input)} disabled={!input.trim()} style={{ ...primaryBtn, height: 48, opacity: input.trim() ? 1 : 0.45, cursor: input.trim() ? "pointer" : "not-allowed" }}>Commit</button>
            </div>
          </Glass>
        )}

        {/* ── committed / daily touchpoint ── */}
        {boundary && !reflecting && (
          <>
            <Glass pad={30} style={{ marginBottom: 16 }}>
              <div style={sectionLabel}>Your boundary this week</div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "0 0 18px", lineHeight: 1.25 }}>{boundary.text}</h1>

              {/* week dots */}
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {Array.from({ length: 7 }).map((_, d) => {
                  const key = addDays(boundary.start, d);
                  const v = boundary.log[key];
                  const isToday = key === today;
                  const bg = v === true ? ACCENT_DEEP : v === false ? "rgba(200,120,120,0.5)" : "rgba(28,26,23,0.1)";
                  return <div key={d} title={`Day ${d + 1}`} style={{ flex: 1, height: 10, borderRadius: 999, background: bg, outline: isToday ? `2px solid ${ACCENT_DEEP}` : "none", outlineOffset: 2 }} />;
                })}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>{weekComplete ? "Week complete" : `Day ${Math.min(dayIndex + 1, 7)} of 7`}</div>
            </Glass>

            <Glass pad={28}>
              {todayInWindow ? (
                <>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 4 }}>Did it hold today?</div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>No streak to break. A missed day is just information, not a failure.</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => mark(today, true)} style={{ ...primaryBtn, flex: 1, background: todayMark === true ? ACCENT_DEEP : "var(--ink-fill)" }}>Held today</button>
                    <button onClick={() => mark(today, false)} style={{ ...ghostBtn, flex: 1, borderColor: todayMark === false ? ACCENT_DEEP : "var(--border-strong)" }}>Not today, also ok</button>
                  </div>
                  {todayMark === false && <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "14px 0 0", lineHeight: 1.5 }}>Holding a boundary is practice. Tomorrow's a fresh try.</p>}
                  {todayMark === true && <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "14px 0 0", lineHeight: 1.5 }}>Nice. You gave yourself that space today.</p>}
                </>
              ) : (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: 0, lineHeight: 1.55 }}>Your week is complete. Take a moment to look back on how it felt.</p>
              )}
              <button onClick={() => setReflecting(true)} style={{ ...(weekComplete ? primaryBtn : ghostBtn), width: "100%", marginTop: 18 }}>Reflect on the week <Icon name="arrowRight" size={18} /></button>
            </Glass>
          </>
        )}

        {/* ── reflection ── */}
        {boundary && reflecting && (
          <Glass pad={32}>
            <div style={sectionLabel}>End-of-week reflection</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: "0 0 18px", lineHeight: 1.25 }}>How did it feel?</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {["What changed when you set this boundary?", "What was hard about it?"].map((q) => (
                <div key={q}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", marginBottom: 8, lineHeight: 1.4 }}>{q}</div>
                  <textarea placeholder="Just for you, nothing is saved to anyone else …" style={taArea} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { start(boundary.text); }} style={{ ...primaryBtn, width: "100%" }}>Keep it, another week</button>
              <button onClick={() => { setInput(boundary.text); end(); setReflecting(false); }} style={{ ...ghostBtn, width: "100%" }}>Adjust it</button>
              <button onClick={() => { end(); setReflecting(false); onComplete?.(); }} style={{ ...ghostBtn, width: "100%" }}>Try a new one</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}

const taArea: React.CSSProperties = { width: "100%", minHeight: 64, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
