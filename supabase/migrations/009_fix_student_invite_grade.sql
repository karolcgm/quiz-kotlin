-- Klasa ucznia zawsze pochodzi z zaproszenia (nie z formularza).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_role text;
  requested_role public.user_role;
  invitation_token uuid;
  invitation_row public.student_invitations%rowtype;
begin
  raw_role := nullif(new.raw_user_meta_data ->> 'role', '');

  requested_role :=
    case
      when raw_role = 'teacher' then 'teacher'::public.user_role
      when raw_role = 'student' then 'student'::public.user_role
      else 'student'::public.user_role
    end;

  insert into public.profiles (
    id,
    role,
    status,
    first_name,
    last_name,
    display_name,
    email,
    created_at
  )
  values (
    new.id,
    requested_role,
    case
      when requested_role = 'teacher' then 'pending_admin'::public.profile_status
      else 'active'::public.profile_status
    end,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.email),
    new.email,
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);

  if requested_role = 'student' then
    if nullif(new.raw_user_meta_data ->> 'invitation_token', '') is null then
      raise exception 'Rejestracja ucznia wymaga ważnego zaproszenia.';
    end if;

    invitation_token := (new.raw_user_meta_data ->> 'invitation_token')::uuid;

    select *
    into invitation_row
    from public.student_invitations
    where token = invitation_token
      and status = 'open'
      and expires_at > now()
    for update;

    if not found then
      raise exception 'Zaproszenie jest nieprawidłowe albo wygasło.';
    end if;

    insert into public.class_members (
      class_id,
      school_id,
      student_id,
      invited_by
    )
    values (
      invitation_row.class_id,
      invitation_row.school_id,
      new.id,
      invitation_row.teacher_id
    )
    on conflict (class_id, student_id) do nothing;

    update public.student_invitations
    set
      status = 'used',
      used_by = new.id,
      used_at = now()
    where id = invitation_row.id;
  end if;

  return new;
end;
$$;
