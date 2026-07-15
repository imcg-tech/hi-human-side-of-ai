import { useState } from "react";
import Icon from "./Icon";
import { DISC_INFO } from "../data/disc";
import type { DiscType } from "../lib/store";

/* Educational, reusable DISC explainer: describes the model, then a clickable panel
   per type with the full write-up. Describes styles, never people, so it's safe to
   show anywhere, no one's private result is involved. */

const ORDER: DiscType[] = ["D", "I", "S", "C"];

// what each dimension is fundamentally about (the classic DISC framing)
const AXIS: Record<DiscType, string> = {
  D: "How you take on challenges and drive results.",
  I: "How you connect with and influence people.",
  S: "How you handle pace, change and cooperation.",
  C: "How you approach rules, detail and quality.",
};

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };

function Row({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 0", borderTop: "1px solid var(--border-default)" }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--brand-subtle)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={icon} size={16} color="var(--brand-dark)" /></span>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 1 }}>{text}</div>
      </div>
    </div>
  );
}

export default function DiscModel({ initial = "D" }: { initial?: DiscType }) {
  const [sel, setSel] = useState<DiscType>(initial);
  const p = DISC_INFO[sel];

  return (
    <div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 6px" }}>
        DISC is a simple model of four behavioural styles. Almost everyone is a blend of all four, with one or two that lead. It describes <strong>how</strong> you tend to work, not how good you are, and there are no better or worse types.
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 16px" }}>
        🔒 This is just the model. Your own result, and anyone else's, stays private. Tap a style to explore it.
      </p>

      {/* clickable style selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))", gap: 10, marginBottom: 18 }}>
        {ORDER.map((d) => {
          const info = DISC_INFO[d];
          const on = sel === d;
          return (
            <button key={d} onClick={() => setSel(d)} aria-pressed={on} style={{
              textAlign: "left", padding: "13px 14px", borderRadius: 16, cursor: "pointer",
              border: on ? `2px solid ${info.color}` : "1.5px solid var(--border-default)",
              background: on ? `color-mix(in srgb, ${info.color} 12%, transparent)` : "rgba(255,255,255,0.55)",
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: info.color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{d}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.1 }}>{info.persona} {info.emoji}</span>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>{info.label}</div>
            </button>
          );
        })}
      </div>

      {/* detail panel for the selected style */}
      <div key={sel} style={{ padding: "20px 20px 6px", borderRadius: 18, background: "rgba(255,255,255,0.55)", border: `1px solid color-mix(in srgb, ${p.color} 35%, var(--border-default))` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <span style={{ width: 52, height: 52, borderRadius: 15, background: p.color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, flexShrink: 0 }}>{sel}</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", lineHeight: 1.1 }}>{p.persona} {p.emoji}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>{p.label} · {p.core}</div>
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>{AXIS[sel]}</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 16px" }}>{p.desc}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div>
            <div style={sectionLabel}>Strengths</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {p.strengths.map((s) => <span key={s} style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-body)", background: "rgba(0,214,143,0.12)", padding: "6px 12px", borderRadius: 999 }}>✓ {s}</span>)}
            </div>
          </div>
          <div>
            <div style={sectionLabel}>Watch-outs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {p.watchOuts.map((w) => <div key={w} style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.4 }}><span style={{ color: "var(--candy-yellow-deep)" }}>•</span> {w}</div>)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Row icon="message" title="How they communicate" text={p.communication} />
          <Row icon="target" title="Under pressure" text={p.underPressure} />
          <Row icon="sparkles" title="What energizes them" text={p.energizedBy} />
          <Row icon="users" title="Working with them" text={p.bestWith} />
        </div>
      </div>
    </div>
  );
}
