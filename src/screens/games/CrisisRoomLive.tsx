import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { MODULES } from "../../data/modules";
import { CR_SCENARIOS, CR_REFLECTIONS, CR_ROLES } from "../../data/crisisRoom";
import { primaryBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";

const ACCENT = MODULES.find((m) => m.id === "leadership")?.color ?? "var(--brand)";
const DUR: Record<string, number> = { active: 240, capture: 150, reflection: 150 };
const COMP_AT = [50, 130];
const rand = (n: number) => Math.floor(Math.random() * n);

type Phase = "lobby" | "active" | "capture" | "reflection" | "done";

export default function CrisisRoomLive() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  const [ready, setReady] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState(""); const [plan, setPlan] = useState(""); const [roles, setRoles] = useState(""); const [planB, setPlanB] = useState("");
  const [role, setRole] = useState<number | null>(null);

  const phaseRef = useRef<Phase>("lobby");
  const scenarioRef = useRef(0);
  const isHostRef = useRef(false);
  const advancedRef = useRef<string | null>(null);
  const sendRef = useRef<(e: string, p: Record<string, unknown>) => void>(() => {});
  const setters: Record<string, (v: string) => void> = { notes: setNotes, plan: setPlan, roles: setRoles, planB: setPlanB };

  useEffect(() => { phaseRef.current = phase; scenarioRef.current = scenarioIdx; }, [phase, scenarioIdx]);

  function advance() {
    const order: Phase[] = ["active", "capture", "reflection", "done"];
    const next = order[order.indexOf(phaseRef.current) + 1];
    if (next) sendRef.current("state", { phase: next, scenarioIdx: scenarioRef.current });
  }

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      setPhase(payload.phase); setScenarioIdx(payload.scenarioIdx);
      setReady(new Set()); setSecs(DUR[payload.phase] ?? 0); advancedRef.current = null;
    });
    ch.on("broadcast", { event: "ready" }, ({ payload }) => {
      if (payload.phase !== phaseRef.current) return;
      setReady((s) => { const n = new Set(s); n.add(payload.key); return n; });
    });
    ch.on("broadcast", { event: "field" }, ({ payload }) => {
      if (payload.from === clientIdRef.current) return;
      setters[payload.name]?.(payload.value);
    });
  };

  const clientIdRef = useRef("");
  const room = useGameRoom("cr", bind);
  clientIdRef.current = room.clientId;
  sendRef.current = room.send;
  isHostRef.current = room.isHost;

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

  function start() { setNotes(""); setPlan(""); setRoles(""); setPlanB(""); setRole(null); room.send("state", { phase: "active", scenarioIdx: rand(CR_SCENARIOS.length) }); }
  function clickReady() { room.send("ready", { key: room.clientId, phase }); }
  function field(name: string, value: string) { setters[name](value); room.send("field", { name, value, from: room.clientId }); }

  const sc = CR_SCENARIOS[scenarioIdx];
  const elapsed = DUR.active - secs;
  const comps = phase === "active" ? COMP_AT.map((t, i) => (elapsed >= t ? sc.complications[i] : null)).filter(Boolean) as string[] : [];
  const iReady = ready.has(room.clientId);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const ta: React.CSSProperties = { width: "100%", boxSizing: "border-box", resize: "vertical", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
  const readyRow = (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
      <span>{ready.size} of {room.players.length} ready</span><span style={{ color: secs <= 15 ? "var(--danger)" : "var(--text-secondary)" }}>⏱️ {mmss(secs)}</span>
    </div>
  );
  const readyBtn = (label: string) => (
    <button onClick={clickReady} disabled={iReady} style={{ ...primaryBtn, marginTop: 14, width: "100%", opacity: iReady ? 0.5 : 1, cursor: iReady ? "default" : "pointer" }}>{iReady ? "Ready ✓, waiting for the team" : label}</button>
  );

  return (
    <RoomShell room={room} game={GAMES.crisisroom} emoji="🚨" title="Crisis Room, Live" accent={ACCENT} backTo="/app/module/leadership"
      intro="Solve a fictional crisis together under time pressure, with no named leader. Afterwards you reflect on who took which role."
      lobbyHint="Share the code with your team (ideal 4–6). Once everyone's in, the host starts." started={phase !== "lobby"} onStart={start} startLabel="Start crisis">

      {phase === "active" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-secondary)" }}>{sc.tension}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: secs <= 30 ? "var(--danger)" : "var(--text-primary)" }}>⏱️ {mmss(secs)}</span>
          </div>
          <Glass pad={24} style={{ borderTop: "5px solid var(--danger)" }}>
            <span style={{ display: "inline-block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "var(--danger)", padding: "4px 12px", borderRadius: 999, marginBottom: 14 }}>🚨 Crisis</span>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--text-primary)", lineHeight: 1.4, margin: 0 }}>{sc.crisis}</p>
            {comps.map((c) => <div key={c} style={{ marginTop: 12, padding: "12px 15px", borderRadius: 12, background: "rgba(229,72,77,0.10)", border: "1px solid rgba(192,57,43,0.4)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)" }}>⚡ {c}</div>)}
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", margin: "16px 0 6px" }}>Shared notes area (everyone types)</div>
            <textarea value={notes} onChange={(e) => field("notes", e.target.value)} placeholder="First steps, who does what, weighing options …" style={{ ...ta, minHeight: 110 }} />
          </Glass>
          {readyBtn("Plan's set, continue")}
          {readyRow}
        </>
      )}

      {phase === "capture" && (
        <Glass pad={28}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 16px" }}>Your decision</h2>
          <Field label="Your plan in one sentence" v={plan} on={(v) => field("plan", v)} ta={ta} />
          <Field label="Who does what" v={roles} on={(v) => field("roles", v)} ta={ta} />
          <Field label="Plan B, if it goes wrong" v={planB} on={(v) => field("planB", v)} ta={ta} />
          {readyBtn("On to reflection")}
          {readyRow}
        </Glass>
      )}

      {phase === "reflection" && (
        <Glass pad={28}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "0 0 4px" }}>Reflection</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>Talk about it briefly as a team:</p>
          {CR_REFLECTIONS.map((qn, i) => <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.45 }}><span style={{ color: ACCENT, fontWeight: 700 }}>{i + 1}.</span> {qn}</div>)}
          <div style={{ marginTop: 16, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--text-primary)" }}>Which role did you take on? <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, color: "var(--text-muted)" }}>(private)</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {CR_ROLES.map((r, i) => <button key={i} onClick={() => setRole(i)} style={{ textAlign: "left", padding: "11px 15px", borderRadius: 13, cursor: "pointer", background: role === i ? "rgba(95,123,255,0.10)" : "rgba(255,255,255,0.62)", border: `1.5px solid ${role === i ? "var(--brand)" : "var(--border-default)"}`, fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)" }}><strong>{r.label}</strong>, <span style={{ color: "var(--text-secondary)" }}>{r.desc}</span></button>)}
          </div>
          {readyBtn("Wrap up")}
          {readyRow}
        </Glass>
      )}

      {phase === "done" && (
        <Glass pad={30}>
          <div style={{ fontSize: 42 }}>🧭</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 6px" }}>Crisis handled together</h2>
          {role !== null && <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)" }}>Your role: <strong style={{ color: "var(--text-primary)" }}>{CR_ROLES[role].label}</strong></div>}
          {plan.trim() && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)" }}>“{plan.trim()}”</div>}
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "16px 0 22px" }}>Leadership emerges situationally, not from titles. Notice in daily life when you take on which role.</p>
          {room.isHost && <button onClick={start} style={primaryBtn}>New crisis</button>}
        </Glass>
      )}
    </RoomShell>
  );
}

function Field({ label, v, on, ta }: { label: string; v: string; on: (v: string) => void; ta: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>{label}</div>
      <textarea value={v} onChange={(e) => on(e.target.value)} style={{ ...ta, minHeight: 54 }} />
    </div>
  );
}
