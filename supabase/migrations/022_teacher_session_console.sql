-- WP-042: rozszerzony pulpit nauczyciela + tryb tylko tablica

create or replace function public.set_lesson_session_board_only_mode(
  target_session_id uuid,
  enabled boolean
)
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
    raise exception 'Tylko prowadzący może zmieniać tryb tablicy.';
  end if;

  if v_session.status = 'ended' then
    raise exception 'Sesja została zakończona.';
  end if;

  update public.lesson_sessions
  set board_only_mode = coalesce(enabled, false)
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    'board_only',
    jsonb_build_object('enabled', coalesce(enabled, false))
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'boardOnlyMode', coalesce(enabled, false),
    'sequenceNumber', v_sequence
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
  v_class public.teacher_classes%rowtype;
  v_school_name text;
  v_participant_count integer;
  v_response_summary jsonb;
  v_participants jsonb;
  v_active_stage_id text;
  v_histogram jsonb;
  v_active_submitted integer := 0;
  v_help_count integer := 0;
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

  select * into v_class
  from public.teacher_classes
  where id = v_session.class_id;

  select s.name into v_school_name
  from public.schools s
  where s.id = v_session.school_id;

  v_active_stage_id := coalesce(
    v_session.stage_snapshot -> 'stages' -> v_session.active_stage_index ->> 'id',
    null
  );

  select count(*) into v_participant_count
  from public.lesson_session_participants p
  where p.session_id = target_session_id
    and p.left_at is null;

  select count(*) into v_help_count
  from public.lesson_session_participants p
  where p.session_id = target_session_id
    and p.left_at is null
    and p.help_status = 'requested';

  select coalesce(jsonb_agg(jsonb_build_object(
    'participantId', row.participant_id,
    'studentId', row.student_id,
    'displayName', row.display_name,
    'helpStatus', row.help_status,
    'responseStatus', row.response_status,
    'lastSeenAt', row.last_seen_at
  ) order by row.display_name), '[]'::jsonb) into v_participants
  from (
    select
      p.id as participant_id,
      p.student_id,
      coalesce(
        nullif(trim(concat_ws(' ', pr.first_name, pr.last_name)), ''),
        pr.display_name,
        'Uczeń'
      ) as display_name,
      p.help_status,
      case
        when exists (
          select 1
          from public.lesson_stage_responses r
          where r.session_id = p.session_id
            and r.student_id = p.student_id
            and r.stage_id = v_active_stage_id
            and r.status = 'submitted'
        ) then 'submitted'
        else 'waiting'
      end as response_status,
      p.last_seen_at
    from public.lesson_session_participants p
    join public.profiles pr on pr.id = p.student_id
    where p.session_id = target_session_id
      and p.left_at is null
  ) row;

  if v_active_stage_id is not null then
    select count(*) into v_active_submitted
    from public.lesson_stage_responses r
    where r.session_id = target_session_id
      and r.stage_id = v_active_stage_id
      and r.status = 'submitted';

    select coalesce(jsonb_agg(jsonb_build_object(
      'selectedOperatorIndex', bucket.selected_index,
      'count', bucket.cnt
    ) order by bucket.selected_index), '[]'::jsonb) into v_histogram
    from (
      select
        nullif(r.public_answer ->> 'selectedOperatorIndex', '')::integer as selected_index,
        count(*) as cnt
      from public.lesson_stage_responses r
      where r.session_id = target_session_id
        and r.stage_id = v_active_stage_id
        and r.status = 'submitted'
      group by 1
    ) bucket
    where bucket.selected_index is not null;
  else
    v_histogram := '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'stageId', agg.stage_id,
    'submittedCount', agg.submitted_count,
    'helpRequestedCount', agg.help_requested_count
  ) order by agg.stage_id), '[]'::jsonb) into v_response_summary
  from (
    select
      r.stage_id,
      count(*) filter (where r.status = 'submitted') as submitted_count,
      0 as help_requested_count
    from public.lesson_stage_responses r
    where r.session_id = target_session_id
    group by r.stage_id
  ) agg;

  return jsonb_build_object(
    'sessionId', v_session.id,
    'classId', v_session.class_id,
    'schoolId', v_session.school_id,
    'className', v_class.name,
    'groupName', v_class.group_name,
    'schoolName', coalesce(v_school_name, 'Szkoła'),
    'lessonId', v_session.lesson_id,
    'lessonVersion', v_session.lesson_version,
    'lessonTitle', v_session.stage_snapshot ->> 'title',
    'topicId', v_session.stage_snapshot ->> 'topicId',
    'status', v_session.status,
    'paceMode', v_session.pace_mode,
    'activeStageIndex', v_session.active_stage_index,
    'activeStageId', v_active_stage_id,
    'solutionRevealed', v_session.solution_revealed,
    'boardOnlyMode', v_session.board_only_mode,
    'sequenceNumber', v_session.sequence_number,
    'joinCodeExpiresAt', v_session.join_code_expires_at,
    'startedAt', v_session.started_at,
    'endedAt', v_session.ended_at,
    'participantCount', v_participant_count,
    'helpRequestedCount', v_help_count,
    'activeStageSubmittedCount', v_active_submitted,
    'stageSnapshot', v_session.stage_snapshot,
    'answerKey', v_session.answer_key,
    'responseSummary', v_response_summary,
    'participants', v_participants,
    'activeStageHistogram', v_histogram
  );
end;
$$;

revoke all on function public.set_lesson_session_board_only_mode(uuid, boolean) from public, anon;
grant execute on function public.set_lesson_session_board_only_mode(uuid, boolean) to authenticated;
