import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { useStore } from "../../lib/store";
import { RECOVERY_CHIPS, RECOVERY_DEMO } from "../../data/balance";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-blue)";
const ACCENT_DEEP = "#4E7CB0";

type View = "share" | "feed" | "log";

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };

export default function RecoveryWins({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const recovery = useStore((s) => s.recovery);
  const addRecovery = useStore((s) => s.addRecovery);

  const [view, setView] = useState<View>("share");
  const [text, setText] = useState("");
  const [toTeam, setToTeam] = useState(false);
  const [anon, setAnon] = useState(true);
  const [reactions, setReactions] = useState<Record<string, "heart" | "clap">>({});

  function submit() {
    const t = text.trim(); if (!t) return;
    addRecovery(t, toTeam);
    setText("");
    onComplete?.();
    setView(toTeam ? "feed" : "log");
  }

  // Feed = demo team moments + your own shared ones (shown as "You" in your view).
  const feed = [
    ...recovery.filter((r) => r.shared).map((r) => ({ id: r.id, who: "You", text: r.text })),
    ...RECOVERY_DEMO.map((d, i) => ({ id: "demo-" + i, who: d.who, text: d.text })),
  ];

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  const react = (id: string, kind: "heart" | "clap") => setReactions((r) => ({ ...r, [id]: r[id] === kind ? undefined as never : kind }));

  return (
    <div style={wrap}>
      {!embedded && (
        <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>
      )}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, background: ACCENT, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="leaf" size={22} color="#fff" /></span>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>Recovery Wins</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Rest is a strength, not a guilty secret.</div>
          </div>
        </div>

        {/* view switch */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "rgba(28,26,23,0.05)", padding: 5, borderRadius: 999 }}>
          {([["share", "Share"], ["feed", "Team feed"], ["log", "My log"]] as const).map(([k, lbl]) => (
            <button key={k} onClick={() => setView(k)} style={{ flex: 1, height: 38, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, background: view === k ? "#fff" : "transparent", color: view === k ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: view === k ? "var(--shadow-sm)" : "none" }}>{lbl}</button>
          ))}
        </div>

        {/* ── share ── */}
        {view === "share" && (
          <Glass pad={30}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", marginBottom: 14 }}>What did you good today?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {RECOVERY_CHIPS.map((c) => (
                <button key={c} onClick={() => setText(c)} style={{ padding: "8px 14px", borderRadius: 999, cursor: "pointer", border: text === c ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: text === c ? "rgba(120,150,190,0.12)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>{c}</button>
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="… or put it in your own words" style={taArea} />

            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: "rgba(28,26,23,0.04)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)" }}>
                <input type="checkbox" checked={toTeam} onChange={(e) => setToTeam(e.target.checked)} style={{ width: 18, height: 18, accentColor: ACCENT_DEEP }} />
                Share with the team feed
              </label>
              {toTeam && (
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 10, paddingLeft: 28 }}>
                  <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} style={{ width: 16, height: 16, accentColor: ACCENT_DEEP }} />
                  Post anonymously (shows as “Someone on the team”)
                </label>
              )}
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>Private by default. Nothing is shared unless you choose to. No comments, no comparison, ever.</p>
            </div>

            <button onClick={submit} disabled={!text.trim()} style={{ ...primaryBtn, width: "100%", marginTop: 18, opacity: text.trim() ? 1 : 0.45, cursor: text.trim() ? "pointer" : "not-allowed" }}>{toTeam ? "Share" : "Log privately"} <Icon name="check" size={18} /></button>
          </Glass>
        )}

        {/* ── team feed ── */}
        {view === "feed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "0 4px 4px", lineHeight: 1.5 }}>Small moments of rest from the team. A quiet cheer for recharging, never a contest.</p>
            {feed.map((e) => {
              const r = reactions[e.id];
              return (
                <Glass key={e.id} pad={20}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: e.who === "You" ? ACCENT_DEEP : "var(--text-primary)", marginBottom: 3 }}>{e.who}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.4 }}>{e.text}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => react(e.id, "heart")} aria-label="Appreciate" style={reactBtn(r === "heart")}>♥</button>
                      <button onClick={() => react(e.id, "clap")} aria-label="Cheer" style={reactBtn(r === "clap")}>👏</button>
                    </div>
                  </div>
                </Glass>
              );
            })}
          </div>
        )}

        {/* ── private log ── */}
        {view === "log" && (
          <Glass pad={28}>
            <div style={sectionLabel}>Your recovery moments</div>
            {recovery.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>Nothing logged yet. Head to Share and note one small thing that did you good.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recovery.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT_DEEP, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)" }}>{r.text}</div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{r.shared ? "shared" : "private"}</span>
                  </div>
                ))}
              </div>
            )}
          </Glass>
        )}
      </div>
    </div>
  );
}

function reactBtn(active: boolean): React.CSSProperties {
  return { width: 38, height: 34, borderRadius: 10, cursor: "pointer", border: active ? `1.5px solid ${ACCENT_DEEP}` : "1px solid var(--border-default)", background: active ? "rgba(120,150,190,0.14)" : "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1, color: active ? ACCENT_DEEP : "var(--text-secondary)" };
}

const taArea: React.CSSProperties = { width: "100%", minHeight: 70, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
