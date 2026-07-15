import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Glass, Button } from "../components/ds";
import Logo from "../components/Logo";
import { useAuth } from "../lib/auth";
import { supabaseReady } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { session, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  // already signed in → straight to the app
  useEffect(() => { if (session) navigate("/app", { replace: true }); }, [session, navigate]);

  async function submit() {
    if (!supabaseReady) { navigate("/app"); return; } // demo mode (no backend yet)
    if (!email.trim()) return;
    setStatus("sending"); setError("");
    const { error } = await signInWithEmail(email.trim());
    if (error) { setStatus("error"); setError(error); }
    else setStatus("sent");
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

        {status === "sent" ? (
          <div style={{ padding: "18px 18px", borderRadius: "var(--radius-input)", background: "rgba(0,214,143,0.12)", border: "1px solid rgba(0,214,143,0.4)", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.5 }}>
            ✉️ <strong>Check your email!</strong> We sent a login link to <strong>{email}</strong>. Tap it to get started.
          </div>
        ) : (
          <>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" type="email"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{ width: "100%", height: 52, padding: "0 18px", marginBottom: 12, borderRadius: "var(--radius-input)", border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            <Button variant="primary" size="lg" full onClick={submit} iconRight={<Icon name="arrowRight" size={20} />}>
              {status === "sending" ? "Sending …" : "Send magic link"}
            </Button>
            {status === "error" && <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--danger)", margin: "10px 0 0" }}>{error}</p>}
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", margin: "14px 0 0" }}>
              {supabaseReady ? "No password, you'll get a link by email." : "Demo mode: no backend connected yet."}
            </p>
          </>
        )}
      </Glass>
    </div>
  );
}
