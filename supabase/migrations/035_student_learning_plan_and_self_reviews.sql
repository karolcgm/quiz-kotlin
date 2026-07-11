-- Plan nauki ucznia: tylko lekcje zakończone przez nauczyciela w jego klasie
-- oraz samodzielne, wielokrotne zaliczenia bez uruchamiania sesji Live.

create table if not exists public.student_lesson_reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  lesson_version integer not null,
  source_session_id uuid not null references public.lesson_sessions(id) on delete cascade,
  attempt_number integer not null default 1,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  answers jsonb not null default '{}'::jsonb,
  score integer not null default 0 check (score >= 0),
  max_score integer not null default 0 check (max_score >= 0),
  current_stage_index integer not null default 0 check (current_stage_index >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, lesson_id, attempt_number)
);

create index if not exists student_lesson_reviews_student_lesson_idx
  on public.student_lesson_reviews(student_id, lesson_id, completed_at desc, started_at desc);

alter table public.student_lesson_reviews enable row level security;
create policy "Students read own lesson reviews" on public.student_lesson_reviews for select using (student_id = auth.uid());

create or replace function public.student_lesson_question_count(snapshot jsonb)
returns integer language sql immutable set search_path = public as $$
  select coalesce(sum(jsonb_array_length(case when jsonb_typeof(stage -> 'questions') = 'array' then stage -> 'questions' else '[]'::jsonb end)), 0)::integer
  from jsonb_array_elements(case when jsonb_typeof(snapshot -> 'stages') = 'array' then snapshot -> 'stages' else '[]'::jsonb end) stage;
$$;

create or replace function public.list_student_learning_plan()
returns jsonb language sql security definer set search_path = public as $$
  with eligible as (
    select distinct on (session.lesson_id)
      session.id session_id, session.lesson_id, session.lesson_version,
      coalesce(session.stage_snapshot ->> 'title', session.stage_snapshot ->> 'lessonTitle') lesson_title,
      session.stage_snapshot ->> 'topicId' topic_id,
      session.stage_snapshot ->> 'sectionId' section_id,
      session.ended_at,
      public.student_lesson_question_count(session.stage_snapshot) snapshot_max
    from public.lesson_sessions session
    join public.class_members membership on membership.class_id = session.class_id and membership.student_id = auth.uid()
    where session.status = 'ended'
    order by session.lesson_id, session.ended_at desc nulls last
  ), review_stats as (
    select review.lesson_id,
      max(review.score) filter (where review.status = 'completed') best_score,
      max(review.max_score) filter (where review.status = 'completed') review_max,
      count(*) filter (where review.status = 'completed') completed_attempts,
      max(review.completed_at) latest_review_at,
      (array_agg(review.id order by review.started_at desc) filter (where review.status = 'in_progress'))[1] in_progress_id
    from public.student_lesson_reviews review where review.student_id = auth.uid() group by review.lesson_id
  ), live_scores as (
    select grade.session_id, grade.total_score::integer live_score, grade.max_score::integer live_max
    from public.lesson_session_grades grade where grade.student_id = auth.uid()
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'sessionId', eligible.session_id, 'lessonId', eligible.lesson_id, 'lessonVersion', eligible.lesson_version,
    'lessonTitle', eligible.lesson_title, 'topicId', eligible.topic_id, 'sectionId', eligible.section_id,
    'taughtAt', eligible.ended_at,
    'score', greatest(coalesce(review_stats.best_score, 0), coalesce(live_scores.live_score, 0)),
    'maxScore', greatest(eligible.snapshot_max, coalesce(review_stats.review_max, 0), coalesce(live_scores.live_max, 0)),
    'completedAttempts', coalesce(review_stats.completed_attempts, 0),
    'latestReviewAt', review_stats.latest_review_at, 'inProgressReviewId', review_stats.in_progress_id
  ) order by eligible.ended_at desc), '[]'::jsonb)
  from eligible left join review_stats on review_stats.lesson_id = eligible.lesson_id
  left join live_scores on live_scores.session_id = eligible.session_id;
$$;

create or replace function public.start_student_lesson_review(target_lesson_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare student uuid := auth.uid(); source_session public.lesson_sessions%rowtype; existing public.student_lesson_reviews%rowtype; next_attempt integer; created public.student_lesson_reviews%rowtype;
begin
  if student is null then raise exception 'Wymagane logowanie ucznia.'; end if;
  select session.* into source_session from public.lesson_sessions session
  join public.class_members membership on membership.class_id = session.class_id and membership.student_id = student
  where session.lesson_id = target_lesson_id and session.status = 'ended'
  order by session.ended_at desc nulls last limit 1;
  if not found then raise exception 'Ta lekcja nie została jeszcze przerobiona przez Twoją klasę.'; end if;

  select * into existing from public.student_lesson_reviews
  where student_id = student and lesson_id = target_lesson_id and status = 'in_progress'
  order by started_at desc limit 1;
  if found then return jsonb_build_object('reviewId', existing.id, 'resumed', true); end if;

  select coalesce(max(attempt_number), 0) + 1 into next_attempt from public.student_lesson_reviews where student_id = student and lesson_id = target_lesson_id;
  insert into public.student_lesson_reviews(student_id, lesson_id, lesson_version, source_session_id, attempt_number, max_score)
  values(student, source_session.lesson_id, source_session.lesson_version, source_session.id, next_attempt, public.student_lesson_question_count(source_session.stage_snapshot))
  returning * into created;
  return jsonb_build_object('reviewId', created.id, 'resumed', false);
end;
$$;

create or replace function public.get_student_lesson_review(target_review_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare review public.student_lesson_reviews%rowtype; session public.lesson_sessions%rowtype;
begin
  select * into review from public.student_lesson_reviews where id = target_review_id and student_id = auth.uid();
  if not found then return null; end if;
  select * into session from public.lesson_sessions where id = review.source_session_id;
  return jsonb_build_object('reviewId', review.id, 'lessonId', review.lesson_id, 'lessonVersion', review.lesson_version,
    'attemptNumber', review.attempt_number, 'status', review.status, 'answers', review.answers,
    'score', review.score, 'maxScore', review.max_score, 'currentStageIndex', review.current_stage_index,
    'stageSnapshot', session.stage_snapshot);
end;
$$;

create or replace function public.submit_student_lesson_review_answer(
  target_review_id uuid, target_stage_id text, target_question_id text,
  client_attempt_id uuid, public_answer jsonb, target_stage_index integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare review public.student_lesson_reviews%rowtype; session public.lesson_sessions%rowtype; answer_entry jsonb; is_correct boolean; answer_key text; next_answers jsonb; next_score integer;
begin
  select * into review from public.student_lesson_reviews where id = target_review_id and student_id = auth.uid() for update;
  if not found or review.status <> 'in_progress' then raise exception 'To podejście nie jest aktywne.'; end if;
  if review.answers ? target_question_id then return jsonb_build_object('ok', true, 'idempotent', true, 'score', review.score, 'maxScore', review.max_score); end if;
  select * into session from public.lesson_sessions where id = review.source_session_id;
  select entry into answer_entry from jsonb_array_elements(case when jsonb_typeof(session.answer_key -> 'questions') = 'array' then session.answer_key -> 'questions' else '[]'::jsonb end) entry
  where entry ->> 'questionInstanceId' = target_question_id limit 1;
  if answer_entry is null then raise exception 'Nie znaleziono pytania w tej lekcji.'; end if;
  answer_key := answer_entry -> 'answerSpec' ->> 'firstStepOperatorIndex';
  is_correct := coalesce((public_answer ->> 'selectedOperatorIndex')::integer, -999) = coalesce(answer_key::integer, -998);
  next_answers := review.answers || jsonb_build_object(target_question_id, jsonb_build_object(
    'stageId', target_stage_id, 'correct', is_correct, 'answerLabel', public_answer ->> 'answerLabel',
    'clientAttemptId', client_attempt_id, 'submittedAt', now()
  ));
  next_score := (select count(*)::integer from jsonb_each(next_answers) item where coalesce((item.value ->> 'correct')::boolean, false));
  update public.student_lesson_reviews set answers = next_answers, score = next_score, current_stage_index = greatest(current_stage_index, target_stage_index)
  where id = target_review_id;
  return jsonb_build_object('ok', true, 'idempotent', false, 'correct', is_correct, 'score', next_score, 'maxScore', review.max_score);
end;
$$;

create or replace function public.finish_student_lesson_review(target_review_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare review public.student_lesson_reviews%rowtype; section_text text; collection_id integer := 0; answered_count integer; prior_best integer := 0; reward_points integer := 0;
begin
  select * into review from public.student_lesson_reviews where id = target_review_id and student_id = auth.uid() for update;
  if not found then raise exception 'Nie znaleziono podejścia.'; end if;
  if review.status = 'completed' then return jsonb_build_object('ok', true, 'score', review.score, 'maxScore', review.max_score, 'idempotent', true); end if;
  answered_count := (select count(*)::integer from jsonb_each(review.answers));
  if answered_count < review.max_score then raise exception 'Najpierw odpowiedz na wszystkie pytania.'; end if;
  select coalesce(max(score), 0) into prior_best from public.student_lesson_reviews
  where student_id = review.student_id and lesson_id = review.lesson_id and status = 'completed' and id <> review.id;
  reward_points := greatest(0, review.score - prior_best) * 5;
  update public.student_lesson_reviews set status = 'completed', completed_at = now() where id = review.id;
  select stage_snapshot ->> 'sectionId' into section_text from public.lesson_sessions where id = review.source_session_id;
  if section_text ~ '[0-9]+$' then collection_id := least(9, (regexp_match(section_text, '([0-9]+)$'))[1]::integer); end if;
  if reward_points > 0 then
    perform public.grant_student_reward(review.student_id, 'lesson-review', review.id::text, 'Lepszy wynik samodzielnej lekcji', reward_points, collection_id, true);
  end if;
  perform public.unlock_reward_achievement(review.student_id, 'lesson-review-first', 'special', 'Samodzielny Powtórkowicz', 'Pierwsza lekcja zaliczona ponownie bez sesji Live!');
  return jsonb_build_object('ok', true, 'score', review.score, 'maxScore', review.max_score, 'rewardPoints', reward_points, 'idempotent', false);
end;
$$;

revoke all on function public.list_student_learning_plan() from public, anon;
revoke all on function public.start_student_lesson_review(text) from public, anon;
revoke all on function public.get_student_lesson_review(uuid) from public, anon;
revoke all on function public.submit_student_lesson_review_answer(uuid, text, text, uuid, jsonb, integer) from public, anon;
revoke all on function public.finish_student_lesson_review(uuid) from public, anon;
grant execute on function public.list_student_learning_plan() to authenticated;
grant execute on function public.start_student_lesson_review(text) to authenticated;
grant execute on function public.get_student_lesson_review(uuid) to authenticated;
grant execute on function public.submit_student_lesson_review_answer(uuid, text, text, uuid, jsonb, integer) to authenticated;
grant execute on function public.finish_student_lesson_review(uuid) to authenticated;
