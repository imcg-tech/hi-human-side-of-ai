import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../components/ds";
import Icon from "../components/Icon";
import { useStore } from "../lib/store";

const ACCENT = "var(--brand)";
const ACCENT_SUBTLE = "var(--brand-subtle)";

const PRINCIPLES = [
  { t: "Private by default", d: "Everything you enter starts visible only to you." },
  { t: "No individual data for managers", d: "Your manager never sees a single personal entry." },
  { t: "Anonymous from 4 people up", d: "Team insights only appear once at least four people contribute." },
  { t: "Voluntary & revocable", d: "You choose what to share, and can take it back anytime." },
  { t: "No link to performance or pay", d: "None of this ever feeds into reviews, ratings or salary." },
];

const MATRIX: { label: string; you: string; manager: string; company: string }[] = [
  { label: "Your mood", you: "✓", manager: "–", company: "–" },
  { label: "Personal notes", you: "✓", manager: "–", company: "–" },
  { label: "Team trend (anonymous)", you: "✓", manager: "anonymous", company: "anonymous" },
];

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };

export default function TrustView() {
  const navigate = useNavigate();
  const reset = useStore((s) => s.reset);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [exported, setExported] = useState(false);

  function exportData() {
    // The user's own data, gathered from local app state, offered as a plain JSON download.
    const s = useStore.getState();
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: s.profile,
      mood: { current: s.mood, history: s.moodHistory },
      gratitude: s.gratitude,
      pulseAnswers: s.deckAnswers,
      oneOnOnes: s.oneOnOnes,
      onboarding: { name: s.displayName, department: s.department, country: s.country },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `hi-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    setExported(true); setTimeout(() => setExported(false), 2600);
  }

  function deleteData() {
    reset();
    setConfirmDelete(false); setDeleted(true);
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px" }}>
      <button onClick={() => navigate(-1)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 18 }}>
        <Icon name="arrowLeft" size={16} /> Back
      </button>

      <div style={{ maxWidth: 640, margin: "auto", width: "100%" }}>
        {/* ── Promise ── */}
        <Glass pad={32} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: ACCENT_SUBTLE, display: "grid", placeItems: "center" }}><Icon name="lock" size={24} color="var(--brand-dark)" /></span>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>Your Data & Privacy</div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 27, color: "var(--text-primary)", margin: "2px 0 0", lineHeight: 1.1 }}>Built on trust</h1>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--text-primary)", lineHeight: 1.4, margin: 0 }}>
            What you enter here belongs to you. No manager, no company sees your personal data.
          </p>
        </Glass>

        {/* ── Visibility matrix ── */}
        <Glass pad={26} style={{ marginBottom: 18 }}>
          <div style={sectionLabel}>Who sees what</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr 0.9fr 0.9fr", gap: 0, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border-default)" }}>
            {["", "Only you", "Manager", "Company"].map((h, i) => (
              <div key={i} style={{ padding: "11px 12px", background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textAlign: i === 0 ? "left" : "center" }}>{h}</div>
            ))}
            {MATRIX.map((r, ri) => (
              [r.label, r.you, r.manager, r.company].map((cell, ci) => (
                <div key={`${ri}-${ci}`} style={{ padding: "13px 12px", borderTop: "1px solid var(--border-default)", background: ri % 2 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)", textAlign: ci === 0 ? "left" : "center", fontFamily: "var(--font-body)", fontSize: ci === 0 ? 14 : 13.5, fontWeight: ci === 0 ? 600 : 500, color: cell === "✓" ? "var(--candy-teal-deep)" : cell === "anonymous" ? "var(--text-secondary)" : ci === 0 ? "var(--text-primary)" : "var(--text-muted)" }}>{cell}</div>
              ))
            ))}
          </div>
        </Glass>

        {/* ── 5 principles ── */}
        <div style={{ ...sectionLabel, padding: "0 4px" }}>The five principles</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12, marginBottom: 18 }}>
          {PRINCIPLES.map((p) => (
            <Glass key={p.t} pad={18}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--text-primary)" }}>{p.t}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.45, marginTop: 3 }}>{p.d}</div>
            </Glass>
          ))}
        </div>

        {/* ── Your rights ── */}
        <Glass pad={26} style={{ marginBottom: 18 }}>
          <div style={sectionLabel}>Your rights</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55, margin: "0 0 16px" }}>
            Your data is yours to see, take with you, or remove, anytime.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={exportData} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.6)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="arrowRight" size={17} /> {exported ? "Downloaded ✓" : "Export my data"}
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "1px solid var(--terracotta-300)", background: "var(--terracotta-100)", color: "var(--terracotta-700)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer" }}>
                Delete my data
              </button>
            ) : (
              <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <button onClick={deleteData} style={{ height: 46, padding: "0 18px", borderRadius: 999, border: "none", background: "var(--terracotta-700)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Yes, delete everything</button>
                <button onClick={() => setConfirmDelete(false)} style={{ height: 46, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              </div>
            )}
          </div>
          {deleted && <div style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--candy-teal-deep)" }}>Done. Your local data has been cleared.</div>}
          {exported && <div style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>A JSON file with your data was downloaded to this device.</div>}
        </Glass>

        {/* ── Where the data lives ── */}
        <Glass pad={24}>
          <div style={sectionLabel}>Where your data lives</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55, margin: 0 }}>
            Your entries are stored securely and hosted in the EU, in line with the GDPR. We keep only what's needed to run the tools you use, nothing is sold or shared with third parties.
          </p>
          <button onClick={() => { /* placeholder: opens the works agreement / trust pack */ }} style={{ marginTop: 14, background: "none", border: "none", padding: 0, cursor: "pointer", color: ACCENT, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6 }}>
            Read the works agreement / trust pack <Icon name="arrowRight" size={14} />
          </button>
        </Glass>
      </div>
    </div>
  );
}
