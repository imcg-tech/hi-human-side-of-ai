-- ============================================================================
-- HI — the Human side of AI · komplettes Datenbank-Schema (Supabase / Postgres)
-- In Supabase: SQL Editor → New query → dieses Skript einfügen → Run.
-- Idempotent gehalten (drop-if-exists), damit es gefahrlos erneut laufen kann.
-- ============================================================================

-- ---------- TABELLEN ----------

create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text,
  display_name       text,
  team_id            uuid references public.teams(id) on delete set null,

  -- aktuelles DISC-Profil (wird beim Re-Test überschrieben)
  disc_primary       text check (disc_primary in ('D','I','S','C')),
  disc_secondary     text check (disc_secondary in ('D','I','S','C')),
  disc_raw           jsonb,
  disc_percent       jsonb,
  disc_share         jsonb,
  disc_code          text,
  disc_balanced      boolean,
  disc_completed_at  timestamptz,
  share_with_team    boolean not null default false,   -- Consent (Team-Insights)

  -- Stimmung (heutiges Signal)
  mood               int,
  mood_date          date,

  -- Sternenwarte-Streak
  streak_current     int not null default 0,
  streak_longest     int not null default 0,
  last_answered_date date,
  today_count        int not null default 0,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Verlauf aller absolvierten Assessments (für „Veränderung über Zeit")
create table if not exists public.assessments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  primary_type text not null,
  secondary    text,
  raw          jsonb,
  percent      jsonb,
  share        jsonb,
  code         text,
  balanced     boolean,
  created_at   timestamptz not null default now()
);

-- Sternenwarte: Antworten pro User & Frage (eine pro Frage)
create table if not exists public.deck_answers (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  question_id text not null,
  option_id   text not null,
  answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- Community-Fragen (Moderation), Pool-Nachschub für die Sternenwarte
create table if not exists public.community_questions (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references public.profiles(id) on delete set null,
  type        text not null check (type in ('single_choice','this_or_that')),
  emoji       text,
  text        text not null,
  options     jsonb not null,          -- [{id,label}, …]
  category    text,
  status      text not null default 'pending' check (status in ('pending','active','rejected','archived')),
  created_at  timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------- neuer User → profiles-Zeile ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Helper: eigenes Team (vermeidet RLS-Rekursion) ----------
create or replace function public.my_team_id()
returns uuid language sql stable security definer set search_path = public as $$
  select team_id from public.profiles where id = auth.uid();
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.assessments         enable row level security;
alter table public.deck_answers        enable row level security;
alter table public.community_questions enable row level security;
alter table public.teams               enable row level security;

-- profiles: eigene Zeile voll; geteilte Profile von Teamkolleg:innen lesbar
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_select_team_shared on public.profiles;
create policy profiles_select_team_shared on public.profiles
  for select using (team_id = public.my_team_id() and share_with_team = true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

-- assessments: nur eigene
drop policy if exists assessments_own on public.assessments;
create policy assessments_own on public.assessments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- deck_answers: nur eigene (Matching läuft über SECURITY-DEFINER-Funktion)
drop policy if exists deck_answers_own on public.deck_answers;
create policy deck_answers_own on public.deck_answers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- community_questions: aktive für alle lesbar; eigene Vorschläge sehen/anlegen
drop policy if exists cq_select_active on public.community_questions;
create policy cq_select_active on public.community_questions
  for select using (status = 'active' or author_id = auth.uid());

drop policy if exists cq_insert_own on public.community_questions;
create policy cq_insert_own on public.community_questions
  for insert with check (author_id = auth.uid() and status = 'pending');

-- teams: Mitglieder dürfen ihr Team lesen
drop policy if exists teams_select_member on public.teams;
create policy teams_select_member on public.teams
  for select using (id = public.my_team_id());

-- ============================================================================
-- RPC-FUNKTIONEN (lesen fremde Daten nur aggregiert / consent-konform)
-- ============================================================================

-- Geteilte Profile der Teamkolleg:innen (für Team-Landkarte & 1:1-Insights)
create or replace function public.team_shared_profiles()
returns table (id uuid, display_name text, disc_primary text, disc_secondary text, disc_percent jsonb)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.disc_primary, p.disc_secondary, p.disc_percent
  from public.profiles p
  where p.team_id = public.my_team_id()
    and p.share_with_team = true
    and p.disc_primary is not null;
$$;

-- Sternenwarte-Matches: wie viele Antworten teilst du mit jeder Kolleg:in
-- (gibt nur Übereinstimmungen zurück — keine fremden Nicht-Treffer-Antworten).
create or replace function public.sternenwarte_matches()
returns table (other_id uuid, display_name text, shared_count bigint, shared_questions text[])
language sql stable security definer set search_path = public as $$
  with me as (
    select question_id, option_id from public.deck_answers where user_id = auth.uid()
  )
  select da.user_id as other_id,
         p.display_name,
         count(*) as shared_count,
         array_agg(da.question_id) as shared_questions
  from public.deck_answers da
  join me on me.question_id = da.question_id and me.option_id = da.option_id
  join public.profiles p on p.id = da.user_id
  where da.user_id <> auth.uid()
    and p.team_id = public.my_team_id()
  group by da.user_id, p.display_name
  order by shared_count desc;
$$;

-- ============================================================================
-- Fertig. Auth → URL Configuration: Redirect-URL der App (z. B. http://localhost:5173/)
-- in Supabase unter Authentication → URL Configuration → Redirect URLs eintragen.
-- ============================================================================
