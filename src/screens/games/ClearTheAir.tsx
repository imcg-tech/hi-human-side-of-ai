import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";
import { GAMES } from "../../data/games";
import PrivacyHint from "../../components/PrivacyHint";

/* Clear the Air, Conflict & Repair. Privates Solo-Vorbereitungs-Tool.
   Sensibler Bereich: Freiwilligkeit & Sicherheit haben Vorrang.
   Alle Freitexte bleiben strikt lokal (useState), werden NIE gespeichert
   oder übertragen. Das Tool löst KEINE Benachrichtigungen an Dritte aus. */

const ACCENT = "var(--candy-pink)";
const ACCENT_DEEP = "var(--candy-pink-deep)";

const FEELINGS = ["frustrated", "hurt", "unsure", "overlooked", "stressed", "disappointed", "tense", "ignored"];
const NEEDS = ["Reliability", "Appreciation", "Clarity", "Being included", "Respect", "Calm"];

const PERSPECTIVE_Q = [
  "Assuming the other person doesn't mean any harm: what reason could their behavior have?",
  "What do you NOT know right now about their situation? (Stress, overload, worries of their own?)",
  "Were there moments when the collaboration went well?",
];

const SELF_CHECKS = [
  "Does it describe behavior, not character?",
  "Is it an invitation to dialogue, not an accusation?",
  "Does it end openly, with a genuine question?",
];

const FRAME_TIPS = [
  "Pick good timing, not on the fly, not in public.",
  "One-on-one, in a calm moment.",
  "Prefer voice or video over text, the tone of voice helps.",
];

const TAKEAWAYS = [
  { emoji: "⏳", t: "Early beats late", d: "A small clarification now prevents a big escalation." },
  { emoji: "🎯", t: "Behavior, not person", d: "Describe what happened, not who someone “is”." },
  { emoji: "💬", t: "End openly", d: "A genuine question invites dialogue." },
];

const STEP_LABELS = ["Intro", "Sort it out", "Perspective", "Prepare", "Paths"];

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 76, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14,
      border: active ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)",
      background: active ? ACCENT : "rgba(255,255,255,0.55)",
      color: active ? "var(--ink-fill)" : "var(--text-secondary)",
      fontWeight: active ? 600 : 400, transition: "all 0.18s",
    }}>{label}</button>
  );
}

function Help({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

export default function ClearTheAir({ onComplete, embedded = false }: { onComplete?: (r: { prepared: boolean; chosenPath: string }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Alle Freitexte rein lokal, niemals gespeichert oder übertragen.
  const [observation, setObservation] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [feelingText, setFeelingText] = useState("");
  const [need, setNeed] = useState("");
  const [perspective, setPerspective] = useState<string[]>(["", "", ""]);
  const [ownSentence, setOwnSentence] = useState("");
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [chosenPath, setChosenPath] = useState("");

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".cta-step", { y: 14, duration: 0.45, ease: "power2.out" });
  }, { dependencies: [step], scope });

  const toggleFeeling = (f: string) => setFeelings((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));
  const setPersp = (i: number, v: string) => setPerspective((p) => p.map((x, j) => (j === i ? v : x)));
  const toggleCheck = (i: number) => setChecks((p) => p.map((x, j) => (j === i ? !x : x)));

  const feelingLabel = [...feelings, feelingText.trim()].filter(Boolean).join(", ");
  const obs = observation.trim().replace(/[.!?]+$/, "");
  const suggested =
    `I noticed: ${obs || "… (what concretely happened)"}. ` +
    `It made me feel ${feelingLabel || "… (your feeling)"}. ` +
    `What matters to me is ${need.trim() || "… (what's important to you)"}. How do you see it?`;

  function back() { if (step > 0) setStep((s) => s - 1); else if (!embedded) navigate("/app/module/conflict"); }
  function next() { setStep((s) => Math.min(s + 1, 4)); }
  function restart() {
    setStep(0); setObservation(""); setFeelings([]); setFeelingText(""); setNeed("");
    setPerspective(["", "", ""]); setOwnSentence(""); setChecks([false, false, false]); setChosenPath("");
  }
  function finish() {
    const prepared = ownSentence.trim().length > 0 || chosenPath === "direct";
    onComplete?.({ prepared, chosenPath });
    if (!embedded) navigate("/app/module/conflict");
  }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div ref={scope} style={wrap}>
      {!embedded && (
        <button onClick={back} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {step === 0 ? "Conflict & Repair" : STEP_LABELS[step - 1]}
        </button>
      )}

      <div style={{ maxWidth: 580, margin: embedded ? "0" : "auto", width: "100%" }}>
        {/* progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18 }}>
          {STEP_LABELS.map((_, i) => (
            <span key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 999, background: i <= step ? ACCENT_DEEP : "rgba(28,26,23,0.12)", transition: "all 0.3s" }} />
          ))}
        </div>

        {/* ───────── Screen 1: Intro ───────── */}
        {step === 0 && (
          <Glass pad={32} className="cta-step">
            <div style={sectionLabel}>Conflict &amp; Repair</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "0 0 4px" }}>Clear the Air</h1>
            <GameBrief g={GAMES.cleartheair} accent={ACCENT_DEEP} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
              {[
                "Tension is part of it. It's not a sign that something is broken.",
                "Left unaddressed, it grows. Raised early, relationships often get stronger.",
                "Here you sort things out calmly for yourself. No one sees it.",
                "The goal isn't “being right”, but working well together again.",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: ACCENT_DEEP, marginTop: 8, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>

            <PrivacyHint boxed text="Nothing is saved or shared. Just for your own preparation." style={{ marginTop: 18 }} />

            <button onClick={next} style={{ ...primaryBtn, marginTop: 22, width: "100%" }}>Let's go <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ───────── Screen 2: Was ist los? (sortieren) ───────── */}
        {step === 1 && (
          <Glass pad={30} className="cta-step">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 4px" }}>What's going on?</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.5 }}>Move the tension from a vague feeling into something concrete. At your own pace.</p>

            <div style={sectionLabel}>1 · Observation, not judgment</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 8px", lineHeight: 1.5 }}>What concretely happened? Describe it like a camera, just facts, no interpretation.</p>
            <textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="My last two messages got no reply." style={taArea} />
            <Help>Instead of “He ignores me all the time”, try: “My last two messages got no reply.”</Help>

            <div style={{ ...sectionLabel, marginTop: 24 }}>2 · Your feeling</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 10px", lineHeight: 1.5 }}>How are you feeling about it?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FEELINGS.map((f) => <Chip key={f} label={f} active={feelings.includes(f)} onClick={() => toggleFeeling(f)} />)}
            </div>
            <input value={feelingText} onChange={(e) => setFeelingText(e.target.value)} placeholder="or in your own words …" style={{ ...taArea, minHeight: 0, height: 46, marginTop: 10 }} />

            <div style={{ ...sectionLabel, marginTop: 24 }}>3 · Your need</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 10px", lineHeight: 1.5 }}>What would you need for it to get better?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {NEEDS.map((n) => <Chip key={n} label={n} active={need.trim() === n} onClick={() => setNeed(n)} />)}
            </div>
            <input value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Reliability? Appreciation? Clarity?" style={{ ...taArea, minHeight: 0, height: 46 }} />

            <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
              <button onClick={back} style={ghostBtn}>Back</button>
              <button onClick={next} style={{ ...primaryBtn, flex: 1 }}>Next <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {/* ───────── Screen 3: Perspektivwechsel ───────── */}
        {step === 2 && (
          <Glass pad={30} className="cta-step">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 4px" }}>Shift perspective</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.5 }}>Briefly take the other person out of the “opponent” role. That often defuses the most. Answers are optional.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {PERSPECTIVE_Q.map((q, i) => (
                <div key={i}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 8px", lineHeight: 1.5 }}>{q}</p>
                  <textarea value={perspective[i]} onChange={(e) => setPersp(i, e.target.value)} placeholder="Optional, just for you …" style={{ ...taArea, minHeight: 58 }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 14, background: ACCENT, color: "var(--ink-fill)" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }}>Most tension comes from circumstances, not intent. That's what makes it solvable. You don't have to excuse anyone, just widen the view.</span>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={back} style={ghostBtn}>Back</button>
              <button onClick={next} style={{ ...primaryBtn, flex: 1 }}>Next <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {/* ───────── Screen 4: Ansprechen vorbereiten ───────── */}
        {step === 3 && (
          <Glass pad={30} className="cta-step">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 4px" }}>Prepare to raise it</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>Your sorting turns into a fair way to open the conversation.</p>

            <div style={sectionLabel}>A suggestion from your input</div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.7)", border: `1.5px solid ${ACCENT}`, fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6 }}>{suggested}</div>

            <div style={{ ...sectionLabel, marginTop: 24 }}>Now you</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 8px", lineHeight: 1.5 }}>Write your own opening sentence.</p>
            <textarea value={ownSentence} onChange={(e) => setOwnSentence(e.target.value)} placeholder="Your first sentence, in your words …" style={{ ...taArea, minHeight: 84 }} />

            <div style={{ ...sectionLabel, marginTop: 24 }}>Quick self-check</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SELF_CHECKS.map((c, i) => (
                <button key={i} onClick={() => toggleCheck(i)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "11px 14px", borderRadius: 12, cursor: "pointer", border: checks[i] ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: checks[i] ? ACCENT : "rgba(255,255,255,0.55)" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: checks[i] ? "var(--ink-fill)" : "rgba(255,255,255,0.8)", border: checks[i] ? "none" : "1.5px solid var(--border-strong)" }}>
                    {checks[i] && <Icon name="check" size={14} color="var(--text-on-ink)" />}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: checks[i] ? "var(--ink-fill)" : "var(--text-body)", fontWeight: checks[i] ? 500 : 400 }}>{c}</span>
                </button>
              ))}
            </div>

            <div style={{ ...sectionLabel, marginTop: 24 }}>Setting tips</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {FRAME_TIPS.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: ACCENT_DEEP, marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
              <button onClick={back} style={ghostBtn}>Back</button>
              <button onClick={next} style={{ ...primaryBtn, flex: 1 }}>Next <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {/* ───────── Screen 5: Paths & closing ───────── */}
        {step === 4 && (
          <div className="cta-step">
            <Glass pad={30}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 18px" }}>Takeaways</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {TAKEAWAYS.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 15px", borderRadius: 14, background: "rgba(255,255,255,0.55)" }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{t.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{t.t}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.45 }}>{t.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...sectionLabel, marginTop: 26 }}>How would you like to continue?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: "direct", emoji: "💬", t: "I'll raise it directly", d: "You take your prepared opener with you." },
                  { id: "sleep", emoji: "🌙", t: "I'll sleep on it", d: "Totally okay. You can come back anytime." },
                  { id: "support", emoji: "🤝", t: "I need support", d: "More on that in the note below." },
                ].map((o) => (
                  <button key={o.id} onClick={() => setChosenPath(o.id)} style={{ display: "flex", gap: 13, alignItems: "flex-start", textAlign: "left", padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: chosenPath === o.id ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: chosenPath === o.id ? ACCENT : "rgba(255,255,255,0.55)" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{o.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: chosenPath === o.id ? "var(--ink-fill)" : "var(--text-primary)" }}>{o.t}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: chosenPath === o.id ? "var(--ink-fill)" : "var(--text-secondary)", lineHeight: 1.45, opacity: chosenPath === o.id ? 0.85 : 1 }}>{o.d}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Glass>

            {/* Eskalations-Hinweis, dezent aber prominent */}
            <div style={{ marginTop: 16, padding: "16px 18px", borderRadius: 16, background: "var(--terracotta-100)", border: "1px solid var(--terracotta-300)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <Icon name="heart" size={18} color="var(--terracotta-700)" />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--terracotta-700)" }}>When it's about more</span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", margin: 0, lineHeight: 1.55 }}>
                If it's about more than everyday tension, such as repeated behavior that weighs on you, bullying, discrimination or boundary violations, that's not something you have to solve alone. Turn to your manager, HR or a person you trust. That's the right and strong step.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={restart} style={ghostBtn}>Again</button>
              <button onClick={finish} style={{ ...primaryBtn, flex: 1 }}>Finish <Icon name="check" size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
