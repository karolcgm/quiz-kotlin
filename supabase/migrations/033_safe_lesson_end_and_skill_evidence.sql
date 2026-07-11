-- Zakończenie sesji nie może zostać cofnięte przez opcjonalny zapis dowodów.
-- Poprzednia funkcja błędnie odwoływała się do nieistniejącej kolumny lesson_sessions.skill_ids.

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
  select * into v_session from public.lesson_sessions session where session.id = target_session_id;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  v_curriculum_id := coalesce(v_session.stage_snapshot ->> 'curriculumId', 'pl-math-5-2026-classic');

  for v_row in
    select response.id response_id, response.student_id, response.school_id,
      response.session_id, response.question_instance_id, response.score,
      response.max_score, response.submitted_at, session.class_id
    from public.lesson_stage_responses response
    join public.lesson_sessions session on session.id = response.session_id
    where response.session_id = target_session_id and response.status = 'submitted'
  loop
    select entry ->> 'skillId' into v_skill_id
    from jsonb_array_elements(case when jsonb_typeof(v_session.answer_key -> 'questions') = 'array' then v_session.answer_key -> 'questions' else '[]'::jsonb end) entry
    where entry ->> 'questionInstanceId' = v_row.question_instance_id
    limit 1;

    v_skill_id := coalesce(
      nullif(v_skill_id, ''),
      nullif(v_session.stage_snapshot -> 'skillIds' ->> 0, ''),
      nullif(v_session.stage_snapshot ->> 'topicId', ''),
      'lesson-live'
    );

    insert into public.skill_evidence (
      student_id, school_id, class_id, skill_id, curriculum_id, source_type,
      source_id, raw_score, raw_max, weight, policy_version, occurred_at
    ) values (
      v_row.student_id, v_row.school_id, v_row.class_id, v_skill_id,
      v_curriculum_id, 'live', v_row.response_id, coalesce(v_row.score, 0),
      v_row.max_score, 0.25, '2026.1-live', v_row.submitted_at
    )
    on conflict on constraint skill_evidence_source_type_source_id_skill_id_key
    do update set raw_score = excluded.raw_score, raw_max = excluded.raw_max,
      weight = excluded.weight, occurred_at = excluded.occurred_at;
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
  if new.status = 'ended' and old.status <> 'ended' then
    begin
      perform public.generate_lesson_session_grades(new.id);
    exception when others then
      -- Ocena opisowa jest dodatkiem; jej błąd nigdy nie blokuje zamknięcia.
      null;
    end;
  end if;
  return new;
end;
$$;

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
  v_evidence_error text := null;
begin
  select * into v_session from public.lesson_sessions session where session.id = target_session_id for update;
  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if v_session.teacher_id <> auth.uid() then raise exception 'Tylko prowadzący może zakończyć sesję.'; end if;
  if v_session.status = 'ended' then
    return jsonb_build_object('sessionId', target_session_id, 'status', 'ended', 'endedAt', v_session.ended_at, 'sequenceNumber', v_session.sequence_number, 'idempotent', true);
  end if;

  v_should_record := coalesce(record_skill_evidence, v_session.record_skill_evidence);
  update public.lesson_sessions
  set status = 'ended', ended_at = now(), record_skill_evidence = v_should_record
  where id = target_session_id;

  if v_should_record and v_session.evidence_recorded_at is null then
    begin
      v_evidence_count := public.record_live_session_skill_evidence(target_session_id);
      update public.lesson_sessions set evidence_recorded_at = now() where id = target_session_id;
    exception when others then
      v_evidence_error := sqlerrm;
      v_evidence_count := 0;
    end;
  end if;

  v_sequence := public.append_lesson_session_event(target_session_id, 'end', jsonb_build_object(
    'activeStageIndex', v_session.active_stage_index,
    'recordSkillEvidence', v_should_record,
    'evidenceCount', v_evidence_count,
    'evidenceWarning', v_evidence_error
  ));
  return jsonb_build_object(
    'sessionId', target_session_id, 'status', 'ended', 'endedAt', now(),
    'recordSkillEvidence', v_should_record, 'evidenceCount', v_evidence_count,
    'evidenceWarning', v_evidence_error, 'sequenceNumber', v_sequence
  );
end;
$$;

revoke all on function public.end_lesson_session(uuid, boolean) from public, anon;
grant execute on function public.end_lesson_session(uuid, boolean) to authenticated;

create or replace function public.expire_lesson_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  row record;
  v_count integer := 0;
  v_evidence_count integer;
begin
  if auth.uid() is null then return 0; end if;
  for row in
    select session.id, session.record_skill_evidence, session.evidence_recorded_at
    from public.lesson_sessions session
    where session.status in ('live', 'paused') and session.expires_at is not null and session.expires_at <= now()
      and (session.teacher_id = auth.uid() or exists (
        select 1 from public.lesson_session_participants participant
        where participant.session_id = session.id and participant.student_id = auth.uid()
      ))
    for update skip locked
  loop
    update public.lesson_sessions set status = 'ended', ended_at = coalesce(ended_at, expires_at, now()) where id = row.id;
    v_evidence_count := 0;
    if row.record_skill_evidence and row.evidence_recorded_at is null then
      begin
        v_evidence_count := public.record_live_session_skill_evidence(row.id);
        update public.lesson_sessions set evidence_recorded_at = now() where id = row.id;
      exception when others then
        v_evidence_count := 0;
      end;
    end if;
    perform public.append_lesson_session_event(row.id, 'end', jsonb_build_object('reason', 'time_limit', 'limitMinutes', 45, 'evidenceCount', v_evidence_count));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
