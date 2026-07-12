-- Sesje mogą być kontynuowane, ale nigdy nie pozostają aktywne dłużej niż 24 h.
-- Zakończenie samodzielnej lekcji nie może zostać cofnięte przez opcjonalną nagrodę.

create or replace function public.set_lesson_session_max_lifetime()
returns trigger language plpgsql set search_path = public as $$
begin
  new.expires_at := least(
    coalesce(new.expires_at, new.created_at + interval '24 hours'),
    new.created_at + interval '24 hours'
  );
  return new;
end;
$$;

drop trigger if exists lesson_session_max_lifetime on public.lesson_sessions;
create trigger lesson_session_max_lifetime
before insert or update of expires_at, created_at on public.lesson_sessions
for each row execute function public.set_lesson_session_max_lifetime();

update public.lesson_sessions
set expires_at = created_at + interval '24 hours'
where status in ('draft', 'lobby', 'live', 'paused')
  and (expires_at is null or expires_at > created_at + interval '24 hours');

create or replace function public.expire_lesson_sessions()
returns integer
language plpgsql security definer set search_path = public as $$
declare
  row record;
  v_count integer := 0;
  v_evidence_count integer;
begin
  if auth.uid() is null then return 0; end if;
  for row in
    select session.id, session.record_skill_evidence, session.evidence_recorded_at
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
    if row.record_skill_evidence and row.evidence_recorded_at is null then
      begin
        v_evidence_count := public.record_live_session_skill_evidence(row.id);
        update public.lesson_sessions set evidence_recorded_at = now() where id = row.id;
      exception when others then
        v_evidence_count := 0;
      end;
    end if;

    perform public.append_lesson_session_event(row.id, 'end', jsonb_build_object(
      'reason', 'time_limit', 'limitHours', 24, 'evidenceCount', v_evidence_count
    ));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.assert_lesson_session_not_expired(target_session_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_expires_at timestamptz;
begin
  select expires_at into v_expires_at from public.lesson_sessions where id = target_session_id;
  if v_expires_at is not null and v_expires_at <= now() then
    raise exception 'Minął maksymalny czas 24 godzin. Sesja została zakończona.';
  end if;
end;
$$;

drop function if exists public.finish_student_lesson_review(uuid, text);
create or replace function public.finish_student_lesson_review(
  target_review_id uuid,
  target_understanding_level text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  review public.student_lesson_reviews%rowtype;
  session_row public.lesson_sessions%rowtype;
  section_text text;
  collection_id integer := 0;
  answered_count integer;
  prior_best integer := 0;
  reward_points integer := 0;
  reward_warning text := null;
begin
  if target_understanding_level not in ('understood', 'partial', 'not_understood') then
    raise exception 'Na końcu wybierz, jak dobrze rozumiesz temat.';
  end if;

  select * into review from public.student_lesson_reviews
  where id = target_review_id and student_id = auth.uid() for update;
  if not found then raise exception 'Nie znaleziono podejścia.'; end if;

  select * into session_row from public.lesson_sessions where id = review.source_session_id;
  if not found then raise exception 'Nie znaleziono lekcji źródłowej.'; end if;

  if review.status <> 'completed' then
    answered_count := (select count(*)::integer from jsonb_each(review.answers));
    if answered_count < review.max_score then raise exception 'Najpierw odpowiedz na wszystkie pytania.'; end if;

    select coalesce(max(score), 0) into prior_best from public.student_lesson_reviews
    where student_id = review.student_id and lesson_id = review.lesson_id
      and status = 'completed' and id <> review.id;
    reward_points := greatest(0, review.score - prior_best) * 5;

    -- Najpierw kończymy podejście. Dodatkowe nagrody są operacją best effort.
    update public.student_lesson_reviews
    set status = 'completed', completed_at = coalesce(completed_at, now())
    where id = review.id;
  end if;

  insert into public.lesson_understanding_checks(
    student_id, school_id, class_id, lesson_id, lesson_version,
    curriculum_id, section_id, topic_id, source_type, source_session_id, review_id,
    understanding_level
  ) values (
    review.student_id, session_row.school_id, session_row.class_id, review.lesson_id, review.lesson_version,
    session_row.stage_snapshot ->> 'curriculumId', session_row.stage_snapshot ->> 'sectionId',
    session_row.stage_snapshot ->> 'topicId', 'review', session_row.id, review.id,
    target_understanding_level
  ) on conflict (student_id, review_id) where source_type = 'review'
    do update set understanding_level = excluded.understanding_level, updated_at = now();

  if review.status <> 'completed' then
    begin
      section_text := session_row.stage_snapshot ->> 'sectionId';
      if section_text ~ '[0-9]+$' then
        collection_id := least(9, (regexp_match(section_text, '([0-9]+)$'))[1]::integer);
      end if;
      if reward_points > 0 then
        perform public.grant_student_reward(review.student_id, 'lesson-review', review.id::text,
          'Lepszy wynik samodzielnej lekcji', reward_points, collection_id, true);
      end if;
      perform public.unlock_reward_achievement(review.student_id, 'lesson-review-first', 'special',
        'Samodzielny Powtórkowicz', 'Pierwsza lekcja zaliczona ponownie bez sesji Live!');
    exception when others then
      reward_warning := sqlerrm;
    end;
  end if;

  return jsonb_build_object(
    'ok', true, 'score', review.score, 'maxScore', review.max_score,
    'rewardPoints', reward_points, 'understandingLevel', target_understanding_level,
    'idempotent', review.status = 'completed', 'rewardWarning', reward_warning
  );
end;
$$;

revoke all on function public.set_lesson_session_max_lifetime() from public, anon, authenticated;
revoke all on function public.expire_lesson_sessions() from public, anon;
revoke all on function public.assert_lesson_session_not_expired(uuid) from public, anon;
revoke all on function public.finish_student_lesson_review(uuid, text) from public, anon;
grant execute on function public.expire_lesson_sessions() to authenticated;
grant execute on function public.assert_lesson_session_not_expired(uuid) to authenticated;
grant execute on function public.finish_student_lesson_review(uuid, text) to authenticated;
