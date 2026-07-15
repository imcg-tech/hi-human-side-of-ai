import { useEffect, useRef, type ReactNode } from "react";
import { supabase, supabaseReady } from "./supabase";
import { useStore, type DiscProfile } from "./store";
import { useAuth } from "./auth";
import type { MemberProfile, Dim } from "../data/teamInsights";

const today = () => new Date().toISOString().slice(0, 10);

const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

export interface SternMatch { id: string; name: string; strength: number; sharedQuestions: string[] }

/** Aggregierte Sternenwarte-Matches mit echten Teamkolleg:innen. */
export async function fetchSternMatches(): Promise<SternMatch[]> {
  if (!supabaseReady) return [];
  const { data, error } = await supabase.rpc("sternenwarte_matches");
  if (error || !data) return [];
  return (data as Array<{ other_id: string; display_name: string | null; shared_count: number; shared_questions: string[] }>).map((r) => ({
    id: r.other_id, name: r.display_name || "Teammitglied", strength: Number(r.shared_count), sharedQuestions: r.shared_questions ?? [],
  })).sort((a, b) => b.strength - a.strength);
}

/** Wer aus dem Team hat dieselbe Antwort gewählt wie du (für das Live-Feedback). */
export async function fetchQuestionMatches(questionId: string, optionId: string): Promise<{ id: string; name: string }[]> {
  if (!supabaseReady) return [];
  const { data, error } = await supabase.rpc("question_matches", { p_question_id: questionId, p_option_id: optionId });
  if (error || !data) return [];
  return (data as Array<{ id: string; display_name: string | null }>).map((r) => ({ id: r.id, name: r.display_name || "Teammitglied" }));
}

/** Real shared team profiles (RPC, consent-gated). Empty in demo mode. */
export async function fetchTeamMembers(): Promise<MemberProfile[]> {
  if (!supabaseReady) return [];
  const { data, error } = await supabase.rpc("team_shared_profiles");
  if (error || !data) return [];
  return (data as Array<{ id: string; display_name: string | null; department: string | null; country: string | null; disc_primary: Dim; disc_secondary: Dim | null; disc_percent: Record<Dim, number> }>).map((r) => ({
    id: r.id,
    name: r.display_name || "Teammitglied",
    initials: initialsOf(r.display_name || "?"),
    role: r.department || "",
    primary: r.disc_primary,
    secondary: r.disc_secondary ?? undefined,
    percent: r.disc_percent,
    country: r.country ?? undefined,
    consentShared: true,
  }));
}

/** Load the signed-in user's row + deck answers from Supabase into the store. */
export async function pullProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!error && data) {
    useStore.getState().hydrate({
      email: data.email ?? user.email ?? null,
      displayName: data.display_name ?? null,
      department: data.department ?? null,
      country: data.country ?? null,
      teamId: data.team_id ?? null,
      discType: data.disc_primary ?? null,
      scores: data.disc_percent ?? null,
      profile: data.disc_primary
        ? { primary: data.disc_primary, secondary: data.disc_secondary, raw: data.disc_raw, percent: data.disc_percent, share: data.disc_share, profileCode: data.disc_code, isBalanced: data.disc_balanced }
        : null,
      shareWithTeam: !!data.share_with_team,
      mood: data.mood ?? null,
      streakCurrent: data.streak_current ?? 0,
      streakLongest: data.streak_longest ?? 0,
      lastAnsweredDate: data.last_answered_date ?? null,
      todayCount: data.today_count ?? 0,
    });
  }

  const { data: answers } = await supabase.from("deck_answers").select("question_id, option_id").eq("user_id", user.id);
  if (answers) {
    const map: Record<string, string> = {};
    answers.forEach((a) => { map[a.question_id] = a.option_id; });
    useStore.getState().hydrate({ deckAnswers: map });
  }
  useStore.getState().hydrate({ profileLoaded: true });
}

/** Write the current store profile/consent/mood/streak back to Supabase. */
export async function pushProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;
  const s = useStore.getState();
  await supabase.from("profiles").update({
    email: s.email ?? user.email,
    display_name: s.displayName,
    department: s.department,
    country: s.country,
    disc_primary: s.profile?.primary ?? null,
    disc_secondary: s.profile?.secondary ?? null,
    disc_raw: s.profile?.raw ?? null,
    disc_percent: s.profile?.percent ?? null,
    disc_share: s.profile?.share ?? null,
    disc_code: s.profile?.profileCode ?? null,
    disc_balanced: s.profile?.isBalanced ?? null,
    disc_completed_at: s.profile ? new Date().toISOString() : null,
    share_with_team: s.shareWithTeam,
    mood: s.mood,
    mood_date: s.mood ? today() : null,
    streak_current: s.streakCurrent,
    streak_longest: s.streakLongest,
    last_answered_date: s.lastAnsweredDate,
    today_count: s.todayCount,
  }).eq("id", user.id);
}

async function pushDeckAnswer(questionId: string, optionId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;
  await supabase.from("deck_answers").upsert({ user_id: user.id, question_id: questionId, option_id: optionId });
}

async function pushAssessment(p: DiscProfile) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;
  await supabase.from("assessments").insert({
    user_id: user.id, primary_type: p.primary, secondary: p.secondary, raw: p.raw, percent: p.percent, share: p.share, code: p.profileCode, balanced: p.isBalanced,
  });
}

/** Keeps the Zustand store and Supabase in sync for the signed-in user.
 *  No-op in demo mode (no Supabase env). Failures are swallowed so the UI
 *  never breaks if the network/DB hiccups. */
export function SyncProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const ready = useRef(false);
  const prevAnswers = useRef<Record<string, string>>({});
  const prevCode = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // on login → pull
  useEffect(() => {
    if (!supabaseReady || !session) { ready.current = false; return; }
    ready.current = false;
    pullProfile().catch(() => {}).finally(() => {
      const st = useStore.getState();
      prevAnswers.current = { ...st.deckAnswers };
      prevCode.current = st.profile?.profileCode ?? null;
      ready.current = true;
    });
  }, [session]);

  // on store change → push (debounced for profile, immediate per new deck answer)
  useEffect(() => {
    if (!supabaseReady) return;
    const unsub = useStore.subscribe((state) => {
      if (!ready.current || !session) return;

      // new / changed deck answers → upsert individually
      for (const [q, o] of Object.entries(state.deckAnswers)) {
        if (prevAnswers.current[q] !== o) pushDeckAnswer(q, o).catch(() => {});
      }
      prevAnswers.current = { ...state.deckAnswers };

      // new assessment result → append to history
      const code = state.profile?.profileCode ?? null;
      if (code && code !== prevCode.current && state.profile) { pushAssessment(state.profile).catch(() => {}); }
      prevCode.current = code;

      // everything else (profile/consent/mood/streak) → debounced profile push
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { pushProfile().catch(() => {}); }, 600);
    });
    return () => { unsub(); if (timer.current) clearTimeout(timer.current); };
  }, [session]);

  return <>{children}</>;
}
