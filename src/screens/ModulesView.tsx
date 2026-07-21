import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { MODULES } from "../data/modules";
import { gamesFor } from "../data/games";
import { useStore } from "../lib/store";
import { moduleFreshness } from "../lib/freshness";

const openTarget = (id: string, route?: string) => route ?? `/app/module/${id}`;

/* 3.3: plain scrollable list of module cards. The old drawer stack needed hover
   (broken on touch) and hid most of each card; this shows everything, works on
   mobile, and keeps a light lift on hover as a nod to the old metaphor. */
export default function ModulesView() {
  const navigate = useNavigate();
  const playLog = useStore((s) => s.playLog);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px" }}>
      <div style={{ padding: "0 4px", marginBottom: 18 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: 0, textShadow: "0 2px 30px rgba(255,255,255,0.6)" }}>All modules</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "4px 0 0" }}>Short, playful practice areas. Pick one.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 700, margin: "0 auto" }}>
        {MODULES.map((m) => {
          const count = gamesFor(m.id).length;
          // 2.5: skills aren't "done", so show recency instead of a percent
          const f = moduleFreshness(playLog, m.id);
          return (
            <div
              key={m.id}
              onClick={() => navigate(openTarget(m.id, m.route))}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              style={{ background: m.color, borderRadius: 24, padding: "20px 22px", cursor: "pointer", boxShadow: "var(--shadow-md)", transition: "transform 0.22s var(--ease-out), box-shadow 0.22s var(--ease-out)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.55)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name={m.icon} size={22} color="var(--ink-fill)" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", lineHeight: 1.1 }}>{m.title}</span>
                    {count > 0 && (
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-primary)", background: "rgba(255,255,255,0.55)", padding: "3px 9px", borderRadius: 999 }}>{count} {count === 1 ? "game" : "games"}</span>
                    )}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>{m.desc}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", background: "rgba(255,255,255,0.5)", padding: "3px 10px", borderRadius: 999, marginTop: 7 }}>
                    {f.fresh && <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--ink-fill)", flexShrink: 0 }} />}
                    {f.line}
                  </div>
                </div>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--ink-fill)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name="arrowRight" size={18} color="var(--text-on-ink)" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
