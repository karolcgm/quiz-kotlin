-- WP-044: skill_evidence z sesji live + podsumowania

alter table public.lesson_sessions
  add column if not exists record_skill_evidence boolean not null default true,
  add column if not exists evidence_recorded_at timestamptz;

create or replace function public.record_live_session_skill_evidence(target_session_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_curriculum_id text;
  v_count integer := 0;
  v_row record;
  v_skill_id text;
begin
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  v_curriculum_id := coalesce(v_session.stage_snapshot ->> 'curriculumId', 'pl-math-5-2026-classic');

  for v_row in
    select
      r.id as response_id,
      r.student_id,
      r.school_id,
      r.session_id,
      r.question_instance_id,
      r.score,
      r.max_score,
      r.submitted_at,
      ls.class_id
    from public.lesson_stage_responses r
    join public.lesson_sessions ls on ls.id = r.session_id
    where r.session_id = target_session_id
      and r.status = 'submitted'
  loop
    select coalesce(
      entry ->> 'skillId',
      (select skill_ids[1] from public.lesson_sessions ls2 where ls2.id = target_session_id),
      'M5-1.4-order-ops'
    ) into v_skill_id
    from jsonb_array_elements(
      case
        when jsonb_typeof(v_session.answer_key -> 'questions') = 'array'
          then v_session.answer_key -> 'questions'
        else '[]'::jsonb
      end
    ) as entry
    where entry ->> 'questionInstanceId' = v_row.question_instance_id
    limit 1;

    if v_skill_id is null then
      v_skill_id := 'M5-1.4-order-ops';
    end if;

    insert into public.skill_evidence (
      student_id,
      school_id,
      class_id,
      skill_id,
      curriculum_id,
      source_type,
      source_id,
      raw_score,
      raw_max,
      weight,
      policy_version,
      occurred_at
    )
    values (
      v_row.student_id,
      v_row.school_id,
      v_row.class_id,
      v_skill_id,
      v_curriculum_id,
      'live',
      v_row.response_id,
      coalesce(v_row.score, 0),
      v_row.max_score,
      0.25,
      '2026.1-live',
      v_row.submitted_at
    )
    on conflict (source_type, source_id, skill_id) do update
    set
      raw_score = excluded.raw_score,
      raw_max = excluded.raw_max,
      weight = excluded.weight,
      occurred_at = excluded.occurred_at;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.set_lesson_session_record_evidence(
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
begin
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący może zmieniać politykę zapisu.';
  end if;

  if v_session.status = 'ended' then
    raise exception 'Sesja została zakończona.';
  end if;

  update public.lesson_sessions
  set record_skill_evidence = coalesce(enabled, false)
  where id = target_session_id;

  return jsonb_build_object(
    'sessionId', target_session_id,
    'recordSkillEvidence', coalesce(enabled, false)
  );
end;
$$;

drop function if exists public.end_lesson_session(uuid);

create or replace function public.end_lesson_session(
  target_session_id uuid,
  record_skill_evidence boolean default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_sequence bigint;
  v_should_record boolean;
  v_evidence_count integer := 0;
begin
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if v_session.teacher_id <> auth.uid() then
    raise exception 'Tylko prowadzący może zakończyć sesję.';
  end if;

  if v_session.status = 'ended' then
    raise exception 'Sesja została już zakończona.';
  end if;

  v_should_record := coalesce(record_skill_evidence, v_session.record_skill_evidence);

  update public.lesson_sessions
  set
    status = 'ended',
    ended_at = now(),
    record_skill_evidence = v_should_record
  where id = target_session_id;

  if v_should_record and v_session.evidence_recorded_at is null then
    v_evidence_count := public.record_live_session_skill_evidence(target_session_id);
    update public.lesson_sessions
    set evidence_recorded_at = now()
    where id = target_session_id;
  end if;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    'end',
    jsonb_build_object(
      'activeStageIndex', v_session.active_stage_index,
      'recordSkillEvidence', v_should_record,
      'evidenceCount', v_evidence_count
    )
  );

  return jsonb_build_object(
    'sessionId', target_session_id,
    'status', 'ended',
    'endedAt', now(),
    'recordSkillEvidence', v_should_record,
    'evidenceCount', v_evidence_count,
    'sequenceNumber', v_sequence
  );
end;
$$;

create or replace function public.get_lesson_session_teacher_summary(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_stage_stats jsonb;
  v_skill_stats jsonb;
  v_revisit jsonb;
  v_histogram jsonb;
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
    raise exception 'Brak dostępu do podsumowania sesji.';
  end if;

  if v_session.status <> 'ended' then
    raise exception 'Podsumowanie dostępne po zakończeniu sesji.';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'stageId', s.stage_id,
    'stageTitle', s.stage_title,
    'submittedCount', s.submitted_count,
    'correctCount', s.correct_count,
    'correctRate', case when s.submitted_count > 0
      then round((s.correct_count::numeric / s.submitted_count) * 100)
      else null end
  ) order by s.stage_id), '[]'::jsonb) into v_stage_stats
  from (
    select
      r.stage_id,
      coalesce(
        (
          select st ->> 'title'
          from jsonb_array_elements(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)) st
          where st ->> 'id' = r.stage_id
          limit 1
        ),
        r.stage_id
      ) as stage_title,
      count(*) as submitted_count,
      count(*) filter (where r.score = r.max_score) as correct_count
    from public.lesson_stage_responses r
    where r.session_id = target_session_id and r.status = 'submitted'
    group by r.stage_id
  ) s;

  select coalesce(jsonb_agg(jsonb_build_object(
    'skillId', agg.skill_id,
    'responseCount', agg.response_count,
    'correctRate', case when agg.response_count > 0
      then round((agg.correct_sum / agg.response_count) * 100)
      else null end,
    'evidenceWeight', 0.25
  ) order by agg.skill_id), '[]'::jsonb) into v_skill_stats
  from (
    select
      coalesce(entry ->> 'skillId', 'M5-1.4-order-ops') as skill_id,
      count(*) as response_count,
      avg(case when r.score = r.max_score then 1 else 0 end) as correct_sum
    from public.lesson_stage_responses r
    left join lateral (
      select entry
      from jsonb_array_elements(
        case
          when jsonb_typeof(v_session.answer_key -> 'questions') = 'array'
            then v_session.answer_key -> 'questions'
          else '[]'::jsonb
        end
      ) as entry
      where entry ->> 'questionInstanceId' = r.question_instance_id
      limit 1
    ) key_entry on true
    where r.session_id = target_session_id and r.status = 'submitted'
    group by 1
  ) agg;

  select coalesce(jsonb_agg(jsonb_build_object(
    'studentId', row.student_id,
    'displayName', row.display_name,
    'submittedCount', row.submitted_count,
    'correctRate', case when row.submitted_count > 0
      then round((row.correct_count::numeric / row.submitted_count) * 100)
      else null end
  ) order by row.correct_rate asc nulls last, row.display_name), '[]'::jsonb) into v_revisit
  from (
    select
      r.student_id,
      coalesce(
        nullif(trim(concat_ws(' ', pr.first_name, pr.last_name)), ''),
        pr.display_name,
        'Uczeń'
      ) as display_name,
      count(*) as submitted_count,
      count(*) filter (where r.score = r.max_score) as correct_count,
      case when count(*) > 0
        then count(*) filter (where r.score = r.max_score)::numeric / count(*)
        else null end as correct_rate
    from public.lesson_stage_responses r
    join public.profiles pr on pr.id = r.student_id
    where r.session_id = target_session_id and r.status = 'submitted'
    group by r.student_id, pr.first_name, pr.last_name, pr.display_name
    having case when count(*) > 0
      then count(*) filter (where r.score = r.max_score)::numeric / count(*) < 0.5
      else false end
  ) row;

  select coalesce(jsonb_agg(jsonb_build_object(
    'selectedOperatorIndex', bucket.selected_index,
    'count', bucket.cnt
  ) order by bucket.selected_index), '[]'::jsonb) into v_histogram
  from (
    select
      nullif(r.public_answer ->> 'selectedOperatorIndex', '')::integer as selected_index,
      count(*) as cnt
    from public.lesson_stage_responses r
    where r.session_id = target_session_id and r.status = 'submitted'
    group by 1
  ) bucket
  where bucket.selected_index is not null;

  return jsonb_build_object(
    'sessionId', v_session.id,
    'lessonTitle', v_session.stage_snapshot ->> 'title',
    'topicId', v_session.stage_snapshot ->> 'topicId',
    'endedAt', v_session.ended_at,
    'recordSkillEvidence', v_session.record_skill_evidence,
    'evidenceRecordedAt', v_session.evidence_recorded_at,
    'participantCount', (
      select count(*) from public.lesson_session_participants p
      where p.session_id = target_session_id and p.left_at is null
    ),
    'responseCount', (
      select count(*) from public.lesson_stage_responses r
      where r.session_id = target_session_id and r.status = 'submitted'
    ),
    'correctRate', (
      select case when count(*) > 0
        then round((count(*) filter (where r.score = r.max_score))::numeric / count(*) * 100)
        else null end
      from public.lesson_stage_responses r
      where r.session_id = target_session_id and r.status = 'submitted'
    ),
    'stageStats', v_stage_stats,
    'skillStats', v_skill_stats,
    'revisitStudents', v_revisit,
    'strategyHistogram', v_histogram
  );
end;
$$;

create or replace function public.get_lesson_session_student_summary(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_session public.lesson_sessions%rowtype;
  v_items jsonb;
  v_sources jsonb;
begin
  if v_student_id is null then
    raise exception 'Wymagane logowanie ucznia.';
  end if;

  select * into v_session
  from public.lesson_sessions
  where id = target_session_id;

  if not found then
    raise exception 'Nie znaleziono sesji.';
  end if;

  if not public.is_lesson_session_participant(target_session_id, v_student_id) then
    raise exception 'Nie uczestniczysz w tej sesji.';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'responseId', r.id,
    'stageId', r.stage_id,
    'stageTitle', coalesce(
      (
        select st ->> 'title'
        from jsonb_array_elements(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)) st
        where st ->> 'id' = r.stage_id
        limit 1
      ),
      r.stage_id
    ),
    'questionInstanceId', r.question_instance_id,
    'expression', coalesce(
      (
        select q ->> 'expression'
        from jsonb_array_elements(
          coalesce(
            (
              select st -> 'questions'
              from jsonb_array_elements(coalesce(v_session.stage_snapshot -> 'stages', '[]'::jsonb)) st
              where st ->> 'id' = r.stage_id
              limit 1
            ),
            '[]'::jsonb
          )
        ) q
        where q ->> 'questionInstanceId' = r.question_instance_id
        limit 1
      ),
      '—'
    ),
    'score', r.score,
    'maxScore', r.max_score,
    'submittedAt', r.submitted_at
  ) order by r.submitted_at), '[]'::jsonb) into v_items
  from public.lesson_stage_responses r
  where r.session_id = target_session_id
    and r.student_id = v_student_id
    and r.status = 'submitted';

  select coalesce(jsonb_agg(jsonb_build_object(
    'evidenceId', se.id,
    'skillId', se.skill_id,
    'sourceType', se.source_type,
    'sourceId', se.source_id,
    'rawScore', se.raw_score,
    'rawMax', se.raw_max,
    'weight', se.weight,
    'occurredAt', se.occurred_at
  ) order by se.occurred_at), '[]'::jsonb) into v_sources
  from public.skill_evidence se
  where se.student_id = v_student_id
    and se.source_type = 'live'
    and se.source_id in (
      select r.id from public.lesson_stage_responses r
      where r.session_id = target_session_id and r.student_id = v_student_id
    );

  return jsonb_build_object(
    'sessionId', v_session.id,
    'lessonTitle', v_session.stage_snapshot ->> 'title',
    'topicId', v_session.stage_snapshot ->> 'topicId',
    'status', v_session.status,
    'endedAt', v_session.ended_at,
    'responseCount', jsonb_array_length(v_items),
    'correctRate', (
      select case when count(*) > 0
        then round((count(*) filter (where r.score = r.max_score))::numeric / count(*) * 100)
        else null end
      from public.lesson_stage_responses r
      where r.session_id = target_session_id
        and r.student_id = v_student_id
        and r.status = 'submitted'
    ),
    'items', v_items,
    'evidenceSources', v_sources
  );
end;
$$;

revoke all on function public.record_live_session_skill_evidence(uuid) from public, anon;
grant execute on function public.record_live_session_skill_evidence(uuid) to authenticated;

revoke all on function public.set_lesson_session_record_evidence(uuid, boolean) from public, anon;
grant execute on function public.set_lesson_session_record_evidence(uuid, boolean) to authenticated;

revoke all on function public.end_lesson_session(uuid, boolean) from public, anon;
grant execute on function public.end_lesson_session(uuid, boolean) to authenticated;

revoke all on function public.get_lesson_session_teacher_summary(uuid) from public, anon;
grant execute on function public.get_lesson_session_teacher_summary(uuid) to authenticated;

revoke all on function public.get_lesson_session_student_summary(uuid) from public, anon;
grant execute on function public.get_lesson_session_student_summary(uuid) to authenticated;
