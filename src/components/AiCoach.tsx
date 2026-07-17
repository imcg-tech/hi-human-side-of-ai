import { useState } from "react";
import Icon from "./Icon";

/**
 * Opt-in AI coaching on a solo practice attempt. Additive: the game's local
 * self-check is always the primary path, this is an extra tip the user can ask
 * for. The wording is transmitted only on click (never automatically) and the
 * endpoint neither stores nor logs it. Degrades quietly when /api/feedback has
 * no key configured (demo mode).
 */

type Kind = "feedback" | "oneclearask";
type Coaching = { warmth: string; sharpen: string; rewrite: string };
type Status = "idle" | "loading" | "done" | "off" | "busy" | "error";

export default function AiCoach({ kind, scenario, text, accent = "var(--brand)" }: { kind: Kind; scenario?: string; text: string; accent?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Coaching | null>(null);

  async function ask() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setStatus("loading");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, scenario, text: trimmed }),
      });
      if (r.status === 503) { setStatus("off"); return; }
      if (r.status === 429) { setStatus("busy"); return; }
      if (!r.ok) { setStatus("error"); return; }
      const data = (await r.json()) as Coaching;
      if (!data?.rewrite) { setStatus("error"); return; }
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const disabled = !text.trim() || status === "loading";

  return (
    <div style={{ marginTop: 14, borderRadius: 14, border: "1px dashed var(--border-strong)", background: "rgba(255,255,255,0.4)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: status === "done" ? 12 : 8 }}>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="sparkles" size={15} color="#fff" /></span>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>AI coach <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 12.5, color: "var(--text-muted)" }}>· optional</span></div>
      </div>

      {status !== "done" && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 12px" }}>
          Want a second opinion on your wording? It stays private, sent only for this tip and never saved.
        </p>
      )}

      {status !== "done" && status !== "off" && (
        <button onClick={ask} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 42, padding: "0 18px", borderRadius: 999, border: "none", background: disabled ? "rgba(28,26,23,0.12)" : "var(--ink-fill)", color: disabled ? "var(--text-muted)" : "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer" }}>
          {status === "loading" ? <><Spinner /> Thinking …</> : <><Icon name="sparkles" size={15} /> Get a tip</>}
        </button>
      )}

      {status === "busy" && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "10px 0 0" }}>The coach is in high demand right now. Give it a minute and try again.</p>
      )}
      {status === "error" && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "10px 0 0" }}>The coach is unavailable right now. Your self-check above still has you covered.</p>
      )}
      {status === "off" && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>The AI coach isn't switched on for this demo. Your self-check above is fully working.</p>
      )}

      {status === "done" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Line label="What works" body={result.warmth} accent={accent} />
          <Line label="One thing to sharpen" body={result.sharpen} accent={accent} />
          <div>
            <div style={rowLabel}>Try this</div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55 }}>{result.rewrite}</div>
          </div>
          <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: 0, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: 12.5, cursor: "pointer" }}>Ask again after editing</button>
        </div>
      )}
    </div>
  );
}

const rowLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 5 };

function Line({ label, body, accent }: { label: string; body: string; accent: string }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, marginTop: 7, flexShrink: 0, background: accent }} />
      <div>
        <div style={rowLabel}>{label}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)", lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

function Spinner() {
  return <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", display: "inline-block", animation: "aicoach-spin 0.7s linear infinite" }} />;
}
