-- Naprawa planu ucznia:
-- 1. funkcja anulowania musi istnieć również na środowiskach, które ominęły 071;
-- 2. rozwiązane testy są częścią historii nauki i muszą pokazywać właściwy dział;
-- 3. każda pozycja pozostaje ograniczona do ucznia, szkoły i przypisania/klasy.

alter table public.student_lesson_reviews
  drop constraint if exists student_lesson_reviews_status_check;
alter table public.student_lesson_reviews
  add constraint student_lesson_reviews_status_check
  check (status in ('in_progress', 'completed', 'cancelled'));

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
  where id = target_review_id
    and student_id = auth.uid()
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
  with eligible_lessons as (
    select distinct on (session.lesson_id)
      session.id session_id,
      session.lesson_id,
      session.lesson_version,
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
  ), lesson_review_stats as (
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
  ), lesson_rows as (
    select eligible.ended_at sort_at, jsonb_build_object(
      'sourceKind', 'lesson',
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
      'inProgressReviewId', review_stats.in_progress_id,
      'resultId', null,
      'assignmentId', null
    ) item
    from eligible_lessons eligible
    left join lesson_review_stats review_stats on review_stats.lesson_id = eligible.lesson_id
    left join live_scores on live_scores.session_id = eligible.session_id
  ), assessment_candidates as (
    select
      assignment.id assignment_id,
      assignment.title assignment_title,
      submission.id result_id,
      submission.total_score,
      submission.max_score,
      submission.percentage,
      submission.submitted_at,
      test.section_id declared_section_id,
      test.topic_ids[1] declared_topic_id,
      coalesce(
        test.topic_ids[1],
        (select item.skill from public.test_items item where item.test_id = test.id and item.skill ~ '^M5-' order by item.position limit 1)
      ) representative_curriculum_id,
      count(*) over (partition by assignment.id) completed_attempts
    from public.submissions submission
    join public.assignments assignment on assignment.id = submission.assignment_id
    join public.tests test on test.id = assignment.test_id and test.school_id = assignment.school_id
    join public.assignment_students target
      on target.assignment_id = assignment.id
     and target.student_id = auth.uid()
    where submission.student_id = auth.uid()
      and submission.status in ('submitted', 'graded')
      and public.student_can_access_school(assignment.school_id)
      and (
        assignment.class_id is null
        or exists (
          select 1 from public.class_members membership
          where membership.class_id = assignment.class_id
            and membership.school_id = assignment.school_id
            and membership.student_id = auth.uid()
        )
      )
  ), best_assessments as (
    select distinct on (candidate.assignment_id)
      candidate.*,
      coalesce(
        nullif(candidate.declared_section_id, ''),
        case
          when candidate.representative_curriculum_id ~ '^M5-[0-9]+\.'
          then regexp_replace(candidate.representative_curriculum_id, '^M5-([0-9]+)\..*$', 'M5-S\1')
          else null
        end,
        'Inne'
      ) resolved_section_id,
      coalesce(
        nullif(candidate.declared_topic_id, ''),
        nullif(candidate.representative_curriculum_id, ''),
        'test'
      ) resolved_topic_id
    from assessment_candidates candidate
    order by candidate.assignment_id, candidate.percentage desc, candidate.submitted_at desc nulls last
  ), assessment_rows as (
    select assessment.submitted_at sort_at, jsonb_build_object(
      'sourceKind', 'assessment',
      'sessionId', '',
      'lessonId', 'assessment:' || assessment.assignment_id::text,
      'lessonVersion', 1,
      'lessonTitle', assessment.assignment_title,
      'topicId', assessment.resolved_topic_id,
      'sectionId', assessment.resolved_section_id,
      'taughtAt', assessment.submitted_at,
      'textbookPage', null,
      'coveredExercises', '[]'::jsonb,
      'score', assessment.total_score,
      'maxScore', assessment.max_score,
      'completedAttempts', assessment.completed_attempts,
      'latestReviewAt', assessment.submitted_at,
      'inProgressReviewId', null,
      'resultId', assessment.result_id,
      'assignmentId', assessment.assignment_id
    ) item
    from best_assessments assessment
  ), all_rows as (
    select * from lesson_rows
    union all
    select * from assessment_rows
  )
  select coalesce(jsonb_agg(item order by sort_at desc nulls last), '[]'::jsonb)
  from all_rows
  where auth.uid() is not null;
$$;

revoke all on function public.cancel_student_lesson_review(uuid) from public, anon;
revoke all on function public.list_student_learning_plan() from public, anon;
grant execute on function public.cancel_student_lesson_review(uuid) to authenticated;
grant execute on function public.list_student_learning_plan() to authenticated;
