import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseReady } from "./supabase";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ session: null, loading: true, signInWithEmail: async () => ({ error: null }), signOut: async () => {} });
export const useAuth = () => useContext(Ctx);

/** Sign-in is limited to company email addresses. This is the first line of
 *  defense (better UX); the authoritative check lives server-side in Supabase
 *  (a BEFORE INSERT trigger on auth.users that rejects other domains). */
export const ALLOWED_EMAIL_DOMAIN = "fluidogroup.com";
export const isAllowedWorkEmail = (email: string) => email.trim().toLowerCase().endsWith("@" + ALLOWED_EMAIL_DOMAIN);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithEmail(email: string) {
    if (!isAllowedWorkEmail(email)) {
      return { error: `Please sign in with your @${ALLOWED_EMAIL_DOMAIN} work email.` };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (!error) return { error: null };
    const raw = (error.message || "").trim();
    const looksRateLimited = error.status === 429 || /rate limit/i.test(raw) || raw === "" || raw === "{}";
    const msg = looksRateLimited
      ? "Email limit reached (Supabase's default sender is heavily throttled). Please try again later, or set up your own SMTP."
      : raw || "Couldn't send. Please try again.";
    return { error: msg };
  }
  async function signOut() { await supabase.auth.signOut(); }

  return <Ctx.Provider value={{ session, loading, signInWithEmail, signOut }}>{children}</Ctx.Provider>;
}

/** Gate for protected routes. In demo mode (no Supabase env) it lets everything
 *  through so the app stays fully usable until the backend is configured. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (!supabaseReady) return <>{children}</>;
  if (loading) return <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>…</div>;
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}
