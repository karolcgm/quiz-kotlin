-- Spójna ekonomia punktów:
-- * temat (Live i powtórka współdzielą pulę): maks. 20 pkt,
-- * test / praca domowa: maks. 20 pkt,
-- * szybki test: maks. 10 pkt,
-- * wynik poniżej 50% nie wypłaca punktów.

alter table public.student_reward_score_progress
  drop constraint if exists student_reward_score_progress_scope_type_check;
alter table public.student_reward_score_progress
  add constraint student_reward_score_progress_scope_type_check
  check (scope_type in ('assignment', 'practice', 'lesson'));

create or replace function public.reward_points_for_percentage(
  target_percentage numeric,
  target_pool integer
) returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when target_pool <= 0 or coalesce(target_percentage, 0) < 50 then 0
    else least(
      target_pool,
      round(least(100, greatest(0, target_percentage)) * target_pool / 100.0)::integer
    )
  end;
$$;

revoke all on function public.reward_points_for_percentage(numeric, integer)
  from public, anon, authenticated;

-- Stare próby były już opłacane według znacznie wyższej skali. Oznaczamy ich
-- nowe pule jako wykorzystane, aby migracja nie dopłacała punktów ponownie.
update public.student_reward_score_progress
set best_paid_points = 20, max_points = 20, updated_at = now()
where scope_type = 'assignment';

update public.student_reward_score_progress
set best_paid_points = 10, max_points = 10, updated_at = now()
where scope_type = 'practice';

insert into public.student_reward_score_progress(
  student_id, scope_type, scope_id, best_paid_points, max_points
)
select historical.student_id, 'lesson', historical.lesson_id, 20, 20
from (
  select grade.student_id, grade.lesson_id
  from public.lesson_session_grades grade
  union
  select review.student_id, review.lesson_id
  from public.student_lesson_reviews review
  where review.status = 'completed'
) historical
on conflict (student_id, scope_type, scope_id) do update
set best_paid_points = 20, max_points = 20, updated_at = now();

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
  effective_points integer;
begin
  if target_student_id is null or target_points < 0 then
    return jsonb_build_object('awarded', false);
  end if;

  sticker_is_allowed := award_sticker and target_source_type in (
    'teacher-award', 'topic-perfect', 'homework-perfect'
  );

  -- Starsze funkcje nadal wywołują nagrodę za każdą odpowiedź Live i za wynik
  -- powtórki. Punkty tych źródeł zastępuje wspólna pula całego tematu.
  effective_points := case
    when target_source_type in ('live', 'lesson-review') then 0
    else target_points
  end;

  perform public.ensure_student_reward_profile(target_student_id);
  insert into public.student_reward_events(student_id, source_type, source_id, reason, points)
  values (target_student_id, target_source_type, target_source_id, target_reason, effective_points)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return jsonb_build_object('awarded', false); end if;

  update public.student_reward_profiles
  set total_points = total_points + effective_points, updated_at = now()
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

  if new_total >= 100 then
    perform public.unlock_reward_achievement(target_student_id, 'points-100', 'bronze',
      'Pierwsze 100 punktów', 'Świetny początek — masz już 100 punktów!');
  end if;
  if new_total >= 500 then
    perform public.unlock_reward_achievement(target_student_id, 'points-500', 'silver',
      '500 punktów', 'Twoja systematyczność naprawdę działa!');
  end if;
  if new_total >= 1500 then
    perform public.unlock_reward_achievement(target_student_id, 'points-1500', 'gold',
      'Mistrz programu', 'To wynik godny mistrza całego programu!');
  end if;

  return jsonb_build_object(
    'awarded', true,
    'points', effective_points,
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
  if target_scope_type not in ('assignment', 'practice', 'lesson')
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

-- Pojedyncza odpowiedź Live nie tworzy już zdarzenia punktowego. Wynik całej
-- lekcji zostanie rozliczony po utworzeniu lesson_session_grades.
create or replace function public.reward_live_response_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  return new;
end;
$$;

create or replace function public.reward_practice_attempt_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare candidate_points integer;
begin
  candidate_points := public.reward_points_for_percentage(new.percentage, 10);
  perform public.award_bounded_test_points(
    new.student_id, 'practice', lower(trim(new.title)), new.id::text,
    'Lepszy wynik szybkiego testu', candidate_points, 10
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
declare assignment_kind text; candidate_points integer;
begin
  if new.status in ('submitted', 'graded') and (
    tg_op = 'INSERT'
    or old.status is distinct from new.status
    or old.total_score is distinct from new.total_score
    or old.max_score is distinct from new.max_score
  ) then
    select kind::text into assignment_kind
    from public.assignments where id = new.assignment_id;
    candidate_points := public.reward_points_for_percentage(new.percentage, 20);

    perform public.award_bounded_test_points(
      new.student_id, 'assignment', new.assignment_id::text, new.id::text,
      case when assignment_kind = 'homework'
        then 'Lepszy wynik pracy domowej'
        else 'Lepszy wynik testu'
      end,
      candidate_points, 20
    );

    if assignment_kind = 'homework' then
      perform public.unlock_reward_achievement(
        new.student_id, 'homework-first', 'special', 'Pierwsza misja domowa',
        'Pierwsza ukończona praca domowa!'
      );
      if coalesce(new.percentage, 0) >= 100 then
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

create or replace function public.reward_lesson_section_badge_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare section_number integer := 0; badge_id text; candidate_points integer;
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

  candidate_points := public.reward_points_for_percentage(new.percentage, 20);
  perform public.award_bounded_test_points(
    new.student_id, 'lesson', new.lesson_id, new.session_id::text,
    'Lepszy wynik całego tematu', candidate_points, 20
  );

  if coalesce(new.percentage, 0) >= 100 then
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
declare
  collection_id integer := 0;
  section_text text;
  review_percentage numeric;
  candidate_points integer;
begin
  if new.status = 'completed' and old.status is distinct from new.status then
    select session.stage_snapshot ->> 'sectionId' into section_text
    from public.lesson_sessions session where session.id = new.source_session_id;
    if section_text ~ '[0-9]+$' then
      collection_id := least(2, (regexp_match(section_text, '([0-9]+)$'))[1]::integer);
    end if;

    review_percentage := case when coalesce(new.max_score, 0) > 0
      then 100.0 * new.score / new.max_score else 0 end;
    candidate_points := public.reward_points_for_percentage(review_percentage, 20);
    perform public.award_bounded_test_points(
      new.student_id, 'lesson', new.lesson_id, new.id::text,
      'Lepszy wynik całego tematu', candidate_points, 20
    );

    if review_percentage >= 100 then
      perform public.grant_student_reward(
        new.student_id, 'topic-perfect', new.lesson_id,
        'Cały temat zaliczony na 100%', 0, collection_id, true
      );
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.reward_practice_attempt_trigger() from public, anon, authenticated;
revoke all on function public.reward_live_response_trigger() from public, anon, authenticated;
revoke all on function public.reward_assignment_submission_trigger() from public, anon, authenticated;
revoke all on function public.reward_lesson_section_badge_trigger() from public, anon, authenticated;
revoke all on function public.reward_perfect_lesson_review_trigger() from public, anon, authenticated;

create or replace function public.select_student_cosmetics(
  target_sticker integer default null,
  target_theme text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare student uuid := auth.uid(); points integer; required_points integer;
begin
  if student is null then raise exception 'Wymagane logowanie.'; end if;
  perform public.ensure_student_reward_profile(student);
  select total_points into points
  from public.student_reward_profiles where student_id = student;
  if target_sticker is not null and not exists (
    select 1 from public.student_stickers
    where student_id = student and sticker_id = target_sticker
  ) then
    raise exception 'Nie masz tej naklejki.';
  end if;
  if target_theme is not null then
    required_points := case target_theme
      when 'sky' then 0
      when 'forest' then 100
      when 'sunset' then 300
      when 'space' then 800
      when 'aurum' then 1600
      else 999999999
    end;
    if points < required_points then
      raise exception 'Ten motyw nie jest jeszcze odblokowany.';
    end if;
  end if;
  update public.student_reward_profiles
  set featured_sticker_id = coalesce(target_sticker, featured_sticker_id),
      theme_id = coalesce(target_theme, theme_id),
      updated_at = now()
  where student_id = student;
  return jsonb_build_object(
    'ok', true, 'featuredStickerId', target_sticker, 'themeId', target_theme
  );
end;
$$;

create or replace function public.select_student_avatar_frame(target_frame text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  student uuid := auth.uid();
  points integer;
  frame_index integer;
  required_points integer;
begin
  if student is null then raise exception 'Wymagane logowanie.'; end if;
  if target_frame !~ '^frame-([0-9]|1[0-4])$' then raise exception 'Nieznana ramka.'; end if;
  frame_index := substring(target_frame from 'frame-([0-9]+)')::integer;
  required_points := (array[
    0, 20, 50, 90, 140, 200, 280, 380, 500, 650, 820, 1000, 1250, 1500, 1800
  ])[frame_index + 1];
  perform public.ensure_student_reward_profile(student);
  select total_points into points
  from public.student_reward_profiles where student_id = student;
  if points < required_points then
    raise exception 'Ta ramka nie jest jeszcze odblokowana.';
  end if;
  update public.student_reward_profiles
  set avatar_frame_id = target_frame, updated_at = now()
  where student_id = student;
  return jsonb_build_object('ok', true, 'avatarFrameId', target_frame);
end;
$$;

revoke all on function public.select_student_cosmetics(integer, text) from public, anon;
grant execute on function public.select_student_cosmetics(integer, text) to authenticated;
revoke all on function public.select_student_avatar_frame(text) from public, anon;
grant execute on function public.select_student_avatar_frame(text) to authenticated;
