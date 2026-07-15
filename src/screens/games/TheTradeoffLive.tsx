import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { SCENARIOS, FORMULA, PRINCIPLES, REFLECTIONS } from "../../data/theTradeoff";
import { primaryBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";

const ACCENT = "var(--candy-teal)";
const ACCENT_DEEP = "var(--candy-teal-deep)";
const DUR: Record<string, number> = { dilemma: 120, silent: 120, distribution: 90, negotiation: 240, commitment: 150, reflection: 120 };
const rand = (n: number) => Math.floor(Math.random() * n);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Phase = "lobby" | "dilemma" | "silent" | "distribution" | "negotiation" | "commitment" | "reflection" | "done";
type FieldName = "choice" | "later" | "commit";

export default function TheTradeoff() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [scenIdx, setScenIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  const [ready, setReady] = useState<Set<string>>(new Set());
  const [myPicks, setMyPicks] = useState<number[]>([]);
  const [allPicks, setAllPicks] = useState<Record<string, number[]>>({});
  const [fields, setFields] = useState<Record<FieldName, string>>({ choice: "", later: "", commit: "" });

  const phaseRef = useRef<Phase>("lobby");
  const scenRef = useRef(0);
  const advancedRef = useRef<string | null>(null);
  const sendRef = useRef<(e: string, p: Record<string, unknown>) => void>(() => {});
  const clientIdRef = useRef("");
  useEffect(() => { phaseRef.current = phase; scenRef.current = scenIdx; }, [phase, scenIdx]);

  function advance() {
    const order: Phase[] = ["dilemma", "silent", "distribution", "negotiation", "commitment", "reflection", "done"];
    const next = order[order.indexOf(phaseRef.current) + 1];
    if (next) sendRef.current("state", { phase: next, scenIdx: scenRef.current });
  }

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      setPhase(payload.phase); setScenIdx(payload.scenIdx);
      setReady(new Set()); setSecs(DUR[payload.phase] ?? 0); advancedRef.current = null;
      if (payload.phase === "silent") { setMyPicks([]); setAllPicks({}); }
    });
    ch.on("broadcast", { event: "ready" }, ({ payload }) => { if (payload.phase !== phaseRef.current) return; setReady((s) => new Set(s).add(payload.key)); });
    ch.on("broadcast", { event: "prio" }, ({ payload }) => setAllPicks((p) => ({ ...p, [payload.key]: payload.picks })));
    ch.on("broadcast", { event: "field" }, ({ payload }) => { if (payload.from !== clientIdRef.current) setFields((f) => ({ ...f, [payload.name]: payload.value })); });
  };

  const room = useGameRoom("to", bind);
  sendRef.current = room.send;
  clientIdRef.current = room.clientId;

  useEffect(() => {
    if (phase === "lobby" || phase === "done") return;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (!room.isHost || phase === "lobby" || phase === "done") return;
    const tag = phase; if (advancedRef.current === tag) return;
    const readyAll = room.players.length > 0 && room.players.every((p) => ready.has(p.key));
    if (readyAll || secs <= 0) { advancedRef.current = tag; advance(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, phase, ready, room.players, room.isHost]);

  function start() { setFields({ choice: "", later: "", commit: "" }); room.send("state", { phase: "dilemma", scenIdx: rand(SCENARIOS.length) }); }
  function clickReady() { room.send("ready", { key: room.clientId, phase }); }
  function togglePick(i: number) {
    setMyPicks((prev) => {
      let next: number[];
      if (prev.includes(i)) next = prev.filter((x) => x !== i);
      else if (prev.length >= scen.pick) next = prev;
      else next = [...prev, i];
      room.send("prio", { key: room.clientId, picks: next });
      return next;
    });
  }
  function field(name: FieldName, value: string) { setFields((f) => ({ ...f, [name]: value })); room.send("field", { name, value, from: room.clientId }); }

  const scen = SCENARIOS[scenIdx];
  const iReady = ready.has(room.clientId);
  const votes = (i: number) => Object.values(allPicks).filter((arr) => arr.includes(i)).length;
  const totalVoters = Math.max(1, Object.keys(allPicks).length);

  const ta: React.CSSProperties = { width: "100%", boxSizing: "border-box", resize: "vertical", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
  const readyRow = (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
      <span>{ready.size} of {room.players.length} ready</span><span style={{ color: secs <= 15 ? "var(--danger)" : "var(--text-secondary)" }}>⏱️ {mmss(secs)}</span>
    </div>
  );
  const readyBtn = (label: string, disabled = false) => (
    <button onClick={clickReady} disabled={iReady || disabled} style={{ ...primaryBtn, marginTop: 14, width: "100%", opacity: iReady || disabled ? 0.5 : 1, cursor: iReady || disabled ? "default" : "pointer" }}>{iReady ? "Ready ✓, waiting for the team" : label}</button>
  );
  const optionRow = (i: number, extra?: React.ReactNode) => (
    <div key={i} style={{ padding: "13px 15px", borderRadius: 13, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{scen.options[i].label}</span>
        {extra}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.4 }}>{scen.options[i].consequence}</div>
    </div>
  );

  return (
    <RoomShell room={room} game={GAMES.thetradeoff} emoji="⚖️" title="The Trade-Off, Live" accent={ACCENT} backTo="/app/module/performance"
      intro="You can't do everything at once. Prioritize together and make the trade-offs visible. Deliberately leaving things out is the win, not the defeat."
      lobbyHint="Share the code with your team (ideal 3–6). Once everyone's in, the host starts." started={phase !== "lobby"} onStart={start} startLabel="Start dilemma">

      {phase === "dilemma" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-secondary)" }}>{scen.title}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>⏱️ {mmss(secs)}</span>
          </div>
          <Glass pad={26} style={{ borderTop: `5px solid ${ACCENT_DEEP}` }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--text-primary)", lineHeight: 1.4, margin: "0 0 16px" }}>{scen.situation}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{scen.options.map((_, i) => optionRow(i))}</div>
          </Glass>
          {readyBtn("Got it, prioritize silently")}
          {readyRow}
        </>
      )}

      {phase === "silent" && (
        <Glass pad={26}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 4px" }}>Prioritize silently</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>For you, anonymous. Pick {scen.pick} of {scen.options.length}. No anchoring from loud voices.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scen.options.map((o, i) => {
              const on = myPicks.includes(i);
              return (
                <button key={i} onClick={() => togglePick(i)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "12px 15px", borderRadius: 13, cursor: "pointer", border: on ? `1.5px solid ${ACCENT_DEEP}` : "1px solid var(--border-default)", background: on ? "rgba(92,163,150,0.12)" : "rgba(255,255,255,0.6)" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: on ? ACCENT_DEEP : "rgba(255,255,255,0.8)", border: on ? "none" : "1.5px solid var(--border-strong)" }}>{on && <Icon name="check" size={14} color="var(--text-on-ink)" />}</span>
                  <span><span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{o.label}</span><span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>{o.consequence}</span></span>
                </button>
              );
            })}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>{myPicks.length} of {scen.pick} selected</div>
          {readyBtn("Done", myPicks.length !== scen.pick)}
          {readyRow}
        </Glass>
      )}

      {phase === "distribution" && (
        <Glass pad={26}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 4px" }}>How the team prioritized</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 16px" }}>Anonymous. The spread is the interesting part.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {scen.options.map((o, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{o.label}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{votes(i)}×</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(28,26,23,0.06)", overflow: "hidden" }}>
                  <div style={{ width: `${(votes(i) / totalVoters) * 100}%`, height: "100%", borderRadius: 999, background: ACCENT_DEEP }} />
                </div>
              </div>
            ))}
          </div>
          {readyBtn("On to negotiation")}
          {readyRow}
        </Glass>
      )}

      {phase === "negotiation" && (
        <Glass pad={26}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 4px" }}>Negotiate together</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>Rule: for every “yes” you name a deliberate “no or later”.</p>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: ACCENT_DEEP, marginBottom: 6 }}>What we'll do</div>
          <textarea value={fields.choice} onChange={(e) => field("choice", e.target.value)} placeholder="Our chosen priorities …" style={{ ...ta, minHeight: 60, marginBottom: 14 }} />
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>What we deliberately postpone</div>
          <textarea value={fields.later} onChange={(e) => field("later", e.target.value)} placeholder="What we deliberately do later, with no guilty conscience …" style={{ ...ta, minHeight: 60 }} />
          {readyBtn("Write the commitment")}
          {readyRow}
        </Glass>
      )}

      {phase === "commitment" && (
        <Glass pad={26}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 4px" }}>The honest commitment</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>Phrase it the way you'd say it to stakeholders.</p>
          <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(92,163,150,0.10)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.5, marginBottom: 12 }}>“We'll deliver X and Y. We deliberately postpone Z and communicate that transparently.”</div>
          <textarea value={fields.commit} onChange={(e) => field("commit", e.target.value)} placeholder="We'll deliver … . We deliberately postpone …" style={{ ...ta, minHeight: 90 }} />
          {readyBtn("On to reflection")}
          {readyRow}
        </Glass>
      )}

      {phase === "reflection" && (
        <Glass pad={28}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 12px" }}>Reflection</h2>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(92,163,150,0.12)", border: `1.5px solid ${ACCENT}`, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 16 }}>{FORMULA}</div>
          {REFLECTIONS.map((q, i) => <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.45 }}><span style={{ color: ACCENT_DEEP, fontWeight: 700 }}>{i + 1}.</span> {q}</div>)}
          {readyBtn("Wrap up")}
          {readyRow}
        </Glass>
      )}

      {phase === "done" && (
        <Glass pad={30}>
          <div style={{ fontSize: 42, textAlign: "center" }}>⚖️</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "8px 0 10px", textAlign: "center" }}>Chosen deliberately</h2>
          {fields.commit.trim() && <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(92,163,150,0.10)", border: `1.5px solid ${ACCENT}`, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55, marginBottom: 16 }}>{fields.commit}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {PRINCIPLES.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.45 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: ACCENT_DEEP, marginTop: 7, flexShrink: 0 }} />{p}</div>)}
          </div>
          {room.isHost && <button onClick={start} style={{ ...primaryBtn, width: "100%" }}>New scenario</button>}
        </Glass>
      )}
    </RoomShell>
  );
}
