-- ============================================================================
-- HI · Migration 002 — Stammdaten (Abteilung, Herkunftsland) + Team-Beitritt
-- In Supabase: SQL Editor → New query → einfügen → Run. Idempotent.
-- ============================================================================

-- Profil-Stammdaten
alter table public.profiles add column if not exists department text;
alter table public.profiles add column if not exists country text;     -- ISO-Land (Herkunft), für die Culture Map

-- Team-Beitritt per Code
alter table public.teams add column if not exists code text;
create unique index if not exists teams_code_key on public.teams (upper(code));

-- Team per Code finden-oder-anlegen und beitreten
create or replace function public.join_team_by_code(p_code text, p_team_name text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare t_id uuid;
begin
  if p_code is null or length(trim(p_code)) = 0 then return null; end if;
  select id into t_id from public.teams where upper(code) = upper(trim(p_code)) limit 1;
  if t_id is null then
    insert into public.teams (name, code) values (coalesce(p_team_name, 'Team ' || upper(trim(p_code))), upper(trim(p_code)))
    returning id into t_id;
  end if;
  update public.profiles set team_id = t_id where id = auth.uid();
  return t_id;
end; $$;

-- Geteilte Team-Profile inkl. Abteilung + Herkunftsland (für Landkarte & Culture Map)
drop function if exists public.team_shared_profiles();
create or replace function public.team_shared_profiles()
returns table (id uuid, display_name text, department text, country text, disc_primary text, disc_secondary text, disc_percent jsonb)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.department, p.country, p.disc_primary, p.disc_secondary, p.disc_percent
  from public.profiles p
  where p.team_id = public.my_team_id()
    and p.share_with_team = true
    and p.disc_primary is not null;
$$;
