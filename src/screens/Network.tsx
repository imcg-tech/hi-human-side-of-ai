import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./Network.css";
import { useStore } from "../lib/store";
import { supabase, supabaseReady } from "../lib/supabase";
import { fetchSternMatches, fetchQuestionMatches, type SternMatch } from "../lib/sync";
import { DECK, BY_ID, MATES, colleagueAnswer, matchesFor, isRare, getDaily, type Question } from "../data/sternenwarteDeck";

const CATEGORIES = ["alltag", "essen", "reisen", "hobby", "arbeit", "persoenlichkeit", "popkultur", "tiere", "fun", "lifestyle", "saison"];
const CAT_LABEL: Record<string, string> = { alltag: "everyday", essen: "food", reisen: "travel", hobby: "hobbies", arbeit: "work", persoenlichkeit: "personality", popkultur: "pop culture", tiere: "animals", fun: "fun", lifestyle: "lifestyle", saison: "seasonal" };

type MiniMate = { key: string; name: string; initials: string; color: string };
type Conn = MiniMate & { strength: number; topic: string };
const PALETTE = ["var(--disc-d)", "var(--disc-i)", "var(--disc-s)", "var(--disc-c)", "#9ec9ff", "#ffd9a8"];
const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
const hashStr = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const colorFor = (id: string) => PALETTE[hashStr(id) % PALETTE.length];

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const N = 22;
const R = 3.2;

function buildScene() {
  const rnd = lcg(20260626);
  const people: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    people.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r).multiplyScalar(R * (0.85 + rnd() * 0.2)));
  }
  const companyPos = new Float32Array(N * 3);
  people.forEach((p, i) => { companyPos.set([p.x, p.y, p.z], i * 3); });
  const youPos = new Float32Array([0, 0, 0]);
  const mateNodes = people.slice(0, MATES.length); // first 6 = the named colleagues

  const meshLinks: number[] = [];
  for (let k = 0; k < 14; k++) {
    const a = Math.floor(rnd() * N), b = Math.floor(rnd() * N);
    if (a === b) continue;
    meshLinks.push(people[a].x, people[a].y, people[a].z, people[b].x, people[b].y, people[b].z);
  }
  const stars = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    const v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(10 + rnd() * 14);
    stars.set([v.x, v.y, v.z], i * 3);
  }
  return { mateNodes, companyPos, youPos, meshLinks: new Float32Array(meshLinks), stars };
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.8)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function Scene({ strengths, youSize }: { strengths: number[]; youSize: number }) {
  const data = useMemo(buildScene, []);
  const glow = useMemo(glowTexture, []);
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.04; });

  return (
    <>
      <color attach="background" args={["#0a0f16"]} />
      <fog attach="fog" args={["#0a0f16", 7, 18]} />
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.stars, 3]} /></bufferGeometry>
        <pointsMaterial size={0.07} color="#5b7da6" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
      </points>

      <group ref={group}>
        {/* commonality lines, opacity scales with strength (Nähe über Zeit) */}
        {data.mateNodes.map((p, i) => strengths[i] > 0 && (
          <lineSegments key={`${i}-${strengths[i]}`}>
            <bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([0, 0, 0, p.x, p.y, p.z]), 3]} /></bufferGeometry>
            <lineBasicMaterial color="#cfe4ff" transparent opacity={Math.min(0.3 + strengths[i] * 0.12, 0.95)} blending={THREE.AdditiveBlending} depthWrite={false} />
          </lineSegments>
        ))}
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.meshLinks, 3]} /></bufferGeometry>
          <lineBasicMaterial color="#4f79b0" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.companyPos, 3]} /></bufferGeometry>
          <pointsMaterial size={0.62} map={glow} color="#9ec9ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation alphaTest={0.001} />
        </points>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.youPos, 3]} /></bufferGeometry>
          <pointsMaterial size={youSize} map={glow} color="#ffffff" transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation alphaTest={0.001} />
        </points>
      </group>

      <OrbitControls enablePan={false} enableZoom autoRotate autoRotateSpeed={0.55} rotateSpeed={0.5} minDistance={5} maxDistance={12} />
    </>
  );
}

const labelOf = (qq: Question, optId: string) => qq.options.find((o) => o.id === optId)?.label ?? "";

export default function Network() {
  const navigate = useNavigate();
  const deckAnswers = useStore((s) => s.deckAnswers);
  const recordDeckAnswer = useStore((s) => s.recordDeckAnswer);
  const streakCurrent = useStore((s) => s.streakCurrent);
  const todayCount = useStore((s) => s.todayCount);

  const shuffledDeck = useMemo(() => shuffle(DECK), []);
  const today = new Date().toISOString().slice(0, 10);
  const daily = useMemo(() => getDaily(today), [today]);

  const [feedback, setFeedback] = useState<{ q: Question; optId: string; mates: MiniMate[]; rare: boolean } | null>(null);
  const [recent, setRecent] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState<"demo" | "real">("demo");
  const [realMatches, setRealMatches] = useState<SternMatch[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabaseReady) { setLoaded(true); return; }
    let on = true;
    fetchSternMatches().then((m) => { if (!on) return; setRealMatches(m); setLoaded(true); if (m.length > 0) setSource("real"); });
    return () => { on = false; };
  }, []);

  const totalAnswers = Object.keys(deckAnswers).length;
  const dailyAnswered = !!deckAnswers[daily.id];

  // current question: Daily first, then endless deck (preferring unanswered)
  const current: Question | null = dailyAnswered
    ? shuffledDeck.find((qq) => !deckAnswers[qq.id]) ?? null
    : daily;
  const isDaily = !dailyAnswered;

  // demo connections (deterministic mock colleagues)
  const demoConns: Conn[] = useMemo(() => MATES.map((m) => {
    const shared: Question[] = [];
    for (const [qid, opt] of Object.entries(deckAnswers)) { const qq = BY_ID[qid]; if (qq && colleagueAnswer(m.id, qq) === opt) shared.push(qq); }
    const last = shared[shared.length - 1];
    return { key: m.id, name: m.name, initials: m.initials, color: m.color, strength: shared.length, topic: last ? `${last.emoji} ${labelOf(last, deckAnswers[last.id])}` : "" };
  }).filter((c) => c.strength > 0).sort((a, b) => b.strength - a.strength), [deckAnswers]);

  // real connections (RPC aggregate over the team)
  const realConns: Conn[] = realMatches.map((m) => {
    const lastQid = m.sharedQuestions[m.sharedQuestions.length - 1];
    const qq = lastQid ? BY_ID[lastQid] : undefined;
    return { key: m.id, name: m.name, initials: initialsOf(m.name), color: colorFor(m.id), strength: m.strength, topic: qq && deckAnswers[qq.id] ? `${qq.emoji} ${labelOf(qq, deckAnswers[qq.id])}` : "" };
  });

  const connections = source === "real" ? realConns : demoConns;
  const maxStrength = Math.max(1, ...connections.map((c) => c.strength));
  const strengths = Array.from({ length: 6 }, (_, i) => connections[i]?.strength ?? 0);
  const youSize = 1.5 + Math.min(totalAnswers * 0.04, 1.3);

  async function answer(optId: string) {
    if (!current) return;
    const q = current;
    recordDeckAnswer(q.id, optId);
    if (source === "real") {
      const list = await fetchQuestionMatches(q.id, optId);
      const mates: MiniMate[] = list.map((p) => ({ key: p.id, name: p.name, initials: initialsOf(p.name), color: colorFor(p.id) }));
      setRecent(new Set(mates.map((m) => m.key)));
      setFeedback({ q, optId, mates, rare: mates.length === 1 });
      fetchSternMatches().then(setRealMatches);
    } else {
      const ms = matchesFor(q, optId);
      const mates: MiniMate[] = ms.map((m) => ({ key: m.id, name: m.name, initials: m.initials, color: m.color }));
      setRecent(new Set(mates.map((m) => m.key)));
      setFeedback({ q, optId, mates, rare: isRare(q, optId) });
    }
  }

  return (
    <div className="network">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 42 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
        <Scene strengths={strengths} youSize={youSize} />
      </Canvas>

      <div className="net-ui">
        <header className="net-top">
          <button className="net-back" onClick={() => navigate("/app")}>← Home</button>
          <div className="net-title">Company Star Map</div>
          <div className="net-legend">
            {supabaseReady && loaded && (
              <span className="net-toggle">
                <button className={source === "real" ? "on" : ""} onClick={() => setSource("real")}>Real{realMatches.length > 0 ? ` (${realMatches.length})` : ""}</button>
                <button className={source === "demo" ? "on" : ""} onClick={() => setSource("demo")}>Demo</button>
              </span>
            )}
            {streakCurrent > 0 && <span className="net-streak">🔥 {streakCurrent} {streakCurrent === 1 ? "day" : "days"}</span>}
            <span><i className="dot you" /> you</span>
            <span><i className="line" /> in common</span>
          </div>
        </header>

        {/* right card, commonalities by strength */}
        <aside className="net-glass net-side">
          <div className="net-side-head">
            <h3>What you share</h3>
            <span className="count">{connections.length}</span>
          </div>
          <div className="net-list">
            {connections.length === 0 ? (
              <div className="net-empty">{source === "real" ? "No matches yet, as soon as colleagues answer the same questions, stars light up here ✨" : "Answer a few questions to connect your first stars ✨"}</div>
            ) : connections.map((c) => (
              <div key={c.key} className={`net-common${recent.has(c.key) ? " is-new" : ""}`}>
                <span className="avatar" style={{ background: c.color }}>{c.initials}</span>
                <div className="c-body">
                  <div className="c-label">{c.name}{recent.has(c.key) && <span className="badge-new">new</span>}</div>
                  <div className="strength-row">
                    <div className="strength-bar"><div style={{ width: `${(c.strength / maxStrength) * 100}%` }} /></div>
                    <span className="strength-n">{c.strength}×</span>
                  </div>
                  <div className="c-topic">{c.topic}</div>
                  <button className="c-reach" onClick={() => navigate(`/app/balance/reachout?name=${encodeURIComponent(c.name)}&topic=${encodeURIComponent(c.topic.replace(/^\S+\s+/, ""))}`)}>👋 Reach out</button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* bottom card, daily + endless deck */}
        <section className="net-glass net-q">
          {feedback ? (
            <div className="net-answered">
              <div className="a-text">
                {feedback.mates.length === 0 ? (
                  <>😎 "{labelOf(feedback.q, feedback.optId)}", that makes you unique in the team right now.</>
                ) : feedback.rare ? (
                  <>✨ Rare match! Only you &amp; <span className="a-mates"><Avatar m={feedback.mates[0]} /></span> on "{labelOf(feedback.q, feedback.optId)}".</>
                ) : (
                  <>✨ {feedback.mates.length} {feedback.mates.length === 1 ? "person sees" : "colleagues see"} it that way too!<span className="a-mates">{feedback.mates.map((m) => <Avatar key={m.key} m={m} />)}</span></>
                )}
              </div>
              <button className="net-next" onClick={() => setFeedback(null)}>Next <span>→</span></button>
            </div>
          ) : current ? (
            <>
              <div className="net-q-top">
                {isDaily ? <span className="net-q-kicker net-daily">⭐ Question of the day</span> : <span className="net-q-kicker">Discover what you share</span>}
                <span className="net-q-count">🌟 {todayCount} answered today</span>
              </div>
              <h2 className="net-q-text">{current.emoji} {current.text}</h2>
              <div className="net-opts">
                {current.options.map((o) => (
                  <button key={o.id} className="net-opt" onClick={() => answer(o.id)}>{o.label}</button>
                ))}
              </div>
            </>
          ) : (
            <div className="net-answered">
              <div className="a-text">🌟 You've been through them all, nice! Check back tomorrow for a new question of the day.</div>
            </div>
          )}
        </section>

        {/* bottom-right, propose a community question */}
        <aside className="net-glass net-add">
          <div className="a-h">💡 Got a question?</div>
          <div className="a-sub">Add a question to the deck. It's quickly reviewed and could even become question of the day.</div>
          <button className="a-btn" onClick={() => setShowForm(true)}>Suggest a question</button>
        </aside>

        {showForm && <CommunityForm onClose={() => setShowForm(false)} />}
      </div>
    </div>
  );
}

function CommunityForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"single_choice" | "this_or_that">("single_choice");
  const [emoji, setEmoji] = useState("💬");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("alltag");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const opts = type === "this_or_that" ? options.slice(0, 2) : options;
  const setOpt = (i: number, v: string) => setOptions((o) => o.map((x, j) => (j === i ? v : x)));

  async function submit() {
    const clean = opts.map((o) => o.trim()).filter(Boolean);
    const need = type === "this_or_that" ? 2 : 2;
    if (!text.trim() || clean.length < need) { setError("Please fill in a question and at least 2 answers."); setStatus("error"); return; }
    if (!supabaseReady) { setError("You need to be logged in for this (backend not connected)."); setStatus("error"); return; }
    setStatus("sending"); setError("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setError("Please log in first."); setStatus("error"); return; }
    const payload = {
      author_id: auth.user.id,
      type,
      emoji: emoji.trim() || "💬",
      text: text.trim(),
      category,
      status: "pending",
      options: clean.map((label, i) => ({ id: type === "this_or_that" ? (i === 0 ? "a" : "b") : String(i), label })),
    };
    const { error } = await supabase.from("community_questions").insert(payload);
    if (error) { setError(error.message || "Sending failed."); setStatus("error"); }
    else setStatus("done");
  }

  return (
    <div className="cq-backdrop" onClick={onClose}>
      <div className="net-glass cq-modal" style={{ padding: 26 }} onClick={(e) => e.stopPropagation()}>
        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "#eaf1fb", margin: "8px 0 6px" }}>Thank you!</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "rgba(234,241,251,0.7)", lineHeight: 1.5, margin: "0 0 20px" }}>Your question goes to moderation. Once it's approved, it shows up in the deck.</p>
            <button className="a-btn" onClick={onClose} style={{ width: "100%" }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "#eaf1fb", margin: 0 }}>Suggest your own question</h3>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(234,241,251,0.7)", cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(234,241,251,0.55)", margin: "0 0 6px" }}>Light, connecting topics. Briefly reviewed before publishing.</p>

            <div className="cq-label">Format</div>
            <div className="cq-seg">
              <button className={type === "single_choice" ? "on" : ""} onClick={() => setType("single_choice")}>Multiple options</button>
              <button className={type === "this_or_that" ? "on" : ""} onClick={() => { setType("this_or_that"); setOptions((o) => [o[0] ?? "", o[1] ?? ""]); }}>A or B</button>
            </div>

            <div className="cq-label">Question</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="cq-input" style={{ width: 58, textAlign: "center" }} value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
              <input className="cq-input" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="How do you start your day?" />
            </div>

            <div className="cq-label">Answers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {opts.map((o, i) => (
                <input key={i} className="cq-input" value={o} onChange={(e) => setOpt(i, e.target.value)} placeholder={type === "this_or_that" ? (i === 0 ? "Option A" : "Option B") : `Answer ${i + 1}`} />
              ))}
            </div>
            {type === "single_choice" && (
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                {options.length < 4 && <button onClick={() => setOptions((o) => [...o, ""])} style={linkBtn}>+ Answer</button>}
                {options.length > 2 && <button onClick={() => setOptions((o) => o.slice(0, -1))} style={linkBtn}>− remove</button>}
              </div>
            )}

            <div className="cq-label">Category</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {CATEGORIES.map((c) => (
                <button key={c} className={`cq-chip${category === c ? " on" : ""}`} onClick={() => setCategory(c)}>{CAT_LABEL[c] ?? c}</button>
              ))}
            </div>

            {status === "error" && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#ff9b9b", margin: "12px 0 0" }}>{error}</p>}
            <button className="a-btn" onClick={submit} style={{ width: "100%", marginTop: 18, padding: 13 }}>
              {status === "sending" ? "Sending …" : "Send for moderation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = { background: "none", border: "none", color: "#cfe4ff", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, padding: 0 };

function Avatar({ m }: { m: MiniMate }) {
  return <span className="avatar sm" style={{ background: m.color }} title={m.name}>{m.initials}</span>;
}
