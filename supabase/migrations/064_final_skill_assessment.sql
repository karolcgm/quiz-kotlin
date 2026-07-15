-- WP-CONTEXT-02: końcowa ocena umiejętności, prywatny wynik i anonimowa tablica.

create or replace function public.submit_live_lesson_understanding(
  target_session_id uuid,
  target_understanding_level text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  student uuid := auth.uid();
  session_row public.lesson_sessions%rowtype;
  active_stage jsonb;
  saved public.lesson_understanding_checks%rowtype;
begin
  if student is null then raise exception 'Wymagane logowanie ucznia.'; end if;
  if target_understanding_level not in ('understood', 'partial', 'not_understood') then
    raise exception 'Wybierz jedną z trzech odpowiedzi.';
  end if;

  select session.* into session_row
  from public.lesson_sessions session
  join public.lesson_session_participants participant
    on participant.session_id = session.id and participant.student_id = student
  where session.id = target_session_id;
  if not found then raise exception 'Nie uczestniczyłeś w tej sesji.'; end if;

  active_stage := coalesce(session_row.stage_snapshot -> 'stages', '[]'::jsonb)
    -> session_row.active_stage_index;
  if session_row.status <> 'ended' and not (
    session_row.status = 'live'
    and active_stage ->> 'kind' = 'understanding'
    and active_stage ->> 'title' = 'Ocena umiejętności'
  ) then
    raise exception 'Samoocena jest dostępna na końcowym etapie lekcji.';
  end if;

  insert into public.lesson_understanding_checks(
    student_id, school_id, class_id, lesson_id, lesson_version,
    curriculum_id, section_id, topic_id, source_type, source_session_id,
    understanding_level
  ) values (
    student, session_row.school_id, session_row.class_id, session_row.lesson_id, session_row.lesson_version,
    session_row.stage_snapshot ->> 'curriculumId', session_row.stage_snapshot ->> 'sectionId',
    session_row.stage_snapshot ->> 'topicId', 'live', session_row.id, target_understanding_level
  )
  on conflict (student_id, source_session_id) where source_type = 'live'
  do update set understanding_level = excluded.understanding_level, updated_at = now()
  returning * into saved;

  return jsonb_build_object(
    'ok', true,
    'understandingLevel', saved.understanding_level,
    'updatedAt', saved.updated_at
  );
end;
$$;

create or replace function public.get_lesson_session_student_view(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_session public.lesson_sessions%rowtype;
  v_active_stage jsonb;
  v_help_status text := 'none';
  v_my_responses jsonb;
begin
  if v_student_id is null then raise exception 'Wymagane logowanie ucznia.'; end if;

  select * into v_session from public.lesson_sessions where id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if not public.is_lesson_session_participant(target_session_id, v_student_id) then
    raise exception 'Najpierw dołącz do sesji.';
  end if;

  select participant.help_status into v_help_status
  from public.lesson_session_participants participant
  where participant.session_id = target_session_id
    and participant.student_id = v_student_id
    and participant.left_at is null;

  v_active_stage := coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)
    -> v_session.active_stage_index;

  select coalesce(jsonb_agg(jsonb_build_object(
    'stageId', response.stage_id,
    'questionInstanceId', response.question_instance_id,
    'status', response.status,
    'selectedOperatorIndex', nullif(response.public_answer ->> 'selectedOperatorIndex', '')::integer,
    'score', response.score,
    'maxScore', response.max_score,
    'submittedAt', response.submitted_at
  ) order by response.submitted_at desc), '[]'::jsonb) into v_my_responses
  from public.lesson_stage_responses response
  where response.session_id = target_session_id
    and response.student_id = v_student_id;

  return jsonb_build_object(
    'sessionId', v_session.id,
    'status', v_session.status,
    'paceMode', v_session.pace_mode,
    'boardOnlyMode', v_session.board_only_mode,
    'activeStageIndex', v_session.active_stage_index,
    'stageCount', jsonb_array_length(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)),
    'sequenceNumber', v_session.sequence_number,
    'lessonTitle', v_session.stage_snapshot ->> 'title',
    'topicId', v_session.stage_snapshot ->> 'topicId',
    'activeStage', v_active_stage,
    'helpStatus', coalesce(v_help_status, 'none'),
    'myResponses', v_my_responses
  );
end;
$$;

create or replace function public.get_lesson_session_board_view(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_active_stage jsonb;
  v_active_stage_id text;
  v_participant_count integer := 0;
  v_active_submitted integer := 0;
  v_active_correct integer := 0;
  v_stage_summaries jsonb := '[]'::jsonb;
  v_understanding_summary jsonb;
begin
  select * into v_session from public.lesson_sessions where id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;

  if auth.uid() is not null and v_session.teacher_id <> auth.uid() then
    if not public.teacher_can_access_school(v_session.school_id) then
      raise exception 'Brak dostępu do widoku tablicy.';
    end if;
  end if;

  v_active_stage := coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)
    -> v_session.active_stage_index;
  v_active_stage_id := v_active_stage ->> 'id';

  select count(*) into v_participant_count
  from public.lesson_session_participants participant
  where participant.session_id = target_session_id and participant.left_at is null;

  if v_active_stage_id is not null then
    select
      count(*) filter (where response.status = 'submitted'),
      count(*) filter (where response.status = 'submitted' and response.score = response.max_score)
    into v_active_submitted, v_active_correct
    from public.lesson_stage_responses response
    where response.session_id = target_session_id and response.stage_id = v_active_stage_id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'stageId', aggregate.stage_id,
    'submittedCount', aggregate.submitted_count,
    'correctCount', aggregate.correct_count
  ) order by aggregate.stage_id), '[]'::jsonb) into v_stage_summaries
  from (
    select response.stage_id,
      count(*) filter (where response.status = 'submitted') submitted_count,
      count(*) filter (where response.status = 'submitted' and response.score = response.max_score) correct_count
    from public.lesson_stage_responses response
    where response.session_id = target_session_id
    group by response.stage_id
  ) aggregate;

  select jsonb_build_object(
    'submittedCount', count(*),
    'understoodCount', count(*) filter (where check_row.understanding_level = 'understood'),
    'partialCount', count(*) filter (where check_row.understanding_level = 'partial'),
    'notUnderstoodCount', count(*) filter (where check_row.understanding_level = 'not_understood')
  ) into v_understanding_summary
  from public.lesson_understanding_checks check_row
  where check_row.source_type = 'live'
    and check_row.source_session_id = target_session_id;

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
    'studentGoal', v_session.stage_snapshot ->> 'studentGoal',
    'activeStage', v_active_stage,
    'activeStageSummary', jsonb_build_object(
      'submittedCount', v_active_submitted,
      'correctCount', case when v_session.solution_revealed then v_active_correct else null end
    ),
    'understandingSummary', case
      when v_active_stage ->> 'kind' = 'understanding' then v_understanding_summary
      else null
    end,
    'stageSummaries', v_stage_summaries,
    'participantCount', case when v_session.status = 'ended' then v_participant_count else null end
  );
end;
$$;

revoke all on function public.submit_live_lesson_understanding(uuid, text) from public, anon;
revoke all on function public.get_lesson_session_student_view(uuid) from public, anon;
grant execute on function public.submit_live_lesson_understanding(uuid, text) to authenticated;
grant execute on function public.get_lesson_session_student_view(uuid) to authenticated;
