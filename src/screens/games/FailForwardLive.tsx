import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { MODULES } from "../../data/modules";
import { FF_CARDS, FF_REFLECTIONS, FF_LEVEL } from "../../data/failForward";
import { primaryBtn, ghostBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";

const ACCENT = MODULES.find((m) => m.id === "bonding")?.color ?? "var(--brand)";
const CARD_TIME = 70;
const REACTIONS = ["😄", "🤯", "💡", "👏"];
const rand = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = rand(i + 1); [x[i], x[j]] = [x[j], x[i]]; } return x; };

type Phase = "lobby" | "card" | "done";

export default function FailForwardLive() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [turnIdx, setTurnIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [reflIdx, setReflIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  const [reactions, setReactions] = useState<{ id: number; e: string }[]>([]);

  const phaseRef = useRef<Phase>("lobby");
  const turnIdxRef = useRef(0);
  const turnOrderRef = useRef<string[]>([]);
  const isHostRef = useRef(false);
  const advancedRef = useRef<string | null>(null);
  const sendRef = useRef<(e: string, p: Record<string, unknown>) => void>(() => {});

  useEffect(() => { phaseRef.current = phase; turnIdxRef.current = turnIdx; turnOrderRef.current = turnOrder; }, [phase, turnIdx, turnOrder]);

  function applyState(p: { phase: Phase; turnOrder: string[]; turnIdx: number; cardIdx: number; reflIdx: number }) {
    setPhase(p.phase); setTurnOrder(p.turnOrder); setTurnIdx(p.turnIdx); setCardIdx(p.cardIdx); setReflIdx(p.reflIdx);
    setSecs(CARD_TIME); setReactions([]); advancedRef.current = null;
  }
  function advanceTurn() {
    const order = turnOrderRef.current, idx = turnIdxRef.current;
    if (idx < order.length - 1) sendRef.current("state", { phase: "card", turnOrder: order, turnIdx: idx + 1, cardIdx: rand(FF_CARDS.length), reflIdx: rand(FF_REFLECTIONS.length) });
    else sendRef.current("state", { phase: "done", turnOrder: order, turnIdx: idx, cardIdx: 0, reflIdx: 0 });
  }

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => applyState(payload));
    ch.on("broadcast", { event: "next" }, ({ payload }) => {
      if (!isHostRef.current || payload.turnIdx !== turnIdxRef.current) return;
      const tag = `t:${turnIdxRef.current}`; if (advancedRef.current === tag) return; advancedRef.current = tag; advanceTurn();
    });
    ch.on("broadcast", { event: "react" }, ({ payload }) => setReactions((r) => [...r.slice(-7), { id: Date.now() + Math.random(), e: payload.e }]));
  };

  const room = useGameRoom("ff", bind);
  sendRef.current = room.send;
  isHostRef.current = room.isHost;

  // host timer fallback
  useEffect(() => {
    if (phase !== "card") return;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase, turnIdx]);
  useEffect(() => {
    if (!room.isHost || phase !== "card") return;
    if (secs <= 0) { const tag = `t:${turnIdx}`; if (advancedRef.current !== tag) { advancedRef.current = tag; advanceTurn(); } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, phase, turnIdx, room.isHost]);

  function start() { room.send("state", { phase: "card", turnOrder: shuffle(room.players.map((p) => p.key)), turnIdx: 0, cardIdx: rand(FF_CARDS.length), reflIdx: rand(FF_REFLECTIONS.length) }); }
  function nextCard() { room.send("next", { turnIdx }); }
  function react(e: string) { room.send("react", { e }); }

  const card = FF_CARDS[cardIdx];
  const lvl = FF_LEVEL[card.level];
  const activeKey = turnOrder[turnIdx];
  const isMyTurn = activeKey === room.clientId;
  const activeName = room.players.find((p) => p.key === activeKey)?.name ?? "…";

  return (
    <RoomShell room={room} game={GAMES.failforward} emoji="🛟" title="Fail Forward, Live" accent={ACCENT} backTo="/app/module/bonding"
      intro="Taking turns, each person draws a worst-case card and reacts spontaneously. The team reacts along. Fictional, playful, no wrong answer."
      lobbyHint="Share the code with the team. Whoever joins is in the round." started={phase !== "lobby"} onStart={start} startLabel="Start round">
      {phase === "card" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{isMyTurn ? "Your turn 🫵" : `${activeName}'s turn`}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: secs <= 10 ? "var(--danger)" : "var(--text-secondary)" }}>⏱️ {secs}s · {turnIdx + 1}/{turnOrder.length}</span>
          </div>

          <Glass pad={28} style={{ borderTop: `5px solid ${lvl.color}` }}>
            <span style={{ display: "inline-block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff", background: lvl.color, padding: "4px 12px", borderRadius: 999, marginBottom: 14 }}>{lvl.label}</span>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, color: "var(--text-primary)", lineHeight: 1.35, margin: 0 }}>{card.text}</p>
            <div style={{ marginTop: 18, padding: "13px 16px", borderRadius: 14, background: "rgba(28,26,23,0.05)" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Reflection for {isMyTurn ? "you" : activeName}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>{FF_REFLECTIONS[reflIdx]}</div>
            </div>
            {isMyTurn && <textarea placeholder="Your spontaneous reaction (optional) …" style={{ width: "100%", marginTop: 14, minHeight: 64, resize: "vertical", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />}
          </Glass>

          {/* reactions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            {REACTIONS.map((e) => <button key={e} onClick={() => react(e)} style={{ fontSize: 22, lineHeight: 1, padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", cursor: "pointer" }}>{e}</button>)}
            <div style={{ display: "flex", gap: 4, fontSize: 20, marginLeft: 6 }}>{reactions.map((r) => <span key={r.id}>{r.e}</span>)}</div>
          </div>

          {isMyTurn ? (
            <button onClick={nextCard} style={{ ...primaryBtn, marginTop: 16, width: "100%" }}>Done, next card <Icon name="arrowRight" size={18} /></button>
          ) : (
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>React along, {activeName} is almost done …</div>
          )}
        </>
      )}

      {phase === "done" && (
        <Glass pad={32}>
          <div style={{ fontSize: 42 }}>🛟</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 6px" }}>Round complete</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 22px" }}>Playing through mistakes in a safe space builds resilience and safety. What counts is the next step.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {room.isHost && <button onClick={start} style={primaryBtn}>New round</button>}
            <button onClick={() => location.assign(location.origin + location.pathname + "#/app/module/bonding")} style={ghostBtn}>Back to the module</button>
          </div>
        </Glass>
      )}
    </RoomShell>
  );
}
