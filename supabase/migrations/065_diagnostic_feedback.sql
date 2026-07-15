-- WP-CONTEXT-03: ustrukturyzowana diagnostyka odpowiedzi bez ujawniania klucza.

alter table public.lesson_stage_responses
  add column if not exists grade_status text,
  add column if not exists feedback_key text;

update public.lesson_stage_responses
set
  grade_status = case
    when score is not null and score = max_score then 'correct'
    when score is not null and score > 0 then 'partially-correct'
    else 'incorrect'
  end,
  feedback_key = case
    when score is not null and score = max_score then 'answer.correct'
    when score is not null and score > 0 then 'answer.partial'
    else 'answer.incorrect'
  end
where grade_status is null or feedback_key is null;

alter table public.lesson_stage_responses
  alter column grade_status set default 'incorrect',
  alter column grade_status set not null,
  alter column feedback_key set default 'answer.incorrect',
  alter column feedback_key set not null;

alter table public.lesson_stage_responses
  drop constraint if exists lesson_stage_responses_grade_status_check;

alter table public.lesson_stage_responses
  add constraint lesson_stage_responses_grade_status_check
  check (grade_status in ('correct', 'partially-correct', 'incorrect', 'manual-review'));

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
set search_path = public, pg_temp
as $$
declare
  student uuid := auth.uid();
  session_row public.lesson_sessions%rowtype;
  key_entry jsonb;
  answer_spec jsonb;
  selected_index integer;
  max_points numeric := 1;
  awarded_points numeric := 0;
  grade text := 'incorrect';
  diagnostic_codes text[] := array['ANSWER_INCORRECT']::text[];
  diagnostic_key text := 'answer.incorrect';
  response_id uuid;
  next_sequence bigint;
  requires_manual_review boolean := false;
  is_valid boolean := false;
  is_partial boolean := false;
begin
  if student is null then raise exception 'Wymagane logowanie ucznia.'; end if;
  if submit_lesson_stage_response.client_attempt_id is null then raise exception 'Brak identyfikatora próby.'; end if;

  select session.* into session_row
  from public.lesson_sessions session
  where session.id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if session_row.expires_at is not null and session_row.expires_at <= now() then
    raise exception 'Minął limit 45 minut. Sesja została zakończona.';
  end if;
  if session_row.status = 'ended' then raise exception 'Sesja została zakończona — odpowiedzi są zamknięte.'; end if;
  if session_row.status not in ('live', 'paused') then
    raise exception 'Sesja nie przyjmuje odpowiedzi w stanie %.', session_row.status;
  end if;
  if session_row.board_only_mode then
    raise exception 'Nauczyciel włączył tryb tylko tablica — tablety są wstrzymane.';
  end if;
  if not public.is_lesson_session_participant(target_session_id, student) then
    raise exception 'Najpierw dołącz do sesji.';
  end if;

  select response.id into response_id
  from public.lesson_stage_responses response
  where response.session_id = target_session_id
    and response.client_attempt_id = submit_lesson_stage_response.client_attempt_id;
  if response_id is not null then
    return (
      select jsonb_build_object(
        'responseId', response.id,
        'status', response.status,
        'score', response.score,
        'maxScore', response.max_score,
        'gradeStatus', response.grade_status,
        'errorCodes', response.error_codes,
        'feedbackKey', response.feedback_key,
        'submittedAt', response.submitted_at,
        'idempotent', true
      )
      from public.lesson_stage_responses response
      where response.id = response_id
    );
  end if;

  select entry into key_entry
  from jsonb_array_elements(
    case
      when jsonb_typeof(session_row.answer_key -> 'questions') = 'array'
        then session_row.answer_key -> 'questions'
      else '[]'::jsonb
    end
  ) entry
  where entry ->> 'questionInstanceId' = submit_lesson_stage_response.question_instance_id
    and entry ->> 'stageId' = submit_lesson_stage_response.stage_id
  limit 1;
  if key_entry is null then raise exception 'Pytanie nie należy do tego etapu sesji.'; end if;

  answer_spec := coalesce(key_entry -> 'answerSpec', '{}'::jsonb);
  max_points := greatest(coalesce((key_entry ->> 'maxScore')::numeric, 1), 0.000001);
  selected_index := nullif(submit_lesson_stage_response.public_answer ->> 'selectedOperatorIndex', '')::integer;
  requires_manual_review := coalesce((answer_spec ->> 'manualReview')::boolean, false);

  if selected_index is not null then
    select exists(
      select 1
      from jsonb_array_elements_text(
        case
          when jsonb_typeof(answer_spec -> 'validNextOperatorIndices') = 'array'
            then answer_spec -> 'validNextOperatorIndices'
          else '[]'::jsonb
        end
      ) valid_index
      where valid_index::integer = selected_index
    ) into is_valid;

    select exists(
      select 1
      from jsonb_array_elements_text(
        case
          when jsonb_typeof(answer_spec -> 'partialOperatorIndices') = 'array'
            then answer_spec -> 'partialOperatorIndices'
          else '[]'::jsonb
        end
      ) partial_index
      where partial_index::integer = selected_index
    ) into is_partial;
  end if;

  if requires_manual_review then
    grade := 'manual-review';
    awarded_points := 0;
    diagnostic_codes := array[coalesce(answer_spec -> 'diagnostics' ->> 'manualReviewErrorCode', 'ANSWER_MANUAL_REVIEW')];
    diagnostic_key := coalesce(answer_spec -> 'diagnostics' ->> 'manualReviewFeedbackKey', 'answer.manual-review');
  elsif selected_index is null then
    grade := 'incorrect';
    awarded_points := 0;
    diagnostic_codes := array[coalesce(answer_spec -> 'diagnostics' ->> 'emptyErrorCode', 'ANSWER_EMPTY')];
    diagnostic_key := coalesce(answer_spec -> 'diagnostics' ->> 'emptyFeedbackKey', 'answer.empty');
  elsif is_valid then
    grade := 'correct';
    awarded_points := max_points;
    diagnostic_codes := '{}'::text[];
    diagnostic_key := coalesce(answer_spec -> 'diagnostics' ->> 'correctFeedbackKey', 'answer.correct');
  elsif is_partial then
    grade := 'partially-correct';
    awarded_points := least(
      max_points - 0.000001,
      greatest(0.000001, coalesce((answer_spec ->> 'partialScore')::numeric, max_points / 2))
    );
    diagnostic_codes := array[coalesce(answer_spec -> 'diagnostics' ->> 'partialErrorCode', 'ANSWER_PARTIAL')];
    diagnostic_key := coalesce(answer_spec -> 'diagnostics' ->> 'partialFeedbackKey', 'answer.partial');
  else
    grade := 'incorrect';
    awarded_points := 0;
    diagnostic_codes := array[coalesce(answer_spec -> 'diagnostics' ->> 'incorrectErrorCode', 'ANSWER_INCORRECT')];
    diagnostic_key := coalesce(answer_spec -> 'diagnostics' ->> 'incorrectFeedbackKey', 'answer.incorrect');
  end if;

  update public.lesson_stage_responses response
  set
    client_attempt_id = submit_lesson_stage_response.client_attempt_id,
    public_answer = coalesce(submit_lesson_stage_response.public_answer, '{}'::jsonb),
    score = awarded_points,
    max_score = max_points,
    grade_status = grade,
    error_codes = diagnostic_codes,
    feedback_key = diagnostic_key,
    submitted_at = now(),
    status = 'submitted'
  where response.session_id = target_session_id
    and response.stage_id = submit_lesson_stage_response.stage_id
    and response.question_instance_id = submit_lesson_stage_response.question_instance_id
    and response.student_id = student
  returning response.id into response_id;

  if response_id is null then
    insert into public.lesson_stage_responses (
      session_id, stage_id, question_instance_id, student_id, school_id,
      client_attempt_id, public_answer, status, score, max_score,
      grade_status, error_codes, feedback_key
    ) values (
      target_session_id, submit_lesson_stage_response.stage_id,
      submit_lesson_stage_response.question_instance_id, student, session_row.school_id,
      submit_lesson_stage_response.client_attempt_id,
      coalesce(submit_lesson_stage_response.public_answer, '{}'::jsonb),
      'submitted', awarded_points, max_points, grade, diagnostic_codes, diagnostic_key
    ) returning id into response_id;
  end if;

  next_sequence := public.append_lesson_session_event(
    target_session_id,
    'submit_response',
    jsonb_build_object(
      'stageId', submit_lesson_stage_response.stage_id,
      'questionInstanceId', submit_lesson_stage_response.question_instance_id,
      'score', awarded_points,
      'gradeStatus', grade,
      'errorCodes', diagnostic_codes
    )
  );

  return jsonb_build_object(
    'responseId', response_id,
    'status', 'submitted',
    'score', awarded_points,
    'maxScore', max_points,
    'gradeStatus', grade,
    'errorCodes', diagnostic_codes,
    'feedbackKey', diagnostic_key,
    'submittedAt', now(),
    'sequenceNumber', next_sequence,
    'idempotent', false
  );
end;
$$;

create or replace function public.get_lesson_session_student_view(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  student uuid := auth.uid();
  session_row public.lesson_sessions%rowtype;
  active_stage jsonb;
  current_help_status text := 'none';
  student_responses jsonb;
begin
  if student is null then raise exception 'Wymagane logowanie ucznia.'; end if;

  select * into session_row from public.lesson_sessions where id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if not public.is_lesson_session_participant(target_session_id, student) then
    raise exception 'Najpierw dołącz do sesji.';
  end if;

  select participant.help_status into current_help_status
  from public.lesson_session_participants participant
  where participant.session_id = target_session_id
    and participant.student_id = student
    and participant.left_at is null;

  active_stage := coalesce(session_row.stage_snapshot -> 'stages', '[]'::jsonb)
    -> session_row.active_stage_index;

  select coalesce(jsonb_agg(jsonb_build_object(
    'stageId', response.stage_id,
    'questionInstanceId', response.question_instance_id,
    'status', response.status,
    'selectedOperatorIndex', nullif(response.public_answer ->> 'selectedOperatorIndex', '')::integer,
    'score', response.score,
    'maxScore', response.max_score,
    'gradeStatus', response.grade_status,
    'errorCodes', response.error_codes,
    'feedbackKey', response.feedback_key,
    'submittedAt', response.submitted_at
  ) order by response.submitted_at desc), '[]'::jsonb) into student_responses
  from public.lesson_stage_responses response
  where response.session_id = target_session_id
    and response.student_id = student
    and response.status = 'submitted';

  return jsonb_build_object(
    'sessionId', session_row.id,
    'status', session_row.status,
    'paceMode', session_row.pace_mode,
    'boardOnlyMode', session_row.board_only_mode,
    'activeStageIndex', session_row.active_stage_index,
    'stageCount', jsonb_array_length(coalesce(session_row.stage_snapshot -> 'stages', '[]'::jsonb)),
    'sequenceNumber', session_row.sequence_number,
    'lessonTitle', session_row.stage_snapshot ->> 'title',
    'topicId', session_row.stage_snapshot ->> 'topicId',
    'activeStage', active_stage,
    'helpStatus', coalesce(current_help_status, 'none'),
    'myResponses', student_responses
  );
end;
$$;

revoke all on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) from public, anon;
revoke all on function public.get_lesson_session_student_view(uuid) from public, anon;
grant execute on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) to authenticated;
grant execute on function public.get_lesson_session_student_view(uuid) to authenticated;

comment on column public.lesson_stage_responses.grade_status is
  'Status diagnostyczny: correct, partially-correct, incorrect albo manual-review.';
comment on column public.lesson_stage_responses.feedback_key is
  'Stabilny klucz treści feedbacku; nie jest kluczem poprawnej odpowiedzi.';
