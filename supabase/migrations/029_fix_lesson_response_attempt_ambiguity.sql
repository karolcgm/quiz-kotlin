-- Naprawia konflikt nazwy kolumny i parametru client_attempt_id.
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
  if v_student_id is null then raise exception 'Wymagane logowanie ucznia.'; end if;
  if client_attempt_id is null then raise exception 'Brak identyfikatora próby.'; end if;

  select * into v_session from public.lesson_sessions where id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if v_session.status = 'ended' then raise exception 'Sesja została zakończona — odpowiedzi są zamknięte.'; end if;
  if v_session.status not in ('live', 'paused') then raise exception 'Sesja nie przyjmuje odpowiedzi w stanie %.', v_session.status; end if;
  if v_session.board_only_mode then raise exception 'Nauczyciel włączył tryb tylko tablica — tablety są wstrzymane.'; end if;
  if not public.is_lesson_session_participant(target_session_id, v_student_id) then raise exception 'Najpierw dołącz do sesji.'; end if;

  select r.id into v_response_id
  from public.lesson_stage_responses r
  where r.session_id = target_session_id
    and r.client_attempt_id = submit_lesson_stage_response.client_attempt_id;

  if v_response_id is not null then
    return (select jsonb_build_object('responseId', r.id, 'status', r.status, 'score', r.score, 'maxScore', r.max_score, 'submittedAt', r.submitted_at, 'idempotent', true) from public.lesson_stage_responses r where r.id = v_response_id);
  end if;

  select entry into v_key_entry
  from jsonb_array_elements(case when jsonb_typeof(v_session.answer_key -> 'questions') = 'array' then v_session.answer_key -> 'questions' else '[]'::jsonb end) entry
  where entry ->> 'questionInstanceId' = question_instance_id limit 1;

  v_expected_index := coalesce((v_key_entry -> 'answerSpec' ->> 'firstStepOperatorIndex')::integer, -1);
  v_selected_index := nullif(public_answer ->> 'selectedOperatorIndex', '')::integer;
  v_max_score := coalesce((v_key_entry ->> 'maxScore')::numeric, 1);
  if v_selected_index is not null and v_expected_index >= 0 and v_selected_index = v_expected_index then v_score := v_max_score; end if;

  insert into public.lesson_stage_responses (session_id, stage_id, question_instance_id, student_id, school_id, client_attempt_id, public_answer, status, score, max_score, error_codes)
  values (target_session_id, stage_id, question_instance_id, v_student_id, v_session.school_id, client_attempt_id, coalesce(public_answer, '{}'::jsonb), 'submitted', v_score, v_max_score, case when v_score = v_max_score then '{}'::text[] else array['incorrect-review-answer']::text[] end)
  on conflict (session_id, stage_id, question_instance_id, student_id) do update set client_attempt_id = excluded.client_attempt_id, public_answer = excluded.public_answer, score = excluded.score, max_score = excluded.max_score, error_codes = excluded.error_codes, submitted_at = now(), status = 'submitted'
  returning id into v_response_id;

  v_sequence := public.append_lesson_session_event(target_session_id, 'submit_response', jsonb_build_object('stageId', stage_id, 'questionInstanceId', question_instance_id, 'score', v_score));
  return jsonb_build_object('responseId', v_response_id, 'status', 'submitted', 'score', v_score, 'maxScore', v_max_score, 'submittedAt', now(), 'sequenceNumber', v_sequence, 'idempotent', false);
end;
$$;

revoke all on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) from public, anon;
grant execute on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) to authenticated;
