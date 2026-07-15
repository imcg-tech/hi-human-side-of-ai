import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass, Badge } from "../components/ds";
import Icon from "../components/Icon";
import { DISC_INFO } from "../data/disc";
import DiscModel from "../components/DiscModel";
import { useStore } from "../lib/store";
import { fetchTeamMembers } from "../lib/sync";
import { supabaseReady } from "../lib/supabase";
import {
  DIMS, MOCK_MEMBERS, buildTeamInsights, discColor,
  type Dim, type MemberProfile,
} from "../data/teamInsights";

const ANG: Record<Dim, number> = { D: -90, I: 0, S: 90, C: 180 };
function pt(cx: number, cy: number, maxR: number, d: Dim, value: number): [number, number] {
  const r = (maxR * value) / 100;
  const a = (ANG[d] * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
const poly = (cx: number, cy: number, maxR: number, vals: Record<Dim, number>) =>
  DIMS.map((d) => pt(cx, cy, maxR, d, vals[d]).join(",")).join(" ");

function Radar({ profile, blind = [], stroke = "var(--brand)" }: { profile: Record<Dim, number>; blind?: Dim[]; stroke?: string }) {
  const S = 248, cx = S / 2, cy = S / 2, maxR = 86;
  const labelPos: Record<Dim, number> = { D: 102, I: 108, S: 116, C: 108 };
  return (
    <svg width="100%" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="DISC radar">
      {[33, 66, 100].map((f) => (
        <polygon key={f} points={poly(cx, cy, maxR, { D: f, I: f, S: f, C: f })} fill="none" stroke="rgba(140,134,125,0.22)" strokeWidth={1} />
      ))}
      {DIMS.map((d) => { const [x, y] = pt(cx, cy, maxR, d, 100); return <line key={d} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(140,134,125,0.22)" strokeWidth={1} />; })}
      <polygon points={poly(cx, cy, maxR, profile)} fill="rgba(95,123,255,0.18)" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      {DIMS.map((d) => { const [x, y] = pt(cx, cy, maxR, d, profile[d]); return <circle key={d} cx={x} cy={y} r={4} fill={discColor(d)} stroke="#fff" strokeWidth={1.5} />; })}
      {DIMS.map((d) => {
        const [x, y] = pt(cx, cy, labelPos[d], d, 100);
        const isBlind = blind.includes(d);
        return (
          <text key={d} x={x} y={y + 4} textAnchor="middle" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, fill: isBlind ? "var(--text-muted)" : discColor(d), opacity: isBlind ? 0.55 : 1 }}>
            {d}{isBlind ? " ·" : ""}
          </text>
        );
      })}
    </svg>
  );
}

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };

function InfoRow({ icon, title, text }: { icon: string; title: string; text: string }) {
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

export default function TeamView() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [real, setReal] = useState<MemberProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState<"real" | "demo">("demo");

  useEffect(() => {
    let on = true;
    fetchTeamMembers().then((m) => { if (!on) return; setReal(m); setLoaded(true); setSource(m.length >= 3 ? "real" : "demo"); });
    return () => { on = false; };
  }, []);

  const members = source === "real" ? real : MOCK_MEMBERS;
  const insights = buildTeamInsights(members);
  const showDemoBanner = supabaseReady && source === "demo";

  const p = profile ? DISC_INFO[profile.primary] : null;
  const sec = profile ? DISC_INFO[profile.secondary] : null;
  // dimensions strongest first, for the personal mix
  const orderedDims = profile ? [...DIMS].sort((a, b) => profile.percent[b] - profile.percent[a]) : DIMS;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, padding: "0 4px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 36, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: 0, textShadow: "0 2px 30px rgba(255,255,255,0.6)" }}>You & your team</h1>
        {supabaseReady && loaded && (
          <div style={{ display: "inline-flex", background: "rgba(28,26,23,0.06)", borderRadius: 999, padding: 3 }}>
            {(["real", "demo"] as const).map((s) => (
              <button key={s} onClick={() => setSource(s)} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 14px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, background: source === s ? "#fff" : "transparent", color: source === s ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: source === s ? "var(--shadow-sm)" : "none" }}>{s === "real" ? `Real (${real.length})` : "Demo"}</button>
            ))}
          </div>
        )}
      </div>

      {/* ═════════ YOUR DISC PROFILE (private, rich) ═════════ */}
      {profile && p ? (
        <Glass pad={28} style={{ marginBottom: 18 }}>
          <div style={{ ...sectionLabel, marginBottom: 14 }}>Your DISC profile · 🔒 private to you</div>

          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <span style={{ width: 76, height: 76, borderRadius: 20, background: p.color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 40, flexShrink: 0 }}>{profile.primary}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", lineHeight: 1.1 }}>{p.persona} {p.emoji}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", marginTop: 3 }}>{p.label} · {p.core}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Profile code {profile.profileCode}</div>
            </div>
          </div>

          <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "18px 0 0" }}>{p.desc}</p>
          {profile.isBalanced ? (
            <div style={{ marginTop: 12, padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>⚖️ <strong>Balanced profile.</strong> Your four styles sit close together, you flex well across different situations.</div>
          ) : (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "8px 0 0" }}>…with a good dose of <strong style={{ color: sec!.color }}>{sec!.persona}</strong>.</p>
          )}

          {/* radar + mix */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20, alignItems: "center", margin: "22px 0 6px" }}>
            <div style={{ maxWidth: 280, margin: "0 auto", width: "100%" }}>
              <Radar profile={profile.percent} stroke={p.color} />
            </div>
            <div>
              <div style={{ ...sectionLabel, marginBottom: 12 }}>Your mix</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orderedDims.map((d) => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: discColor(d), color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{d}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{DISC_INFO[d].label}</span>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-secondary)" }}>{profile.percent[d]}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 999, background: "rgba(28,26,23,0.07)", overflow: "hidden" }}>
                        <div style={{ width: `${profile.percent[d]}%`, height: "100%", background: discColor(d), borderRadius: 999 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* strengths + watch-outs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginTop: 20 }}>
            <div>
              <div style={sectionLabel}>Your strengths</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {p.strengths.map((s) => (
                  <span key={s} style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-body)", background: "rgba(0,214,143,0.12)", padding: "6px 12px", borderRadius: 999 }}>✓ {s}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={sectionLabel}>Watch-outs</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.watchOuts.map((w) => (
                  <div key={w} style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.4 }}><span style={{ color: "var(--candy-yellow-deep)" }}>•</span> {w}</div>
                ))}
              </div>
            </div>
          </div>

          {/* deeper info rows */}
          <div style={{ marginTop: 20 }}>
            <div style={sectionLabel}>How this shows up</div>
            <InfoRow icon="message" title="How you communicate" text={p.communication} />
            <InfoRow icon="target" title="Under pressure" text={p.underPressure} />
            <InfoRow icon="sparkles" title="What energizes you" text={p.energizedBy} />
            <InfoRow icon="users" title="Working with you" text={p.bestWith} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <button onClick={() => navigate("/app/assessment")} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 42, padding: "0 18px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.6)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14 }}>
              <Icon name="repeat" size={15} /> Retake the test
            </button>
          </div>
        </Glass>
      ) : (
        <Glass pad={30} style={{ marginBottom: 18, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🧭</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "8px 0 6px" }}>Discover your profile</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 auto 20px", lineHeight: 1.55, maxWidth: 420 }}>Take the short DISC self-assessment (about 2 min) to unlock a detailed, private view of your style, strengths and how you work best.</p>
          <button onClick={() => navigate("/app/assessment")} style={{ height: 48, padding: "0 24px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>Start assessment <Icon name="arrowRight" size={18} /></button>
        </Glass>
      )}

      {showDemoBanner && (
        <div style={{ margin: "0 4px 18px", padding: "11px 16px", borderRadius: 14, background: "var(--brand-subtle)", border: "1px solid var(--brand-light)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          👀 <strong>Demo preview.</strong> Once at least 3 real team members have shared their profile, "Real" fills in automatically.
        </div>
      )}

      {/* ═════════ YOUR TEAM, ANONYMOUS AGGREGATE ═════════ */}
      {insights ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          <Glass pad={24}>
            <div style={sectionLabel}>Team mix · anonymous</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6 }}>{insights.headline}</div>
            <Badge tone="brand">{insights.diversityLabel}</Badge>
            <div style={{ maxWidth: 300, margin: "8px auto 0" }}>
              <Radar profile={insights.teamProfile} blind={insights.blindSpots} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
              {DIMS.map((d) => {
                const pct = Math.round((insights.distribution[d] / insights.teamSize) * 100);
                return (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: discColor(d), color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{d}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(28,26,23,0.07)", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: discColor(d), borderRadius: 999 }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", minWidth: 34, textAlign: "right" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, margin: "14px 0 0" }}>
              🔒 Only the anonymous team mix, shares across the whole team. Who is which type stays private, that's for each person to share themselves.
            </p>
          </Glass>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ ...sectionLabel, padding: "0 4px" }}>Conversation starters for the team 👀</div>
            {insights.cards.map((c, i) => (
              <Glass key={i} pad={20}>
                <div style={{ display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 26, lineHeight: 1.1 }}>{c.emoji}</span>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55, margin: 0 }}>{c.text}</p>
                </div>
              </Glass>
            ))}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, padding: "0 4px", margin: 0 }}>
              These team insights are based on the DISC model and serve as a playful conversation starter. They do <strong>not</strong> predict who is "a good match" or more productive. Use them as an invitation to talk, not as a verdict.
            </p>
          </div>
        </div>
      ) : (
        <Glass pad={28}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>Not enough results yet for the team mix</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: 1.55 }}>Once at least 3 people have shared their profile, the anonymous team mix appears here.</p>
        </Glass>
      )}

      {/* ═════════ LEARN THE DISC MODEL (educational) ═════════ */}
      <Glass pad={28} style={{ marginTop: 18 }}>
        <div style={{ ...sectionLabel, marginBottom: 14 }}>The DISC model · explore each style</div>
        <DiscModel initial={profile?.primary ?? "D"} />
      </Glass>
    </div>
  );
}
