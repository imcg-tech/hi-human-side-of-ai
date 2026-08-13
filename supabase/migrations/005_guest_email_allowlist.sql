-- Extend the company-domain gate with an allowlist for individually invited
-- guests. Replaces the 004 function in place (same name, same trigger), so it
-- is safe to run whether or not 004 was ever executed.
--
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- To invite more guests later, add their lowercased address to the IN (...) list
-- here AND to ALLOWED_GUEST_EMAILS in src/lib/auth.tsx.

create or replace function public.enforce_company_email_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null
     or (
       lower(new.email) not like '%@fluidogroup.com'
       and lower(new.email) not in ('tcross@banyansoftware.com')
     ) then
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
