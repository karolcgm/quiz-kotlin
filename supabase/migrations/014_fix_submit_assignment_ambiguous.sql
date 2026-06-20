-- Naprawa submit_assignment: niejednoznaczne submission_id w DELETE.

create or replace function public.submit_assignment(
  target_assignment_id uuid,
  answers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_student_id uuid := auth.uid();
  assignment_row public.assignments%rowtype;
  completed_count integer;
  attempt_number integer;
  latest_submission_id uuid;
  latest_retake_allowed boolean;
  v_submission_id uuid;
  existing_submission public.submissions%rowtype;
  is_timed_out boolean := false;
  item_row public.test_items%rowtype;
  answer_row jsonb;
  answer_value jsonb;
  result_value numeric;
  expected_value numeric;
  item_score numeric;
  total_score_value numeric := 0;
  max_score_value numeric := 0;
  percentage_value numeric := 0;
  mark smallint := 1;
  generated_feedback text;
  expected_answer jsonb;
  answer_numerator numeric;
  answer_denominator numeric;
  expected_numerator numeric;
  expected_denominator numeric;
  comparison_value text;
  expected_comparison text;
  item_skill text;
  part_id text;
  answer_parts jsonb;
  expected_results jsonb;
  parts_json jsonb;
  total_parts integer;
  correct_count integer;
  partial_credit boolean;
  answer_val numeric;
  expected_val numeric;
  main_id text;
  part_index integer;
begin
  if current_student_id is null then
    raise exception 'Musisz być zalogowany jako uczeń.';
  end if;

  select *
  into assignment_row
  from public.assignments
  where id = target_assignment_id
    and status = 'published'
    and (due_at is null or due_at >= now())
    and exists (
      select 1
      from public.assignment_students ast
      where ast.assignment_id = target_assignment_id
        and ast.student_id = current_student_id
    );

  if not found then
    raise exception 'Test nie jest dostępny dla tego ucznia.';
  end if;

  select *
  into existing_submission
  from public.submissions
  where assignment_id = target_assignment_id
    and student_id = current_student_id
    and status = 'in_progress'
  order by started_at desc
  limit 1;

  if found then
    v_submission_id := existing_submission.id;
    attempt_number := existing_submission.attempt_number;

    if assignment_row.time_limit_minutes is not null then
      is_timed_out := now() > existing_submission.started_at
        + make_interval(mins => assignment_row.time_limit_minutes);
    end if;
  else
    if assignment_row.time_limit_minutes is not null then
      raise exception 'Najpierw rozpocznij test.';
    end if;

    select count(*)
    into completed_count
    from public.submissions
    where assignment_id = target_assignment_id
      and student_id = current_student_id
      and status in ('graded', 'submitted');

    attempt_number := completed_count + 1;

    if attempt_number > assignment_row.max_attempts then
      select s.id, coalesce(sc.retake_allowed, false)
      into latest_submission_id, latest_retake_allowed
      from public.submissions s
      left join public.submission_scores sc on sc.submission_id = s.id
      where s.assignment_id = target_assignment_id
        and s.student_id = current_student_id
      order by s.attempt_number desc
      limit 1;

      if not coalesce(latest_retake_allowed, false) then
        raise exception 'Limit prób został wykorzystany.';
      end if;

      update public.submission_scores
      set retake_allowed = false, updated_at = now()
      where submission_id = latest_submission_id;
    end if;

    insert into public.submissions (
      assignment_id,
      student_id,
      attempt_number,
      status,
      started_at,
      submitted_at
    )
    values (
      target_assignment_id,
      current_student_id,
      attempt_number,
      'in_progress',
      now(),
      null
    )
    returning id into v_submission_id;
  end if;

  for item_row in
    select ti.*
    from public.test_items ti
    where ti.test_id = assignment_row.test_id
    order by ti.position asc
  loop
    select value
    into answer_row
    from jsonb_array_elements(answers)
    where value ->> 'testItemId' = item_row.id::text
    limit 1;

    answer_value := coalesce(answer_row -> 'answer', '{}'::jsonb);
    result_value := nullif(trim(answer_value ->> 'result'), '')::numeric;
    expected_value := 0;
    item_score := 0;
    expected_answer := '{}'::jsonb;
    item_skill := item_row.skill;

    if item_row.widget_kind = 'number-line-result' then
      expected_value := coalesce((item_row.params ->> 'start')::numeric, 0)
        + coalesce((item_row.params ->> 'change')::numeric, 0);
      item_skill := case
        when coalesce((item_row.params ->> 'change')::numeric, 0) >= 0 then 'addition'
        else 'subtraction'
      end;
      expected_answer := jsonb_build_object('result', expected_value);
      item_score := case when result_value = expected_value then item_row.points else 0 end;

    elsif item_row.widget_kind = 'arithmetic-basic' then
      expected_value := case item_row.params ->> 'operation'
        when 'add' then coalesce((item_row.params ->> 'left')::numeric, 0)
          + coalesce((item_row.params ->> 'right')::numeric, 0)
        when 'subtract' then coalesce((item_row.params ->> 'left')::numeric, 0)
          - coalesce((item_row.params ->> 'right')::numeric, 0)
        when 'multiply' then coalesce((item_row.params ->> 'left')::numeric, 0)
          * coalesce((item_row.params ->> 'right')::numeric, 0)
        when 'divide' then coalesce((item_row.params ->> 'left')::numeric, 0)
          / nullif(coalesce((item_row.params ->> 'right')::numeric, 1), 0)
        else 0
      end;
      expected_answer := jsonb_build_object('result', expected_value);
      item_score := case when result_value = expected_value then item_row.points else 0 end;

    elsif item_row.widget_kind = 'word-problem' then
      parts_json := coalesce(item_row.params -> 'parts', '[]'::jsonb);
      expected_results := coalesce(item_row.params -> 'expectedResults', '{}'::jsonb);
      answer_parts := coalesce(answer_value -> 'parts', '{}'::jsonb);
      partial_credit := coalesce((item_row.params ->> 'partialCredit')::boolean, true);
      total_parts := jsonb_array_length(parts_json);
      correct_count := 0;

      if total_parts = 0 then
        total_parts := 1;
        parts_json := jsonb_build_array(jsonb_build_object('id', 'main'));
      end if;

      if (answer_parts = '{}'::jsonb or answer_parts is null) and answer_value ? 'result' then
        main_id := coalesce(parts_json -> 0 ->> 'id', 'main');
        answer_parts := jsonb_build_object(main_id, result_value);
      end if;

      for part_index in 0..(total_parts - 1) loop
        part_id := parts_json -> part_index ->> 'id';
        expected_val := nullif(expected_results ->> part_id, '')::numeric;
        if expected_val is null then
          expected_val := coalesce(
            nullif(item_row.params ->> 'expectedOverride', '')::numeric,
            nullif(item_row.params ->> 'expectedResult', '')::numeric,
            0
          );
        end if;
        answer_val := nullif(trim(coalesce(answer_parts ->> part_id, '')), '')::numeric;
        if answer_val is not null and answer_val = expected_val then
          correct_count := correct_count + 1;
        end if;
      end loop;

      if partial_credit then
        item_score := round(
          (item_row.points * correct_count::numeric / greatest(total_parts, 1))::numeric,
          2
        );
      else
        item_score := case when correct_count = total_parts then item_row.points else 0 end;
      end if;

      if expected_results = '{}'::jsonb then
        main_id := coalesce(parts_json -> 0 ->> 'id', 'main');
        expected_val := coalesce(
          nullif(item_row.params ->> 'expectedOverride', '')::numeric,
          nullif(item_row.params ->> 'expectedResult', '')::numeric,
          0
        );
        expected_answer := jsonb_build_object('parts', jsonb_build_object(main_id, expected_val));
      else
        expected_answer := jsonb_build_object('parts', expected_results);
      end if;

    elsif item_row.widget_kind = 'rectangle-measure' then
      expected_value := case item_row.params ->> 'ask'
        when 'perimeter' then 2 * (
          coalesce((item_row.params ->> 'width')::numeric, 0)
          + coalesce((item_row.params ->> 'height')::numeric, 0)
        )
        else coalesce((item_row.params ->> 'width')::numeric, 0)
          * coalesce((item_row.params ->> 'height')::numeric, 0)
      end;
      expected_answer := jsonb_build_object('result', expected_value);
      item_score := case when result_value = expected_value then item_row.points else 0 end;

    elsif item_row.widget_kind = 'unit-conversion' then
      expected_value := coalesce((item_row.params ->> 'value')::numeric, 0)
        * case item_row.params ->> 'fromUnit'
          when 'mm' then 1
          when 'cm' then 10
          when 'm' then 1000
          when 'km' then 1000000
          else 1
        end
        / case item_row.params ->> 'toUnit'
          when 'mm' then 1
          when 'cm' then 10
          when 'm' then 1000
          when 'km' then 1000000
          else 1
        end;
      expected_answer := jsonb_build_object('result', expected_value);
      item_score := case when abs(result_value - expected_value) < 0.001 then item_row.points else 0 end;

    elsif item_row.widget_kind = 'fraction-part' then
      expected_numerator := coalesce((item_row.params ->> 'numerator')::numeric, 0);
      expected_denominator := nullif(coalesce((item_row.params ->> 'denominator')::numeric, 1), 0);
      answer_numerator := coalesce((answer_value ->> 'numerator')::numeric, 0);
      answer_denominator := nullif(coalesce((answer_value ->> 'denominator')::numeric, 1), 0);
      expected_answer := jsonb_build_object(
        'numerator', expected_numerator,
        'denominator', expected_denominator
      );
      item_score := case
        when answer_denominator is not null
          and answer_numerator * expected_denominator = expected_numerator * answer_denominator
        then item_row.points
        else 0
      end;

    elsif item_row.widget_kind = 'number-comparison' then
      expected_comparison := case
        when coalesce((item_row.params ->> 'left')::numeric, 0)
          < coalesce((item_row.params ->> 'right')::numeric, 0) then '<'
        when coalesce((item_row.params ->> 'left')::numeric, 0)
          > coalesce((item_row.params ->> 'right')::numeric, 0) then '>'
        else '='
      end;
      comparison_value := answer_value ->> 'comparison';
      expected_answer := jsonb_build_object('comparison', expected_comparison);
      item_score := case when comparison_value = expected_comparison then item_row.points else 0 end;
    end if;

    total_score_value := total_score_value + item_score;
    max_score_value := max_score_value + item_row.points;

    delete from public.submission_answers sa
    where sa.submission_id = v_submission_id
      and sa.test_item_id = item_row.id;

    insert into public.submission_answers (
      submission_id,
      test_item_id,
      skill,
      answer,
      is_correct,
      score,
      max_score
    )
    values (
      v_submission_id,
      item_row.id,
      item_skill,
      answer_value || jsonb_build_object('expected', expected_answer),
      item_score = item_row.points,
      item_score,
      item_row.points
    );
  end loop;

  percentage_value := case
    when max_score_value > 0 then round((total_score_value / max_score_value) * 100)
    else 0
  end;

  mark := case
    when percentage_value >= 96 then 6
    when percentage_value >= 86 then 5
    when percentage_value >= 70 then 4
    when percentage_value >= 50 then 3
    when percentage_value >= 30 then 2
    else 1
  end;

  generated_feedback := case
    when percentage_value >= 85 then 'Uczeń bardzo dobrze radzi sobie z większością sprawdzanych umiejętności. Warto zaproponować trudniejsze przykłady.'
    when percentage_value >= 60 then 'Uczeń rozumie podstawy, ale warto utrwalić umiejętności, w których pojawiły się błędy.'
    else 'Uczeń potrzebuje powrotu do prostszych przykładów i pracy krok po kroku nad sprawdzanymi umiejętnościami.'
  end;

  update public.submissions
  set
    total_score = total_score_value,
    max_score = max_score_value,
    percentage = percentage_value,
    status = 'graded',
    submitted_at = now(),
    timed_out = is_timed_out
  where id = v_submission_id;

  insert into public.submission_scores (
    submission_id,
    mark_1_6,
    generated_feedback_text,
    feedback_text,
    retake_allowed,
    is_teacher_override
  )
  values (
    v_submission_id,
    mark,
    generated_feedback,
    generated_feedback,
    false,
    false
  )
  on conflict (submission_id) do update
  set
    mark_1_6 = excluded.mark_1_6,
    generated_feedback_text = excluded.generated_feedback_text,
    feedback_text = excluded.feedback_text,
    updated_at = now();

  return v_submission_id;
end;
$$;
