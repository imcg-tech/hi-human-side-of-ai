import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass, Button, Badge } from "../components/ds";
import Icon from "../components/Icon";
import PrivacyHint from "../components/PrivacyHint";
import { useStore } from "../lib/store";
import {
  PULSE_QUESTIONS, PULSE_MIN_GROUP, MOCK_PULSE_RESPONSES,
  currentCycle, pulseStats, pulseTag, type PulseAnswers,
} from "../data/pulse";

/* Team Pulse Survey: einmal pro Quartal, anonym, ein Screen pro Frage.
   Ergebnisse nur als Team-Aggregat und nur ab PULSE_MIN_GROUP Antworten. */

const font = (v: "display" | "body") => `var(--font-${v})`;

export default function PulseView() {
  const navigate = useNavigate();
  const pulseCycle = useStore((s) => s.pulseCycle);
  const pulseAnswers = useStore((s) => s.pulseAnswers);
  const pulseSubmit = useStore((s) => s.pulseSubmit);

  const cycle = currentCycle();
  const alreadyDone = pulseCycle === cycle;

  const [tab, setTab] = useState<"survey" | "results">(alreadyDone ? "results" : "survey");
  const [idx, setIdx] = useState(-1); // -1 = Intro, 0..n-1 = Fragen
  const [draft, setDraft] = useState<PulseAnswers>({});
  const [justFinished, setJustFinished] = useState(false);

  // Team-Aggregat: 6 anonyme Demo-Antworten + die eigene, sobald abgegeben.
  const responses = useMemo(
    () => (alreadyDone && pulseAnswers ? [...MOCK_PULSE_RESPONSES, pulseAnswers] : MOCK_PULSE_RESPONSES),
    [alreadyDone, pulseAnswers]
  );
  const stats = useMemo(() => pulseStats(responses), [responses]);

  const q = idx >= 0 ? PULSE_QUESTIONS[idx] : null;
  const answered = q ? draft[idx] !== undefined && (q.type !== "text" || true) : false;
  const canNext = q ? (q.type === "text" ? true : answered) : false;
  const last = idx === PULSE_QUESTIONS.length - 1;

  const submit = () => {
    pulseSubmit(cycle, draft);
    setJustFinished(true);
    setTab("results");
  };

  const tabBtn = (k: "survey" | "results", label: string) => (
    <button key={k} onClick={() => setTab(k)} style={{ flex: 1, height: 38, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: font("display"), fontWeight: 600, fontSize: 14, background: tab === k ? "var(--sand-100)" : "transparent", color: tab === k ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: tab === k ? "var(--shadow-sm)" : "none" }}>{label}</button>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 0 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 620 }}>

        <button onClick={() => navigate("/app/signal")} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "none", background: "transparent", cursor: "pointer", fontFamily: font("body"), fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, padding: "6px 4px" }}>
          <Icon name="arrowLeft" size={16} /> Mood & Pulse
        </button>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, background: "rgba(28,26,23,0.04)", padding: 5, borderRadius: 999 }}>
          {tabBtn("survey", "Take part")}{tabBtn("results", "Team results")}
        </div>

        {/* ── SURVEY ── */}
        {tab === "survey" && (alreadyDone ? (
          <Glass pad={36} style={{ textAlign: "center" }}>
            <span style={{ width: 62, height: 62, borderRadius: "50%", background: "var(--candy-teal)", display: "inline-grid", placeItems: "center", marginBottom: 16 }}>
              <Icon name="check" size={28} color="var(--ink-fill)" />
            </span>
            <h1 style={{ fontFamily: font("display"), fontWeight: 600, fontSize: 26, color: "var(--text-primary)", margin: "0 0 8px" }}>
              {justFinished ? "Thank you." : `You've taken part in the ${cycle} pulse`}
            </h1>
            <p style={{ fontFamily: font("body"), fontSize: 14.5, color: "var(--text-secondary)", margin: "0 auto 22px", maxWidth: 400, lineHeight: 1.55 }}>
              Your answers went into the team aggregate anonymously. The next pulse opens next quarter.
            </p>
            <Button variant="primary" onClick={() => setTab("results")}>See team results</Button>
          </Glass>
        ) : idx === -1 ? (
          <Glass pad={36}>
            <span style={{ fontFamily: font("body"), fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>Team Pulse · {cycle}</span>
            <h1 style={{ fontFamily: font("display"), fontWeight: 600, fontSize: 28, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: "10px 0 10px" }}>How does work really feel right now?</h1>
            <p style={{ fontFamily: font("body"), fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.55 }}>
              30 short questions about your role, your lead, the culture and your energy. Once per quarter, about six minutes. Concrete answer options instead of grades.
            </p>
            <PrivacyHint boxed text={`Anonymous. Results appear only as a team aggregate and only from ${PULSE_MIN_GROUP} responses up. Nobody sees individual answers, not even your lead.`} style={{ marginBottom: 22 }} />
            <Button variant="accent" size="lg" full onClick={() => setIdx(0)}>Start the pulse</Button>
          </Glass>
        ) : (
          <Glass pad={32}>
            <div style={{ fontFamily: font("body"), fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Question {idx + 1} of {PULSE_QUESTIONS.length}</div>
            <div style={{ height: 5, background: "rgba(28,26,23,0.07)", borderRadius: 999, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ width: `${Math.round((idx / PULSE_QUESTIONS.length) * 100)}%`, height: "100%", background: "var(--brand)", borderRadius: 999, transition: "width var(--dur-base) var(--ease-out)" }} />
            </div>

            <h2 style={{ fontFamily: font("display"), fontWeight: 600, fontSize: 22, lineHeight: 1.25, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: "0 0 22px" }}>{q!.t}</h2>

            {q!.type === "choice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q!.o.map((opt, i) => {
                  const sel = draft[idx] === i;
                  return (
                    <button key={i} onClick={() => setDraft((d) => ({ ...d, [idx]: i }))} style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", padding: "14px 16px", borderRadius: "var(--radius-input)", cursor: "pointer", border: sel ? "1.5px solid var(--brand)" : "1px solid var(--border-default)", background: sel ? "var(--brand-subtle)" : "var(--bg-card)", transition: "all var(--dur-fast) var(--ease-out)" }}>
                      <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", fontFamily: font("display"), fontWeight: 700, fontSize: 14, background: sel ? "var(--brand)" : "rgba(28,26,23,0.06)", color: sel ? "var(--text-on-brand)" : "var(--text-secondary)" }}>{String.fromCharCode(65 + i)}</span>
                      <span style={{ fontFamily: font("body"), fontSize: 14.5, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>{opt[0]}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {q!.type === "enps" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 6 }}>
                  {Array.from({ length: 11 }, (_, v) => {
                    const sel = draft[idx] === v;
                    return (
                      <button key={v} onClick={() => setDraft((d) => ({ ...d, [idx]: v }))} style={{ aspectRatio: "1", borderRadius: 10, cursor: "pointer", fontFamily: font("display"), fontWeight: 700, fontSize: 14, border: sel ? "1.5px solid var(--brand)" : "1px solid var(--border-default)", background: sel ? "var(--brand)" : "var(--bg-card)", color: sel ? "var(--text-on-brand)" : "var(--text-primary)", transition: "all var(--dur-fast) var(--ease-out)" }}>{v}</button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: font("body"), fontSize: 12, color: "var(--text-muted)" }}>
                  <span>0 · Not at all likely</span><span>Extremely likely · 10</span>
                </div>
              </>
            )}

            {q!.type === "text" && (
              <>
                <textarea value={typeof draft[idx] === "string" ? (draft[idx] as string) : ""} onChange={(e) => setDraft((d) => ({ ...d, [idx]: e.target.value }))} placeholder="Type your answer, or skip. Optional."
                  style={{ width: "100%", minHeight: 110, resize: "vertical", boxSizing: "border-box", borderRadius: "var(--radius-input)", border: "1px solid var(--border-default)", background: "var(--bg-card)", padding: "12px 14px", fontFamily: font("body"), fontSize: 14.5, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 }} />
                <p style={{ fontFamily: font("body"), fontSize: 12.5, color: "var(--text-muted)", margin: "8px 0 0", lineHeight: 1.5 }}>Please don't include names or details that could identify you or a colleague.</p>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 26 }}>
              <Button variant="ghost" onClick={() => setIdx((i) => i - 1)} style={{ visibility: idx === 0 ? "hidden" : "visible" }}>Back</Button>
              <Button variant="primary" disabled={!canNext} onClick={() => (last ? submit() : setIdx((i) => i + 1))}>{last ? "Submit" : "Next"}</Button>
            </div>
          </Glass>
        ))}

        {/* ── TEAM RESULTS (nur Aggregat, Schwelle PULSE_MIN_GROUP) ── */}
        {tab === "results" && (
          stats.n < PULSE_MIN_GROUP ? (
            <Glass pad={32} style={{ textAlign: "center" }}>
              <Icon name="lock" size={24} color="var(--text-muted)" />
              <h2 style={{ fontFamily: font("display"), fontWeight: 700, fontSize: 19, color: "var(--text-primary)", margin: "12px 0 6px" }}>Results are locked</h2>
              <p style={{ fontFamily: font("body"), fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                Currently {stats.n} of {PULSE_MIN_GROUP} responses. To protect anonymity, team results appear once at least {PULSE_MIN_GROUP} people have taken part.
              </p>
            </Glass>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <PrivacyHint boxed text={`Team aggregate from ${stats.n} anonymous responses. No individual answers, no per-person data, not visible to HR as individuals.`} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { v: stats.overall.toFixed(2), k: "Overall / 5", c: "var(--candy-teal)" },
                  { v: `${Math.round(stats.favShare * 100)}%`, k: "Favourable", c: "var(--candy-yellow)" },
                  { v: `${stats.enps > 0 ? "+" : ""}${stats.enps}`, k: "eNPS", c: "var(--candy-peri)" },
                ].map((s) => (
                  <div key={s.k} style={{ background: s.c, borderRadius: 20, padding: "18px 16px", textAlign: "center" }}>
                    <div style={{ fontFamily: font("display"), fontWeight: 700, fontSize: 26, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{s.v}</div>
                    <div style={{ fontFamily: font("body"), fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-secondary)", marginTop: 4 }}>{s.k}</div>
                  </div>
                ))}
              </div>

              <Glass pad={26}>
                <div style={{ fontFamily: font("body"), fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>By dimension, worst first</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {stats.dims.map((d) => {
                    const tag = pulseTag(d.avg);
                    return (
                      <div key={d.d}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontFamily: font("display"), fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{d.name}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: font("display"), fontWeight: 600, fontSize: 14, color: "var(--text-secondary)" }}>{d.avg.toFixed(2)}</span>
                            <Badge tone={tag.tone}>{tag.label}</Badge>
                          </span>
                        </div>
                        <div style={{ height: 9, background: "var(--sand-500)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${Math.round((d.avg / 5) * 100)}%`, height: "100%", borderRadius: 999, background: tag.tone === "safe" ? "var(--safe)" : tag.tone === "info" ? "var(--info)" : tag.tone === "warning" ? "var(--warning)" : "var(--danger)", transition: "width var(--dur-slow) var(--ease-out)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Glass>

              {stats.comments.some((c) => c.texts.length > 0) && (
                <Glass pad={26}>
                  <div style={{ fontFamily: font("body"), fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14 }}>What people wrote, anonymised</div>
                  {stats.comments.map((c) => c.texts.length > 0 && (
                    <div key={c.q} style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: font("display"), fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>{c.q}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {c.texts.slice(0, 4).map((t, i) => (
                          <div key={i} style={{ borderLeft: "3px solid var(--brand)", background: "rgba(28,26,23,0.04)", borderRadius: "0 12px 12px 0", padding: "10px 14px", fontFamily: font("body"), fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.5 }}>{t}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Glass>
              )}

              {!alreadyDone && (
                <Glass pad={22} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 13, background: "var(--candy-blue)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name="signal" size={20} color="var(--ink-fill)" />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: font("display"), fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Your voice is missing</div>
                    <div style={{ fontFamily: font("body"), fontSize: 13, color: "var(--text-secondary)" }}>You haven't taken part in the {cycle} pulse yet.</div>
                  </div>
                  <Button variant="accent" size="sm" onClick={() => { setTab("survey"); setIdx(-1); }}>Take part</Button>
                </Glass>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
