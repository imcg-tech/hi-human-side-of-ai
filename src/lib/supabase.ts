import { createClient } from "@supabase/supabase-js";

// Backend wiring active once VITE_SUPABASE_* env vars are set at build time.
const rawUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "").trim();
const rawAnon = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "").trim();

// Only treat the backend as configured when the URL is a real http(s) URL AND a
// key is present. A missing OR malformed/empty VITE_SUPABASE_URL must never reach
// createClient — it throws "Invalid supabaseUrl" at module load and blanks the
// entire app. In that case we fall back to demo mode with a safe placeholder.
const validUrl = /^https?:\/\/[^\s]+$/.test(rawUrl);

/** True only when the backend is properly configured; otherwise the app runs in
 *  offline/demo mode (localStorage only). Guards against an empty/invalid URL. */
export const supabaseReady = validUrl && rawAnon.length > 0;

/** Backend origin for connectivity self-diagnosis (empty in demo mode). */
export const supabaseUrl = supabaseReady ? rawUrl : "";
/** Public (frontend) key, re-exported for the connectivity self-diagnosis. */
export const supabaseAnonKey = supabaseReady ? rawAnon : "";

/** PKCE flow → magic-link returns as `?code=…` (query), which plays nicely with
 *  our HashRouter. detectSessionInUrl exchanges it automatically on load. */
export const supabase = createClient(
  supabaseReady ? rawUrl : "http://localhost",
  supabaseReady ? rawAnon : "anon",
  { auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);
