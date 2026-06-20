-- Follow-up security and flow fixes for LekcjaLab.
-- Apply after 002_harden_auth_and_submissions.sql.

drop policy if exists "Teachers manage classes in their schools" on public.teacher_classes;

create policy "Teachers insert own classes"
  on public.teacher_classes for insert
  with check (
    public.is_active_teacher()
    and teacher_id = auth.uid()
    and public.teacher_can_access_school(school_id)
  );

create policy "Teachers update own classes"
  on public.teacher_classes for update
  using (
    teacher_id = auth.uid()
    and public.teacher_can_access_school(school_id)
  )
  with check (
    teacher_id = auth.uid()
    and public.teacher_can_access_school(school_id)
  );

create policy "Teachers delete own classes"
  on public.teacher_classes for delete
  using (
    teacher_id = auth.uid()
    and public.teacher_can_access_school(school_id)
  );

drop policy if exists "Teachers add students to own school classes" on public.class_members;

create policy "Teachers add students to own classes"
  on public.class_members for insert
  with check (
    invited_by = auth.uid()
    and exists (
      select 1
      from public.teacher_classes tc
      where tc.id = class_members.class_id
        and tc.school_id = class_members.school_id
        and tc.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers manage invitations in their schools" on public.student_invitations;

create policy "Teachers manage own class invitations"
  on public.student_invitations for all
  using (
    teacher_id = auth.uid()
    and public.teacher_can_access_school(school_id)
  )
  with check (
    teacher_id = auth.uid()
    and exists (
      select 1
      from public.teacher_classes tc
      where tc.id = student_invitations.class_id
        and tc.school_id = student_invitations.school_id
        and tc.teacher_id = auth.uid()
    )
  );

drop policy if exists "Students read published assigned tests" on public.tests;

create policy "Students read published assigned tests"
  on public.tests for select
  using (
    status = 'published'
    and exists (
      select 1
      from public.assignments a
      join public.assignment_students ast on ast.assignment_id = a.id
      where a.test_id = tests.id
        and a.status = 'published'
        and ast.student_id = auth.uid()
    )
  );

drop policy if exists "Test items follow test access" on public.test_items;

create policy "Test items follow test access"
  on public.test_items for select
  using (
    exists (
      select 1
      from public.tests t
      where t.id = test_items.test_id
        and (
          (t.teacher_id = auth.uid() and public.teacher_can_access_school(t.school_id))
          or (
            t.status = 'published'
            and exists (
              select 1
              from public.assignments a
              join public.assignment_students ast on ast.assignment_id = a.id
              where a.test_id = t.id
                and a.status = 'published'
                and ast.student_id = auth.uid()
            )
          )
        )
    )
  );

drop policy if exists "Students manage own submissions" on public.submissions;

create policy "Students create own in-progress submissions"
  on public.submissions for insert
  with check (
    student_id = auth.uid()
    and status = 'in_progress'
    and total_score = 0
    and max_score = 0
    and percentage = 0
    and exists (
      select 1
      from public.assignment_students ast
      join public.assignments a on a.id = ast.assignment_id
      where ast.assignment_id = submissions.assignment_id
        and ast.student_id = auth.uid()
        and a.status = 'published'
    )
  );

create or replace function public.attach_student_to_open_assignments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.assignment_students (assignment_id, student_id)
  select a.id, new.student_id
  from public.assignments a
  where a.class_id = new.class_id
    and a.status = 'published'
  on conflict (assignment_id, student_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_class_member_created on public.class_members;

create trigger on_class_member_created
  after insert on public.class_members
  for each row execute function public.attach_student_to_open_assignments();

create or replace function public.validate_invitation_token(target_token uuid)
returns table (
  valid boolean,
  school_name text,
  class_name text,
  group_name text,
  school_grade integer,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    true as valid,
    s.name as school_name,
    tc.name as class_name,
    tc.group_name,
    tc.school_grade,
    si.expires_at
  from public.student_invitations si
  join public.schools s on s.id = si.school_id
  join public.teacher_classes tc on tc.id = si.class_id
  where si.token = target_token
    and si.status = 'open'
    and si.expires_at > now()
  limit 1;
$$;

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
  declared_school_grade integer;
  invited_school_grade integer;
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

    select school_grade
    into invited_school_grade
    from public.teacher_classes
    where id = invitation_row.class_id;

    declared_school_grade := nullif(new.raw_user_meta_data ->> 'school_grade', '')::integer;

    if declared_school_grade is not null and declared_school_grade <> invited_school_grade then
      raise exception 'Wybrana klasa nie zgadza się z zaproszeniem.';
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

revoke update, delete on public.submissions from authenticated;
revoke insert, update, delete on public.submission_scores from authenticated;
grant update on public.submission_scores to authenticated;

grant execute on function public.validate_invitation_token(uuid) to anon, authenticated;
