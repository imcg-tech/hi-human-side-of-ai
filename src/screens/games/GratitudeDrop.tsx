import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { useStore } from "../../lib/store";
import { GRATITUDE_PROMPTS } from "../../data/balance";
import PrivacyHint from "../../components/PrivacyHint";
import { backBtn } from "./gameStyles";

const BTN_AMBER = "#BA7517";   // warmes Amber, Text weiß
const HEART_GOLD = "#D6AE2A";  // gelbes Herz-Icon
const HEART_BOX = "#FBEEDA";   // warmes, helles Kästchen
const DEFAULT_PH = "Today I'm grateful for …";
const todayStr = () => new Date().toISOString().slice(0, 10);

// warme Kartentöne mit je passender dunkler Textfarbe, stabil pro Eintrag
const TONES = [
  { bg: "#FAEEDA", fg: "#633806" }, // Amber
  { bg: "#FBEAF0", fg: "#72243E" }, // Rosa
  { bg: "#E1F5EE", fg: "#085041" }, // Türkis
];
const toneFor = (s: string) => TONES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

function whenLabel(date: string) {
  const today = todayStr();
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (date === today) return "Today";
  if (date === yest) return "Yesterday";
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y}`;
}

export default function GratitudeDrop() {
  const navigate = useNavigate();
  const gratitude = useStore((s) => s.gratitude);
  const addGratitude = useStore((s) => s.addGratitude);
  const [text, setText] = useState("");
  const [justDropped, setJustDropped] = useState(false);
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * GRATITUDE_PROMPTS.length));
  const [placeholder, setPlaceholder] = useState(DEFAULT_PH);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".gd-new", { y: 14, scale: 0.9, duration: 0.5, ease: "back.out(1.7)" }); }, { dependencies: [gratitude.length], scope });

  const droppedToday = gratitude.some((g) => g.date === todayStr());
  const prompt = GRATITUDE_PROMPTS[promptIdx];

  function drop() {
    const t = text.trim();
    if (!t) return;
    addGratitude(t);
    setText("");
    setPlaceholder(DEFAULT_PH);
    setPromptIdx((i) => (i + 1) % GRATITUDE_PROMPTS.length); // frische Anregung fürs nächste Mal
    setJustDropped(true);
    setTimeout(() => setJustDropped(false), 2200);
  }
  function usePrompt() { setPlaceholder(prompt); taRef.current?.focus(); }

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate("/app/balance")} style={backBtn}><Icon name="arrowLeft" size={16} /> Balance</button>

      <div style={{ maxWidth: 560, margin: "auto", width: "100%" }}>
        <Glass pad={32}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>🔒 Just for you</div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 6px" }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: HEART_BOX, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name="heart" size={19} color={HEART_GOLD} />
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: 0 }}>Gratitude Drop</h1>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>
            {droppedToday ? "Already captured one today, want another thought? No pressure." : "One sentence you're grateful for right now. Small counts."}
          </p>

          {/* sanfte, optionale Anregung */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <button onClick={usePrompt} style={{ flex: 1, textAlign: "left", display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, cursor: "pointer", border: "1px solid rgba(186,117,23,0.28)", background: "rgba(186,117,23,0.08)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.3 }}>
              <span style={{ fontSize: 14 }}>💭</span> {prompt}
            </button>
            <button onClick={() => setPromptIdx((i) => (i + 1) % GRATITUDE_PROMPTS.length)} aria-label="Another prompt" title="Another prompt" style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
              <Icon name="repeat" size={15} stroke={1.9} />
            </button>
          </div>

          <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) drop(); }}
            style={{ width: "100%", minHeight: 80, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "13px 15px", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 }} />

          <button onClick={drop} disabled={!text.trim()} style={{ height: 50, marginTop: 14, width: "100%", borderRadius: 999, border: "none", background: BTN_AMBER, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, cursor: text.trim() ? "pointer" : "not-allowed", opacity: text.trim() ? 1 : 0.5, boxShadow: text.trim() ? "0 8px 20px rgba(186,117,23,0.30)" : "none", transition: "opacity 0.2s, box-shadow 0.2s" }}>
            Capture
          </button>
          {justDropped && <div style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginTop: 12 }}>Captured. Lovely.</div>}

          <PrivacyHint text="Stays on your device. No one else sees this." style={{ marginTop: 14 }} />
        </Glass>

        {/* Dein Garten */}
        {gratitude.length === 0 ? (
          <div className="gd-new" style={{ marginTop: 22, textAlign: "center", padding: "30px 22px", borderRadius: 20, background: "rgba(186,117,23,0.07)", border: "1px dashed rgba(186,117,23,0.4)" }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: HEART_BOX, display: "inline-grid", placeItems: "center" }}>
              <Icon name="heart" size={26} color={HEART_GOLD} />
            </span>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", margin: "12px 0 4px" }}>Your garden grows here</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>Your first entry starts your garden.</div>
          </div>
        ) : (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 4px 12px" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>Your garden</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}><Icon name="heart" size={13} color={HEART_GOLD} /> {gratitude.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
              {gratitude.map((gm, i) => {
                const tone = toneFor(gm.text + gm.date);
                return (
                  <div key={i} className={i === 0 ? "gd-new" : undefined} style={{ padding: "14px 16px", borderRadius: 16, background: tone.bg, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: tone.fg, opacity: 0.6 }}>{whenLabel(gm.date)}</span>
                      <Icon name="heart" size={13} color={tone.fg} />
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: tone.fg, lineHeight: 1.45 }}>{gm.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
