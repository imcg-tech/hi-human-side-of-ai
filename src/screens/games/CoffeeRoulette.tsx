import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import PrivacyHint from "../../components/PrivacyHint";
import { useStore } from "../../lib/store";
import { CADENCES, PREFS, CONVERSATION_STARTERS, SLOTS, makeMatch, avatarColor, memberById, type Match } from "../../data/coffeeRoulette";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";

const ACCENT = "#8B5E3C";       // coffee brown
const ACCENT_SOFT = "rgba(139,94,60,0.10)";
const ACCENT_BORDER = "rgba(139,94,60,0.35)";

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 };
const cadenceLabel = (k: string) => CADENCES.find((c) => c.key === k)?.label ?? "Weekly";

function Avatar({ id, name, size = 48 }: { id: string; name: string; size?: number }) {
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return <span style={{ width: size, height: size, borderRadius: "50%", background: avatarColor(id), color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.36 }}>{initials}</span>;
}

type Phase = "home" | "matched" | "scheduling" | "date" | "feedback";

export default function CoffeeRoulette({ onComplete, embedded = false }: { onComplete?: (r: { met: number }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const enabled = useStore((s) => s.coffeeEnabled);
  const paused = useStore((s) => s.coffeePaused);
  const cadence = useStore((s) => s.coffeeCadence);
  const pref = useStore((s) => s.coffeePref);
  const met = useStore((s) => s.coffeeMet);
  const department = useStore((s) => s.department);
  const coffeeSet = useStore((s) => s.coffeeSet);
  const coffeeAddMet = useStore((s) => s.coffeeAddMet);
  const coffeeRate = useStore((s) => s.coffeeRate);

  const [phase, setPhase] = useState<Phase>("home");
  const [match, setMatch] = useState<Match | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [callLink, setCallLink] = useState("");
  const [starter, setStarter] = useState(0);
  const [rated, setRated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // join form (local until "I'm in")
  const [joinCadence, setJoinCadence] = useState(cadence);
  const [joinPref, setJoinPref] = useState(pref);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".cr-step", { y: 12, duration: 0.4, ease: "power2.out" });
  }, { dependencies: [phase, enabled, paused], scope });

  function join() { coffeeSet({ coffeeEnabled: true, coffeePaused: false, coffeeCadence: joinCadence, coffeePref: joinPref }); setPhase("home"); }
  function newMatch() {
    const m = makeMatch(met, pref, department);
    if (!m) return;
    setMatch(m); setSlot(null); setCallLink(""); setStarter(0); setRated(false); setPhase("matched");
  }
  function submitFeedback(good: boolean) {
    coffeeRate(good);
    match?.members.forEach((mem) => coffeeAddMet(mem.id));
    setRated(true);
    onComplete?.({ met: met.length + (match?.members.length ?? 0) });
  }

  const wrap: React.CSSProperties = embedded ? { width: "100%" } : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };
  const container: React.CSSProperties = { maxWidth: 560, margin: embedded ? "0" : "auto", width: "100%" };

  const Header = ({ title, sub }: { title: string; sub?: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{ width: 46, height: 46, borderRadius: 13, background: ACCENT, display: "grid", placeItems: "center", fontSize: 24, flexShrink: 0 }}>☕</span>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>{title}</h1>
        {sub && <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{sub}</div>}
      </div>
    </div>
  );

  const Pills = <T extends string>({ items, value, onPick }: { items: { key: T; label: string; hint?: string }[]; value: T; onPick: (k: T) => void }) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((it) => {
        const on = value === it.key;
        return (
          <button key={it.key} onClick={() => onPick(it.key)} title={it.hint} style={{ padding: "9px 15px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: on ? 600 : 400, border: on ? `1.5px solid ${ACCENT}` : "1.5px solid var(--border-strong)", background: on ? ACCENT_SOFT : "rgba(255,255,255,0.55)", color: on ? ACCENT : "var(--text-secondary)" }}>{it.label}</button>
        );
      })}
    </div>
  );

  return (
    <div ref={scope} style={wrap}>
      {!embedded && (
        <button onClick={() => (phase === "home" ? navigate("/app/balance") : setPhase("home"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {phase === "home" ? "Balance" : "Back"}
        </button>
      )}

      <div style={container}>
        {/* ───────── JOIN ───────── */}
        {!enabled && (
          <Glass pad={30} className="cr-step">
            <Header title="Coffee Roulette" sub="Random, low-stakes coffee dates" />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 6px" }}>
              Remote life is missing the coffee-kitchen run-ins. Opt in and we'll pair you with a random colleague now and then, just to say hi. No agenda, no work talk needed.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 20px" }}>These little connections quietly ease isolation and open new perspectives.</p>

            <div style={sectionLabel}>How often?</div>
            <div style={{ marginBottom: 18 }}><Pills items={CADENCES} value={joinCadence} onPick={setJoinCadence} /></div>

            <div style={sectionLabel}>Who would you like to meet?</div>
            <div style={{ marginBottom: 20 }}><Pills items={PREFS} value={joinPref} onPick={setJoinPref} /></div>

            <PrivacyHint boxed text="Totally voluntary and pausable anytime, with no downside. The quick “how was it?” is anonymous and only helps the matching, never seen by a manager." style={{ marginBottom: 20 }} />
            <button onClick={join} style={{ ...primaryBtn, width: "100%" }}>I'm in <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ───────── PAUSED ───────── */}
        {enabled && paused && (
          <Glass pad={30} className="cr-step" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>⏸️</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "8px 0 6px" }}>Paused</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.55 }}>You won't be matched while paused. Come back whenever you like, no pressure.</p>
            <button onClick={() => coffeeSet({ coffeePaused: false })} style={primaryBtn}>Resume <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ───────── HOME (enabled, active) ───────── */}
        {enabled && !paused && phase === "home" && (
          <div className="cr-step">
            <Glass pad={28}>
              <Header title="Coffee Roulette" sub={`You're in · ${cadenceLabel(cadence)}`} />
              <div style={{ padding: "16px 18px", borderRadius: 16, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, marginBottom: 18 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--text-primary)" }}>You're on the list ☕</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 3 }}>Your next match arrives each {cadenceLabel(cadence).toLowerCase()} round. Want to meet someone now?</div>
                <button onClick={newMatch} style={{ ...primaryBtn, marginTop: 14, width: "100%", background: ACCENT }}>See my match <Icon name="arrowRight" size={18} /></button>
              </div>

              {/* met collection */}
              <div style={sectionLabel}>People you've met</div>
              {met.length === 0 ? (
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>No coffees yet. Your first match is one tap away.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {met.map((id) => { const m = memberById(id); return m ? (
                    <div key={id} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", borderRadius: 999, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)" }}>
                      <Avatar id={id} name={m.name} size={26} />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-body)" }}>{m.name.split(" ")[0]}</span>
                    </div>
                  ) : null; })}
                </div>
              )}

              {/* settings */}
              <button onClick={() => setShowSettings((v) => !v)} style={{ ...ghostBtn, width: "100%", marginTop: 20, height: 44, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon name="chevronDown" size={16} style={{ transform: showSettings ? "rotate(180deg)" : "none" }} /> {showSettings ? "Hide settings" : "Rhythm & preferences"}
              </button>
              {showSettings && (
                <div style={{ marginTop: 14 }}>
                  <div style={sectionLabel}>How often?</div>
                  <div style={{ marginBottom: 16 }}><Pills items={CADENCES} value={cadence} onPick={(k) => coffeeSet({ coffeeCadence: k })} /></div>
                  <div style={sectionLabel}>Who would you like to meet?</div>
                  <div style={{ marginBottom: 16 }}><Pills items={PREFS} value={pref} onPick={(k) => coffeeSet({ coffeePref: k })} /></div>
                  <button onClick={() => coffeeSet({ coffeePaused: true })} style={{ ...ghostBtn, width: "100%", height: 44 }}>Pause participation</button>
                </div>
              )}
            </Glass>
          </div>
        )}

        {/* ───────── MATCHED ───────── */}
        {phase === "matched" && match && (
          <Glass pad={30} className="cr-step">
            <div style={{ ...sectionLabel, textAlign: "center" }}>☕ Your coffee match{match.trio ? "es" : ""} · {cadenceLabel(cadence).toLowerCase()}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 22, margin: "8px 0 18px" }}>
              {match.members.map((m) => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <Avatar id={m.id} name={m.name} size={64} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{m.name}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
            {match.trio && <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: ACCENT, textAlign: "center", marginBottom: 12 }}>Odd number this round, so it's a cosy three. 🙌</div>}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55, textAlign: "center", margin: "0 0 22px" }}>
              {met.some((id) => match.members.some((m) => m.id === id)) ? "You've chatted before, lovely to reconnect." : "You haven't had a coffee yet. Perfect excuse."}
            </p>
            <button onClick={() => setPhase("scheduling")} style={{ ...primaryBtn, width: "100%", background: ACCENT }}>Let's find a time <Icon name="arrowRight" size={18} /></button>
            <button onClick={() => { newMatch(); }} style={{ ...ghostBtn, width: "100%", marginTop: 10, height: 44 }}>Skip this one</button>
          </Glass>
        )}

        {/* ───────── SCHEDULING ───────── */}
        {phase === "scheduling" && match && (
          <Glass pad={30} className="cr-step">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 4px" }}>Find a time</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 16px" }}>Pick a slot that suits you both. No calendar access needed.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {SLOTS.map((s) => {
                const on = slot === s;
                return (
                  <button key={s} onClick={() => setSlot(s)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "13px 15px", borderRadius: 13, cursor: "pointer", border: on ? `1.5px solid ${ACCENT}` : "1.5px solid var(--border-default)", background: on ? ACCENT_SOFT : "rgba(255,255,255,0.6)" }}>
                    <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center", background: on ? ACCENT : "transparent", border: on ? "none" : "1.5px solid var(--border-strong)" }}>{on && <Icon name="check" size={12} color="#fff" />}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)" }}>{s}</span>
                  </button>
                );
              })}
            </div>

            <div style={sectionLabel}>Call link</div>
            <input value={callLink} onChange={(e) => setCallLink(e.target.value)} placeholder="Paste your Teams / Meet link (optional)" style={{ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 12, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", padding: "0 14px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none" }} />
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0", lineHeight: 1.5 }}>Coffee Roulette uses your existing video tool, it doesn't replace it.</div>

            <button onClick={() => setPhase("date")} disabled={!slot} style={{ ...primaryBtn, width: "100%", marginTop: 20, background: ACCENT, opacity: slot ? 1 : 0.45, cursor: slot ? "pointer" : "not-allowed" }}>Confirm {slot ? `· ${slot}` : ""} <Icon name="check" size={18} /></button>
          </Glass>
        )}

        {/* ───────── DATE (prompts) ───────── */}
        {phase === "date" && match && (
          <Glass pad={30} className="cr-step" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42 }}>☕</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "8px 0 4px" }}>Enjoy your coffee</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.55 }}>{slot ? `${slot} with ${match.members.map((m) => m.name.split(" ")[0]).join(" & ")}.` : ""} No agenda, just say hi.</p>

            <div style={{ padding: "18px 18px 16px", borderRadius: 16, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}` }}>
              <div style={{ ...sectionLabel, marginBottom: 8 }}>If a silence creeps in</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", lineHeight: 1.35, minHeight: 48 }}>{CONVERSATION_STARTERS[starter]}</div>
              <button onClick={() => setStarter((i) => (i + 1) % CONVERSATION_STARTERS.length)} style={{ ...ghostBtn, marginTop: 12, height: 40, padding: "0 16px", fontSize: 13.5 }}><Icon name="repeat" size={15} /> Another one</button>
            </div>

            <button onClick={() => setPhase("feedback")} style={{ ...primaryBtn, width: "100%", marginTop: 22, background: ACCENT }}>We're done <Icon name="arrowRight" size={18} /></button>
          </Glass>
        )}

        {/* ───────── FEEDBACK ───────── */}
        {phase === "feedback" && match && (
          <Glass pad={32} className="cr-step" style={{ textAlign: "center" }}>
            {!rated ? (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 6px" }}>How was it?</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 22px" }}>One tap, anonymous, only helps future matches.</p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                  <button onClick={() => submitFeedback(true)} style={{ width: 120, height: 90, borderRadius: 18, cursor: "pointer", border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}><span style={{ fontSize: 30 }}>😊</span> Good</button>
                  <button onClick={() => submitFeedback(false)} style={{ width: 120, height: 90, borderRadius: 18, cursor: "pointer", border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}><span style={{ fontSize: 30 }}>😐</span> Meh</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 42 }}>🙌</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "8px 0 6px" }}>Thanks for the coffee</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.55 }}>Added to your little collection. Same rhythm next round, or meet someone new now?</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={newMatch} style={{ ...primaryBtn, background: ACCENT }}>Match me with someone new</button>
                  <button onClick={() => setPhase("home")} style={ghostBtn}>Keep my {cadenceLabel(cadence).toLowerCase()} rhythm</button>
                </div>
              </>
            )}
          </Glass>
        )}
      </div>
    </div>
  );
}
