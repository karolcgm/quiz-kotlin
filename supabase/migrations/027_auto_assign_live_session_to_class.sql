-- Live jest aktywnością klasy, a nie pokojem wymagającym ręcznego dołączania
-- każdego dziecka kodem. Kod/QR pozostaje ścieżką awaryjną dla urządzenia.

create or replace function public.create_lesson_session(
  target_class_id uuid,
  lesson_id text,
  lesson_version integer,
  stage_snapshot jsonb,
  answer_key jsonb default '{}'::jsonb,
  pace_mode public.lesson_pace_mode default 'teacher'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_class public.teacher_classes%rowtype;
  v_session_id uuid := gen_random_uuid();
  v_join_code text;
  v_sequence bigint;
  v_assigned_count integer := 0;
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  if lesson_id is null or char_length(trim(lesson_id)) = 0 then
    raise exception 'Brak identyfikatora lekcji.';
  end if;

  if lesson_version is null or lesson_version < 1 then
    raise exception 'Nieprawidłowa wersja lekcji.';
  end if;

  if stage_snapshot is null or jsonb_typeof(stage_snapshot) <> 'object' then
    raise exception 'Brak snapshotu etapów lekcji.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = target_class_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Nie znaleziono klasy lub brak uprawnień.';
  end if;

  v_join_code := public.generate_lesson_join_code();

  insert into public.lesson_sessions (
    id, school_id, class_id, teacher_id, lesson_id, lesson_version,
    join_code_hash, join_code_expires_at, status, pace_mode, stage_snapshot, answer_key
  ) values (
    v_session_id, v_class.school_id, v_class.id, v_teacher_id, trim(lesson_id), lesson_version,
    public.lesson_session_join_code_hash(v_session_id, v_join_code),
    now() + interval '20 minutes', 'lobby', coalesce(pace_mode, 'teacher'),
    stage_snapshot, coalesce(answer_key, '{}'::jsonb)
  );

  insert into public.lesson_session_participants (session_id, student_id, school_id)
  select v_session_id, cm.student_id, v_class.school_id
  from public.class_members cm
  where cm.class_id = v_class.id
    and cm.school_id = v_class.school_id
  on conflict (session_id, student_id) do update
    set left_at = null,
        last_seen_at = now();

  get diagnostics v_assigned_count = row_count;

  v_sequence := public.append_lesson_session_event(
    v_session_id,
    'create',
    jsonb_build_object(
      'classId', v_class.id,
      'lessonId', trim(lesson_id),
      'assignedStudentCount', v_assigned_count
    )
  );

  return jsonb_build_object(
    'sessionId', v_session_id,
    'joinCode', v_join_code,
    'joinCodeExpiresAt', (select join_code_expires_at from public.lesson_sessions where id = v_session_id),
    'status', 'lobby',
    'sequenceNumber', v_sequence,
    'assignedStudentCount', v_assigned_count
  );
end;
$$;

create or replace function public.list_active_student_lesson_sessions()
returns table (
  session_id uuid,
  lesson_title text,
  topic_id text,
  status public.lesson_session_status,
  class_name text,
  group_name text,
  started_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ls.id,
    coalesce(ls.stage_snapshot ->> 'title', 'Aktywność na żywo'),
    ls.stage_snapshot ->> 'topicId',
    ls.status,
    tc.name,
    tc.group_name,
    ls.started_at,
    ls.created_at
  from public.lesson_session_participants p
  join public.lesson_sessions ls on ls.id = p.session_id
  join public.teacher_classes tc on tc.id = ls.class_id
  where p.student_id = auth.uid()
    and p.left_at is null
    and ls.status in ('lobby', 'live', 'paused')
  order by ls.created_at desc;
$$;

revoke all on function public.list_active_student_lesson_sessions() from public, anon;
grant execute on function public.list_active_student_lesson_sessions() to authenticated;
