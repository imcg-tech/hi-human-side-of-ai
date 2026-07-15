-- ============================================================================
-- HI · Migration 003 — Sternenwarte: Pro-Frage-Matching
-- Wer aus deinem Team hat dieselbe Antwort gewählt wie du? (consent-/team-gegated)
-- ============================================================================

create or replace function public.question_matches(p_question_id text, p_option_id text)
returns table (id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name
  from public.deck_answers da
  join public.profiles p on p.id = da.user_id
  where da.question_id = p_question_id
    and da.option_id = p_option_id
    and da.user_id <> auth.uid()
    and p.team_id = public.my_team_id();
$$;
