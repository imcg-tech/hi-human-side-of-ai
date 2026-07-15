import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, supabaseReady } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Glass } from "../../components/ds";
import Icon from "../../components/Icon";
import { MODULES } from "../../data/modules";
import { CG_QUESTIONS, type CGQuestion } from "../../data/commonGround";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import GameBrief from "./GameBrief";
import { GAMES } from "../../data/games";

const NUM = 3;
const PLACE_TIME = 45; // seconds fallback per round
const REVEAL_TIME = 30;
const ACCENT = MODULES.find((m) => m.id === "bonding")?.color ?? "var(--brand)";
const code4 = () => Math.random().toString(36).slice(2, 6).toUpperCase();

function pickOrder(): number[] {
  const idx = CG_QUESTIONS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, NUM);
}

type Phase = "lobby" | "place" | "reveal" | "done";
interface Player { key: string; name: string; host: boolean }

export default function CommonGroundLive() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const clientId = useMemo(() => crypto.randomUUID(), []);
  const defaultName = (session?.user?.email?.split("@")[0]) || ("Guest-" + clientId.slice(0, 4));
  const [name, setName] = useState(defaultName);

  const [view, setView] = useState<"menu" | "room">("menu");
  const [isHost, setIsHost] = useState(false);
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [dots, setDots] = useState<Record<string, number>>({});
  const [myPos, setMyPos] = useState<number | null>(null);
  const [ready, setReady] = useState<Set<string>>(new Set());
  const [secs, setSecs] = useState(0);
  const chan = useRef<RealtimeChannel | null>(null);
  const phaseRef = useRef<Phase>("lobby");
  const qIndexRef = useRef(0);
  const advancedRef = useRef<string | null>(null);

  useEffect(() => { phaseRef.current = phase; qIndexRef.current = qIndex; }, [phase, qIndex]);
  useEffect(() => () => { if (chan.current) supabase.removeChannel(chan.current); }, []);

  // per-round countdown (display); host uses it as a fallback to advance
  useEffect(() => {
    if (phase !== "place" && phase !== "reveal") return;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase, qIndex]);

  // host advances when everyone is ready OR the timer runs out
  useEffect(() => {
    if (!isHost || (phase !== "place" && phase !== "reveal")) return;
    const tag = `${phase}:${qIndex}`;
    if (advancedRef.current === tag) return;
    const readyAll = players.length > 0 && players.every((p) => ready.has(p.key));
    if (readyAll || secs <= 0) { advancedRef.current = tag; advance(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, phase, qIndex, players, ready, secs]);

  function connect(roomCode: string, asHost: boolean) {
    const channel = supabase.channel(`cg:${roomCode}`, { config: { presence: { key: clientId }, broadcast: { self: true } } });
    channel.on("presence", { event: "sync" }, () => {
      const st = channel.presenceState() as Record<string, { name: string; host: boolean }[]>;
      setPlayers(Object.entries(st).map(([key, arr]) => ({ key, name: arr[0]?.name ?? "?", host: !!arr[0]?.host })));
    });
    channel.on("broadcast", { event: "phase" }, ({ payload }) => {
      setOrder(payload.order); setQIndex(payload.qIndex); setPhase(payload.phase);
      setReady(new Set());
      advancedRef.current = null;
      setSecs(payload.phase === "place" ? PLACE_TIME : payload.phase === "reveal" ? REVEAL_TIME : 0);
      if (payload.reset) { setDots({}); setMyPos(null); }
    });
    channel.on("broadcast", { event: "place" }, ({ payload }) => {
      if (payload.qIndex !== qIndexRef.current) return;
      setDots((d) => ({ ...d, [payload.key]: payload.pos }));
    });
    channel.on("broadcast", { event: "ready" }, ({ payload }) => {
      if (payload.qIndex !== qIndexRef.current || payload.phase !== phaseRef.current) return;
      setReady((s) => { const n = new Set(s); n.add(payload.key); return n; });
    });
    channel.subscribe(async (status) => { if (status === "SUBSCRIBED") await channel.track({ name: name.trim() || defaultName, host: asHost }); });
    chan.current = channel;
  }

  function createRoom() { const c = code4(); setCode(c); setIsHost(true); setPhase("lobby"); setView("room"); connect(c, true); }
  function joinRoom() { const c = joinCode.trim().toUpperCase(); if (c.length < 4) return; setCode(c); setIsHost(false); setPhase("lobby"); setView("room"); connect(c, false); }
  const sendPhase = (p: Record<string, unknown>) => chan.current?.send({ type: "broadcast", event: "phase", payload: p });

  function startGame() { sendPhase({ order: pickOrder(), qIndex: 0, phase: "place", reset: true }); }
  function place(pos: number) { setMyPos(pos); chan.current?.send({ type: "broadcast", event: "place", payload: { key: clientId, pos, qIndex } }); }
  function clickReady() {
    if (phase === "place" && myPos === null) return;
    chan.current?.send({ type: "broadcast", event: "ready", payload: { key: clientId, qIndex, phase } });
  }
  function advance() {
    if (phaseRef.current === "place") sendPhase({ order, qIndex, phase: "reveal" });
    else if (phaseRef.current === "reveal") {
      if (qIndex < NUM - 1) sendPhase({ order, qIndex: qIndex + 1, phase: "place", reset: true });
      else sendPhase({ order, qIndex, phase: "done" });
    }
  }

  const q: CGQuestion | null = order.length ? CG_QUESTIONS[order[qIndex]] : null;
  const teamDots = Object.entries(dots).filter(([k]) => k !== clientId).map(([, v]) => v);
  const all = myPos !== null ? [...teamDots, myPos] : teamDots;
  const spread = all.length ? Math.max(...all) - Math.min(...all) : 0;
  const comment = spread < 28 ? "You're close together 👀" : spread > 60 ? "Big spread! This is exactly where the conversation pays off." : "There are clear differences, who's sitting at the edges?";

  function trackClick(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    place(Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))));
  }

  if (!supabaseReady) {
    return (
      <div style={{ height: "100%", padding: "8px 4px" }}>
        <button onClick={() => navigate("/app/module/bonding")} style={backBtn}><Icon name="arrowLeft" size={16} /> Bonding</button>
        <div style={{ maxWidth: 520, margin: "40px auto" }}><Glass pad={32}><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: 0 }}>Live mode needs login</h2><p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", marginTop: 10 }}>Sign in first, then you can play together.</p></Glass></div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate("/app/module/bonding")} style={backBtn}><Icon name="arrowLeft" size={16} /> Bonding</button>

      {/* ── Menu: create / join ── */}
      {view === "menu" && (
        <div style={{ maxWidth: 520, margin: "auto", width: "100%" }}>
          <Glass pad={34}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: ACCENT, display: "grid", placeItems: "center", fontSize: 30 }}>🎚️</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", margin: "14px 0 2px" }}>Common Ground, Live</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.55, margin: "10px 0 4px" }}>Play together: everyone positions themselves anonymously on the scale, and the spread is revealed together.</p>
            <div style={{ margin: "0 0 20px" }}><GameBrief g={GAMES.commonground} accent={ACCENT} /></div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7 }}>Your name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ width: "100%", height: 48, padding: "0 16px", marginBottom: 16, borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            <button onClick={createRoom} style={{ ...primaryBtn, width: "100%" }}>Create room <Icon name="arrowRight" size={18} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-default)" }} /><span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>or join</span><div style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={4} style={{ flex: 1, height: 50, padding: "0 18px", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "0.15em", textAlign: "center", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
              <button onClick={joinRoom} style={ghostBtn}>Join</button>
            </div>
          </Glass>
        </div>
      )}

      {/* ── Room ── */}
      {view === "room" && (
        <div style={{ maxWidth: 640, margin: "auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Room <span style={{ letterSpacing: "0.15em", color: ACCENT }}>{code}</span></span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{players.length} {players.length === 1 ? "person" : "people"}</span>
          </div>

          {phase === "lobby" && (
            <Glass pad={28}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", marginBottom: 4 }}>Lobby</div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 16px" }}>Share the code <strong>{code}</strong> with your team. Whoever joins appears here.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {players.map((p) => (
                  <span key={p.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>{p.host ? "👑" : "🙂"} {p.name}{p.key === clientId ? " (you)" : ""}</span>
                ))}
              </div>
              {isHost ? (
                <button onClick={startGame} style={{ ...primaryBtn, width: "100%" }}>Start game <Icon name="arrowRight" size={18} /></button>
              ) : (
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-muted)", textAlign: "center" }}>Waiting for the host to start …</div>
              )}
            </Glass>
          )}

          {(phase === "place" || phase === "reveal") && q && (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{q.theme} · Question {qIndex + 1} / {NUM}</div>
              <Glass pad={28}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: "var(--text-primary)", lineHeight: 1.25, margin: "0 0 22px" }}>{q.q}</h2>

                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                  <span style={{ maxWidth: "45%" }}>◀ {q.left}</span><span style={{ maxWidth: "45%", textAlign: "right" }}>{q.right} ▶</span>
                </div>
                <div style={{ position: "relative", height: 56, borderRadius: 16, background: "rgba(28,26,23,0.05)", border: "1px solid var(--border-default)" }}>
                  <div onClick={phase === "place" ? trackClick : undefined} style={{ position: "absolute", left: 16, right: 16, top: 0, bottom: 0, cursor: phase === "place" ? "pointer" : "default" }}>
                    <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: "rgba(28,26,23,0.14)", borderRadius: 2 }} />
                    {phase === "reveal" && teamDots.map((p, i) => (
                      <span key={i} style={{ position: "absolute", top: "50%", left: `${p}%`, transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "rgba(60,55,48,0.45)", border: "2px solid rgba(255,255,255,0.8)" }} />
                    ))}
                    {myPos !== null && (
                      <span style={{ position: "absolute", top: "50%", left: `${myPos}%`, transform: "translate(-50%,-50%)", width: 26, height: 26, borderRadius: "50%", background: ACCENT, border: "2.5px solid #fff", boxShadow: "var(--shadow-sm)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9, color: "var(--ink-fill)", zIndex: 2 }}>You</span>
                    )}
                  </div>
                </div>

                {phase === "place" ? (
                  <>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: "14px 0 0" }}>{myPos === null ? "Tap on the scale to position yourself." : "Adjustable, confirm when you're done."}</p>
                    <button onClick={clickReady} disabled={myPos === null || ready.has(clientId)} style={{ ...primaryBtn, marginTop: 14, width: "100%", opacity: myPos === null || ready.has(clientId) ? 0.5 : 1, cursor: myPos === null || ready.has(clientId) ? "default" : "pointer" }}>
                      {ready.has(clientId) ? "Ready ✓, waiting for the team" : "Ready, reveal"} {!ready.has(clientId) && <Icon name="check" size={17} />}
                    </button>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span>{ready.size} of {players.length} ready</span><span style={{ color: secs <= 10 ? "var(--danger)" : "var(--text-secondary)" }}>⏱️ {secs}s</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.5 }}>{comment}</div>
                    <button onClick={clickReady} disabled={ready.has(clientId)} style={{ ...primaryBtn, marginTop: 14, width: "100%", opacity: ready.has(clientId) ? 0.5 : 1, cursor: ready.has(clientId) ? "default" : "pointer" }}>
                      {ready.has(clientId) ? "Ready ✓, waiting for the team" : (qIndex < NUM - 1 ? "Next" : "Wrap up")} {!ready.has(clientId) && <Icon name="arrowRight" size={17} />}
                    </button>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span>{ready.size} of {players.length} ready</span><span style={{ color: secs <= 10 ? "var(--danger)" : "var(--text-secondary)" }}>⏱️ {secs}s</span>
                    </div>
                  </>
                )}
              </Glass>
            </>
          )}

          {phase === "done" && (
            <Glass pad={32}>
              <div style={{ fontSize: 42 }}>🎚️</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 6px" }}>Discovered together</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.6, margin: "0 0 22px" }}>The same terms mean something different to everyone. That very spread is the conversation starter.</p>
              <button onClick={() => navigate("/app/module/bonding")} style={primaryBtn}>Back to the module</button>
            </Glass>
          )}
        </div>
      )}
    </div>
  );
}
