import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Glass, Button } from "../components/ds";
import Icon from "../components/Icon";
import MoodFace, { MOODS } from "../components/MoodFace";
import PrivacyHint from "../components/PrivacyHint";
import { MODULES, MOOD_SUGGESTIONS } from "../data/modules";
import { useStore } from "../lib/store";

const MIN_TEAM = 4; // Team-Wert nur ab dieser Zahl anonymer Beiträge
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Entry = { mood: number; share: boolean; note?: string };

/* Sanfte, nicht-wertende Beobachtungen. Nur auf aktiven Aufruf, nie diagnostisch. */
function computeInsights(history: Record<string, Entry>): string[] {
  const days = Object.entries(history);
  if (days.length < 4) return [];
  const out: string[] = [];
  const vals = days.map(([, e]) => e.mood);
  const isWknd = (d: string) => { const wd = new Date(d + "T00:00:00").getDay(); return wd === 0 || wd === 6; };
  const wknd = days.filter(([d]) => isWknd(d)).map(([, e]) => e.mood);
  const week = days.filter(([d]) => !isWknd(d)).map(([, e]) => e.mood);
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  if (wknd.length >= 2 && week.length >= 2) {
    if (avg(wknd) - avg(week) >= 0.4) out.push("Your weekends have often felt more energized than weekdays lately.");
    else if (avg(week) - avg(wknd) >= 0.4) out.push("During the week you've often felt a bit more energized than on weekends lately.");
  }
  const counts = [1, 2, 3, 4, 5].map((m) => vals.filter((v) => v === m).length);
  const top = counts.indexOf(Math.max(...counts)) + 1;
  out.push(`Most often you felt “${MOODS[top].label}”.`);
  out.push(`You checked in on ${days.length} ${days.length === 1 ? "day" : "days"}. Nice that you're looking after yourself.`);
  return out.slice(0, 3);
}

export default function SignalView() {
  const navigate = useNavigate();
  const mood = useStore((s) => s.mood);
  const setMood = useStore((s) => s.setMood);
  const moodHistory = useStore((s) => s.moodHistory);
  const moodShareDefault = useStore((s) => s.moodShareDefault);
  const setMoodShare = useStore((s) => s.setMoodShare);
  const setMoodNote = useStore((s) => s.setMoodNote);

  const [tab, setTab] = useState<"heute" | "verlauf" | "team">("heute");
  const [monthOff, setMonthOff] = useState(0);
  const [selDay, setSelDay] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const active = mood ?? 3;
  const today = ymd(new Date());
  const todayEntry = moodHistory[today];
  const share = todayEntry?.share ?? moodShareDefault;

  const SPECIAL: Record<string, { id: string; title: string; desc: string; icon: string; color: string; route: string }> = {
    balance: { id: "balance", title: "Balance", desc: "Your space to recharge, incl. meditation.", icon: "heart", color: "var(--candy-mint)", route: "/app/balance" },
  };
  const suggestions = mood ? (MOOD_SUGGESTIONS[mood] || []).map((id) => SPECIAL[id] ?? MODULES.find((m) => m.id === id)).filter(Boolean) as { id: string; title: string; desc: string; icon: string; color: string; route?: string }[] : [];

  useGSAP(() => {
    if (tab !== "heute") return;
    gsap.fromTo(".mood-svg", { scale: 0.55, rotate: -8 }, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.9)" });
    gsap.fromTo(".mf-eye", { scaleY: 0.1, transformOrigin: "50% 50%" }, { scaleY: 1, duration: 0.45, delay: 0.12, ease: "power2.out" });
    gsap.fromTo(".mf-mouth", { scaleX: 0.4, transformOrigin: "50% 50%" }, { scaleX: 1, duration: 0.5, delay: 0.1, ease: "back.out(2)" });
    gsap.fromTo(".mf-extra", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, delay: 0.28, ease: "back.out(2.6)" });
  }, { dependencies: [active, tab], scope: stage });

  const insights = useMemo(() => computeInsights(moodHistory), [moodHistory]);

  // Kalender-Monat
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + monthOff);
  const year = base.getFullYear(), month = base.getMonth();
  const firstWd = (new Date(year, month, 1).getDay() + 6) % 7; // Montag = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(firstWd).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => ymd(new Date(year, month, i + 1)))];

  const selEntry = selDay ? moodHistory[selDay] : undefined;
  const anonCount = Object.values(moodHistory).filter((e) => e.share).length; // hier nur eigener Beitrag (Demo: kein echtes Team)

  const tabBtn = (k: "heute" | "verlauf" | "team", label: string) => (
    <button key={k} onClick={() => { setTab(k); setSelDay(null); setShowInsights(false); }} style={{ flex: 1, height: 38, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, background: tab === k ? "var(--sand-100)" : "transparent", color: tab === k ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: tab === k ? "var(--shadow-sm)" : "none" }}>{label}</button>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 0 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 580 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, background: "rgba(28,26,23,0.04)", padding: 5, borderRadius: 999 }}>
          {tabBtn("heute", "Today")}{tabBtn("verlauf", "History")}{tabBtn("team", "Team Pulse")}
        </div>

        {/* ── HEUTE ── */}
        {tab === "heute" && (
          <Glass pad={40} style={{ textAlign: "center" }}>
            <div ref={stage} style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 180, height: 180, display: "grid", placeItems: "center", filter: "drop-shadow(0 18px 30px rgba(60,55,48,0.18))" }}>
                <MoodFace mood={active} />
              </div>
            </div>

            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>Your daily pulse</span>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: "10px 0 8px" }}>How are you today?</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 auto 26px", lineHeight: 1.5, maxWidth: 400 }}>Visible only to you. You decide whether your mood contributes anonymously to the team pulse.</p>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map((v) => {
                const on = mood === v, sz = 42 + v * 5;
                return <button key={v} onClick={() => setMood(v)} title={MOODS[v].label}
                  style={{ width: sz, height: sz, borderRadius: "50%", flexShrink: 0, border: on ? "none" : "2px solid var(--border-strong)", background: on ? MOODS[v].color : "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all var(--dur-fast) var(--ease-soft)", boxShadow: on ? "var(--shadow-md)" : "none", transform: on ? "scale(1.08)" : "none" }} />;
              })}
            </div>
            <div style={{ height: 26, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: mood ? MOODS[mood].color : "var(--text-muted)", marginBottom: 18 }}>
              {mood ? MOODS[mood].label : "Tap to share"}
            </div>

            {/* Opt-in nach der Wahl, Default: nur für mich */}
            {todayEntry && (
              <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: "var(--radius-card)", padding: 16, marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", marginBottom: 10 }}>Contribute anonymously to the team pulse?</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setMoodShare(true)} style={{ flex: 1, height: 42, borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, border: share ? "1.5px solid var(--candy-blue-deep)" : "1.5px solid var(--border-strong)", background: share ? "var(--candy-blue)" : "rgba(255,255,255,0.6)", color: share ? "var(--ink-fill)" : "var(--text-secondary)" }}>Yes, anonymously</button>
                  <button onClick={() => setMoodShare(false)} style={{ flex: 1, height: 42, borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, border: !share ? "1.5px solid var(--border-strong)" : "1px solid var(--border-default)", background: !share ? "var(--ink-fill)" : "rgba(255,255,255,0.6)", color: !share ? "var(--text-on-ink)" : "var(--text-secondary)" }}>Just for me</button>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>Anonymous means: your entry flows into a team average, without anyone seeing that it came from you. A team value only appears from {MIN_TEAM} contributions on.</p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: "var(--radius-card)", padding: 18, marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>Suggested for you</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {suggestions.map((m) => (
                    <button key={m.id} onClick={() => navigate(m.route || "/app/modules")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--radius-input)", border: "1px solid var(--border-default)", background: "var(--bg-card)", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 36, height: 36, borderRadius: "50%", background: m.color, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={m.icon} size={18} color="var(--ink-fill)" /></span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{m.title}</span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)" }}>{m.desc}</span>
                      </span>
                      <Icon name="arrowRight" size={18} color="var(--text-muted)" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button variant="primary" size="lg" disabled={mood === null} onClick={() => navigate("/app")}>Save pulse</Button>
          </Glass>
        )}

        {/* ── VERLAUF (private Kalender-Historie) ── */}
        {tab === "verlauf" && (
          <Glass pad={28}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Icon name="lock" size={16} color="var(--text-muted)" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>Just for you, fully private</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0 16px" }}>
              <button onClick={() => setMonthOff((m) => m - 1)} aria-label="Previous month" style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-secondary)" }}><Icon name="arrowLeft" size={16} /></button>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{MONTHS[month]} {year}</span>
              <button onClick={() => setMonthOff((m) => Math.min(0, m + 1))} disabled={monthOff >= 0} aria-label="Next month" style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", cursor: monthOff >= 0 ? "default" : "pointer", opacity: monthOff >= 0 ? 0.4 : 1, display: "grid", placeItems: "center", color: "var(--text-secondary)" }}><Icon name="arrowRight" size={16} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
              {WD.map((d) => <div key={d} style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {cells.map((c, i) => {
                if (!c) return <div key={`b${i}`} />;
                const e = moodHistory[c];
                const dayNum = Number(c.slice(-2));
                const isToday = c === today;
                const sel = c === selDay;
                return (
                  <button key={c} onClick={() => setSelDay(sel ? null : c)} title={e ? MOODS[e.mood].label : "no check-in"}
                    style={{ aspectRatio: "1", borderRadius: 12, cursor: "pointer", display: "grid", placeItems: "center", position: "relative",
                      background: e ? MOODS[e.mood].color : "rgba(28,26,23,0.05)",
                      border: sel ? "2px solid var(--ink-fill)" : isToday ? "2px solid var(--border-strong)" : "1px solid transparent",
                      fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: e ? "var(--ink-fill)" : "var(--text-muted)" }}>
                    {dayNum}{e?.note ? <span style={{ position: "absolute", top: 3, right: 4, width: 5, height: 5, borderRadius: 999, background: "var(--ink-fill)" }} /> : null}
                  </button>
                );
              })}
            </div>

            {/* Tag-Detail */}
            {selDay && (
              <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: selEntry ? MOODS[selEntry.mood].color : "rgba(28,26,23,0.08)" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--text-primary)" }}>{selDay.split("-").reverse().join(".")} · {selEntry ? MOODS[selEntry.mood].label : "no check-in"}</span>
                </div>
                {selEntry ? (
                  <textarea value={selEntry.note ?? ""} onChange={(e) => setMoodNote(selDay, e.target.value)} placeholder="Private note for this day (just for you) …"
                    style={{ width: "100%", minHeight: 56, resize: "vertical", boxSizing: "border-box", borderRadius: 12, border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.7)", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", outline: "none", lineHeight: 1.5 }} />
                ) : (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>You didn't check in on this day. No worries at all.</p>
                )}
              </div>
            )}

            {/* Einsichten, nur auf aktiven Aufruf */}
            <div style={{ marginTop: 18 }}>
              {!showInsights ? (
                <button onClick={() => setShowInsights(true)} style={{ width: "100%", height: 46, borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon name="eye" size={17} /> See patterns
                </button>
              ) : (
                <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(28,26,23,0.04)" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Gentle observations</div>
                  {insights.length === 0 ? (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", margin: 0, lineHeight: 1.5 }}>Not enough entries for patterns yet. Check in for a few days and something gentle will appear here.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {insights.map((t, i) => <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.45 }}><span style={{ width: 7, height: 7, borderRadius: 999, marginTop: 7, flexShrink: 0, background: "var(--candy-blue-deep)" }} />{t}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Glass>
        )}

        {/* ── TEAM-PULS (anonym, nur ab Mindestzahl) ── */}
        {tab === "team" && (
          <Glass pad={28}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Anonymous team pulse</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: 1.5 }}>Only an aggregated trend, never individual data. No link to performance or HR. Visible only from {MIN_TEAM} anonymous contributions on.</p>
            <PrivacyHint boxed text={`Anonymous & aggregated. No individual data visible. (from ${MIN_TEAM} people up)`} style={{ marginBottom: 18 }} />
            <div style={{ padding: "22px 20px", borderRadius: 16, background: "rgba(28,26,23,0.04)", textAlign: "center" }}>
              <Icon name="lock" size={22} color="var(--text-muted)" />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "10px 0 4px" }}>No team value yet</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>Currently {anonCount} of {MIN_TEAM} anonymous contributions. Once enough people contribute voluntarily, a gentle team trend appears here, without anyone being able to see individual moods.</p>
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}
