-- Rozdziela dwa niezależne czasy życia:
-- - lekcja Live: maksymalnie 45 minut od pierwszego uruchomienia,
-- - porzucone lobby: techniczne sprzątanie po 24 godzinach.
-- Samodzielne poprawy ucznia są w student_lesson_reviews i nie mają tego limitu.

update public.lesson_sessions
set expires_at = least(
  coalesce(expires_at, coalesce(started_at, now()) + interval '45 minutes'),
  coalesce(started_at, now()) + interval '45 minutes'
)
where status in ('live', 'paused');

create or replace function public.start_lesson_session(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session public.lesson_sessions%rowtype;
  v_sequence bigint;
  v_expires_at timestamptz;
begin
  perform public.expire_lesson_sessions();
  select * into v_session
  from public.lesson_sessions
  where id = target_session_id
  for update;

  if not found then raise exception 'Nie znaleziono sesji.'; end if;
  if v_session.teacher_id <> auth.uid() then raise exception 'Tylko prowadzący może rozpocząć sesję.'; end if;
  if v_session.status not in ('draft', 'lobby', 'paused') then
    raise exception 'Sesja nie może zostać uruchomiona w stanie %.', v_session.status;
  end if;

  -- Pauza nie zeruje licznika. Tylko pierwsze uruchomienie ustawia pełne 45 min.
  v_expires_at := case
    when v_session.status = 'paused' and v_session.started_at is not null
      then least(
        coalesce(v_session.expires_at, v_session.started_at + interval '45 minutes'),
        v_session.started_at + interval '45 minutes'
      )
    else now() + interval '45 minutes'
  end;

  update public.lesson_sessions
  set status = 'live',
      started_at = coalesce(started_at, now()),
      expires_at = v_expires_at
  where id = target_session_id;

  v_sequence := public.append_lesson_session_event(
    target_session_id,
    case when v_session.status = 'paused' then 'resume' else 'start' end,
    jsonb_build_object(
      'activeStageIndex', v_session.active_stage_index,
      'expiresAt', v_expires_at,
      'limitMinutes', 45
    )
  );
  return jsonb_build_object(
    'sessionId', target_session_id,
    'status', 'live',
    'activeStageIndex', v_session.active_stage_index,
    'expiresAt', v_expires_at,
    'sequenceNumber', v_sequence
  );
end;
$$;

create or replace function public.assert_lesson_session_not_expired(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session public.lesson_sessions%rowtype;
begin
  select * into v_session from public.lesson_sessions where id = target_session_id;
  if v_session.expires_at is not null and v_session.expires_at <= now() then
    if v_session.status in ('live', 'paused') then
      raise exception 'Minął limit 45 minut. Sesja Live została zakończona.';
    end if;
    raise exception 'Sesja wygasła.';
  end if;
end;
$$;

create or replace function public.expire_lesson_sessions()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  row record;
  v_count integer := 0;
  v_evidence_count integer;
begin
  if auth.uid() is null then return 0; end if;
  for row in
    select session.id, session.status, session.record_skill_evidence, session.evidence_recorded_at
    from public.lesson_sessions session
    where session.status in ('draft', 'lobby', 'live', 'paused')
      and session.expires_at is not null
      and session.expires_at <= now()
    for update skip locked
  loop
    update public.lesson_sessions
    set status = 'ended', ended_at = coalesce(ended_at, expires_at, now())
    where id = row.id;

    v_evidence_count := 0;
    if row.status in ('live', 'paused')
      and row.record_skill_evidence
      and row.evidence_recorded_at is null then
      begin
        v_evidence_count := public.record_live_session_skill_evidence(row.id);
        update public.lesson_sessions set evidence_recorded_at = now() where id = row.id;
      exception when others then
        v_evidence_count := 0;
      end;
    end if;

    perform public.append_lesson_session_event(row.id, 'end',
      case when row.status in ('live', 'paused') then
        jsonb_build_object('reason', 'time_limit', 'limitMinutes', 45, 'evidenceCount', v_evidence_count)
      else
        jsonb_build_object('reason', 'abandoned_lobby', 'limitHours', 24, 'evidenceCount', 0)
      end
    );
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.start_lesson_session(uuid) from public, anon;
revoke all on function public.assert_lesson_session_not_expired(uuid) from public, anon;
revoke all on function public.expire_lesson_sessions() from public, anon;
grant execute on function public.start_lesson_session(uuid) to authenticated;
grant execute on function public.assert_lesson_session_not_expired(uuid) to authenticated;
grant execute on function public.expire_lesson_sessions() to authenticated;
