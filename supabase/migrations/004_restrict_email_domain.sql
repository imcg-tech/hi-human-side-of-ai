-- Restrict sign-up / sign-in to @fluidogroup.com email addresses.
-- This is the AUTHORITATIVE gate: the client-side check in the app is only for
-- nicer error messages and can be bypassed, so account creation must be blocked
-- here at the database level. A new auth user is created on first magic-link
-- request; this trigger rejects any whose email is not on the company domain.
--
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- To allow more domains later, extend the condition (e.g. add another `OR ... LIKE`).

create or replace function public.enforce_company_email_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or lower(new.email) not like '%@fluidogroup.com' then
    raise exception 'Sign-up is restricted to @fluidogroup.com email addresses.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_company_email_domain on auth.users;

create trigger enforce_company_email_domain
  before insert on auth.users
  for each row
  execute function public.enforce_company_email_domain();
