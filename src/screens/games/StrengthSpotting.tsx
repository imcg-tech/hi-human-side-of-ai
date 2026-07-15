import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { useStore } from "../../lib/store";
import { STRENGTHS_VOCAB, STRENGTH_RECEIVED_DEMO } from "../../data/balance";
import { MOCK_MEMBERS } from "../../data/teamInsights";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "var(--candy-lilac)";
const ACCENT_DEEP = "#6C5CE0";

const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };
const inputStyle: React.CSSProperties = { width: "100%", height: 46, padding: "0 14px", boxSizing: "border-box", borderRadius: 12, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none" };

function chip(active: boolean): React.CSSProperties {
  return { padding: "8px 14px", borderRadius: 999, cursor: "pointer", border: active ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: active ? "rgba(108,92,224,0.12)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" };
}

export default function StrengthSpotting({ onComplete, embedded = false }: { onComplete?: () => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const strengths = useStore((s) => s.strengths);
  const addStrength = useStore((s) => s.addStrength);

  const [view, setView] = useState<"self" | "peer">("self");
  const [adding, setAdding] = useState(false);
  const [selfPick, setSelfPick] = useState("");
  const [selfOwn, setSelfOwn] = useState("");
  const [selfMoment, setSelfMoment] = useState("");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peerPick, setPeerPick] = useState("");
  const [peerOwn, setPeerOwn] = useState("");
  const [peerExample, setPeerExample] = useState("");
  const [peerSent, setPeerSent] = useState<string | null>(null);

  const own = strengths.filter((s) => s.source === "self");
  const received = [
    ...strengths.filter((s) => s.source === "received").map((s) => ({ text: s.text, example: s.moment ?? "" })),
    ...STRENGTH_RECEIVED_DEMO,
  ];

  const selfText = (selfOwn.trim() || selfPick).trim();
  function saveSelf() {
    if (!selfText) return;
    addStrength(selfText, selfMoment, "self");
    setSelfPick(""); setSelfOwn(""); setSelfMoment(""); setAdding(false);
    onComplete?.();
  }

  const peerText = (peerOwn.trim() || peerPick).trim();
  const peerMember = MOCK_MEMBERS.find((m) => m.id === peerId) ?? null;
  function sendPeer() {
    if (!peerMember || !peerText) return;
    setPeerSent(peerMember.name.split(" ")[0]);
    setPeerId(null); setPeerPick(""); setPeerOwn(""); setPeerExample("");
    onComplete?.();
  }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div style={wrap}>
      {!embedded && <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>}

      <div style={{ maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, background: ACCENT, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="sparkles" size={22} color="#fff" /></span>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>Strength Spotting</h1>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>See your strengths, and reflect them back to others.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "rgba(28,26,23,0.05)", padding: 5, borderRadius: 999 }}>
          {([["self", "Your strengths"], ["peer", "Spot a colleague"]] as const).map(([k, lbl]) => (
            <button key={k} onClick={() => setView(k)} style={{ flex: 1, height: 38, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, background: view === k ? "#fff" : "transparent", color: view === k ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: view === k ? "var(--shadow-sm)" : "none" }}>{lbl}</button>
          ))}
        </div>

        {/* ── SELF ── */}
        {view === "self" && (
          <>
            {adding ? (
              <Glass pad={28}>
                <div style={label}>Where were you recently really good?</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {STRENGTHS_VOCAB.map((s) => <button key={s} onClick={() => { setSelfPick(s); setSelfOwn(""); }} style={chip(selfText === s)}>{s}</button>)}
                </div>
                <input value={selfOwn} onChange={(e) => { setSelfOwn(e.target.value); setSelfPick(""); }} placeholder="… or name your own" style={{ ...inputStyle, marginBottom: 12 }} />
                <div style={label}>When did it show?</div>
                <input value={selfMoment} onChange={(e) => setSelfMoment(e.target.value)} placeholder="A concrete recent moment (optional)" style={inputStyle} />
                <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                  <button onClick={() => setAdding(false)} style={ghostBtn}>Cancel</button>
                  <button onClick={saveSelf} disabled={!selfText} style={{ ...primaryBtn, flex: 1, opacity: selfText ? 1 : 0.45, cursor: selfText ? "pointer" : "not-allowed" }}>Add to collection <Icon name="check" size={17} /></button>
                </div>
              </Glass>
            ) : (
              <button onClick={() => setAdding(true)} style={{ ...primaryBtn, width: "100%", marginBottom: 18 }}>Spot one of your strengths <Icon name="arrowRight" size={18} /></button>
            )}

            <div style={{ ...label, marginTop: adding ? 20 : 0 }}>Your strengths collection</div>
            {own.length === 0 && received.length === 0 ? (
              <Glass pad={24}><p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>Nothing here yet. Spot one strength above, it stays private and grows over time.</p></Glass>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {own.map((s) => (
                  <Glass key={s.id} pad={18}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{s.text}</div>
                    {s.moment && <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginTop: 3 }}>{s.moment}</div>}
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", marginTop: 6 }}>you noticed</div>
                  </Glass>
                ))}
                {received.map((s, i) => (
                  <Glass key={"r" + i} pad={18} style={{ borderLeft: `4px solid ${ACCENT_DEEP}` }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{s.text}</div>
                    {s.example && <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginTop: 3, fontStyle: "italic" }}>“{s.example}”</div>}
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: ACCENT_DEEP, marginTop: 6 }}>someone on the team noticed</div>
                  </Glass>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PEER ── */}
        {view === "peer" && (
          peerSent ? (
            <Glass pad={32} style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icon name="check" size={26} color="#fff" /></div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 8px" }}>Sent to {peerSent}, anonymously</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.55 }}>They'll see it as “someone on the team noticed …”. A specific strength, genuinely observed, is a rare gift.</p>
              <button onClick={() => setPeerSent(null)} style={primaryBtn}>Spot another</button>
            </Glass>
          ) : (
            <Glass pad={28}>
              <div style={label}>Who did you notice?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {MOCK_MEMBERS.map((m) => <button key={m.id} onClick={() => setPeerId(m.id)} style={chip(peerId === m.id)}>{m.name.split(" ")[0]}</button>)}
              </div>
              <div style={label}>What strength did you genuinely see?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {STRENGTHS_VOCAB.map((s) => <button key={s} onClick={() => { setPeerPick(s); setPeerOwn(""); }} style={chip(peerText === s)}>{s}</button>)}
              </div>
              <input value={peerOwn} onChange={(e) => { setPeerOwn(e.target.value); setPeerPick(""); }} placeholder="… or name your own" style={{ ...inputStyle, marginBottom: 12 }} />
              <div style={label}>A one-line example</div>
              <input value={peerExample} onChange={(e) => setPeerExample(e.target.value)} placeholder="When you saw it (helps it land)" style={inputStyle} />
              <button onClick={sendPeer} disabled={!peerMember || !peerText} style={{ ...primaryBtn, width: "100%", marginTop: 18, opacity: peerMember && peerText ? 1 : 0.45, cursor: peerMember && peerText ? "pointer" : "not-allowed" }}>Send anonymously <Icon name="arrowRight" size={18} /></button>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "12px 0 0", lineHeight: 1.5 }}>Only positive, no ranking, no comparison. Just a strength worth reflecting back.</p>
            </Glass>
          )
        )}
      </div>
    </div>
  );
}
