import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import MoodFace from "../../components/MoodFace";
import { useStore, type OooSession, type OooSide, type OooTopic, type OooAgreement } from "../../lib/store";
import { MOCK_MEMBERS } from "../../data/teamInsights";
import { pickQuestions, STEPS, PRIVACY_NOTE } from "../../data/oneOnOne";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";
import { GAMES } from "../../data/games";

const ACCENT = "var(--candy-lilac)";
const ACCENT_DEEP = "var(--candy-lilac-deep, #6C5CE0)";
const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

const MOOD_LABELS = ["Drained", "Tired", "Okay", "Good", "Energized"];

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 };
const taArea: React.CSSProperties = { width: "100%", minHeight: 46, resize: "vertical", boxSizing: "border-box", borderRadius: 12, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
const fmtDate = (d: string) => { const [y, m, day] = d.split("-"); return `${day}.${m}.${y}`; };

function PrivacyRow() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.04)" }}>
      <Icon name="lock" size={17} color="var(--text-secondary)" />
      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{PRIVACY_NOTE}</span>
    </div>
  );
}

type View = "home" | "prep" | "questions" | "during" | "agreements" | "summary";

export default function OneOnOneCompanion({ onComplete, embedded = false }: { onComplete?: (r: { closed: boolean }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const sessions = useStore((s) => s.oneOnOnes);
  const oooCreate = useStore((s) => s.oooCreate);
  const oooUpdate = useStore((s) => s.oooUpdate);
  const oooRemove = useStore((s) => s.oooRemove);

  const [view, setView] = useState<View>("home");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [partnerInput, setPartnerInput] = useState("");
  const [topicText, setTopicText] = useState("");
  const [agreeText, setAgreeText] = useState("");
  const [agreeOwner, setAgreeOwner] = useState<OooSide>("them");
  const [qNudge, setQNudge] = useState(0); // shuffles the rotating questions

  const session = useMemo(() => sessions.find((s) => s.id === activeId) ?? null, [sessions, activeId]);
  const patch = (p: Partial<OooSession>) => { if (session) oooUpdate(session.id, p); };

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".ooo-step", { y: 12, duration: 0.38, ease: "power2.out" });
  }, { dependencies: [view], scope });

  // ── actions on the active session ──
  function start(partner: string) {
    const name = partner.trim();
    if (!name) return;
    const id = oooCreate(name);
    setActiveId(id); setPartnerInput(""); setTopicText(""); setView("prep");
  }
  function addTopic(by: "you" | "them", text: string) {
    const t = text.trim(); if (!t || !session) return;
    patch({ topics: [...session.topics, { id: uid(), text: t, by, addressed: false }] });
  }
  function toggleTopic(id: string) {
    if (!session) return;
    patch({ topics: session.topics.map((t) => (t.id === id ? { ...t, addressed: !t.addressed } : t)) });
  }
  function removeTopic(id: string) {
    if (!session) return;
    patch({ topics: session.topics.filter((t) => t.id !== id) });
  }
  function toggleStep(id: string) {
    if (!session) return;
    patch({ steps: session.steps.includes(id) ? session.steps.filter((s) => s !== id) : [...session.steps, id] });
  }
  function addAgreement() {
    const t = agreeText.trim(); if (!t || !session) return;
    patch({ agreements: [...session.agreements, { id: uid(), text: t, owner: agreeOwner, done: false }] });
    setAgreeText("");
  }
  function toggleAgreement(id: string) {
    if (!session) return;
    patch({ agreements: session.agreements.map((a) => (a.id === id ? { ...a, done: !a.done } : a)) });
  }
  function removeAgreement(id: string) {
    if (!session) return;
    patch({ agreements: session.agreements.filter((a) => a.id !== id) });
  }
  function finish() {
    patch({ closed: true });
    onComplete?.({ closed: true });
    setActiveId(null); setView("home");
  }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  const theirTopics = session?.topics.filter((t) => t.by === "them") ?? [];
  const yourTopics = session?.topics.filter((t) => t.by === "you") ?? [];
  const suggestions = useMemo(() => pickQuestions((session?.topics.length ?? 0) + qNudge), [session?.topics.length, qNudge]);
  const ownerLabel: Record<OooSide, string> = { you: "You", them: "Them", both: "Both" };

  return (
    <div ref={scope} style={wrap}>
      {!embedded && (
        <button onClick={() => (view === "home" ? navigate("/app/module/leadership") : setView(view === "prep" ? "home" : view === "questions" ? "prep" : view === "during" ? "questions" : view === "agreements" ? "during" : "home"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {view === "home" ? "Leadership" : "Back"}
        </button>
      )}

      <div style={{ maxWidth: 620, margin: embedded ? "0" : "auto", width: "100%" }}>

        {/* ───────── Home / history ───────── */}
        {view === "home" && (
          <div className="ooo-step">
            <Glass pad={30}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, background: ACCENT, display: "grid", placeItems: "center" }}><Icon name="users" size={22} color="var(--ink-fill)" /></span>
                <div>
                  <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>1:1 Companion</h1>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Turn a routine check-in into a conversation worth having.</div>
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55, margin: "0 0 4px" }}>
                A good 1:1 belongs to your report, not to you. Prepare a shared agenda, follow a gentle guide, and keep the thread across time.
              </p>

              <div style={{ marginBottom: 22 }}><GameBrief g={GAMES.oneonone} accent={ACCENT_DEEP} /></div>

              <div style={sectionLabel}>Start a 1:1 with</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {MOCK_MEMBERS.map((m) => (
                  <button key={m.id} onClick={() => start(m.name)} style={{ padding: "8px 14px", borderRadius: 999, cursor: "pointer", border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{m.name.split(" ")[0]}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={partnerInput} onChange={(e) => setPartnerInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start(partnerInput)} placeholder="or type a name …" style={{ ...taArea, minHeight: 0, height: 46, flex: 1 }} />
                <button onClick={() => start(partnerInput)} disabled={!partnerInput.trim()} style={{ ...primaryBtn, height: 46, opacity: partnerInput.trim() ? 1 : 0.45, cursor: partnerInput.trim() ? "pointer" : "not-allowed" }}>Start <Icon name="arrowRight" size={17} /></button>
              </div>
            </Glass>

            {sessions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ ...sectionLabel, padding: "0 4px" }}>Your 1:1s</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...sessions].reverse().map((s) => {
                    const openCount = s.agreements.filter((a) => !a.done).length;
                    return (
                      <button key={s.id} onClick={() => { setActiveId(s.id); setView(s.closed ? "summary" : "prep"); }} style={{ textAlign: "left", padding: "14px 16px", borderRadius: 16, cursor: "pointer", border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ width: 40, height: 40, borderRadius: 11, background: ACCENT, color: "var(--ink-fill)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{s.partner.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--text-primary)" }}>{s.partner}</div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{fmtDate(s.date)} · {s.closed ? "closed" : "in prep"}{openCount ? ` · ${openCount} open` : ""}</div>
                        </div>
                        <Icon name="arrowRight" size={16} color="var(--text-muted)" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───────── Prep, shared agenda ───────── */}
        {view === "prep" && session && (
          <Glass pad={28} className="ooo-step">
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: 0 }}>1:1 with {session.partner.split(" ")[0]}</h2>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>{fmtDate(session.date)}</span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 18px" }}>A shared agenda. Capture what they've raised, and add your own.</p>

            {/* carry-over: the red thread */}
            {session.agreements.some((a) => a.carried) && (
              <div style={{ marginBottom: 18, padding: "14px 16px", borderRadius: 14, background: ACCENT, color: "var(--ink-fill)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}><Icon name="repeat" size={15} color="var(--ink-fill)" /> Picking up from last time</div>
                {session.agreements.filter((a) => a.carried).map((a) => (
                  <div key={a.id} style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5 }}>· {a.text} <span style={{ opacity: 0.75 }}>({ownerLabel[a.owner]})</span></div>
                ))}
              </div>
            )}

            <TopicColumn label="Their topics" hint="Note what they've raised" placeholder="Note a topic they've raised …" list={theirTopics} onToggle={toggleTopic} onRemove={removeTopic}
              onAdd={(t) => addTopic("them", t)} />
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 7 }}>Their agenda is theirs. Jot down only what {session.partner.split(" ")[0]} has already raised, so nothing gets lost.</div>
            <div style={{ height: 16 }} />
            <TopicColumn label="Your topics" hint="What you want to raise" list={yourTopics} onToggle={toggleTopic} onRemove={removeTopic}
              onAdd={(t) => addTopic("you", t)} text={topicText} setText={setTopicText} />

            {/* optional mood impulse */}
            <div style={{ ...sectionLabel, marginTop: 22 }}>Their mood check-in · optional</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px" }}>Only shown if they choose to share it.</div>
            <div style={{ display: "flex", gap: 8 }}>
              {MOOD_LABELS.map((_, i) => (
                <button key={i} onClick={() => patch({ mood: session.mood === i + 1 ? null : i + 1 })} title={MOOD_LABELS[i]} style={{ flex: 1, height: 48, borderRadius: 12, cursor: "pointer", display: "grid", placeItems: "center", border: session.mood === i + 1 ? `2px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: session.mood === i + 1 ? ACCENT : "rgba(255,255,255,0.55)" }}><MoodFace mood={i + 1} size={30} /></button>
              ))}
            </div>

            <div style={{ margin: "20px 0" }}><PrivacyRow /></div>
            <button onClick={() => setView("questions")} style={{ ...primaryBtn, width: "100%" }}>To the questions <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ───────── Question suggestions ───────── */}
        {view === "questions" && session && (
          <Glass pad={28} className="ooo-step">
            <div style={sectionLabel}>Fresh prompts for this conversation</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 6px" }}>Ask, don't just report</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 16px" }}>A couple of rotating questions so 1:1s don't slide into status updates. Add any to your agenda.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {suggestions.map((s, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.62)", border: "1px solid var(--border-default)" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: ACCENT_DEEP, marginBottom: 5 }}>{s.cat}</div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", lineHeight: 1.45, margin: 0 }}>{s.q}</p>
                    <button onClick={() => addTopic("you", s.q)} title="Add to your agenda" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, cursor: "pointer", border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.6)", color: ACCENT_DEEP, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              <button onClick={() => setQNudge((n) => n + 1)} style={ghostBtn}><Icon name="repeat" size={16} /> Other questions</button>
              <button onClick={() => setView("during")} style={{ ...primaryBtn, flex: 1 }}>Start the conversation <Icon name="arrowRight" size={18} /></button>
            </div>
          </Glass>
        )}

        {/* ───────── During, 7-step guide ───────── */}
        {view === "during" && session && (
          <div className="ooo-step">
            <Glass pad={26}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: 0 }}>The conversation</h2>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>{session.steps.length}/{STEPS.length}</span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 16px" }}>A flexible frame, not a script. Check off as you go.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STEPS.map((st) => {
                  const on = session.steps.includes(st.id);
                  const topics = st.id === "their" ? theirTopics : st.id === "yours" ? yourTopics : [];
                  return (
                    <div key={st.id}>
                      <button onClick={() => toggleStep(st.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: on ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-default)", background: on ? ACCENT : "rgba(255,255,255,0.55)" }}>
                        <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1, display: "grid", placeItems: "center", background: on ? "var(--ink-fill)" : "rgba(255,255,255,0.8)", border: on ? "none" : "1.5px solid var(--border-strong)" }}>{on && <Icon name="check" size={14} color="var(--text-on-ink)" />}</span>
                        <span>
                          <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: on ? "var(--ink-fill)" : "var(--text-primary)" }}>{st.title}</span>
                          <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 13, color: on ? "var(--ink-fill)" : "var(--text-secondary)", opacity: on ? 0.85 : 1, marginTop: 1 }}>{st.hint}</span>
                        </span>
                      </button>
                      {topics.length > 0 && (
                        <div style={{ margin: "6px 0 2px 34px", display: "flex", flexDirection: "column", gap: 4 }}>
                          {topics.map((t) => (
                            <button key={t.id} onClick={() => toggleTopic(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: "var(--font-body)", fontSize: 14, color: t.addressed ? "var(--text-muted)" : "var(--text-body)", textDecoration: t.addressed ? "line-through" : "none" }}>
                              <span style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: "grid", placeItems: "center", background: t.addressed ? ACCENT_DEEP : "transparent", border: t.addressed ? "none" : "1.5px solid var(--border-strong)" }}>{t.addressed && <Icon name="check" size={11} color="#fff" />}</span>
                              {t.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ ...sectionLabel, marginTop: 20 }}>Private notes</div>
              <textarea value={session.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Just for the two of you, stays on this device …" style={{ ...taArea, minHeight: 90 }} />
            </Glass>
            <button onClick={() => setView("agreements")} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>To agreements <Icon name="arrowRight" size={18} /></button>
          </div>
        )}

        {/* ───────── Agreements ───────── */}
        {view === "agreements" && session && (
          <Glass pad={28} className="ooo-step">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 4px" }}>Agreements</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 16px" }}>Concrete next steps on both sides. Open ones return at your next 1:1.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {session.agreements.length === 0 && <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "6px 0" }}>No agreements yet. Add the first below.</div>}
              {session.agreements.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 13px", borderRadius: 12, background: a.done ? "rgba(28,26,23,0.04)" : "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)" }}>
                  <button onClick={() => toggleAgreement(a.id)} style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1, cursor: "pointer", display: "grid", placeItems: "center", background: a.done ? ACCENT_DEEP : "rgba(255,255,255,0.8)", border: a.done ? "none" : "1.5px solid var(--border-strong)" }}>{a.done && <Icon name="check" size={14} color="#fff" />}</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: a.done ? "var(--text-muted)" : "var(--text-body)", lineHeight: 1.4, textDecoration: a.done ? "line-through" : "none" }}>{a.text}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{ownerLabel[a.owner]}{a.carried ? " · from last time" : ""}</div>
                  </div>
                  <button onClick={() => removeAgreement(a.id)} aria-label="Remove" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 15 }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {(["them", "you", "both"] as OooSide[]).map((o) => (
                <button key={o} onClick={() => setAgreeOwner(o)} style={{ flex: 1, height: 34, borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: agreeOwner === o ? 600 : 400, border: agreeOwner === o ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: agreeOwner === o ? ACCENT : "rgba(255,255,255,0.55)", color: "var(--text-primary)" }}>{ownerLabel[o]}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={agreeText} onChange={(e) => setAgreeText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAgreement()} placeholder="e.g. Share the draft by Friday" style={{ ...taArea, minHeight: 0, height: 46, flex: 1 }} />
              <button onClick={addAgreement} disabled={!agreeText.trim()} style={{ ...ghostBtn, height: 46, opacity: agreeText.trim() ? 1 : 0.5 }}>Add</button>
            </div>

            <div style={{ margin: "18px 0" }}><PrivacyRow /></div>
            <button onClick={finish} style={{ ...primaryBtn, width: "100%" }}>Finish & save <Icon name="check" size={18} /></button>
          </Glass>
        )}

        {/* ───────── Summary / history of a closed session ───────── */}
        {view === "summary" && session && (
          <div className="ooo-step">
            <Glass pad={28}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: 0 }}>{session.partner} · {fmtDate(session.date)}</h2>
                {session.mood && <span title={MOOD_LABELS[session.mood - 1]} style={{ display: "inline-flex" }}><MoodFace mood={session.mood} size={30} /></span>}
              </div>

              <div style={sectionLabel}>Agreements</div>
              {session.agreements.length === 0 ? (
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>None recorded.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                  {session.agreements.map((a) => (
                    <div key={a.id} style={{ display: "flex", gap: 9, fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.4 }}>
                      <span style={{ color: a.done ? "var(--candy-teal-deep)" : "var(--text-muted)", fontWeight: 700 }}>{a.done ? "✓" : "○"}</span>
                      <span style={{ textDecoration: a.done ? "line-through" : "none", color: a.done ? "var(--text-muted)" : "var(--text-body)" }}>{a.text} <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({ownerLabel[a.owner]})</span></span>
                    </div>
                  ))}
                </div>
              )}

              {session.topics.length > 0 && (
                <>
                  <div style={sectionLabel}>Topics</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                    {session.topics.map((t) => (
                      <span key={t.id} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", background: "rgba(28,26,23,0.05)", padding: "5px 11px", borderRadius: 999 }}>{t.by === "them" ? "🙋 " : "🧭 "}{t.text}</span>
                    ))}
                  </div>
                </>
              )}

              {session.notes.trim() && (
                <>
                  <div style={sectionLabel}>Private notes</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5, whiteSpace: "pre-wrap", padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)" }}>{session.notes}</div>
                </>
              )}
            </Glass>

            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={() => start(session.partner)} style={primaryBtn}>New 1:1 with {session.partner.split(" ")[0]} <Icon name="arrowRight" size={18} /></button>
              <button onClick={() => { oooRemove(session.id); setActiveId(null); setView("home"); }} style={ghostBtn}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicColumn({ label, hint, list, onAdd, onToggle, onRemove, placeholder = "Add a topic …", text, setText }: {
  label: string; hint: string; list: OooTopic[];
  onAdd: (t: string) => void; onToggle: (id: string) => void; onRemove: (id: string) => void;
  placeholder?: string; text?: string; setText?: (s: string) => void;
}) {
  const [local, setLocal] = useState("");
  const val = text ?? local;
  const set = setText ?? setLocal;
  return (
    <div>
      <div style={sectionLabel}>{label} <span style={{ textTransform: "none", fontWeight: 400, color: "var(--text-muted)" }}>· {hint}</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
        {list.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 11, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)" }}>
            <button onClick={() => onToggle(t.id)} style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: "pointer", display: "grid", placeItems: "center", background: t.addressed ? "var(--candy-teal-deep)" : "transparent", border: t.addressed ? "none" : "1.5px solid var(--border-strong)" }}>{t.addressed && <Icon name="check" size={11} color="#fff" />}</button>
            <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14.5, color: t.addressed ? "var(--text-muted)" : "var(--text-body)", textDecoration: t.addressed ? "line-through" : "none" }}>{t.text}</span>
            <button onClick={() => onRemove(t.id)} aria-label="Remove" style={{ width: 24, height: 24, borderRadius: 7, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={val} onChange={(e) => set(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); set(""); } }} placeholder={placeholder} style={{ ...taArea, minHeight: 0, height: 42, flex: 1 }} />
        <button onClick={() => { if (val.trim()) { onAdd(val.trim()); set(""); } }} disabled={!val.trim()} style={{ ...ghostBtn, height: 42, padding: "0 16px", fontSize: 14, opacity: val.trim() ? 1 : 0.5 }}>Add</button>
      </div>
    </div>
  );
}
