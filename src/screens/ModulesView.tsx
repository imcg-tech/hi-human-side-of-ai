import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { MODULES } from "../data/modules";
import { gamesFor } from "../data/games";

const openTarget = (id: string, route?: string) => route ?? `/app/module/${id}`;

const GAP = 78;     // top headroom
const STRIP = 74;   // visible header strip per stacked card
const LIFT = 82;    // hover extends the card upward by ~one strip

export default function ModulesView() {
  const navigate = useNavigate();
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "8px 4px 0", overflow: "hidden" }}>
      <div style={{ padding: "0 4px", flexShrink: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: 0, textShadow: "0 2px 30px rgba(255,255,255,0.6)" }}>All modules</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "4px 0 0" }}>Hover over a drawer, it slides up out of the stack.</p>
      </div>

      <div style={{ flex: 1, position: "relative", maxWidth: 700, width: "100%", margin: "0 auto", minHeight: 0 }}>
        {MODULES.map((m, i) => {
          const up = hover === i ? LIFT : 0;
          return (
            <div
              key={m.id}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => navigate(openTarget(m.id, m.route))}
              style={{
                // top + bottom:0 → the card stretches; lifting only moves the TOP up,
                // so the card extends upward (never shows a bottom edge).
                position: "absolute", left: 0, right: 0,
                top: GAP + i * STRIP - up,
                bottom: 0,
                zIndex: i, // stays in its layer, never jumps to front
                background: m.color,
                borderRadius: "26px 26px 0 0",
                boxShadow: hover === i ? "var(--shadow-lg)" : "var(--shadow-md)",
                transition: "top 0.32s var(--ease-out), box-shadow 0.32s var(--ease-out)",
                cursor: "pointer", overflow: "hidden",
              }}
            >
              {/* content is TOP-aligned → keeps a fixed distance from the top edge and moves up with it */}
              <div style={{ padding: "22px 26px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.55)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Icon name={m.icon} size={22} color="var(--ink-fill)" />
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", lineHeight: 1.1 }}>{m.title}</span>
                        {gamesFor(m.id).length > 0 && (
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-primary)", background: "rgba(255,255,255,0.55)", padding: "3px 9px", borderRadius: 999 }}>🎮 {gamesFor(m.id).length} {gamesFor(m.id).length === 1 ? "game" : "games"}</span>
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>{m.desc}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>{m.pct}%</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
                  <div style={{ flex: 1, height: 12, borderRadius: 999, background: "rgba(255,255,255,0.5)", overflow: "hidden" }}>
                    <div style={{ width: `${m.pct}%`, height: "100%", borderRadius: 999, background: "var(--ink-fill)" }} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate(openTarget(m.id, m.route)); }} style={{ height: 42, padding: "0 22px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    Open <Icon name="arrowRight" size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
