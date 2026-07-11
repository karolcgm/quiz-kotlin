-- Naprawa konfliktu parametru stage_id oraz prywatne oceny opisowe z lekcji live.

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
  if submit_lesson_stage_response.client_attempt_id is null then raise exception 'Brak identyfikatora próby.'; end if;

  select * into v_session from public.lesson_sessions session where session.id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if v_session.expires_at is not null and v_session.expires_at <= now() then raise exception 'Minął limit 45 minut. Sesja została zakończona.'; end if;
  if v_session.status = 'ended' then raise exception 'Sesja została zakończona — odpowiedzi są zamknięte.'; end if;
  if v_session.status not in ('live', 'paused') then raise exception 'Sesja nie przyjmuje odpowiedzi w stanie %.', v_session.status; end if;
  if v_session.board_only_mode then raise exception 'Nauczyciel włączył tryb tylko tablica — tablety są wstrzymane.'; end if;
  if not public.is_lesson_session_participant(target_session_id, v_student_id) then raise exception 'Najpierw dołącz do sesji.'; end if;

  select response.id into v_response_id
  from public.lesson_stage_responses response
  where response.session_id = target_session_id
    and response.client_attempt_id = submit_lesson_stage_response.client_attempt_id;
  if v_response_id is not null then
    return (select jsonb_build_object('responseId', response.id, 'status', response.status, 'score', response.score, 'maxScore', response.max_score, 'submittedAt', response.submitted_at, 'idempotent', true) from public.lesson_stage_responses response where response.id = v_response_id);
  end if;

  select entry into v_key_entry
  from jsonb_array_elements(case when jsonb_typeof(v_session.answer_key -> 'questions') = 'array' then v_session.answer_key -> 'questions' else '[]'::jsonb end) entry
  where entry ->> 'questionInstanceId' = submit_lesson_stage_response.question_instance_id
  limit 1;

  if v_key_entry is null then raise exception 'Pytanie nie należy do tej sesji.'; end if;
  v_expected_index := coalesce((v_key_entry -> 'answerSpec' ->> 'firstStepOperatorIndex')::integer, -1);
  v_selected_index := nullif(submit_lesson_stage_response.public_answer ->> 'selectedOperatorIndex', '')::integer;
  v_max_score := coalesce((v_key_entry ->> 'maxScore')::numeric, 1);
  if v_selected_index is not null and v_expected_index >= 0 and v_selected_index = v_expected_index then v_score := v_max_score; end if;

  update public.lesson_stage_responses response
  set client_attempt_id = submit_lesson_stage_response.client_attempt_id,
      public_answer = coalesce(submit_lesson_stage_response.public_answer, '{}'::jsonb),
      score = v_score,
      max_score = v_max_score,
      error_codes = case when v_score = v_max_score then '{}'::text[] else array['incorrect-review-answer']::text[] end,
      submitted_at = now(),
      status = 'submitted'
  where response.session_id = target_session_id
    and response.stage_id = submit_lesson_stage_response.stage_id
    and response.question_instance_id = submit_lesson_stage_response.question_instance_id
    and response.student_id = v_student_id
  returning response.id into v_response_id;

  if v_response_id is null then
    insert into public.lesson_stage_responses (
      session_id, stage_id, question_instance_id, student_id, school_id,
      client_attempt_id, public_answer, status, score, max_score, error_codes
    ) values (
      target_session_id,
      submit_lesson_stage_response.stage_id,
      submit_lesson_stage_response.question_instance_id,
      v_student_id,
      v_session.school_id,
      submit_lesson_stage_response.client_attempt_id,
      coalesce(submit_lesson_stage_response.public_answer, '{}'::jsonb),
      'submitted', v_score, v_max_score,
      case when v_score = v_max_score then '{}'::text[] else array['incorrect-review-answer']::text[] end
    ) returning id into v_response_id;
  end if;

  v_sequence := public.append_lesson_session_event(target_session_id, 'submit_response', jsonb_build_object('stageId', submit_lesson_stage_response.stage_id, 'questionInstanceId', submit_lesson_stage_response.question_instance_id, 'score', v_score));
  return jsonb_build_object('responseId', v_response_id, 'status', 'submitted', 'score', v_score, 'maxScore', v_max_score, 'submittedAt', now(), 'sequenceNumber', v_sequence, 'idempotent', false);
end;
$$;

revoke all on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) from public, anon;
grant execute on function public.submit_lesson_stage_response(uuid, text, text, uuid, jsonb) to authenticated;

create table if not exists public.lesson_session_grades (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.lesson_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  lesson_id text not null,
  lesson_title text not null,
  curriculum_id text,
  section_id text,
  total_score numeric not null default 0,
  max_score numeric not null default 0,
  percentage integer not null default 0 check (percentage between 0 and 100),
  descriptive_feedback text not null,
  strengths text[] not null default '{}',
  improvements text[] not null default '{}',
  stage_results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create index if not exists lesson_session_grades_student_created_idx on public.lesson_session_grades(student_id, created_at desc);
create index if not exists lesson_session_grades_teacher_created_idx on public.lesson_session_grades(teacher_id, created_at desc);
alter table public.lesson_session_grades enable row level security;

drop policy if exists "Live grades visible to student and teacher" on public.lesson_session_grades;
create policy "Live grades visible to student and teacher"
on public.lesson_session_grades for select to authenticated
using (student_id = auth.uid() or teacher_id = auth.uid());

create or replace function public.generate_lesson_session_grades(target_session_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  participant record;
  v_score numeric;
  v_max numeric;
  v_percentage integer;
  v_strengths text[];
  v_improvements text[];
  v_stage_results jsonb;
  v_feedback text;
  v_count integer := 0;
begin
  select * into v_session from public.lesson_sessions where id = target_session_id;
  if not found then return 0; end if;

  for participant in
    select p.student_id,
      coalesce(nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''), profile.display_name, 'Uczeń') display_name
    from public.lesson_session_participants p
    join public.profiles profile on profile.id = p.student_id
    where p.session_id = target_session_id
  loop
    select coalesce(sum(response.score), 0) into v_score
    from public.lesson_stage_responses response
    where response.session_id = target_session_id and response.student_id = participant.student_id and response.status = 'submitted';

    select coalesce(sum(coalesce((question ->> 'maxScore')::numeric, 1)), 0) into v_max
    from jsonb_array_elements(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)) stage
    cross join lateral jsonb_array_elements(coalesce(stage -> 'questions', '[]'::jsonb)) question;

    v_percentage := case when v_max > 0 then round(v_score / v_max * 100)::integer else 0 end;

    with stages as (
      select stage ->> 'id' stage_id, stage ->> 'title' stage_title,
        jsonb_array_length(coalesce(stage -> 'questions', '[]'::jsonb)) task_count
      from jsonb_array_elements(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)) stage
    ), results as (
      select stages.stage_id, stages.stage_title, stages.task_count,
        count(response.id) submitted_count,
        count(response.id) filter (where response.score >= response.max_score) correct_count
      from stages
      left join public.lesson_stage_responses response
        on response.session_id = target_session_id and response.student_id = participant.student_id and response.stage_id = stages.stage_id and response.status = 'submitted'
      group by stages.stage_id, stages.stage_title, stages.task_count
    )
    select
      coalesce(jsonb_agg(jsonb_build_object('stageId', stage_id, 'stageTitle', stage_title, 'taskCount', task_count, 'submittedCount', submitted_count, 'correctCount', correct_count, 'percentage', case when task_count > 0 then round(correct_count::numeric / task_count * 100) else 0 end) order by stage_id), '[]'::jsonb),
      coalesce(array_agg(stage_title order by stage_title) filter (where case when task_count > 0 then correct_count::numeric / task_count >= 0.8 else false end), '{}'::text[]),
      coalesce(array_agg(stage_title order by stage_title) filter (where task_count = 0 or correct_count::numeric / greatest(task_count, 1) < 0.6), '{}'::text[])
    into v_stage_results, v_strengths, v_improvements
    from results;

    v_feedback := case
      when v_max = 0 then 'Brak zadań możliwych do oceny w tej sesji.'
      when v_percentage >= 85 then participant.display_name || ' bardzo dobrze opanował(a) materiał z tego działu. Warto utrwalać sprawne uzasadnianie odpowiedzi.'
      when v_percentage >= 65 then participant.display_name || ' opanował(a) większość materiału z tego działu. Wskazane obszary warto jeszcze utrwalić na kilku przykładach.'
      when v_percentage >= 40 then participant.display_name || ' rozumie część materiału, ale potrzebuje dalszych ćwiczeń krok po kroku w wymienionych obszarach.'
      else participant.display_name || ' potrzebuje powtórzenia podstaw tego działu z pomocą nauczyciela i prostszych przykładów.'
    end;
    if cardinality(v_improvements) > 0 then v_feedback := v_feedback || ' Do poprawy: ' || array_to_string(v_improvements, ', ') || '.'; end if;
    if cardinality(v_strengths) > 0 then v_feedback := v_feedback || ' Mocne strony: ' || array_to_string(v_strengths, ', ') || '.'; end if;

    insert into public.lesson_session_grades (
      session_id, student_id, teacher_id, school_id, class_id, lesson_id, lesson_title,
      curriculum_id, section_id, total_score, max_score, percentage,
      descriptive_feedback, strengths, improvements, stage_results
    ) values (
      target_session_id, participant.student_id, v_session.teacher_id, v_session.school_id, v_session.class_id,
      v_session.lesson_id, coalesce(v_session.stage_snapshot ->> 'title', 'Lekcja live'),
      v_session.stage_snapshot ->> 'curriculumId', coalesce(v_session.stage_snapshot ->> 'sectionId', v_session.stage_snapshot ->> 'topicId'),
      v_score, v_max, v_percentage, v_feedback, v_strengths, v_improvements, v_stage_results
    ) on conflict (session_id, student_id) do update set
      total_score = excluded.total_score, max_score = excluded.max_score, percentage = excluded.percentage,
      descriptive_feedback = excluded.descriptive_feedback, strengths = excluded.strengths,
      improvements = excluded.improvements, stage_results = excluded.stage_results, updated_at = now();
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.generate_lesson_grades_after_end()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'ended' and old.status <> 'ended' then perform public.generate_lesson_session_grades(new.id); end if;
  return new;
end;
$$;

drop trigger if exists lesson_session_generate_grades_on_end on public.lesson_sessions;
create trigger lesson_session_generate_grades_on_end
after update of status on public.lesson_sessions
for each row execute function public.generate_lesson_grades_after_end();

revoke all on function public.generate_lesson_session_grades(uuid) from public, anon, authenticated;
revoke all on function public.generate_lesson_grades_after_end() from public, anon, authenticated;
