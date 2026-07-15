import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True only when both env vars are present, lets the app run in offline/demo
 *  mode (localStorage only) until the Supabase project is wired up. */
export const supabaseReady = Boolean(url && anon);

/** PKCE flow → magic-link returns as `?code=…` (query), which plays nicely with
 *  our HashRouter. detectSessionInUrl exchanges it automatically on load. */
export const supabase = createClient(url ?? "http://localhost", anon ?? "anon", {
  auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
