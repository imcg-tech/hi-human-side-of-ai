import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { MODULES } from "../../data/modules";
import { TOPIC_LEVELS, RULES, SPECTATOR_TASK, REFLECTIONS } from "../../data/translateThis";
import { primaryBtn, ghostBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";

const ACCENT = MODULES.find((m) => m.id === "communication")?.color ?? "var(--candy-yellow)";
const ACCENT_DEEP = "var(--candy-yellow-deep)";
const SPEAK = 120;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Phase = "lobby" | "speaking" | "mirroring" | "switch" | "reflection" | "done";

export default function TranslateThisLive() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [round, setRound] = useState(1);
  const [roleA, setRoleA] = useState("");
  const [roleB, setRoleB] = useState("");
  const [topic, setTopic] = useState("");
  const [mirror, setMirror] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [secs, setSecs] = useState(0);
  const [level, setLevel] = useState(0);

  const phaseRef = useRef<Phase>("lobby");
  const roundRef = useRef(1);
  const rolesRef = useRef({ a: "", b: "" });
  const sendRef = useRef<(e: string, p: Record<string, unknown>) => void>(() => {});
  const clientIdRef = useRef("");
  useEffect(() => { phaseRef.current = phase; roundRef.current = round; rolesRef.current = { a: roleA, b: roleB }; }, [phase, round, roleA, roleB]);

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      setPhase(payload.phase); setRound(payload.round); setRoleA(payload.roleA); setRoleB(payload.roleB);
      if (payload.phase === "speaking") { setTopic(""); setMirror(""); setAttempts(0); setSecs(SPEAK); }
    });
    ch.on("broadcast", { event: "set" }, ({ payload }) => setTopic(payload.topic));
    ch.on("broadcast", { event: "mirror" }, ({ payload }) => { if (payload.from !== clientIdRef.current) setMirror(payload.value); });
    ch.on("broadcast", { event: "retry" }, () => { setAttempts((a) => a + 1); setMirror(""); });
  };

  const room = useGameRoom("tt", bind);
  clientIdRef.current = room.clientId;
  sendRef.current = room.send;

  useEffect(() => {
    if (phase !== "speaking" || !topic) return;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase, topic]);

  function start() {
    const ps = room.players;
    if (ps.length < 2) return;
    room.send("state", { phase: "speaking", round: 1, roleA: ps[0].key, roleB: ps[1].key });
  }
  const speakerKey = round === 1 ? roleA : roleB;
  const listenerKey = round === 1 ? roleB : roleA;
  const iAmSpeaker = room.clientId === speakerKey;
  const iAmListener = room.clientId === listenerKey;
  const nameOf = (k: string) => room.players.find((p) => p.key === k)?.name ?? "…";

  function pickTopic(t: string) { setTopic(t); room.send("set", { topic: t }); }
  function toMirroring() { room.send("state", { phase: "mirroring", round, roleA, roleB }); }
  function editMirror(v: string) { setMirror(v); room.send("mirror", { value: v, from: room.clientId }); }
  function rateGood() { room.send("state", { phase: round === 1 ? "switch" : "reflection", round, roleA, roleB }); }
  function rateRetry() { room.send("retry", {}); }
  function toRound2() { room.send("state", { phase: "speaking", round: 2, roleA, roleB }); }
  function toDone() { room.send("state", { phase: "done", round, roleA, roleB }); }

  const ta: React.CSSProperties = { width: "100%", boxSizing: "border-box", resize: "vertical", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 };
  const roleTag = (label: string, active: boolean) => (
    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", color: active ? "var(--ink-fill)" : "var(--text-secondary)", background: active ? ACCENT : "rgba(28,26,23,0.06)", padding: "4px 11px", borderRadius: 999 }}>{label}</span>
  );

  return (
    <RoomShell room={room} game={GAMES.translatethis} emoji="🔁" title="Translate This, Live" accent={ACCENT} backTo="/app/module/communication"
      intro="Active listening: one person talks, the other summarizes before replying. You only move on once it's right. Then swap roles."
      lobbyHint="Ideal for two. Additional people watch and give meta-feedback afterwards." started={phase !== "lobby"} onStart={start} startLabel="Start pair">

      {phase === "speaking" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {roleTag(`${nameOf(speakerKey)} talks`, true)}
              {roleTag(`${nameOf(listenerKey)} listens`, false)}
            </div>
            {topic && <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: secs <= 20 ? "var(--danger)" : "var(--text-primary)" }}>⏱️ {mmss(secs)}</span>}
          </div>

          {!topic ? (
            iAmSpeaker ? (
              <Glass pad={26}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: "0 0 4px" }}>Pick your topic</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>You decide how open you want to be.</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {TOPIC_LEVELS.map((l, i) => <button key={l.key} onClick={() => setLevel(i)} style={{ padding: "7px 14px", borderRadius: 999, cursor: "pointer", border: level === i ? `1.5px solid ${ACCENT_DEEP}` : "1.5px solid var(--border-strong)", background: level === i ? ACCENT : "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: level === i ? 600 : 400, color: level === i ? "var(--ink-fill)" : "var(--text-secondary)" }}>{l.label}</button>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TOPIC_LEVELS[level].prompts.map((p) => <button key={p} onClick={() => pickTopic(p)} style={{ textAlign: "left", padding: "12px 15px", borderRadius: 13, cursor: "pointer", border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.62)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.4 }}>{p}</button>)}
                </div>
              </Glass>
            ) : (
              <Glass pad={28}><p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>{nameOf(speakerKey)} is picking a topic …</p></Glass>
            )
          ) : (
            <Glass pad={26} style={{ borderTop: `5px solid ${ACCENT_DEEP}` }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Topic</div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--text-primary)", lineHeight: 1.4, margin: "0 0 16px" }}>{topic}</p>
              {iAmSpeaker ? (
                <>
                  <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5 }}>{RULES.speaker}</div>
                  <button onClick={toMirroring} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>Done, {nameOf(listenerKey)} summarizes <Icon name="arrowRight" size={18} /></button>
                </>
              ) : iAmListener ? (
                <div style={{ padding: "16px", borderRadius: 12, background: "rgba(28,26,23,0.05)", textAlign: "center" }}>
                  <div style={{ fontSize: 30 }}>👂</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "6px 0 3px" }}>Just listen</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>{RULES.listener} No note-taking, be fully present.</div>
                </div>
              ) : (
                <div style={{ padding: "13px 15px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>Spectator task: {SPECTATOR_TASK}</div>
              )}
            </Glass>
          )}
        </>
      )}

      {phase === "mirroring" && (
        <Glass pad={26}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", margin: 0 }}>Mirror it back</h2>
            {attempts > 0 && <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>Attempt {attempts + 1}</span>}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>Topic: {topic}</p>

          {iAmListener ? (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 6 }}>“What I hear is …”</div>
              <textarea value={mirror} onChange={(e) => editMirror(e.target.value)} placeholder="Summarize in your own words, without judging …" style={{ ...ta, minHeight: 90 }} />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>{nameOf(speakerKey)} confirms whether it's on point.</p>
            </>
          ) : (
            <>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)", minHeight: 60, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.5 }}>
                {mirror ? `“${mirror}”` : <span style={{ color: "var(--text-muted)" }}>{nameOf(listenerKey)} is typing …</span>}
              </div>
              {iAmSpeaker && (
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button onClick={rateRetry} disabled={!mirror.trim()} style={{ ...ghostBtn, flex: 1, opacity: mirror.trim() ? 1 : 0.5 }}>Not quite</button>
                  <button onClick={rateGood} disabled={!mirror.trim()} style={{ ...primaryBtn, flex: 1, opacity: mirror.trim() ? 1 : 0.5 }}>Yes, exactly <Icon name="check" size={17} /></button>
                </div>
              )}
              {attempts >= 3 && iAmSpeaker && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>A few attempts already. Feel free to say directly what you meant, that's the learning moment about the gap.</p>}
            </>
          )}
        </Glass>
      )}

      {phase === "switch" && (
        <Glass pad={30} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🔁</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", margin: "8px 0 6px" }}>Swap roles</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>Now {nameOf(roleB)} talks, {nameOf(roleA)} listens. New topic.</p>
          <button onClick={toRound2} style={primaryBtn}>Next <Icon name="arrowRight" size={18} /></button>
        </Glass>
      )}

      {phase === "reflection" && (
        <Glass pad={28}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 4px" }}>Reflection</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>Talk about it briefly, optional:</p>
          {REFLECTIONS.map((q, i) => <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.45 }}><span style={{ color: ACCENT_DEEP, fontWeight: 700 }}>{i + 1}.</span> {q}</div>)}
          <button onClick={toDone} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>Wrap up <Icon name="arrowRight" size={18} /></button>
        </Glass>
      )}

      {phase === "done" && (
        <Glass pad={30} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42 }}>🤝</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "8px 0 8px" }}>Nicely mirrored</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 22px" }}>Listening means understanding, not answering. Take a bit more mirroring into your workday.</p>
          {room.isHost && <button onClick={start} style={primaryBtn}>New round</button>}
        </Glass>
      )}
    </RoomShell>
  );
}
