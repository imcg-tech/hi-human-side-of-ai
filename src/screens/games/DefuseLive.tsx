import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { primaryBtn, ghostBtn } from "./gameStyles";
import { useGameRoom } from "./useGameRoom";
import { RoomShell } from "./RoomShell";
import { GAMES } from "../../data/games";
import { generateDevice, WIRE_COLORS, btnColorHex, MANUAL, DEBRIEF, type Module } from "../../data/defuse";

const ACCENT = "var(--candy-blue)";
const DURATION = 240;
const MAX_STRIKES = 3;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

type Phase = "lobby" | "active" | "defused" | "exploded";

export default function DefuseLive() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [device, setDevice] = useState<Module[]>([]); // nur Defuser/Host
  const [total, setTotal] = useState(0);
  const [solved, setSolved] = useState<number[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [startAt, setStartAt] = useState(0);
  const [secs, setSecs] = useState(DURATION);
  const [btnProg, setBtnProg] = useState<Record<number, number>>({});
  const [codeInput, setCodeInput] = useState<Record<number, string>>({});

  const clientIdRef = useRef("");
  const phaseRef = useRef<Phase>("lobby");
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const bind = (ch: RealtimeChannel) => {
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      if (payload.from === clientIdRef.current) return; // Host ignoriert eigene Broadcasts (Quelle der Wahrheit lokal)
      setPhase(payload.phase); setSolved(payload.solved); setStrikes(payload.strikes); setTotal(payload.total); setStartAt(payload.startAt);
    });
  };

  const room = useGameRoom("df", bind);
  clientIdRef.current = room.clientId;
  const isDefuser = room.isHost;

  // Host = Quelle der Wahrheit → broadcastet Zustand an die Experten
  useEffect(() => {
    if (!isDefuser || phase === "lobby") return;
    room.send("state", { from: room.clientId, phase, solved, strikes, total, startAt, duration: DURATION });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, solved, strikes, startAt, isDefuser]);

  // Timer (beide), Host beendet bei Ablauf
  useEffect(() => {
    if (phase !== "active" || !startAt) return;
    const tick = () => {
      const left = DURATION - Math.floor((Date.now() - startAt) / 1000);
      setSecs(left);
      if (left <= 0 && isDefuser && phaseRef.current === "active") setPhase("exploded");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, startAt, isDefuser]);

  // Auflösung / Explosion (Host)
  useEffect(() => {
    if (!isDefuser || phase !== "active") return;
    if (total > 0 && solved.length >= total) setPhase("defused");
    else if (strikes >= MAX_STRIKES) setPhase("exploded");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, strikes]);

  function start() {
    const dev = generateDevice("standard");
    setDevice(dev); setTotal(dev.length); setSolved([]); setStrikes(0); setBtnProg({}); setCodeInput({}); setStartAt(Date.now()); setPhase("active");
  }
  const markSolved = (i: number) => setSolved((s) => (s.includes(i) ? s : [...s, i]));
  const strike = () => setStrikes((s) => s + 1);

  function cutWire(i: number, wireIdx: number) {
    const m = device[i]; if (m.type !== "wire" || solved.includes(i)) return;
    if (wireIdx === m.solution) markSolved(i); else strike();
  }
  function pressButton(i: number, btnIdx: number) {
    const m = device[i]; if (m.type !== "buttons" || solved.includes(i)) return;
    const prog = btnProg[i] ?? 0;
    if (btnIdx === m.order[prog]) {
      const next = prog + 1;
      setBtnProg((p) => ({ ...p, [i]: next }));
      if (next >= m.order.length) markSolved(i);
    } else { setBtnProg((p) => ({ ...p, [i]: 0 })); strike(); }
  }
  function submitCode(i: number) {
    const m = device[i]; if (m.type !== "code" || solved.includes(i)) return;
    if ((codeInput[i] ?? "") === m.code) markSolved(i); else { strike(); setCodeInput((c) => ({ ...c, [i]: "" })); }
  }

  const lobbyHint = "The host is the defuser (sees the device). Everyone else is an expert (sees the manual). Talk, you don't see the same thing!";

  return (
    <RoomShell room={room} game={GAMES.defuse} emoji="💣" title="Defuse, Live" accent={ACCENT} backTo="/app/module/communication"
      intro="Asymmetric & under time pressure: one person sees the device, the others the manual. Only precise talking defuses it together (voice needed)."
      lobbyHint={lobbyHint} started={phase !== "lobby"} onStart={start} startLabel="Arm the device">

      {(phase === "active" || phase === "defused" || phase === "exploded") && (
        <>
          {/* gemeinsamer Status */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{isDefuser ? "🧤 You: defuser" : "📖 You: expert"}</span>
            <span style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: secs <= 30 ? "var(--danger)" : "var(--text-primary)" }}>⏱️ {mmss(secs)}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--danger)" }}>{"✕".repeat(strikes)}{"·".repeat(Math.max(0, MAX_STRIKES - strikes))}</span>
            </span>
          </div>

          {phase === "active" && isDefuser && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {device.map((m, i) => (
                <Glass key={i} pad={20} style={{ opacity: solved.includes(i) ? 0.6 : 1, borderTop: solved.includes(i) ? "4px solid var(--disc-s)" : `4px solid ${ACCENT}` }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Module {i + 1} {solved.includes(i) && "· ✅ solved"}</div>
                  {m.type === "wire" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {m.wires.map((w, wi) => (
                        <button key={wi} disabled={solved.includes(i)} onClick={() => cutWire(i, wi)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", cursor: solved.includes(i) ? "default" : "pointer" }}>
                          <span style={{ width: 34, height: 10, borderRadius: 3, background: WIRE_COLORS[w].hex, border: "1px solid rgba(0,0,0,0.15)" }} />
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>{wi + 1}. {WIRE_COLORS[w].label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {m.type === "buttons" && (
                    <>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {m.buttons.map((b, bi) => (
                          <button key={bi} disabled={solved.includes(i)} onClick={() => pressButton(i, bi)} style={{ width: 52, height: 52, borderRadius: 14, border: "2px solid rgba(0,0,0,0.12)", background: btnColorHex(b.color), color: b.color === "gelb" ? "#2A2722" : "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, cursor: solved.includes(i) ? "default" : "pointer" }}>{b.value}</button>
                        ))}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>{btnProg[i] ?? 0} / {m.order.length} correct</div>
                    </>
                  )}
                  {m.type === "code" && (
                    <>
                      <div style={{ display: "flex", gap: 14, fontSize: 34, marginBottom: 10 }}>{m.symbols.map((s, si) => <span key={si}>{s}</span>)}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input value={codeInput[i] ?? ""} onChange={(e) => setCodeInput((c) => ({ ...c, [i]: e.target.value.replace(/\D/g, "").slice(0, 3) }))} placeholder="3-digit code" disabled={solved.includes(i)} style={{ flex: 1, height: 44, padding: "0 14px", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "0.2em", textAlign: "center", outline: "none", boxSizing: "border-box" }} />
                        <button onClick={() => submitCode(i)} disabled={solved.includes(i) || (codeInput[i] ?? "").length < 3} style={{ ...ghostBtn, height: 44, padding: "0 16px" }}>Check</button>
                      </div>
                    </>
                  )}
                </Glass>
              ))}
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>Describe to the experts exactly what you see, they have the rules.</p>
            </div>
          )}

          {phase === "active" && !isDefuser && (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: solved.includes(i) ? "rgba(0,214,143,0.15)" : "rgba(28,26,23,0.05)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>Module {i + 1} {solved.includes(i) ? "✅" : "◻"}</span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {MANUAL.map((sec) => (
                  <Glass key={sec.type} pad={18}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 8 }}>{sec.title}</div>
                    {sec.rules.map((r, ri) => <div key={ri} style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45, padding: "2px 0" }}><span style={{ color: ACCENT }}>›</span> {r}</div>)}
                  </Glass>
                ))}
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>You can't see the device, ask precise questions and guide them.</p>
              </div>
            </>
          )}

          {(phase === "defused" || phase === "exploded") && (
            <Glass pad={32} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 46 }}>{phase === "defused" ? "🎉" : "💥"}</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 6px" }}>{phase === "defused" ? "Defused!" : "It went off, no drama"}</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>{phase === "defused" ? "Strong communication. That's exactly how precise talking under pressure works." : "It happens. The learning is in the talking, not the result."}</p>
              <div style={{ textAlign: "left", background: "rgba(28,26,23,0.04)", borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>Quick debrief</div>
                {DEBRIEF.map((q, i) => <div key={i} style={{ display: "flex", gap: 9, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.45, padding: "3px 0" }}><span style={{ color: ACCENT, fontWeight: 700 }}>{i + 1}.</span> {q}</div>)}
              </div>
              {isDefuser && <button onClick={start} style={primaryBtn}>Next device</button>}
              {!isDefuser && <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)" }}>The defuser starts the next device.</div>}
            </Glass>
          )}
        </>
      )}
    </RoomShell>
  );
}
