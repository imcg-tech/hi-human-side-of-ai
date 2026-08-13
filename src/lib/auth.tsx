import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseReady } from "./supabase";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null; needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  session: null,
  loading: true,
  signInWithPassword: async () => ({ error: null }),
  signUpWithPassword: async () => ({ error: null }),
  signOut: async () => {},
});
export const useAuth = () => useContext(Ctx);

/** Sign-in is limited to company email addresses. This is the first line of
 *  defense (better UX); the authoritative check lives server-side in Supabase
 *  (a BEFORE INSERT trigger on auth.users that rejects other domains). */
export const ALLOWED_EMAIL_DOMAIN = "fluidogroup.com";
/** Individually invited guests outside the company domain (exact addresses). */
export const ALLOWED_GUEST_EMAILS = ["tcross@banyansoftware.com"];
export const isAllowedWorkEmail = (email: string) => {
  const e = email.trim().toLowerCase();
  return e.endsWith("@" + ALLOWED_EMAIL_DOMAIN) || ALLOWED_GUEST_EMAILS.includes(e);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(email: string, password: string) {
    if (!isAllowedWorkEmail(email)) {
      return { error: `Please sign in with your @${ALLOWED_EMAIL_DOMAIN} work email.` };
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) return { error: null };
    const raw = (error.message || "").trim();
    if (/invalid login credentials/i.test(raw)) {
      return { error: "Wrong email or password. New here? Use 'Create account' below." };
    }
    return { error: raw || "Couldn't sign in. Please try again." };
  }

  async function signUpWithPassword(email: string, password: string) {
    if (!isAllowedWorkEmail(email)) {
      return { error: `Please sign up with your @${ALLOWED_EMAIL_DOMAIN} work email.` };
    }
    if (password.length < 8) {
      return { error: "Please choose a password with at least 8 characters." };
    }
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      const raw = (error.message || "").trim();
      if (/already registered/i.test(raw)) {
        return { error: "This email already has an account. Use 'Sign in' instead." };
      }
      return { error: raw || "Couldn't create your account. Please try again." };
    }
    // With email confirmation disabled Supabase returns a session right away.
    // If confirmation is still enabled there is no session yet and a mail went out.
    if (!data.session) return { error: null, needsConfirm: true };
    return { error: null };
  }

  async function signOut() { await supabase.auth.signOut(); }

  return <Ctx.Provider value={{ session, loading, signInWithPassword, signUpWithPassword, signOut }}>{children}</Ctx.Provider>;
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
