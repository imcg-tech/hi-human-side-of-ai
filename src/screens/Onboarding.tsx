import { useState, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Glass, Button } from "../components/ds";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import { supabase, supabaseReady } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { useStore } from "../lib/store";
import { COUNTRIES, DEPARTMENTS } from "../data/countries";

const field: React.CSSProperties = { width: "100%", height: 50, padding: "0 16px", borderRadius: "var(--radius-input)", border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
const label: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", margin: "16px 0 7px" };

export default function Onboarding() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const hydrate = useStore((s) => s.hydrate);
  const [name, setName] = useState(useStore.getState().displayName ?? (session?.user?.email?.split("@")[0] ?? ""));
  const [department, setDepartment] = useState(useStore.getState().department ?? "");
  const [country, setCountry] = useState(useStore.getState().country ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    if (!name.trim() || !department || !country) { setError("Please fill in all fields."); setStatus("error"); return; }
    if (!supabaseReady) { navigate("/app"); return; }
    setStatus("saving"); setError("");
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) { setError("Please log in first."); setStatus("error"); return; }
    const { error: e2 } = await supabase.from("profiles").update({ display_name: name.trim(), department, country }).eq("id", user.id);
    if (e2) { setError(e2.message); setStatus("error"); return; }
    // Platzhalter: alle in ein gemeinsames Team, bis die periodische Team-Zuordnung steht.
    const { data: teamId } = await supabase.rpc("join_team_by_code", { p_code: "HI-DEMO", p_team_name: "HI Demo-Team" });
    hydrate({ displayName: name.trim(), department, country, teamId: (teamId as string) ?? null, profileLoaded: true });
    navigate("/app", { replace: true });
  }

  return (
    <div style={{ position: "relative", zIndex: 1, width: "100%", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Glass pad={40} style={{ width: 460, textAlign: "left" }}>
        <Logo iconSize={48} hiSize={28} style={{ margin: "0 auto 8px" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)", margin: "16px 0 6px", lineHeight: 1.1 }}>Welcome! 👋</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>Tell us a little about yourself. It helps with team matching and the Culture Map. Stays private within the team.</p>

        <div style={label}>Your name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" style={field} />

        <div style={label}>Department</div>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} style={field}>
          <option value="">Please choose …</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <div style={label}>Country</div>
        <select value={country} onChange={(e) => setCountry(e.target.value)} style={field}>
          <option value="">Please choose …</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </select>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", margin: "12px 0 0", lineHeight: 1.5 }}>HI puts your team together automatically later, and reshuffles it regularly so you gradually get to know the whole company.</p>

        {status === "error" && <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--danger)", margin: "12px 0 0" }}>{error}</p>}
        <div style={{ marginTop: 22 }}>
          <Button variant="primary" size="lg" full onClick={save} iconRight={<Icon name="arrowRight" size={20} />}>
            {status === "saving" ? "Saving …" : "Let's go"}
          </Button>
        </div>
      </Glass>
    </div>
  );
}

/** Gates the app: profile details first (live only), then the DISC assessment as
 *  the forced first step for new users (demo and live) until done or deferred. */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const profileLoaded = useStore((s) => s.profileLoaded);
  const incomplete = useStore((s) => !s.displayName || !s.department || !s.country);
  const discType = useStore((s) => s.discType);
  const assessmentSkipped = useStore((s) => s.assessmentSkipped);

  if (supabaseReady) {
    if (!profileLoaded) return <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>…</div>;
    if (incomplete && pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  }
  // New user with no profile yet → straight into the assessment (a personal aha,
  // not an exploration tour). "Skip for now" sets assessmentSkipped to release it.
  if (!discType && !assessmentSkipped && pathname !== "/app/assessment") return <Navigate to="/app/assessment" replace />;
  return <>{children}</>;
}
