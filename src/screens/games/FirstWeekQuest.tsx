import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { useStore } from "../../lib/store";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";
import { GAMES } from "../../data/games";
import {
  QUESTS, PHASES, TOTAL_QUESTS, isUnlocked, connectionsFor,
  buddyFor, buddyColor, teamPool, type Quest,
} from "../../data/firstWeek";
import type { MemberProfile } from "../../data/teamInsights";

/* Eine einzige, gedämpfte Akzentfarbe (Schieferblau). Karten neutral (Off-White
   Sand), keine Pastell-Verläufe. Headlines auf Semibold statt Black. */
const ACCENT = "#41607F";
const ACCENT_TINT = "rgba(65, 96, 127, 0.09)";
const ACCENT_BORDER = "rgba(65, 96, 127, 0.40)";
const CARD = "var(--sand-100)";
const ISTROKE = 1.75;

const rnd = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1); [x[i], x[j]] = [x[j], x[i]]; } return x; };

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 };
const headline: React.CSSProperties = { fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--text-primary)" };
const taArea: React.CSSProperties = { width: "100%", minHeight: 84, resize: "vertical", boxSizing: "border-box", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "var(--sand-100)", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
const inputStyle: React.CSSProperties = { ...taArea, minHeight: 0, height: 46 };

function IconBadge({ name, size = 56 }: { name: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: ACCENT_TINT, display: "grid", placeItems: "center", margin: "0 auto" }}>
      <Icon name={name} size={Math.round(size * 0.44)} color={ACCENT} stroke={ISTROKE} />
    </span>
  );
}

function Avatar({ m, size = 44 }: { m: MemberProfile; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: buddyColor(m), display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.36, color: "var(--ink-fill)" }}>{m.initials}</span>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Einzelner aktiver Schritt. Freitexte rein lokal, nur die Erledigung
   wird im Store gespeichert (onDone).
   ────────────────────────────────────────────────────────────────── */
function QuestActive({ quest, displayName, onDone, onBack }: { quest: Quest; displayName: string | null; onDone: () => void; onBack: () => void }) {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const people = useMemo(() => teamPool(displayName).slice(0, 3), [displayName]);
  const [asked, setAsked] = useState<boolean[]>([false, false, false]);
  const matchSet = useMemo(() => {
    const pool = teamPool(displayName);
    const targets = shuffle(pool).slice(0, 4);
    const allRoles = [...new Set(pool.map((m) => m.role))];
    return targets.map((t) => {
      const distract = shuffle(allRoles.filter((r) => r !== t.role)).slice(0, 2);
      return { member: t, options: shuffle([t.role, ...distract]) };
    });
  }, [displayName]);
  const [matchIdx, setMatchIdx] = useState(0);
  const [matchPick, setMatchPick] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean[]>(() => (quest.items ?? []).map(() => false));

  const header = (
    <div style={{ marginTop: 18 }}>
      <span style={{ width: 48, height: 48, borderRadius: "50%", background: ACCENT_TINT, display: "grid", placeItems: "center" }}>
        <Icon name={quest.icon} size={22} color={ACCENT} stroke={ISTROKE} />
      </span>
      <h2 style={{ ...headline, fontSize: 22, margin: "14px 0 6px" }}>{quest.title}</h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.5 }}>{quest.desc}</p>
    </div>
  );

  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (quest.type === "profile") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {quest.fields!.map((f) => (
          <div key={f.key}>
            <div style={sectionLabel}>{f.label}</div>
            <input value={fields[f.key] ?? ""} onChange={(e) => setFields((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
          </div>
        ))}
      </div>
    );
    const any = Object.values(fields).some((v) => v.trim());
    footer = <button onClick={onDone} disabled={!any} style={{ ...primaryBtn, width: "100%", opacity: any ? 1 : 0.45, cursor: any ? "pointer" : "not-allowed" }}>To the team feed <Icon name="arrowRight" size={18} /></button>;
  }

  if (quest.type === "share") {
    body = <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={quest.placeholder} style={taArea} autoFocus />;
    const ready = text.trim().length > 0;
    footer = (
      <div style={{ display: "flex", gap: 12 }}>
        {quest.optional && <button onClick={onDone} style={ghostBtn}>Skip</button>}
        <button onClick={onDone} disabled={!ready} style={{ ...primaryBtn, flex: 1, opacity: ready ? 1 : 0.45, cursor: ready ? "pointer" : "not-allowed" }}>Share <Icon name="check" size={18} /></button>
      </div>
    );
  }

  if (quest.type === "buddy") {
    const b = buddyFor(displayName);
    body = (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 16, background: CARD, border: `1.5px solid ${ACCENT_BORDER}` }}>
          <Avatar m={b} size={54} />
          <div>
            <div style={{ ...headline, fontWeight: 700, fontSize: 18 }}>{b.name}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{b.role} · your buddy</div>
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55, margin: "16px 0 0" }}>
          {b.name.split(" ")[0]} is your first point of contact. No question is ever too small. Just say a quick hi.
        </p>
        <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: 12, background: ACCENT_TINT, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Need an opener? “Hi {b.name.split(" ")[0]}, I'm new to the team and glad you're my buddy. Would you have a moment this week for a relaxed get-to-know-you?”
        </div>
      </>
    );
    footer = <button onClick={onDone} style={{ ...primaryBtn, width: "100%" }}>Kick off a 1:1 <Icon name="arrowRight" size={18} /></button>;
  }

  if (quest.type === "people") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {quest.suggestedQuestions!.map((q, i) => {
          const m = people[i];
          return (
            <button key={i} onClick={() => setAsked((p) => p.map((x, j) => (j === i ? !x : x)))} style={{ display: "flex", gap: 13, alignItems: "center", textAlign: "left", padding: "13px 15px", borderRadius: 14, cursor: "pointer", border: asked[i] ? `1.5px solid ${ACCENT_BORDER}` : "1.5px solid var(--border-default)", background: asked[i] ? ACCENT_TINT : CARD }}>
              {m && <Avatar m={m} size={40} />}
              <div style={{ flex: 1 }}>
                <div style={{ ...headline, fontWeight: 600, fontSize: 14.5 }}>{m ? m.name.split(" ")[0] : "Colleague"}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>“{q}”</div>
              </div>
              <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: asked[i] ? ACCENT : "var(--sand-100)", border: asked[i] ? "none" : "1.5px solid var(--border-strong)" }}>
                {asked[i] && <Icon name="check" size={14} color="var(--text-on-ink)" />}
              </span>
            </button>
          );
        })}
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 2 }}>Tap what you've asked. At your own pace.</div>
      </div>
    );
    const allAsked = asked.every(Boolean);
    footer = <button onClick={onDone} disabled={!allAsked} style={{ ...primaryBtn, width: "100%", opacity: allAsked ? 1 : 0.45, cursor: allAsked ? "pointer" : "not-allowed" }}>Done <Icon name="check" size={18} /></button>;
  }

  if (quest.type === "match") {
    const cur = matchSet[matchIdx];
    const answered = matchPick !== null;
    const correct = matchPick === cur.member.role;
    body = (
      <div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 14 }}>{matchIdx + 1} of {matchSet.length}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <Avatar m={cur.member} size={60} />
          <div style={{ ...headline, fontWeight: 700, fontSize: 20 }}>{cur.member.name}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>Which area does {cur.member.name.split(" ")[0]} work in?</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cur.options.map((opt) => {
            const isPick = matchPick === opt;
            const isRight = opt === cur.member.role;
            const bg = !answered ? CARD : isRight ? "var(--green-100)" : isPick ? "rgba(224,96,61,0.10)" : "var(--sand-100)";
            const bd = !answered ? "1.5px solid var(--border-default)" : isRight ? "1.5px solid var(--green-600)" : isPick ? "1.5px solid var(--terracotta-500)" : "1.5px solid var(--border-default)";
            return (
              <button key={opt} disabled={answered} onClick={() => setMatchPick(opt)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", padding: "13px 16px", borderRadius: 14, cursor: answered ? "default" : "pointer", border: bd, background: bg, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)" }}>
                {opt}
                {answered && isRight && <Icon name="check" size={17} color="var(--green-600)" />}
              </button>
            );
          })}
        </div>
        {answered && (
          <div style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", textAlign: "center", lineHeight: 1.5 }}>
            {correct ? "Spot on." : `No worries, ${cur.member.name.split(" ")[0]} is in ${cur.member.role}.`}
          </div>
        )}
      </div>
    );
    footer = answered
      ? <button onClick={() => { if (matchIdx < matchSet.length - 1) { setMatchIdx((i) => i + 1); setMatchPick(null); } else onDone(); }} style={{ ...primaryBtn, width: "100%" }}>{matchIdx < matchSet.length - 1 ? "Next" : "Done"} <Icon name="arrowRight" size={18} /></button>
      : <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>Just tap your best guess. This is only about getting to know people.</div>;
  }

  if (quest.type === "info") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {quest.cards!.map((c, i) => (
          <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: CARD, borderLeft: `3px solid ${ACCENT}` }}>
            <div style={{ ...headline, fontWeight: 600, fontSize: 15.5, marginBottom: 3 }}>{c.t}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.d}</div>
          </div>
        ))}
      </div>
    );
    footer = <button onClick={onDone} style={{ ...primaryBtn, width: "100%" }}>Got it <Icon name="check" size={18} /></button>;
  }

  if (quest.type === "task") {
    body = (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {quest.items!.map((it, i) => (
            <button key={i} onClick={() => setChecked((p) => p.map((x, j) => (j === i ? !x : x)))} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "12px 15px", borderRadius: 12, cursor: "pointer", border: checked[i] ? `1.5px solid ${ACCENT_BORDER}` : "1.5px solid var(--border-default)", background: checked[i] ? ACCENT_TINT : CARD }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: checked[i] ? ACCENT : "var(--sand-100)", border: checked[i] ? "none" : "1.5px solid var(--border-strong)" }}>
                {checked[i] && <Icon name="check" size={14} color="var(--text-on-ink)" />}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", fontWeight: checked[i] ? 500 : 400 }}>{it}</span>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>Pick one that feels good. One is enough.</div>
      </>
    );
    const any = checked.some(Boolean);
    footer = <button onClick={onDone} disabled={!any} style={{ ...primaryBtn, width: "100%", opacity: any ? 1 : 0.45, cursor: any ? "pointer" : "not-allowed" }}>Done <Icon name="check" size={18} /></button>;
  }

  if (quest.type === "play") {
    body = (
      <button onClick={() => navigate(quest.cta!.route)} style={{ ...primaryBtn, width: "100%", marginBottom: 14 }}>{quest.cta!.label} <Icon name="arrowRight" size={18} /></button>
    );
    footer = (
      <button onClick={onDone} style={{ ...ghostBtn, width: "100%" }}>Already played? Mark as done</button>
    );
  }

  return (
    <Glass pad={30} className="fwq-step">
      <button onClick={onBack} style={{ ...ghostBtn, height: 38, padding: "0 16px", fontSize: 14 }}><Icon name="arrowLeft" size={15} /> To overview</button>
      {header}
      {body}
      <div style={{ marginTop: 24 }}>{footer}</div>
    </Glass>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Gastgeber-Seite: Welcome-Nudge + Buddy werden (Team-Perspektive).
   ────────────────────────────────────────────────────────────────── */
function HostView({ displayName }: { displayName: string | null }) {
  const newcomer = teamPool(displayName)[1] ?? teamPool(displayName)[0];
  const [reacted, setReacted] = useState<string | null>(null);
  const [isBuddy, setIsBuddy] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Glass pad={28} className="fwq-step">
        <div style={sectionLabel}><Icon name="message" size={14} color="var(--text-muted)" stroke={ISTROKE} /> Welcome nudge</div>
        <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 16 }}>
          {newcomer && <Avatar m={newcomer} size={50} />}
          <div>
            <div style={{ ...headline, fontSize: 18 }}>{newcomer ? newcomer.name.split(" ")[0] : "Someone"} is new to the team</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>Today is their first day. A quick hello means a lot right now.</div>
          </div>
        </div>
        {reacted ? (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", padding: "10px 0" }}>Sent {reacted} Nice of you to reach out.</div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            {["👋", "🎉", "💛"].map((e) => (
              <button key={e} onClick={() => setReacted(e)} style={{ flex: 1, height: 46, borderRadius: 999, border: "1.5px solid var(--border-strong)", background: CARD, fontSize: 20, cursor: "pointer" }}>{e}</button>
            ))}
          </div>
        )}
      </Glass>

      <Glass pad={28} className="fwq-step">
        <div style={sectionLabel}><Icon name="users" size={14} color="var(--text-muted)" stroke={ISTROKE} /> Become a buddy</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 14px", lineHeight: 1.55 }}>Guide a new colleague through their first days. Totally optional, not much effort.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
          {["A relaxed first 1:1 this week", "Be the first point of contact for small questions", "Check in once: how's your start going?"].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: ACCENT, marginTop: 7, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setIsBuddy((v) => !v)} style={{ ...(isBuddy ? primaryBtn : ghostBtn), width: "100%" }}>
          {isBuddy ? "You're a buddy" : "I'll be a buddy"}
        </button>
      </Glass>

      <div style={{ padding: "14px 18px", borderRadius: 16, background: ACCENT_TINT, fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
        Tip: when the new person introduces themselves, react early and casually. A short sentence is enough. It makes the difference between “alone in front of the screen” and “welcome”.
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
export default function FirstWeekQuest({ onComplete, embedded = false }: { onComplete?: (r: { questsDone: number; connectionseMade: number }) => void; embedded?: boolean }) {
  const navigate = useNavigate();
  const displayName = useStore((s) => s.displayName);
  const fwqStart = useStore((s) => s.fwqStart);
  const fwqDone = useStore((s) => s.fwqDone);
  const startJourney = useStore((s) => s.fwqStartJourney);
  const completeQuest = useStore((s) => s.fwqCompleteQuest);

  const allDone = fwqDone.length >= TOTAL_QUESTS;
  const [view, setView] = useState<"new" | "host">("new");
  const [screen, setScreen] = useState<"welcome" | "map" | "active" | "done" | "milestone" | "arrived">(
    allDone ? "arrived" : fwqStart ? "map" : "welcome"
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [milestoneText, setMilestoneText] = useState("");

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".fwq-step", { y: 12, duration: 0.4, ease: "power2.out", stagger: 0.05 });
  }, { dependencies: [screen, view], scope });

  const completedOnce = useRef(false);
  useEffect(() => {
    if (screen === "arrived" && !completedOnce.current) {
      completedOnce.current = true;
      onComplete?.({ questsDone: fwqDone.length, connectionseMade: connectionsFor(fwqDone) });
    }
  }, [screen, fwqDone, onComplete]);

  const connections = connectionsFor(fwqDone);
  const activeQuest = QUESTS.find((q) => q.id === activeId) ?? null;
  const nextQuest = useMemo(() => QUESTS.find((q) => !fwqDone.includes(q.id) && isUnlocked(q, fwqStart)) ?? null, [fwqDone, fwqStart]);

  function openQuest(id: string) { setActiveId(id); setScreen("active"); }
  function finishQuest() {
    if (!activeId) return;
    const before = connectionsFor(fwqDone);
    const newDone = fwqDone.includes(activeId) ? fwqDone : [...fwqDone, activeId];
    completeQuest(activeId);
    const after = connectionsFor(newDone);
    if (newDone.length >= TOTAL_QUESTS) { setScreen("arrived"); return; }
    if (before < 3 && after >= 3) { setMilestoneText(`You've already made ${after} connections.`); setScreen("milestone"); return; }
    setScreen("done");
  }

  const wrap: React.CSSProperties = embedded
    ? { width: "100%" }
    : { height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" };

  return (
    <div ref={scope} style={wrap}>
      {!embedded && (
        <button onClick={() => (screen === "active" ? setScreen("map") : navigate("/app/module/onboarding"))} style={backBtn}>
          <Icon name="arrowLeft" size={16} /> {screen === "active" ? "To overview" : "Onboarding"}
        </button>
      )}

      <div style={{ maxWidth: 600, margin: embedded ? "0" : "auto", width: "100%" }}>
        {/* view toggle */}
        {screen !== "active" && screen !== "arrived" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(28,26,23,0.04)", padding: 5, borderRadius: 999 }}>
            {([["new", "I'm new"], ["host", "Someone is new"]] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setView(k)} style={{ flex: 1, height: 38, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, background: view === k ? CARD : "transparent", color: view === k ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: view === k ? "var(--shadow-sm)" : "none" }}>{lbl}</button>
            ))}
          </div>
        )}

        {view === "host" && screen !== "active" && screen !== "arrived" && <HostView displayName={displayName} />}

        {view === "new" && (
          <>
            {/* ───── welcome ───── */}
            {screen === "welcome" && (
              <Glass pad={34} className="fwq-step">
                <IconBadge name="sparkles" size={60} />
                <h1 style={{ ...headline, fontSize: 27, margin: "16px 0 12px", textAlign: "center" }}>Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}</h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 12px", lineHeight: 1.6 }}>Great to have you here. The first days remote can feel lonely. But they don't have to.</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 4px", lineHeight: 1.6 }}>We break the first days into a few manageable steps that connect you with your team quite naturally. All optional, at your own pace, nothing expires.</p>
                <div style={{ margin: "0 0 24px" }}><GameBrief g={GAMES.firstweek} accent={ACCENT} /></div>
                <button onClick={() => { startJourney(); setScreen("map"); }} style={{ ...primaryBtn, width: "100%" }}>Let's go <Icon name="arrowRight" size={18} /></button>
              </Glass>
            )}

            {/* ───── step map ───── */}
            {screen === "map" && (
              <>
                <div className="fwq-step" style={{ marginBottom: 22 }}>
                  <h1 style={{ ...headline, fontSize: 25, margin: "0 0 8px" }}>Your first days</h1>
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="check" size={15} color="var(--text-muted)" stroke={ISTROKE} /> {fwqDone.length} of {TOTAL_QUESTS} steps</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="users" size={15} color="var(--text-muted)" stroke={ISTROKE} /> {connections === 0 ? "No connections yet" : `${connections} ${connections === 1 ? "connection" : "connections"} made`}</span>
                  </div>
                </div>

                <div className="fwq-step" style={{ position: "relative" }}>
                  {/* durchgehende Linie */}
                  <div style={{ position: "absolute", left: 21, top: 22, bottom: 22, width: 2, background: "var(--border-default)" }} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {PHASES.map((ph) => {
                      const phaseActive = nextQuest?.phase === ph.n;
                      return (
                        <div key={ph.n}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 0 10px" }}>
                            <span style={{ width: 44, height: 44, borderRadius: "50%", background: CARD, display: "grid", placeItems: "center", flexShrink: 0, zIndex: 1, border: `2px solid ${phaseActive ? ACCENT_BORDER : "var(--border-strong)"}`, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: phaseActive ? ACCENT : "var(--text-secondary)" }}>{ph.n}</span>
                            <div>
                              <div style={{ ...headline, fontSize: 16 }}>{ph.label} <span style={{ fontWeight: 400, fontSize: 13, color: "var(--text-muted)" }}>· {ph.sub}</span></div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{ph.line}</div>
                            </div>
                          </div>
                          {QUESTS.filter((q) => q.phase === ph.n).map((q) => {
                            const done = fwqDone.includes(q.id);
                            const unlocked = isUnlocked(q, fwqStart);
                            const isNext = nextQuest?.id === q.id;
                            const clickable = done || unlocked;
                            return (
                              <button key={q.id} disabled={!clickable} onClick={() => clickable && openQuest(q.id)} style={{
                                display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
                                padding: "7px 0", marginBottom: 4, background: "transparent", border: "none",
                                cursor: clickable ? "pointer" : "default", opacity: unlocked || done ? 1 : 0.55,
                              }}>
                                <span style={{ width: 22, height: 22, marginLeft: 11, borderRadius: "50%", flexShrink: 0, zIndex: 1, display: "grid", placeItems: "center",
                                  background: done ? ACCENT : unlocked ? "var(--sand-100)" : "var(--sand-300)",
                                  border: done ? "none" : isNext ? `2px solid ${ACCENT}` : unlocked ? "2px solid var(--border-strong)" : "2px solid var(--border-default)" }}>
                                  {done ? <Icon name="check" size={12} color="var(--text-on-ink)" /> : !unlocked ? <Icon name="lock" size={11} color="var(--text-muted)" /> : null}
                                </span>
                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 13, padding: "12px 15px", borderRadius: 14,
                                  background: isNext ? ACCENT_TINT : done || unlocked ? CARD : "transparent",
                                  border: isNext ? `1px solid ${ACCENT_BORDER}` : done || unlocked ? "1px solid var(--border-default)" : "1px dashed var(--border-default)" }}>
                                  <Icon name={q.icon} size={20} color={unlocked || done ? ACCENT : "var(--text-muted)"} stroke={ISTROKE} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ ...headline, fontSize: 15 }}>{q.title}</span>
                                      {q.optional && !done && <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>· optional</span>}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: unlocked || done ? "var(--text-secondary)" : "var(--text-muted)", lineHeight: 1.4, marginTop: 2 }}>
                                      {done ? "Done." : unlocked ? q.desc : `Opens on day ${q.unlockDay}.`}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="fwq-step" style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", textAlign: "center", margin: "22px 0 0", lineHeight: 1.5 }}>
                  No time pressure, no comparison. The steps open up gradually over your first days.
                </p>
              </>
            )}

            {/* ───── active step ───── */}
            {screen === "active" && activeQuest && (
              <QuestActive key={activeQuest.id} quest={activeQuest} displayName={displayName} onDone={finishQuest} onBack={() => setScreen("map")} />
            )}

            {/* ───── step done ───── */}
            {screen === "done" && (
              <Glass pad={34} className="fwq-step" style={{ textAlign: "center" }}>
                <IconBadge name="check" />
                <h2 style={{ ...headline, fontSize: 23, margin: "16px 0 8px" }}>Nicely done</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>
                  {nextQuest ? `Up next is “${nextQuest.title}”. Whenever you like.` : "You've completed all currently open steps. The next ones open in the coming days."}
                </p>
                <button onClick={() => setScreen("map")} style={{ ...primaryBtn, width: "100%" }}>To overview <Icon name="arrowRight" size={18} /></button>
              </Glass>
            )}

            {/* ───── milestone ───── */}
            {screen === "milestone" && (
              <Glass pad={36} className="fwq-step" style={{ textAlign: "center" }}>
                <IconBadge name="users" size={60} />
                <div style={{ ...sectionLabel, justifyContent: "center", marginTop: 16 }}>Milestone</div>
                <h2 style={{ ...headline, fontSize: 24, margin: "2px 0 8px" }}>{milestoneText}</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.55 }}>This is exactly how belonging grows. Step by step, without pressure.</p>
                <button onClick={() => setScreen("map")} style={{ ...primaryBtn, width: "100%" }}>Next <Icon name="arrowRight" size={18} /></button>
              </Glass>
            )}
          </>
        )}

        {/* ───── arrived (Abschluss Woche 2) ───── */}
        {screen === "arrived" && (
          <Glass pad={38} className="fwq-step" style={{ textAlign: "center" }}>
            <IconBadge name="check" size={64} />
            <h1 style={{ ...headline, fontSize: 28, margin: "18px 0 12px" }}>You've arrived</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 12px", lineHeight: 1.6 }}>
              Two weeks ago you didn't know anyone. Now you've made {connections} connections, gotten to know the team and how it works, and contributed yourself.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", margin: "0 0 26px", lineHeight: 1.6 }}>This is your team now too. Great to have you here.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/app")} style={primaryBtn}>Continue into the app <Icon name="arrowRight" size={18} /></button>
              <button onClick={() => setScreen("map")} style={ghostBtn}>View overview</button>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
