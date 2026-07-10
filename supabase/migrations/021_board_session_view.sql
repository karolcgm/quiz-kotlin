-- WP-041: rozszerzony widok tablicy — anonimowe agregaty bez PII

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
  v_active_stage_id := v_active_stage ->> 'id';

  select count(*) into v_participant_count
  from public.lesson_session_participants p
  where p.session_id = target_session_id
    and p.left_at is null;

  if v_active_stage_id is not null then
    select
      count(*) filter (where r.status = 'submitted'),
      count(*) filter (where r.status = 'submitted' and r.score = r.max_score)
    into v_active_submitted, v_active_correct
    from public.lesson_stage_responses r
    where r.session_id = target_session_id
      and r.stage_id = v_active_stage_id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'stageId', agg.stage_id,
    'submittedCount', agg.submitted_count,
    'correctCount', agg.correct_count
  ) order by agg.stage_id), '[]'::jsonb) into v_stage_summaries
  from (
    select
      r.stage_id,
      count(*) filter (where r.status = 'submitted') as submitted_count,
      count(*) filter (where r.status = 'submitted' and r.score = r.max_score) as correct_count
    from public.lesson_stage_responses r
    where r.session_id = target_session_id
    group by r.stage_id
  ) agg;

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
    'stageSummaries', v_stage_summaries,
    'participantCount', case
      when v_session.status = 'ended' then v_participant_count
      else null
    end
  );
end;
$$;

revoke all on function public.get_lesson_session_board_view(uuid) from public;
grant execute on function public.get_lesson_session_board_view(uuid) to authenticated, anon;
