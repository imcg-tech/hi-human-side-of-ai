import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import HiMascot from "./HiMascot";
import { useMediaQuery } from "../lib/useMediaQuery";

/* Home assistant: the Hi mascot asks what's on your mind and, via multiple
   choice, points you to the one game or Balance exercise that fits right now.
   Pure client-side mapping, no data leaves the device. */

type Rec = { title: string; line: string; route: string };
interface Intent { id: string; label: string; emoji: string; rec: Rec; alt?: { title: string; route: string } }

const INTENTS: Intent[] = [
  {
    id: "tension", label: "Something's tense with a colleague", emoji: "🌩️",
    rec: { title: "Cool Down", line: "A 2-minute reset to steady the heat before you respond.", route: "/app/conflict/cooldown" },
    alt: { title: "Repair Kit", route: "/app/conflict/repair" },
  },
  {
    id: "sayit", label: "I want to say something clearly", emoji: "🎯",
    rec: { title: "One Clear Ask", line: "Turn a fuzzy situation into one clear, kind request.", route: "/app/communication/oneclearask" },
    alt: { title: "Feedback Gym", route: "/app/game/feedback" },
  },
  {
    id: "stressed", label: "I feel stressed or wired", emoji: "🫧",
    rec: { title: "Pressure Valve", line: "Let the pressure out with a guided breathing moment.", route: "/app/balance/valve" },
    alt: { title: "Reset Ritual", route: "/app/balance/reset" },
  },
  {
    id: "lowenergy", label: "Low on energy, I need to recharge", emoji: "🌙",
    rec: { title: "Meditation", line: "A calm few minutes to breathe and arrive.", route: "/meditation" },
    alt: { title: "Sound Bath", route: "/app/balance/soundbath" },
  },
  {
    id: "connect", label: "I'd like to feel closer to the team", emoji: "🤝",
    rec: { title: "Common Ground", line: "A light team game about where you each stand.", route: "/app/live/commonground" },
    alt: { title: "Coffee Roulette", route: "/app/balance/coffee" },
  },
  {
    id: "checkin", label: "Just checking in on how I feel", emoji: "💛",
    rec: { title: "Mood check-in", line: "Log how you're doing today. Always private, always yours.", route: "/app/signal" },
  },
];

export default function HiAssistant() {
  const navigate = useNavigate();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [picked, setPicked] = useState<Intent | null>(null);

  return (
    <div style={{ borderRadius: 24, background: "var(--bg-elevated, #F7F4EF)", border: "1px solid var(--border-default)", padding: "20px 20px 18px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: picked ? 14 : 16 }}>
        <div style={{ width: 46, height: 52, flexShrink: 0 }}><HiMascot size={52} pose={picked ? "point" : "wave"} reduced={reduced} /></div>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ask Hi</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--text-primary)", lineHeight: 1.15 }}>
            {picked ? "Then let's try this." : "What's on your mind today?"}
          </div>
        </div>
      </div>

      {!picked ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {INTENTS.map((it) => (
            <button key={it.id} onClick={() => setPicked(it)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", padding: "12px 14px", borderRadius: 14, cursor: "pointer", background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-default)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.35 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{it.emoji}</span>
              <span style={{ flex: 1 }}>{it.label}</span>
              <Icon name="arrowRight" size={16} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => navigate(picked.rec.route)} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", border: "1.5px solid var(--brand)", background: "var(--brand-subtle)", borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--brand-dark)", marginBottom: 4 }}>Try this</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", lineHeight: 1.15 }}>{picked.rec.title}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", margin: "3px 0 12px", lineHeight: 1.5 }}>{picked.rec.line}</div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 42, padding: "0 18px", borderRadius: 999, background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5 }}>
              <Icon name="play" size={15} /> Start
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            {picked.alt ? (
              <button onClick={() => navigate(picked.alt!.route)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>
                or try <strong style={{ color: "var(--text-primary)" }}>{picked.alt.title}</strong> →
              </button>
            ) : <span />}
            <button onClick={() => setPicked(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
              <Icon name="repeat" size={13} /> Ask something else
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
