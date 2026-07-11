-- Punkty z testu są wypłacane tylko do poziomu najlepszego wyniku ucznia.
-- Naklejki może przyznać wyłącznie nauczyciel albo jednorazowe 100%
-- całego tematu / pracy domowej.

create table if not exists public.student_reward_score_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('assignment', 'practice')),
  scope_id text not null,
  best_paid_points integer not null default 0 check (best_paid_points >= 0),
  max_points integer not null check (max_points >= 0),
  updated_at timestamptz not null default now(),
  primary key (student_id, scope_type, scope_id)
);

alter table public.student_reward_score_progress enable row level security;

-- Zapisujemy najlepszy historyczny wynik. Dzięki temu wdrożenie migracji nie
-- wypłaci ponownie punktów za testy ukończone przed jej uruchomieniem.
insert into public.student_reward_score_progress(
  student_id, scope_type, scope_id, best_paid_points, max_points
)
select submission.student_id, 'assignment', submission.assignment_id::text,
  greatest(0, max(round(
    least(coalesce(submission.total_score, 0), coalesce(submission.max_score, 0)) * 10
  )::integer)),
  greatest(0, max(round(coalesce(submission.max_score, 0) * 10)::integer))
from public.submissions submission
where submission.status in ('submitted', 'graded')
group by submission.student_id, submission.assignment_id
on conflict (student_id, scope_type, scope_id) do update
set best_paid_points = greatest(
      public.student_reward_score_progress.best_paid_points,
      excluded.best_paid_points
    ),
    max_points = greatest(public.student_reward_score_progress.max_points, excluded.max_points),
    updated_at = now();

-- Szybkie testy mają wspólną, niegrindowalną pulę 80 punktów na typ testu.
insert into public.student_reward_score_progress(
  student_id, scope_type, scope_id, best_paid_points, max_points
)
select attempt.student_id, 'practice', lower(trim(attempt.title)),
  greatest(0, max(round(least(100, greatest(0, attempt.percentage)) * 0.8)::integer)),
  80
from public.practice_attempts attempt
group by attempt.student_id, lower(trim(attempt.title))
on conflict (student_id, scope_type, scope_id) do update
set best_paid_points = greatest(
      public.student_reward_score_progress.best_paid_points,
      excluded.best_paid_points
    ),
    max_points = greatest(public.student_reward_score_progress.max_points, excluded.max_points),
    updated_at = now();

create or replace function public.grant_student_reward(
  target_student_id uuid, target_source_type text, target_source_id text,
  target_reason text, target_points integer, target_collection integer default 0,
  award_sticker boolean default false
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  inserted_count integer;
  new_total integer;
  sticker integer;
  sticker_inserted integer := 0;
  collection integer;
  sticker_is_allowed boolean;
begin
  if target_student_id is null or target_points < 0 then
    return jsonb_build_object('awarded', false);
  end if;

  -- Centralne zabezpieczenie: nawet błędne wywołanie z innego miejsca nie może
  -- przyznać naklejki za pojedynczą odpowiedź ani zwykłą próbę testu.
  sticker_is_allowed := award_sticker and target_source_type in (
    'teacher-award', 'topic-perfect', 'homework-perfect'
  );

  perform public.ensure_student_reward_profile(target_student_id);
  insert into public.student_reward_events(student_id, source_type, source_id, reason, points)
  values (target_student_id, target_source_type, target_source_id, target_reason, target_points)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return jsonb_build_object('awarded', false); end if;

  update public.student_reward_profiles
  set total_points = total_points + target_points, updated_at = now()
  where student_id = target_student_id
  returning total_points into new_total;

  if sticker_is_allowed then
    collection := greatest(0, least(2, target_collection));
    sticker := collection * 20
      + mod(abs(hashtextextended(
          target_source_type || ':' || target_source_id || ':' || target_student_id::text,
          2026
        )), 20)::integer;

    select candidate into sticker
    from (
      select collection * 20 + mod((sticker % 20) + offset_value, 20) candidate,
        offset_value
      from generate_series(0, 19) offset_value
    ) available
    where not exists (
      select 1 from public.student_stickers owned
      where owned.student_id = target_student_id
        and owned.sticker_id = available.candidate
    )
    order by offset_value
    limit 1;

    if sticker is not null then
      insert into public.student_stickers(student_id, sticker_id, source_type, source_id)
      values (target_student_id, sticker, target_source_type, target_source_id)
      on conflict do nothing;
      get diagnostics sticker_inserted = row_count;
    end if;

    if sticker_inserted > 0 then
      insert into public.student_reward_notifications(student_id, kind, reward_key, title, message)
      values (target_student_id, 'sticker', sticker::text, 'Nowa naklejka!',
        'Tajemnicza nagroda została odsłonięta w Twoim klaserze.');
    end if;
  end if;

  return jsonb_build_object(
    'awarded', true,
    'points', target_points,
    'totalPoints', new_total,
    'stickerId', case when sticker_inserted > 0 then sticker else null end
  );
end;
$$;

revoke all on function public.grant_student_reward(uuid, text, text, text, integer, integer, boolean)
  from public, anon, authenticated;

create or replace function public.award_bounded_test_points(
  target_student_id uuid,
  target_scope_type text,
  target_scope_id text,
  target_attempt_id text,
  target_reason text,
  target_candidate_points integer,
  target_max_points integer
) returns integer language plpgsql security definer set search_path = public as $$
declare
  progress public.student_reward_score_progress%rowtype;
  candidate integer := greatest(0, least(target_candidate_points, target_max_points));
  point_delta integer;
begin
  if target_scope_type not in ('assignment', 'practice')
    or target_student_id is null
    or nullif(trim(target_scope_id), '') is null
    or target_max_points < 0 then
    raise exception 'Nieprawidłowy zakres puli punktów.';
  end if;

  insert into public.student_reward_score_progress(
    student_id, scope_type, scope_id, best_paid_points, max_points
  ) values (
    target_student_id, target_scope_type, target_scope_id, 0, target_max_points
  ) on conflict (student_id, scope_type, scope_id) do nothing;

  select * into progress
  from public.student_reward_score_progress
  where student_id = target_student_id
    and scope_type = target_scope_type
    and scope_id = target_scope_id
  for update;

  point_delta := greatest(0, candidate - progress.best_paid_points);
  if point_delta > 0 then
    perform public.grant_student_reward(
      target_student_id,
      target_scope_type || '-points',
      target_attempt_id || ':' || candidate::text,
      target_reason,
      point_delta,
      0,
      false
    );
  end if;

  update public.student_reward_score_progress
  set best_paid_points = greatest(best_paid_points, candidate),
      max_points = greatest(max_points, target_max_points),
      updated_at = now()
  where student_id = target_student_id
    and scope_type = target_scope_type
    and scope_id = target_scope_id;

  return point_delta;
end;
$$;

revoke all on function public.award_bounded_test_points(uuid, text, text, text, text, integer, integer)
  from public, anon, authenticated;

create or replace function public.reward_live_response_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare collection_id integer := 0; section_text text;
begin
  if new.status = 'submitted' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    select stage_snapshot ->> 'sectionId' into section_text
    from public.lesson_sessions where id = new.session_id;
    if section_text ~ '[0-9]+$' then
      collection_id := least(2, (regexp_match(section_text, '([0-9]+)$'))[1]::integer);
    end if;
    perform public.grant_student_reward(
      new.student_id, 'live', new.id::text, 'Odpowiedź w lekcji Live',
      case when new.score = new.max_score then 10 else 3 end,
      collection_id, false
    );
  end if;
  return new;
end;
$$;

create or replace function public.reward_practice_attempt_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare candidate_points integer;
begin
  candidate_points := round(least(100, greatest(0, new.percentage)) * 0.8)::integer;
  perform public.award_bounded_test_points(
    new.student_id, 'practice', lower(trim(new.title)), new.id::text,
    'Lepszy wynik szybkiego testu', candidate_points, 80
  );
  if new.percentage >= 80 then
    perform public.unlock_reward_achievement(
      new.student_id, 'home-review-first', 'special', 'Domowy Odkrywca',
      'Świetna powtórka wykonana samodzielnie!'
    );
  end if;
  return new;
end;
$$;

create or replace function public.reward_assignment_submission_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  assignment_kind text;
  candidate_points integer;
  pool_points integer;
begin
  if new.status in ('submitted', 'graded') and (
    tg_op = 'INSERT'
    or old.status is distinct from new.status
    or old.total_score is distinct from new.total_score
    or old.max_score is distinct from new.max_score
  ) then
    select kind::text into assignment_kind
    from public.assignments where id = new.assignment_id;
    pool_points := greatest(0, round(coalesce(new.max_score, 0) * 10)::integer);
    candidate_points := greatest(0, round(coalesce(new.total_score, 0) * 10)::integer);

    perform public.award_bounded_test_points(
      new.student_id, 'assignment', new.assignment_id::text, new.id::text,
      case when assignment_kind = 'homework'
        then 'Lepszy wynik pracy domowej'
        else 'Lepszy wynik testu'
      end,
      candidate_points, pool_points
    );

    if assignment_kind = 'homework' then
      perform public.unlock_reward_achievement(
        new.student_id, 'homework-first', 'special', 'Pierwsza misja domowa',
        'Pierwsza ukończona praca domowa!'
      );
      if coalesce(new.max_score, 0) > 0
        and coalesce(new.total_score, 0) >= new.max_score then
        perform public.grant_student_reward(
          new.student_id, 'homework-perfect', new.assignment_id::text,
          'Praca domowa zaliczona na 100%', 0, 2, true
        );
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reward_assignment_submission on public.submissions;
create trigger reward_assignment_submission
after insert or update of status, total_score, max_score on public.submissions
for each row execute function public.reward_assignment_submission_trigger();

create or replace function public.reward_lesson_section_badge_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare section_number integer := 0; badge_id text;
begin
  if coalesce(new.section_id, '') ~ '[0-9]+$' then
    section_number := least(9, (regexp_match(new.section_id, '([0-9]+)$'))[1]::integer);
  end if;
  badge_id := 'section-' || section_number;
  perform public.unlock_reward_achievement(
    new.student_id, badge_id, 'section',
    case when section_number = 0 then 'Pamiętam klasę IV!' else 'Odznaka działu ' || section_number end,
    case when section_number = 0
      then 'Gratulacje — pamiętasz ważne rzeczy z poprzedniej klasy.'
      else 'Pierwsza ukończona lekcja przybliża Cię do pełnej kolekcji działu.'
    end
  );

  if coalesce(new.max_score, 0) > 0
    and coalesce(new.total_score, 0) >= new.max_score then
    perform public.grant_student_reward(
      new.student_id, 'topic-perfect', new.lesson_id,
      'Cały temat zaliczony na 100%', 0, least(2, section_number), true
    );
  end if;
  return new;
end;
$$;

create or replace function public.reward_perfect_lesson_review_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare collection_id integer := 0; section_text text;
begin
  if new.status = 'completed'
    and old.status is distinct from new.status
    and coalesce(new.max_score, 0) > 0
    and coalesce(new.score, 0) >= new.max_score then
    select session.stage_snapshot ->> 'sectionId' into section_text
    from public.lesson_sessions session where session.id = new.source_session_id;
    if section_text ~ '[0-9]+$' then
      collection_id := least(2, (regexp_match(section_text, '([0-9]+)$'))[1]::integer);
    end if;
    perform public.grant_student_reward(
      new.student_id, 'topic-perfect', new.lesson_id,
      'Cały temat zaliczony na 100%', 0, collection_id, true
    );
  end if;
  return new;
end;
$$;

drop trigger if exists reward_perfect_lesson_review on public.student_lesson_reviews;
create trigger reward_perfect_lesson_review
after update of status on public.student_lesson_reviews
for each row execute function public.reward_perfect_lesson_review_trigger();

revoke all on function public.reward_live_response_trigger() from public, anon, authenticated;
revoke all on function public.reward_practice_attempt_trigger() from public, anon, authenticated;
revoke all on function public.reward_assignment_submission_trigger() from public, anon, authenticated;
revoke all on function public.reward_lesson_section_badge_trigger() from public, anon, authenticated;
revoke all on function public.reward_perfect_lesson_review_trigger() from public, anon, authenticated;
