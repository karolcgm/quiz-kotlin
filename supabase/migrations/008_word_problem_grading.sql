-- Ocenianie zadań tekstowych (word-problem) w submit_assignment

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
  attempt_count integer;
  attempt_number integer;
  latest_submission_id uuid;
  latest_retake_allowed boolean;
  submission_id uuid;
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

  select count(*)
  into attempt_count
  from public.submissions
  where assignment_id = target_assignment_id
    and student_id = current_student_id;

  attempt_number := attempt_count + 1;

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
    submitted_at
  )
  values (
    target_assignment_id,
    current_student_id,
    attempt_number,
    'graded',
    now()
  )
  returning id into submission_id;

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
    result_value := nullif(answer_value ->> 'result', '')::numeric;
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
      expected_value := coalesce(
        nullif(item_row.params ->> 'expectedOverride', '')::numeric,
        nullif(item_row.params ->> 'expectedResult', '')::numeric,
        0
      );
      expected_answer := jsonb_build_object('result', expected_value);
      item_score := case when result_value = expected_value then item_row.points else 0 end;

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
      submission_id,
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
    percentage = percentage_value
  where id = submission_id;

  insert into public.submission_scores (
    submission_id,
    mark_1_6,
    generated_feedback_text,
    feedback_text,
    retake_allowed,
    is_teacher_override
  )
  values (
    submission_id,
    mark,
    generated_feedback,
    generated_feedback,
    false,
    false
  );

  return submission_id;
end;
$$;
