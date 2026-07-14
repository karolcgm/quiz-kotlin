-- Alternatywne logowanie ucznia: unikalny, losowy QR + czterocyfrowy PIN.
-- W bazie przechowywany jest wyłącznie SHA-256 tokenu QR i bcrypt PIN-u.

create table if not exists public.student_qr_credentials (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  pin_hash text not null,
  failed_attempts smallint not null default 0 check (failed_attempts between 0 and 5),
  locked_until timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_qr_credentials enable row level security;

-- Brak polityk dostępu bezpośredniego jest celowy: token_hash i pin_hash nie mogą
-- zostać odczytane klientem. Dostęp odbywa się wyłącznie przez poniższe funkcje.
revoke all on table public.student_qr_credentials from anon, authenticated;

create or replace function public.configure_student_qr_login(
  target_token_hash text,
  target_pin text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_student_id uuid := auth.uid();
begin
  if current_student_id is null or not exists (
    select 1
    from public.profiles
    where id = current_student_id
      and role = 'student'
      and status = 'active'
  ) then
    raise exception 'Tylko aktywny uczeń może skonfigurować logowanie QR.';
  end if;

  if target_token_hash is null or target_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Nieprawidłowy token QR.';
  end if;

  if target_pin is null or target_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN musi składać się z dokładnie czterech cyfr.';
  end if;

  insert into public.student_qr_credentials (
    student_id,
    token_hash,
    pin_hash,
    failed_attempts,
    locked_until,
    updated_at
  )
  values (
    current_student_id,
    target_token_hash,
    crypt(target_pin, gen_salt('bf', 11)),
    0,
    null,
    now()
  )
  on conflict (student_id) do update
  set
    token_hash = excluded.token_hash,
    pin_hash = excluded.pin_hash,
    failed_attempts = 0,
    locked_until = null,
    updated_at = now();
end;
$$;

create or replace function public.student_qr_login_status()
returns table (
  configured boolean,
  updated_at timestamptz,
  locked_until timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    credential.student_id is not null,
    credential.updated_at,
    case
      when credential.locked_until > now() then credential.locked_until
      else null
    end
  from (select auth.uid() as student_id) current_user
  left join public.student_qr_credentials credential
    on credential.student_id = current_user.student_id
  where exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'student'
      and profile.status = 'active'
  );
$$;

create or replace function public.disable_student_qr_login()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'student'
      and status = 'active'
  ) then
    raise exception 'Tylko aktywny uczeń może wyłączyć logowanie QR.';
  end if;

  delete from public.student_qr_credentials where student_id = auth.uid();
end;
$$;

create or replace function public.verify_student_qr_login(
  target_token_hash text,
  target_pin text
)
returns table (
  outcome text,
  student_id uuid,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  credential public.student_qr_credentials%rowtype;
  next_attempts smallint;
begin
  if target_token_hash is null
    or target_token_hash !~ '^[0-9a-f]{64}$'
    or target_pin is null
    or target_pin !~ '^[0-9]{4}$'
  then
    return query select 'invalid'::text, null::uuid, null::integer;
    return;
  end if;

  select stored_credential.*
  into credential
  from public.student_qr_credentials stored_credential
  where stored_credential.token_hash = target_token_hash
  for update;

  if not found then
    -- Token ma 256 bitów losowości, więc nie istnieje praktyczna możliwość jego
    -- wyliczenia. Nie uruchamiamy kosztownego bcrypt dla losowych, obcych danych.
    return query select 'invalid'::text, null::uuid, null::integer;
    return;
  end if;

  if credential.locked_until is not null and credential.locked_until > now() then
    return query select
      'locked'::text,
      null::uuid,
      greatest(1, ceil(extract(epoch from (credential.locked_until - now())))::integer);
    return;
  end if;

  if credential.locked_until is not null and credential.locked_until <= now() then
    credential.failed_attempts := 0;
    credential.locked_until := null;
  end if;

  if credential.pin_hash = crypt(target_pin, credential.pin_hash)
    and exists (
      select 1
      from public.profiles
      where id = credential.student_id
        and role = 'student'
        and status = 'active'
    )
  then
    update public.student_qr_credentials as stored_credential
    set
      failed_attempts = 0,
      locked_until = null,
      last_used_at = now(),
      updated_at = now()
    where stored_credential.student_id = credential.student_id;

    return query select 'ok'::text, credential.student_id, null::integer;
    return;
  end if;

  next_attempts := least(5, credential.failed_attempts + 1);

  update public.student_qr_credentials as stored_credential
  set
    failed_attempts = next_attempts,
    locked_until = case
      when next_attempts >= 5 then now() + interval '15 minutes'
      else null
    end,
    updated_at = now()
  where stored_credential.student_id = credential.student_id;

  if next_attempts >= 5 then
    return query select 'locked'::text, null::uuid, 900;
  else
    return query select 'invalid'::text, null::uuid, null::integer;
  end if;
end;
$$;

revoke all on function public.configure_student_qr_login(text, text) from public;
revoke all on function public.student_qr_login_status() from public;
revoke all on function public.disable_student_qr_login() from public;
revoke all on function public.verify_student_qr_login(text, text) from public;

grant execute on function public.configure_student_qr_login(text, text) to authenticated;
grant execute on function public.student_qr_login_status() to authenticated;
grant execute on function public.disable_student_qr_login() to authenticated;
grant execute on function public.verify_student_qr_login(text, text) to service_role;
