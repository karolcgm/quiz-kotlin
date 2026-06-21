-- Powiadomienia, prośby o poprawę i RPC pomocnicze.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in (
    'assignment',
    'retake_request',
    'retake_approved',
    'grade_updated',
    'message',
    'test_submitted'
  )),
  title text not null,
  body text not null,
  link_href text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create table public.retake_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index retake_requests_teacher_pending_idx
  on public.retake_requests (assignment_id, status, created_at desc)
  where status = 'pending';

create index retake_requests_submission_idx
  on public.retake_requests (submission_id, created_at desc);

alter table public.notifications enable row level security;
alter table public.retake_requests enable row level security;

create policy "Users read own notifications"
  on public.notifications for select
  using (recipient_id = auth.uid());

create policy "Users mark own notifications read"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "Students read own retake requests"
  on public.retake_requests for select
  using (student_id = auth.uid());

create policy "Teachers read retake requests for own assignments"
  on public.retake_requests for select
  using (public.teacher_owns_assignment(assignment_id));

-- Wewnętrzne tworzenie powiadomienia (security definer).
create or replace function public.create_notification(
  p_recipient_id uuid,
  p_school_id uuid,
  p_sender_id uuid,
  p_kind text,
  p_title text,
  p_body text,
  p_link_href text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (
    recipient_id,
    school_id,
    sender_id,
    kind,
    title,
    body,
    link_href,
    metadata
  )
  values (
    p_recipient_id,
    p_school_id,
    p_sender_id,
    p_kind,
    p_title,
    p_body,
    p_link_href,
    p_metadata
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;

-- Powiadomienie uczniów o nowym teście.
create or replace function public.notify_assignment_students(target_assignment_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment public.assignments%rowtype;
  v_student_id uuid;
  v_count integer := 0;
  v_link text;
begin
  select * into v_assignment
  from public.assignments
  where id = target_assignment_id;

  if not found then
    return 0;
  end if;

  v_link := '/uczen/testy/' || target_assignment_id::text;

  for v_student_id in
    select ast.student_id
    from public.assignment_students ast
    where ast.assignment_id = target_assignment_id
  loop
    perform public.create_notification(
      v_student_id,
      v_assignment.school_id,
      v_assignment.teacher_id,
      'assignment',
      'Nowy test do wykonania',
      coalesce(v_assignment.title, 'Test') || ' został przypisany.',
      v_link,
      jsonb_build_object('assignment_id', target_assignment_id)
    );
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- Uczeń prosi o poprawę.
create or replace function public.request_retake(
  target_submission_id uuid,
  request_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_submission public.submissions%rowtype;
  v_assignment public.assignments%rowtype;
  v_score public.submission_scores%rowtype;
  v_request_id uuid;
  v_existing_id uuid;
begin
  if v_student_id is null then
    raise exception 'Musisz być zalogowany jako uczeń.';
  end if;

  select * into v_submission
  from public.submissions
  where id = target_submission_id
    and student_id = v_student_id
    and status in ('graded', 'submitted');

  if not found then
    raise exception 'Nie znaleziono wyniku testu.';
  end if;

  select * into v_score
  from public.submission_scores
  where submission_id = target_submission_id;

  if coalesce(v_score.retake_allowed, false) then
    raise exception 'Poprawa jest już odblokowana.';
  end if;

  select id into v_existing_id
  from public.retake_requests
  where submission_id = target_submission_id
    and status = 'pending'
  limit 1;

  if v_existing_id is not null then
    raise exception 'Prośba o poprawę została już wysłana.';
  end if;

  select * into v_assignment
  from public.assignments
  where id = v_submission.assignment_id;

  insert into public.retake_requests (
    submission_id,
    assignment_id,
    student_id,
    school_id,
    message,
    status
  )
  values (
    target_submission_id,
    v_submission.assignment_id,
    v_student_id,
    v_assignment.school_id,
    nullif(trim(request_message), ''),
    'pending'
  )
  returning id into v_request_id;

  perform public.create_notification(
    v_assignment.teacher_id,
    v_assignment.school_id,
    v_student_id,
    'retake_request',
    'Prośba o poprawę testu',
    coalesce(nullif(trim(request_message), ''), 'Uczeń prosi o możliwość ponownego wykonania testu.'),
    '/nauczyciel/wyniki/' || target_submission_id::text,
    jsonb_build_object(
      'submission_id', target_submission_id,
      'retake_request_id', v_request_id,
      'assignment_id', v_submission.assignment_id
    )
  );

  return v_request_id;
end;
$$;

-- Nauczyciel zatwierdza poprawę (POPRAW).
create or replace function public.approve_retake(
  target_submission_id uuid,
  target_request_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_submission public.submissions%rowtype;
  v_assignment public.assignments%rowtype;
  v_request public.retake_requests%rowtype;
begin
  if v_teacher_id is null then
    raise exception 'Musisz być zalogowany jako nauczyciel.';
  end if;

  select * into v_submission
  from public.submissions
  where id = target_submission_id;

  if not found then
    raise exception 'Nie znaleziono wyniku.';
  end if;

  if not public.teacher_owns_assignment(v_submission.assignment_id) then
    raise exception 'Brak uprawnień do tego wyniku.';
  end if;

  select * into v_assignment
  from public.assignments
  where id = v_submission.assignment_id;

  update public.submission_scores
  set retake_allowed = true, updated_at = now()
  where submission_id = target_submission_id;

  if target_request_id is not null then
    update public.retake_requests
    set
      status = 'approved',
      reviewed_by = v_teacher_id,
      reviewed_at = now()
    where id = target_request_id
      and submission_id = target_submission_id;
  else
    update public.retake_requests
    set
      status = 'approved',
      reviewed_by = v_teacher_id,
      reviewed_at = now()
    where submission_id = target_submission_id
      and status = 'pending';
  end if;

  perform public.create_notification(
    v_submission.student_id,
    v_assignment.school_id,
    v_teacher_id,
    'retake_approved',
    'Poprawa testu odblokowana',
    'Nauczyciel zezwolił na ponowne wykonanie testu. Nowy wynik zastąpi poprzedni.',
    '/uczen/testy/' || v_submission.assignment_id::text,
    jsonb_build_object(
      'submission_id', target_submission_id,
      'assignment_id', v_submission.assignment_id
    )
  );
end;
$$;

-- Nauczyciel wysyła powiadomienie do grupy lub wybranych uczniów.
create or replace function public.send_teacher_notifications(
  notification_title text,
  notification_body text,
  target_class_id uuid default null,
  target_student_ids uuid[] default null,
  link_href text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_class public.teacher_classes%rowtype;
  v_student_id uuid;
  v_count integer := 0;
begin
  if v_teacher_id is null then
    raise exception 'Musisz być zalogowany jako nauczyciel.';
  end if;

  if notification_title is null or trim(notification_title) = '' then
    raise exception 'Tytuł powiadomienia jest wymagany.';
  end if;

  if notification_body is null or trim(notification_body) = '' then
    raise exception 'Treść powiadomienia jest wymagana.';
  end if;

  if target_class_id is not null then
    select * into v_class
    from public.teacher_classes
    where id = target_class_id
      and teacher_id = v_teacher_id;

    if not found then
      raise exception 'Nie znaleziono klasy/grupy.';
    end if;

    for v_student_id in
      select cm.student_id
      from public.class_members cm
      where cm.class_id = target_class_id
    loop
      perform public.create_notification(
        v_student_id,
        v_class.school_id,
        v_teacher_id,
        'message',
        trim(notification_title),
        trim(notification_body),
        link_href,
        jsonb_build_object('class_id', target_class_id)
      );
      v_count := v_count + 1;
    end loop;

    return v_count;
  end if;

  if target_student_ids is not null and coalesce(array_length(target_student_ids, 1), 0) > 0 then
    foreach v_student_id in array target_student_ids loop
      if exists (
        select 1
        from public.class_members cm
        join public.teacher_classes tc on tc.id = cm.class_id
        where cm.student_id = v_student_id
          and tc.teacher_id = v_teacher_id
      ) then
        perform public.create_notification(
          v_student_id,
          (
            select cm.school_id
            from public.class_members cm
            join public.teacher_classes tc on tc.id = cm.class_id
            where cm.student_id = v_student_id
              and tc.teacher_id = v_teacher_id
            limit 1
          ),
          v_teacher_id,
          'message',
          trim(notification_title),
          trim(notification_body),
          link_href,
          jsonb_build_object('student_id', v_student_id)
        );
        v_count := v_count + 1;
      end if;
    end loop;

    return v_count;
  end if;

  raise exception 'Wybierz grupę lub co najmniej jednego ucznia.';
end;
$$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set read_at = now()
  where id = target_notification_id
    and recipient_id = auth.uid()
    and read_at is null;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.notifications
  set read_at = now()
  where recipient_id = auth.uid()
    and read_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.notify_test_submitted(target_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission public.submissions%rowtype;
  v_assignment public.assignments%rowtype;
  v_student_name text;
begin
  select * into v_submission
  from public.submissions
  where id = target_submission_id
    and status in ('graded', 'submitted');

  if not found then
    return;
  end if;

  select * into v_assignment
  from public.assignments
  where id = v_submission.assignment_id;

  select coalesce(
    p.display_name,
    nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
    'Uczeń'
  )
  into v_student_name
  from public.profiles p
  where p.id = v_submission.student_id;

  perform public.create_notification(
    v_assignment.teacher_id,
    v_assignment.school_id,
    v_submission.student_id,
    'test_submitted',
    'Uczeń oddał test',
    v_student_name || ' ukończył test „' || coalesce(v_assignment.title, 'Test') || '”.',
    '/nauczyciel/wyniki/' || target_submission_id::text,
    jsonb_build_object(
      'submission_id', target_submission_id,
      'assignment_id', v_submission.assignment_id
    )
  );
end;
$$;

create or replace function public.notify_grade_updated(target_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_submission public.submissions%rowtype;
  v_assignment public.assignments%rowtype;
begin
  if v_teacher_id is null then
    raise exception 'Musisz być zalogowany jako nauczyciel.';
  end if;

  select * into v_submission
  from public.submissions
  where id = target_submission_id;

  if not found or not public.teacher_owns_assignment(v_submission.assignment_id) then
    raise exception 'Brak uprawnień.';
  end if;

  select * into v_assignment
  from public.assignments
  where id = v_submission.assignment_id;

  perform public.create_notification(
    v_submission.student_id,
    v_assignment.school_id,
    v_teacher_id,
    'grade_updated',
    'Zaktualizowano ocenę',
    'Nauczyciel zmienił ocenę lub opis Twojego testu.',
    '/uczen/wyniki/' || target_submission_id::text,
    jsonb_build_object('submission_id', target_submission_id)
  );
end;
$$;

grant execute on function public.notify_assignment_students(uuid) to authenticated;
grant execute on function public.notify_test_submitted(uuid) to authenticated;
grant execute on function public.notify_grade_updated(uuid) to authenticated;
grant execute on function public.request_retake(uuid, text) to authenticated;
grant execute on function public.approve_retake(uuid, uuid) to authenticated;
grant execute on function public.send_teacher_notifications(text, text, uuid, uuid[], text) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
