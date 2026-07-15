import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import { Glass } from "../components/ds";
import { fetchTeamMembers } from "../lib/sync";
import { supabaseReady } from "../lib/supabase";
import { MOCK_MEMBERS, type MemberProfile } from "../data/teamInsights";
import { CULTURE_DIMS, culturePos, hasCultureData } from "../data/cultureMap";
import { countryByCode } from "../data/countries";

const VALUES = [
  { icon: "shield", t: "Trust over control", d: "We hand over responsibility early." },
  { icon: "message", t: "Speak up openly", d: "Better uncomfortable than unsaid." },
  { icon: "leaf", t: "Work sustainably", d: "Pace yes, constant overload no." },
];

export default function CultureView() {
  const [real, setReal] = useState<MemberProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState<"real" | "demo">("demo");

  useEffect(() => {
    let on = true;
    fetchTeamMembers().then((m) => { if (!on) return; setReal(m); setLoaded(true); setSource(m.filter((x) => x.country).length >= 2 ? "real" : "demo"); });
    return () => { on = false; };
  }, []);

  const members = source === "real" ? real : MOCK_MEMBERS;
  const onMap = members.filter((m) => hasCultureData(m.country ?? null));
  const noData = members.filter((m) => m.country && !hasCultureData(m.country));
  const showDemoBanner = supabaseReady && source === "demo";

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 4px", marginBottom: 6 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 36, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: 0, textShadow: "0 2px 30px rgba(255,255,255,0.6)" }}>Culture Map</h1>
        {supabaseReady && loaded && (
          <div style={{ display: "inline-flex", background: "rgba(28,26,23,0.06)", borderRadius: 999, padding: 3 }}>
            {(["real", "demo"] as const).map((s) => (
              <button key={s} onClick={() => setSource(s)} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 14px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, background: source === s ? "#fff" : "transparent", color: source === s ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: source === s ? "var(--shadow-sm)" : "none" }}>{s === "real" ? `Real (${real.length})` : "Demo"}</button>
            ))}
          </div>
        )}
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 18px", padding: "0 4px", textShadow: "0 1px 16px rgba(255,255,255,0.7)" }}>Where does your team stand culturally? Make tendencies visible, as a conversation opener, not a stereotype.</p>

      {showDemoBanner && (
        <div style={{ margin: "0 4px 18px", padding: "11px 16px", borderRadius: 14, background: "var(--brand-subtle)", border: "1px solid var(--brand-light)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          👀 <strong>Demo preview.</strong> Once real team members share their home country in their profile, "Real" fills in.
        </div>
      )}

      <Glass pad={26}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {CULTURE_DIMS.map((dim) => (
            <div key={dim.key}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--text-primary)", marginBottom: 2 }}>{dim.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginBottom: 6 }}>
                <span>◀ {dim.left}</span><span style={{ textAlign: "right" }}>{dim.right} ▶</span>
              </div>
              <div style={{ position: "relative", height: 46, borderRadius: 14, background: "rgba(28,26,23,0.05)", border: "1px solid var(--border-default)" }}>
                <div style={{ position: "absolute", left: 18, right: 18, top: 0, bottom: 0 }}>
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: "rgba(140,134,125,0.25)", borderRadius: 2 }} />
                  {onMap.map((m, i) => (
                    <span key={m.id} title={`${m.name} · ${countryByCode(m.country!)?.name ?? m.country}`} style={{ position: "absolute", left: `${culturePos(dim, m.country!)}%`, top: "50%", transform: `translate(-50%, calc(-50% + ${(i % 2 === 0 ? -1 : 1) * 9}px))`, fontSize: 20, lineHeight: 1, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))", cursor: "default" }}>{countryByCode(m.country!)?.flag ?? "🌍"}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {noData.length > 0 && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "16px 0 0" }}>No map data: {noData.map((m) => `${countryByCode(m.country!)?.flag ?? ""} ${m.name}`).join(", ")}</p>
        )}
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, margin: "16px 0 0" }}>
          Positions are illustrative tendencies (based on Erin Meyer's "The Culture Map"). They describe cultural patterns, not individual people, use them to make expectations explicit.
        </p>
      </Glass>

      {/* Werte */}
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", margin: "26px 4px 12px" }}>Your values, in practice</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
        {VALUES.map((v) => (
          <Glass key={v.t} hover>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon name={v.icon} size={24} color="var(--brand-dark)" />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--text-primary)", marginBottom: 8 }}>{v.t}</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{v.d}</p>
          </Glass>
        ))}
      </div>
    </div>
  );
}
