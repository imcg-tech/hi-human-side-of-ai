import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Icon from "../../components/Icon";
import { Glass } from "../../components/ds";
import { MODULES } from "../../data/modules";
import type { Game } from "../../data/games";
import { BARRIERS, PATHS, CULTURE_COUNTRIES, PRINCIPLES, INTRO_POINTS, LEITMOTIV, CLOSING_STATEMENT, MAP_DISCLAIMER, SELF_CHECKS, HOOK, STATS, SOURCES } from "../../data/feedbackTraining";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import PrivacyHint from "../../components/PrivacyHint";
import GameBrief from "./GameBrief";

const ACCENT = MODULES.find((m) => m.id === "leadership")?.color ?? "var(--brand)";
type Screen = "intro" | "barriers" | "path" | "culture" | "outro";

export default function FeedbackTrainingGame({ game: g }: { game: Game }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("intro");
  const [barriers, setBarriers] = useState<string[]>([]);
  const [pathIdx, setPathIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [cultureScore, setCultureScore] = useState<number | null>(null);
  const [practiceText, setPracticeText] = useState("");
  const [showCheck, setShowCheck] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [checkedSelf, setCheckedSelf] = useState<Set<number>>(new Set());
  const [showSources, setShowSources] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    gsap.from(".ft-stage", { y: 20, duration: 0.38, ease: "power2.out" });
    if (screen === "intro") gsap.from(".ft-stat", { y: 16, duration: 0.4, stagger: 0.07, ease: "power2.out", delay: 0.08 });
  }, { dependencies: [screen, pathIdx], scope });
  // micro-reward: sanftes Aufleuchten der guten Option
  useEffect(() => { if (picked !== null) gsap.fromTo(".ft-ok", { scale: 0.97 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)" }); }, [picked]);

  const totalSteps = 4 + barriers.length;
  const stepNo = screen === "intro" ? 1 : screen === "barriers" ? 2 : screen === "path" ? 3 + pathIdx : screen === "culture" ? 3 + barriers.length : totalSteps;
  const progress = (stepNo / totalSteps) * 100;

  const resetPractice = () => { setPicked(null); setPracticeText(""); setShowCheck(false); setShowSample(false); setCheckedSelf(new Set()); };
  const toggle = (id: string) => setBarriers((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
  function startPaths() { if (!barriers.length) return; setPathIdx(0); resetPractice(); setScreen("path"); }
  function nextPath() { if (pathIdx + 1 < barriers.length) { setPathIdx(pathIdx + 1); resetPractice(); } else setScreen("culture"); }

  const allPlaced = CULTURE_COUNTRIES.every((c) => placed[c.code] != null);
  const activeIdx = CULTURE_COUNTRIES.findIndex((c) => placed[c.code] == null);
  function placeAxis(e: React.MouseEvent<HTMLDivElement>) {
    if (revealed || activeIdx < 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
    setPlaced((p) => ({ ...p, [CULTURE_COUNTRIES[activeIdx].code]: pct }));
  }
  function resolve() {
    const score = Math.round(CULTURE_COUNTRIES.reduce((s, c) => s + Math.max(0, 100 - Math.abs((placed[c.code] ?? 50) - c.target) * 2), 0) / CULTURE_COUNTRIES.length);
    setCultureScore(score); setRevealed(true);
  }
  function restart() { setScreen("intro"); setBarriers([]); setPathIdx(0); resetPractice(); setPlaced({}); setRevealed(false); setCultureScore(null); }

  const path = PATHS[barriers[pathIdx]];

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate(`/app/module/${g.category}`)} style={backBtn}><Icon name="arrowLeft" size={16} /> Leadership</button>

      {screen !== "intro" && (
        <div style={{ maxWidth: 620, width: "100%", margin: "0 auto 16px" }}>
          {(screen === "path" || screen === "culture") && <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginBottom: 6 }}>🧰 You're building your feedback toolbox …</div>}
          <div style={{ height: 6, borderRadius: 999, background: "rgba(28,26,23,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: ACCENT, borderRadius: 999, transition: "width 0.35s var(--ease-out)" }} />
          </div>
        </div>
      )}

      {/* 1, Intro (faktengestützt) */}
      {screen === "intro" && (
        <div className="ft-stage" style={{ maxWidth: 640, margin: "auto", width: "100%" }}>
          {/* Hook + Leitidee */}
          <Glass pad={34} style={{ marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: ACCENT, display: "grid", placeItems: "center", fontSize: 30 }}>🎓</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", margin: "14px 0 12px", lineHeight: 1.12 }}>Feedback is a gift</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: 0 }}>{HOOK}</p>
            <GameBrief g={g} accent={ACCENT} />
          </Glass>

          {/* Fakten */}
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 4px 10px" }}>What the research shows</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 18 }}>
            {STATS.map((s) => (
              <Glass key={s.big} className="ft-stat" pad={22}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38, color: ACCENT, lineHeight: 1, marginBottom: 8 }}>{s.big}</div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.5, margin: "0 0 8px" }}>{s.text}</p>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)" }}>{s.source}</div>
              </Glass>
            ))}
          </div>

          {/* Quellen (dezent, aufklappbar) */}
          <button onClick={() => setShowSources((v) => !v)} style={{ ...linkBtn, margin: "0 4px 16px" }}>{showSources ? "Hide sources" : "Show sources"}</button>
          {showSources && (
            <ul style={{ listStyle: "none", margin: "0 4px 16px", padding: "12px 16px", borderRadius: 12, background: "rgba(28,26,23,0.04)", display: "flex", flexDirection: "column", gap: 6 }}>
              {SOURCES.map((s) => <li key={s} style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45 }}>· {s}</li>)}
            </ul>
          )}

          {/* Was das für dich heißt */}
          <Glass pad={28}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 14 }}>What this means for you</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {INTRO_POINTS.map((t) => (
                <div key={t} style={{ display: "flex", gap: 10, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.5 }}><span style={{ color: ACCENT, fontWeight: 700 }}>›</span> {t}</div>
              ))}
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--brand-subtle)", border: "1px solid var(--brand-light)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5, fontStyle: "italic", marginBottom: 18 }}>{LEITMOTIV}</div>
            <PrivacyHint text="Your wording stays local, never transmitted." style={{ marginBottom: 20 }} />
            <button onClick={() => setScreen("barriers")} style={{ ...primaryBtn, width: "100%" }}>Let's go <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {/* 2, Barriers */}
      {screen === "barriers" && (
        <div className="ft-stage" style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", margin: "0 0 4px" }}>Where would you like to feel more confident?</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", margin: "0 0 18px" }}>Multiple choice · anonymous</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {BARRIERS.map((b) => {
              const on = barriers.includes(b.id);
              return (
                <button key={b.id} onClick={() => toggle(b.id)} style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", padding: "15px 18px", borderRadius: 16, cursor: "pointer", background: on ? "rgba(95,123,255,0.10)" : "rgba(255,255,255,0.62)", border: `1.5px solid ${on ? "var(--brand)" : "var(--border-default)"}`, transition: "all 0.15s", backdropFilter: "blur(8px)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: on ? "none" : "2px solid var(--border-strong)", background: on ? "var(--brand)" : "transparent", display: "grid", placeItems: "center" }}>{on && <Icon name="check" size={15} color="#fff" />}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", lineHeight: 1.4 }}>{b.label}</span>
                </button>
              );
            })}
          </div>
          <button onClick={startPaths} disabled={!barriers.length} style={{ ...primaryBtn, marginTop: 20, width: "100%", opacity: barriers.length ? 1 : 0.45, cursor: barriers.length ? "pointer" : "not-allowed" }}>My learning path <Icon name="arrowRight" size={18} /></button>
        </div>
      )}

      {/* 3, Path */}
      {screen === "path" && path && (
        <div className="ft-stage" key={pathIdx} style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Learning path {pathIdx + 1} / {barriers.length}</div>
          <Glass pad={28}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 10px" }}>{path.title}</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 18px" }}>{path.insight}</p>
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 16 }}>{path.scenario}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {path.options.map((o, i) => {
                const revealedOpt = picked !== null;
                const isPicked = picked === i;
                const tone = revealedOpt && (o.ok ? "ok" : isPicked ? "no" : "dim");
                return (
                  <div key={i}>
                    <button onClick={() => picked === null && setPicked(i)} disabled={revealedOpt} className={o.ok ? "ft-ok" : undefined} style={optionBtn(tone)}>
                      <span style={{ flex: 1 }}>{o.text}</span>
                      {revealedOpt && o.ok && <Icon name="check" size={18} color="#1B7A4B" />}
                      {revealedOpt && isPicked && !o.ok && <span style={{ color: "#C2643B", fontWeight: 700 }}>✕</span>}
                    </button>
                    {revealedOpt && (isPicked || o.ok) && <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.45, padding: "8px 14px 2px" }}>{o.fb}</div>}
                  </div>
                );
              })}
            </div>

            {picked !== null && (
              <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: "var(--brand-subtle)", border: "1px solid var(--brand-light)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>🧰 Takeaway</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5 }}>{path.takeaway}</div>
              </div>
            )}
          </Glass>

          {picked !== null && (
            <>
              {/* „Jetzt du", optionale Formulier-Übung */}
              <Glass pad={24} style={{ marginTop: 14 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 6 }}>✍️ Now you <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, color: "var(--text-muted)" }}>· optional</span></div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 12px" }}>{path.practice.scenario}</p>
              <textarea value={practiceText} onChange={(e) => setPracticeText(e.target.value)} placeholder="How would YOU phrase it? (stays local, not saved)" style={{ width: "100%", minHeight: 80, resize: "vertical", boxSizing: "border-box", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.6)", padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 }} />
              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={() => setShowCheck((v) => !v)} style={linkBtn}>{showCheck ? "Hide self-check" : "Self-check"}</button>
                <button onClick={() => setShowSample((v) => !v)} style={linkBtn}>{showSample ? "Hide sample" : "Show sample"}</button>
              </div>
              {showCheck && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {SELF_CHECKS.map((q, i) => {
                    const on = checkedSelf.has(i);
                    return (
                      <button key={i} onClick={() => setCheckedSelf((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })} style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1, border: on ? "none" : "2px solid var(--border-strong)", background: on ? "var(--disc-s)" : "transparent", display: "grid", placeItems: "center" }}>{on && <Icon name="check" size={14} color="#fff" />}</span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.4 }}>{q}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {showSample && (
                <div style={{ marginTop: 12, padding: "13px 15px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Sample for comparison</div>
                  {path.practice.sample}
                </div>
              )}
              </Glass>
              <button onClick={nextPath} style={{ ...primaryBtn, marginTop: 16, width: "100%" }}>{pathIdx + 1 < barriers.length ? (practiceText.trim() ? "Next" : "Next without exercise") : "To the culture map"} <Icon name="arrowRight" size={18} /></button>
            </>
          )}
        </div>
      )}

      {/* 4, Culture Map */}
      {screen === "culture" && (
        <div className="ft-stage" style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <Glass pad={28}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px" }}>Feedback styles around the world</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>
              {revealed ? "Here's where the reference values sit (based on Erin Meyer). The score is secondary, the principle is what counts." : activeIdx >= 0 ? <>Place <strong>{CULTURE_COUNTRIES[activeIdx].flag} {CULTURE_COUNTRIES[activeIdx].name}</strong>, tap on the axis.</> : "All placed, reveal it."}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginBottom: 6 }}><span>◀ indirect / high-context</span><span>direct / explicit ▶</span></div>
            <div onClick={placeAxis} style={{ position: "relative", height: 70, borderRadius: 14, background: "rgba(28,26,23,0.05)", border: "1px solid var(--border-default)", cursor: revealed || activeIdx < 0 ? "default" : "pointer" }}>
              <div style={{ position: "absolute", left: 18, right: 18, top: 0, bottom: 0 }}>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: "rgba(140,134,125,0.25)", borderRadius: 2 }} />
                {CULTURE_COUNTRIES.map((c) => placed[c.code] != null && (
                  <span key={c.code} title={c.name} style={{ position: "absolute", left: `${placed[c.code]}%`, top: revealed ? "26%" : "50%", transform: "translate(-50%,-50%)", fontSize: 22, transition: "top 0.3s" }}>{c.flag}</span>
                ))}
                {revealed && CULTURE_COUNTRIES.map((c) => (
                  <span key={`t${c.code}`} title={`${c.name} (reference)`} style={{ position: "absolute", left: `${c.target}%`, top: "74%", transform: "translate(-50%,-50%)", fontSize: 18, opacity: 0.85, filter: "grayscale(0.2)" }}>{c.flag}</span>
                ))}
              </div>
            </div>
            {revealed && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)" }}><span>⬆ your guesses</span><span>reference ⬇</span></div>
            )}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.55, margin: "12px 0 0" }}>{MAP_DISCLAIMER}</p>

            {!revealed ? (
              <button onClick={resolve} disabled={!allPlaced} style={{ ...primaryBtn, marginTop: 18, width: "100%", opacity: allPlaced ? 1 : 0.45, cursor: allPlaced ? "pointer" : "not-allowed" }}>Reveal</button>
            ) : (
              <>
                <div style={{ textAlign: "center", margin: "18px 0 4px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: ACCENT }}>{cultureScore}%</div>
                <div style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>Same message, adapted packaging: that's the core.</div>
                <button onClick={() => setScreen("outro")} style={{ ...primaryBtn, width: "100%" }}>Next <Icon name="arrowRight" size={18} /></button>
              </>
            )}
          </Glass>
        </div>
      )}

      {/* 5, Outro */}
      {screen === "outro" && (
        <div className="ft-stage" style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <Glass pad={30}>
            <div style={{ fontSize: 40 }}>🧰</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 18px" }}>Your feedback toolbox</h2>

            {/* techniques collected along the way */}
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Collected along the way</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {barriers.map((id) => (
                <div key={id} style={{ display: "flex", gap: 10, padding: "11px 14px", borderRadius: 12, background: "var(--brand-subtle)" }}>
                  <Icon name="check" size={16} color="var(--brand-dark)" />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.45 }}><strong>{PATHS[id].title}:</strong> {PATHS[id].takeaway}</span>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Three principles</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
              {PRINCIPLES.map((p) => (
                <div key={p.t} style={{ display: "flex", gap: 13, padding: "14px 16px", borderRadius: 14, background: "rgba(28,26,23,0.04)" }}>
                  <span style={{ fontSize: 24 }}>{p.emoji}</span>
                  <div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{p.t}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.45 }}>{p.d}</div></div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: ACCENT, marginBottom: 14 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5, color: "#fff", lineHeight: 1.5 }}>{CLOSING_STATEMENT}</div>
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 18px", padding: "0 2px" }}>{LEITMOTIV}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", marginBottom: 22 }}>
              Your focus was: {barriers.map((id) => PATHS[id].title).join(" · ")}{cultureScore !== null ? ` · Culture map ${cultureScore}%` : ""}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate(`/app/module/${g.category}`)} style={primaryBtn}>Finish <Icon name="check" size={18} /></button>
              <button onClick={restart} style={ghostBtn}>Go through again</button>
            </div>
          </Glass>
        </div>
      )}
    </div>
  );
}

const linkBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--brand-dark)", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, padding: 0 };

function optionBtn(tone: false | "ok" | "no" | "dim"): React.CSSProperties {
  const base: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "15px 18px", borderRadius: 14, cursor: tone ? "default" : "pointer", fontFamily: "var(--font-body)", fontSize: 15.5, lineHeight: 1.4, color: "var(--text-primary)", background: "rgba(255,255,255,0.62)", border: "1.5px solid var(--border-default)", transition: "all 0.15s", backdropFilter: "blur(8px)" };
  if (tone === "ok") return { ...base, background: "rgba(27,122,75,0.12)", border: "1.5px solid #1B7A4B" };
  if (tone === "no") return { ...base, background: "rgba(194,100,59,0.12)", border: "1.5px solid #C2643B" };
  if (tone === "dim") return { ...base, opacity: 0.55 };
  return base;
}
