-- Praca domowa (okno OD–DO), oznaczanie sprawdzenia przez nauczyciela, notatki dziennika.

create type public.assignment_kind as enum ('classwork', 'homework');

alter table public.assignments
  add column if not exists starts_at timestamptz,
  add column if not exists kind public.assignment_kind not null default 'classwork';

alter table public.submissions
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id);

create table if not exists public.gradebook_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gradebook_notes_student_teacher_idx
  on public.gradebook_notes (student_id, teacher_id, updated_at desc);

alter table public.gradebook_notes enable row level security;

drop policy if exists "Teachers manage gradebook notes" on public.gradebook_notes;
create policy "Teachers manage gradebook notes"
  on public.gradebook_notes for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "Students read own gradebook notes" on public.gradebook_notes;
create policy "Students read own gradebook notes"
  on public.gradebook_notes for select
  using (student_id = auth.uid());

drop function if exists public.create_test_assignment(uuid, uuid, text, integer, timestamptz, uuid[], integer);

create or replace function public.create_test_assignment(
  target_test_id uuid,
  target_class_id uuid,
  assignment_title text,
  max_attempts integer,
  due_at timestamptz default null,
  target_student_ids uuid[] default null,
  time_limit_minutes integer default null,
  starts_at timestamptz default null,
  assignment_kind public.assignment_kind default 'classwork'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_test public.tests%rowtype;
  v_class public.teacher_classes%rowtype;
  v_assignment_id uuid;
  v_student_id uuid;
  v_count integer := 0;
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  if max_attempts < 1 or max_attempts > 5 then
    raise exception 'Liczba prób musi być od 1 do 5.';
  end if;

  if time_limit_minutes is not null and time_limit_minutes < 1 then
    raise exception 'Limit czasu musi być co najmniej 1 minuta.';
  end if;

  if starts_at is not null and due_at is not null and starts_at > due_at then
    raise exception 'Data rozpoczęcia nie może być późniejsza niż termin zakończenia.';
  end if;

  select * into v_test
  from public.tests
  where id = target_test_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Nie znaleziono testu.';
  end if;

  if v_test.status <> 'published' then
    raise exception 'Test musi być opublikowany przed wysłaniem do uczniów.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = target_class_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Nie znaleziono klasy/grupy.';
  end if;

  if v_class.school_id <> v_test.school_id then
    raise exception 'Test i grupa muszą należeć do tej samej szkoły.';
  end if;

  insert into public.assignments (
    test_id,
    teacher_id,
    school_id,
    class_id,
    title,
    max_attempts,
    due_at,
    starts_at,
    kind,
    time_limit_minutes,
    status,
    published_at
  )
  values (
    target_test_id,
    v_teacher_id,
    v_test.school_id,
    target_class_id,
    assignment_title,
    max_attempts,
    due_at,
    starts_at,
    assignment_kind,
    time_limit_minutes,
    'published',
    now()
  )
  returning id into v_assignment_id;

  if target_student_ids is null or cardinality(target_student_ids) = 0 then
    insert into public.assignment_students (assignment_id, student_id)
    select v_assignment_id, cm.student_id
    from public.class_members cm
    where cm.class_id = target_class_id;
  else
    foreach v_student_id in array target_student_ids loop
      if exists (
        select 1
        from public.class_members cm
        where cm.class_id = target_class_id
          and cm.student_id = v_student_id
      ) then
        insert into public.assignment_students (assignment_id, student_id)
        values (v_assignment_id, v_student_id)
        on conflict do nothing;
        v_count := v_count + 1;
      end if;
    end loop;

    if v_count = 0 then
      raise exception 'Nie wybrano uczniów z tej grupy.';
    end if;
  end if;

  return v_assignment_id;
end;
$$;

revoke all on function public.create_test_assignment(uuid, uuid, text, integer, timestamptz, uuid[], integer, timestamptz, public.assignment_kind) from public;
grant execute on function public.create_test_assignment(uuid, uuid, text, integer, timestamptz, uuid[], integer, timestamptz, public.assignment_kind) to authenticated;

create or replace function public.mark_submission_reviewed(target_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  update public.submissions s
  set
    reviewed_at = now(),
    reviewed_by = v_teacher_id
  from public.assignments a
  where s.id = target_submission_id
    and s.assignment_id = a.id
    and a.teacher_id = v_teacher_id
    and s.status in ('submitted', 'graded');

  if not found then
    raise exception 'Nie znaleziono oddania do oznaczenia.';
  end if;
end;
$$;

revoke all on function public.mark_submission_reviewed(uuid) from public;
grant execute on function public.mark_submission_reviewed(uuid) to authenticated;

-- Okno dostępności: starts_at <= now <= due_at (lub brak granic)
create or replace function public.start_assignment_attempt(target_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_student_id uuid := auth.uid();
  assignment_row public.assignments%rowtype;
  existing_submission public.submissions%rowtype;
  completed_count integer;
  latest_submission_id uuid;
  latest_retake_allowed boolean;
  new_submission_id uuid;
  new_attempt_number integer;
  expires_at timestamptz;
begin
  if current_student_id is null then
    raise exception 'Musisz być zalogowany jako uczeń.';
  end if;

  select *
  into assignment_row
  from public.assignments
  where id = target_assignment_id
    and status = 'published'
    and (starts_at is null or starts_at <= now())
    and (due_at is null or due_at >= now())
    and exists (
      select 1
      from public.assignment_students ast
      where ast.assignment_id = target_assignment_id
        and ast.student_id = current_student_id
    );

  if not found then
    raise exception 'Test nie jest dostępny dla tego ucznia.';
  end if;

  select *
  into existing_submission
  from public.submissions
  where assignment_id = target_assignment_id
    and student_id = current_student_id
    and status = 'in_progress'
  order by started_at desc
  limit 1;

  if found then
    expires_at := case
      when assignment_row.time_limit_minutes is not null then
        existing_submission.started_at + make_interval(mins => assignment_row.time_limit_minutes)
      else null
    end;

    return jsonb_build_object(
      'submissionId', existing_submission.id,
      'startedAt', existing_submission.started_at,
      'expiresAt', expires_at,
      'timeLimitMinutes', assignment_row.time_limit_minutes
    );
  end if;

  select count(*)
  into completed_count
  from public.submissions
  where assignment_id = target_assignment_id
    and student_id = current_student_id
    and status in ('graded', 'submitted');

  new_attempt_number := completed_count + 1;

  if new_attempt_number > assignment_row.max_attempts then
    select s.id, coalesce(sc.retake_allowed, false)
    into latest_submission_id, latest_retake_allowed
    from public.submissions s
    left join public.submission_scores sc on sc.submission_id = s.id
    where s.assignment_id = target_assignment_id
      and s.student_id = current_student_id
    order by s.attempt_number desc
    limit 1;

    if not coalesce(latest_retake_allowed, false) then
      raise exception 'Limit prób został wykorzystany.';
    end if;

    update public.submission_scores
    set retake_allowed = false, updated_at = now()
    where submission_id = latest_submission_id;
  end if;

  insert into public.submissions (
    assignment_id,
    student_id,
    attempt_number,
    status,
    started_at
  )
  values (
    target_assignment_id,
    current_student_id,
    new_attempt_number,
    'in_progress',
    now()
  )
  returning id into new_submission_id;

  expires_at := case
    when assignment_row.time_limit_minutes is not null then
      now() + make_interval(mins => assignment_row.time_limit_minutes)
    else null
  end;

  return jsonb_build_object(
    'submissionId', new_submission_id,
    'startedAt', now(),
    'expiresAt', expires_at,
    'timeLimitMinutes', assignment_row.time_limit_minutes
  );
end;
$$;

revoke all on function public.start_assignment_attempt(uuid) from public;
grant execute on function public.start_assignment_attempt(uuid) to authenticated;
