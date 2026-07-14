-- Trwały zapis strony i zadań z podręcznika oraz możliwość bezpiecznego
-- zakończenia porzuconego zaliczenia w planie ucznia.

alter table public.lesson_sessions
  add column if not exists textbook_page integer
    check (textbook_page is null or textbook_page between 1 and 999),
  add column if not exists covered_exercises text[] not null default '{}'::text[];

alter table public.student_lesson_reviews
  drop constraint if exists student_lesson_reviews_status_check;
alter table public.student_lesson_reviews
  add constraint student_lesson_reviews_status_check
  check (status in ('in_progress', 'completed', 'cancelled'));

create or replace function public.update_lesson_session_bookwork(
  target_session_id uuid,
  target_page integer,
  target_exercises text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_exercises text[];
begin
  if auth.uid() is null then raise exception 'Wymagane logowanie.'; end if;
  if not public.teacher_owns_lesson_session(target_session_id) then
    raise exception 'Tylko prowadzący może zapisać stronę i zadania.';
  end if;
  if target_page is null or target_page < 1 or target_page > 999 then
    raise exception 'Numer strony musi mieścić się w zakresie 1–999.';
  end if;

  select coalesce(array_agg(label order by first_position), '{}'::text[])
  into clean_exercises
  from (
    select trim(item.value) label, min(item.position) first_position
    from unnest(coalesce(target_exercises, '{}'::text[])) with ordinality as item(value, position)
    where trim(item.value) <> ''
    group by trim(item.value)
  ) labels;

  if cardinality(clean_exercises) < 1 or cardinality(clean_exercises) > 50 then
    raise exception 'Podaj od 1 do 50 przerobionych zadań.';
  end if;
  if exists (select 1 from unnest(clean_exercises) value where char_length(value) > 24) then
    raise exception 'Oznaczenie zadania może mieć najwyżej 24 znaki.';
  end if;

  update public.lesson_sessions
  set textbook_page = target_page,
      covered_exercises = clean_exercises,
      updated_at = now()
  where id = target_session_id;

  return jsonb_build_object(
    'ok', true,
    'textbookPage', target_page,
    'coveredExercises', to_jsonb(clean_exercises)
  );
end;
$$;

create or replace function public.cancel_student_lesson_review(target_review_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  review public.student_lesson_reviews%rowtype;
begin
  if auth.uid() is null then raise exception 'Wymagane logowanie ucznia.'; end if;
  select * into review
  from public.student_lesson_reviews
  where id = target_review_id and student_id = auth.uid()
  for update;

  if not found then raise exception 'Nie znaleziono rozpoczętego zaliczenia.'; end if;
  if review.status = 'cancelled' then
    return jsonb_build_object('ok', true, 'idempotent', true);
  end if;
  if review.status <> 'in_progress' then
    raise exception 'Zakończonego zaliczenia nie można anulować.';
  end if;

  update public.student_lesson_reviews
  set status = 'cancelled', completed_at = now()
  where id = target_review_id;

  return jsonb_build_object('ok', true, 'idempotent', false);
end;
$$;

create or replace function public.list_student_learning_plan()
returns jsonb
language sql
security definer
set search_path = public
as $$
  with eligible as (
    select distinct on (session.lesson_id)
      session.id session_id, session.lesson_id, session.lesson_version,
      coalesce(session.stage_snapshot ->> 'title', session.stage_snapshot ->> 'lessonTitle') lesson_title,
      session.stage_snapshot ->> 'topicId' topic_id,
      session.stage_snapshot ->> 'sectionId' section_id,
      session.ended_at,
      session.textbook_page,
      session.covered_exercises,
      public.student_lesson_question_count(session.stage_snapshot) snapshot_max
    from public.lesson_sessions session
    join public.class_members membership
      on membership.class_id = session.class_id
     and membership.student_id = auth.uid()
     and membership.school_id = session.school_id
    where session.status = 'ended'
    order by session.lesson_id, session.ended_at desc nulls last
  ), review_stats as (
    select review.lesson_id,
      max(review.score) filter (where review.status = 'completed') best_score,
      max(review.max_score) filter (where review.status = 'completed') review_max,
      count(*) filter (where review.status = 'completed') completed_attempts,
      max(review.completed_at) filter (where review.status = 'completed') latest_review_at,
      (array_agg(review.id order by review.started_at desc) filter (where review.status = 'in_progress'))[1] in_progress_id
    from public.student_lesson_reviews review
    where review.student_id = auth.uid()
    group by review.lesson_id
  ), live_scores as (
    select grade.session_id, grade.total_score::integer live_score, grade.max_score::integer live_max
    from public.lesson_session_grades grade
    where grade.student_id = auth.uid()
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'sessionId', eligible.session_id,
    'lessonId', eligible.lesson_id,
    'lessonVersion', eligible.lesson_version,
    'lessonTitle', eligible.lesson_title,
    'topicId', eligible.topic_id,
    'sectionId', eligible.section_id,
    'taughtAt', eligible.ended_at,
    'textbookPage', eligible.textbook_page,
    'coveredExercises', to_jsonb(eligible.covered_exercises),
    'score', greatest(coalesce(review_stats.best_score, 0), coalesce(live_scores.live_score, 0)),
    'maxScore', greatest(eligible.snapshot_max, coalesce(review_stats.review_max, 0), coalesce(live_scores.live_max, 0)),
    'completedAttempts', coalesce(review_stats.completed_attempts, 0),
    'latestReviewAt', review_stats.latest_review_at,
    'inProgressReviewId', review_stats.in_progress_id
  ) order by eligible.ended_at desc), '[]'::jsonb)
  from eligible
  left join review_stats on review_stats.lesson_id = eligible.lesson_id
  left join live_scores on live_scores.session_id = eligible.session_id;
$$;

create or replace function public.get_student_lesson_review(target_review_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  review public.student_lesson_reviews%rowtype;
  session public.lesson_sessions%rowtype;
begin
  select * into review
  from public.student_lesson_reviews
  where id = target_review_id
    and student_id = auth.uid()
    and status in ('in_progress', 'completed');
  if not found then return null; end if;

  select * into session from public.lesson_sessions where id = review.source_session_id;
  return jsonb_build_object(
    'reviewId', review.id,
    'lessonId', review.lesson_id,
    'lessonVersion', review.lesson_version,
    'attemptNumber', review.attempt_number,
    'status', review.status,
    'answers', review.answers,
    'score', review.score,
    'maxScore', review.max_score,
    'currentStageIndex', review.current_stage_index,
    'textbookPage', session.textbook_page,
    'coveredExercises', to_jsonb(session.covered_exercises),
    'stageSnapshot', session.stage_snapshot
  );
end;
$$;

revoke all on function public.update_lesson_session_bookwork(uuid, integer, text[]) from public, anon;
revoke all on function public.cancel_student_lesson_review(uuid) from public, anon;
revoke all on function public.list_student_learning_plan() from public, anon;
revoke all on function public.get_student_lesson_review(uuid) from public, anon;
grant execute on function public.update_lesson_session_bookwork(uuid, integer, text[]) to authenticated;
grant execute on function public.cancel_student_lesson_review(uuid) to authenticated;
grant execute on function public.list_student_learning_plan() to authenticated;
grant execute on function public.get_student_lesson_review(uuid) to authenticated;
