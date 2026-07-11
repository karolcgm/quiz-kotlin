-- Obowiązkowa samoocena zrozumienia na końcu lekcji Live i samodzielnej powtórki.

create table if not exists public.lesson_understanding_checks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  lesson_id text not null,
  lesson_version integer not null,
  curriculum_id text,
  section_id text,
  topic_id text,
  source_type text not null check (source_type in ('live', 'review')),
  source_session_id uuid not null references public.lesson_sessions(id) on delete cascade,
  review_id uuid references public.student_lesson_reviews(id) on delete cascade,
  understanding_level text not null check (understanding_level in ('understood', 'partial', 'not_understood')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (source_type = 'live' and review_id is null)
    or (source_type = 'review' and review_id is not null)
  )
);

create unique index if not exists lesson_understanding_checks_live_unique_idx
  on public.lesson_understanding_checks(student_id, source_session_id)
  where source_type = 'live';

create unique index if not exists lesson_understanding_checks_review_unique_idx
  on public.lesson_understanding_checks(student_id, review_id)
  where source_type = 'review';

create index if not exists lesson_understanding_checks_teacher_stats_idx
  on public.lesson_understanding_checks(class_id, section_id, topic_id, updated_at desc);

alter table public.lesson_understanding_checks enable row level security;

create policy "Students read own understanding checks"
  on public.lesson_understanding_checks for select
  using (student_id = auth.uid());

create policy "Teachers read own class understanding checks"
  on public.lesson_understanding_checks for select
  using (exists (
    select 1 from public.teacher_classes teacher_class
    where teacher_class.id = lesson_understanding_checks.class_id
      and teacher_class.teacher_id = auth.uid()
  ));

create or replace function public.submit_live_lesson_understanding(
  target_session_id uuid,
  target_understanding_level text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  student uuid := auth.uid();
  session_row public.lesson_sessions%rowtype;
  saved public.lesson_understanding_checks%rowtype;
begin
  if student is null then raise exception 'Wymagane logowanie ucznia.'; end if;
  if target_understanding_level not in ('understood', 'partial', 'not_understood') then
    raise exception 'Wybierz jedną z trzech odpowiedzi.';
  end if;

  select session.* into session_row
  from public.lesson_sessions session
  join public.lesson_session_participants participant
    on participant.session_id = session.id and participant.student_id = student
  where session.id = target_session_id;

  if not found then raise exception 'Nie uczestniczyłeś w tej sesji.'; end if;
  if session_row.status <> 'ended' then raise exception 'Samoocena jest dostępna po zakończeniu lekcji.'; end if;

  insert into public.lesson_understanding_checks(
    student_id, school_id, class_id, lesson_id, lesson_version,
    curriculum_id, section_id, topic_id, source_type, source_session_id,
    understanding_level
  ) values (
    student, session_row.school_id, session_row.class_id, session_row.lesson_id, session_row.lesson_version,
    session_row.stage_snapshot ->> 'curriculumId', session_row.stage_snapshot ->> 'sectionId',
    session_row.stage_snapshot ->> 'topicId', 'live', session_row.id, target_understanding_level
  )
  on conflict (student_id, source_session_id) where source_type = 'live'
  do update set understanding_level = excluded.understanding_level, updated_at = now()
  returning * into saved;

  return jsonb_build_object('ok', true, 'understandingLevel', saved.understanding_level, 'updatedAt', saved.updated_at);
end;
$$;

create or replace function public.get_my_live_lesson_understanding(target_session_id uuid)
returns text language sql security definer set search_path = public as $$
  select understanding_level
  from public.lesson_understanding_checks
  where student_id = auth.uid() and source_type = 'live' and source_session_id = target_session_id
  limit 1;
$$;

drop function if exists public.finish_student_lesson_review(uuid);

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
begin
  if target_understanding_level not in ('understood', 'partial', 'not_understood') then
    raise exception 'Na końcu wybierz, jak dobrze rozumiesz temat.';
  end if;

  select * into review from public.student_lesson_reviews
  where id = target_review_id and student_id = auth.uid() for update;
  if not found then raise exception 'Nie znaleziono podejścia.'; end if;

  select * into session_row from public.lesson_sessions where id = review.source_session_id;

  if review.status = 'completed' then
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
    return jsonb_build_object('ok', true, 'score', review.score, 'maxScore', review.max_score, 'idempotent', true);
  end if;

  answered_count := (select count(*)::integer from jsonb_each(review.answers));
  if answered_count < review.max_score then raise exception 'Najpierw odpowiedz na wszystkie pytania.'; end if;

  select coalesce(max(score), 0) into prior_best from public.student_lesson_reviews
  where student_id = review.student_id and lesson_id = review.lesson_id
    and status = 'completed' and id <> review.id;
  reward_points := greatest(0, review.score - prior_best) * 5;

  insert into public.lesson_understanding_checks(
    student_id, school_id, class_id, lesson_id, lesson_version,
    curriculum_id, section_id, topic_id, source_type, source_session_id, review_id,
    understanding_level
  ) values (
    review.student_id, session_row.school_id, session_row.class_id, review.lesson_id, review.lesson_version,
    session_row.stage_snapshot ->> 'curriculumId', session_row.stage_snapshot ->> 'sectionId',
    session_row.stage_snapshot ->> 'topicId', 'review', session_row.id, review.id,
    target_understanding_level
  );

  update public.student_lesson_reviews set status = 'completed', completed_at = now() where id = review.id;
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
  return jsonb_build_object('ok', true, 'score', review.score, 'maxScore', review.max_score,
    'rewardPoints', reward_points, 'understandingLevel', target_understanding_level, 'idempotent', false);
end;
$$;

create or replace function public.get_lesson_session_understanding_statistics(target_session_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare session_row public.lesson_sessions%rowtype;
begin
  select * into session_row from public.lesson_sessions where id = target_session_id;
  if not found or session_row.teacher_id <> auth.uid() then raise exception 'Brak dostępu do statystyk sesji.'; end if;

  return (
    with participant_rows as (
      select participant.student_id,
        coalesce(nullif(profile.display_name, ''), nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''), 'Uczeń') display_name,
        understanding.understanding_level,
        understanding.updated_at
      from public.lesson_session_participants participant
      join public.profiles profile on profile.id = participant.student_id
      left join public.lesson_understanding_checks understanding
        on understanding.student_id = participant.student_id
        and understanding.source_type = 'live'
        and understanding.source_session_id = participant.session_id
      where participant.session_id = target_session_id
    )
    select jsonb_build_object(
      'totalStudents', count(*),
      'submittedCount', count(*) filter (where understanding_level is not null),
      'understoodCount', count(*) filter (where understanding_level = 'understood'),
      'partialCount', count(*) filter (where understanding_level = 'partial'),
      'notUnderstoodCount', count(*) filter (where understanding_level = 'not_understood'),
      'needsReviewCount', count(*) filter (where understanding_level in ('partial', 'not_understood')),
      'needsReviewPercent', case when count(*) filter (where understanding_level is not null) = 0 then 0
        else round(100.0 * count(*) filter (where understanding_level in ('partial', 'not_understood'))
          / count(*) filter (where understanding_level is not null))::integer end,
      'students', coalesce(jsonb_agg(jsonb_build_object(
        'studentId', student_id, 'displayName', display_name,
        'understandingLevel', understanding_level, 'updatedAt', updated_at
      ) order by display_name), '[]'::jsonb)
    ) from participant_rows
  );
end;
$$;

create or replace function public.list_teacher_lesson_understanding(target_class_id uuid default null)
returns table (
  check_id uuid, student_id uuid, display_name text, class_id uuid, class_name text,
  group_name text, lesson_id text, lesson_title text, section_id text, topic_id text,
  source_type text, understanding_level text, checked_at timestamptz
) language sql security definer set search_path = public as $$
  select understanding.id, understanding.student_id,
    coalesce(nullif(profile.display_name, ''), nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''), 'Uczeń'),
    teacher_class.id, teacher_class.name, teacher_class.group_name,
    understanding.lesson_id,
    coalesce(session.stage_snapshot ->> 'title', session.stage_snapshot ->> 'lessonTitle', understanding.lesson_id),
    understanding.section_id, understanding.topic_id, understanding.source_type,
    understanding.understanding_level, understanding.updated_at
  from public.lesson_understanding_checks understanding
  join public.teacher_classes teacher_class on teacher_class.id = understanding.class_id
  join public.profiles profile on profile.id = understanding.student_id
  join public.lesson_sessions session on session.id = understanding.source_session_id
  where teacher_class.teacher_id = auth.uid()
    and (target_class_id is null or teacher_class.id = target_class_id)
  order by understanding.updated_at desc;
$$;

revoke all on function public.submit_live_lesson_understanding(uuid, text) from public, anon;
revoke all on function public.get_my_live_lesson_understanding(uuid) from public, anon;
revoke all on function public.finish_student_lesson_review(uuid, text) from public, anon;
revoke all on function public.get_lesson_session_understanding_statistics(uuid) from public, anon;
revoke all on function public.list_teacher_lesson_understanding(uuid) from public, anon;
grant execute on function public.submit_live_lesson_understanding(uuid, text) to authenticated;
grant execute on function public.get_my_live_lesson_understanding(uuid) to authenticated;
grant execute on function public.finish_student_lesson_review(uuid, text) to authenticated;
grant execute on function public.get_lesson_session_understanding_statistics(uuid) to authenticated;
grant execute on function public.list_teacher_lesson_understanding(uuid) to authenticated;
