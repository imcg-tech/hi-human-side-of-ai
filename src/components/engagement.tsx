import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { Pill } from "./ds";
import { useStore } from "../lib/store";
import { MODULES } from "../data/modules";
import { currentTheme, momentumLabel, weeklyActive, wavePath, teamActiveThisWeek } from "../data/engagement";

const todayStr = () => new Date().toISOString().slice(0, 10);

/* ── Säule 1: rotierendes Wochen-Thema, dezenter Banner oben ── */
export function WeeklyThemeBanner() {
  const navigate = useNavigate();
  const theme = currentTheme();
  const accent = MODULES.find((m) => m.id === theme.moduleId)?.color ?? "var(--candy-blue)";
  return (
    <button onClick={() => navigate(theme.route)} style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left", cursor: "pointer", border: "1px solid var(--border-default)", background: "var(--bg-elevated)", borderRadius: 20, padding: "16px 20px", boxShadow: "var(--shadow-sm)" }}>
      <span style={{ width: 46, height: 46, borderRadius: 14, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name="sparkles" size={22} color="var(--ink-fill)" stroke={1.75} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>This week</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)", lineHeight: 1.1 }}>{theme.title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>{theme.line}</div>
      </div>
      <Icon name="arrowRight" size={18} color="var(--text-secondary)" />
    </button>
  );
}

/* ── Säule 2: verzeihendes Momentum (ersetzt die alte „+17,4%“-Einzelmetrik) ── */
export function MomentumCard() {
  const navigate = useNavigate();
  const momentum = useStore((s) => s.momentum);
  const activeDays = useStore((s) => s.activeDays);
  const lastGap = useStore((s) => s.lastGap);
  const momentumDate = useStore((s) => s.momentumDate);

  const justReturned = lastGap >= 2 && momentumDate === todayStr();
  const label = momentumLabel(momentum, justReturned);
  const week = weeklyActive(activeDays);

  return (
    <div style={{ background: "var(--candy-yellow)", borderRadius: 26, padding: 24, minHeight: 300, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Pill style={{ background: "rgba(28,26,23,0.07)", color: "var(--text-primary)", alignSelf: "flex-start" }}>Momentum</Pill>

      <div style={{ margin: "16px 0 4px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", lineHeight: 1.15 }}>{label.title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.45 }}>{label.line}</div>
      </div>

      {/* sanfte Welle, keine Kette */}
      <svg viewBox="0 0 280 56" preserveAspectRatio="none" style={{ width: "100%", height: 52, margin: "6px 0 4px", display: "block" }} aria-hidden="true">
        <path d={wavePath(momentum)} fill="var(--candy-yellow-deep)" opacity="0.4" />
        <path d={wavePath(Math.max(12, momentum - 18), 280, 56)} fill="rgba(255,255,255,0.35)" />
      </svg>

      <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", marginBottom: "auto" }}>
        <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{week} {week === 1 ? "day" : "days"}</strong> this week{week >= 3 ? " · that's plenty" : ""}
      </div>

      <button onClick={() => navigate("/meditation")} style={{ marginTop: 16, height: 46, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.6)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="leaf" size={17} /> Just 1 breath
      </button>
    </div>
  );
}

/* ── Säule 4: anonymes Team-Signal, sanfter Mitmach-Sog ohne Namen ── */
export function TeamSignal() {
  const { active, total } = teamActiveThisWeek();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 14px", borderRadius: 999, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>
      <Icon name="users" size={16} color="var(--text-secondary)" stroke={1.75} />
      <span><strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{active} of {total}</strong> people on your team were active this week</span>
    </div>
  );
}

/* ── Manager-Impuls (Mix A+B): nur für Manager sichtbar, nie Einzeldaten ── */
export function ManagerNudge() {
  const navigate = useNavigate();
  const isManager = useStore((s) => s.isManager);
  if (!isManager) return null;
  return (
    <div style={{ border: "1px solid var(--border-default)", background: "var(--bg-elevated)", borderRadius: 20, padding: "16px 20px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon name="compass" size={16} color="var(--text-muted)" stroke={1.75} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>Just for you as a lead</span>
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", margin: "0 0 6px", lineHeight: 1.5 }}>Your team hasn't had a shared session in a while. Want to start one?</p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>Teams follow their leads. If you're the first to join, others are more likely to follow. You only see anonymous team signals, never individuals.</p>
      <button onClick={() => navigate("/app/modules")} style={{ height: 42, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
        Suggest a session <Icon name="arrowRight" size={16} />
      </button>
    </div>
  );
}
