-- WP-040: sesje lekcji na żywo — schema, RLS, RPC

create type public.lesson_session_status as enum (
  'draft',
  'lobby',
  'live',
  'paused',
  'ended'
);

create type public.lesson_pace_mode as enum (
  'teacher',
  'student'
);

create table if not exists public.lesson_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  lesson_version integer not null check (lesson_version > 0),
  join_code_hash text not null,
  join_code_expires_at timestamptz not null,
  status public.lesson_session_status not null default 'lobby',
  pace_mode public.lesson_pace_mode not null default 'teacher',
  active_stage_index integer not null default 0 check (active_stage_index >= 0),
  stage_snapshot jsonb not null,
  answer_key jsonb not null default '{}'::jsonb,
  sequence_number bigint not null default 0 check (sequence_number >= 0),
  solution_revealed boolean not null default false,
  board_only_mode boolean not null default false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_sessions_teacher_idx
  on public.lesson_sessions (teacher_id, created_at desc);

create index if not exists lesson_sessions_class_status_idx
  on public.lesson_sessions (class_id, status, created_at desc);

create table if not exists public.lesson_session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.lesson_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  left_at timestamptz,
  device_label text check (device_label is null or char_length(device_label) <= 64),
  help_status text not null default 'none' check (help_status in ('none', 'requested')),
  unique (session_id, student_id)
);

create index if not exists lesson_session_participants_session_idx
  on public.lesson_session_participants (session_id, last_seen_at desc);

create table if not exists public.lesson_stage_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.lesson_sessions(id) on delete cascade,
  stage_id text not null,
  question_instance_id text not null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  client_attempt_id uuid not null,
  public_answer jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('draft', 'submitted')),
  score numeric check (score is null or score >= 0),
  max_score numeric not null default 1 check (max_score > 0),
  error_codes text[] not null default '{}',
  submitted_at timestamptz not null default now(),
  unique (session_id, stage_id, question_instance_id, student_id),
  unique (session_id, client_attempt_id)
);

create index if not exists lesson_stage_responses_session_stage_idx
  on public.lesson_stage_responses (session_id, stage_id, student_id);

create table if not exists public.lesson_session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.lesson_sessions(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (
    event_type in (
      'create',
      'rotate_code',
      'join',
      'start',
      'pause',
      'resume',
      'stage_change',
      'reveal',
      'end',
      'submit_response',
      'board_only'
    )
  ),
  sequence_number bigint not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lesson_session_events_session_seq_idx
  on public.lesson_session_events (session_id, sequence_number desc);

-- ── Helpers ─────────────────────────────────────────────────────────────────

create or replace function public.lesson_session_join_code_hash(
  target_session_id uuid,
  join_code_plain text
)
returns text
language sql
immutable
as $$
  select encode(
    digest(
      upper(trim(join_code_plain)) || ':' || target_session_id::text || ':lekcjalab-join-v1',
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.teacher_owns_lesson_session(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_sessions ls
    where ls.id = target_session_id
      and ls.teacher_id = auth.uid()
      and public.teacher_can_access_school(ls.school_id)
  );
$$;

create or replace function public.student_in_lesson_session_class(
  target_session_id uuid,
  target_student_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_sessions ls
    join public.class_members cm
      on cm.class_id = ls.class_id
     and cm.student_id = target_student_id
     and cm.school_id = ls.school_id
    where ls.id = target_session_id
  );
$$;

create or replace function public.is_lesson_session_participant(
  target_session_id uuid,
  target_student_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_session_participants p
    where p.session_id = target_session_id
      and p.student_id = target_student_id
      and p.left_at is null
  );
$$;

create or replace function public.touch_lesson_session_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lesson_sessions_updated_at on public.lesson_sessions;
create trigger lesson_sessions_updated_at
  before update on public.lesson_sessions
  for each row execute function public.touch_lesson_session_updated_at();

create or replace function public.generate_lesson_join_code()
returns text
language plpgsql
as $$
declare
  v_code text;
begin
  v_code := lpad((floor(random() * 900000 + 100000))::text, 6, '0');
  return v_code;
end;
$$;

create or replace function public.append_lesson_session_event(
  target_session_id uuid,
  event_type text,
  event_payload jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sequence bigint;
begin
  update public.lesson_sessions
  set sequence_number = sequence_number + 1
  where id = target_session_id
  returning sequence_number into v_sequence;

  insert into public.lesson_session_events (
    session_id,
    actor_id,
    event_type,
    sequence_number,
    payload
  )
  values (
    target_session_id,
    auth.uid(),
    event_type,
    v_sequence,
    coalesce(event_payload, '{}'::jsonb)
  );

  return v_sequence;
end;
$$;

create or replace function public.lesson_session_public_snapshot(stage_snapshot jsonb)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'lessonId', stage_snapshot ->> 'lessonId',
    'lessonVersion', stage_snapshot -> 'lessonVersion',
    'title', stage_snapshot ->> 'title',
    'topicId', stage_snapshot ->> 'topicId',
    'stages', coalesce(stage_snapshot -> 'stages', '[]'::jsonb)
  );
$$;

-- ── RPC: create ─────────────────────────────────────────────────────────────

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
    id,
    school_id,
    class_id,
    teacher_id,
    lesson_id,
    lesson_version,
    join_code_hash,
    join_code_expires_at,
    status,
    pace_mode,
    stage_snapshot,
    answer_key
  )
  values (
    v_session_id,
    v_class.school_id,
    v_class.id,
    v_teacher_id,
    trim(lesson_id),
    lesson_version,
    public.lesson_session_join_code_hash(v_session_id, v_join_code),
    now() + interval '20 minutes',
    'lobby',
    coalesce(pace_mode, 'teacher'),
    stage_snapshot,
    coalesce(answer_key, '{}'::jsonb)
  );

  v_sequence := public.append_lesson_session_event(
    v_session_id,
    'create',
    jsonb_build_object('classId', v_class.id, 'lessonId', trim(lesson_id))
  );

  return jsonb_build_object(
    'sessionId', v_session_id,
    'joinCode', v_join_code,
    'joinCodeExpiresAt', (select join_code_expires_at from public.lesson_sessions where id = v_session_id),
    'status', 'lobby',
    'sequenceNumber', v_sequence
  );
end;
$$;

-- ── RPC: rotate join code ───────────────────────────────────────────────────

create or replace function public.rotate_lesson_join_code(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_join_code text;
  v_sequence bigint;
begin
  if auth.uid() is null then
    raise exception 'Wymagane logowanie.';
  end if;

  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący może rotować kod dołączenia.';
  end if;

  if v_session.status = 'ended' then
    raise exception 'Sesja została zakończona.';
  end if;

  v_join_code := public.generate_lesson_join_code();

  update public.lesson_sessions
  set
    join_code_hash = public.lesson_session_join_code_hash(target_session_id, v_join_code),
    join_code_expires_at = now() + interval '20 minutes'
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    'rotate_code',
    jsonb_build_object('expiresAt', now() + interval '20 minutes')
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'joinCode', v_join_code,
    'joinCodeExpiresAt', now() + interval '20 minutes',
    'sequenceNumber', v_sequence
  );
end;
$$;

-- ── RPC: join (student) ─────────────────────────────────────────────────────

create or replace function public.join_lesson_session(
  target_session_id uuid,
  join_code_plain text,
  device_label text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_session public.lesson_sessions%rowtype;
  v_sequence bigint;
begin
  if v_student_id is null then
    raise exception 'Wymagane logowanie ucznia.';
  end if;

  if join_code_plain is null or char_length(trim(join_code_plain)) = 0 then
    raise exception 'Podaj kod dołączenia.';
  end if;

  select * into v_session
  from public.lesson_sessions
  where id = target_session_id;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.status = 'ended' then
    raise exception 'Sesja została zakończona.';
  end if;

  if v_session.join_code_expires_at < now() then
    raise exception 'Kod dołączenia wygasł. Poproś nauczyciela o nowy kod.';
  end if;

  if v_session.join_code_hash <> public.lesson_session_join_code_hash(target_session_id, join_code_plain) then
    raise exception 'Nieprawidłowy kod dołączenia.';
  end if;

  if not public.student_in_lesson_session_class(target_session_id, v_student_id) then
    raise exception 'Nie należysz do klasy tej sesji.';
  end if;

  insert into public.lesson_session_participants (
    session_id,
    student_id,
    school_id,
    device_label
  )
  values (
    target_session_id,
    v_student_id,
    v_session.school_id,
    nullif(trim(device_label), '')
  )
  on conflict (session_id, student_id) do update
  set
    last_seen_at = now(),
    left_at = null,
    device_label = coalesce(excluded.device_label, lesson_session_participants.device_label);

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    'join',
    jsonb_build_object('studentId', v_student_id)
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'status', v_session.status,
    'activeStageIndex', v_session.active_stage_index,
    'paceMode', v_session.pace_mode,
    'solutionRevealed', v_session.solution_revealed,
    'boardOnlyMode', v_session.board_only_mode,
    'stageSnapshot', public.lesson_session_public_snapshot(v_session.stage_snapshot),
    'sequenceNumber', v_sequence
  );
end;
$$;

-- ── RPC: lifecycle (teacher) ────────────────────────────────────────────────

create or replace function public.start_lesson_session(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_sequence bigint;
begin
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący może rozpocząć sesję.';
  end if;

  if v_session.status not in ('draft', 'lobby', 'paused') then
    raise exception 'Sesja nie może zostać uruchomiona w stanie %.', v_session.status;
  end if;

  update public.lesson_sessions
  set
    status = 'live',
    started_at = coalesce(started_at, now())
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    case when v_session.status = 'paused' then 'resume' else 'start' end,
    jsonb_build_object('activeStageIndex', v_session.active_stage_index)
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'status', 'live',
    'activeStageIndex', v_session.active_stage_index,
    'sequenceNumber', v_sequence
  );
end;
$$;

create or replace function public.pause_lesson_session(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_sequence bigint;
begin
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący może wstrzymać sesję.';
  end if;

  if v_session.status <> 'live' then
    raise exception 'Sesja nie jest aktywna.';
  end if;

  update public.lesson_sessions
  set status = 'paused'
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    'pause',
    jsonb_build_object('activeStageIndex', v_session.active_stage_index)
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'status', 'paused',
    'sequenceNumber', v_sequence
  );
end;
$$;

create or replace function public.change_lesson_session_stage(
  target_session_id uuid,
  target_stage_index integer,
  reveal_solution boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_stage_count integer;
  v_sequence bigint;
begin
  if target_stage_index is null or target_stage_index < 0 then
    raise exception 'Nieprawidłowy indeks etapu.';
  end if;

  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący może zmieniać etap.';
  end if;

  if v_session.status not in ('live', 'paused', 'lobby') then
    raise exception 'Sesja nie jest aktywna.';
  end if;

  v_stage_count := jsonb_array_length(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb));

  if target_stage_index >= v_stage_count then
    raise exception 'Indeks etapu poza zakresem (0..%).', v_stage_count - 1;
  end if;

  update public.lesson_sessions
  set
    active_stage_index = target_stage_index,
    solution_revealed = case when reveal_solution then true else solution_revealed end,
    status = case when status = 'lobby' then 'live'::public.lesson_session_status else status end,
    started_at = coalesce(started_at, now())
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    case when reveal_solution then 'reveal' else 'stage_change' end,
    jsonb_build_object(
      'activeStageIndex', target_stage_index,
      'revealSolution', coalesce(reveal_solution, false)
    )
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'status', (select status from public.lesson_sessions where id = target_session_id),
    'activeStageIndex', target_stage_index,
    'solutionRevealed', (select solution_revealed from public.lesson_sessions where id = target_session_id),
    'sequenceNumber', v_sequence
  );
end;
$$;

create or replace function public.end_lesson_session(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_sequence bigint;
begin
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący może zakończyć sesję.';
  end if;

  if v_session.status = 'ended' then
    raise exception 'Sesja została już zakończona.';
  end if;

  update public.lesson_sessions
  set status = 'ended', ended_at = now()
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    'end',
    jsonb_build_object('activeStageIndex', v_session.active_stage_index)
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'status', 'ended',
    'endedAt', now(),
    'sequenceNumber', v_sequence
  );
end;
$$;

-- ── RPC: submit response (student) ──────────────────────────────────────────

create or replace function public.submit_lesson_stage_response(
  target_session_id uuid,
  stage_id text,
  question_instance_id text,
  client_attempt_id uuid,
  public_answer jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_session public.lesson_sessions%rowtype;
  v_key_entry jsonb;
  v_expected_index integer;
  v_selected_index integer;
  v_max_score numeric := 1;
  v_score numeric := 0;
  v_response_id uuid;
  v_sequence bigint;
begin
  if v_student_id is null then
    raise exception 'Wymagane logowanie ucznia.';
  end if;

  if client_attempt_id is null then
    raise exception 'Brak identyfikatora próby.';
  end if;

  select * into v_session
  from public.lesson_sessions
  where id = target_session_id;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.status = 'ended' then
    raise exception 'Sesja została zakończona — odpowiedzi są zamknięte.';
  end if;

  if v_session.status not in ('live', 'paused') then
    raise exception 'Sesja nie przyjmuje odpowiedzi w stanie %.', v_session.status;
  end if;

  if not public.is_lesson_session_participant(target_session_id, v_student_id) then
    raise exception 'Najpierw dołącz do sesji.';
  end if;

  -- Idempotencja: istniejąca odpowiedź z tym client_attempt_id
  select id into v_response_id
  from public.lesson_stage_responses
  where session_id = target_session_id
    and client_attempt_id = client_attempt_id;

  if v_response_id is not null then
    return (
      select jsonb_build_object(
        'responseId', r.id,
        'status', r.status,
        'score', r.score,
        'maxScore', r.max_score,
        'submittedAt', r.submitted_at,
        'idempotent', true
      )
      from public.lesson_stage_responses r
      where r.id = v_response_id
    );
  end if;

  select entry into v_key_entry
  from jsonb_array_elements(
    case
      when jsonb_typeof(v_session.answer_key -> 'questions') = 'array'
        then v_session.answer_key -> 'questions'
      else '[]'::jsonb
    end
  ) as entry
  where entry ->> 'questionInstanceId' = question_instance_id
  limit 1;

  v_expected_index := coalesce((v_key_entry -> 'answerSpec' ->> 'firstStepOperatorIndex')::integer, -1);
  v_selected_index := nullif(public_answer ->> 'selectedOperatorIndex', '')::integer;
  v_max_score := coalesce((v_key_entry ->> 'maxScore')::numeric, 1);

  if v_selected_index is not null
    and v_expected_index >= 0
    and v_selected_index = v_expected_index then
    v_score := v_max_score;
  end if;

  insert into public.lesson_stage_responses (
    session_id,
    stage_id,
    question_instance_id,
    student_id,
    school_id,
    client_attempt_id,
    public_answer,
    status,
    score,
    max_score,
    error_codes
  )
  values (
    target_session_id,
    stage_id,
    question_instance_id,
    v_student_id,
    v_session.school_id,
    client_attempt_id,
    coalesce(public_answer, '{}'::jsonb),
    'submitted',
    v_score,
    v_max_score,
    case when v_score = v_max_score then '{}'::text[] else array['wrong-priority']::text[] end
  )
  on conflict (session_id, stage_id, question_instance_id, student_id) do update
  set
    client_attempt_id = excluded.client_attempt_id,
    public_answer = excluded.public_answer,
    score = excluded.score,
    max_score = excluded.max_score,
    error_codes = excluded.error_codes,
    submitted_at = now(),
    status = 'submitted'
  returning id into v_response_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    'submit_response',
    jsonb_build_object(
      'stageId', stage_id,
      'questionInstanceId', question_instance_id,
      'score', v_score
    )
  );

  return jsonb_build_object(
    'responseId', v_response_id,
    'status', 'submitted',
    'score', v_score,
    'maxScore', v_max_score,
    'submittedAt', now(),
    'sequenceNumber', v_sequence,
    'idempotent', false
  );
end;
$$;

-- ── RPC: read projections ───────────────────────────────────────────────────

create or replace function public.get_lesson_session_board_view(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_active_stage jsonb;
begin
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if auth.uid() is not null and v_session.teacher_id <> auth.uid() then
    if not public.teacher_can_access_school(v_session.school_id) then
      raise exception 'Brak dostępu do widoku tablicy.';
    end if;
  end if;

  v_active_stage := coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)
    -> v_session.active_stage_index;

  return jsonb_build_object(
    'sessionId', v_session.id,
    'status', v_session.status,
    'activeStageIndex', v_session.active_stage_index,
    'stageCount', jsonb_array_length(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)),
    'solutionRevealed', v_session.solution_revealed,
    'boardOnlyMode', v_session.board_only_mode,
    'sequenceNumber', v_session.sequence_number,
    'lessonTitle', v_session.stage_snapshot ->> 'title',
    'topicId', v_session.stage_snapshot ->> 'topicId',
    'activeStage', v_active_stage,
    'studentGoal', v_session.stage_snapshot ->> 'studentGoal'
  );
end;
$$;

create or replace function public.get_lesson_session_teacher_view(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_participant_count integer;
  v_response_summary jsonb;
begin
  if auth.uid() is null then
    raise exception 'Wymagane logowanie.';
  end if;

  select * into v_session
  from public.lesson_sessions
  where id = target_session_id;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący ma dostęp do pulpitu sesji.';
  end if;

  select count(*) into v_participant_count
  from public.lesson_session_participants p
  where p.session_id = target_session_id
    and p.left_at is null;

  select coalesce(jsonb_agg(jsonb_build_object(
    'stageId', r.stage_id,
    'submittedCount', cnt,
    'helpRequestedCount', help_cnt
  )), '[]'::jsonb) into v_response_summary
  from (
    select
      r.stage_id,
      count(*) filter (where r.status = 'submitted') as cnt,
      0 as help_cnt
    from public.lesson_stage_responses r
    where r.session_id = target_session_id
    group by r.stage_id
  ) r;

  return jsonb_build_object(
    'sessionId', v_session.id,
    'classId', v_session.class_id,
    'schoolId', v_session.school_id,
    'lessonId', v_session.lesson_id,
    'lessonVersion', v_session.lesson_version,
    'status', v_session.status,
    'paceMode', v_session.pace_mode,
    'activeStageIndex', v_session.active_stage_index,
    'solutionRevealed', v_session.solution_revealed,
    'boardOnlyMode', v_session.board_only_mode,
    'sequenceNumber', v_session.sequence_number,
    'joinCodeExpiresAt', v_session.join_code_expires_at,
    'startedAt', v_session.started_at,
    'endedAt', v_session.ended_at,
    'participantCount', v_participant_count,
    'stageSnapshot', v_session.stage_snapshot,
    'answerKey', v_session.answer_key,
    'responseSummary', v_response_summary
  );
end;
$$;

create or replace function public.heartbeat_lesson_participant(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Wymagane logowanie.';
  end if;

  update public.lesson_session_participants
  set last_seen_at = now()
  where session_id = target_session_id
    and student_id = auth.uid()
    and left_at is null;

  if not found then
    raise exception 'Nie jesteś uczestnikiem tej sesji.';
  end if;
end;
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.lesson_sessions enable row level security;
alter table public.lesson_session_participants enable row level security;
alter table public.lesson_stage_responses enable row level security;
alter table public.lesson_session_events enable row level security;

drop policy if exists "Teachers read own lesson sessions" on public.lesson_sessions;
create policy "Teachers read own lesson sessions"
  on public.lesson_sessions for select
  using (
    teacher_id = auth.uid()
    and public.teacher_can_access_school(school_id)
  );

drop policy if exists "Teachers update own lesson sessions" on public.lesson_sessions;
create policy "Teachers update own lesson sessions"
  on public.lesson_sessions for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- Uczniowie korzystają wyłącznie z RPC (join/get) — brak SELECT na lesson_sessions,
-- aby answer_key nie był dostępny przez PostgREST.

drop policy if exists "Teachers read session participants" on public.lesson_session_participants;
create policy "Teachers read session participants"
  on public.lesson_session_participants for select
  using (public.teacher_owns_lesson_session(session_id));

drop policy if exists "Students read own participation" on public.lesson_session_participants;
create policy "Students read own participation"
  on public.lesson_session_participants for select
  using (student_id = auth.uid());

drop policy if exists "Students update own participation heartbeat" on public.lesson_session_participants;
create policy "Students update own participation heartbeat"
  on public.lesson_session_participants for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "Teachers read stage responses" on public.lesson_stage_responses;
create policy "Teachers read stage responses"
  on public.lesson_stage_responses for select
  using (public.teacher_owns_lesson_session(session_id));

drop policy if exists "Students read own stage responses" on public.lesson_stage_responses;
create policy "Students read own stage responses"
  on public.lesson_stage_responses for select
  using (student_id = auth.uid());

drop policy if exists "Teachers read session events" on public.lesson_session_events;
create policy "Teachers read session events"
  on public.lesson_session_events for select
  using (public.teacher_owns_lesson_session(session_id));

-- Ukryj answer_key przed uczniem przez widok kolumnowy w RPC; bezpośredni SELECT ucznia
-- na lesson_sessions nie zwraca answer_key — polityka ucznia nie obejmuje insert/update.

revoke all on function public.create_lesson_session(
  uuid, text, integer, jsonb, jsonb, public.lesson_pace_mode
) from public, anon;
grant execute on function public.create_lesson_session(
  uuid, text, integer, jsonb, jsonb, public.lesson_pace_mode
) to authenticated;

revoke all on function public.rotate_lesson_join_code(uuid) from public, anon;
grant execute on function public.rotate_lesson_join_code(uuid) to authenticated;

revoke all on function public.join_lesson_session(uuid, text, text) from public, anon;
grant execute on function public.join_lesson_session(uuid, text, text) to authenticated;

revoke all on function public.start_lesson_session(uuid) from public, anon;
grant execute on function public.start_lesson_session(uuid) to authenticated;

revoke all on function public.pause_lesson_session(uuid) from public, anon;
grant execute on function public.pause_lesson_session(uuid) to authenticated;

revoke all on function public.change_lesson_session_stage(uuid, integer, boolean) from public, anon;
grant execute on function public.change_lesson_session_stage(uuid, integer, boolean) to authenticated;

revoke all on function public.end_lesson_session(uuid) from public, anon;
grant execute on function public.end_lesson_session(uuid) to authenticated;

revoke all on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) from public, anon;
grant execute on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) to authenticated;

revoke all on function public.get_lesson_session_board_view(uuid) from public;
grant execute on function public.get_lesson_session_board_view(uuid) to authenticated, anon;

revoke all on function public.get_lesson_session_teacher_view(uuid) from public, anon;
grant execute on function public.get_lesson_session_teacher_view(uuid) to authenticated;

revoke all on function public.heartbeat_lesson_participant(uuid) from public, anon;
grant execute on function public.heartbeat_lesson_participant(uuid) to authenticated;

grant execute on function public.teacher_owns_lesson_session(uuid) to authenticated;
grant execute on function public.student_in_lesson_session_class(uuid, uuid) to authenticated;

/*
RLS test matrix (WP-040 odbiór — uruchomić ręcznie w Supabase SQL Editor):

| Aktor | Własna sesja/klasa | Inna klasa szkoły | Inna szkoła |
|-------|-------------------|-------------------|-------------|
| nauczyciel właściciel | create/start/end OK | join_code bez członkostwa → BŁĄD | BŁĄD |
| nauczyciel inny (ta szkoła) | teacher_view → BŁĄD | BŁĄD | BŁĄD |
| uczeń klasy | join OK + submit OK | join → BŁĄD | BŁĄD |
| uczeń po end | submit → BŁĄD | — | — |
| anon | board_view OK (bez PII) | — | — |
*/
