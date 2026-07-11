-- Aktywność online wygasa po 15 sekundach bez heartbeat.
-- Panel nauczyciela pokazuje postęp całej serii oraz bieżący wynik prywatnie,
-- natomiast publiczna tablica nadal nie otrzymuje danych imiennych.
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
  v_active_stage_id text;
  v_active_question_count integer := 0;
  v_participants jsonb;
  v_histogram jsonb;
  v_response_summary jsonb;
  v_participant_count integer := 0;
  v_help_count integer := 0;
  v_active_submitted integer := 0;
begin
  if auth.uid() is null then raise exception 'Wymagane logowanie.'; end if;
  select * into v_session from public.lesson_sessions where id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if v_session.teacher_id <> auth.uid() then raise exception 'Tylko prowadzący ma dostęp do pulpitu sesji.'; end if;

  select * into v_class from public.teacher_classes where id = v_session.class_id;
  select name into v_school_name from public.schools where id = v_session.school_id;
  v_active_stage_id := v_session.stage_snapshot -> 'stages' -> v_session.active_stage_index ->> 'id';
  if jsonb_typeof(v_session.stage_snapshot -> 'stages' -> v_session.active_stage_index -> 'questions') = 'array' then
    v_active_question_count := jsonb_array_length(v_session.stage_snapshot -> 'stages' -> v_session.active_stage_index -> 'questions');
  end if;

  select count(*) into v_participant_count
  from public.lesson_session_participants
  where session_id = target_session_id and left_at is null and last_seen_at >= now() - interval '15 seconds';

  select count(*) into v_help_count
  from public.lesson_session_participants
  where session_id = target_session_id and left_at is null and last_seen_at >= now() - interval '15 seconds' and help_status = 'requested';

  select coalesce(jsonb_agg(jsonb_build_object(
    'participantId', row.participant_id,
    'studentId', row.student_id,
    'displayName', row.display_name,
    'helpStatus', row.help_status,
    'responseStatus', case when row.response_count >= v_active_question_count and v_active_question_count > 0 then 'submitted' when row.response_count > 0 then 'in_progress' else 'waiting' end,
    'responseResult', row.response_result,
    'responseCount', row.response_count,
    'responseTotal', v_active_question_count,
    'correctCount', row.correct_count,
    'lastAnswer', row.last_answer,
    'isOnline', row.last_seen_at >= now() - interval '15 seconds',
    'lastSeenAt', row.last_seen_at
  ) order by row.last_seen_at >= now() - interval '15 seconds' desc, row.display_name), '[]'::jsonb) into v_participants
  from (
    select p.id participant_id, p.student_id,
      coalesce(nullif(trim(concat_ws(' ', pr.first_name, pr.last_name)), ''), pr.display_name, 'Uczeń') display_name,
      p.help_status, p.last_seen_at,
      coalesce(responses.response_count, 0) response_count,
      coalesce(responses.correct_count, 0) correct_count,
      responses.response_result,
      responses.last_answer
    from public.lesson_session_participants p
    join public.profiles pr on pr.id = p.student_id
    left join lateral (
      select
        count(*) filter (where r.status = 'submitted') response_count,
        count(*) filter (where r.status = 'submitted' and r.score >= r.max_score) correct_count,
        (array_agg(case when r.score >= r.max_score then 'correct' else 'incorrect' end order by r.submitted_at desc))[1] response_result
        ,(array_agg(r.public_answer ->> 'answerLabel' order by r.submitted_at desc))[1] last_answer
      from public.lesson_stage_responses r
      where r.session_id = p.session_id and r.student_id = p.student_id and r.stage_id = v_active_stage_id
    ) responses on true
    where p.session_id = target_session_id and p.left_at is null
  ) row;

  select count(*) into v_active_submitted from public.lesson_stage_responses where session_id = target_session_id and stage_id = v_active_stage_id and status = 'submitted';
  select coalesce(jsonb_agg(jsonb_build_object('selectedOperatorIndex', selected_index, 'count', cnt) order by selected_index), '[]'::jsonb) into v_histogram
  from (
    select nullif(public_answer ->> 'selectedOperatorIndex', '')::integer selected_index, count(*) cnt
    from public.lesson_stage_responses where session_id = target_session_id and stage_id = v_active_stage_id and status = 'submitted'
    group by 1
  ) buckets where selected_index is not null;
  select coalesce(jsonb_agg(jsonb_build_object('stageId', stage_id, 'submittedCount', submitted_count, 'helpRequestedCount', 0)), '[]'::jsonb) into v_response_summary
  from (select stage_id, count(*) filter (where status = 'submitted') submitted_count from public.lesson_stage_responses where session_id = target_session_id group by stage_id) summary;

  return jsonb_build_object(
    'sessionId', v_session.id, 'classId', v_session.class_id, 'schoolId', v_session.school_id,
    'className', v_class.name, 'groupName', v_class.group_name, 'schoolName', coalesce(v_school_name, 'Szkoła'),
    'lessonId', v_session.lesson_id, 'lessonVersion', v_session.lesson_version,
    'lessonTitle', v_session.stage_snapshot ->> 'title', 'topicId', v_session.stage_snapshot ->> 'topicId',
    'status', v_session.status, 'paceMode', v_session.pace_mode, 'activeStageIndex', v_session.active_stage_index,
    'activeStageId', v_active_stage_id, 'solutionRevealed', v_session.solution_revealed,
    'boardOnlyMode', v_session.board_only_mode, 'sequenceNumber', v_session.sequence_number,
    'joinCodeExpiresAt', v_session.join_code_expires_at, 'startedAt', v_session.started_at, 'endedAt', v_session.ended_at,
    'participantCount', v_participant_count, 'helpRequestedCount', v_help_count, 'activeStageSubmittedCount', v_active_submitted,
    'stageSnapshot', v_session.stage_snapshot, 'answerKey', v_session.answer_key,
    'responseSummary', v_response_summary, 'participants', v_participants, 'activeStageHistogram', v_histogram
  );
end;
$$;

revoke all on function public.get_lesson_session_teacher_view(uuid) from public, anon;
grant execute on function public.get_lesson_session_teacher_view(uuid) to authenticated;

create or replace function public.get_lesson_session_teacher_results(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_rows jsonb;
begin
  if auth.uid() is null then raise exception 'Wymagane logowanie.'; end if;
  select * into v_session from public.lesson_sessions where id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if v_session.teacher_id <> auth.uid() then raise exception 'Brak dostępu do wyników sesji.'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'studentId', result.student_id,
    'displayName', result.display_name,
    'stageId', result.stage_id,
    'stageTitle', result.stage_title,
    'submittedCount', result.submitted_count,
    'correctCount', result.correct_count,
    'taskCount', result.task_count
  ) order by result.display_name, result.stage_order), '[]'::jsonb) into v_rows
  from (
    select p.student_id,
      coalesce(nullif(trim(concat_ws(' ', pr.first_name, pr.last_name)), ''), pr.display_name, 'Uczeń') display_name,
      stage.value ->> 'id' stage_id,
      stage.value ->> 'title' stage_title,
      stage.ordinality stage_order,
      case when jsonb_typeof(stage.value -> 'questions') = 'array' then jsonb_array_length(stage.value -> 'questions') else 0 end task_count,
      count(r.id) filter (where r.status = 'submitted') submitted_count,
      count(r.id) filter (where r.status = 'submitted' and r.score >= r.max_score) correct_count
    from public.lesson_session_participants p
    join public.profiles pr on pr.id = p.student_id
    cross join lateral jsonb_array_elements(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)) with ordinality stage(value, ordinality)
    left join public.lesson_stage_responses r on r.session_id = p.session_id and r.student_id = p.student_id and r.stage_id = stage.value ->> 'id'
    where p.session_id = target_session_id
    group by p.student_id, pr.first_name, pr.last_name, pr.display_name, stage.value, stage.ordinality
  ) result;
  return jsonb_build_object('rows', v_rows);
end;
$$;

revoke all on function public.get_lesson_session_teacher_results(uuid) from public, anon;
grant execute on function public.get_lesson_session_teacher_results(uuid) to authenticated;
