import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { SITUATION_CARDS, TYPE_INFO, FRAMING, SAFETY_NOTE, FORMULA, REFLECTIONS, type ReactionType } from "../../data/ownershipCards";
import { primaryBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";

const ACCENT = "var(--candy-teal)";
const ACCENT_DEEP = "var(--candy-teal-deep)";
const ROUNDS = 3;
const DUR: Record<string, number> = { framing: 120, card: 150, reveal: 120, reflection: 150 };
const rand = (n: number) => Math.floor(Math.random() * n);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const TYPES: ReactionType[] = ["blame", "selbst", "ownership"];

type Phase = "lobby" | "framing" | "card" | "reveal" | "reflection" | "done";

export default function OwnershipCardsLive() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [round, setRound] = useState(1);
  const [cardIdx, setCardIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  const [ready, setReady] = useState<Set<string>>(new Set());
  const [picks, setPicks] = useState<Record<string, ReactionType>>({});

  const phaseRef = useRef<Phase>("lobby");
  const roundRef = useRef(1);
  const cardRef = useRef(0);
  const advancedRef = useRef<string | null>(null);
  const sendRef = useRef<(e: string, p: Record<string, unknown>) => void>(() => {});
  useEffect(() => { phaseRef.current = phase; roundRef.current = round; cardRef.current = cardIdx; }, [phase, round, cardIdx]);

  function advance() {
    const p = phaseRef.current, r = roundRef.current;
    if (p === "framing") sendRef.current("state", { phase: "card", round: 1, cardIdx: rand(SITUATION_CARDS.length) });
    else if (p === "card") sendRef.current("state", { phase: "reveal", round: r, cardIdx: cardRef.current });
    else if (p === "reveal") { if (r < ROUNDS) sendRef.current("state", { phase: "card", round: r + 1, cardIdx: rand(SITUATION_CARDS.length) }); else sendRef.current("state", { phase: "reflection", round: r, cardIdx: cardRef.current }); }
    else if (p === "reflection") sendRef.current("state", { phase: "done", round: r, cardIdx: cardRef.current });
  }

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      setPhase(payload.phase); setRound(payload.round); setCardIdx(payload.cardIdx);
      setReady(new Set()); setSecs(DUR[payload.phase] ?? 0); advancedRef.current = null;
      if (payload.phase === "card") setPicks({});
    });
    ch.on("broadcast", { event: "ready" }, ({ payload }) => { if (payload.phase !== phaseRef.current) return; setReady((s) => new Set(s).add(payload.key)); });
    ch.on("broadcast", { event: "pick" }, ({ payload }) => setPicks((p) => ({ ...p, [payload.key]: payload.type })));
  };

  const room = useGameRoom("oc", bind);
  sendRef.current = room.send;

  useEffect(() => {
    if (phase === "lobby" || phase === "done") return;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (!room.isHost || phase === "lobby" || phase === "done") return;
    const tag = phase + round; if (advancedRef.current === tag) return;
    const readyAll = room.players.length > 0 && room.players.every((p) => ready.has(p.key));
    if (readyAll || secs <= 0) { advancedRef.current = tag; advance(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, phase, round, ready, room.players, room.isHost]);

  function start() { room.send("state", { phase: "framing", round: 1, cardIdx: 0 }); }
  function clickReady() { room.send("ready", { key: room.clientId, phase }); }
  function pick(t: ReactionType) { setPicks((p) => ({ ...p, [room.clientId]: t })); room.send("pick", { key: room.clientId, type: t }); }

  const card = SITUATION_CARDS[cardIdx];
  const myPick = picks[room.clientId];
  const iReady = ready.has(room.clientId);
  const count = (t: ReactionType) => Object.values(picks).filter((x) => x === t).length;

  const readyRow = (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
      <span>{ready.size} of {room.players.length} ready</span><span style={{ color: secs <= 15 ? "var(--danger)" : "var(--text-secondary)" }}>⏱️ {mmss(secs)}</span>
    </div>
  );
  const readyBtn = (label: string) => (
    <button onClick={clickReady} disabled={iReady} style={{ ...primaryBtn, marginTop: 14, width: "100%", opacity: iReady ? 0.5 : 1, cursor: iReady ? "default" : "pointer" }}>{iReady ? "Ready ✓, waiting for the team" : label}</button>
  );

  return (
    <RoomShell room={room} game={GAMES.ownershipcards} emoji="🛡️" title="Ownership Cards, Live" accent={ACCENT} backTo="/app/module/performance"
      intro="Practice responsibility without blame. Fictional cards, no real confessions. You separate blame, self-blame and ownership."
      lobbyHint="Share the code with your team (ideal 3–6). Once everyone's in, the host starts." started={phase !== "lobby"} onStart={start} startLabel="Start framing">

      {phase === "framing" && (
        <Glass pad={26}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 14px" }}>Three stances</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FRAMING.map((f) => (
              <div key={f.type} style={{ padding: "13px 15px", borderRadius: 14, background: "rgba(255,255,255,0.6)", borderLeft: `4px solid ${TYPE_INFO[f.type].color}` }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 2 }}>{TYPE_INFO[f.type].sign} {f.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.45 }}>{f.line}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.04)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>{SAFETY_NOTE}</div>
          {readyBtn("Ready for the first card")}
          {readyRow}
        </Glass>
      )}

      {phase === "card" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-secondary)" }}>Card {round} of {ROUNDS} · fictional</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: secs <= 15 ? "var(--danger)" : "var(--text-primary)" }}>⏱️ {mmss(secs)}</span>
          </div>
          <Glass pad={26} style={{ borderTop: `5px solid ${ACCENT_DEEP}` }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--text-primary)", lineHeight: 1.4, margin: "0 0 16px" }}>{card.situation}</p>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Your first impulse, honestly</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TYPES.map((t) => <button key={t} onClick={() => pick(t)} style={{ textAlign: "left", padding: "12px 15px", borderRadius: 13, cursor: "pointer", border: myPick === t ? `1.5px solid ${TYPE_INFO[t].color}` : "1px solid var(--border-default)", background: myPick === t ? "rgba(28,26,23,0.04)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.4 }}>“{card.reactions[t]}”</button>)}
            </div>
          </Glass>
          {readyBtn("Reveal")}
          {readyRow}
        </>
      )}

      {phase === "reveal" && (
        <Glass pad={26}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.45 }}>{card.situation}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TYPES.map((t) => {
              const info = TYPE_INFO[t]; const hi = t === "ownership";
              return (
                <div key={t} style={{ padding: "14px 16px", borderRadius: 14, background: hi ? "rgba(92,163,150,0.12)" : "rgba(255,255,255,0.55)", border: hi ? `1.5px solid ${ACCENT_DEEP}` : "1px solid var(--border-default)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: info.color }}>{info.sign} {info.label}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{count(t)}× in the team</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", margin: "0 0 6px", lineHeight: 1.45 }}>“{card.reactions[t]}”</p>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>{info.note}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", textAlign: "center", margin: "12px 0 0" }}>No right or wrong, no ranking. Just raising awareness.</div>
          {readyBtn(round < ROUNDS ? "Next card" : "To reflection")}
          {readyRow}
        </Glass>
      )}

      {phase === "reflection" && (
        <Glass pad={28}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 12px" }}>Reflection</h2>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(92,163,150,0.12)", border: `1.5px solid ${ACCENT}`, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 16 }}>{FORMULA.sentence}</div>
          {REFLECTIONS.map((q, i) => <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.45 }}><span style={{ color: ACCENT_DEEP, fontWeight: 700 }}>{i + 1}.</span> {q}</div>)}
          {readyBtn("Wrap up")}
          {readyRow}
        </Glass>
      )}

      {phase === "done" && (
        <Glass pad={30} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42 }}>🌱</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "8px 0 8px" }}>Ownership practiced</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 22px" }}>Responsibility without blame. See your part, learn, take a step. Take the stance with you into everyday life.</p>
          {room.isHost && <button onClick={start} style={primaryBtn}>New round</button>}
        </Glass>
      )}
    </RoomShell>
  );
}
