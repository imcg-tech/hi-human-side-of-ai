import { useState } from "react";
import { useAuth } from "../lib/auth";

/* Shown after arriving via a password-recovery email link: the user already has
   a session, but should set their new password before doing anything else. */
export default function NewPasswordOverlay() {
  const { recovery, updatePassword, clearRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!recovery && !done) return null;

  async function save() {
    setBusy(true); setError("");
    const res = await updatePassword(password);
    setBusy(false);
    if (res.error) setError(res.error);
    else setDone(true);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 140, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(28,26,23,0.4)", backdropFilter: "blur(6px)" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "var(--sand-100, #F7F4EF)", borderRadius: 24, boxShadow: "0 24px 70px rgba(28,26,23,0.32)", border: "1px solid var(--border-default)", padding: "28px 26px" }}>
        {done ? (
          <>
            <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 8px" }}>Password updated</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>You're signed in. Next time, use your new password.</p>
            <button onClick={() => setDone(false)} style={{ width: "100%", height: 50, border: "none", borderRadius: 999, cursor: "pointer", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5 }}>
              Continue
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🔑</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: "0 0 8px" }}>Choose a new password</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>You followed a reset link, so set your new password now.</p>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min. 8 characters)" type="password" autoComplete="new-password" autoFocus
              onKeyDown={(e) => e.key === "Enter" && save()}
              style={{ width: "100%", height: 50, padding: "0 16px", marginBottom: 12, borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            <button onClick={save} disabled={busy} style={{ width: "100%", height: 50, border: "none", borderRadius: 999, cursor: "pointer", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Saving …" : "Save password"}
            </button>
            {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--danger)", margin: "10px 0 0" }}>{error}</p>}
            <button onClick={clearRecovery} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
