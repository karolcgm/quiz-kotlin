-- WP-032: assessment_versions, rozszerzenie tests/assignments, RPC blueprint assignment

alter table public.tests
  add column if not exists assessment_kind text
    check (assessment_kind is null or assessment_kind in ('worksheet', 'quiz', 'exit-ticket', 'exam', 'legacy')),
  add column if not exists delivery_mode text
    check (delivery_mode is null or delivery_mode in ('digital', 'paper', 'hybrid')),
  add column if not exists curriculum_id text,
  add column if not exists section_id text,
  add column if not exists topic_ids text[] not null default '{}',
  add column if not exists skill_ids text[] not null default '{}',
  add column if not exists blueprint_id text,
  add column if not exists blueprint_version integer,
  add column if not exists content_checksum text,
  add column if not exists is_snapshot_frozen boolean not null default false;

create table if not exists public.assessment_versions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  blueprint_id text not null,
  blueprint_version integer not null check (blueprint_version > 0),
  version_code text not null check (version_code in ('A', 'B', 'C')),
  version_seed integer not null,
  snapshot jsonb not null,
  answer_key jsonb not null,
  checksum text not null,
  max_score numeric not null check (max_score > 0),
  created_at timestamptz not null default now(),
  unique (blueprint_id, blueprint_version, version_code, version_seed, school_id)
);

create index if not exists assessment_versions_teacher_idx
  on public.assessment_versions (teacher_id, created_at desc);

alter table public.assignments
  add column if not exists assessment_version_id uuid
    references public.assessment_versions(id) on delete set null;

alter table public.assessment_versions enable row level security;

drop policy if exists "Teachers read own assessment versions" on public.assessment_versions;
create policy "Teachers read own assessment versions"
  on public.assessment_versions for select
  using (
    teacher_id = auth.uid()
    and exists (
      select 1 from public.teacher_school_memberships m
      where m.teacher_id = auth.uid() and m.school_id = assessment_versions.school_id
    )
  );

drop policy if exists "Teachers insert assessment versions" on public.assessment_versions;
create policy "Teachers insert assessment versions"
  on public.assessment_versions for insert
  with check (
    teacher_id = auth.uid()
    and exists (
      select 1 from public.teacher_school_memberships m
      where m.teacher_id = auth.uid() and m.school_id = assessment_versions.school_id
    )
  );

-- Blokada mutacji pytań po rozpoczęciu / oddaniu prób (WP-032 odbiór)
create or replace function public.guard_frozen_test_items()
returns trigger
language plpgsql
as $$
declare
  v_test_id uuid;
begin
  v_test_id := coalesce(old.test_id, new.test_id);

  if exists (
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where a.test_id = v_test_id
      and s.status in ('in_progress', 'graded', 'submitted')
  ) then
    raise exception 'Nie można zmieniać pytań po rozpoczęciu prób uczniów.';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists guard_test_items_after_submissions on public.test_items;
create trigger guard_test_items_after_submissions
  before update or delete on public.test_items
  for each row execute function public.guard_frozen_test_items();

create or replace function public.create_blueprint_assignment(
  target_class_id uuid,
  assignment_title text,
  max_attempts integer,
  due_at timestamptz default null,
  target_student_ids uuid[] default null,
  time_limit_minutes integer default null,
  starts_at timestamptz default null,
  assignment_kind public.assignment_kind default 'classwork',
  blueprint_id text default null,
  blueprint_version integer default null,
  version_code text default 'A',
  version_seed integer default null,
  assessment_kind text default 'quiz',
  delivery_mode text default 'hybrid',
  curriculum_id text default null,
  section_id text default null,
  topic_ids text[] default '{}',
  skill_ids text[] default '{}',
  snapshot jsonb default null,
  answer_key jsonb default null,
  content_checksum text default null,
  max_score numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_class public.teacher_classes%rowtype;
  v_test_id uuid;
  v_version_id uuid;
  v_assignment_id uuid;
  v_student_id uuid;
  v_count integer := 0;
  v_item jsonb;
  v_position integer := 0;
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  if max_attempts < 1 or max_attempts > 5 then
    raise exception 'Liczba prób musi być od 1 do 5.';
  end if;

  if time_limit_minutes is not null and time_limit_minutes < 1 then
    raise exception 'Limit czasu musi być co najmniej 1 minuta.';
  end if;

  if starts_at is not null and due_at is not null and starts_at > due_at then
    raise exception 'Data rozpoczęcia nie może być późniejsza niż termin zakończenia.';
  end if;

  if snapshot is null or answer_key is null or content_checksum is null then
    raise exception 'Brak snapshotu wersji oceny.';
  end if;

  if jsonb_array_length(coalesce(snapshot -> 'items', '[]'::jsonb)) = 0 then
    raise exception 'Snapshot nie zawiera zadań.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = target_class_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Nie znaleziono klasy/grupy.';
  end if;

  insert into public.assessment_versions (
    school_id,
    teacher_id,
    blueprint_id,
    blueprint_version,
    version_code,
    version_seed,
    snapshot,
    answer_key,
    checksum,
    max_score
  )
  values (
    v_class.school_id,
    v_teacher_id,
    blueprint_id,
    blueprint_version,
    version_code,
    version_seed,
    snapshot,
    answer_key,
    content_checksum,
    max_score
  )
  returning id into v_version_id;

  insert into public.tests (
    teacher_id,
    school_id,
    title,
    description,
    instruction,
    class_level,
    status,
    max_points,
    assessment_kind,
    delivery_mode,
    curriculum_id,
    section_id,
    topic_ids,
    skill_ids,
    blueprint_id,
    blueprint_version,
    content_checksum,
    is_snapshot_frozen
  )
  values (
    v_teacher_id,
    v_class.school_id,
    coalesce(snapshot ->> 'title', assignment_title),
    format('Blueprint %s · wersja %s · seed %s', blueprint_id, version_code, version_seed),
    'W każdym wyrażeniu wskaż pierwsze działanie zgodnie z regułą kolejności działań.',
    5,
    'published',
    max_score,
    assessment_kind,
    delivery_mode,
    curriculum_id,
    section_id,
    coalesce(topic_ids, '{}'),
    coalesce(skill_ids, '{}'),
    blueprint_id,
    blueprint_version,
    content_checksum,
    true
  )
  returning id into v_test_id;

  for v_item in
    select value
    from jsonb_array_elements(snapshot -> 'items')
    order by (value ->> 'position')::integer asc
  loop
    v_position := v_position + 1;
    insert into public.test_items (
      test_id,
      position,
      simulation_slug,
      widget_kind,
      skill,
      title,
      prompt,
      points,
      params
    )
    values (
      v_test_id,
      coalesce((v_item ->> 'position')::integer, v_position),
      'm5-1-4-order-director',
      'order-director-assessment',
      coalesce(v_item ->> 'skillId', 'algebra'),
      format('Zadanie %s', coalesce(v_item ->> 'position', v_position::text)),
      coalesce(v_item ->> 'prompt', 'Wskaż pierwsze działanie.'),
      coalesce((v_item ->> 'maxScore')::numeric, 1),
      jsonb_build_object(
        'expression', v_item ->> 'expression',
        'seed', (v_item ->> 'seed')::integer,
        'difficulty', v_item ->> 'difficulty',
        'slotId', v_item ->> 'slotId',
        'generatorId', v_item ->> 'generatorId'
      )
    );
  end loop;

  insert into public.assignments (
    test_id,
    teacher_id,
    school_id,
    class_id,
    title,
    max_attempts,
    due_at,
    starts_at,
    kind,
    time_limit_minutes,
    status,
    published_at,
    assessment_version_id
  )
  values (
    v_test_id,
    v_teacher_id,
    v_class.school_id,
    v_class.id,
    assignment_title,
    max_attempts,
    due_at,
    starts_at,
    assignment_kind,
    time_limit_minutes,
    'published',
    now(),
    v_version_id
  )
  returning id into v_assignment_id;

  if target_student_ids is not null and coalesce(array_length(target_student_ids, 1), 0) > 0 then
    foreach v_student_id in array target_student_ids loop
      if exists (
        select 1 from public.class_members cm
        where cm.class_id = v_class.id and cm.student_id = v_student_id
      ) then
        insert into public.assignment_students (assignment_id, student_id)
        values (v_assignment_id, v_student_id)
        on conflict do nothing;
        v_count := v_count + 1;
      end if;
    end loop;
  else
    insert into public.assignment_students (assignment_id, student_id)
    select v_assignment_id, cm.student_id
    from public.class_members cm
    where cm.class_id = v_class.id
    on conflict do nothing;
    get diagnostics v_count = row_count;
  end if;

  if v_count = 0 then
    delete from public.assignments where id = v_assignment_id;
    delete from public.test_items where test_id = v_test_id;
    delete from public.tests where id = v_test_id;
    delete from public.assessment_versions where id = v_version_id;
    raise exception 'Brak uczniów w wybranej grupie.';
  end if;

  return v_assignment_id;
end;
$$;

revoke all on function public.create_blueprint_assignment(
  uuid, text, integer, timestamptz, uuid[], integer, timestamptz, public.assignment_kind,
  text, integer, text, integer, text, text, text, text, text[], text[], jsonb, jsonb, text, numeric
) from public;

grant execute on function public.create_blueprint_assignment(
  uuid, text, integer, timestamptz, uuid[], integer, timestamptz, public.assignment_kind,
  text, integer, text, integer, text, text, text, text, text[], text[], jsonb, jsonb, text, numeric
) to authenticated;

-- submit_assignment: okno starts_at + ocena order-director-assessment z answer_key
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
  v_answer_key jsonb;
  v_key_entry jsonb;
  slot_id text;
  expected_operator_index integer;
  selected_operator_index integer;
begin
  if current_student_id is null then
    raise exception 'Musisz być zalogowany jako uczeń.';
  end if;

  select *
  into assignment_row
  from public.assignments
  where id = target_assignment_id
    and status = 'published'
    and (starts_at is null or starts_at <= now())
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

  if assignment_row.assessment_version_id is not null then
    select av.answer_key into v_answer_key
    from public.assessment_versions av
    where av.id = assignment_row.assessment_version_id;
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

    if item_row.widget_kind = 'order-director-assessment' then
      slot_id := item_row.params ->> 'slotId';
      expected_operator_index := -1;
      selected_operator_index := nullif(answer_value ->> 'selectedOperatorIndex', '')::integer;

      if v_answer_key is not null and slot_id is not null then
        select entry into v_key_entry
        from jsonb_array_elements(v_answer_key) as entry
        where entry ->> 'slotId' = slot_id
        limit 1;

        if v_key_entry is not null then
          expected_operator_index := coalesce(
            (v_key_entry -> 'answerSpec' ->> 'firstStepOperatorIndex')::integer,
            -1
          );
        end if;
      end if;

      expected_answer := jsonb_build_object('selectedOperatorIndex', expected_operator_index);
      item_score := case
        when selected_operator_index is not null
          and expected_operator_index >= 0
          and selected_operator_index = expected_operator_index
        then item_row.points
        else 0
      end;

    elsif item_row.widget_kind = 'number-line-result' then
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

revoke all on function public.submit_assignment(uuid, jsonb) from public;
grant execute on function public.submit_assignment(uuid, jsonb) to authenticated;
