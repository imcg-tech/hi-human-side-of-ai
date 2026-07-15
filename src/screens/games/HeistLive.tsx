import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { primaryBtn, ghostBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";
import { HEIST, HEIST_DEBRIEF, normalizeAnswer } from "../../data/heist";

const ACCENT = "var(--candy-peri)";
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

type Phase = "lobby" | "play" | "escaped" | "timeup";

export default function HeistLive() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [roomIdx, setRoomIdx] = useState(0);
  const [order, setOrder] = useState<string[]>([]);
  const [startAt, setStartAt] = useState(0);
  const [secs, setSecs] = useState(HEIST.durationSecs);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const clientIdRef = useRef("");
  const isHostRef = useRef(false);
  const phaseRef = useRef<Phase>("lobby");
  const roomIdxRef = useRef(0);
  const sendRef = useRef<(e: string, p: Record<string, unknown>) => void>(() => {});
  useEffect(() => { phaseRef.current = phase; roomIdxRef.current = roomIdx; }, [phase, roomIdx]);

  function validateGuess(ans: string) {
    const r = HEIST.rooms[roomIdxRef.current];
    if (normalizeAnswer(ans) === normalizeAnswer(r.answer)) {
      if (roomIdxRef.current + 1 >= HEIST.rooms.length) setPhase("escaped");
      else { setRoomIdx(roomIdxRef.current + 1); }
    } else sendRef.current("wrong", { roomIdx: roomIdxRef.current });
  }

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      if (payload.from === clientIdRef.current) return;
      setPhase(payload.phase); setRoomIdx(payload.roomIdx); setOrder(payload.order); setStartAt(payload.startAt);
      setShowHint(false); setWrong(false); setAnswer("");
    });
    ch.on("broadcast", { event: "wrong" }, ({ payload }) => {
      if (payload.roomIdx !== roomIdxRef.current) return;
      setWrong(true); setTimeout(() => setWrong(false), 1200);
    });
    ch.on("broadcast", { event: "guess" }, ({ payload }) => {
      if (!isHostRef.current || payload.roomIdx !== roomIdxRef.current || phaseRef.current !== "play") return;
      validateGuess(payload.answer);
    });
  };

  const room = useGameRoom("he", bind);
  clientIdRef.current = room.clientId;
  isHostRef.current = room.isHost;
  sendRef.current = room.send;

  // Host = Quelle der Wahrheit
  useEffect(() => {
    if (!room.isHost || phase === "lobby") return;
    room.send("state", { from: room.clientId, phase, roomIdx, order, startAt });
    setShowHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roomIdx, startAt, room.isHost]);

  useEffect(() => {
    if (phase !== "play" || !startAt) return;
    const tick = () => {
      const left = HEIST.durationSecs - Math.floor((Date.now() - startAt) / 1000);
      setSecs(left);
      if (left <= 0 && room.isHost && phaseRef.current === "play") setPhase("timeup");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, startAt, room.isHost]);

  function start() { setOrder(room.players.map((p) => p.key)); setRoomIdx(0); setStartAt(Date.now()); setAnswer(""); setShowHint(false); setPhase("play"); }
  function submit() { const a = answer.trim(); if (!a) return; room.send("guess", { answer: a, roomIdx, from: room.clientId }); setAnswer(""); }

  const roleIndex = Math.max(0, order.indexOf(room.clientId));
  const r = HEIST.rooms[roomIdx];

  return (
    <RoomShell room={room} game={GAMES.heist} emoji="🔓" title="The Heist, Live" accent={ACCENT} backTo="/app/module/bonding"
      intro={HEIST.story} lobbyHint="Everyone sees only part of the clues (ideal 3–6). Only together do you get out. Voice recommended." started={phase !== "lobby"} onStart={start} startLabel="Start the breakout">

      {phase === "play" && r && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{r.name}</span>
            <span style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Room {roomIdx + 1}/{HEIST.rooms.length}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: secs <= 60 ? "var(--danger)" : "var(--text-primary)" }}>⏱️ {mmss(secs)}</span>
            </span>
          </div>

          {/* dein Hinweis-Fragment */}
          <Glass pad={24} style={{ borderLeft: `5px solid ${ACCENT}` }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Only you see this</div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--text-primary)", lineHeight: 1.4, margin: 0 }}>{r.clues[roleIndex % r.clues.length]}</p>
          </Glass>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "12px 0 16px" }}>The others see something different, tell each other what you have.</p>

          {/* gemeinsame Lösung */}
          <Glass pad={22}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 10 }}>{r.prompt}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Your answer …"
                style={{ flex: 1, height: 46, padding: "0 14px", borderRadius: 12, border: `1.5px solid ${wrong ? "var(--danger)" : "var(--border-strong)"}`, background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: "0.06em", textAlign: "center", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} />
              <button onClick={submit} disabled={!answer.trim()} style={{ ...primaryBtn, height: 46, padding: "0 20px", opacity: answer.trim() ? 1 : 0.5 }}>Solve</button>
            </div>
            {wrong && <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--danger)", marginTop: 8 }}>Not yet, put your clues together.</div>}
            <button onClick={() => setShowHint((v) => !v)} style={{ ...ghostBtn, height: 36, padding: "0 14px", fontSize: 13, marginTop: 12 }}>{showHint ? "Hide hint" : "💡 Stuck? Hint"}</button>
            {showHint && <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.5 }}>{r.hint}</div>}
          </Glass>
        </>
      )}

      {(phase === "escaped" || phase === "timeup") && (
        <Glass pad={32} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46 }}>{phase === "escaped" ? "🎉" : "⏳"}</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 6px" }}>{phase === "escaped" ? "Escaped!" : "Time's up, so close!"}</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>{phase === "escaped" ? "Made it together, that's exactly what happens when you share knowledge instead of working alone." : "Not a hard failure. The journey counts."}</p>
          {phase === "timeup" && (
            <div style={{ textAlign: "left", background: "rgba(28,26,23,0.04)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 6 }}>Solutions</div>
              {HEIST.rooms.map((rm, i) => <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", padding: "2px 0" }}>{rm.name}: <strong>{rm.solution}</strong></div>)}
            </div>
          )}
          <div style={{ textAlign: "left", background: "rgba(28,26,23,0.04)", borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 6 }}>Quick debrief</div>
            {HEIST_DEBRIEF.map((q, i) => <div key={i} style={{ display: "flex", gap: 9, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45, padding: "3px 0" }}><span style={{ color: ACCENT, fontWeight: 700 }}>{i + 1}.</span> {q}</div>)}
          </div>
          {room.isHost ? <button onClick={start} style={primaryBtn}>Again</button> : <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)" }}>The host restarts.</div>}
        </Glass>
      )}
    </RoomShell>
  );
}
