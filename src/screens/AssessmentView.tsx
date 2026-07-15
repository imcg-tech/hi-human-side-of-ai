import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Icon from "../components/Icon";
import { Glass, DISCBar } from "../components/ds";
import { DISC_INFO } from "../data/disc";
import { BLOCKS, scoreDisc, shuffle, type BlockResponse, type DiscResult } from "../data/assessment";
import { useStore, type DiscType } from "../lib/store";

const TOTAL = BLOCKS.length;
const ORDER: DiscType[] = ["D", "I", "S", "C"];

type Answer = { most: string | null; least: string | null };

export default function AssessmentView() {
  const navigate = useNavigate();
  const setProfile = useStore((s) => s.setProfile);
  const setShareWithTeam = useStore((s) => s.setShareWithTeam);

  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => BLOCKS.map(() => ({ most: null, least: null })));
  const [result, setResult] = useState<DiscResult | null>(null);
  const [share, setShare] = useState(false);

  // shuffle each block's option order once per mount (position-bias guard)
  const shuffled = useMemo(() => BLOCKS.map((b) => shuffle(b.items)), []);

  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(".aq-stage", { y: 22, duration: 0.4, ease: "power2.out" }); }, { dependencies: [phase, index], scope });

  const cur = answers[index];
  const canNext = !!cur.most && !!cur.least;

  function pick(kind: "most" | "least", itemId: string) {
    setAnswers((prev) => {
      const next = prev.map((a) => ({ ...a }));
      const a = next[index];
      if (kind === "most") { a.most = itemId; if (a.least === itemId) a.least = null; }
      else { a.least = itemId; if (a.most === itemId) a.most = null; }
      return next;
    });
  }

  function start() { setIndex(0); setAnswers(BLOCKS.map(() => ({ most: null, least: null }))); setResult(null); setPhase("quiz"); }

  function next() {
    if (!canNext) return;
    if (index < TOTAL - 1) { setIndex(index + 1); return; }
    const responses: BlockResponse[] = BLOCKS.map((b, i) => ({ block: b.id, most: answers[i].most!, least: answers[i].least! }));
    setResult(scoreDisc(responses));
    setPhase("result");
  }

  function back() { if (index > 0) setIndex(index - 1); else setPhase("intro"); }

  return (
    <div ref={scope} style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate("/app")} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 18 }}>
        <Icon name="arrowLeft" size={16} /> Home
      </button>

      {/* ───────── Intro ───────── */}
      {phase === "intro" && (
        <div className="aq-stage" style={{ maxWidth: 620, margin: "auto", width: "100%" }}>
          <Glass pad={36}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)" }}>HI personality check</span>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, color: "var(--text-primary)", margin: "10px 0 0", lineHeight: 1.12 }}>Discover your DISC profile</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-body)", lineHeight: 1.6, margin: "16px 0 0" }}>
              {TOTAL} questions, about 7–10 minutes. For each one you pick <strong>one</strong> statement that fits you <strong>most</strong>, and <strong>one</strong> that fits you <strong>least</strong>. Go with your gut, there's no right or wrong. 💡
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "22px 0 26px" }}>
              {ORDER.map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: DISC_INFO[t].color }} /> {DISC_INFO[t].persona} {DISC_INFO[t].emoji}
                </span>
              ))}
            </div>
            <button onClick={start} style={primaryBtn}>Let's go <Icon name="arrowRight" size={18} /></button>
          </Glass>
        </div>
      )}

      {/* ───────── Quiz ───────── */}
      {phase === "quiz" && (
        <div style={{ maxWidth: 680, margin: "auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <button onClick={back} style={ghostRound} aria-label="back"><Icon name="arrowLeft" size={18} /></button>
            <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(28,26,23,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${(index / TOTAL) * 100}%`, height: "100%", borderRadius: 999, background: "var(--brand)", transition: "width 0.35s var(--ease-out)" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-secondary)", minWidth: 90, textAlign: "right" }}>Question {index + 1} / {TOTAL}</span>
          </div>
          {index === Math.floor(TOTAL / 2) && (
            <div style={{ marginBottom: 14, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--brand)" }}>Halfway there! 🎉 Keep going.</div>
          )}

          <div className="aq-stage" key={index}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, color: "var(--text-primary)", lineHeight: 1.25, margin: "0 0 6px" }}>{BLOCKS[index].prompt}</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", margin: "0 0 18px" }}>Pick 1× <strong style={{ color: "var(--disc-s)" }}>most</strong> and 1× <strong style={{ color: "#C0392B" }}>least</strong>.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {shuffled[index].map((item) => {
                const mostA = cur.most === item.id;
                const leastA = cur.least === item.id;
                return (
                  <div key={item.id} style={optionRow(mostA, leastA)}>
                    <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", lineHeight: 1.4 }}>{item.text}</span>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => pick("most", item.id)} style={toggleStyle(mostA, "most")}>
                        <Icon name="check" size={14} color={mostA ? "#fff" : "var(--text-muted)"} /> Most
                      </button>
                      <button onClick={() => pick("least", item.id)} style={toggleStyle(leastA, "least")}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>✕</span> Least
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={next} disabled={!canNext} style={{ ...primaryBtn, marginTop: 24, width: "100%", opacity: canNext ? 1 : 0.45, cursor: canNext ? "pointer" : "not-allowed" }}>
              {index < TOTAL - 1 ? "Next" : "See result"} <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ───────── Result ───────── */}
      {phase === "result" && result && (() => {
        const p = DISC_INFO[result.primary];
        const sec = DISC_INFO[result.secondary];
        return (
          <div className="aq-stage" style={{ maxWidth: 680, margin: "auto", width: "100%" }}>
            <Glass pad={32}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14 }}>Your result · 🔒 private</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <span style={{ width: 84, height: 84, borderRadius: 22, background: p.color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 44 }}>{result.primary}</span>
                <div>
                  <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>{p.persona} {p.emoji}</h1>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)" }}>{p.label} · profile code {result.profileCode}</div>
                </div>
              </div>

              <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "20px 0 0" }}>{p.desc}</p>

              {result.isBalanced ? (
                <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)" }}>
                  ⚖️ <strong>Balanced profile</strong>, your four styles sit close together. You're flexible and adapt well to different situations.
                </div>
              ) : (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.6, margin: "8px 0 0" }}>
                  …with a good dose of <strong style={{ color: sec.color }}>{sec.persona}</strong>.
                </p>
              )}

              {/* percent bars */}
              <div style={{ margin: "24px 0 8px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Your DISC profile</div>
              <DISCBar data={ORDER.map((t) => ({ type: t, value: result.percent[t] }))} />

              {/* share mix */}
              <div style={{ margin: "22px 0 8px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Your mix</div>
              <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(28,26,23,0.06)" }}>
                {ORDER.map((d) => (
                  <div key={d} title={`${DISC_INFO[d].persona} ${result.share[d]}%`} style={{ width: `${result.share[d]}%`, background: DISC_INFO[d].color }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
                {ORDER.map((d) => (
                  <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: DISC_INFO[d].color }} /> {d} {result.share[d]}%
                  </span>
                ))}
              </div>

              {/* consent opt-in */}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 24, padding: "14px 16px", borderRadius: 14, background: "rgba(28,26,23,0.04)", cursor: "pointer" }}>
                <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.45 }}>
                  <strong>Share my result with the team.</strong> Your profile then feeds into the team map and the 1:1 insights. Revocable at any time.
                </span>
              </label>

              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button onClick={() => { setProfile(result); setShareWithTeam(share); navigate("/app/profile"); }} style={primaryBtn}>
                  Save & view <Icon name="arrowRight" size={18} />
                </button>
                <button onClick={start} style={ghostBtn}>Retake the test</button>
              </div>

              <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, margin: "22px 0 0" }}>
                This test is based on the DISC model and serves as a playful self-assessment and team-development tool. It is not a clinical, diagnostic or aptitude-testing instrument and does not replace professional advice. "DISC" refers to the general behavioral model; this questionnaire is an independent development.
              </p>
            </Glass>
          </div>
        );
      })()}
    </div>
  );
}

const primaryBtn: React.CSSProperties = { height: 50, padding: "0 26px", borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9 };
const ghostBtn: React.CSSProperties = { height: 50, padding: "0 22px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, cursor: "pointer" };
const ghostRound: React.CSSProperties = { width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 };

function optionRow(most: boolean, least: boolean): React.CSSProperties {
  const border = most ? "var(--disc-s)" : least ? "rgba(192,57,43,0.45)" : "var(--border-default)";
  const bg = most ? "rgba(0,214,143,0.08)" : least ? "rgba(192,57,43,0.05)" : "rgba(255,255,255,0.6)";
  return { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, border: `1.5px solid ${border}`, background: bg, transition: "all 0.15s", backdropFilter: "blur(8px)" };
}

function toggleStyle(active: boolean, kind: "most" | "least"): React.CSSProperties {
  const base: React.CSSProperties = { height: 36, padding: "0 13px", borderRadius: 999, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.15s", whiteSpace: "nowrap" };
  if (kind === "most")
    return { ...base, border: active ? "none" : "1.5px solid var(--border-strong)", background: active ? "var(--disc-s)" : "transparent", color: active ? "#fff" : "var(--text-secondary)" };
  return { ...base, border: active ? "1.5px solid rgba(192,57,43,0.5)" : "1.5px solid var(--border-strong)", background: active ? "rgba(192,57,43,0.12)" : "transparent", color: active ? "#C0392B" : "var(--text-muted)" };
}
