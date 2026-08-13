import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Glass, Button } from "../components/ds";
import Logo from "../components/Logo";
import { useAuth, ALLOWED_EMAIL_DOMAIN } from "../lib/auth";
import { supabaseReady } from "../lib/supabase";

const linkBtn: React.CSSProperties = { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", color: "var(--accent)", fontWeight: 600 };

const inputStyle: React.CSSProperties = {
  width: "100%", height: 52, padding: "0 18px", marginBottom: 12,
  borderRadius: "var(--radius-input)", border: "1.5px solid var(--border-strong)",
  background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 16,
  color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
};

export default function Login() {
  const navigate = useNavigate();
  const { session, recovery, signInWithPassword, signUpWithPassword, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // already signed in → straight to the app (recovery flow handles itself there)
  useEffect(() => { if (session && !recovery) navigate("/app", { replace: true }); }, [session, recovery, navigate]);

  async function submit() {
    if (!supabaseReady) { navigate("/app"); return; } // demo mode (no backend yet)
    if (!email.trim() || (mode !== "reset" && !password)) return;
    setBusy(true); setError("");
    if (mode === "reset") {
      const res = await resetPassword(email);
      setBusy(false);
      if (res.error) setError(res.error);
      else setNotice(`✉️ Reset link sent to ${email}. Tap it, then choose a new password. (Check spam too.)`);
      return;
    }
    const res = mode === "signin"
      ? await signInWithPassword(email, password)
      : await signUpWithPassword(email, password);
    setBusy(false);
    if (res.error) setError(res.error);
    else if ("needsConfirm" in res && res.needsConfirm) setNotice(`✉️ Almost there! We sent a confirmation link to ${email}. Tap it, then sign in.`);
    // success: the session listener redirects via the effect above
  }

  function switchMode(next: "signin" | "signup" | "reset") {
    setMode(next);
    setError(""); setNotice("");
  }

  return (
    <div style={{ position: "relative", zIndex: 1, width: "100%", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Glass pad={44} style={{ width: 440, textAlign: "left" }}>
        <Logo iconSize={60} hiSize={34} style={{ margin: "0 auto 4px" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, letterSpacing: "-0.008em", color: "var(--text-primary)", margin: "26px 0 10px", lineHeight: 1.08 }}>
          The human side of AI.
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.5, color: "var(--text-secondary)", margin: "0 0 28px" }}>
          Practice listening, leading and trust, with your whole remote team.
        </p>

        {notice ? (
          <div style={{ padding: "18px 18px", borderRadius: "var(--radius-input)", background: "rgba(0,214,143,0.12)", border: "1px solid rgba(0,214,143,0.4)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.5 }}>
            {notice}
          </div>
        ) : (
          <>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`name@${ALLOWED_EMAIL_DOMAIN}`} type="email" autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && submit()} style={inputStyle} />
            {mode !== "reset" && (
              <input value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signin" ? "Your password" : "Choose a password (min. 8 characters)"}
                type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"}
                onKeyDown={(e) => e.key === "Enter" && submit()} style={inputStyle} />
            )}
            <Button variant="primary" size="lg" full onClick={submit} iconRight={<Icon name="arrowRight" size={20} />}>
              {busy ? "One moment …" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
            {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--danger)", margin: "10px 0 0" }}>{error}</p>}
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", margin: "16px 0 0", lineHeight: 1.5 }}>
              {mode === "signin" && (
                <>New here?{" "}
                  <button onClick={() => switchMode("signup")} style={linkBtn}>Create account</button>
                  {" · "}
                  <button onClick={() => switchMode("reset")} style={linkBtn}>Forgot password?</button>
                </>
              )}
              {mode === "signup" && (
                <>Already have an account?{" "}
                  <button onClick={() => switchMode("signin")} style={linkBtn}>Sign in</button>
                </>
              )}
              {mode === "reset" && (
                <>We'll email you a link to set a new password.{" "}
                  <button onClick={() => switchMode("signin")} style={linkBtn}>Back to sign in</button>
                </>
              )}
            </p>
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>
              {supabaseReady ? `For everyone with an @${ALLOWED_EMAIL_DOMAIN} email.` : "Demo mode: no backend connected yet."}
            </p>
          </>
        )}
      </Glass>
    </div>
  );
}
