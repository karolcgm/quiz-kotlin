-- Jeden nauczyciel może prowadzić tylko jedną niezakończoną sesję.
-- Limit 45 minut zaczyna biec przy pierwszym uruchomieniu (nie w lobby).

alter table public.lesson_sessions
  add column if not exists expires_at timestamptz;

-- Porządkuje historyczne, równoległe sesje przed założeniem ograniczenia.
with ranked as (
  select id, row_number() over (partition by teacher_id order by created_at desc, id desc) position
  from public.lesson_sessions
  where status in ('draft', 'lobby', 'live', 'paused')
)
update public.lesson_sessions session
set status = 'ended', ended_at = coalesce(session.ended_at, now())
from ranked
where session.id = ranked.id and ranked.position > 1;

create unique index if not exists lesson_sessions_one_active_per_teacher_idx
  on public.lesson_sessions (teacher_id)
  where status in ('draft', 'lobby', 'live', 'paused');

create or replace function public.expire_lesson_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  row record;
  v_count integer := 0;
  v_evidence_count integer;
begin
  if auth.uid() is null then return 0; end if;
  for row in
    select session.id, session.record_skill_evidence, session.evidence_recorded_at
    from public.lesson_sessions session
    where session.status in ('live', 'paused')
      and session.expires_at is not null
      and session.expires_at <= now()
      and (
        session.teacher_id = auth.uid()
        or exists (
          select 1 from public.lesson_session_participants participant
          where participant.session_id = session.id and participant.student_id = auth.uid()
        )
      )
    for update skip locked
  loop
    update public.lesson_sessions
    set status = 'ended', ended_at = coalesce(ended_at, expires_at, now())
    where id = row.id;

    if row.record_skill_evidence and row.evidence_recorded_at is null then
      v_evidence_count := public.record_live_session_skill_evidence(row.id);
      update public.lesson_sessions set evidence_recorded_at = now() where id = row.id;
    else
      v_evidence_count := 0;
    end if;

    perform public.append_lesson_session_event(
      row.id,
      'end',
      jsonb_build_object('reason', 'time_limit', 'limitMinutes', 45, 'evidenceCount', v_evidence_count)
    );
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.expire_lesson_sessions() from public, anon;
grant execute on function public.expire_lesson_sessions() to authenticated;

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
  v_active_session_id uuid;
  v_join_code text;
  v_sequence bigint;
  v_assigned_count integer := 0;
begin
  if v_teacher_id is null then raise exception 'Wymagane logowanie nauczyciela.'; end if;
  perform pg_advisory_xact_lock(hashtext(v_teacher_id::text));
  perform public.expire_lesson_sessions();

  select id into v_active_session_id
  from public.lesson_sessions
  where teacher_id = v_teacher_id and status in ('draft', 'lobby', 'live', 'paused')
  order by created_at desc limit 1;
  if v_active_session_id is not null then
    raise exception 'Masz już aktywną sesję. Wróć do niej albo zakończ ją przed utworzeniem nowej.';
  end if;

  if lesson_id is null or char_length(trim(lesson_id)) = 0 then raise exception 'Brak identyfikatora lekcji.'; end if;
  if lesson_version is null or lesson_version < 1 then raise exception 'Nieprawidłowa wersja lekcji.'; end if;
  if stage_snapshot is null or jsonb_typeof(stage_snapshot) <> 'object' then raise exception 'Brak snapshotu etapów lekcji.'; end if;

  select * into v_class from public.teacher_classes where id = target_class_id and teacher_id = v_teacher_id;
  if not found then raise exception 'Nie znaleziono klasy lub brak uprawnień.'; end if;

  v_join_code := public.generate_lesson_join_code();
  insert into public.lesson_sessions (
    id, school_id, class_id, teacher_id, lesson_id, lesson_version,
    join_code_hash, join_code_expires_at, status, pace_mode, stage_snapshot, answer_key, expires_at
  ) values (
    v_session_id, v_class.school_id, v_class.id, v_teacher_id, trim(lesson_id), lesson_version,
    public.lesson_session_join_code_hash(v_session_id, v_join_code),
    now() + interval '45 minutes', 'lobby', coalesce(pace_mode, 'teacher'),
    stage_snapshot, coalesce(answer_key, '{}'::jsonb), null
  );

  insert into public.lesson_session_participants (session_id, student_id, school_id)
  select v_session_id, cm.student_id, v_class.school_id
  from public.class_members cm
  where cm.class_id = v_class.id and cm.school_id = v_class.school_id
  on conflict (session_id, student_id) do update set left_at = null, last_seen_at = now();
  get diagnostics v_assigned_count = row_count;

  v_sequence := public.append_lesson_session_event(v_session_id, 'create', jsonb_build_object('classId', v_class.id, 'lessonId', trim(lesson_id), 'assignedStudentCount', v_assigned_count));
  return jsonb_build_object(
    'sessionId', v_session_id, 'joinCode', v_join_code,
    'joinCodeExpiresAt', (select join_code_expires_at from public.lesson_sessions where id = v_session_id),
    'status', 'lobby', 'sequenceNumber', v_sequence, 'assignedStudentCount', v_assigned_count
  );
end;
$$;

create or replace function public.start_lesson_session(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_sequence bigint;
  v_expires_at timestamptz;
begin
  perform public.expire_lesson_sessions();
  select * into v_session from public.lesson_sessions where id = target_session_id for update;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if v_session.teacher_id <> auth.uid() then raise exception 'Tylko prowadzący może rozpocząć sesję.'; end if;
  if v_session.status not in ('draft', 'lobby', 'paused') then raise exception 'Sesja nie może zostać uruchomiona w stanie %.', v_session.status; end if;

  v_expires_at := coalesce(v_session.expires_at, now() + interval '45 minutes');
  update public.lesson_sessions
  set status = 'live', started_at = coalesce(started_at, now()), expires_at = v_expires_at
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(target_session_id, case when v_session.status = 'paused' then 'resume' else 'start' end, jsonb_build_object('activeStageIndex', v_session.active_stage_index, 'expiresAt', v_expires_at));
  return jsonb_build_object('sessionId', target_session_id, 'status', 'live', 'activeStageIndex', v_session.active_stage_index, 'expiresAt', v_expires_at, 'sequenceNumber', v_sequence);
end;
$$;

-- Ostatnia linia obrony: po czasie odpowiedź nie zostanie zapisana nawet
-- w krótkim oknie pomiędzy odpytywaniem klientów.
create or replace function public.assert_lesson_session_not_expired(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_expires_at timestamptz;
begin
  select expires_at into v_expires_at from public.lesson_sessions where id = target_session_id;
  if v_expires_at is not null and v_expires_at <= now() then
    raise exception 'Minął limit 45 minut. Sesja została zakończona.';
  end if;
end;
$$;

revoke all on function public.assert_lesson_session_not_expired(uuid) from public, anon;
grant execute on function public.assert_lesson_session_not_expired(uuid) to authenticated;

create or replace function public.guard_lesson_response_time_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_lesson_session_not_expired(new.session_id);
  return new;
end;
$$;

drop trigger if exists lesson_response_time_limit_guard on public.lesson_stage_responses;
create trigger lesson_response_time_limit_guard
before insert or update on public.lesson_stage_responses
for each row execute function public.guard_lesson_response_time_limit();
