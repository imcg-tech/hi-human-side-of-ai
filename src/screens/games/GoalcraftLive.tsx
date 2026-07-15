import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { MODULES } from "../../data/modules";
import { CRITERIA, VAGUE_GOALS, REFLECTIONS, assembleSog, type CritKey } from "../../data/goalcraft";
import { primaryBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";

const ACCENT = MODULES.find((m) => m.id === "performance")?.color ?? "var(--candy-teal)";
const ACCENT_DEEP = "var(--candy-teal-deep)";
const DUR: Record<string, number> = { vague: 90, craft: 420, compare: 150, reflect: 150 };
const rand = (n: number) => Math.floor(Math.random() * n);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Phase = "lobby" | "vague" | "craft" | "compare" | "reflect" | "done";
type FieldName = "unclear" | CritKey;

export default function GoalcraftLive() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [goalIdx, setGoalIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  const [ready, setReady] = useState<Set<string>>(new Set());
  const [fields, setFields] = useState<Record<FieldName, string>>({ unclear: "", konkret: "", messbar: "", sinnvoll: "", erreichbar: "" });
  const [votes, setVotes] = useState<Record<string, "druck" | "sog">>({});

  const phaseRef = useRef<Phase>("lobby");
  const goalRef = useRef(0);
  const advancedRef = useRef<string | null>(null);
  const sendRef = useRef<(e: string, p: Record<string, unknown>) => void>(() => {});
  const clientIdRef = useRef("");

  useEffect(() => { phaseRef.current = phase; goalRef.current = goalIdx; }, [phase, goalIdx]);

  function advance() {
    const order: Phase[] = ["vague", "craft", "compare", "reflect", "done"];
    const next = order[order.indexOf(phaseRef.current) + 1];
    if (next) sendRef.current("state", { phase: next, goalIdx: goalRef.current });
  }

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      setPhase(payload.phase); setGoalIdx(payload.goalIdx);
      setReady(new Set()); setSecs(DUR[payload.phase] ?? 0); advancedRef.current = null;
    });
    ch.on("broadcast", { event: "ready" }, ({ payload }) => {
      if (payload.phase !== phaseRef.current) return;
      setReady((s) => { const n = new Set(s); n.add(payload.key); return n; });
    });
    ch.on("broadcast", { event: "field" }, ({ payload }) => {
      if (payload.from === clientIdRef.current) return;
      setFields((f) => ({ ...f, [payload.name]: payload.value }));
    });
    ch.on("broadcast", { event: "vote" }, ({ payload }) => {
      setVotes((v) => ({ ...v, [payload.key]: payload.choice }));
    });
  };

  const room = useGameRoom("gc", bind);
  clientIdRef.current = room.clientId;
  sendRef.current = room.send;

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

  function start() {
    setFields({ unclear: "", konkret: "", messbar: "", sinnvoll: "", erreichbar: "" });
    setVotes({});
    room.send("state", { phase: "vague", goalIdx: rand(VAGUE_GOALS.length) });
  }
  function clickReady() { room.send("ready", { key: room.clientId, phase }); }
  function field(name: FieldName, value: string) { setFields((f) => ({ ...f, [name]: value })); room.send("field", { name, value, from: room.clientId }); }
  function vote(choice: "druck" | "sog") { setVotes((v) => ({ ...v, [room.clientId]: choice })); room.send("vote", { key: room.clientId, choice }); }

  const goal = VAGUE_GOALS[goalIdx];
  const sog = assembleSog(fields);
  const iReady = ready.has(room.clientId);
  const myVote = votes[room.clientId];
  const sogVotes = Object.values(votes).filter((c) => c === "sog").length;
  const druckVotes = Object.values(votes).filter((c) => c === "druck").length;

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
    <RoomShell room={room} game={GAMES.goalcraft} emoji="🎯" title="Goalcraft, Live" accent={ACCENT} backTo="/app/module/performance"
      intro="Together, turn a fuzzy directive into a goal that pulls instead of pushes, along four criteria."
      lobbyHint="Share the code with your team (ideal 3–6). Once everyone's in, the host starts." started={phase !== "lobby"} onStart={start} startLabel="Sharpen the goal">

      {phase === "vague" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-secondary)" }}>The vague directive</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: secs <= 15 ? "var(--danger)" : "var(--text-primary)" }}>⏱️ {mmss(secs)}</span>
          </div>
          <Glass pad={26} style={{ borderTop: `5px solid ${ACCENT_DEEP}` }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", lineHeight: 1.3, margin: 0 }}>“{goal.text}”</p>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>{goal.category}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", margin: "18px 0 6px" }}>What's unclear about it? (everyone types)</div>
            <textarea value={fields.unclear} onChange={(e) => field("unclear", e.target.value)} placeholder="What would it mean in practice? What's missing?" style={{ ...ta, minHeight: 90 }} />
          </Glass>
          {readyBtn("Go, sharpen the goal")}
          {readyRow}
        </>
      )}

      {phase === "craft" && (
        <Glass pad={26}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 4px" }}>Sharpen it together</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 16px" }}>“{goal.text}” along the four criteria. Everyone types along.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CRITERIA.map((c) => {
              const filled = fields[c.key].trim().length > 0;
              return (
                <div key={c.key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center", background: filled ? ACCENT_DEEP : "transparent", border: filled ? "none" : "1.5px solid var(--border-strong)" }}>
                      {filled && <Icon name="check" size={12} color="var(--text-on-ink)" />}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{c.prompt}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)" }}>· {c.question}</span>
                  </div>
                  <textarea value={fields[c.key]} onChange={(e) => field(c.key, e.target.value)} placeholder={c.placeholder} style={{ ...ta, minHeight: 46 }} />
                </div>
              );
            })}
          </div>
          {readyBtn("Compare")}
          {readyRow}
        </Glass>
      )}

      {phase === "compare" && (
        <>
          <Glass pad={26}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>Pressure vs. pull</div>
            <button onClick={() => vote("druck")} style={{ display: "block", width: "100%", textAlign: "left", padding: "15px 17px", borderRadius: 15, marginBottom: 12, cursor: "pointer", border: `1.5px solid ${myVote === "druck" ? "var(--danger)" : "var(--border-default)"}`, background: myVote === "druck" ? "rgba(229,72,77,0.06)" : "rgba(255,255,255,0.6)" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--danger)", marginBottom: 6 }}>Pressure version</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16.5, color: "var(--text-primary)", lineHeight: 1.4 }}>“{goal.pressure}”</div>
            </button>
            <button onClick={() => vote("sog")} style={{ display: "block", width: "100%", textAlign: "left", padding: "15px 17px", borderRadius: 15, cursor: "pointer", border: `1.5px solid ${myVote === "sog" ? ACCENT_DEEP : "var(--border-default)"}`, background: myVote === "sog" ? "rgba(92,163,150,0.10)" : "rgba(255,255,255,0.6)" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: ACCENT_DEEP, marginBottom: 6 }}>Your pull version</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16.5, color: "var(--text-primary)", lineHeight: 1.4 }}>{sog || "…"}</div>
            </button>

            <div style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", textAlign: "center" }}>Which one would motivate you in the morning?</div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
              <span style={{ color: ACCENT_DEEP }}>Pull {sogVotes}</span>
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span style={{ color: "var(--danger)" }}>Pressure {druckVotes}</span>
            </div>
          </Glass>
          {readyBtn("On to reflection")}
          {readyRow}
        </>
      )}

      {phase === "reflect" && (
        <Glass pad={28}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 4px" }}>Reflection</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>Talk about it briefly as a team:</p>
          {REFLECTIONS.map((q, i) => <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.45 }}><span style={{ color: ACCENT_DEEP, fontWeight: 700 }}>{i + 1}.</span> {q}</div>)}
          {readyBtn("Wrap up")}
          {readyRow}
        </Glass>
      )}

      {phase === "done" && (
        <Glass pad={30}>
          <div style={{ fontSize: 42 }}>🎯</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "8px 0 8px" }}>Your sharpened goal</h2>
          {sog && <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(92,163,150,0.10)", border: `1.5px solid ${ACCENT}`, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.55 }}>{sog}</div>}
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "16px 0 22px" }}>Want to turn it into a real team goal? Totally optional. Goals are orientation, not a whip.</p>
          {room.isHost && <button onClick={start} style={primaryBtn}>New goal</button>}
        </Glass>
      )}
    </RoomShell>
  );
}
